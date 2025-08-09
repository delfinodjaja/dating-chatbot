from django.urls import path
from . import views

urlpatterns = [
    # Authentication endpoints
    path('api/auth/login/', views.login_api, name='login_api'),
    path('api/auth/register/', views.register_api, name='register_api'),
    path('api/auth/logout/', views.logout_api, name='logout_api'),

    # AI Chatbot endpoints
    path('api/chatbot/simple/', views.ai_chatbot_simple, name='ai_chatbot_simple'),
    path('api/chatbot/create',views.create_chatbot, name='create_chatbot')
]