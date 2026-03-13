from rest_framework.permissions import BasePermission


class IsPlatformAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_platform_admin()


class IsOwner(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_owner()


class IsBarber(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_barber()


class IsShopAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_shop_admin()


class IsOwnerOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_owner() or request.user.is_platform_admin()
        )


class IsOwnerOrBarber(BasePermission):
    """Владелец ИЛИ барбер — для общих ресурсов (напр. услуги)"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_owner() or request.user.is_barber()
        )


class IsOwnerOrShopAdmin(BasePermission):
    """Владелец ИЛИ администратор барбершопа — для списка барберов/услуг своего барбершопа"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_owner() or request.user.is_shop_admin()
        )


class IsOwnerOrBarberOrShopAdmin(BasePermission):
    """Владелец, барбер или администратор барбершопа — для услуг (разный queryset по роли)"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_owner() or request.user.is_barber() or request.user.is_shop_admin()
        )
