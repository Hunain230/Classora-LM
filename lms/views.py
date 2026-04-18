from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import (
    Course, Lecture, Assignment, Quiz, Question,
    AttendanceRecord, AttendanceEntry, Announcement, Department,
    AssignmentSubmission, Notification, QuizAttempt
)
from .serializers import (
    CourseSerializer, LectureSerializer, AssignmentSerializer, QuizSerializer,
    QuestionSerializer, AttendanceRecordSerializer, AttendanceEntrySerializer,
    AnnouncementSerializer, DepartmentSerializer, AssignmentSubmissionSerializer,
    NotificationSerializer, QuizAttemptSerializer
)

class DepartmentViewSet(viewsets.ModelViewSet):
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Department.objects.filter(institute=user.institute)

    def perform_create(self, serializer):
        serializer.save(institute=self.request.user.institute)

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated or not hasattr(user, 'role'):
            return self.queryset.none()
            
        if user.role == "ADMIN":
            return self.queryset.filter(institute=user.institute)
        elif user.role == "TEACHER":
            return self.queryset.filter(teachers=user)
        elif user.role == "STUDENT":
            return self.queryset.filter(students=user, is_published=True)
        return self.queryset.none()

    def perform_create(self, serializer):
        serializer.save(institute=self.request.user.institute)

class LectureViewSet(viewsets.ModelViewSet):
    queryset = Lecture.objects.all()
    serializer_class = LectureSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "ADMIN":
            return self.queryset.filter(course__institute=user.institute)
        elif user.role == "TEACHER":
            return self.queryset.filter(course__teachers=user)
        elif user.role == "STUDENT":
            return self.queryset.filter(course__students=user)
        return self.queryset.none()

class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "ADMIN":
            return self.queryset.filter(course__institute=user.institute)
        elif user.role == "TEACHER":
            return self.queryset.filter(course__teachers=user)
        elif user.role == "STUDENT":
            return self.queryset.filter(course__students=user)
        return self.queryset.none()

    def perform_create(self, serializer):
        assignment = serializer.save()
        # notify students
        students = assignment.course.students.all()
        notifications = []
        for student in students:
            notifications.append(Notification(
                user=student,
                title="New Assignment",
                message=f"A new assignment '{assignment.title}' has been uploaded for {assignment.course.name}."
            ))
        Notification.objects.bulk_create(notifications)

class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "ADMIN":
            return self.queryset.filter(course__institute=user.institute)
        elif user.role == "TEACHER":
            return self.queryset.filter(course__teachers=user)
        elif user.role == "STUDENT":
            return self.queryset.filter(course__students=user, is_published=True)
        return self.queryset.none()

    def perform_create(self, serializer):
        quiz = serializer.save()
        if quiz.is_published:
            self._notify_students(quiz)

    def perform_update(self, serializer):
        old_published = serializer.instance.is_published
        quiz = serializer.save()
        if quiz.is_published and not old_published:
            self._notify_students(quiz)

    def _notify_students(self, quiz):
        students = quiz.course.students.all()
        Notification.objects.bulk_create([
            Notification(
                user=s,
                title="New Quiz Available",
                message=f"Quiz '{quiz.title}' is now available for {quiz.course.name}."
            ) for s in students
        ])

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "ADMIN":
            return self.queryset.filter(quiz__course__institute=user.institute)
        elif user.role == "TEACHER":
            return self.queryset.filter(quiz__course__teachers=user)
        elif user.role == "STUDENT":
            # Students usually shouldn't see all questions if the quiz is active/not published as a review
            return self.queryset.filter(quiz__course__students=user, quiz__is_published=True)
        return self.queryset.none()

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = AttendanceRecord.objects.all()
    serializer_class = AttendanceRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "ADMIN":
            return self.queryset.filter(course__institute=user.institute)
        elif user.role == "TEACHER":
            return self.queryset.filter(course__teachers=user)
        elif user.role == "STUDENT":
            return self.queryset.filter(course__students=user)
        return self.queryset.none()

    @action(detail=True, methods=['post'])
    def mark_attendance(self, request, pk=None):
        record = self.get_object()
        entries_data = request.data.get('entries', [])
        for entry in entries_data:
            student_id = entry.get('student_id')
            status_val = entry.get('status')
            remarks = entry.get('remarks', '')
            AttendanceEntry.objects.update_or_create(
                record=record,
                student_id=student_id,
                defaults={'status': status_val, 'remarks': remarks}
            )
        return Response({'status': 'attendance marked'})

class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated: return self.queryset.none()
        return self.queryset.filter(institute=user.institute)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user, institute=self.request.user.institute)

class AssignmentSubmissionViewSet(viewsets.ModelViewSet):
    queryset = AssignmentSubmission.objects.all()
    serializer_class = AssignmentSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "ADMIN":
            return self.queryset.filter(assignment__course__institute=user.institute)
        elif user.role == "TEACHER":
            return self.queryset.filter(assignment__course__teachers=user)
        elif user.role == "STUDENT":
            return self.queryset.filter(student=user)
        return self.queryset.none()

    def perform_create(self, serializer):
        assignment = serializer.validated_data.get('assignment')
        from django.utils import timezone
        
        status_val = "ON_TIME"
        if timezone.now() > assignment.due_date:
            status_val = "LATE"
            
        serializer.save(student=self.request.user, status=status_val)

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user).order_by('-created_at')

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        self.get_queryset().update(is_read=True)
        return Response({'status': 'all marked read'})

class QuizAttemptViewSet(viewsets.ModelViewSet):
    queryset = QuizAttempt.objects.all()
    serializer_class = QuizAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "TEACHER":
            return self.queryset.filter(quiz__course__teachers=user)
        elif user.role == "STUDENT":
            return self.queryset.filter(student=user)
        elif user.role == "ADMIN":
            return self.queryset.filter(quiz__course__institute=user.institute)
        return self.queryset.none()

    def perform_create(self, serializer):
        from django.utils import timezone
        quiz = serializer.validated_data.get('quiz')
        answers = serializer.validated_data.get('answers', {})
        time_taken = serializer.validated_data.get('time_taken_seconds')

        questions = quiz.questions.all()
        total_marks = sum(q.points for q in questions)
        score = 0

        for q in questions:
            student_answer = answers.get(str(q.id))
            if q.question_type == "MCQ":
                if student_answer is not None and str(student_answer) == str(q.correct_answer):
                    score += q.points
            # SHORT_ANSWER: teacher marks manually

        attempt = serializer.save(
            student=self.request.user,
            score=score,
            total_marks=total_marks,
            time_taken_seconds=time_taken
        )

        # Notify student of their score
        percentage = round((score / total_marks) * 100, 1) if total_marks > 0 else 0
        Notification.objects.create(
            user=self.request.user,
            title="Quiz Submitted",
            message=f"You scored {score}/{total_marks} ({percentage}%) on '{quiz.title}'.",
        )

    @action(detail=True, methods=['patch'])
    def grade(self, request, pk=None):
        """Teacher manually grades a short-answer attempt."""
        attempt = self.get_object()
        score = request.data.get('score')
        if score is not None:
            attempt.score = float(score)
            attempt.save()
            Notification.objects.create(
                user=attempt.student,
                title="Quiz Graded",
                message=f"Your quiz '{attempt.quiz.title}' has been graded. Score: {score}/{attempt.total_marks}.",
            )
        return Response(QuizAttemptSerializer(attempt).data)

