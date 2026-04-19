from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet, DepartmentViewSet, LectureViewSet, AssignmentViewSet, QuizViewSet,
    QuestionViewSet, AttendanceViewSet, AnnouncementViewSet, AssignmentSubmissionViewSet,
    NotificationViewSet, QuizAttemptViewSet, AnnouncementCommentViewSet
)

router = DefaultRouter()
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'lectures', LectureViewSet, basename='lecture')
router.register(r'assignments', AssignmentViewSet)
router.register(r'quizzes', QuizViewSet)
router.register(r'questions', QuestionViewSet)
router.register(r'attendance', AttendanceViewSet)
router.register(r'announcements', AnnouncementViewSet)
router.register(r'announcement-comments', AnnouncementCommentViewSet)
router.register(r'assignment-submissions', AssignmentSubmissionViewSet)
router.register(r'notifications', NotificationViewSet)
router.register(r'quiz-attempts', QuizAttemptViewSet, basename='quiz-attempt')

urlpatterns = [
    path('', include(router.urls)),
]
