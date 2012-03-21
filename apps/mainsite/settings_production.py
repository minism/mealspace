from settings import *
from mainsite import TOP_DIR

import os

DEBUG = False
TEMPLATE_DEBUG = DEBUG
TASTYPIE_FULL_DEBUG = DEBUG

TIME_ZONE = 'America/Los_Angeles'
LANGUAGE_CODE = 'en-us'

STATIC_URL = os.getenv('MY_STATIC_URL')

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'mealspace',

        'USER':     os.getenv('MY_DB_USER'),
        'PASSWORD': os.getenv('MY_DB_PASS'),
        'HOST':     os.getenv('MY_DB_HOST'),
        # 'PORT':     os.getenv('MY_DB_PORT'),
    }
}

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': '',
        'TIMEOUT': 300,
        'KEY_PREFIX': '',
        'VERSION': 1,
    }
}
