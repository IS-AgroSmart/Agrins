import json
import os
import re
import shutil
import subprocess
from typing import Union
from zipfile import ZipFile

import matplotlib.pyplot as plt
import numpy

import pyproj
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.template.loader import render_to_string
from enum import Enum
import uuid as u

from django.db.models.signals import post_save, post_delete

import requests
from requests.auth import HTTPBasicAuth
from PIL import Image, ImageOps
from weasyprint import HTML
from datetime import date

from django.conf import settings
from core.parser import FormulaParser
from core.utils.disk_space_tracking import DiskSpaceTrackerMixin, DiskRelationTrackerMixin
from core.utils.working_dir import cd


class UserType(Enum):
    DEMO_USER = "DemoUser"
    ACTIVE = "Active"
    ADVANCED = "Advanced"
    DELETED = "Deleted"
    ADMIN = "Admin"


class User(DiskRelationTrackerMixin, AbstractUser):
    organization = models.CharField(max_length=20, blank=True)
    phone = models.CharField(max_length=15, blank=True)
    profession = models.CharField(max_length=20, blank=True)
    city = models.CharField(max_length=50, blank=True)
    type = models.CharField(max_length=20,choices=[(tag.name, tag.value) for tag in UserType],default=UserType.ACTIVE.name)
    demo_projects = models.ManyToManyField('UserProject', related_name='demo_users')    
    used_space = models.PositiveIntegerField(default=0)
    maximum_space = models.PositiveIntegerField(default=10 * 1024 * 1024)
    remaining_images = models.PositiveIntegerField(default=0)
    image_month_quota = models.PositiveIntegerField(default=3000)

    def get_disk_related_models(self):
        return list(self.user_projects.filter(is_demo=False))


class BaseProject(models.Model):
    uuid = models.UUIDField(primary_key=True, default=u.uuid4, editable=False)
    name = models.CharField(max_length=50)
    date_create = models.DateTimeField(auto_now_add=True)
    date_update = models.DateTimeField(auto_now_add=True)
    description = models.TextField()
    wallpaper = models.CharField(max_length=300, default="agrins/card_proj.png")
    deleted = models.BooleanField(default=True)

    class Meta:
        abstract = True


