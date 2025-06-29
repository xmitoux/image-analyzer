from django.urls import path

from . import views

urlpatterns = [
    path('hello/', views.hello_world, name='hello-world'),
    path('analyze/', views.analyze_image, name='analyze-image'),
    path('analyze/vision/', views.analyze_image_vision_api,
         name='analyze-image-vision'),
    path('test/vision/', views.test_vision_quickstart,
         name='test-vision-quickstart'),
    path('test/base64/', views.test_base64_image, name='test-base64-image'),
]
