from django.shortcuts import render,redirect
from django.http import HttpResponse
from .models import *
def chat(request):
    return render(request, 'chat.html')
def check(request):
    isLogged = request.session.get('isLogged', False)
    
    
        
    if request.method=="POST":
        
        action = request.POST.get('action')
        
        if action == "enter_collab":
            collab_id = request.POST.get('collab_id')
            password = request.POST.get('password')
            
            try:
                if(isLogged):
                    user = Collab.objects.get(collab_id=collab_id)
                    if(user.password==password):
                        request.session['collab_id'] = user.collab_id
                        return HttpResponse(1)
                    else:
                        return HttpResponse("Either Collab ID or password is wrong!")
                else:
                    return HttpResponse("Please Login first!")
            except Exception as e:
       
                print(e)
                return HttpResponse("Some error occured!")
        else:
            return HttpResponse("Error in POST data!")
            
    else:
        isLogged = request.session.get('isLogged', False)
        if (isLogged):
            id = request.GET.get('id', 0)
            pass_=request.GET.get('pass', 0)
            if(id!=0 and pass_!=0):
                return render(request, 'id_pass.html',{'id':id,'pass':pass_,'isLogged':isLogged})
            else:
                return render(request, 'id_pass.html',{'isLogged':isLogged})
        else:
            return redirect('../../auth/login') 
def check4create(request):
    isLogged = request.session.get('isLogged', False)
     
    if request.method=="POST":
        action = request.POST.get('action')
        if action == "create_collab":
            collab_id = request.POST.get('collab_id')
            password = request.POST.get('password')
            print(collab_id)
            print(password)
            try:
                
                if(isLogged):
                    print("user:",request.session.get('collab_id', False))
                    user = Collab(collab_id=collab_id, password=password,user_id=request.session.get('lemail', False))
                    user.save()
                    return HttpResponse(1)
                else:
                    return HttpResponse("Please Login first!")
            except Exception as e:
        # Log the error (optional but useful)
                print(f"Error creating collab: {e}")
                return HttpResponse("Try Again!")
        else:
            return HttpResponse(0)
            
    else:
        
        if (isLogged):
            return render(request, 'create_collab.html', {'isLogged':isLogged})
        else:
            return redirect('../../auth/login') 
def host(request):
    print(request.session.get('collab_id', False))
    return render(request,"host.html",{'collab_id':request.session.get('collab_id', False),'sender':request.session.get('lemail', False),'sender_name':request.session.get('lname',False)})