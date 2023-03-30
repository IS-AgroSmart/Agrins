from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from core.utils.block_verifier import user_verifier

from core.models import *
from django.core.mail import EmailMessage
from .utils.token import  TokenGenerator
from .utils.token import account_activation_token

from django.template.loader import render_to_string
from django.contrib.sites.shortcuts import get_current_site
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import EmailMessage
from django.core.mail import EmailMultiAlternatives


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
        user.is_active = False
        
        user.save()
            
        # send an e-mail to the user
        context = {
            'current_user': user.first_name,
            'username': user.first_name,
            'email': user.email,                    
            #'active_account_url': "https://5aac-45-236-151-33.sa.ngrok.io/#/activeAccount/active?token={0}&uidb64={1}".format(account_activation_token.make_token(user),urlsafe_base64_encode(force_bytes(user.pk)))
            #'reset_password_url': settings.DOMAIN_SITE+/#/activeAccount/active?token={0}&uidb64={1}".format(account_activation_token.make_token(user),urlsafe_base64_encode(force_bytes(user.pk)))
            'active_account_url': settings.DOMAIN_SITE+"/#/activeAccount/active?token={0}&uidb64={1}".format(account_activation_token.make_token(user),urlsafe_base64_encode(force_bytes(user.pk)))
        }

        # render email text
        email_html_message = render_to_string('email/activate_account.html', context)
        email_plaintext_message = render_to_string( 'email/activate_account.txt', context)
        print('host: ',settings.EMAIL_HOST_USER)
        msg = EmailMultiAlternatives(
            "Agrins - Activar cuenta",
            email_plaintext_message,
            settings.EMAIL_HOST_USER,
            [user.email]
        )
        msg.attach_alternative(email_html_message, "text/html")        
        msg.send()

        for demo_project in UserProject.objects.filter(is_demo=True).all():
            user.demo_projects.add(demo_project)
        return user

    class Meta:
        model = User
        fields = ["pk", 'username', 'email', 'is_staff', 'password', 'type', 'organization', 'first_name','last_name',
                  'used_space','phone','city','profession', 'is_active' , 'maximum_space', 'remaining_images']

class ArtifactSerializer(serializers.ModelSerializer):

    class Meta:
        model = Artifact
        fields = ["pk", "type", "layer", "name", "title", "camera", "source", "legend", "style"]

class LayerSerializer(serializers.ModelSerializer):
    artifacts = ArtifactSerializer(many=True, read_only=True)
    #date = serializers.DateTimeField(format="%d-%m-%Y %H:%M:%S")

    class Meta:
        model = Layer
        fields = ["pk","title","artifacts", "project","type", "name", "date"]

class  ResourceSerializer(serializers.ModelSerializer):

    class Meta:
        model = Resource
        fields = ["pk","project","title", "name", "description", "extension",'date']

class ContactSerializer(serializers.ModelSerializer):

    class Meta:
        model = Contact
        fields = ['pk','name','message','email','phone','view','meta', 'date']

class UserProjectSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(),default=serializers.CurrentUserDefault())    
    resources = serializers.PrimaryKeyRelatedField(many=True,queryset=Resource.objects.all())#ResourceSerializer(many=True)
    #print('capas1: ',task_extendeds)
    layers = serializers.PrimaryKeyRelatedField(many=True,queryset=Layer.objects.all())
    #resources = serializers.PrimaryKeyRelatedField(many=True,queryset=Resource.objects.all())
    #print('resursos1: ',resources)
    #print('layers1: ',layers)

    def create(self, validated_data):
        print('eser spac serializar')
        #flights = validated_data.pop("flights")
        layers = validated_data.pop("layers")
        resources = validated_data.pop("resources")
        proj = UserProject.objects.create(**validated_data)
        proj.resources.set(resources)
        #proj.flights.set(flights)
        proj.layers.set(layers)
        proj._create_geoserver_proj_workspace()
        proj.update_disk_space()
        proj.user.update_disk_space()
        return proj

    class Meta:        
        model = UserProject
        print('resursos2: ',model.resources)
        fields = ['uuid', 'user', "resources", "layers", "date_create","date_update", "name", "wallpaper","description", "is_demo", "used_space", "deleted"]


class BlockCriteriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlockCriteria
        fields = ["pk", "type", "value", "ip"]
