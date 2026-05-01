const getData = async (limit, offset) => {
    try {

        let u = new URL(`${window.location.origin}/api/vehicles/all`);
        let params = u.searchParams;

        params.set("limit", limit);
        params.set("offset", offset);
        params.set("order", "id");
        params.set("dire", "ASC");

        u.search = params.toString();

        const response = await fetch(u);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const { 
            vehicles, 
            total
         } = await response.json();
        return { 
            vehicles, 
            total
         };
    } catch (error) {
        console.error("Failed to fetch Vehicles:", error);
        pushNotif("e", "Something went wrong!");
        return null;
    }
};

const getVehicle = async (vid) => {
    try {
        openLoader()
        let u = new URL(`${window.location.origin}/api/vehicles/get/${vid}/0`);

        const response = await fetch(u);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();
        closeLoader()
        return result;
    } catch (error) {
        closeLoader()
        console.error("Failed to fetch Vehicle:", error);
        pushNotif("e", "Something went wrong!");
        return null;
    }
};

const previewImage = (inputId) => {
    const input = document.getElementById(inputId);
    const img = document.createElement('img');

    input.addEventListener("change", function () {
    const file = input.files[0];
    if (file) {
        img.src = URL.createObjectURL(file);
        img.onload = () =>{
            removeImageChildren(input.parentElement)
            input.parentElement.appendChild(img)
            input.parentElement.style.border = "none"
        }
    }
    });
}

const showImage = (input, imgSrc) =>{
    const img = document.createElement('img')
    img.setAttribute("src", imgSrc)
    removeImageChildren(input.parentElement)
    input.parentElement.appendChild(img)
    input.parentElement.style.border = "none"
}

