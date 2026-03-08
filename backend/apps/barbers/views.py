from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from apps.accounts.permissions import IsOwner, IsBarber, IsOwnerOrBarber
from .models import Barber, Service
from .serializers import BarberSerializer, CreateBarberSerializer, ServiceSerializer


class BarberViewSet(viewsets.ModelViewSet):
    """Управление барберами — для владельца"""
    permission_classes = [IsOwner]

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateBarberSerializer
        return BarberSerializer

    def get_queryset(self):
        return Barber.objects.filter(
            branch__barbershop=self.request.user.barbershop
        ).prefetch_related('services')


class ServiceViewSet(viewsets.ModelViewSet):
    """
    Управление услугами.
    - Владелец: видит и управляет всеми услугами своего барбершопа.
    - Барбер: видит и управляет только своими услугами.
    """
    serializer_class = ServiceSerializer
    permission_classes = [IsOwnerOrBarber]

    def get_queryset(self):
        user = self.request.user

        # Барбер видит только свои услуги
        if user.is_barber():
            return Service.objects.filter(barber__user=user)

        # Владелец видит все услуги своего барбершопа
        qs = Service.objects.filter(
            barber__branch__barbershop=user.barbershop
        )
        barber_id = self.request.query_params.get('barber')
        if barber_id:
            qs = qs.filter(barber_id=barber_id)
        return qs

    def perform_create(self, serializer):
        user = self.request.user

        if user.is_barber():
            # Барбер создаёт услугу только для себя — игнорируем barber из тела запроса
            if not hasattr(user, 'barber_profile'):
                raise PermissionDenied('У вашего аккаунта нет профиля барбера.')
            serializer.save(barber=user.barber_profile)
        else:
            # Владелец указывает barber в теле запроса
            serializer.save()

    def perform_update(self, serializer):
        user = self.request.user
        obj = self.get_object()

        # Барбер может редактировать только свои услуги
        if user.is_barber() and obj.barber.user != user:
            raise PermissionDenied('Вы можете редактировать только свои услуги.')
        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user

        # Барбер может удалять только свои услуги
        if user.is_barber() and instance.barber.user != user:
            raise PermissionDenied('Вы можете удалять только свои услуги.')
        instance.delete()


class MyServicesView(viewsets.ReadOnlyModelViewSet):
    """Услуги текущего барбера (для интерфейса записи)"""
    serializer_class = ServiceSerializer
    permission_classes = [IsBarber]

    def get_queryset(self):
        return Service.objects.filter(
            barber__user=self.request.user,
            is_active=True
        )
