

const loadingBar = document.createElement('div')
loadingBar.id = "loading"
loadingBar.classList.add("loading", "flex-row", "flex-center")
loadingBar.innerHTML = `
    <div class="loader">
        <svg class="car" width="102" height="40" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(2 1)" stroke="var(--txt-black)" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
                <path class="car__body" d="M47.293 2.375C52.927.792 54.017.805 54.017.805c2.613-.445 6.838-.337 9.42.237l8.381 1.863c2.59.576 6.164 2.606 7.98 4.531l6.348 6.732 6.245 1.877c3.098.508 5.609 3.431 5.609 6.507v4.206c0 .29-2.536 4.189-5.687 4.189H36.808c-2.655 0-4.34-2.1-3.688-4.67 0 0 3.71-19.944 14.173-23.902zM36.5 15.5h54.01" stroke-width="3"/>
                <ellipse class="car__wheel--left" stroke-width="3.2" fill="var(--txt-black)" cx="83.493" cy="30.25" rx="6.922" ry="6.808"/>
                <ellipse class="car__wheel--right" stroke-width="3.2" fill="var(--txt-black)" cx="46.511" cy="30.25" rx="6.922" ry="6.808"/>
                <path class="car__line car__line--top" d="M22.5 16.5H2.475" stroke-width="3"/>
                <path class="car__line car__line--middle" d="M20.5 23.5H.4755" stroke-width="3"/>
                <path class="car__line car__line--bottom" d="M25.5 9.5h-19" stroke-width="3"/>
            </g>
        </svg>
    </div>`
document.body.appendChild(loadingBar)

function openLoader(){
    loadingBar.style.display = "flex"
    setTimeout(() => {
        loadingBar.style.opacity = "1"
    }, 100);
}

function closeLoader(){
    loadingBar.style.opacity = "0"
    setTimeout(() => {
        loadingBar.style.display = "none"
    }, 300);
}

function fakeLoading(t){
    openLoader()
    setTimeout(() => {
        closeLoader()
    }, t*1000);
}

function isMobile() {
    return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}


document.addEventListener("DOMContentLoaded", function () {
    openLoader()
    window.addEventListener("load", function () {
        closeLoader()
    });
});

try{
    document.getElementById("goTop").addEventListener("click", () =>{
        window.scrollTo(0, 0);
    })
}catch(error){}

const notificationContainer = document.createElement('div')
notificationContainer.id = "notifContainer"
notificationContainer.classList.add("notifications-container", "flex-col")
document.body.appendChild(notificationContainer)

function pushNotif(type, message){
    const notif = document.createElement("div")
    notif.classList.add("notification-container", "flex-row")
    notifIcon = ""
    switch (type){
        case "w":
            notif.classList.add("notif-warning")
            notifIcon = "fa-circle-xmark"
        break;
        case "e":
            notif.classList.add("notif-error")
            notifIcon = "fa-triangle-exclamation"
        break;
        case "s":
            notif.classList.add("notif-success")
            notifIcon = "fa-circle-check"
            break;
        case "i":
            notif.classList.add("notif-info")
            notifIcon = "fa-circle-exclamation"
        break;
    }
    notif.innerHTML = `
        <i class="fa-solid ${notifIcon} notif-type"></i>
        <p class="notif-msg">${message}</p>
    `
    closeBut = document.createElement('i')
    closeBut.classList.add("fa-solid", "fa-xmark", "notif-close", "bt-hover")
    closeBut.addEventListener('click', ()=>{
        notif.style.opacity = "0"
        setTimeout(() => {
            notif.parentElement.removeChild(notif)
        }, 500);
    })
    notif.appendChild(closeBut)
    try{
        document.getElementById("notifContainer").appendChild(notif)
        setTimeout(() => {
            notif.style.opacity = "1"
            notif.style.transform = "translateY(0)"
        }, 100);
        setTimeout(() => {
            notif.style.opacity = "0"
            setTimeout(() => {
                try{notif.parentElement.removeChild(notif)}catch(error){}
            }, 500);
        }, 15000);
    }catch(error){}
}

function validateEmail(email) {
    return !!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
}

