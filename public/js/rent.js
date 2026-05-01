const queryString = window.location.search;
const params = new URLSearchParams(queryString);

const forPick = params.get('pickupdate')
const forRetu = params.get('returndate')

function formatMoney(amount, decimals = 2) {
    amount = parseFloat(amount);
  
    const fixedAmount = amount.toFixed(decimals);
  
    const parts = fixedAmount.split('.');
    let integerPart = parts[0];
    const decimalPart = parts[1];
  
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
    return `${integerPart}.${decimalPart}`;
}

const billUUID =  document.getElementById('billUUID')

let fees = 0
let discountsJSON = {}
let additionsJSON = {}

const stepMax = document.querySelectorAll('.rent-step-sect').length;
const stepPrev = document.getElementById('stepPrev');
const stepNext = document.getElementById('stepNext');

const updateSteps = (current, target, direction) => {
  
  const currentEl = document.getElementById(`step${current}`);
  const targetEl = document.getElementById(`step${target}`);

  targetEl.style.display = "flex";

  gsap.set(currentEl, { opacity: 1 });
  gsap.to(currentEl, { opacity: 0, stagger: 0.1 });

  gsap.set(targetEl, { x: direction * 100, opacity: 0 });
  gsap.to(targetEl, { x: 0, opacity: 1, stagger: 0.1 });

  currentEl.style.display = "none";

  document.querySelector(`input[value="s${current}"]`).checked = false;
  document.querySelector(`input[value="s${target}"]`).checked = true;
  document.getElementById(`rentStep${current}`).checked = false;
  document.getElementById(`rentStep${target}`).checked = true;

  stepNext.disabled = target >= stepMax;
  stepPrev.disabled = target <= 1;
};

const nextStep = () => {
  const current = parseInt(document.querySelector('input[name="stepsect"]:checked').value.substring(1));
  const target = current + 1;
  if (target <= stepMax) updateSteps(current, target, 1);
  updateInvoice()
};

const prevStep = () => {
  const current = parseInt(document.querySelector('input[name="stepsect"]:checked').value.substring(1));
  const target = current - 1;
  if (target > 0) updateSteps(current, target, -1);
};

const pickupInput = document.getElementById('pickupInput');
const pickupText = document.getElementById('pickupText');
const pickupIcon = document.getElementById('pickupIcon');

const returnInput = document.getElementById('returnInput');
const returnText = document.getElementById('returnText');
const returnIcon = document.getElementById('returnIcon');

const rentalType = pickupInput.dataset.rentalType;

let pickupDateString = '';
let returnDateString = '';
let period = 0;

let now = new Date();
let fullPickupDate = new Date(now);