const uploadImage = async (inputId) => {
    const fileInput = document.getElementById(inputId)
    if (!fileInput.files.length || fileInput.files[0].size === 0) {
        return document.getElementById(inputId).parentElement.children[2].getAttribute('src')
    }else{
        const formData = new FormData();
        formData.append('image', fileInput.files[0]);
        try {
            const res = await fetch(`${window.location.origin}/api/vehicles/upload`, {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            if (res.ok) {
                showImage(fileInput, data.imageUrl)
                return data.imageUrl
            } else {
                pushNotif("e",data.message)
                console.error(`Error: ${data.message}`)
                return document.getElementById(inputId).parentElement.children[2].getAttribute('src')
            }
        } catch (err) {
            pushNotif("e","Somthing went wrong!")
            console.error(err)
        }
    }
}

const vehicleDel = async (vid) => {
    try {
        openLoader()
        let u = new URL(`${window.location.origin}/api/vehicles/delete/${vid}`);

        const response = await fetch(u);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const { 
            message
        } = await response.json();
        closeLoader()
        return { 
            message
        };
    } catch (error) {
        closeLoader()
        console.error("Failed to delete Vehicle:", error);
        pushNotif("e", "Something went wrong!");
        return null;
    }
}

const refrechVehicles = async (limit = parseInt(document.getElementById('vehiclesLimit').value), offset = parseInt(document.getElementById('vehiclesOffset').value)) => {
    try {
        vehiclesLoader.style.opacity = "1";
        Array.from(vehiclesTableBody.children).forEach(child => child.remove());

        getData(limit, offset).then(data => {
            vehiclesLoader.style.opacity = "0";
            if (data && data.vehicles) {
                const { vehicles, total } = data;
                animateNumber('statTot', parseInt(statTot.innerText), parseInt(total), 1000);
                vehicles.forEach(vehicle => {
                    const tRow = document.createElement("div");
                    tRow.classList.add("rt-row-v", "rt-row-el");
                    tRow.innerHTML = `
                        <p>${vehicle.id}</p>
                        <div class="flex-row center-start gap-min">
                            <img class="rt-brand-logo" src="${vehicle.image}" alt="${vehicle.model}">
                            <p>${vehicle.brand_name} ${vehicle.model} ${vehicle.fab_year}</p>
                        </div>
                        <p>${vehicle.units}</p>
                        <p>${vehicle.body}</p>
                        <p>${vehicle.capacity}</p>
                        <div class="flex-row center-start gap-min">
                            <span class="color-box" style="background-color: ${vehicle.color};"></span>
                            <p>${capitalizeFirstChar(vehicle.color)}</p>
                        </div>
                        <p>${vehicle.transmission}</p>
                        <p>${vehicle.fuel}</p>
                        <p>${vehicle.speed} <span class="currence">KM/h</span></p>
                        <p>${vehicle.horsepower} <span class="currence">HP</span></p>
                        <p>${formatMoney(vehicle.price, 2)} <span class="currence">DZD/${vehicle.rental_type}</span></p>
                        <p>${formatDate(vehicle.created_at)}</p>
                        <div class="flex-row center-spacebet w100 pdv">
                            <i class="fa-solid fa-pen-to-square edtbt bt-hover"></i>
                            <i class="fa-solid fa-trash dltbt bt-hover"></i>
                        </div>
                    `
                    vehiclesTableBody.appendChild(tRow);
                });

                document.querySelectorAll('.dltbt').forEach(bt=>{
                    bt.addEventListener('click', ()=>{
                        confirm(true, "Confirm Action", "Are you sure you want to delete vehicle?").then((result) => {
                            if(result){
                                vid = parseInt(bt.parentElement.parentElement.children[0].textContent)
                                vehicleDel(vid).then(data=>{
                                    pushNotif('i', data.message)
                                    refrechVehicles()
                                })
                            }
                        });
                    })
                })

                document.querySelectorAll('.edtbt').forEach(bt=>{
                    bt.addEventListener('click', async ()=>{
                        openEditor()
                        const vid = parseInt(bt.parentElement.parentElement.children[0].textContent)
                        getVehicle(vid).then(v=>{
                            if (v){
                                uvid.value = vid
                                showImage(image, v.image)
                                showImage(prevImage1Inp, v.previmage1)
                                showImage(prevImage2Inp, v.previmage2)
                                showImage(prevImage3Inp, v.previmage3)

                                edLocation.innerHTML = `<option value='${v.office_id}' >${v.wilaya}, ${v.city}, ${v.address}</option>`
                                edBrand.innerHTML = `<option value='${v.brand_name}'>${v.brand_name}</option>`
                                edModel.value = v.model
                                edYear.value = v.fab_year
                                edUnits.value = v.units
                                edPrice.value = v.price
                                edType.value = v.rental_type
                                edBody.value = v.body
                                edColor.value = v.color
                                edEngin.value = v.engine_type
                                edPower.value = v.horsepower
                                edSpeed.value = v.speed
                                edCap.value = v.capacity
                                edDoors.value = v.doors
                                edFuel.value = v.fuel
                                edTrans.value = v.transmission
                                edDesc.value = v.description
                            }
                        })
                    })
                })
    
                gsap.set(".rt-row-el", { x: 100, opacity: 0, rotate:-3 });
                gsap.to(".rt-row-el", { x: 0, stagger: 0.1, opacity: 1,rotate:0 });
    
                const totalPages = Math.ceil(total / limit);
                const currentPage = Math.floor(offset / limit) + 1;
    
                let options = "";
                for (let i = 1; i <= totalPages; i++) {
                    options += `<option value="${i}" ${i === currentPage ? 'selected' : ''}>${i}</option>`;
                }
    
                document.getElementById('rtPagination').innerHTML = `
                    <div class="flex-row center-start gap-lrg">
                        <p class="para-sml">Page: </p>
                        <select class="select-reg" id="vehiclesCurrentPage">
                            ${options}
                        </select>
                        <p class="para-sml">Show per page: </p>
                        <input class="select-reg" type="number" min="0" max="50" value="${limit}" id="vehiclesLimit" style="width: 4em; padding-right: 0; height: 2.5em; text-align: center;">
                        <p class="para-sml">Offset: </p>
                        <input class="select-reg" type="number" value="${offset}" id="vehiclesOffset" style="width: 4em; padding-right: 0; height: 2.5em; text-align: center;">
                    </div>
                    <div class="flex-row center-start gap-lrg" id="vehicleTableFoot">
                        <p class="para-sml">${offset + 1}-${Math.min(offset + limit, total)} of ${total} vehicles</p>
                        <div class="flex-row center-start gap-lrg">
                            <button class="bt bt-hover bt-pagin" id="oPrevB">&lt;</button>
                            <button class="bt bt-hover bt-pagin" id="oNextB">&gt;</button>
                        </div>
                    </div>
                `;

                document.getElementById('vehiclesLimit').addEventListener('change', ()=> {refrechVehicles()})
                document.getElementById('vehiclesOffset').addEventListener('change', ()=> {refrechVehicles()})
    
                const newVehiclesCurrentPage = document.getElementById('vehiclesCurrentPage');
    
                newVehiclesCurrentPage.addEventListener('change', () => {
                    const selectedPage = parseInt(newVehiclesCurrentPage.value);
                    const newOffset = (selectedPage - 1) * limit;
                    vehiclesOffset.value = newOffset; 
                    refrechVehicles(limit, newOffset);
                });
    
                document.getElementById('oPrevB').addEventListener('click', () => {
                    const prevPage = parseInt(newVehiclesCurrentPage.value) - 1;
                    if (prevPage >= 1) {
                        const newOffset = (prevPage - 1) * limit;
                        vehiclesOffset.value = newOffset;
                        refrechVehicles(limit, newOffset);
                    }
                });
    
                document.getElementById('oNextB').addEventListener('click', () => {
                    const nextPage = parseInt(newVehiclesCurrentPage.value) + 1;
                    if (nextPage <= totalPages) {
                        const newOffset = (nextPage - 1) * limit;
                        vehiclesOffset.value = newOffset;
                        refrechVehicles(limit, newOffset);
                    }
                });
            }
        })
        .catch(error => {
            vehiclesLoader.style.opacity = "0";
            pushNotif("e", "Something went wrong!");
            console.error(error);
        });
    } catch (error) {
        console.error(error)
    }
}

previewImage("image");
previewImage("prevImage1Inp");
previewImage("prevImage2Inp");
previewImage("prevImage3Inp");

const editVehicleContainer = document.getElementById('editVehicleContainer')
const editVehicleForm = document.querySelector('.add-vehicle-form')
const edLocation = document.getElementById('edLocation')
const uvid = document.getElementById('uvid')
const edBrand = document.getElementById('edBrand')
const edModel = document.getElementById('edModel')
const edYear = document.getElementById('edYear')
const edUnits = document.getElementById('edUnits')
const edPrice = document.getElementById('edPrice')
const edType = document.getElementById('edType')
const edBody = document.getElementById('edBody')
const edColor = document.getElementById('edColor')
const edEngin = document.getElementById('edEngin')
const edPower = document.getElementById('edPower')
const edSpeed = document.getElementById('edSpeed')
const edCap = document.getElementById('edCap')
const edDoors = document.getElementById('edDoors')
const edFuel = document.getElementById('edFuel')
const edTrans = document.getElementById('edTrans')
const image = document.getElementById('image')
const prevImage1Inp = document.getElementById('prevImage1Inp')
const prevImage2Inp = document.getElementById('prevImage2Inp')
const prevImage3Inp = document.getElementById('prevImage3Inp')
const edDesc = document.getElementById('edDesc')

const openEditor = () => {
    try {
        editVehicleContainer.style.visibility = "visible"   
        gsap.set(".add-vehicle-form", { y: 100, opacity: 0});
        gsap.to(".add-vehicle-form", { y: 0, opacity: 1});
    } catch (error) {}
}

const closeEditor = () => {
    try {
        gsap.to(".add-vehicle-form", { y: -100, opacity: 0});
        setTimeout(() => {
            editVehicleContainer.style.visibility = "hidden"   
        }, 400);
    } catch (error) {}
}

const vehiclesLoader = document.getElementById('vehiclesLoader')
const vehiclesTableBody = document.getElementById('rtBod')
const vehiclesLimit = document.getElementById('vehiclesLimit')
const vehiclesOffset = document.getElementById('vehiclesOffset')
const vehiclesCurrentPage = document.getElementById('vehiclesCurrentPage')
const statTot = document.getElementById('statTot')

document.addEventListener("DOMContentLoaded", ()=>{
    refrechVehicles()
})

document.getElementById('updateVF').addEventListener('submit', async (e)=> {
    e.preventDefault()

    confirm(false, "Confirm Action", "Are you sure you want to update vehicle?").then( async (result) => {
        if(result){
            openLoader()
            
            const imageU = await uploadImage("image")
            const imageU1 = await uploadImage("prevImage1Inp")
            const imageU2 = await uploadImage("prevImage2Inp")
            const imageU3 = await uploadImage("prevImage3Inp")

            const vid = uvid.value
            
            try {
                let u = new URL(`${window.location.origin}/api/vehicles/update/${vid}`);
                let params = u.searchParams;

                params.set("model", edModel.value);
                params.set("fab_year", edYear.value);
                params.set("units", edUnits.value);
                params.set("price", edPrice.value);
                params.set("fuel", edFuel.value);
                params.set("rental_type", edType.value);
                params.set("body", edBody.value);
                params.set("color", edColor.value);
                params.set("engine_type", edEngin.value);
                params.set("horsepower", edPower.value);
                params.set("speed", edSpeed.value);
                params.set("capacity", edCap.value);
                params.set("doors", edDoors.value);
                params.set("fuel", edFuel.value);
                params.set("transmission", edTrans.value);
                params.set("description", edDesc.value);
                params.set("image", imageU);
                params.set("previmage1", imageU1);
                params.set("previmage2", imageU2);
                params.set("previmage3", imageU3);

                u.search = params.toString();
                const response = await fetch(u);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
                const {message} = await response.json();
                pushNotif("i", message)
            } catch (error) {
                closeLoader()
                console.error("Failed to fetch Rentals:", error);
                pushNotif("e", "Something went wrong!");
                return null;
            }


            closeLoader()
        }
        closeEditor()
        refrechVehicles()
    });
})

document.getElementById('cancelUpdateVehicle').addEventListener('click', ()=> { closeEditor() })