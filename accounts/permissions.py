from rest_framework.permissions import BasePermission

from .models import CustomUser


class RolePermission(BasePermission):
    """
    Generic role-based permission.
    Use this when an endpoint should only be accessible for specific roles.
    """

    allowed_roles: tuple[str, ...] = ()

    def has_permission(self, request, view) -> bool:
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if not self.allowed_roles:
            return True
        return user.role in self.allowed_roles


class IsAdminRole(RolePermission):
    """
    Allow access only to users with the ADMIN role.
    """

    allowed_roles = (CustomUser.Role.ADMIN,)


class IsTeacherRole(RolePermission):
    """
    Allow access only to users with the TEACHER role.
    """

    allowed_roles = (CustomUser.Role.TEACHER,)


class IsStudentRole(RolePermission):
    """
    Allow access only to users with the STUDENT role.
    """

    allowed_roles = (CustomUser.Role.STUDENT,)
