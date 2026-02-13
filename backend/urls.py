
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BrandingViewSet, CourseViewSet, QuestionViewSet, AssessmentPaperViewSet, login_view

router = DefaultRouter()
router.register(r'branding', BrandingViewSet)
router.register(r'courses', CourseViewSet)
router.register(r'questions', QuestionViewSet)
router.register(r'papers', AssessmentPaperViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/login/', login_view, name='login'),
]
