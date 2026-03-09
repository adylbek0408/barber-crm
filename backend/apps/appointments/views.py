from rest_framework import viewsets, status
from rest_framework.response import Response
from apps.accounts.permissions import IsBarber, IsOwner
from .models import Appointment
from .serializers import AppointmentSerializer, CreateAppointmentSerializer


class BarberAppointmentViewSet(viewsets.ModelViewSet):
    """Записи стрижек — для барбера (только свои записи)"""
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
