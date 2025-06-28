from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['GET'])
def hello_world(request):
    return Response({
        'message': 'Hello World from Django API! 🎉',
        'status': 'success',
        'data': {
            'version': '1.0.0',
            'project': 'Image Analyzer'
        }
    })
