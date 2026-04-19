from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import (
    Course, Lecture, Assignment, Quiz, Question,
    AttendanceRecord, AttendanceEntry, Announcement, Department,
    AssignmentSubmission, Notification, QuizAttempt, AnnouncementComment
)
from .serializers import (
    CourseSerializer, LectureSerializer, AssignmentSerializer, QuizSerializer,
    QuestionSerializer, AttendanceRecordSerializer, AttendanceEntrySerializer,
    AnnouncementSerializer, DepartmentSerializer, AssignmentSubmissionSerializer,
    NotificationSerializer, QuizAttemptSerializer, AnnouncementCommentSerializer
)

class DepartmentViewSet(viewsets.ModelViewSet):
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Department.objects.filter(institute=user.institute)

    def perform_create(self, serializer):
        serializer.save(institute=self.request.user.institute)

    def destroy(self, request, *args, **kwargs):
        if request.user.role != "ADMIN":
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only an admin can perform this action.")
        return super().destroy(request, *args, **kwargs)

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

    @action(detail=True, methods=['post'], url_path='remove_user')
    def remove_user(self, request, pk=None):
        if request.user.role != "ADMIN":
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only an admin can remove users from an enrollment.")
        
        course = self.get_object()
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({"detail": "user_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        from accounts.models import CustomUser
        try:
            target_user = CustomUser.objects.get(id=user_id, institute=request.user.institute)
        except CustomUser.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        if target_user.role == "TEACHER":
            course.teachers.remove(target_user)
        elif target_user.role == "STUDENT":
            course.students.remove(target_user)
        else:
            return Response({"detail": "Cannot remove admin."}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"detail": "User securely removed from course"}, status=status.HTTP_200_OK)

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

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if request.user.role == "STUDENT":
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Students cannot delete assignments.")
        if request.user.role == "TEACHER" and request.user not in instance.course.teachers.all():
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only delete assignments for your own courses.")
        return super().destroy(request, *args, **kwargs)

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

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if request.user.role == "STUDENT":
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Students cannot delete quizzes.")
        if request.user.role == "TEACHER" and request.user not in instance.course.teachers.all():
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only delete quizzes for your own courses.")
        return super().destroy(request, *args, **kwargs)

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
    queryset = Announcement.objects.all().order_by('-created_at')
    serializer_class = AnnouncementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated: return self.queryset.none()
        from django.db.models import Q
        from accounts.models import CustomUser
        
        # Base filter: in the same institute
        qs = self.queryset.filter(institute=user.institute)
        
        if user.role == "ADMIN":
            return qs
            
        elif user.role == "TEACHER":
            # Teacher sees: ALL, TEACHER, or their specific course, or targeted to them
            q_target = Q(target_role__in=['ALL', 'TEACHER']) | Q(target_user=user)
            # Course target: null (meaning institute/department wide) OR their specific taught course
            q_course = Q(course__isnull=True) | Q(course__teachers=user)
            # Department target: null OR their course's department
            q_dept = Q(department__isnull=True)
            return qs.filter(q_target, q_course, q_dept).distinct()

        elif user.role == "STUDENT":
            # Student sees: ALL, STUDENT, their enrolled courses, their department, or targeted to them
            q_target = Q(target_role__in=['ALL', 'STUDENT']) | Q(target_user=user)
            q_course = Q(course__isnull=True) | Q(course__students=user)
            
            # Additional logic for department: students are linked via enrolled_courses
            q_dept = Q(department__isnull=True) | Q(department__courses__students=user)
            
            return qs.filter(q_target, q_course, q_dept).distinct()
            
        return self.queryset.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == "STUDENT":
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Students cannot create announcements.")
            
        announcement = serializer.save(author=user, institute=user.institute)
        
        # Dispatch notification to targets
        targets = []
        from django.db.models import Q
        from accounts.models import CustomUser
        
        if announcement.target_user:
            targets.append(announcement.target_user)
        else:
            base_users = CustomUser.objects.filter(institute=user.institute)
            if announcement.target_role != 'ALL':
                base_users = base_users.filter(role=announcement.target_role)
                
            if announcement.course:
                if announcement.target_role == 'STUDENT':
                    base_users = base_users.filter(enrolled_courses=announcement.course)
                elif announcement.target_role == 'TEACHER':
                    base_users = base_users.filter(courses_taught=announcement.course)
                else:
                    base_users = base_users.filter(Q(enrolled_courses=announcement.course) | Q(courses_taught=announcement.course))
                    
            elif announcement.department:
                if announcement.target_role == 'STUDENT':
                    base_users = base_users.filter(enrolled_courses__department=announcement.department)
                elif announcement.target_role == 'TEACHER':
                    base_users = base_users.filter(courses_taught__department=announcement.department)
                else:
                    base_users = base_users.filter(Q(enrolled_courses__department=announcement.department) | Q(courses_taught__department=announcement.department))
            
            targets = list(set(base_users))

        if targets:
            Notification.objects.bulk_create([
                Notification(
                    user=target,
                    title="New Announcement",
                    message=f"New announcement from {user.full_name}: {announcement.title}"
                ) for target in targets if target != user
            ])
            
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if request.user.role != "ADMIN" and instance.author != request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only delete your own announcements.")
        return super().destroy(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if request.user.role != "ADMIN" and instance.author != request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only edit your own announcements.")
        return super().update(request, *args, **kwargs)


class AnnouncementCommentViewSet(viewsets.ModelViewSet):
    queryset = AnnouncementComment.objects.all()
    serializer_class = AnnouncementCommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        announcement_id = self.request.query_params.get('announcement')
        if announcement_id:
            return self.queryset.filter(announcement_id=announcement_id)
        return self.queryset.none()

    def perform_create(self, serializer):
        comment = serializer.save(user=self.request.user)
        
        # Notify the announcement author if someone else comments
        if comment.announcement.author != self.request.user:
            Notification.objects.create(
                user=comment.announcement.author,
                title="New Comment on Announcement",
                message=f"{self.request.user.full_name} commented on your announcement: '{comment.announcement.title}'"
            )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if request.user.role != "ADMIN" and instance.user != request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only delete your own comments.")
        return super().destroy(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if request.user.role != "ADMIN" and instance.user != request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only edit your own comments.")
        return super().update(request, *args, **kwargs)

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

