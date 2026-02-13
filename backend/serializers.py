from rest_framework import serializers
from .models import InstitutionalBranding, Course, Question, AssessmentPaper

class BrandingSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstitutionalBranding
        fields = '__all__'

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'

class AssessmentPaperSerializer(serializers.ModelSerializer):
    question_ids = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Question.objects.all(), 
        source='questions',
        required=False
    )
    
    class Meta:
        model = AssessmentPaper
        fields = ['id', 'course', 'created_at', 'header', 'student_info', 'footer', 'instructions', 'question_ids']

    def to_representation(self, instance):
        # When reading, return the full question objects
        data = super().to_representation(instance)
        data['questions'] = QuestionSerializer(instance.questions.all(), many=True).data
        return data
