
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .models import InstitutionalBranding, Course, Question, AssessmentPaper, UserProfile
from .serializers import BrandingSerializer, CourseSerializer, QuestionSerializer, AssessmentPaperSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    
    if not user:
        # Mock login for demonstration if no users exist in DB yet
        # Roles: creator, reviewer, endorser, admin
        # Positions: Lecturer, Coordinator, Head of Programme, Head of Department
        if username in ['creator', 'reviewer', 'endorser', 'admin'] and password == 'password':
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                user = User.objects.create_user(username=username, password='password')
                
                role = username
                full_name = f"Demo {username.title()}"
                
                if username == 'creator':
                    position = "Lecturer"
                elif username == 'reviewer':
                    position = "Coordinator"
                elif username == 'endorser':
                    position = "Head of Programme"
                    full_name = "Dr. Academic Endorser"
                elif username == 'admin':
                    position = "IT Unit Administrator"
                    full_name = "System Administrator"
                else:
                    position = "Academic Staff"
                    
                UserProfile.objects.create(user=user, role=role, full_name=full_name, position=position)
        else:
            return Response({'error': 'Invalid Credentials'}, status=status.HTTP_400_BAD_REQUEST)
    
    token, _ = Token.objects.get_or_create(user=user)
    
    # Get or create profile
    try:
        profile = user.profile
    except UserProfile.DoesNotExist:
        profile = UserProfile.objects.create(user=user, role='creator', full_name=user.username, position='Lecturer')

    return Response({
        'token': token.key,
        'user': {
            'username': user.username,
            'role': profile.role,
            'full_name': profile.full_name,
            'position': profile.position
        }
    })

class BrandingViewSet(viewsets.ModelViewSet):
    queryset = InstitutionalBranding.objects.all()
    serializer_class = BrandingSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        if not queryset.exists():
            default = InstitutionalBranding.objects.create(
                institution_name="POLITEKNIK MALAYSIA KUCHING SARAWAK"
            )
            return Response([BrandingSerializer(default).data])
        return super().list(request, *args, **kwargs)

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer

class AssessmentPaperViewSet(viewsets.ModelViewSet):
    queryset = AssessmentPaper.objects.all()
    serializer_class = AssessmentPaperSerializer

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(created_by=self.request.user)
        else:
            serializer.save()

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        if 'questions' in data and isinstance(data['questions'], list):
            data['question_ids'] = [q.get('id') for q in data['questions'] if isinstance(q, dict) and q.get('id')]
            
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
