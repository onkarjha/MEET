# admin.py

from django.contrib import admin
from .models import *


class CollabAdmin(admin.ModelAdmin):
    list_display = ('collab_id', 'password')  # Add the fields you want to display

# Register your model with the custom admin class
admin.site.register(Collab, CollabAdmin)