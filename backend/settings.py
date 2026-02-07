from pathlib import Path
import os
from corsheaders.defaults import default_headers
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = 'dev'
DEBUG = True
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
 'django.contrib.admin',
 'django.contrib.auth',
 'django.contrib.contenttypes',
 'django.contrib.sessions',
 'django.contrib.messages',
 'django.contrib.staticfiles',
 'rest_framework',
    'corsheaders',
    'patients',
 'appointments',
 'users',
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]
ROOT_URLCONF = 'backend.urls'
WSGI_APPLICATION = 'backend.wsgi.application'

DATABASES = {
 'default': {
  'ENGINE': 'django.db.backends.postgresql',
  'NAME': os.getenv('DB_NAME'),
  'USER': os.getenv('DB_USER'),
  'PASSWORD': os.getenv('DB_PASSWORD'),
  'HOST': os.getenv('DB_HOST'),
  'PORT': os.getenv('DB_PORT'),
 }
}

LANGUAGE_CODE = 'es-mx'
TIME_ZONE = 'America/Mexico_City'

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_FILTER_BACKENDS": [
        "rest_framework.filters.SearchFilter",
    ],
    # "DEFAULT_PAGINATION_CLASS":
    #     "rest_framework.pagination.PageNumberPagination",
    # "PAGE_SIZE": 50,
}
X_FRAME_OPTIONS = "SAMEORIGIN"

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=1),   # ⏱️ 1 hora
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),   # 📆 7 días

    "ROTATE_REFRESH_TOKENS": True,
  ##  "BLACKLIST_AFTER_ROTATION": True,

    "AUTH_HEADER_TYPES": ("Bearer",),
}

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],   # 👈 VACÍO está bien
        "APP_DIRS": True,   # ✅ ESTO ES CLAVE
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",  # ✅ OBLIGATORIO
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

CORS_ALLOWED_ORIGINS = [
    "https://fisioclinic.onrender.com",
]


CORS_ALLOW_HEADERS = list(default_headers) + [
    "authorization",
]
