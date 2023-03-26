"""IngSoft1 URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls import url
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from rest_framework.authtoken.views import obtain_auth_token
from django.conf.urls import url, include

from core.views import *
router = routers.DefaultRouter()
router.register(r'users', UserViewSet, basename="users")
#router.register(r'flights', FlightViewSet, basename="flights")
router.register(r'projects', UserProjectViewSet, basename="projects")
router.register(r'layers', LayerViewSet, basename="layers")
router.register(r'resources', ResourceViewSet, basename="resources")
router.register(r'artifacts', ArtifactViewSet, basename="artifacts")
router.register(r'block_criteria', BlockCriteriaViewSet, basename="block_criteria")

urlpatterns = [   
    path('admin/', admin.site.urls),
    url(r'api/', include(router.urls)),
    path(r'nodeodm/', include("nodeodm_proxy.urls")),
    path(r'metrics/', include("prometheus_metrics.urls")),
    path('api/api-auth', obtain_auth_token, name='api_auth'),
    path('api/upload-files/<uuid:uuid>', upload_images, name='upload_files'),
    path('api/delete_artifact/<int:pk>', delete_artifact, name="delete_artifacts"),
    #path('api/delete_layer/<int:pk>', delete_layer, name="delete_layer"),
#    path('api/webhook-processing-complete', webhook_processing_complete, name='webhook'),
#    path('api/downloads/<uuid:uuid>/<artifact>', download_artifact, name="download_artifact"),
#    path('api/downloads/<uuid:uuid>/<options>/<artifact>', download_artifact_movil, name="download_artifact"),
    path('api/uploads/<uuid:uuid>/vectorfile', upload_vectorfile, name="upload_vector"),
    path('api/uploads/<uuid:uuid>/measure', upload_measure, name="upload_vector"),
    path('api/uploads/<uuid:uuid>/geotiff', upload_geotiff, name="upload_geotiff"),
    path('api/uploads/<uuid:uuid>/resource', upload_resource, name="upload_resource"),
    path('api/download/<int:pk>/resource', download_resource, name="download_resource"),
    path('api/download/<int:pk>/layer', download_layer, name="download_layer"),
#    path('api/preview/<uuid:uuid>', preview_flight_url, name="preview_flight_url"),
    path('api/rastercalcs/check', check_formula, name="check_formula"),
    path('api/rastercalcs/<uuid:uuid>', create_raster_index, name="create_raster_index"),
    path('api/rastermodel/<uuid:uuid>', create_raster_model, name="create_raster_model"),
    path('mapper/<uuid:uuid>', mapper, name="mapper"),
    path('mapper/<uuid:uuid>/<int:pk>/bbox', mapper_bbox, name="mapper_bbox"),
    path('api/wallpaper/<uuid:uuid>', create_wallpaper, name="create_wallpaper"),
    # path('mapper/<uuid:uuid>/shapefiles', mapper_shapefiles),
    path('mapper/<uuid:uuid>/indices', mapper_indices, name="mapper_indices"),
    path('mapper/<int:index>/artifacts', mapper_artifacts, name="mapper_artifacts"),
    path('mapper/<uuid:uuid>/layers', mapper_layers, name="mapper_layers"),
    path('mapper/panel.js', mapper_paneljs),
    path('mapper/ticks/<int:num_ticks>', mapper_ticks),
    path('mapper/ol/<path:path>', mapper_ol),
    path('mapper/geoext/src/<path:path>', mapper_src),
    path('mapper/agrins/<path:path>', mapper_agrins),
    path('api/activate/<uidb64>/<token>', activate, name='activate'),
    url(r'^api/password_reset/', include('django_rest_passwordreset.urls', namespace='password_reset')),
    path('api/register-push/<device>', save_push_device, name='push_devices'),
]
