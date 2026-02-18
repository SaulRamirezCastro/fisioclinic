from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from patients.views import PatientViewSet, PrescriptionViewSet, ClinicalHistoryViewSet
from appointments.views import AppointmentViewSet
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from auth.views import EmailLoginView
from django.conf import settings
from django.conf.urls.static import static

router = DefaultRouter()
router.register("patients", PatientViewSet, basename="p")
router.register("appointments", AppointmentViewSet)
router.register("prescriptions", PrescriptionViewSet)
router.register(
    "clinical-history",
    ClinicalHistoryViewSet,
    basename="clinical-history"
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/login/", EmailLoginView.as_view()),
    path("api/auth/refresh/", TokenRefreshView.as_view()),
    path("api/", include(router.urls)),
    re_path(r'^(?!api/|admin/).*$', TemplateView.as_view(template_name='index.html')),
]
if settings.DEBUG:
    urlpatterns += static(
        settings.STATIC_URL,
        document_root=settings.STATIC_ROOT
    )
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
