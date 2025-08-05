from django.urls import path
from .views import ai_chatbot

urlpatterns = [
    path('chatbot/',ai_chatbot.as_view,name="chatbot")
]