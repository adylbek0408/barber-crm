from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BarbershopViewSet, BranchViewSet

router = DefaultRouter()
router.register('admin/barbershops', BarbershopViewSet, basename='barbershop')
router.register('branches', BranchViewSet, basename='branch')

urlpatterns = [
    path('', include(router.urls)),
]
