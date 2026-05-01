let rangeMin = 100;
const range = document.querySelector(".range-selected");
const rangeInput = document.querySelectorAll(".range-input input");
const rangePrice = document.querySelectorAll(".range-price input");

rangeInput.forEach((input) => {
    input.addEventListener("input", (e) => {
        let minRange = parseInt(rangeInput[0].value);
        let maxRange = parseInt(rangeInput[1].value);
        if (maxRange - minRange < rangeMin) {     
        if (e.target.className === "min") {
            rangeInput[0].value = maxRange - rangeMin;        
        } else {
            rangeInput[1].value = minRange + rangeMin;        
        }
        } else {
        rangePrice[0].value = minRange;
        rangePrice[1].value = maxRange;
        range.style.left = (minRange / rangeInput[0].max) * 100 + "%";
        range.style.right = 100 - (maxRange / rangeInput[1].max) * 100 + "%";
        }
    });
});

rangePrice.forEach((input) => {
    input.addEventListener("input", (e) => {
        let minPrice = rangePrice[0].value;
        let maxPrice = rangePrice[1].value;
        if (maxPrice - minPrice >= rangeMin && maxPrice <= rangeInput[1].max) {
        if (e.target.className === "min") {
            rangeInput[0].value = minPrice;
            range.style.left = (minPrice / rangeInput[0].max) * 100 + "%";
        } else {
            rangeInput[1].value = maxPrice;
            range.style.right = 100 - (maxPrice / rangeInput[1].max) * 100 + "%";
        }
        }
    });
});

 function formatDate(date) {
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
    altFormat: "d M Y",
    defaultDate: [formatDate(pickupDate), formatDate(returnDate)],
    minDate: formatDate(pickupDate),
    onChange: function(selectedDates) {
        if (selectedDates[0]) {
            document.getElementById('fPickupdate').value = formatDate(selectedDates[0]);
        }
        if (selectedDates[1]) {
            document.getElementById('fReturndate').value = formatDate(selectedDates[1]);
        }
    }
});

const locInp = document.getElementById("locInp")
const locAdd = document.getElementById("locAdd")
const locWilList = document.getElementById("locWilList")

const filterSec = document.getElementById('filterSec')

document.getElementById('filterBut4p').addEventListener('click', openFilter)
document.getElementById('platCloseFilter').addEventListener('click', closeFilter)

function openFilter(){
    filterSec.style.display = "flex"
    setTimeout(() => {
        filterSec.style.top = "50%"
    }, 100);
}

function closeFilter(){
    filterSec.style.top = "150%"
    setTimeout(() => {
        filterSec.style.display = "none"
    }, 100);
}

gsap.set(".plat-car-container", {x: 0, opacity: 1, scale: 1})

gsap.from(".plat-car-container", {
    x: 100,
    scale: 0.8,
    stagger: 0.2,
    opacity: 0,
    scrollTrigger: {
        scrub: 1,
        start: "top bottom",
        scroller: ".plat-cars-container"
    }
});

