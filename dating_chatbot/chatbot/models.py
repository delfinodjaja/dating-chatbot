from django.db import models

# Create your models here.
class ChatbotItem(models.Model):
    name = models.CharField(max_length=225, unique=True)
    personality = models.ForeignKey('Personality', on_delete=models.SET_NULL,blank=True,null=True)
    gender = models.ForeignKey('Gender', on_delete=models.SET_NULL,blank=True,null=True)
    background = models.CharField(max_length=500, unique=False)
    love_meter = models.IntegerField(default=0)



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



