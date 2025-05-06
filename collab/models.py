from django.db import models

class Collab(models.Model):
   
    user_id = models.CharField(max_length=100)
    collab_id = models.CharField(max_length=100, unique=True)  # Unique collab ID field
    password = models.CharField(max_length=255)  # Password field, you might want to store hashed passwords in production
    participants = models.IntegerField(default=0)
    def __str__(self):
        return self.collab_id
