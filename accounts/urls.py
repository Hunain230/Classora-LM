from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    create_user,
    forgot_password,
    institute_detail,
    institute_register,
    login,
    me,
    reset_password,
    student_dashboard,
    teacher_dashboard,
    users_list,
    delete_user,
    verify_reset_code,
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
    # Forgot-password flow (public).
    path("forgot-password/", forgot_password, name="forgot-password"),
    path("verify-reset-code/", verify_reset_code, name="verify-reset-code"),
    path("reset-password/", reset_password, name="reset-password"),
    # Authenticated endpoints.
    path("me", me, name="me"),
    path("me/", me, name="me-slash"),
    path("institute/<int:pk>/", institute_detail, name="institute-detail"),
    path("users/", users_list, name="user-list"),
    path("users/create/", create_user, name="user-create"),
    path("users/<int:pk>/delete/", delete_user, name="user-delete"),
    path("teacher/dashboard/", teacher_dashboard, name="teacher-dashboard"),
    path("student/dashboard/", student_dashboard, name="student-dashboard"),
]

