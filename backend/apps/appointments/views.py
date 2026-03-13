from rest_framework import viewsets, status
from rest_framework.response import Response
from apps.accounts.permissions import IsBarber, IsOwner, IsShopAdmin
from .models import Appointment
from .serializers import (
    AppointmentSerializer,
    CreateAppointmentSerializer,
    CreateAppointmentByShopAdminSerializer,
)


class BarberAppointmentViewSet(viewsets.ModelViewSet):
    """Записи стрижек — для барбера (только свои записи). Создание запрещено, если у барбершопа есть администратор."""
    permission_classes = [IsBarber]
    http_method_names = ['get', 'post']  # Барбер только читает и создаёт

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateAppointmentSerializer
        return AppointmentSerializer

    def get_queryset(self):
        return Appointment.objects.filter(
            barber__user=self.request.user
        ).select_related('service', 'branch')

    def create(self, request, *args, **kwargs):
        barber_profile = getattr(request.user, 'barber_profile', None)
        if not barber_profile:
            return Response(
                {'detail': 'У вашего аккаунта нет профиля барбера.'},
                status=status.HTTP_403_FORBIDDEN
            )
        barbershop = barber_profile.branch.barbershop
        if getattr(barbershop, 'has_shop_admin', False):
            return Response(
                {'detail': 'Записи и оплаты в этом барбершопе ведёт администратор.'},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        appointment = serializer.save()
        return Response(
            AppointmentSerializer(appointment).data,
            status=status.HTTP_201_CREATED
        )


class OwnerAppointmentViewSet(viewsets.ReadOnlyModelViewSet):
    """Все записи барбершопа — только для владельца"""
    serializer_class = AppointmentSerializer
    permission_classes = [IsOwner]

    def get_queryset(self):
        qs = Appointment.objects.filter(
            branch__barbershop=self.request.user.barbershop
        ).select_related('barber', 'branch', 'service')

        # Фильтры
        barber_id = self.request.query_params.get('barber')
        branch_id = self.request.query_params.get('branch')
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')

        if barber_id:
            qs = qs.filter(barber_id=barber_id)
        if branch_id:
            qs = qs.filter(branch_id=branch_id)
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)

        return qs


class ShopAdminAppointmentViewSet(viewsets.ModelViewSet):
    """Записи барбершопа для администратора: список и создание от имени барбера."""
    permission_classes = [IsShopAdmin]
    http_method_names = ['get', 'post']

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateAppointmentByShopAdminSerializer
        return AppointmentSerializer

    def get_queryset(self):
        barbershop = getattr(self.request.user, 'managed_barbershop', None)
        if not barbershop:
            return Appointment.objects.none()
        return Appointment.objects.filter(
            branch__barbershop=barbershop
        ).select_related('barber', 'branch', 'service').order_by('-created_at')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        try:
            appointment = serializer.save()
        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        return Response(
            AppointmentSerializer(appointment).data,
            status=status.HTTP_201_CREATED
        )