class UserProject(DiskSpaceTrackerMixin, BaseProject):
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.CASCADE, related_name="user_projects")
    must_create_workspace = models.BooleanField(default=True)
    is_demo = models.BooleanField(default=False)

    used_space = models.PositiveIntegerField(default=0)

    def _get_geoserver_ws_name(self):
        return "project_" + str(self.uuid)

    def get_disk_path(self):
        return "/projects/" + str(self.uuid)

    def _create_geoserver_proj_workspace(self):
        requests.post("http://container-geoserver:8080/geoserver/rest/workspaces",
                      headers={"Content-Type": "application/json"},
                      data='{"workspace": {"name": "' + self._get_geoserver_ws_name() + '"}}',
                      auth=HTTPBasicAuth(settings.GEOSERVER_USER , settings.GEOSERVER_PASSWORD))
        os.makedirs(self.get_disk_path())

    def _create_mainortho_datastore(self):
        os.makedirs(self.get_disk_path() + "/mainortho")
        with open(self.get_disk_path() + "/mainortho/indexer.properties", "w") as f:
            f.write("""TimeAttribute=ingestion
Schema=*the_geom:Polygon,location:String,ingestion:java.util.Date
PropertyCollectors=TimestampFileNameExtractorSPI[timeregex](ingestion)""")
        with open(self.get_disk_path() + "/mainortho/timeregex.properties", "w") as f:
            f.write("regex=[0-9]{8},format=yyyyMMdd")
        # For multispectral: slice multispectral bands, save on /projects/uuid/nir and /projects/uuid/rededge
        # Create datastore and ImageMosaic
        GEOSERVER_BASE_URL = "http://container-geoserver:8080/geoserver/rest/workspaces/"
        requests.put(
            GEOSERVER_BASE_URL + self._get_geoserver_ws_name() + "/coveragestores/mainortho/external.geotiff",
            headers={"Content-Type": "text/plain"},
            data="file:///media/USB/" + str(self.uuid) + "/mainortho/",
            auth=HTTPBasicAuth(settings.GEOSERVER_USER, settings.GEOSERVER_PASSWORD))
        # Enable time dimension
        requests.put(
            GEOSERVER_BASE_URL + self._get_geoserver_ws_name() + "/coveragestores/mainortho/coverages/mainortho.json",
            headers={"Content-Type": "application/json"},
            data='{"coverage": { "enabled": true, "metadata": { "entry": [ { "@key": "time", ' +
                 '"dimensionInfo": { "enabled": true, "presentation": "LIST", "units": "ISO8601", ' +
                 '"defaultValue": "" }} ] }, "parameters": { "entry": [ { "string": [ ' +
                 '"OutputTransparentColor", "#000000" ] } ] } }} ',
            auth=HTTPBasicAuth(settings.GEOSERVER_USER, settings.GEOSERVER_PASSWORD))

    def _create_index_datastore(self, indexpath, index):
        index_folder = self.get_disk_path() + "/" + indexpath
        #os.makedirs(index_folder)
       
        with open(index_folder + "/indexer.properties", "w") as f:
            f.write("""TimeAttribute=ingestion
        Schema=*the_geom:Polygon,location:String,ingestion:java.util.Date
        PropertyCollectors=TimestampFileNameExtractorSPI[timeregex](ingestion)""")
        with open(index_folder + "/timeregex.properties", "w") as f:
            f.write("regex=[0-9]{8},format=yyyyMMdd")           

        GEOSERVER_API_ENTRYPOINT = "http://container-geoserver:8080/geoserver/rest/"
        GEOSERVER_BASE_URL = GEOSERVER_API_ENTRYPOINT + "workspaces/"
        requests.put(
            GEOSERVER_BASE_URL + self._get_geoserver_ws_name() + "/coveragestores/" + index + "/external.geotiff",
            headers={"Content-Type": "text/plain"},
            data="file:///media/USB/" + str(self.uuid) + "/" + indexpath + "/"+ index + ".tiff",
            auth=HTTPBasicAuth(settings.GEOSERVER_USER, settings.GEOSERVER_PASSWORD))
        # Enable time dimension
        requests.put(
            GEOSERVER_BASE_URL + self._get_geoserver_ws_name() + "/coveragestores/" + index + "/coverages/" + index + ".json",
            headers={"Content-Type": "application/json"},
            data='{"coverage": { "enabled": true, "metadata": { "entry": [ { "@key": "time", ' +
                '"dimensionInfo": { "enabled": true, "presentation": "LIST", "units": "ISO8601", ' +
                '"defaultValue": "" }} ] }, "parameters": { "entry": [ { "string": [ ' +
                '"InputTransparentColor", "#000000" ]  }  ] } }} ', 
            auth=HTTPBasicAuth(settings.GEOSERVER_USER, settings.GEOSERVER_PASSWORD))
        # Enable gradient (is on a different URL because... reasons???)
        requests.put(
            GEOSERVER_API_ENTRYPOINT + "layers/" + self._get_geoserver_ws_name() + ":" + index ,
            headers={"Content-Type": "application/json"},
            data='{"layer": {"defaultStyle": {"name": "gradient"}}}',
            auth=HTTPBasicAuth(settings.GEOSERVER_USER, settings.GEOSERVER_PASSWORD))

def delete_geoserver_workspace(sender, instance: UserProject, **kwargs):
    querystring = {"recurse": "true"}
    requests.delete("http://container-geoserver:8080/geoserver/rest/workspaces/" + instance._get_geoserver_ws_name(),
                    params=querystring,
                    auth=HTTPBasicAuth(settings.GEOSERVER_USER, settings.GEOSERVER_PASSWORD))


def delete_on_disk(sender, instance: UserProject, **kwargs):
    try:
        shutil.rmtree(instance.get_disk_path())
    except FileNotFoundError:
        pass  # no need to do anything, carry on
    instance.user.update_disk_space()

post_delete.connect(delete_geoserver_workspace, sender=UserProject)
post_delete.connect(delete_on_disk, sender=UserProject)

class Resource(models.Model):
    name = models.CharField(max_length=256)
    description = models.TextField()
    title = models.CharField(max_length=256)    
    extension = models.CharField(max_length=10) 
    date = models.DateTimeField(auto_now_add=True)       
    project = models.ForeignKey(UserProject, on_delete=models.CASCADE, related_name="resources", null=True)

    def get_disk_path(self):
        return self.project.get_disk_path() + "/Resourses/"

class Contact(models.Model):
    name = models.CharField(max_length=256)
    message = models.TextField()
    email = models.CharField(max_length=256)    
    phone = models.CharField(max_length=15, blank=True)
    view = models.BooleanField(default=False)
    date = models.DateTimeField(auto_now_add=True) 
    meta = models.TextField()


