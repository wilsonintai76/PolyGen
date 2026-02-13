
from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('creator', 'Creator (Lecturer)'),
        ('reviewer', 'Reviewer (Coordinator)'),
        ('endorser', 'Endorser (Head of Dept)'),
        ('admin', 'Administrator'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='creator')
    full_name = models.CharField(max_length=255)
    position = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.role}"

class InstitutionalBranding(models.Model):
    institution_name = models.CharField(max_length=255)
    logo_url = models.TextField(blank=True, null=True)

class Course(models.Model):
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=255)
    
    # Updated to match frontend ID references
    dept_id = models.CharField(max_length=100, blank=True)
    programme_id = models.CharField(max_length=100, blank=True)
    
    # Core Registry Data
    clos = models.JSONField(default=dict)
    mqfs = models.JSONField(default=dict)
    mqf_mappings = models.JSONField(default=dict, blank=True)
    
    # List Data
    topics = models.JSONField(default=list, blank=True)
    assessment_policies = models.JSONField(default=list, blank=True)
    jsu_template = models.JSONField(default=list, blank=True)

    def __str__(self):
        return f"{self.code} - {self.name}"

class Question(models.Model):
    QUESTION_TYPES = [
        ('mcq', 'MCQ'),
        ('short-answer', 'Short Answer'),
        ('essay', 'Essay'),
        ('calculation', 'Calculation'),
        ('diagram-label', 'Diagram Labeling'),
        ('measurement', 'Measurement'),
        ('structure', 'Structure'),
    ]
    
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='questions', null=True)
    section_title = models.CharField(max_length=255, blank=True)
    number = models.CharField(max_length=10, blank=True)
    text = models.TextField()
    answer = models.TextField(blank=True)
    marks = models.IntegerField(default=1)
    taxonomy = models.CharField(max_length=10, blank=True)
    type = models.CharField(max_length=20, choices=QUESTION_TYPES, default='mcq')
    topic = models.CharField(max_length=255, blank=True)
    
    options = models.JSONField(default=list, blank=True)
    clo_keys = models.JSONField(default=list, blank=True)
    mqf_keys = models.JSONField(default=list, blank=True)
    sub_questions = models.JSONField(default=list, blank=True)
    image_url = models.TextField(blank=True, null=True)
    figure_label = models.CharField(max_length=100, blank=True)
    
    # Frontend uses these fields for media type handling
    media_type = models.CharField(max_length=20, blank=True, null=True) # figure, table, table-figure
    answer_image_url = models.TextField(blank=True, null=True)
    answer_figure_label = models.CharField(max_length=100, blank=True)
    table_data = models.JSONField(default=dict, blank=True)
    construct = models.CharField(max_length=50, blank=True)
    domain = models.CharField(max_length=50, blank=True)

class AssessmentPaper(models.Model):
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_papers')
    created_at = models.DateTimeField(auto_now_add=True)
    
    header = models.JSONField()
    student_info = models.JSONField()
    footer = models.JSONField()
    instructions = models.JSONField(default=list)
    clo_definitions = models.JSONField(default=dict, blank=True)
    mqf_clusters = models.JSONField(default=dict, blank=True)
    matrix = models.JSONField(default=list, blank=True)
    
    questions = models.ManyToManyField(Question)

    status = models.CharField(max_length=20, default='draft', choices=[('draft', 'Draft'), ('reviewed', 'Reviewed'), ('endorsed', 'Endorsed')])

    class Meta:
        ordering = ['-created_at']
