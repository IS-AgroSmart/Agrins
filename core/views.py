# ViewSets define the view behavior.
import json
import os
import re
import sys

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.http import JsonResponse, HttpResponse, Http404
from django.shortcuts import get_object_or_404, render
from django.views.decorators.clickjacking import xframe_options_exempt
from django.views.decorators.csrf import csrf_exempt
from django.views.static import serve
from django.http import QueryDict
from lark.exceptions import LarkError
from rest_framework import viewsets, status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.http import JsonResponse

from core.models import *
from core.parser import FormulaParser
from core.permissions import OnlySelfUnlessAdminPermission
from core.serializers import *

import requests
from requests.auth import HTTPBasicAuth

# Reset Password
from django.core.mail import EmailMultiAlternatives
from django.dispatch import receiver
from django.template.loader import render_to_string
from django.urls import reverse

from core.notificator import send_notification_by_user
from push_notifications.models import APNSDevice, GCMDevice

from django_rest_passwordreset.signals import reset_password_token_created
from .utils.token import  TokenGenerator
from .utils.token import  account_activation_token

from .utils.legend import  *
from .utils.deep_model import  *
from django.views.decorators.clickjacking import xframe_options_exempt

import geopandas as gpd
from datetime import datetime, date, timedelta
from django.http import FileResponse
import mimetypes
import shutil


class UserViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated, OnlySelfUnlessAdminPermission,)
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            self.permission_classes = (AllowAny,)
        return super(UserViewSet, self).get_permissions()

    def get_queryset(self):
        if self.request.user.type == UserType.ADMIN.name:
            return User.objects.all()
        else:
            return User.objects.filter(pk=self.request.user.pk)

    @action(detail=True, methods=['post'])
    def set_password(self, request, pk=None):
        user = self.get_object()
        user.set_password(request.data.get("password"))
        user.save()
        return HttpResponse(status=200)

    def perform_destroy(self, instance: User):
        if self.request.user.type == UserType.ADMIN.name or instance == self.request.user:
            if instance.type == UserType.DELETED.name:
                for p in instance.user_projects.all():
                    for r in p.resources.all():
                        r.delete()
                    for l in p.layers.all():
                        for a in l.artifacts.all():
                            a.delete()
                        l.delete()
                    p.delete()
                instance.delete()
            else:
                instance.type = UserType.DELETED.name
                instance.is_active = False
                instance.save()


class ArtifactViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated,)
    serializer_class = ArtifactSerializer

    def get_queryset(self):
        return Artifact.objects.all()

    @xframe_options_exempt 
    @csrf_exempt
    @action(detail=True, methods=["delete"])
    def perform_destroy(self, instance: Artifact):        
        instance: Artifact= self.get_object()
        
        layer = instance.layer
        instance.delete()     
        if(layer.artifacts.all().count() == 0):                
            layer.delete()
        return HttpResponse(status=200)


class ContactViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated,)
    serializer_class = ContactSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(
            self.get_queryset().filter())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def get_queryset(self):
        if self.request.user.type == UserType.ADMIN.name and "HTTP_TARGETUSER" in self.request.META:
            user = User.objects.get(pk=self.request.META["HTTP_TARGETUSER"])
        else:
            user = self.request.user
        return Contact.objects.all()


@csrf_exempt
def postContact(request):
    Contact.objects.create(
        name = request.POST["name"], 
        message = request.POST["message"],
        email = request.POST["email"],  
        phone = request.POST["phone"],  
        meta = request.META  )
    return HttpResponse(status=201)


class LayerViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated,)
    serializer_class = LayerSerializer

    def get_queryset(self):
        return Layer.objects.all()
    
    def retrieve(self, request, pk=None):
        instance = self.get_object()
        return Response(self.serializer_class(instance).data,
                        status=status.HTTP_200_OK)

class ResourceViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated,)
    serializer_class = ResourceSerializer

    def get_queryset(self):
        return Resource.objects.all()
    
    def retrieve(self, request, pk=None):
        instance = self.get_object()
        return Response(self.serializer_class(instance).data,
                        status=status.HTTP_200_OK)
    
    def destroy(self, request, pk=None, *args, **kwargs):
        instance = self.get_object()
        # you custom logic #
        return super(ResourceViewSet, self).destroy(request, pk, *args, **kwargs)


