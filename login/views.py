from django.shortcuts import render
from django.http import HttpResponse
from .models import *
#MAIL LIB
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random
def clear_sessions(request):
    try:
        request.session.clear()
        #return redirect('../../') 
        return HttpResponse("You are logged Out!")
    except:
        return HttpResponse("Unable to delete!")
def send_email(to_email):
    random_number = random.randint(100000, 999999)
    smtp_server = 'smtp.hostinger.com'
    smtp_port = 587
    sender_email = 'test@nextgenscminc.com'
    sender_password = '12@#ABcd12@#ABcd' 

    # Create the email
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = to_email
    msg['Subject'] = "OTP"
    msg.attach(MIMEText(str(random_number), 'plain'))

    try:
        # Connect to the server
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()  # Upgrade to secure connection
        server.login(sender_email, sender_password)  # Login
        server.send_message(msg)  # Send email
        return random_number
    except Exception as e:
        return None
    finally:
        server.quit() 


def login(request):
    if request.method == 'POST':
        
        action = request.POST.get('action')
        
        if action == "login":
            email = request.POST.get('email')
            password = request.POST.get('pass')
            
            
            try:
                user = Sign.objects.get(email=str(email))
                if(user.password==password):
                    request.session['lname'] = user.name
                    request.session['lemail'] = user.email
                    request.session['isLogged'] = True
                    return HttpResponse(1)
                else:

                    return HttpResponse(0)
            except:
                return HttpResponse(-1)
                
            
            
        elif action == "register_otp":
            email = request.POST.get('email')
            e=send_email(email)
          
            if(e is not None):
                request.session['reg_otp'] = e
                request.session['reg_email'] = email
                print(request.session.get('reg_otp'))
                return HttpResponse(1)
            else:
                return HttpResponse(0)
        elif action == "signup":
            email = request.POST.get('email')
            name = request.POST.get('name')
            pass_= request.POST.get('pass')
            otp = request.POST.get('otp')
            
            if(int(request.session['reg_otp'])==int(otp) and str(request.session['reg_email'])==str(email)):
                
                try:
                    user = Sign(name=name, email=email, password=pass_)
                    user.save()
                    return HttpResponse(1)
                except:
                    return HttpResponse(-1)
            else:
                return HttpResponse(0)
            
    context = {}
    return render(request, 'signup.html', context)