/*if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            lat = position.coords.latitude
            lon = position.coords.longitude
            const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    if (data.address) {
                        try{
                            document.getElementById('userIp').innerText = data.address.state
                        }catch(error){}
                    } else {}
                })
                .catch(error => console.error("Error fetching city:", error));
            },
            (error) => console.error("Error getting location:", error)
    );
} else {
    console.error("Geolocation not supported.");
}*/

document.querySelectorAll('.dtlocal').forEach(inp=>{
    inp.addEventListener('click', ()=>{
        inp.showPicker();
    })
})

document.querySelectorAll(".prevable").forEach(img=>{
    img.addEventListener('click', ()=>{
        imageZoom = img.cloneNode(true)
        imagePrev = document.createElement('div')
        imagePrev.classList.add("preview-image", "flex-col", "flex-center")
        closeBut = document.createElement('i')
        closeBut.classList.add("fa-solid","fa-xmark","bt-hover")
        imagePrev.addEventListener('click', ()=>{
            try{
                document.body.removeChild(imagePrev)
            }catch(error){}
        })
        closeBut.addEventListener('click', ()=>{
            try{
                document.body.removeChild(closeBut.parentElement)
            }catch(error){}
        })
        imagePrev.appendChild(closeBut)
        imagePrev.appendChild(imageZoom)
        document.body.appendChild(imagePrev)
    })
})

const confirm = (isDanger, title, description) => {
    return new Promise((resolve) => {
        const container = document.createElement("div");
        container.classList.add("overtop-conf", "flex-row", "flex-center");
    
        const iconElement = document.createElement("i");
        if (isDanger) {
            iconElement.classList.add("fa-solid", "fa-triangle-exclamation", "icon-danger");
        } else {
            iconElement.classList.add("fa-solid", "fa-circle-info", "icon-confirm");
        }

        const confButton = document.createElement('button')
        confButton.classList.add("desactivate", isDanger?"dBut":"ndBut", "bt-hover")
        confButton.innerText = "Confirm"

        const cancButton = document.createElement('button')
        cancButton.classList.add("cancel", "bt-hover")
        cancButton.innerText = "Cancel"
        
        confButton.addEventListener("click", () => {
            try{
                document.body.removeChild(container)
            }catch(error){}
            resolve(true);
        });
    
        cancButton.addEventListener("click", () => {
            try{
                document.body.removeChild(container)
            }catch(error){}
            resolve(false);
        });

        const card = document.createElement("div");
        card.classList.add("card");

        const header = document.createElement("div");
        header.classList.add("header");

        const image = document.createElement("div");
        image.classList.add("image", isDanger ? "red-trans" : "green-trans");
        image.appendChild(iconElement);

        const content = document.createElement("div");
        content.classList.add("content");

        const titleElement = document.createElement("span");
        titleElement.classList.add("title");
        titleElement.innerText = title;

        const messageElement = document.createElement("p");
        messageElement.classList.add("message");
        messageElement.innerText = description;

        const actions = document.createElement("div");
        actions.classList.add("actions");
        actions.appendChild(confButton);
        actions.appendChild(cancButton);

        content.appendChild(titleElement);
        content.appendChild(messageElement);
        header.appendChild(image);
        header.appendChild(content);
        header.appendChild(actions);
        card.appendChild(header);
        container.appendChild(card);
        document.body.appendChild(container)
    });
};

/*
confirm(false, "Confirm Action", "Are you sure you want to proceed?").then((result) => {
    console.log(result);
});
*/

function removeImageChildren(parent) {
    const images = parent.querySelectorAll('img');
    images.forEach(img => img.remove());
}
  
function formatNumber(num) {
    if (num >= 1e9) {
      return (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'b';
    }
    if (num >= 1e6) {
      return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'm';
    }
    if (num >= 1e3) {
      return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num.toString();
}

function formatDate(dateString) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

try {
    document.querySelectorAll('.animated-heart').forEach(fb=>{
        fb.addEventListener('click', async (e)=>{
            if(!fb.parentElement.children[0].checked){
                v = parseInt(fb.id.substring(1, fb.id.indexOf('u')));
                u = parseInt(fb.id.substring(fb.id.indexOf('u') + 1));
                openLoader()
                try{
                    const response = await fetch(`${window.location.origin}/api/users/add/favorite`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ u, v }),
                    });
                    const data = await response.json();
                    pushNotif("i", data.message);
                    fb.parentElement.children[0].disabled = true
                    closeLoader()
                }catch(error){
                    pushNotif("e", "Somthing went wrong!");
                    closeLoader()
                }
            }else{
            }
        })
    })
} catch (error) {}
/*
pushNotif("e", "Error Message Notification")
pushNotif("i", "Information Message Notification")
pushNotif("w", "Warning Message Notification")
pushNotif("s", "Success Message Notification")
*/

