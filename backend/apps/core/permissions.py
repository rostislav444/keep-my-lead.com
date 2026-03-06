from rest_framework.permissions import BasePermission


class IsOwner(BasePermission):
    """Only allow tenant owners."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'owner'


class IsTenantMember(BasePermission):
    """Allow any authenticated user who belongs to a tenant."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.tenant_id is not None
