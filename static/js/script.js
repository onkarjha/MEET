$(document).ready(function() {
    $(".signup").click(function(e) {
        e.preventDefault();
        $(".signup_form").show();
        $(".login_form").hide();
    });
    $(".login").click(function(e) {
        e.preventDefault();
        $(".signup_form").hide();
        $(".login_form").show();
    });
    $(".login_").on('submit', function(e) {
        e.preventDefault();
        /********************************* */
        var formData = new FormData(this);
        formData.append('action', 'login');
        var csrfToken = $('meta[name="csrf-token"]').attr('content');
        /********************************* */
        $.ajax({
            type: 'POST',
            url: "",
            data: formData,
            processData: false, 
            contentType: false,
            headers: {
                'X-CSRFToken': csrfToken
            },
            success: function(response) {
                if(response==0){
                    alert("Invalid Credentials!");
                }
                else if(response==-1){
                    alert("Invalid Credentials!");
                }
                else if(response==1){
                    window.location.href="/";
                }
                
            },
            error: function(xhr) {}
        });
        /********************************* */
    });
    $(".signup_").on('submit', function(e) {
        e.preventDefault();
        /********************************* */
        var formData = new FormData(this);
        formData.append('action', 'signup');
        var csrfToken = $('meta[name="csrf-token"]').attr('content');
        /********************************* */
        $.ajax({
            type: 'POST',
            url: "",
            data: formData,
            processData: false, 
            contentType: false,
            headers: {
                'X-CSRFToken': csrfToken
            },
            success: function(response) {
                if(response==0){
                    alert("OTP or Email ID did not match!");
                }
                else if(response==-1){
                    alert("Your Email already present in Database");
                }
                else if(response==1){
                    alert("Registration Successful!");
                }
                
            },
            error: function(xhr) {}
        });
        /********************************* */
    });
    $(".register_otp").click(function(){
        $(".sign_otp_button").text("Sending Email....");
       var email=$(".signup_email").val();
       var form = document.querySelector('.signup_');
       var formData = new FormData(form);
       formData.append('action', 'register_otp');
       formData.append('email', email);
       var csrfToken = $('meta[name="csrf-token"]').attr('content');
       $.ajax({
        type: 'POST',
        url: "",
        data: formData,
        processData: false, 
        contentType: false,
        headers: {
            'X-CSRFToken': csrfToken
        },
        success: function(response) {
            if(response==1){
                $(".sign_otp_button").hide();$(".sign_btn").removeClass('hide');
                alert("Email Sent!");
            }else{
                $(".sign_otp_button").text("Get Otp");
                alert("Some Error Occured!");
            }
            
        },
        error: function(xhr) {}
    });
    /********************************* */
    });
    




    $(".enter_collab").on('submit', function(e) {
        e.preventDefault();
        /********************************* */
        var formData = new FormData(this);
        formData.append('action', 'enter_collab');
        var csrfToken = $('meta[name="csrf-token"]').attr('content');
        /********************************* */
        $.ajax({
            type: 'POST',
            url: "",
            data: formData,
            processData: false, 
            contentType: false,
            headers: {
                'X-CSRFToken': csrfToken
            },
            success: function(response) {
                if(response==1){
                    window.location.href="/collab/host";
                }
                
                else{
                    alert(response);
                }
                
            },
            error: function(xhr) {}
        });
        /********************************* */
    });
    $(".create_collab").on('submit', function(e) {
        e.preventDefault();
        var pass_=$(".pass_").val();
     var collab_=$(".collab_").val();
        /********************************* */
        var formData = new FormData(this);
        formData.append('action', 'create_collab');
        var csrfToken = $('meta[name="csrf-token"]').attr('content');
     
        /********************************* */
        $.ajax({
            type: 'POST',
            url: "",
            data: formData,
            processData: false, 
            contentType: false,
            headers: {
                'X-CSRFToken': csrfToken
            },
            success: function(response) {
                if(response==1){
                    $(".noti_").append('<div class="alert alert-success">'+window.location.protocol+"//"+window.location.host+'/collab/check/?id='+collab_+'&pass='+pass_+'</div>');
                }
                
                else {
                    alert(response);
                }
                
            },
            error: function(xhr) {}
        });
        /********************************* */
    });
});