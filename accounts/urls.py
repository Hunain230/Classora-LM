from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    create_user,
    institute_detail,
    institute_register,
    login,
    me,
    student_dashboard,
    teacher_dashboard,
    users_list,
)

urlpatterns = [
    # Institute registration (public).
    path("institute/register", institute_register, name="institute-register"),
    path("institute/register/", institute_register, name="institute-register-slash"),
    # Email/password login (public).
    path("login", login, name="login"),
    path("login/", login, name="login-slash"),
    # JWT token refresh (public: requires valid refresh token, not access token).
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    # Authenticated endpoints.
    path("me", me, name="me"),
    path("me/", me, name="me-slash"),
    path("institute/<int:pk>/", institute_detail, name="institute-detail"),
    path("users/", users_list, name="user-list"),
    path("users/create/", create_user, name="user-create"),
    path("teacher/dashboard/", teacher_dashboard, name="teacher-dashboard"),
    path("student/dashboard/", student_dashboard, name="student-dashboard"),
]
