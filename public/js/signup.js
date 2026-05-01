
var input = document.querySelector("#phone-number-input");
var iti = window.intlTelInput(input, {
  initialCountry: "dz",
  separateDialCode: true,
});

input.addEventListener("countrychange", function () {
  var countryCode = iti.getSelectedCountryData().dialCode;
});

document.querySelector('.pictChange').addEventListener('click',function(){
  document.getElementById('profileImage').click();
})

document.getElementById("profileImage").addEventListener('change', function() {
    const file = this.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById("pictChange").setAttribute('src',e.target.result);
    };
    reader.readAsDataURL(file);
});

function remove(){
  document.querySelectorAll('.btin').forEach(bt=>{
      bt.parentElement.parentElement.removeChild(bt.parentElement)
  })
}