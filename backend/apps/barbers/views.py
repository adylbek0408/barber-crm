from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from apps.accounts.permissions import IsOwner, IsBarber, IsOwnerOrBarber, IsOwnerOrShopAdmin, IsOwnerOrBarberOrShopAdmin
from .models import Barber, Service
from .serializers import BarberSerializer, CreateBarberSerializer, ServiceSerializer


def _barbershop_for_request(request):
    """Барбершоп для владельца или администратора барбершопа."""
    if request.user.is_owner() and hasattr(request.user, 'barbershop'):
        return request.user.barbershop
    if request.user.is_shop_admin() and hasattr(request.user, 'managed_barbershop'):
        return request.user.managed_barbershop
    return None


class BarberViewSet(viewsets.ModelViewSet):
    """Управление барберами — для владельца и администратора барбершопа (чтение для shop_admin)"""
    permission_classes = [IsOwnerOrShopAdmin]

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateBarberSerializer
        return BarberSerializer

    def get_queryset(self):
        barbershop = _barbershop_for_request(self.request)
        if not barbershop:
            return Barber.objects.none()
        return Barber.objects.filter(
            branch__barbershop=barbershop
        ).prefetch_related('services')

    def perform_create(self, serializer):
        # Создавать барберов может только владелец
        if not self.request.user.is_owner():
            raise PermissionDenied('Только владелец может добавлять барберов.')
        barbershop = _barbershop_for_request(self.request)
        if not barbershop:
            raise PermissionDenied('Барбершоп не найден.')
        branch = serializer.validated_data.get('branch')
        if branch and branch.barbershop_id != barbershop.id:
            raise PermissionDenied('Филиал не принадлежит вашему барбершопу.')
        serializer.save()


class ServiceViewSet(viewsets.ModelViewSet):
    """
    Управление услугами.
    - Владелец: видит и управляет всеми услугами своего барбершопа.
    - Администратор барбершопа: видит все услуги (для записи от имени барбера).
    - Барбер: видит и управляет только своими услугами.
    """
    serializer_class = ServiceSerializer
    permission_classes = [IsOwnerOrBarberOrShopAdmin]

    def get_queryset(self):
        user = self.request.user

        # Барбер видит только свои услуги
        if user.is_barber():
            return Service.objects.filter(barber__user=user)

        # Владелец или администратор барбершопа
        barbershop = _barbershop_for_request(self.request)
        if not barbershop:
            return Service.objects.none()
        qs = Service.objects.filter(
            barber__branch__barbershop=barbershop,
            is_active=True,
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
            # Владелец/админ барбершопа: barber в теле запроса (в сериализаторе barber в read_only, передаём явно)
            barbershop = _barbershop_for_request(self.request)
            if not barbershop:
                raise PermissionDenied('Барбершоп не найден.')
            barber_id = self.request.data.get('barber')
            if not barber_id:
                raise PermissionDenied('Укажите барбера (barber).')
            barber = Barber.objects.filter(
                branch__barbershop=barbershop,
                id=barber_id,
            ).first()
            if not barber:
                raise PermissionDenied('Барбер не найден или не из вашего барбершопа.')
            serializer.save(barber=barber)

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
