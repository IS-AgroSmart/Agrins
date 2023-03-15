from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from core.utils.block_verifier import user_verifier

from core.models import *
from django.core.mail import EmailMessage
from .utils.token import  TokenGenerator


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(validators=[UniqueValidator(queryset=User.objects.all())])
    organization = serializers.CharField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    phone = serializers.CharField()
    city = serializers.CharField()
    profession = serializers.CharField()
    used_space = serializers.ReadOnlyField()
    maximum_space = serializers.ReadOnlyField()
    remaining_images = serializers.ReadOnlyField()

    def create(self, validated_data):
        request = self.context.get("request")
        if user_verifier(validated_data, request):
            error = {'message': "User request is blocked"}
            raise serializers.ValidationError(error)

        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            organization=validated_data['organization'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            phone=validated_data['phone'],
            profession=validated_data['profession'],
            city=validated_data['city'],
        )
        user.set_password(validated_data['password'])
        user.is_active = True
        user.save()
       

        # when user is created, link him to all existing demo flights & projects
        #for demo_flight in Flight.objects.filter(is_demo=True).all():
        #    user.demo_flights.add(demo_flight)
        for demo_project in UserProject.objects.filter(is_demo=True).all():
            user.demo_projects.add(demo_project)

        return user

    class Meta:
        model = User
        fields = ["pk", 'username', 'email', 'is_staff', 'password', 'type', 'organization', 'first_name','last_name',
                  'used_space','phone','city','profession', 'maximum_space', 'remaining_images']

'''
class FlightSerializer(serializers.ModelSerializer):
    #nodeodm_info = serializers.SerializerMethodField()

    @staticmethod
    def get_nodeodm_info(flight):
        return flight.get_nodeodm_info()

    class Meta:
        model = Flight
        fields = ["uuid", "name", "user", "date", "is_demo", "deleted"]
'''

class ArtifactSerializer(serializers.ModelSerializer):

    class Meta:
        model = Artifact
        fields = ["pk", "type", "layer", "name", "title", "camera", "date", "source", "legend", "style"]

class LayerSerializer(serializers.ModelSerializer):
    date = serializers.DateTimeField(format="%d-%m-%Y %H:%M:%S")

    class Meta:
        model = Artifact
        fields = ["pk","project", "name", "date"]


class UserProjectSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(),default=serializers.CurrentUserDefault())
    #flights = serializers.PrimaryKeyRelatedField(many=True,queryset=Flight.objects.all())
    layers = serializers.PrimaryKeyRelatedField(many=True,queryset=Layer.objects.all())

    def create(self, validated_data):
        #flights = validated_data.pop("flights")
        layers = validated_data.pop("layers")
        proj = UserProject.objects.create(**validated_data)
        #proj.flights.set(flights)
        proj.layers.set(layers)
        proj._create_geoserver_proj_workspace()
        proj.update_disk_space()
        proj.user.update_disk_space()
        return proj

    class Meta:
        model = UserProject
        fields = ['uuid', 'user', 'layers', "name", "wallpaper","description", "is_demo", "used_space", "deleted"]


class BlockCriteriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlockCriteria
        fields = ["pk", "type", "value", "ip"]
