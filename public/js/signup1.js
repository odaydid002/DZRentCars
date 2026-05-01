const userForm = document.getElementById('signupForm')

userForm.addEventListener('submit', function (e) {
    const errors = [];

    if (!isValidPassword(pass.value)) {
        errors.push("Password isn't strong enough");
        inputErrors("Password", checkPasswordStrength(pass.value));
    }

    if (pass.value !== rePassword.value) {
        errors.push("Passwords do not match");
        inputErrors("Password Confirmation", ["Passwords do not match"]);
    }

    if (!isUsername(username.value)) {
        errors.push("Invalid Username");
        inputErrors("Username", checkUsername(username.value));
    }

    if (!isName(Fname.value)) {
        errors.push("Invalid First Name");
        inputErrors("First Name", checkName(Fname.value));
    }

    if (!isName(Lname.value)) {
        errors.push("Invalid Last Name");
        inputErrors("Last Name", checkName(Lname.value));
    }

    if (!isValidPhone(phone.value)) {
        errors.push("Invalid Phone Number");
        inputErrors("Phone", checkPhone(phone.value));
    }

    if (errors.length > 0) {
        e.preventDefault();
        errors.forEach(err=>{
            pushNotif("e", err);
        })
    }else{
        openLoader()
    }
});

var input = document.querySelector("#phone-number-input");
var iti = window.intlTelInput(input, {
  initialCountry: "dz",
  separateDialCode: true,
});

document.querySelector("#phone-country-code").value = iti.getSelectedCountryData().dialCode;

input.addEventListener("countrychange", function () {
  var countryCode = iti.getSelectedCountryData().dialCode;
  document.querySelector("#phone-country-code").value = countryCode
});

document.querySelector('.pictChange').addEventListener('click',function(){
  document.getElementById('image').click();
})

var file

document.getElementById("image").addEventListener('change', function() {
    openLoader()
    file = this.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById("pictChange").setAttribute('src',e.target.result);
        closeLoader()
    };
    reader.readAsDataURL(file);
});

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (!token) {
        window.location.href = "login";
        return;
    }

    try {
        openLoader()
        const response = await fetch(`${window.location.origin}/api/email/verify-token?token=` + token);
        const data = await response.json();

        if (response.ok) {
            const email = data.email;
            localStorage.setItem("userEmail", email);
            document.getElementById("email").value = email;
            document.getElementById("emailo").value = email;
            closeLoader()
        } else {
            closeLoader()
            throw new Error(data.error || "Invalid token");
        }
    } catch (error) {
        console.error("Token verification failed:", error);
        window.location.href = "login";
        closeLoader()
    }
});

const country = document.getElementById('state');
const wilayas = document.getElementById('wilayas');
const cityDatalist = document.getElementById('cities');

country.addEventListener('change', async () => {
    const userValue = country.value;
    const options = Array.from(wilayas.options).map(option => option.value);

    if (options.includes(userValue)) {
        try {
            const response = await fetch(`${window.location.origin}/city/${userValue}`);
            const cities = await response.json(); 

            cityDatalist.innerHTML = '';

            cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city.name;
                cityDatalist.appendChild(option);
            });

        } catch (error) {
            pushNotif("e", "Something went wrong");
        }
    } else {
        console.log('User entered a custom value:', userValue);
    }
});

validInput("password", "p")
validInput("username", "u")
validInput("Fname", "n")
validInput("Lname", "n")
validInput("Lname", "n")
validInput("zcode", "z")
validInput("phone-number-input", "ph")

const pass = document.getElementById('password')
pass.addEventListener('change', ()=>{
    if(!isValidPassword(pass.value))
    inputErrors("Your password isn't strong enough", checkPasswordStrength(pass.value));
})

const username = document.getElementById('username')
username.addEventListener('change', ()=>{
    if (!isUsername(username.value)) {
        inputErrors("Invalid Username", checkUsername(username.value));
    }    
})

const Fname = document.getElementById('Fname')
Fname.addEventListener('change', ()=>{
    if (!isName(Fname.value)) {
        inputErrors("Invalid First name", checkName(Fname.value));
    }    
})

const Lname = document.getElementById('Lname')
Lname.addEventListener('change', ()=>{
    if (!isName(Fname.value)) {
        inputErrors("Invalid Last name", checkName(Fname.value));
    }    
})

const phone = document.getElementById('phone-number-input')
phone.addEventListener('change', ()=>{
    if (!isValidPhone(phone.value)) {
        inputErrors("Invalid Phone number", checkPhone(phone.value));
    }    
})

const rePassword = document.getElementById('rePassword');
rePassword.addEventListener('change', ()=>{
    const matchErrors = checkPasswordMatch(pass.value, rePassword.value);
    if (matchErrors.length > 0) {
        inputErrors("Password Confirmation", matchErrors);
    }
})

rePassword.addEventListener('input', ()=>{
    isValid = pass.value == rePassword.value
    rePassword.style.border = isValid
    ? "2px solid var(--border-low)"
    : "2px solid rgba(235, 34, 34, 0.586)";
})

document.getElementById('passHide').addEventListener('change', ()=>{
    test = document.getElementById('passHide').checked
    if(test){
        pass.setAttribute('type', "text")
        document.getElementById("rePassword").setAttribute('type', "text")
    }else{
        pass.setAttribute('type', "password")
        document.getElementById("rePassword").setAttribute('type', "password")

    }
})

