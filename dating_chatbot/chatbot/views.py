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

        if not prompt:
            return JsonResponse({
                'error': 'Message parameter is required'
            }, status=400)

        def event_stream():
            ollama_host = "http://localhost:11434/api/generate"
            model = "phi4-mini"
            system_prompt = "You are a tsundere girl"

            payload = {
                "model": model,
                "prompt": f"Create form for: {prompt}",
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
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_chatbot_simple(request):
    """Simple non-streaming AI chatbot endpoint"""
    prompt = request.data.get("message", "")

    if not prompt:
        return Response({
            'error': 'Message is required'
        }, status=status.HTTP_400_BAD_REQUEST)

    ollama_host = "http://localhost:11434/api/generate"
    model = "phi4-mini"
    system_prompt = "You are a tsundere girl"

    payload = {
        "model": model,
        "prompt": f"Create form for: {prompt}",
        "system": system_prompt,
        "format": "json",
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
            timeout=30
        )
        response.raise_for_status()

        data = response.json()
        ai_response = data.get("response", "")

        try:
            parsed_form = json.loads(ai_response)
            return Response({
                'success': True,
                'form': parsed_form,
                'raw_response': ai_response
            })
        except json.JSONDecodeError:
            return Response({
                'success': True,
                'raw_response': ai_response,
                'error': 'Could not parse as JSON'
            })

    except requests.exceptions.Timeout:
        return Response({
            'error': 'Connection timeout'
        }, status=status.HTTP_408_REQUEST_TIMEOUT)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)