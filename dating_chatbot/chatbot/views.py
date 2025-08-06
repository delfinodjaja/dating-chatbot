# views.py
from django.shortcuts import redirect
from django.contrib.auth import login, logout
from django.http import StreamingHttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.generic import View
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .form import UserRegistration, Login
import json
import requests


# Authentication API endpoints
@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login_api(request):
    """API endpoint for user login"""
    login_form = Login(request, data=request.data)

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


@method_decorator(csrf_exempt, name='dispatch')
class AIChatbotView(View):
    """AI Chatbot streaming endpoint for React"""

    def get(self, request):
        # Check authentication (optional - remove if you want public access)
        if not request.user.is_authenticated:
            return JsonResponse({
                'error': 'Authentication required'
            }, status=401)

        prompt = request.GET.get("message", "")
        setting = request.GET.get("behavior")

        if not prompt:
            return JsonResponse({
                'error': 'Message parameter is required'
            }, status=400)

        def event_stream():
            ollama_host = "http://localhost:11434/api/generate"
            model = "phi4-mini"
            system_prompt = f"You are a {setting} woman who plays the role of the user's girlfriend."

            payload = {
                "model": model,
                "prompt": prompt,
                "system": system_prompt,
                "format": "json",
                "stream": True,
                "options": {
                    "temperature": 0.3,
                    "num_ctx": 4096
                }
            }

            try:
                with requests.post(
                        ollama_host,
                        headers={"Content-Type": "application/json"},
                        json=payload,
                        stream=True,
                        timeout=30
                ) as response:
                    response.raise_for_status()

                    buffer = ""
                    for line in response.iter_lines(decode_unicode=True):
                        if line:
                            try:
                                data = json.loads(line)
                                token = data.get("response", "")
                                buffer += token

                                yield f"data: {json.dumps({'chunk': token})}\n\n"

                            except json.JSONDecodeError:
                                continue

                    # Try to parse final buffer
                    try:
                        parsed_json = json.loads(buffer)
                        yield f"data: {json.dumps({'form': parsed_json, 'complete': True})}\n\n"
                    except json.JSONDecodeError as e:
                        yield f"data: {json.dumps({'error': f'Could not parse final JSON: {str(e)}'})}\n\n"

            except requests.exceptions.Timeout:
                yield f"data: {json.dumps({'error': 'Connection timeout'})}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
            finally:
                yield "event: close\ndata: {}\n\n"

        response = StreamingHttpResponse(event_stream(), content_type="text/event-stream")
        response['Cache-Control'] = 'no-cache'
        response['Access-Control-Allow-Origin'] = '*'  # Configure properly for production
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        return response


# Alternative non-streaming version for simpler React integration
@csrf_exempt
@api_view(['POST'])
#@permission_classes([IsAuthenticated])
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