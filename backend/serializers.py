
from rest_framework import serializers
from .models import InstitutionalBranding, Course, Question, AssessmentPaper

class BrandingSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstitutionalBranding
        fields = '__all__'

class CourseSerializer(serializers.ModelSerializer):
    # Mapping frontend camelCase to backend snake_case
    deptId = serializers.CharField(source='dept_id', required=False, allow_blank=True)
    programmeId = serializers.CharField(source='programme_id', required=False, allow_blank=True)
    mqfMappings = serializers.JSONField(source='mqf_mappings', required=False)
    assessmentPolicies = serializers.JSONField(source='assessment_policies', required=False)
    jsuTemplate = serializers.JSONField(source='jsu_template', required=False)
    
    # Direct fields
    topics = serializers.JSONField(required=False)
    clos = serializers.JSONField(required=False)
    mqfs = serializers.JSONField(required=False)

    class Meta:
        model = Course
        fields = [
            'id', 'code', 'name', 
            'deptId', 'programmeId', 
            'clos', 'mqfs', 'mqfMappings', 
            'topics', 'assessmentPolicies', 'jsuTemplate'
        ]

class QuestionSerializer(serializers.ModelSerializer):
    # Mapping frontend camelCase
    courseId = serializers.PrimaryKeyRelatedField(source='course', queryset=Course.objects.all(), required=False, allow_null=True)
    sectionTitle = serializers.CharField(source='section_title', required=False, allow_blank=True)
    cloKeys = serializers.JSONField(source='clo_keys', required=False)
    mqfKeys = serializers.JSONField(source='mqf_keys', required=False)
    subQuestions = serializers.JSONField(source='sub_questions', required=False)
    imageUrl = serializers.CharField(source='image_url', required=False, allow_blank=True, allow_null=True)
    figureLabel = serializers.CharField(source='figure_label', required=False, allow_blank=True)
    
    # New media fields
    mediaType = serializers.CharField(source='media_type', required=False, allow_blank=True, allow_null=True)
    answerImageUrl = serializers.CharField(source='answer_image_url', required=False, allow_blank=True, allow_null=True)
    answerFigureLabel = serializers.CharField(source='answer_figure_label', required=False, allow_blank=True)
    tableData = serializers.JSONField(source='table_data', required=False)

    class Meta:
        model = Question
        fields = [
            'id', 'courseId', 'sectionTitle', 'number', 'text', 'answer', 'marks', 
            'taxonomy', 'type', 'topic', 'options', 'cloKeys', 'mqfKeys', 
            'subQuestions', 'imageUrl', 'figureLabel', 'mediaType', 
            'answerImageUrl', 'answerFigureLabel', 'tableData', 'construct', 'domain'
        ]

class AssessmentPaperSerializer(serializers.ModelSerializer):
    question_ids = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Question.objects.all(), 
        source='questions',
        required=False
    )
    # Map frontend fields
    courseId = serializers.PrimaryKeyRelatedField(source='course', queryset=Course.objects.all(), required=False, allow_null=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    studentInfo = serializers.JSONField(source='student_info')
    cloDefinitions = serializers.JSONField(source='clo_definitions', required=False)
    mqfClusters = serializers.JSONField(source='mqf_clusters', required=False)

    class Meta:
        model = AssessmentPaper
        fields = [
            'id', 'courseId', 'createdAt', 'header', 'studentInfo', 'footer', 
            'instructions', 'question_ids', 'cloDefinitions', 'mqfClusters', 'matrix', 'status'
        ]

    def to_representation(self, instance):
        # When reading, return the full question objects
        data = super().to_representation(instance)
        data['questions'] = QuestionSerializer(instance.questions.all(), many=True).data
        return data
