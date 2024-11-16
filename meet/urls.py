from django.contrib import admin
from django.urls import path,include
from .views import *
urlpatterns = [
    path('admin_panel', admin.site.urls),
    path('auth/', include('login.urls')),
    path('collab/', include('collab.urls')),
    
    path('', include('home.urls')),
    path('about/', include('home.urls')),
    path('services/', include('home.urls')),
    path('contact/', include('home.urls')),
    
    
]