function isEmail(mail) {
    return (/^[^\s@]+@[^\s@]+\.[^\s@]+$/).test(mail);
}

function isUsername(username) {
    return (/^[a-zA-Z][a-zA-Z0-9_]{4,}$/).test(username);
}

function isName(name) {
    return (/^[a-zA-Z]{3,10}$/).test(name);
}

function isZip(zip) {
    return (/^\d{3,}$/).test(zip);
}

function isValidPassword(password) {
    return (/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{9,}$/).test(password);
}

function checkPasswordStrength(password) {
    const errors = [];

    if (password.length < 8) {
        errors.push("Password must be at least 8 characters");
    }

    if (!/[A-Z]/.test(password)) {
        errors.push("Password must include an uppercase letter");
    }

    if (!/\d/.test(password)) {
        errors.push("Password must include a number");
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push("Password must include a special character");
    }

    return errors;
}

function checkUsername(username) {
    const errors = [];

    if (username.length < 5) {
        errors.push("Username must be at least 5 characters long");
    }

    if (!/^[a-zA-Z]/.test(username)) {
        errors.push("Username must start with a letter");
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        errors.push("Username can only contain letters, numbers, and underscores");
    }

    return errors;
}

function checkName(name) {
    const errors = [];

    if (name.length < 3 || name.length > 10) {
        errors.push("Name must be between 3 and 10 characters long");
    }

    if (!/^[a-zA-Z]+$/.test(name)) {
        errors.push("Name can only contain letters (A-Z or a-z)");
    }

    return errors;
}

function checkPhone(number) {
    const errors = [];

    if (!/^\d+$/.test(number)) {
        errors.push("Phone number must contain only digits");
    }

    const num = number.startsWith('0') ? number.slice(1) : number;

    if (num.length < 8) {
        errors.push("Phone number must be at least 8 digits long");
    }

    return errors;
}

function checkPasswordMatch(password, confirmPassword) {
    const errors = [];

    if (password !== confirmPassword) {
        errors.push("Passwords do not match");
    }

    return errors;
}

function isValidPhone(number) {
    return (/^0?(\d{8,})$/).test(number); // optional leading 0, at least 8 digits
}

function formatPhone(number) {
    return number.startsWith('0') ? number.slice(1) : number; // fixed `phone` typo
}

function inputErrors(title, errors) {
    const validation = document.createElement('div');
    validation.classList.add('validation');

    const errAlert = document.createElement('div');
    errAlert.classList.add('error-alert');

    const flexRow = document.createElement('div');
    flexRow.classList.add('flex-row');

    const iconWrapper = document.createElement('div');
    iconWrapper.classList.add('flex-shrink-0');

    const closeBut = document.createElement('i');
    closeBut.classList.add('error-svg', 'fa-solid', 'fa-xmark');
    closeBut.addEventListener('click', () => {
        validation.remove();
    });

    iconWrapper.appendChild(closeBut);

    const errorPromptContainer = document.createElement('div');
    errorPromptContainer.classList.add('error-prompt-container');

    const heading = document.createElement('p');
    heading.classList.add('error-prompt-heading');
    heading.textContent = title;

    const errorPromptWrap = document.createElement('div');
    errorPromptWrap.classList.add('error-prompt-wrap');

    const ul = document.createElement('ul');
    ul.classList.add('error-prompt-list');
    ul.setAttribute('role', 'list');

    errors.forEach(errorText => {
        const li = document.createElement('li');
        li.textContent = errorText;
        ul.appendChild(li);
    });

    errorPromptWrap.appendChild(ul);
    errorPromptContainer.appendChild(heading);
    errorPromptContainer.appendChild(errorPromptWrap);

    flexRow.appendChild(iconWrapper);
    flexRow.appendChild(errorPromptContainer);

    errAlert.appendChild(flexRow);
    validation.appendChild(errAlert);

    
    try {
        document.querySelectorAll('.validation').forEach(v=>{
            v.remove()
        })
    } catch (error) {}
    
    document.body.appendChild(validation);
    setTimeout(() => {
        validation.style.opacity = 1
    }, 100);
}

