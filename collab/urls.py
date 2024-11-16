from django.urls import path
from . import views  # This line imports views.py from the same directory

urlpatterns = [
    path('check/', views.check,name="check"),
    path('check_create/', views.check4create,name="check4create"),
     path('host/', views.host,name="host"),  # Use the correct view function name
    
]