class ArtifactType(Enum):
    MULTIESPECTRAL = "Multiespectral"
    SHAPEFILE = "Shapefile"
    INDEX = "Index"
    MODEL = "Model"
    RGB = "RGB"
    KML = "Kml"    

    @classmethod
    def filename(cls, art):
        if art.type == ArtifactType.SHAPEFILE.name:
            return "poly.shp"
        elif art.type == ArtifactType.INDEX.name:
            return art.name + ".tif"
        elif art.type == ArtifactType.RGB.name:
            return art.name + ".tif"

class Camera(Enum):
    REDEDGE = "Micasense RedEdge-M"
    PARROT = "Parrot Sequoia"
    VECTOR = 'Vector'
    RGB = 'RGB'
    NONE ='none'

class LayerType(Enum):
    IMAGE = "IMAGE"
    VECTOR= "VECTOR"
    
class Layer(models.Model):
    name = models.CharField(max_length=256)
    title = models.CharField(max_length=256)
    type = models.CharField(max_length=20, choices=[(tag.name, tag.value) for tag in LayerType])
    date = models.DateTimeField(auto_now_add=True)
    project = models.ForeignKey(UserProject, on_delete=models.CASCADE, related_name="layers", null=True)

    def get_disk_path(self):
        return self.project.get_disk_path() + "/" + self.name

class Artifact(models.Model):
    type = models.CharField(max_length=20, choices=[(tag.name, tag.value) for tag in ArtifactType])
    camera = models.CharField(max_length=20, choices=[(tag.name, tag.value) for tag in Camera] )    
    name = models.CharField(max_length=256)
    title = models.CharField(max_length=256)
    source = models.CharField(max_length=500)
    legend = models.CharField(max_length=500)
    style = models.CharField(max_length=256)
    layer = models.ForeignKey(Layer, on_delete=models.CASCADE, related_name="artifacts", null=True)
    
    def get_disk_path(self): 
        if (self.type == "MULTIESPECTRAL" or self.type == "INDEX" or self.type == "MODEL" or self.type == "RGB" ):
            return self.layer.get_disk_path() +'/'+ self.name+'.tiff'
        if (self.type == "SHAPEFILE"):
            return self.layer.get_disk_path() +'/'+self.name+'.shp'
        if (self.type == "KML"):
            return self.layer.get_disk_path() +'/'+self.name+'.kml'

def delete_geoserver_datastore(sender, instance: Artifact, **kwargs):
    datast = ''
    if(instance.layer.type == "VECTOR"):
        datast = '/datastores/'
    else:
        datast = '/coveragestores/'

    querystring = {"recurse": "true"}
    requests.delete('http://container-geoserver:8080/geoserver/rest/workspaces/' + instance.layer.project._get_geoserver_ws_name() + datast + instance.name,
                    params=querystring,
                    auth=HTTPBasicAuth(settings.GEOSERVER_USER, settings.GEOSERVER_PASSWORD))

def delete_on_disk_artifact(sender, instance: Artifact, **kwargs):
    try:
        os.remove(instance.get_disk_path())
        if (instance.legend != ''):
            os.remove('staticfiles/'+instance.legend)
        #shutil.rmtree(instance.get_disk_path())
    except FileNotFoundError:
        pass  # no need to do anything, carry on
    instance.layer.project.user.update_disk_space()

def delete_on_disk_layer(sender, instance: Layer, **kwargs):
    try:
        shutil.rmtree(instance.get_disk_path())
    except FileNotFoundError:
        pass  # no need to do anything, carry on
    instance.project.user.update_disk_space()

def delete_on_disk_resource(sender, instance: Resource, **kwargs):
    try:
        #shutil.rmtree(instance.get_disk_path())
        os.remove(instance.get_disk_path()+instance.name+'.'+instance.extension)
    except FileNotFoundError:
        pass  # no need to do anything, carry on
    instance.project.user.update_disk_space()

post_delete.connect(delete_on_disk_resource, sender=Resource)
post_delete.connect(delete_geoserver_datastore, sender=Artifact)
post_delete.connect(delete_on_disk_artifact, sender=Artifact)
post_delete.connect(delete_on_disk_layer, sender=Layer)

class BlockType(Enum):
    USER_NAME = "UserName"
    IP = "Ip"
    EMAIL = "Email"
    DOMAIN = "Domain"

class BlockCriteria(models.Model):
    type = models.CharField(max_length=20, choices=[(tag.name, tag.value) for tag in BlockType])
    ip = models.GenericIPAddressField(max_length=256, null=True)
    value = models.CharField(max_length=80, null=True)
