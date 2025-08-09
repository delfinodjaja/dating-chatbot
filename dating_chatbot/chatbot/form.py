from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from .models import ChatbotItem

class Login(AuthenticationForm):
    username = forms.CharField(widget=forms.TextInput())
    password = forms.CharField(widget=forms.PasswordInput())


class UserRegistration(UserCreationForm):
    email = forms.EmailField(required=True, widget=forms.EmailInput(attrs={'autocomplete': 'email'}))

    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']

class ChatbotCreationForm():
    class Meta:
        model = ChatbotItem
        fields = ['name', 'personality', 'gender', 'background', 'love_meter']