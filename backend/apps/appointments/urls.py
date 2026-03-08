from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BarberAppointmentViewSet, OwnerAppointmentViewSet

router = DefaultRouter()
router.register('barber/appointments', BarberAppointmentViewSet, basename='barber-appointments')
router.register('owner/appointments', OwnerAppointmentViewSet, basename='owner-appointments')

urlpatterns = [
    path('', include(router.urls)),
]
