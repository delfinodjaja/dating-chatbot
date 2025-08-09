from django.db import models
from django.contrib.auth.models import User


# Create your models here.
class ChatbotItem(models.Model):
    name = models.CharField(max_length=225, unique=True,null=True)
    personality = models.CharField(max_length=225, unique=True,null=True)
    gender = models.CharField(max_length=225, unique=False,null=True)
    quirks = models.CharField(max_length=225, unique=False,null=True)
    favorite_food = models.CharField(max_length=225, unique=False,null=True)
    hobbies = models.CharField(max_length=225, unique=False,null=True)
    background = models.CharField(max_length=500, unique=False,null=True)
    love_meter = models.IntegerField(default=0)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="chatbots",null=True)


    def __str__(self):
        return self.name

class Personality(models.Model):
    name = models.CharField(max_length=225)

    def __str__(self):
        return self.name

class Gender(models.Model):
    zone = models.CharField(max_length=225)

    def __str__(self):
        return self.zone



