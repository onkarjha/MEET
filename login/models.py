# models.py

from django.db import models

class Sign(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)  # Consider using a hashed password in practice
    #class Meta:
     #   db_table = 'Sign'
    def __str__(self):
        return self.name
