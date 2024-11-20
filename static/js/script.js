$(document).ready(function() {
    $('.sign_otp_button').prop('disabled', true);
    $(".login_btn").prop('disabled', true);
    function validateName(name) {
        const trimmedName = name.trim();
        const regex = /^[A-Za-z\s]+$/;
        if (!regex.test(trimmedName)) {
            return "Name must contain only letters and spaces!";
        }
        const words = trimmedName.split(/\s+/);
        if (words.length < 2) {
            return "Name must contain at least 2 words!";
        }

        for (let word of words) {
            if (word.length <= 2) {
                return "Each word must have more than 2 characters!";
            }
        }
        return 1;
    }

    function validateEmail(email) {
        const emailRegex = /^[a-zA-Z][a-zA-Z0-9._%+-]*@gmail\.com$/;

        if (!emailRegex.test(email)) {
            return "Please enter a valid Gmail address.";
        }
        return 1;
    }

    function validatePassword(password) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;"'<>,.?\/\\|-]).{8,}$/;
        if (!passwordRegex.test(password)) {
            return "Password must contain at least one uppercase letter, one lowercase letter, one digit, one special character, and be at least 8 characters long.";
        }
        return 1;
    }
    $(".signup_name,.signup_email,.signup_pass").keyup(function() {
        if (validateName($(".signup_name").val()) == 1 && validateEmail($(".signup_email").val()) == 1 && validatePassword($(".signup_pass").val()) == 1) {
            $('.sign_otp_button').prop('disabled', false);
        } else {

            $('.sign_otp_button').prop('disabled', true);
        }
    });  $(".login_email,.login_pass").keyup(function() {
        if (validateEmail($(".login_email").val()) == 1 && validatePassword($(".login_pass").val()) == 1) {
            $('.login_btn').prop('disabled', false);
        } else {

            $('.login_btn').prop('disabled', true);
        }
    });
    $(".signup_name").keyup(function() {

        var name = $(".signup_name").val();
        var n_ = validateName(name);
        if (n_ == 1) {
            $(".name_vali").text("");
        } else {
            $(".name_vali").text(n_);
        }
    });

    $(".signup_email").keyup(function() {

        var name = $(".signup_email").val();
        var n_ = validateEmail(name);
        if (n_ == 1) {
            $(".email_vali").text("");
        } else {
            $(".email_vali").text(n_);
        }
    });

    $(".signup_pass").keyup(function() {

        var name = $(".signup_pass").val();
        var n_ = validatePassword(name);
        if (n_ == 1) {
            $(".pass_vali").text("");
        } else {
            $(".pass_vali").text(n_);
        }
    });$(".login_email").keyup(function() {

        var name = $(".login_email").val();
        var n_ = validateEmail(name);
        if (n_ == 1) {
            $(".email_vali").text("");
        } else {
            $(".email_vali").text(n_);
        }
    });

    $(".login_pass").keyup(function() {

        var name = $(".login_pass").val();
        var n_ = validatePassword(name);
        if (n_ == 1) {
            $(".pass_vali").text("");
        } else {
            $(".pass_vali").text(n_);
        }
    });
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
                if (response == 0) {
                    alert("Invalid Credentials!");
                } else if (response == -1) {
                    alert("Invalid Credentials!");
                } else if (response == 1) {
                    window.location.href = "/";
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
                if (response == 0) {
                    alert("OTP or Email ID did not match!");
                } else if (response == -1) {
                    alert("Your Email already present in Database");
                } else if (response == 1) {
                    alert("Registration Successful!");
                }

            },
            error: function(xhr) {}
        });
        /********************************* */
    });
    $(".register_otp").click(function() {
        $(".sign_otp_button").text("Sending Email....");
        var email = $(".signup_email").val();
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
                if (response == 1) {
                    $(".sign_otp_button").hide();
                    $(".sign_btn").removeClass('hide');
                    alert("Email Sent!");
                } else {
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
                if (response == 1) {
                    window.location.href = "/collab/host";
                } else {
                    alert(response);
                }

            },
            error: function(xhr) {}
        });
        /********************************* */
    });
    $(".create_collab").on('submit', function(e) {
        e.preventDefault();
        var pass_ = $(".pass_").val();
        var collab_ = $(".collab_").val();
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
                if (response == 1) {
                    $(".noti_").append('<div class="alert alert-success">' + window.location.protocol + "//" + window.location.host + '/collab/check/?id=' + collab_ + '&pass=' + pass_ + '</div>');
                } else {
                    alert(response);
                }

            },
            error: function(xhr) {}
        });
        /********************************* */
    });
});