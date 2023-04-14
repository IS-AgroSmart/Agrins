"""
Django settings for IngSoft1 project.

Generated by 'django-admin startproject' using Django 3.0.

For more information on this file, see
https://docs.djangoproject.com/en/3.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.0/ref/settings/
"""

import os
import sys

from decouple import config

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
# SECURITY WARNING: don't run with debug turned on in production!


SECRET_KEY = config('SECRET_KEY')

DEBUG = config('DEBUG', cast=bool)
ALLOWED_HOSTS = ['*']


#Geoserver data
GEOSERVER_PUBLIC_LOCATION = config('GEOSERVER_PUBLIC_LOCATION', cast=str)
GEOSERVER_LOCATION = config('GEOSERVER_LOCATION', cast=str)
GEOSERVER_LOCAL_LOCATION = config('GEOSERVER_LOCAL_LOCATION', cast=str)
GEOSERVER_USER = config('GEOSERVER_USER', cast=str) 
GEOSERVER_PASSWORD = config('GEOSERVER_PASSWORD',cast=str)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'require_debug_true': {
            '()': 'django.utils.log.RequireDebugTrue',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'filters': ['require_debug_true'],
        },
    },
    'loggers': {
        'mylogger': {
            'handlers': ['console'],
            'level': os.getenv('DJANGO_LOG_LEVEL', 'INFO'),
            'propagate': True,
        },
    },
}

AUTH_USER_MODEL = config('AUTH_USER_MODEL', cast=str)
SITE_URL = config('SITE_URL', cast=str)

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'push_notifications',
    'core',
    #"nodeodm_proxy",
    "prometheus_metrics",
    'rest_framework',
    'rest_framework.authtoken',
    'django_rest_passwordreset',
]

PUSH_NOTIFICATIONS_SETTINGS = {
        "FCM_API_KEY": config("FCM_API_KEY"),
        "APNS_CERTIFICATE": config("APNS_CERTIFICATE"),
}

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
}

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'IngSoft1.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')]
        ,
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]



WSGI_APPLICATION = 'IngSoft1.wsgi.application'

# Database
# https://docs.djangoproject.com/en/3.0/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
    
    # 'default': {
    #    'ENGINE': 'django.db.backends.mysql',
    #    'NAME': config("DB_NAME"),
    #    'USER': config("DB_USER"),
    #    'PASSWORD': config("DB_PASSWORD"),
    #    'HOST': config("DB_HOST"),
    #    'PORT': '3306',
    #}
}
if 'test' in sys.argv or 'test_coverage' in sys.argv or True:  # Covers regular testing and django-coverage
    DATABASES['default']['ENGINE'] = 'django.db.backends.sqlite3'
    DATABASES['default']['NAME'] = os.path.join(BASE_DIR, 'db.sqlite3')

# Password validation
# https://docs.djangoproject.com/en/3.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
# https://docs.djangoproject.com/en/3.0/topics/i18n/

LANGUAGE_CODE = 'es'

TIME_ZONE = 'America/Guayaquil'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.0/howto/static-files/


STATIC_URL = os.path.join(BASE_DIR, config('STATIC_URL', cast=str))
STATIC_ROOT = os.path.join(BASE_DIR, config('STATIC_ROOT', cast=str))  
# STATICFILES_DIRS = (os.path.join(BASE_DIR, "staticfiles"),)
DOMAIN_SITE = DOMAIN_SITE = config('DOMAIN_SITE', cast=str)#'www.agrins.cedia.org.ec'

#Send Emails
EMAIL_USE_TLS = True #config('EMAIL_USE_TLS', cast=bool)
EMAIL_HOST = 'smtp.gmail.com' #config('EMAIL_HOST', cast=str)
EMAIL_PORT = 587 #config('EMAIL_PORT')
EMAIL_HOST_USER=EMAIL_HOST_USER = 'agrins2022@gmail.com' #config('EMAIL_HOST_USER', cast=str)
EMAIL_HOST_PASSWORD=EMAIL_HOST_PASSWORD = 'ryxneyvsphdrycqx' #config('EMAIL_HOST_PASSWORD', cast=str)
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend' # config('EMAIL_BACKEND',cast=str)

#EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

#NODEODM_SERVER_URL = config('NODEODM_SERVER_URL', cast=str)
#NODEODM_SERVER_TOKEN = config('NODEODM_SERVER_TOKEN', default="dummy", cast=str)
