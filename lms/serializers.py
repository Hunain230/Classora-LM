from rest_framework import serializers
from .models import (
    Course, Lecture, Assignment, Quiz, Question, 
    AttendanceRecord, AttendanceEntry, Announcement, Department,
    AssignmentSubmission, Notification, QuizAttempt, AnnouncementComment
)
from accounts.serializers import UserSerializer

class DepartmentSerializer(serializers.ModelSerializer):
    courses_count = serializers.IntegerField(source='courses.count', read_only=True)
    class Meta:
        model = Department
        fields = ['id', 'name', 'code', 'description', 'institute', 'courses_count', 'created_at']
        read_only_fields = ['institute']

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = "__all__"
        read_only_fields = ['institute']

class LectureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lecture
        fields = "__all__"

class AssignmentSerializer(serializers.ModelSerializer):
    attachment_url = serializers.SerializerMethodField()

    class Meta:
        model = Assignment
        fields = "__all__"

    def get_attachment_url(self, obj):
        if obj.attachment:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.attachment.url)
            return f"/media/{obj.attachment}"
        return None

class QuizSerializer(serializers.ModelSerializer):
    question_count = serializers.IntegerField(source='questions.count', read_only=True)
    is_active = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = "__all__"

    def get_is_active(self, obj):
        return obj.is_active()

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = "__all__"

class AttendanceEntrySerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source="student.full_name")
    class Meta:
        model = AttendanceEntry
        fields = "__all__"

class AttendanceRecordSerializer(serializers.ModelSerializer):
    entries = AttendanceEntrySerializer(many=True, read_only=True)
    class Meta:
        model = AttendanceRecord
        fields = "__all__"

class AnnouncementCommentSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source="user.full_name")
    user_role = serializers.ReadOnlyField(source="user.role")
    
    class Meta:
        model = AnnouncementComment
        fields = "__all__"
        read_only_fields = ["user", "created_at"]

class AnnouncementSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source="author.full_name")
    author_role = serializers.ReadOnlyField(source="author.role")
    comments = AnnouncementCommentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Announcement
        fields = "__all__"

class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source="student.full_name")
    attachment_url = serializers.SerializerMethodField()

    class Meta:
        model = AssignmentSubmission
        fields = "__all__"
        read_only_fields = ['student', 'submitted_at', 'status']

    def get_attachment_url(self, obj):
        if obj.attachment:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.attachment.url)
            return f"/media/{obj.attachment}"
        return None

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = "__all__"
        read_only_fields = ['user', 'created_at']

class QuizAttemptSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source="student.full_name")
    percentage = serializers.SerializerMethodField()

    class Meta:
        model = QuizAttempt
        fields = "__all__"
        read_only_fields = ['student', 'submitted_at', 'score', 'total_marks']

    def get_percentage(self, obj):
        if obj.total_marks and obj.total_marks > 0:
            return round((obj.score / obj.total_marks) * 100, 1)
        return None
