# admin.py

from django.contrib import admin
from .models import *


class SignAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'password')  # Add the fields you want to display

# Register your model with the custom admin class
admin.site.register(Sign, SignAdmin)