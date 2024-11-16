from django.shortcuts import render
from django.http import HttpResponse
from .models import *
def home(request):
	name = request.session.get('lname', False)
	email = request.session.get('lemail', False)
	isLogged = request.session.get('isLogged', False)
	con={'name':name,'email':email,'isLogged':isLogged}
	return render(request, 'index.html', con)
def about(request):
	return render(request,"about.html")
def services(request):
	return render(request,"services.html")
def contact(request):
	return render(request,"contact.html")