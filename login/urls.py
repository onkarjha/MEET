from django.urls import path
from . import views  # This line imports views.py from the same directory

urlpatterns = [
    path('login/', views.login,name="in"),  # Use the correct view function name
    path('logout/', views.clear_sessions,name="out"),  # Use the correct view function name
]
