function previewImage(inputId) {
    const input = document.getElementById(inputId);
    const img = document.createElement('img');

    input.addEventListener("change", function () {
    const file = input.files[0];
    if (file) {
        img.src = URL.createObjectURL(file);
        img.onload = () =>{
            Array.from(input.parentElement.children).forEach(child=>child.remove)
            input.parentElement.appendChild(img)
            input.parentElement.style.border = "none"
        }
    }
    });
}

previewImage("image");
previewImage("prevImage1Inp");
previewImage("prevImage2Inp");
previewImage("prevImage3Inp");

document.querySelector('.add-vehicle-form').addEventListener('submit', openLoader)