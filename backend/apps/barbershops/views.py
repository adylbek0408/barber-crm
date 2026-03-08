from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.accounts.permissions import IsPlatformAdmin, IsOwner, IsOwnerOrAdmin
from .models import Barbershop, Branch
from .serializers import (
    BarbershopSerializer, CreateBarbershopSerializer, BranchSerializer
)


class BarbershopViewSet(viewsets.ModelViewSet):
    """Управление барбершопами — только для платформ-админа"""
    queryset = Barbershop.objects.select_related('subscription').all()
    permission_classes = [IsPlatformAdmin]

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateBarbershopSerializer
        return BarbershopSerializer

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        shop = self.get_object()
        shop.is_active = not shop.is_active
        shop.save()
        return Response({'is_active': shop.is_active})


class BranchViewSet(viewsets.ModelViewSet):
    """Управление филиалами — для владельца"""
    serializer_class = BranchSerializer
    permission_classes = [IsOwner]

    def get_queryset(self):
        return Branch.objects.filter(
            barbershop=self.request.user.barbershop
        )

    def perform_create(self, serializer):
        serializer.save(barbershop=self.request.user.barbershop)
