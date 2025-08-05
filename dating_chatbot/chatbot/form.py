from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm

class Login(AuthenticationForm):
    username = forms.CharField(widget=forms.TextInput(attrs={
        'placeholder': 'John Doe',
        'class': 'w-full bg-gray-800/60 placeholder-gray-500 px-10 py-2.5 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 ring-indigo-500',
    }))
    password = forms.CharField(widget=forms.PasswordInput(attrs={
        'placeholder': '••••••••',
        'class': 'w-full bg-gray-800/60 placeholder-gray-500 px-10 py-2.5 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 ring-indigo-500',
    }))

class UserRegistration(UserCreationForm):
    email = forms.EmailField(widget=forms.EmailInput(attrs={
        'placeholder': 'you@factory.com',
        'class': 'w-full bg-gray-800/60 placeholder-gray-500 px-10 py-2.5 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 ring-indigo-500',
    }))

    username = forms.CharField(widget=forms.TextInput(attrs={
        'placeholder': 'Jane Doe',
        'class': 'w-full bg-gray-800/60 placeholder-gray-500 px-10 py-2.5 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 ring-indigo-500',
    }))

    password1 = forms.CharField(widget=forms.PasswordInput(attrs={
        'placeholder': '••••••••',
        'class': 'w-full bg-gray-800/60 placeholder-gray-500 px-10 py-2.5 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 ring-indigo-500',
    }))

    password2 = forms.CharField(widget=forms.PasswordInput(attrs={
        'placeholder': '••••••••',
        'class': 'w-full bg-gray-800/60 placeholder-gray-500 px-10 py-2.5 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 ring-indigo-500',
    }))

    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']