function toDatetimeLocalString(date) {
  const pad = n => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDateTime(date) {
  if (!(date instanceof Date) || isNaN(date)) return '';
  return `${date.toDateString()}, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

function formatToSqlDateTime(date) {
  if (!(date instanceof Date) || isNaN(date)) return '';
  const pad = n => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function updatePeriod() {
  const pickupDate = new Date(pickupInput.value);
  const returnDate = new Date(returnInput.value);

  if (isNaN(pickupDate) || isNaN(returnDate)) {
    period = 0;
    return;
  }

  const diffMs = returnDate - pickupDate;

  if (rentalType === 'h') {
    period = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60))); 
  } else {
    period = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  }
}

if (rentalType === 'h') {
  fullPickupDate.setMinutes(0, 0, 0);
  if (fullPickupDate < now) fullPickupDate.setHours(fullPickupDate.getHours() + 1);

  const fullReturnDate = new Date(fullPickupDate.getTime() + 60 * 60 * 1000);

  pickupInput.type = 'datetime-local';
  returnInput.type = 'datetime-local';

  pickupInput.value = forPick?toDatetimeLocalString(new Date(forPick)):toDatetimeLocalString(fullPickupDate);
  returnInput.value = forRetu?toDatetimeLocalString(new Date(forRetu)):toDatetimeLocalString(fullReturnDate);

  pickupInput.min = toDatetimeLocalString(now);
  returnInput.min = toDatetimeLocalString(fullPickupDate);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  returnInput.max = toDatetimeLocalString(endOfDay);

  pickupText.textContent = forPick?formatDateTime(new Date(forPick)):formatDateTime(fullPickupDate);
  returnText.textContent = forRetu?formatDateTime(new Date(forRetu)):formatDateTime(fullReturnDate);

  pickupDateString = formatToSqlDateTime(fullPickupDate);
  returnDateString = formatToSqlDateTime(fullReturnDate);
} else {
  const pickupDate = new Date(now.setHours(0, 0, 0, 0));
  const returnDate = new Date(pickupDate.getTime() + 24 * 60 * 60 * 1000);

  pickupInput.type = 'datetime-local';
  returnInput.type = 'datetime-local';

  pickupInput.value = forPick?toDatetimeLocalString(new Date(forPick)):toDatetimeLocalString(pickupDate);
  returnInput.value = forRetu?toDatetimeLocalString(new Date(forRetu)):toDatetimeLocalString(returnDate);

  pickupInput.min = toDatetimeLocalString(pickupDate);
  returnInput.min = toDatetimeLocalString(pickupDate);

  pickupText.textContent = forPick?formatDateTime(new Date(forPick)):formatDateTime(pickupDate);
  returnText.textContent = forRetu?formatDateTime(new Date(forRetu)):formatDateTime(returnDate);

  pickupDateString = formatToSqlDateTime(pickupDate);
  returnDateString = formatToSqlDateTime(returnDate);
}

updatePeriod();

[pickupText, pickupIcon].forEach(el =>
  el.addEventListener('click', () => pickupInput.showPicker?.() || pickupInput.focus())
);
[returnText, returnIcon].forEach(el =>
  el.addEventListener('click', () => returnInput.showPicker?.() || returnInput.focus())
);

pickupInput.addEventListener('change', () => {
  const val = new Date(pickupInput.value);
  if (isNaN(val)) return;

  fullPickupDate = val;

  pickupText.textContent = formatDateTime(fullPickupDate);
  pickupDateString = formatToSqlDateTime(fullPickupDate);

  const returnDate = new Date(returnInput.value);
  if (isNaN(returnDate) || returnDate <= fullPickupDate) {
    const adjusted = new Date(fullPickupDate.getTime() + (rentalType === 'h' ? 3600000 : 86400000));
    returnInput.value = toDatetimeLocalString(adjusted);
    returnText.textContent = formatDateTime(adjusted);
    returnDateString = formatToSqlDateTime(adjusted);
  }

  returnInput.min = toDatetimeLocalString(fullPickupDate);
  updatePeriod();
  updateStat()
});

returnInput.addEventListener('change', () => {
  const returnDate = new Date(returnInput.value);
  if (isNaN(returnDate)) return;
  returnText.textContent = formatDateTime(returnDate);
  returnDateString = formatToSqlDateTime(returnDate);
  updatePeriod();
  updateStat()
});

const vid = document.getElementById('vid')
const uid = document.getElementById('uid')

const avLoader = document.getElementById('avLoader')

const avai = document.querySelector(".avai")
const avDot = document.querySelector(".av-dot")
const avTxt = document.querySelector(".av-txt")

const checkBut = document.getElementById('checkCarAv')

const checkCarAv = async (vid, start_date, end_date) => {
  try {
    avLoader.style.visibility = "visible"
    stepNext.disabled = true
    let u = new URL(`${window.location.origin}/api/vehicles/check/available`);
    let params = u.searchParams;

    params.set("vid", vid);
    params.set("start_date", start_date);
    params.set("end_date", end_date);

    u.search = params.toString();

    const response = await fetch(u);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const { 
      availability
    } = await response.json();
  
    avLoader.style.visibility = "hidden"
    stepNext.disabled = !availability

    return { 
      availability
    };

} catch (error) {
    console.error("Failed to fetch Vehicle:", error);
    pushNotif("e", "Something went wrong!");
    avLoader.style.visibility = "hidden"
    return null;
}
}

const updateStat = async ()=>{
  checkCarAv(vid.value, pickupDateString, returnDateString).then(data=>{
    if(data){
      avTest = data.availability || false
      avai.classList.remove('avd', 'nvd')
      avDot.classList.remove('avd', 'nvd')
      avTxt.classList.remove('avd', 'nvd')
      avai.classList.add(avTest?'avd':"nvd")
      avDot.classList.add(avTest?'avd':"nvd")
      avTxt.classList.add(avTest?'avd':"nvd")
      avTxt.textContent = avTest?'Available':"Not Available"
    }
  })
}

const rentPriceInp = document.getElementById('rentPrice')
const pickLoc = document.getElementById('pickLoc')
const carName = document.getElementById('carName')

const userFLName = document.getElementById('userFLName')
const userBirth = document.getElementById('userBirth')
const userEmail = document.getElementById('userEmail')
const userPhone = document.getElementById('userPhone')
const userCountry = document.getElementById('userCountry')
const userWilaya = document.getElementById('userWilaya')
const userCity = document.getElementById('userCity')
const userAddress = document.getElementById('userAddress')

const discounts = document.querySelectorAll('.discount-el')

const rentInvoice = document.getElementById('rentInvoice')
const tentantInfo = document.getElementById('tentantInfo')
const rentalInfo = document.getElementById('rentalInfo')
const rentPeriod = document.getElementById('rentPeriod')
const carRentPrice = document.getElementById('carRentPrice')
const invoiceBillOpt = document.getElementById('invoiceBillOpt')
const totalBillAmount = document.getElementById('totalBillAmount')
const billDiscounts = document.getElementById('billDiscounts')

const updateInvoice = () => {
  fees = 0
  let featureAR = []
  let discountsAR = []
  const returnD = returnInput.value
  const pickupD = pickupInput.value
  
  let finalPrice = 0

  const pickupText = document.getElementById('pickupText').textContent
  const returnText = document.getElementById('returnText').textContent
  
  const birthdate = userBirth.value
  const country = userCountry.value
  const username = userFLName.value
  const email = userEmail.value
  const phonenum = userPhone.value
  const wilaya = userWilaya.value
  const city = userCity.value
  const address = userAddress.value

  const car = carName.textContent

  const rentPrice = parseFloat(rentPriceInp.value)
  finalPrice+= (rentPrice * period)

  const driver = document.querySelector('input[name="driveron"]:checked')
  const isDriver = driver.value === "driver"
  fees+= isDriver?500:0

  const driverCoast = isDriver?`
    <div class="bill-row bill-det">
          <p>Driver</p>
          <p>1</p>
          <p><span>500</span> <span class="currence">DZD</span></p>
          <p><span>500</span> <span class="currence">DZD</span></p>
        </div>
  `:""

  if(isDriver){
    appendItem(featureAR, {name: "Driver", quantity: 1, price: 500.00})
  }

  const insur = document.querySelector('input[name="insure"]:checked').parentElement.parentElement.parentElement
  const insurance = parseFloat(insur.children[0].value)
  finalPrice += insurance
  const insurancePlan = insur.children[1].children[0].textContent
  
  const features = document.querySelectorAll('input[name="features"]:checked')
  let featuresBill = ``

  if (features.length > 0){
    let featureJS = {}
    features.forEach(feature=>{
      const featName = feature.parentElement.parentElement.children[3].children[0].textContent    
      const featPrice = feature.parentElement.parentElement.children[0].value
      fees+= parseFloat(featPrice)
      const featQuantity = 1
      appendItem(featureAR, {name: featName.trim(), quantity: 1, price: parseFloat(featPrice)})
      featuresBill += `
        <div class="bill-row bill-det">
          <p>${featName}</p>
          <p>${featQuantity}</p>
          <p><span>${formatMoney(featPrice, 2)}</span> <span class="currence">DZD</span></p>
          <p><span>${formatMoney(featPrice * featQuantity, 2)}</span> <span class="currence">DZD</span></p>
        </div>
      `
      finalPrice += (featPrice * featQuantity)
    })
  }

  const discounts = document.querySelectorAll('.discount-el')
  let discountsBill = ``
  let discountPer = 0

  if (discounts.length > 0){
    discounts.forEach(discount=>{
      const discountName = discount.children[2].children[0].textContent
      const discountValue = discount.children[0].value
      appendItem(discountsAR, {name: discountName.trim(), value: discountValue})
      discountsBill +=`
        <div class="flex-row center-spacebet bill-discount">
            <p></p>
            <p class="username">-${discountValue}% ${discountName}</p>
          </div>
      `
      discountPer += parseInt(discountValue)
    })
  }

  totalBillAmount.textContent = formatMoney(finalPrice, 2)

  finalPrice -= finalPrice * discountPer / 100
  
  tentantInfo.innerHTML = `
    <li><span id="invUfname">${username.split(' ')[0]}</span> <span id="invUlname">${username.split(' ')[1]}</span></li>
    <li class="address">Address:  <span id="invUwilaya">${wilaya}</span>, <span id="invUcity">${city}</span>, <span id="invUaddress">${address}</span></li>
    <li class="address">Email: <span id="invUemail">${email}</span></li>
    <li class="address">Phone: <span id="invUphone">${phonenum}</span></li>
  `

  rentalInfo.innerHTML = `
    <li>${car}</li>
    <li id="invRloca" class="address">Location: ${pickLoc.value}</li>
    <li id="invRpickup" class="address">Pickup: ${pickupText}</li>
    <li id="invRreturn" class="address">Return: ${returnText}</li>
  `

  rentPeriod.textContent = `${period} ${rentalType == "h"?"Hours":"Days"}`

  carRentPrice.textContent = formatMoney(rentPrice, 2)

  invoiceBillOpt.innerHTML = ``

  if (featuresBill != '' || isDriver){
    invoiceBillOpt.innerHTML = `
      <div class="bill-sip"></div>
      <span class="username" style="margin: 1em 0;">Optional Additions</span>
      <div class="bill-head-row bill-row">
        <p>Description</p>
        <p>Quantity</p>
        <p>Price</p>
        <p>Amount</p>
      </div>
      <div class="bill bod-list flex-col">
        ${featuresBill}
        ${driverCoast}
      </div>
    `
  }

  if (discountsBill != ''){
    totalBillAmount.style.textDecoration = "line-through"
    billDiscounts.innerHTML = `
      ${discountsBill}
      <div class="flex-row center-spacebet">
        <p></p>
        <p><span id="totalBillAmountDis">${finalPrice>0?formatMoney(finalPrice, 2):0}</span> <span class="currence">DZD</span></p>
        <input id="invAmnt" type="number" hidden value="${finalPrice>0?finalPrice:0}"/>
       </div>
    `
  }

  additionsJSON.additions = featureAR
  discountsJSON.discounts = discountsAR
}

stepNext.addEventListener('click', nextStep);
stepPrev.addEventListener('click', prevStep);

checkBut.addEventListener('click', updateStat)

updateStat()

const checkCoupon = async (code) => {
  try {
    const u = new URL(`${window.location.origin}/api/discounts/coupon/check`);
    u.searchParams.set("code", code);

    const response = await fetch(u);
    
    if (!response.ok) {
      const errorData = await response.json();
      const message = errorData.message || errorData.error || "Unknown error occurred";
      throw new Error(message);
    }

    const { result } = await response.json();
    return { result };
    
  } catch (error) {
    console.error("Failed to fetch coupon:", error);
    pushNotif("e", error.message);
    return null;
  }
};

const getCouponInfo = async (code) => {
    try {
    const u = new URL(`${window.location.origin}/api/discounts/coupon/info`);
    u.searchParams.set("code", code);

    const response = await fetch(u);
    
    if (!response.ok) {
      const errorData = await response.json();
      const message = errorData.message || errorData.error || "Unknown error occurred";
      throw new Error(message);
    }

    const { result } = await response.json();
    return { result };
    
  } catch (error) {
    console.error("Failed to fetch coupon:", error);
    pushNotif("e", error.message);
    return null;
  }
}

const applyPromo = document.getElementById('applyPromo')
const couponCode = document.getElementById('promoCode')
const couponsContainer = document.getElementById('couponsContainer')
const discountsList = document.querySelector('.discounts-list')
applyPromo.addEventListener('click', ()=>{
  const cCode = couponCode.value
  checkCoupon(cCode).then(data=>{
    if(data){
      if(data.result){
        getCouponInfo(cCode).then(data=>{
          if (data.result){
            const info = data.result
            const couponEl = document.createElement('div')
            couponEl.classList.add('coupon')
            couponEl.id = cCode
            couponEl.innerHTML = `
              <div class="flex-col flex-center">
              </div>
              <div class="flex-col flex-center">
                <p>${info.name}</p>
                <h6>${info.value}%</h6>
                <p>Expired on ${formatDate(info.expires_at)}</p>
              </div>
            `
            const promoEl = document.createElement('li')
            promoEl.classList.add("discount-el", "flex-row", "center-start", "w100", "gap-lrg")
            promoEl.innerHTML = `
              <input type="number" value="${info.value}" hidden>
              <i class="fa-solid fa-gift"></i>
              <div class="flex-col">
                <h6>${info.name}</h6>
                <p>${info.description}</p>
              </div>
            `

            if(couponsContainer.children.length <= 0){
              couponsContainer.appendChild(couponEl)
              discountsList.appendChild(promoEl)
              pushNotif("s", "Coupon added!")
              couponCode.value = ""
              gsap.set(couponEl, { opacity: 0, x: 100 });
              gsap.to(couponEl, { opacity: 1, x: 0, stagger: 0.1 });
              gsap.set(promoEl, { opacity: 0, y: 100 });
              gsap.to(promoEl, { opacity: 1, y: 0, stagger: 0.1 });
            }else{
              test = true
              Array.from(couponsContainer.children).forEach(co=>{
                if(co.id == cCode){
                  pushNotif("e", "Coupon already used")
                  test = false
                }
              })
              if(test){
                couponsContainer.appendChild(couponEl)
                discountsList.appendChild(promoEl)
                pushNotif("s", "Coupon added!")
                couponCode.value = ""
                gsap.set(couponEl, { opacity: 0, x: 100 });
                gsap.to(couponEl, { opacity: 1, x: 0, stagger: 0.1 });
                gsap.set(promoEl, { opacity: 0, y: 100 });
                gsap.to(promoEl, { opacity: 1, y: 0, stagger: 0.1 });
              }
            }
          }
        })
      }else{
        pushNotif('w', "Coupon has expired or usage limit has been reached")
      }
    }
  })
})

document.getElementById('confirmBut').addEventListener('click', async () => {
  const vehicle_id = parseInt(vid.value);
  const user_id = parseInt(uid.value);
  const pd = pickupInput.value;
  const rd = returnInput.value;
  const amount = parseFloat(invAmnt.value);
  const isure = parseFloat(document.querySelector('input[name="insure"]:checked').parentElement.parentElement.parentElement.children[0].value);
  const paymeth = document.querySelector('input[name="methode"]:checked').value;

  const payload = {
    vid: vehicle_id,
    uid: user_id,
    pd: pd,
    rd: rd,
    amount: amount,
    isure: isure,
    fees: fees,
    bid: billUUID.value,
    discounts: discountsJSON,
    additions: additionsJSON,
    paymeth: parseInt(paymeth)
  };

  const result = await confirm(false, "Confirm Action", "Are you sure you want to proceed?");
  if (result) {
    openLoader();
    try {
      const res = await fetch(`${window.location.origin}/api/orders/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        closeLoader();
        window.location.href = "/rentals";
      } else {
        closeLoader();
        pushNotif("e", data.error);
        console.error(`Error: ${data.error}`);
      }
    } catch (err) {
      closeLoader();
      pushNotif("e", "Something went wrong!");
      console.error(err);
    }
  }
});
