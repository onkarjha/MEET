from django.contrib import admin
from django.urls import path
from .import views
urlpatterns = [
    
    path('', views.home,name="home"),
   
    path('about/', views.about,name=""),
    path('services/', views.services,name=""),
    path('contact/', views.contact,name=""),

]