function validInput(inputId, type) {
    const input = document.getElementById(inputId);
    input.addEventListener('input', () => {
        let isValid = false;
        switch (type) {
            case "p":
                isValid = isValidPassword(input.value);
                break;
            case "e":
                isValid = isEmail(input.value);
                break;
            case "n":
                isValid = isName(input.value);
                break;
            case "z":
                isValid = isZip(input.value);
                break;
            case "u":
                isValid = isUsername(input.value);
                break;
            case "ph":
                isValid = isValidPhone(input.value);
                break;
        }
        input.style.border = isValid
            ? "2px solid var(--border-low)"
            : "2px solid rgba(235, 34, 34, 0.586)";
    });
}

function capitalizeFirstChar(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function animateNumber(targetElement, start, end, duration) {
    const element = document.getElementById(targetElement);
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentValue = Math.floor(start + (end - start) * progress);
        element.innerText = formatNumber(currentValue);

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
} 

function formatMoney(amount, decimals = 2) {
    amount = parseFloat(amount);
  
    const fixedAmount = amount.toFixed(decimals);
  
    const parts = fixedAmount.split('.');
    let integerPart = parts[0];
    const decimalPart = parts[1];
  
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
    return `${integerPart}.${decimalPart}`;
}

function formatFullDate(isoString) {
  const date = new Date(isoString);

  const day = date.getUTCDate();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[date.getUTCMonth()];
  const year = date.getUTCFullYear();

  let hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const formattedMinutes = minutes.toString().padStart(2, '0');

  return `${day} ${month} ${year} ${hours}:${formattedMinutes} ${ampm}`;
}

function animateMoney(targetElement, start, end, period) {
    const element = document.getElementById(targetElement);
    const range = end - start;
    let currentValue = start;
    const startTime = performance.now();
  
    function updateCounter(timestamp) {
      const elapsedTime = timestamp - startTime;
  
      const progress = Math.min(elapsedTime / period, 1);
      currentValue = start + range * progress;
  
      element.innerText = formatMoney(Math.floor(currentValue), 2);
  
      if (progress < 1) {
        requestAnimationFrame(updateCounter); 
      } else {
        element.innerText = formatMoney(end, 2);
      }
    }
  
    requestAnimationFrame(updateCounter);
}

function appendItem(list, value) {
    if (!list.includes(value)) {
        list.push(value);
    } else {
        console.log(`"${value}" is already in the list.`);
    }
    return list;
}

function removeItem(list, value) {
    const index = list.indexOf(value);
    if (index !== -1) {
        list.splice(index, 1);
    } else {
        console.log(`"${value}" not found in the list.`);
    }
    return list;
}

try {
    document.querySelectorAll('.dbm-table-minimize').forEach(bt=>{
        bt.addEventListener('click', ()=>{
            const chevron = bt.children[0]
            const table = bt.parentElement.parentElement.parentElement
            const tableHead = table.children[0]
            const tableBody = table.children[1]
            const tableFoot = table.children[2]
            isMin = chevron.classList[1] === "fa-chevron-down"
            if(isMin){
                chevron.classList.remove("fa-chevron-down")
                chevron.classList.add("fa-chevron-up")
                tableFoot.style.display = "none"
                tableBody.style.height = "0"
                tableBody.style.border = "none"
                tableHead.style.borderRadius = "8px"
            }else{
                chevron.classList.remove("fa-chevron-up")
                chevron.classList.add("fa-chevron-down")
                tableFoot.style.display = "flex"
                tableBody.style.height = `${(tableBody.children[1].children.length + 1)*3 }em`
                tableBody.style.border = "2px solid var(--border-low)"
                tableHead.style.borderRadius = "8px 8px 0 0"
            }
        })
    })
    
} catch (error) {}