async function fetchVehicle(id, uid) {
    try {
        openLoader()
        const response = await fetch(`/api/vehicles/get/${id}/${uid}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.message === "No Vehicle Found!") {
            closeLoader()
            console.warn("Vehicle not found.");
            pushNotif("w", "Vehicle not found.")
            return null
        } else {
            closeLoader()
            return data
        }
    } catch (error) {
        closeLoader()
        console.error("Error fetching vehicle:", error);
        pushNotif('e', "Somthing went wrong!")
    }
}

function closeCarDetail(){
    if(screen.width > 820){
        carsContainerSec.style.width = "100%"
        carDetailSec.style.minWidth = "unset"
        carDetailSec.style.width = "0"
    }else{
        carDetailSec.style.top = "150%"
    }
    setTimeout(() => {
        Array.from(carDetailSec.children).forEach(ch=>{ ch.remove })
        carDetailSec.style.display = "none"
    }, 200);
}

document.querySelectorAll(".plat-car-image").forEach(carContainer=>{
    carContainer.addEventListener('click', ()=>{
        targetCar = carContainer.parentElement
        uid = targetCar.children[targetCar.children.length-2].value
        carId = targetCar.children[targetCar.children.length-1].value
        openCarDetail(carId, uid)
    })
})

const carDetailSec = document.getElementById('carDetail')
const carsContainerSec = document.getElementById('carSecBody')

async function openCarDetail(id, uid){
    result = await fetchVehicle(id, uid)
    if(result){
        const favlab = uid<=0?"<span></span>":`
            <label class="icn-bt fav-lab flex-row center-start">
                <label class="fav-lab flex-row center-start">
                    <input class="heart-anim" id="toggle-heart-${result.id}" type="checkbox" hidden disabled ${result.is_favorite? 'checked' : ''}/>
                    <label for="toggle-heart-${result.id}" aria-label="like" class="animated-heart" id="v${result.id}u${uid}"><i class="fa-solid fa-heart"></i></label>
                </label>                                    
                <input type="checkbox" class="fav-check" hidden>
            </label>
        `
        carDetailSec.innerHTML = `
            <button class="bt bt-hover" id="detailsClose" onclick="closeCarDetail()">
                <i class="fa-solid fa-xmark bt-hover" id="detailsClose"></i>
            </button>
            <header class="car-detail-head flex-row center-spacebet">
                <button class="bt bt-hover icn-bt" id="detailsClose4p" onclick="closeCarDetail()">
                    <i class="fa-solid fa-chevron-left" style="font-size: var(--font-med);"></i>
                </button>
                <p>Car details</p>
                ${favlab}
            </header>
            <div class="plat-images-detail flex-row center-start">
                <div class="detail-image">
                    <img class="prevable" src="${result.previmage1}" alt="Image">
                </div>
                <div class="detail-image">
                    <img class="prevable" src="${result.previmage2}" alt="Image">
                </div>
                <div class="detail-image">
                    <img class="prevable" src="${result.previmage3}" alt="Image">
                </div>
            </div>
            <div class="flex-row center-spacebet r-car-inf">
                <p class="car-inf-name">${result.model} ${result.fab_year}</p>
                <p class="car-inf-price">${result.price}<span class="currence">DZD</span><span class="price-tag">/${result.rental_type == "h"?"hour":"day"}</span></p>
            </div>
            <div class="car-det-info flex-col center-spacebet"> 
                <div class="car-det-bod">
                    <div class="car-det-sec flex-col">
                        <input type="radio" class="displayRad" name="sec-rad" id="specs" hidden checked>
                        <div class="flex-row car-rate-stars center-spacebet">
                            <div class="flex-row">
                                <img src="${result.logo}" alt="Logo">
                                <div class="flex-col start-center">
                                    <p class="spec-log">${result.brand_name}</p>
                                    <h6 class="spec-para">${result.model} ${result.fab_year}</h6>
                                </div>
                            </div>
                            <div class="flex-row center-start">
                                <h6 class="spec-tit">${result.stars}</h6>
                                <h6 style="
                                    margin: 0 0.7em;
                                    background:linear-gradient(90deg, yellow ${result.stars*100/5}%, var(--text)0%);
                                    -webkit-background-clip: text;
                                    -webkit-text-fill-color: transparent;
                                    background-clip: text;
                                ">
                                    <i class="fa-solid fa-star"></i>
                                    <i class="fa-solid fa-star"></i>
                                    <i class="fa-solid fa-star"></i>
                                    <i class="fa-solid fa-star"></i>
                                    <i class="fa-solid fa-star"></i>
                                </h6>
                                <h6 class="spec-para">(${result.reviews} RATE)</h6>
                            </div>
                        </div>     
                        <div class="car-specs-det flex-col">
                            <div class="flex-row center-spacebet">
                                <div class="flex-col" style="width: 33%;">
                                    <h5 class="spec-tit">Company</h5>
                                    <p class="spec-para">${result.brand_name}</p>
                                </div>
                                <div class="flex-col" style="width: 33%;">
                                    <h5 class="spec-tit">Model</h5>
                                    <p class="spec-para">${result.model}</p>
                                </div>
                                <div class="flex-col" style="width: 33%;">
                                    <h5 class="spec-tit">Color</h5>
                                    <div class="flex-row flex-center">
                                        <div class="color-box-circle" style="background-color: ${result.color};"></div>
                                        <p class="spec-para">${result.color.toString().toUpperCase()}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="flex-row center-spacebet">
                                <div class="flex-col" style="width: 33%;">
                                    <h5 class="spec-tit">Doors</h5>
                                    <p class="spec-para">${result.doors}</p>
                                </div>
                                <div class="flex-col" style="width: 33%;">
                                    <h5 class="spec-tit">Power</h5>
                                    <p class="spec-para">${result.horsepower} <span class="currence">HP</span></p>
                                </div>
                                <div class="flex-col" style="width: 33%;">
                                    <h5 class="spec-tit">Capacity</h5>
                                    <p class="spec-para">${result.capacity} seats</p>
                                </div>
                            </div>
                            <div class="flex-row center-spacebet">
                                <div class="flex-col" style="width: 33%;">
                                    <h5 class="spec-tit">Year</h5>
                                    <p class="spec-para">${result.fab_year}</p>
                                </div>
                                <div class="flex-col" style="width: 33%;">
                                    <h5 class="spec-tit">Max Speed</h5>
                                    <p class="spec-para">${result.speed} <span class="currence">KM/H</span></p>
                                </div>
                                <div class="flex-col" style="width: 33%;">
                                    <h5 class="spec-tit">Drive</h5>
                                    <p class="spec-para">All-wheel</p>
                                </div>
                            </div>
                        </div>
                        <div class="specs-more only-pc flex-row flex-center">
                            <a href="/car/${result.id}" class="exploare-but bt bt-hover" title="See more about this vehicle"><i class="fa-solid fa-circle-info"></i> More About Vehicle</a>
                        </div>                  
                    </div>
                </div>
            </div>
            <div class="plat-rdetail-foot flex-row flex-center">
                <a href="/rent/${result.id}" class="bt bt-hover rent-but flex-row flex-center" id="rentBut">Rent Now</a>
                <div class="bookbuts flex-row center-spacebet">
                    <div class="flex-col">
                        <p style="font-size: var(--font-sml);color:var(--txt-black);">BOOK VEHICLE</p>
                        <p style="font-size: var(--font-tag);color:var(--txt-black);">Hyundai FOCUS</p>
                    </div>
                    <div class="flex-col">
                        <p style="font-size: var(--font-sml);color:var(--txt-black);">FREE BOOKING</p>
                        <p style="font-size: var(--font-tag);color:var(--txt-black);">10 minutes</p>
                    </div>
                    <a href="/rent/${result.id}" class="bt bt-hover rent-but4p flex-row flex-center" id="rentBut4pc">
                        <i class="fa-solid fa-chevron-right"></i>
                    </a>
                </div>
            </div>
        `
        carDetailSec.style.display = "flex"
        if(screen.width > 820){
            carsContainerSec.style.width = "64%"
            carDetailSec.style.width = "36%"
            carDetailSec.style.minWidth = "400px"
        }else{
            setTimeout(() => {
                carDetailSec.style.top = "50%"
            }, 100);
        }
    }
}

document.querySelectorAll('.car-det-info-head label').forEach(label => {
  label.addEventListener('click', () => {
      let targetId = label.getAttribute('data-target');
      let contentRadio = document.getElementById(targetId);
      let navRadio = label.querySelector('input[type="radio"]');
      if (contentRadio && navRadio) {
          navRadio.checked = true;
          contentRadio.checked = true;
      }
  });
});

try {
    document.getElementById('applyFilter').addEventListener('click', () => {
        let search = document.getElementById('filterSearch').value.trim();
        let search4p = document.getElementById('search4p').value.trim();
        let rentalType = "";
        let availableOnly = document.getElementById('stch').checked ? 'true' : "";
        let Pricem = document.getElementById("pricem").value.trim();
        let PriceM = document.getElementById("priceM").value.trim();
        let pickupDate = document.getElementById('fPickupdate').value;
        let returnDate = document.getElementById('fReturndate').value;
        let transm = "";
        let cap = "";
        let brands = [];
        let fuelTypes = [];
        let bodyStyles = [];
        let wilayaList = []
        document.querySelectorAll('.f-location').forEach(fl=>{
            wil = fl.children[0].textContent
            appendItem(wilayaList, wil)
        })
        
        // Capacity
        document.querySelectorAll('input[name="cap"]').forEach(radioButton => {
            if (radioButton.checked && radioButton.id !== "personeA") {
                cap = radioButton.id.substring(7);
            }
        });

        // Transmission
        document.querySelectorAll('input[name="transm"]').forEach(radioButton => {
            if (radioButton.checked && radioButton.id !== "transAny") {
                transm = radioButton.value;
            }
        });

        // Rental type
        document.querySelectorAll('input[name="rnt"]').forEach(radioButton => {
            if (radioButton.checked && radioButton.id !== "rentalA") {
                rentalType = radioButton.id === "rentalD" ? "d" : "h";
            }
        });

        // Body styles
        document.querySelectorAll('.filter-body-style').forEach(st => {
            if (st.checked) bodyStyles.push(st.id.substring(8));
        });

        // Fuel types
        document.querySelectorAll('.filter-fuel-type').forEach(st => {
            if (st.checked) fuelTypes.push(st.id.substring(8));
        });

        // Brands
        document.querySelectorAll('.filter-brand-inp').forEach(st => {
            if (st.checked) brands.push(st.id.substring(5));
        });

        // Build query string
        const params = new URLSearchParams();

        if (search) params.append("search", search || search4p);
        if (rentalType) params.append("rtype", rentalType);
        if (availableOnly) params.append("availability", availableOnly);
        if (Pricem) params.append("pricem", Pricem);
        if (PriceM) params.append("priceM", PriceM);
        if (transm) params.append("trans", transm);
        if (cap) params.append("capacity", cap);
        if (pickupDate) params.append("pickupdate", pickupDate);
        if (returnDate) params.append("returndate", returnDate);
        if (brands.length) params.append("brand", brands.join(","));
        if (fuelTypes.length) params.append("fuel", fuelTypes.join(","));
        if (bodyStyles.length) params.append("body", bodyStyles.join(","));
        if (wilayaList.length) params.append("location", wilayaList.join(" "));

        // params.append("limit", 15);
        // params.append("offset", 0);

        const finalUrl = `/cars?${params.toString()}`;

        window.location.href = finalUrl;
    });
} catch (error) {}

try {
    const searchInput = document.getElementById('filterSearch');
    searchInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            let search = searchInput.value.trim();
            const params = new URLSearchParams();
            if (search) params.append("search", search);
            const finalUrl = `/cars?${params.toString()}`;
            window.location.href = finalUrl;
        }
    })
} catch (error) {}

try {
    document.getElementById('search4p').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            openFilter()
            document.getElementById('filterBut4p').click()
        }
    })
} catch (error) {}

locAdd.addEventListener('click', ()=>{
    if(locInp.value != ""){
        const newLoc = document.createElement('div')
        newLoc.classList.add("f-location", "flex-row", "flex-center", "gap-min")

        newLoc.innerHTML = `
            <p class="f-loc">${locInp.value}</p>
        `
        const closeBut = document.createElement("i")
        closeBut.classList.add("f-loc-close", "bt-hover", "fa-solid", "fa-xmark")

        closeBut.addEventListener('click', ()=> {
            newLoc.remove()
        })

        newLoc.appendChild(closeBut)
        locWilList.appendChild(newLoc)
        locInp.value = ""
    }
})

try {
    document.querySelectorAll('.f-loc-close').forEach(li=>{
        li.addEventListener('click', ()=>{
            li.parentElement.remove()
        })
    })
} catch (error) {}