@csrf_exempt
def upload_resource(request, uuid):
    from django.core.files.uploadedfile import UploadedFile
    UserProject.objects.filter(pk=uuid).update(date_update = datetime.now())
    project = UserProject.objects.get(pk=uuid)

    if project.user.used_space >= project.user.maximum_space:
        return HttpResponse(status=402)
    
    file: UploadedFile = request.FILES.get("file")  # file is called X.tiff
    file_name = file.name.split('.')[0]
    extension = file.name.split('.')[1]
    project.resources.create(
        name=file_name, description=request.POST["description"], extension = extension, title=request.POST["name"])
    # Write file to disk on project folder
    os.makedirs(project.get_disk_path() + "/Resourses", exist_ok=True)
    with open(project.get_disk_path() + "/Resourses/" + file.name, "wb") as f:
        for chunk in file.chunks():
            f.write(chunk)
    
    project.update_disk_space()
    project.user.update_disk_space()
    return HttpResponse(status=201)
    

def download_resource(request, pk):    
    permission_classes = (IsAuthenticated,)
    resource = Resource.objects.get(pk=pk)    
    filepath = os.path.abspath(resource.get_disk_path()+resource.name+'.'+resource.extension)    
    mime_type, _ = mimetypes.guess_type(filepath)    
    if os.path.exists(filepath):
        with open(filepath, 'rb') as doc:
            data = doc.read()
            response = HttpResponse(      
                data,                      
                content_type=mime_type   
            )
            response['Content-Disposition'] = 'inline; filename=' +os.path.basename(filepath)
            return response
    else:
        return HttpResponse("Failed to Download")

def download_layer(request, pk):    
    permission_classes = (IsAuthenticated,)
    resource = Artifact.objects.get(pk=pk)    
    filepath = os.path.abspath(resource.get_disk_path())
    
    mime_type, _ = mimetypes.guess_type(filepath)    
    if os.path.exists(filepath):
        with open(filepath, 'rb') as doc:
            data = doc.read()
            response = HttpResponse(      
                data,                      
                content_type=mime_type   
            )
            response['Content-Disposition'] = 'inline; filename=' +os.path.basename(filepath)
            return response
    else:
        return HttpResponse("Failed to Download")


class UserProjectViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated,)
    serializer_class = UserProjectSerializer
    
    @action(detail=False)
    def deleted(self, request):
        if self.request.user.type == UserType.ADMIN.name and "HTTP_TARGETUSER" in self.request.META:
            user = User.objects.get(pk=self.request.META["HTTP_TARGETUSER"])
        else:
            user = self.request.user
        serializer = self.get_serializer(
            UserProject.objects.filter(user=user, deleted=True), many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def make_demo(self, request, pk=None):
        if not request.user.type == UserType.ADMIN.name:
            return Response(status=status.HTTP_403_FORBIDDEN)
        project: UserProject = self.get_object()
        project.is_demo = True
        prev_user: User = project.user
        project.user = None
        for user in User.objects.all():
            user.demo_projects.add(project)
        project.save()
        prev_user.update_disk_space()
        return Response({})

    def retrieve(self, request, pk=None):
        instance = self.get_object()
        return Response(self.serializer_class(instance).data,
                        status=status.HTTP_200_OK)

    @action(detail=True, methods=["delete"])
    def delete_demo(self, request, pk=None):
        if not request.user.type == UserType.ADMIN.name:
            return Response(status=status.HTTP_403_FORBIDDEN)
        project: UserProject = self.get_object()
        project.is_demo = False
        project.user = request.user
        project.demo_users.clear()
        project.save()
        request.user.update_disk_space()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(
            self.get_queryset().filter())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def get_queryset(self):
        if self.request.user.type == UserType.ADMIN.name and "HTTP_TARGETUSER" in self.request.META:
            user = User.objects.get(pk=self.request.META["HTTP_TARGETUSER"])
        else:
            user = self.request.user
        return UserProject.objects.filter(user=user) | user.demo_projects.all()

    @staticmethod
    def _get_effective_user(request):
        if request.user.type == UserType.ADMIN.name and "HTTP_TARGETUSER" in request.META:
            return User.objects.get(pk=request.META["HTTP_TARGETUSER"])
        else:
            return request.user

    def create(self, request, *args, **kwargs):
        if request.user.type in (UserType.DEMO_USER.name, UserType.DELETED.name):
            return Response(status=403)
        user = self._get_effective_user(request)
        if user.used_space >= user.maximum_space:
            return Response(status=402)       
        return super(UserProjectViewSet, self).create(request, *args, **kwargs)

    def perform_create(self, serializer):
        target_user = self._get_effective_user(self.request)
        serializer.save(user=target_user)

    def perform_destroy(self, instance: UserProject):
        if instance.is_demo:
            # Remove demo flight ONLY FOR USER!
            self.request.user.demo_projects.remove(instance)
        elif self.request.user.type == UserType.ADMIN.name or instance.user == self.request.user:
            if instance.deleted:
                for r in instance.resources.all():
                    r.delete()
                for l in instance.layers.all():
                    for a in l.artifacts.all():
                        a.delete()
                    l.delete()
                instance.delete()
            else:
                instance.deleted = True
                instance.save()

@csrf_exempt
def dashboardUser(request):
    permission_classes = (IsAuthenticated,)
    user = Token.objects.get(key=request.headers["Authorization"][6:]).user
    projects = UserProject.objects.filter(user=user)    
    layerSize = 0
    resourceSize = 0
    deleteSize = 0
    projectSize = 0
    proyectos={'name': 'Proyectos', 'data':[]}
    capas = {'name': 'Capas', 'data':[]}
    documentos = {'name': 'Documentos', 'data':[]}
    deleted = []
    for project in projects:   
        if not project.is_demo and not project.deleted:
            projectSize += 1            
            proj = {'x':project.name, 'y':[project.date_create.timestamp() * 1000, project.date_update.timestamp() * 1000]}
            proyectos['data'].append(proj)
            layers = project.layers.all()         
            for c in layers:                        
                layerSize += len(c.artifacts.all())
                capas['data'].append({
                    'x': project.name,
                    'goals':[{
                        'name': c.title,
                        'value': c.date.timestamp() * 1000,
                        'strokeWidth': 10,
                        'strokeDashArray': 0,
                        'strokeColor': 'orange'
                    }]
                })
            docs = project.resources.all()
            for d in docs:
                resourceSize += 1
                documentos['data'].append({
                    'x': project.name,
                    'goals': [{
                        'name': d.name,
                        'value': d.date.timestamp() * 1000,
                        'strokeWidth': 10,
                        'strokeDashArray': 0,
                        'strokeColor': 'green'
                    }]
                })
        if project.deleted:
            deleteSize +=1
            deleted.append(project.uuid)
    series = [proyectos,capas,documentos]
    jsonResponse ={'project':projectSize, 'layer':layerSize, 'resource': resourceSize ,'delete': deleteSize, 'deleted':deleted, 'series':series}
    return JsonResponse(jsonResponse)

@csrf_exempt
def dashboardProject(request):
    permission_classes = (IsAuthenticated,)
    start_date = datetime(2022, 12, 1, 00,00,00)
    new_date = datetime(2022, 12, 1, 00,00,00)
    end_date = datetime.now()
    delta = timedelta(days=1)
    last_value_project = 0
    last_value_layers = 0
    last_value_resource = 0
    projects = []
    layers = []
    resources = []
    while new_date <= end_date+delta:
        value_project = UserProject.objects.filter(date_create__range=[start_date, new_date]).count()
        if value_project > last_value_project: 
            last_value_project = value_project
            projects.append([int(new_date.timestamp()) * 1000, last_value_project])
        elif value_project < last_value_project: 
            last_value_project = value_project
            projects.append([int(new_date.timestamp()) * 1000, last_value_project])
        value_layer = Layer.objects.filter(date__range=[start_date, new_date]).count()
        if value_layer > last_value_layers: 
            last_value_layers = value_layer
            layers.append([int(new_date.timestamp()) * 1000, last_value_layers])
        elif value_layer < last_value_layers: 
            last_value_layers = value_layer
            layers.append([int(new_date.timestamp()) * 1000, last_value_layers])

        value_resource = Resource.objects.filter(date__range=[start_date, new_date]).count()
        if value_resource > last_value_resource: 
            last_value_resource = value_resource
            resources.append([int(new_date.timestamp()) * 1000, last_value_resource])
        elif value_resource < last_value_resource: 
            last_value_resource = value_resource
            resources.append([int(new_date.timestamp()) * 1000, last_value_resource])
        new_date += delta
    idxModel = ['GCI','GRRI','MGRVI','NDRE','NDVI','NGRDI','ALTURA','CLOROFILA']
    result = []
    for i in idxModel:
        result.append(Artifact.objects.filter(title__endswith='-'+i).count())
    jsonResponse ={'index':{'data': result}, 'data':[{'name':'Proyectos', 'data':projects},{'name':'Capas principales', 'data':layers},{'name':'Documentos', 'data':resources}]}
    return JsonResponse(jsonResponse)

@xframe_options_exempt 
@csrf_exempt
def upload_vectorfile(request, uuid):
    from django.core.files.uploadedfile import UploadedFile
    datatype = request.POST.get("datatype", "shp")
    UserProject.objects.filter(pk=uuid).update(date_update = datetime.now())
    project = UserProject.objects.get(pk=uuid)
        
    if project.user.used_space >= project.user.maximum_space:
        return HttpResponse(status=402)
    # shapefile is an array with files [X.shp, X.shx, X.dbf], in some order
    if datatype == "shp":
        file: UploadedFile = request.FILES.getlist(
            "file")[0]  # gets name X.Y (cannot guarantee Y)
    elif datatype == "kml":
        file: UploadedFile = request.FILES["file"]
    # remove extension to get only X
    file_name = ".".join(file.name.split(".")[:-1]).replace(" ", "")
    file_name += datetime.now().strftime('-%Y-%m-%d-%H-%M-%S')

    layer = project.layers.create(
        name=file_name, title=request.POST["title"], type=LayerType.VECTOR.name)

    if datatype == "shp":
        source = "/geoserver/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&maxFeatures=50&outputFormat=application/json&srsname=EPSG:3857&typeName="
        layer.artifacts.create(
        name=file_name, type=ArtifactType.SHAPEFILE.name,source= source, style='shapefile', legend='',  title=request.POST["title"], camera=Camera.NONE.name)
        
    elif datatype == "kml":
        source = "/geoserver/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&maxFeatures=50&outputFormat=application/json&typeName=" 
        layer.artifacts.create(
        name=file_name, type=ArtifactType.KML.name,source= source, style='kml', legend='', title=request.POST["title"], camera=Camera.NONE.name)   


    # Write file(s) to disk on project folder
    os.makedirs(project.get_disk_path() + "/" + file_name, exist_ok=True)
    for file in request.FILES.getlist("file") if datatype == "shp" else [request.FILES["file"]]:
        extension = file.name.split(".")[-1]
        with open(project.get_disk_path() + "/" + file_name + "/" + file_name + "." + extension, "wb") as f:
            for chunk in file.chunks():
                f.write(chunk)

    if datatype == "kml":
        with cd(project.get_disk_path() + "/" + file_name):
            os.system('ogr2ogr -f "ESRI Shapefile" "{0}.shp" "{0}.kml"'.format(file_name))

    GEOSERVER_BASE_URL = "http://container-geoserver:8080/geoserver/rest/workspaces/"

    requests.put(
        GEOSERVER_BASE_URL + project._get_geoserver_ws_name() + "/datastores/" +
        file_name + "/"
                    "external.shp",
        headers={"Content-Type": "text/plain"},
        data="file:///media/USB/" +
             str(project.uuid) + "/" + file_name + "/" + file_name + ".shp",
        auth=HTTPBasicAuth(settings.GEOSERVER_USER , settings.GEOSERVER_PASSWORD))

    requests.put(    
        GEOSERVER_BASE_URL + project._get_geoserver_ws_name() + "/datastores/" +
        file_name + "/featuretypes/" + file_name + ".json",
        headers={"Content-Type": "application/json"},        
        data='{"featureType": {"enabled": true, "srs":"4326"}}',
        auth=HTTPBasicAuth(settings.GEOSERVER_USER , settings.GEOSERVER_PASSWORD))
    project.update_disk_space()
    project.user.update_disk_space()
    return JsonResponse({'success':True, "msg":"Archivo cargado"})


@xframe_options_exempt 
@csrf_exempt
def upload_measure(request, uuid):
    UserProject.objects.filter(pk=uuid).update(date_update = datetime.now())
    project = UserProject.objects.get(pk=uuid)
    file_name = request.POST["name"]
    file_name += datetime.now().strftime('-%Y-%m-%d-%H-%M-%S')
    if project.user.used_space >= project.user.maximum_space:
        return HttpResponse(status=402)
    geojs=request.POST["json"]
    json.dumps(geojs)
    os.makedirs(project.get_disk_path() + "/" + file_name, exist_ok=True)

    with open(project.get_disk_path() + "/" + file_name + "/" + file_name + ".json", "w") as f:
        f.write(geojs)

    with cd(project.get_disk_path() + "/" + file_name):
        os.system('ogr2ogr -f "ESRI Shapefile" "{0}.shp" "{0}.json"'.format(file_name))
    
    layer = project.layers.create(
        name=file_name, title=request.POST["name"], type=LayerType.VECTOR.name)
    source = "/geoserver/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&maxFeatures=50&outputFormat=application/json&srsname=EPSG:3857&typeName="
    layer.artifacts.create(
        name=file_name, type=ArtifactType.SHAPEFILE.name,source= source, style='shapefile', legend='',  title=request.POST["name"], camera=Camera.NONE.name)
        
    GEOSERVER_BASE_URL = "http://container-geoserver:8080/geoserver/rest/workspaces/"

    requests.put(
        GEOSERVER_BASE_URL + project._get_geoserver_ws_name() + "/datastores/" +
        file_name + "/"
                    "external.shp",
        headers={"Content-Type": "text/plain"},
        data="file:///media/USB/" +
             str(project.uuid) + "/" + file_name + "/" + file_name + ".shp",
        auth=HTTPBasicAuth(settings.GEOSERVER_USER , settings.GEOSERVER_PASSWORD))

    requests.put(    
        GEOSERVER_BASE_URL + project._get_geoserver_ws_name() + "/datastores/" +
        file_name + "/featuretypes/" + file_name + ".json",
        headers={"Content-Type": "application/json"},        
        data='{"featureType": {"enabled": true, "srs":"4326"}}',
        auth=HTTPBasicAuth(settings.GEOSERVER_USER , settings.GEOSERVER_PASSWORD))
    project.update_disk_space()
    project.user.update_disk_space()
    return JsonResponse({'success':True, "msg":"Archivo cargado"})

@xframe_options_exempt 
@csrf_exempt
def upload_geotiff(request, uuid):
    from django.core.files.uploadedfile import UploadedFile
    UserProject.objects.filter(pk=uuid).update(date_update = datetime.now())
    project = UserProject.objects.get(pk=uuid)
    if project.user.used_space >= project.user.maximum_space:
        return HttpResponse(status=402)
    
    file: UploadedFile = request.FILES.get("geotiff")  # file is called X.tiff
    geotiff_name = ".".join(file.name.split(
        ".")[:-1])  # Remove extension, get X
    geotiff_name += datetime.now().strftime('-%Y-%m-%d-%H-%M-%S')
    source = "/geoserver/geoserver/ows?version=1.3.0"

    layer = project.layers.create(
        name=geotiff_name, title=request.POST["title"], type= LayerType.IMAGE.name)

    layer.artifacts.create(
        name=geotiff_name, type=ArtifactType(request.POST["type"]).name,source= source, style='raster', legend='',title=request.POST["title"], camera=Camera(request.POST["camera"]).name
    )

    # Write file to disk on project folder
    os.makedirs(project.get_disk_path() + "/" + geotiff_name, exist_ok=True)
    with open(project.get_disk_path() + "/" + geotiff_name + "/" + geotiff_name + ".tiff", "wb") as f:
        for chunk in file.chunks():
            f.write(chunk)

    GEOSERVER_BASE_URL = "http://container-geoserver:8080/geoserver/rest/workspaces/"

    requests.put(
         GEOSERVER_BASE_URL + project._get_geoserver_ws_name() + "/coveragestores/" +
        geotiff_name + "/"
                       "external.geotiff",
        headers={"Content-Type": "text/plain"},
        data="file:///media/USB/" +
             str(project.uuid) + "/" + geotiff_name + "/" + geotiff_name + ".tiff",
        auth=HTTPBasicAuth(settings.GEOSERVER_USER , settings.GEOSERVER_PASSWORD))

    requests.put(
        GEOSERVER_BASE_URL + project._get_geoserver_ws_name() + "/coveragestores/" +
        geotiff_name + "/coverages/" + geotiff_name + ".json",
        headers={"Content-Type": "application/json"},
        data='{"coverage": { "enabled": true, "metadata": { "entry": [ { "@key": "time", ' +
                '"dimensionInfo": { "enabled": true, "presentation": "LIST", "units": "ISO8601", ' +
                '"defaultValue": "" }} ] }, "parameters": { "entry": [ { "string": [ ' +
                '"OutputTransparentColor", "#000000" ] } ] } }} ',        
        auth=HTTPBasicAuth(settings.GEOSERVER_USER , settings.GEOSERVER_PASSWORD))
    project.update_disk_space()
    project.user.update_disk_space()

    return JsonResponse({'success':True, "msg":"Archivo cargado"})

@csrf_exempt
def check_formula(request):
    return HttpResponse(status=200 if FormulaParser().is_valid(request.POST["formula"]) else 400)


BANDS_CAMERA = {
    'REDEDGE':{'R':3,'G':2,'B':1,'NIR':4,'RDG':5},    
    'PARROT':{'R':2,'G':1,'B':None,'NIR':4,'RDG':3},
    'RGB':{'R':1,'G':2,'B':3,'NIR':None,'RDG':None},
}


@csrf_exempt
def create_raster_index(request, uuid):
    UserProject.objects.filter(pk=uuid).update(date_update = datetime.now())
    project = UserProject.objects.get(uuid=uuid)
    if project.user.used_space >= project.user.maximum_space:
        return JsonResponse({'success':False, "msg":"Espacio de almacenamiento agotado, Consulte al administrador"})
    bands = BANDS_CAMERA.get(request.POST["camera"])
    source = "/geoserver/geoserver/ows?version=1.3.0"
    path = project.get_disk_path()+'/'+request.POST["layer"]+'/'
    file_title = request.POST["title"]+'-'+request.POST["index"]
    file_name = request.POST["layer"]+'-'+request.POST["index"]
    
    COMMANDS = {
        'NDVI': 'gdal_calc.py -A '+request.POST["layer"]+'.tiff --A_band='+str(bands['NIR'])+' -B '+request.POST["layer"]+'.tiff --B_band='+str(bands['R'])+' --calc="((asarray(A,dtype=float32)-asarray(B, dtype=float32))/(asarray(A, dtype=float32)+asarray(B, dtype=float32)) + 1.) * 127." --outfile='+file_name+'.tiff --type=Byte --co="TILED=YES" --overwrite --NoDataValue=-999',
        'GCI':  'gdal_calc.py -A '+request.POST["layer"]+'.tiff --A_band='+str(bands['NIR'])+' -B '+request.POST["layer"]+'.tiff --B_band='+str(bands['G'])+' --calc="((((asarray(A, dtype=float32))/(asarray(B, dtype=float32))) - 1) +1.) * 127." --outfile='+file_name+'.tiff --type=Byte --co="TILED=YES" --overwrite --NoDataValue=-999',
        'GRRI': 'gdal_calc.py -A '+request.POST["layer"]+'.tiff --A_band='+str(bands['G'])+' -B '+request.POST["layer"]+'.tiff --B_band='+str(bands['R'])+' --calc="((asarray(A, dtype=float32))/(asarray(B, dtype=float32)) +1.) * 127." --outfile='+file_name+'.tiff --type=Byte --co="TILED=YES" --overwrite --NoDataValue=-999',
        'MGRVI':'gdal_calc.py -A '+request.POST["layer"]+'.tiff --A_band='+str(bands['G'])+' -B '+request.POST["layer"]+'.tiff --B_band='+str(bands['R'])+' --calc="(((power(asarray(A,dtype=float32),2)-power(asarray(B, dtype=float32),2))/(power(asarray(A, dtype=float32),2)+power(asarray(B, dtype=float32),2)))+1.)*127." --outfile='+file_name+'.tiff --type=Byte --co="TILED=YES" --overwrite --NoDataValue=-999',
        'NDRE': 'gdal_calc.py -A '+request.POST["layer"]+'.tiff --A_band='+str(bands['NIR'])+' -B '+request.POST["layer"]+'.tiff --B_band='+str(bands['RDG'])+' --calc="((asarray(A,dtype=float32)-asarray(B, dtype=float32))/(asarray(A, dtype=float32)+asarray(B, dtype=float32)) + 1.) * 127." --outfile='+file_name+'.tiff --type=Byte --co="TILED=YES" --overwrite --NoDataValue=-999',
        'NGRDI':'gdal_calc.py -A '+request.POST["layer"]+'.tiff --A_band='+str(bands['G'])+' -B '+request.POST["layer"]+'.tiff --B_band='+str(bands['R'])+' --calc="((asarray(A,dtype=float32)-asarray(B, dtype=float32))/(asarray(A, dtype=float32)+asarray(B, dtype=float32)) + 1.) * 127." --outfile='+file_name+'.tiff --type=Byte --co="TILED=YES" --overwrite --NoDataValue=-999',
    }
    
    with cd(path):    
        command = COMMANDS.get(request.POST["index"])
        os.system(command)  

    legend_path = create_legend_image(path, file_name, request.POST["index"])    
    project._create_index_datastore(request.POST["layer"],file_name)
    project.update_disk_space()
    project.user.update_disk_space()
    layer = Layer.objects.get(name=request.POST["layer"])      
    layer.artifacts.create(
        name=file_name, type=ArtifactType.INDEX.name,source= source, style=request.POST["index"], legend=legend_path, title=file_title, camera=Camera.NONE.name
    )
    return JsonResponse({'success':True, "msg":"Archivo cargado"})

@csrf_exempt
def create_raster_model(request, uuid):
    UserProject.objects.filter(pk=uuid).update(date_update = datetime.now())
    project = UserProject.objects.get(uuid=uuid)    
    if project.user.used_space >= project.user.maximum_space:
        return JsonResponse({'success':False, "msg":"Espacio de almacenamiento agotado, Consulte al administrador"})
    
    bands = BANDS_CAMERA.get(request.POST["camera"])
    inputpath = project.get_disk_path()+'/'+request.POST["layer"]+'/'
    layerfile= request.POST["layer"]
    outpath = project.get_disk_path()+'/'+request.POST["layer"]+'/'+request.POST["layer"]+'-'+request.POST["model"]+'.tiff '
    file_title = request.POST["title"]+'-'+request.POST["model"]
    file_name = request.POST["layer"]+'-'+request.POST["model"]    
 
    if(generateModel(inputpath,layerfile,file_name,request.POST["model"],bands)):            
        project._create_index_datastore(request.POST["layer"],file_name)
        project.update_disk_space()
        project.user.update_disk_space()
        source = "/geoserver/geoserver/ows?version=1.3.0"
        layer = Layer.objects.get(title=request.POST["title"])      
        layer.artifacts.create(
            name=file_name, type=ArtifactType.MODEL.name,source= source, style=request.POST["model"], legend='', title=file_title, camera=Camera.NONE.name
        )
        return JsonResponse({'success':True, "msg":"Archivo cargado"})
    else:
        return JsonResponse({'success':False, "msg":"Error"})

@csrf_exempt
def create_wallpaper(request, uuid):
    data = json.loads(request.body.decode('utf-8'))
    url = data.get("url")
    UserProject.objects.filter(uuid=uuid).update(wallpaper=url)
    return HttpResponse(status=200)



@xframe_options_exempt
def mapper(request, uuid):
    project = UserProject.objects.get(uuid=uuid)
    return render(request, "geoext/examples/tree/panel.html",
                  {"project_name": project.name,
                   "project_notes": project.description,
                   "project_geoserver_path": project._get_geoserver_ws_name(),
                   "upload_shapefiles_path": "/#/projects/" + str(project.uuid) + "/upload/shapefile",
                   "upload_geotiff_path": "/#/projects/" + str(project.uuid) + "/upload/geotiff",
                   "upload_new_index_path": "/#/projects/" + str(project.uuid) + "/upload/index",
                   "is_multispectral":  True,
                   "is_demo": project.is_demo,
                   "uuid": project.uuid,     
                   "wallpaper": project.wallpaper              
                   })


def mapper_bbox(request, uuid, pk):    
    project = UserProject.objects.get(uuid=uuid)    
    art = Artifact.objects.get(pk = pk)    
    if (art.layer.type == 'IMAGE'):
        ans = requests.get(            
            "http://container-geoserver:8080/geoserver/rest/workspaces/" + project._get_geoserver_ws_name() +
            "/coveragestores/"+art.layer.name+"/coverages/"+art.layer.name+".json",
            auth=HTTPBasicAuth(settings.GEOSERVER_USER, settings.GEOSERVER_PASSWORD)).json()  
        return JsonResponse({"bbox": ans["coverage"]["nativeBoundingBox"], "srs": ans["coverage"]["srs"], "size":ans["coverage"]["grid"]["range"]["high"]})
    elif (art.layer.type == 'VECTOR'):
        ans = requests.get(
            "http://container-geoserver:8080/geoserver/rest/workspaces/" + project._get_geoserver_ws_name() +
            "/datastores/"+art.layer.name+"/featuretypes/"+art.layer.name+".json",
            auth=HTTPBasicAuth(settings.GEOSERVER_USER, settings.GEOSERVER_PASSWORD)).json()
        return JsonResponse({"bbox": ans["featureType"]["nativeBoundingBox"], "srs": ans["featureType"]["srs"]})
    return JsonResponse({"data":"not found"})

def mapper_artifacts(request,index):
    layer = Layer.objects.get(pk=index)
    return JsonResponse({"artifacts": [
        {"title": art.title,
         "pk": art.pk,
         "name" : art.name,
         "layer": layer.project._get_geoserver_ws_name() + ":" + art.name,         
         "source": art.source,
         "camera": art.camera,
         "type": art.type,
         "style": art.style,
         "legend": art.legend,

         }
        for art in layer.artifacts.all()
    ]})

def mapper_layers(request, uuid):
    project = UserProject.objects.get(uuid=uuid)
    return JsonResponse({"layers": [
        {
         "pk": lyr.pk,
         "name" : lyr.name,
         "title" : lyr.title,
         "date": lyr.date,
         "type": lyr.type
        }
        for lyr in project.layers.all().order_by("date")
    ]})


def mapper_indices(request, uuid):
    project = UserProject.objects.get(uuid=uuid)
    return JsonResponse({"indices": [
        {"name": art.name, "title": art.title,
         "layer": project._get_geoserver_ws_name() + ":" + art.name}
        for art in project.artifacts.all()
        if art.type == ArtifactType.INDEX.name
    ]})


def mapper_paneljs(request):
    filepath = "./templates/geoext/examples/tree/panel.js"
    return serve(request, os.path.basename(filepath), os.path.dirname(filepath))

def mapper_ticks(request, num_ticks):
    filepath = "./templates/geoext/examples/tree/" + str(num_ticks) + "ticks.png"
    return serve(request, os.path.basename(filepath), os.path.dirname(filepath))

def mapper_ol(request, path):
    filepath = "./templates/geoext/examples/lib/ol/" + path
    return serve(request, os.path.basename(filepath), os.path.dirname(filepath))

def mapper_src(request, path):
    filepath = "./templates/geoext/src/" + path
    return serve(request, os.path.basename(filepath), os.path.dirname(filepath))

def mapper_agrins(request, path):
    filepath = "./templates/geoext/examples/tree/agrins/" + path
    return serve(request, os.path.basename(filepath), os.path.dirname(filepath))


@receiver(reset_password_token_created)
def password_reset_token_created(sender, instance, reset_password_token, *args, **kwargs):
    # send an e-mail to the user
    context = {
        'current_user': reset_password_token.user,
        'username': reset_password_token.user.username,
        'email': reset_password_token.user.email,        
        'reset_password_url': settings.DOMAIN_SITE+"/#/restorePassword/reset?token={}".format(reset_password_token.key)
    }
    # render email text
    email_html_message = render_to_string('email/user_reset_password.html', context)
    email_plaintext_message = render_to_string( 'email/user_reset_password.txt', context)
    msg = EmailMultiAlternatives(
        "Agrins - Recuperación de contraseña",
        email_plaintext_message,
        settings.EMAIL_HOST_USER,
        [reset_password_token.user.email]
    )
    msg.attach_alternative(email_html_message, "text/html")
    msg.send()

@csrf_exempt
def activate(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except(TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user is not None and account_activation_token.check_token(user, token):
        user.is_active = True
        user.save()
        return JsonResponse({'state':True, 'msg':'Su cuenta ha sido activada correctamente'})
    else:        
        return JsonResponse({'state':False, 'msg':'El link ya no es válido.'})
    
    

@csrf_exempt
def save_push_device(request, device):
    user_name = request.POST["username"]

    try:
        the_user = User.objects.get(username__iexact=user_name)
    except User.DoesNotExist:
        the_user = None

    if not the_user:
        return HttpResponse(status=400)
    token = request.POST['token']

    try:
        gcm_user = GCMDevice.objects.get(user__id__icontains=the_user.id)
    except GCMDevice.DoesNotExist:
        gcm_user = None

    if gcm_user:
        return HttpResponse(status=200)

    if device == "ios":
        apns_device = APNSDevice.objects.create(
            registration_id=token, user=the_user)
    if device == "android":
        fcm_device = GCMDevice.objects.create(
            registration_id=token, cloud_message_type="FCM", user=the_user)
    return HttpResponse(status=200)


class BlockCriteriaViewSet(viewsets.ModelViewSet):
    # permission_classes = (IsAuthenticated,)
    serializer_class = BlockCriteriaSerializer

    def get_queryset(self):
        return BlockCriteria.objects.all()
