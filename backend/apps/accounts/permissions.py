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
