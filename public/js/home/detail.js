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

  pickupInput.value = toDatetimeLocalString(fullPickupDate);
  returnInput.value = toDatetimeLocalString(fullReturnDate);

  pickupInput.min = toDatetimeLocalString(now);
  returnInput.min = toDatetimeLocalString(fullPickupDate);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  returnInput.max = toDatetimeLocalString(endOfDay);

  pickupText.textContent = formatDateTime(fullPickupDate);
  returnText.textContent = formatDateTime(fullReturnDate);

  pickupDateString = formatToSqlDateTime(fullPickupDate);
  returnDateString = formatToSqlDateTime(fullReturnDate);
} else {
  const pickupDate = new Date(now.setHours(0, 0, 0, 0));
  const returnDate = new Date(pickupDate.getTime() + 24 * 60 * 60 * 1000);

  pickupInput.type = 'datetime-local';
  returnInput.type = 'datetime-local';

  pickupInput.value = toDatetimeLocalString(pickupDate);
  returnInput.value = toDatetimeLocalString(returnDate);

  pickupInput.min = toDatetimeLocalString(pickupDate);
  returnInput.min = toDatetimeLocalString(pickupDate);

  pickupText.textContent = formatDateTime(pickupDate);
  returnText.textContent = formatDateTime(returnDate);

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
});

returnInput.addEventListener('change', () => {
  const returnDate = new Date(returnInput.value);
  if (isNaN(returnDate)) return;
  returnText.textContent = formatDateTime(returnDate);
  returnDateString = formatToSqlDateTime(returnDate);
  updatePeriod();
});


function formatDateTime(val) {
    try {
        const date = new Date(val);
        if (isNaN(date)) return val;
        return date.toDateString() + ', ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {}
}

function showBookInfo(){
    try {
        BIcontainer = document.querySelector('.car-det-rentprice')
        BIcontainer.style.display = "inline"
        document.getElementById('showContSec').style.display = "none"
        setTimeout(() => {
            BIcontainer.style.top = "50%"
        }, 100);
    } catch (error) {}
}

function hideBookInfo(){
    try {
        BIcontainer = document.querySelector('.car-det-rentprice')
        BIcontainer.style.top = "200%"
        document.getElementById('showContSec').style.display = "flex"
        setTimeout(() => {
            BIcontainer.style.display = "none"
        }, 100);
    } catch (error) {}
}

document.getElementById('showContSec').addEventListener('click', showBookInfo)
document.getElementById('detCloseBut').addEventListener('click', hideBookInfo)

const reportContainer = document.getElementById('reportContainer')
const reportBut = document.getElementById('reportBut')

const reportPrio = document.getElementById('repPrio')
const colorBox = document.getElementById("repColorBox")

const repColorBox = document.getElementById('repColorBox')
const prio = document.getElementById('repPrio')
const desc = document.getElementById('repDesc')
const type = document.getElementById('repType')

const uid = document.getElementById('uidInp')
const uidVal = uid.value == ""?null:parseInt(uid.value)
const vid = document.getElementById('vidInp')
const vidVal = vid.value == ""?null:parseInt(vid.value)

const openReporter = () => {
  reportContainer.style.visibility = 'visible'

  reportPrio.addEventListener('change', ()=> {
      const rv = reportPrio.value
      colorBox.style.backgroundColor = rv === "hight"?"rgb(211, 73, 73)":rv === "low"?"rgba(133, 133, 133, 0.41)":"rgb(231, 127, 62)"
  })

  gsap.set(".report-container", { opacity: 0, y:100 });
  gsap.to(".report-container", { stagger: 0.1, opacity: 1,y:0 });
  const newElement = reportBut.cloneNode(true);
  reportBut.parentNode.replaceChild(newElement, reportBut);
  newElement.addEventListener('click', ()=> {
      confirm(false, "Confirm Action", "Are you sure you want to send report?").then((result) => {
          if(result){
              submitReport(uidVal, vidVal, prio.value, type.value, desc.value).then(data=>{
                  pushNotif('i', data.message)
                  closeReporter()
              })
          }
      });
  })
}

const closeReporter = () => {
    gsap.to(".report-container", { stagger: 0.1, opacity: 0,y:-100 });
    setTimeout(() => {
      colorBox.style.backgroundColor = "rgb(211, 73, 73)"
      type.value = "Car"
      prio.value = "hight"
      desc.value = ""
      reportContainer.style.visibility = 'hidden'
    }, 200);
}

const submitReport = async (uid, vid, prio, type, desc) => {
  try {
      openLoader()
      const response = await fetch(`${window.location.origin}/api/feedback/report`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              uid: uid,
              vid: vid,
              prio: prio,
              type: type,
              desc: desc
          })
      });
      closeLoader()
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const { message } = await response.json();
      return { message };

  } catch (error) {
      closeLoader()
      console.error("Failed to submit report:", error);
      pushNotif("e", "Something went wrong!");
      return null;
  }
}

document.getElementById('reportClose').addEventListener('click', closeReporter)
document.getElementById('reportCancel').addEventListener('click', closeReporter)
document.getElementById('reportCar').addEventListener('click', openReporter)

document.getElementById('shareBut').addEventListener('click', ()=> {
    const url = window.location
    navigator.clipboard.writeText(url)
    .then(() => {
        pushNotif("s", "Link copied to clipboard!");
    })
    .catch(err => {
        pushNotif("e",`Failed to copy: ${err}`);
    });
})

document.getElementById('rentProcessBut').addEventListener('click', ()=>{
    const pickD = pickupInput.value
    const retuD = returnInput.value
    
    let u = new URL(`${window.location.origin}/rent/${window.location.href.substring(26)}`);
    let params = u.searchParams;

    params.set("pickupdate", pickD);
    params.set("returndate", retuD);

    u.search = params.toString();

    const surl = document.createElement('a')
    surl.setAttribute('href', u.href)
    surl.setAttribute('target', "_blank")
    surl.style.display = "none"
    document.body.appendChild(surl)
    surl.click()
})