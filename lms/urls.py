from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet, LectureViewSet, AssignmentViewSet, QuizViewSet,
    QuestionViewSet, AttendanceViewSet, AnnouncementViewSet
)

router = DefaultRouter()
router.register(r'courses', CourseViewSet)
router.register(r'lectures', LectureViewSet)
router.register(r'assignments', AssignmentViewSet)
router.register(r'quizzes', QuizViewSet)
router.register(r'questions', QuestionViewSet)
router.register(r'attendance', AttendanceViewSet)
router.register(r'announcements', AnnouncementViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
