from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BarberViewSet, ServiceViewSet, MyServicesView

router = DefaultRouter()
router.register('barbers', BarberViewSet, basename='barber')
router.register('services', ServiceViewSet, basename='service')
router.register('barber/my-services', MyServicesView, basename='my-services')

urlpatterns = [
    path('', include(router.urls)),
]
