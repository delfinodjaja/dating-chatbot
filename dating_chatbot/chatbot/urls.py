from django.urls import path
from . import views

urlpatterns = [
    # Authentication endpoints
    path('api/auth/login/', views.login_api, name='login_api'),
    path('api/auth/register/', views.register_api, name='register_api'),
    path('api/auth/logout/', views.logout_api, name='logout_api'),

    # AI Chatbot endpoints
    path('api/chatbot/simple/', views.ai_chatbot_simple, name='ai_chatbot_simple'),
    path('api/chatbot/save_character/',views.save_character, name='save_character'),
    path('api/chatbot/generate_character/', views.generate_character, name='generate_character'),

    path('api/chatbot/get_list/', views.get_bot_list, name='get_list'),

    path('chatbot/delete/<int:chat_id>/', views.delete_chat, name='delete_chat'),


]
