from django.urls import path

from . import views

urlpatterns = [
    path('hello/', views.hello_world, name='hello-world'),
    path('analyze/', views.analyze_image, name='analyze-image'),
    path('analyze-mock/', views.analyze_image_mock, name='analyze-image-mock'),
]
