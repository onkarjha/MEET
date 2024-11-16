from django.db import models

class Collab(models.Model):
    # Auto-incrementing primary key is the default behavior, so we don't need to define it explicitly
    # collab_id is a unique key\
    user_id = models.CharField(max_length=100)
    collab_id = models.CharField(max_length=100, unique=True)  # Unique collab ID field
    password = models.CharField(max_length=255)  # Password field, you might want to store hashed passwords in production

    def __str__(self):
        return self.collab_id
