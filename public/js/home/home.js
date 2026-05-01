let dtrtoday = new Date();

let pastDate = new Date();
pastDate.setDate(dtrtoday.getDate() + 10);

let nextDate = new Date();
nextDate.setDate(dtrtoday.getDate() + 2);

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

const pickupDate = document.getElementById('pickupDate')
const returnDate = document.getElementById('returnDate')

pickupDate.value = fd(dtrtoday)
returnDate.value = fd(nextDate)

function fd(date){
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

flatpickr("#dateRange", {
    mode: "range",
    dateFormat: "Y-m-d",
    altInput: true,
    altFormat: "d M",
    defaultDate: [fd(dtrtoday), fd(nextDate)],
    minDate: fd(dtrtoday),
    onChange: function(selectedDates) {
        if (selectedDates[0]) {
            document.getElementById('pickupDate').value = formatDate(selectedDates[0]);
        }
        if (selectedDates[1]) {
            document.getElementById('returnDate').value = formatDate(selectedDates[1]);
        }
    }
});

gsap.set(".title", { y: 0, opacity: 1 });

gsap.from(".title", {
    y: -200,
    duration: 0.5,
    opacity: 0,
    stagger: 0.1
});

gsap.set(".options label", {
     y: 0,
     opacity: 1 
});

gsap.from(".options label", {
    y: -200,
    duration: 1,
    opacity: 0,
    stagger: 0.1
});

gsap.set(".pop-car-container", { y: 0, opacity: 1});

gsap.from(".pop-car-container", {
    y: 100,
    stagger: 0.2,
    opacity: 0,
    delay: 0.5
});

gsap.set(".clc-car-container", { y: 0, opacity: 1});

gsap.from(".clc-car-container", {
    y: 100,
    stagger: 0.2,
    opacity: 0,
    scrollTrigger: {
        scrub: 1,
        start: "center center",
        scroller: "#homeDoc"
    }
});

gsap.set(".review-container", { scale: 1, opacity: 1});

gsap.from(".review-container", {
    scale: 0,
    stagger: 0.5,
    opacity: 0,
    delay: 1,
    scrollTrigger: {
        scrub: 1,
        start: "bottom top",
        scroller: "#homeDoc"
    }
});

const content = document.querySelector(".reviews-container");
let distance = content.scrollWidth /2;

gsap.to(".review-container", {
    x: -distance,
    duration: 50,
    ease: "linear",
    repeat: -1,
    onRepeat: function() {
    gsap.set(".review-container", { x: 0 }); 
    }
});

const carBrand = document.getElementById('carBrand')
const carModel = document.getElementById('carModel')
const pickLocation = document.getElementById('pickLocation')
carBrand.addEventListener('change', async () => {
    const brandId = carBrand.value;
    try {
        openLoader()
        const response = await fetch(`${window.location.origin}/api/vehicles/brands/models/${brandId}`);
        const models = await response.json(); 
        closeLoader()
        
        carModel.innerHTML = '<option value="any">any</option>';
        
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.model;
            option.textContent = model.model;
            carModel.appendChild(option);
        });

    } catch (error) {
        pushNotif("e", "Something went wrong");
    }
});

document.getElementById('searchOpt').addEventListener('click', ()=>{
    fBrand = carBrand.options[carBrand.selectedIndex].innerText.replace(/\s+/g, '')
    fModel = carModel.value.replace(/\s+/g, '')
    fLocation = pickLocation.value=="any"?"":pickLocation.value.replace(/\s+/g, '')
    fPickup = pickupDate.value
    fReturn = returnDate.value

    let u = new URL(`${window.location.origin}/cars`);
    let params = u.searchParams;

    if(fBrand != "any" && fBrand != "") params.set("brand", fBrand);
    if(fModel != "any" && fModel != "") params.set("search", fModel);
    if(fLocation != "any" && fLocation != "") params.set("location", fLocation);
    params.set("pickupdate", fPickup);
    params.set("returndate", fReturn);

    u.search = params.toString();

    const surl = document.createElement('a')
    surl.setAttribute('href', u.href)
    surl.setAttribute('target', "_blank")
    surl.style.display = "none"
    document.body.appendChild(surl)
    surl.click()
})
