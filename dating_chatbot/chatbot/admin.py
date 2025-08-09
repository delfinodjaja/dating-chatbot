from django.contrib import admin
from .models import ChatbotItem, Personality, Gender

# Register your models here.
admin.site.register(ChatbotItem)
admin.site.register(Personality)
admin.site.register(Gender)


