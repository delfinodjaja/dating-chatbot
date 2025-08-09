# views.py
from django.http import  JsonResponse
from rest_framework.permissions import IsAuthenticated
from .form import UserRegistration
import json
import requests
import re
from .models import ChatbotItem
from django.contrib.auth import authenticate
from django.contrib.auth.forms import AuthenticationForm
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login_api(request):
    """API endpoint for user login"""
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({
            'success': False,
            'errors': {'non_field_errors': ['Username and password are required']}
        }, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(username=username, password=password)

    if user is not None:
        if user.is_active:
            refresh = RefreshToken.for_user(user)
            return Response({
                'success': True,
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'success': False,
                'errors': {'non_field_errors': ['User account is disabled']}
            }, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({
            'success': False,
            'errors': {'non_field_errors': ['Invalid username or password']}
        }, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def register_api(request):
    """API endpoint for user registration"""
    register_form = UserRegistration(request.data)

    if register_form.is_valid():
        user = register_form.save()
        refresh = RefreshToken.for_user(user)

        return Response({
            'success': True,
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        }, status=status.HTTP_201_CREATED)

    return Response({
        'success': False,
        'errors': register_form.errors
    }, status=status.HTTP_400_BAD_REQUEST)


# Alternative login using AuthenticationForm if you prefer
@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login_api_with_form(request):
    """Alternative API endpoint for user login using AuthenticationForm"""
    login_form = AuthenticationForm(data=request.data)

    if login_form.is_valid():
        user = login_form.get_user()
        refresh = RefreshToken.for_user(user)

        return Response({
            'success': True,
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        }, status=status.HTTP_200_OK)

    return Response({
        'success': False,
        'errors': login_form.errors
    }, status=status.HTTP_400_BAD_REQUEST)
@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_api(request):
    """API endpoint for user logout"""
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()

        return Response({
            'success': True,
            'message': 'Logged out successfully'
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


# Generate only (do NOT save)
@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_character(request):
    ollama_host = "http://localhost:11434/api/generate"
    model = "phi4-mini"

    personality = request.data.get('personality', "")
    gender = request.data.get('gender', "")

    payload = {
        "model": model,
        "prompt": (
            f"Create a richly detailed character profile for a {gender} with {personality}. "
            "The character should feel realistic, relatable, and unique. "
            "Include details such as upbringing, hobbies, favorite places, small habits or quirks, and how they typically interact with others. "
            "Favorite food should match their personality and background. "
            "Return ONLY a valid JSON object with the following keys: "
            "\"name\" (string), "
            "\"favorite_food\" (string), "
            "\"hobbies\" (array of strings), "
            "\"quirks\" (array of strings, small habits or unique behaviors), "
            "\"background\" (string, 4–6 sentences blending personality, life story, and key traits)."
        ),
        "stream": False,
        "options": {
            "temperature": 0.9,
            "num_ctx": 4096
        }
    }
    try:
        response = requests.post(ollama_host, json=payload)
        response.raise_for_status()
        data = response.json()
        generated_text = data.get("response", "").strip()

        json_match = re.search(r"\{.*\}", generated_text, re.DOTALL)
        if not json_match:
            return JsonResponse({"error": "No JSON found in AI response", "raw": generated_text}, status=500)

        character_data = json.loads(json_match.group(0))
        return JsonResponse(character_data)

    except requests.RequestException as e:
        return JsonResponse({"error": f"Ollama API error: {str(e)}"}, status=500)
    except json.JSONDecodeError as e:
        return JsonResponse({"error": f"JSON parse error: {str(e)}", "raw": generated_text}, status=500)


# Save character to DB (called when OK pressed)
@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_character(request):
    data = request.data
    try:
        quirks = data.get("quirks", [])
        hobbies = data.get("hobbies", [])

        # Convert lists to JSON strings
        if isinstance(quirks, list):
            quirks = json.dumps(quirks)
        if isinstance(hobbies, list):
            hobbies = json.dumps(hobbies)

        chatbot = ChatbotItem.objects.create(
            name=data.get("name", ""),
            favorite_food=data.get("favorite_food", ""),
            hobbies=hobbies,
            quirks=quirks,
            background=data.get("background", ""),
            personality=data.get("personality", ""),
            gender=data.get("gender", ""),
            created_by=request.user
        )
        return JsonResponse({"success": True, "id": chatbot.id})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

# Alternative non-streaming version for simpler React integration
@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_chatbot_simple(request):
    """Simple non-streaming AI chatbot endpoint"""
    dere_explanations = {
        "tsundere": "Acts cold, blunt, or irritated on the surface, but hides a warm and loving heart. Struggles to express affection directly and may get flustered easily.",
        "yandere": "You are an emotionally intense girl who is obsessed with the user, but never harms or threatens anyone. You express your feelings with jealousy and possessiveness, but in a cute and exaggerated way.",
        "kuudere": "Calm, quiet, and emotionally distant. Doesn't show much outward affection, but cares deeply in subtle ways. Speaks logically, but with quiet loyalty and protectiveness.",
        "deredere": "Loving, cheerful, and openly affectionate. Always upbeat and supportive, their love is warm, honest, and overflowing with positive energy.",
    }
    prompt = request.data.get("message", "")
    setting = request.data.get('setting',"")

    if not prompt:
        return Response({
            'error': 'Message is required'
        }, status=status.HTTP_400_BAD_REQUEST)

    ollama_host = "http://localhost:11434/api/generate"
    model = "phi4-mini"

    character_description = dere_explanations[setting]

    system_prompt = f"""
    You are a {setting} girl. {character_description}
    Speak in first person, do not talk like an assistant or AI.
    Stay in character and respond emotionally.
    Talk in a natural tone.
    Avoid using long message if possible.
    """

    payload = {
        "model": model,
        "prompt": prompt,
        "system": system_prompt,
        "stream": False,  # Non-streaming for simpler React integration
        "options": {
            "temperature": 0.3,
            "num_ctx": 4096
        }
    }

    try:
        response = requests.post(
            ollama_host,
            headers={"Content-Type": "application/json"},
            json=payload,
        )
        response.raise_for_status()

        data = response.json()
        ai_response = data.get("response", "")

        # Clean up the response and handle JSON parsing more robustly
        if ai_response:
            # Remove any potential formatting issues
            cleaned_response = ai_response.strip()

            # Try to parse as JSON if it looks like JSON
            if cleaned_response.startswith('{') and cleaned_response.endswith('}'):
                try:
                    parsed_json = json.loads(cleaned_response)
                    return Response({
                        'success': True,
                        'message': parsed_json.get('message', cleaned_response),
                        'parsed_data': parsed_json,
                        'raw_response': ai_response
                    })
                except json.JSONDecodeError as json_error:
                    # If JSON parsing fails, return the raw response
                    return Response({
                        'success': True,
                        'message': cleaned_response,
                        'raw_response': ai_response,
                        'json_error': f'JSON parsing failed: {str(json_error)}'
                    })
            else:
                # If it doesn't look like JSON, treat as plain text
                return Response({
                    'success': True,
                    'message': cleaned_response,
                    'raw_response': ai_response
                })
        else:
            return Response({
                'error': 'Empty response from AI model'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    except requests.exceptions.Timeout:
        return Response({
            'error': 'Connection timeout'
        }, status=status.HTTP_408_REQUEST_TIMEOUT)
    except requests.exceptions.RequestException as req_error:
        return Response({
            'error': f'Request failed: {str(req_error)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        return Response({
            'error': f'Unexpected error: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)