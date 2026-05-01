const clientsLoader = document.getElementById('clientsLoader')
const clientsTableBody = document.getElementById('rtBod')
const clientsLimit = document.getElementById('clientsLimit')
const clientsOffset = document.getElementById('clientsOffset')
const clientsCurrentPage = document.getElementById('clientsCurrentPage')
const statTot = document.getElementById('statTot')

const bnContainer = document.getElementById('userBan')
const bnCancelBut = document.querySelector('.bancnlbt')
const bnBanBut = document.querySelector('.banlbt')
const bnCloseBut = document.querySelector('.banCloseBut')
const bnReason = document.getElementById('banReason')
const bnPeriod = document.getElementById('banPeriod')

const mailContainer = document.getElementById('userMailer')
const mailCancelBut = document.querySelector('.cancelMail')
const mailBut = document.querySelector('.sendMail')
const mailCloseBut = document.querySelector('.mailerCloseBut')
const toEmail = document.getElementById('toEmail')
const mailSubject = document.getElementById('mailSubject')
const mailMessage = document.getElementById('mailMessage')

const openBanner = (uid) => {
    bnContainer.style.visibility = 'visible'
    gsap.set(".ban-container", { opacity: 0, y:100 });
    gsap.to(".ban-container", { stagger: 0.1, opacity: 1,y:0 });
    const newElement = bnBanBut.cloneNode(true);
    bnBanBut.parentNode.replaceChild(newElement, bnBanBut);
    newElement.addEventListener('click', ()=> {
        confirm(true, "Confirm Action", "Are you sure you want to ban client?").then((result) => {
            if(result){
                banUser(uid, bnReason.value, bnPeriod.value).then(data=>{
                    pushNotif('i', data.message)
                    closeBanner()
                    refrechClients()
                })
            }
        });
    })
}

const closeBanner = () => {
    gsap.to(".ban-container", { stagger: 0.1, opacity: 0,y:-100 });
    setTimeout(() => {
        bnContainer.style.visibility = 'hidden'
    }, 200);
}

const openMailer = (email) => {
    mailContainer.style.visibility = 'visible'
    toEmail.value = email
    gsap.set(".mailer", { opacity: 0, y:100 });
    gsap.to(".mailer", { stagger: 0.1, opacity: 1,y:0 });
    const newElement = mailBut.cloneNode(true);
    mailBut.parentNode.replaceChild(newElement, mailBut);
    newElement.addEventListener('click', ()=> {
        confirm(false, "Send email", "Are you sure you want to send email?").then((result) => {
            if(result){
                sendMail(email, mailSubject.value, mailMessage.value).then(data=>{
                    pushNotif('i', data.message)
                    closeMailer()
                })
            }
        });
    })
}

const closeMailer = () => {
    gsap.to(".mailer", { stagger: 0.1, opacity: 0,y:-100 });
    setTimeout(() => {
        mailContainer.style.visibility = 'hidden'
    }, 200);
}

const getData = async (limit, offset, search, sexe, wilaya) => {
    try {

        let u = new URL(`${window.location.origin}/api/users/getClients`);
        let params = u.searchParams;

        params.set("limit", limit);
        params.set("offset", offset);
        params.set("order", "id");
        params.set("dire", "ASC");
        params.set("sexe", sexe);
        params.set("wilaya", wilaya);
        params.set("search", search);

        u.search = params.toString();

        const response = await fetch(u);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const { 
            clients, 
            total
         } = await response.json();
        return { 
            clients, 
            total
         };
    } catch (error) {
        console.error("Failed to fetch Clients:", error);
        pushNotif("e", "Something went wrong!");
        return null;
    }
};

const banUser = async (uid, reason = "", period = 30) => {
    try {

        let u = new URL(`${window.location.origin}/api/users/${uid}/ban`);
        let params = u.searchParams;

        params.set("period", period);
        params.set("reason", reason);

        u.search = params.toString();

        const response = await fetch(u);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const { 
            message
         } = await response.json();

        return {message}

    } catch (error) {
        console.error("Failed to ban client:", error);
        pushNotif("e", "Something went wrong!");
        return null
    }
}

const unbanUser = async (uid) => {
    try {

        let u = new URL(`${window.location.origin}/api/users/${uid}/unban`);
        let params = u.searchParams;

        u.search = params.toString();

        const response = await fetch(u);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const { 
            message
         } = await response.json();

        return {message}

    } catch (error) {
        console.error("Failed to ban client:", error);
        pushNotif("e", "Something went wrong!");
        return null
    }
}

const sendMail = async (email, subject, msg) => {
    try {
        openLoader()
        const response = await fetch(`${window.location.origin}/api/email/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to: email,
                subject: subject,
                msg: msg
            })
        });
        closeLoader()
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const { message } = await response.json();
        return { message };

    } catch (error) {
        closeLoader()
        console.error("Failed to send email:", error);
        pushNotif("e", "Something went wrong!");
        return null;
    }
};

const refrechClients = async (limit = parseInt(document.getElementById('clientsLimit').value), offset = parseInt(document.getElementById('clientsOffset').value), search = shC.value, sexe =  sxC.value, wilaya = swC.value) => {
    try {
        clientsLoader.style.opacity = "1";
        Array.from(clientsTableBody.children).forEach(child => child.remove());

        getData(limit, offset, search, sexe, wilaya).then(data => {
            clientsLoader.style.opacity = "0";
            if (data && data.clients) {
                const { clients, total } = data;
                animateNumber('statTot', parseInt(statTot.innerText), parseInt(total), 1000);
                clients.forEach(client => {
                    const tRow = document.createElement("div");
                    tRow.classList.add("rt-row-c", "rt-row-el");
                    tRow.innerHTML = `
                        <p>${client.id}</p>
                        <div class="flex-row center-start gap-lrg">
                            <div class="table-user-profile">
                                ${client.is_banned?"<i class='fa-solid fa-ban banned' title='Banned'></i>":""}
                                <img src="${client.image}" alt="Profile">
                            </div>
                            <div class="flex-col">
                                <p>${client.fname} ${client.lname}</p>
                                <span class="username">@${client.username} <i class="fa-solid fa-circle-${client.account_status?"check verified":"xmark nverified"} "></i></span>
                            </div>
                        </div>
                        <p>${client.age}</p>
                        <p class="sexe ${client.sexe=="M"?"male":"female"}">${client.sexe=="M"?"Male":"Female"}</p>
                        <p>${client.wilaya}, ${client.city}, ${client.address}</p>
                        <p>${client.email}</p>
                        <p>${client.phone}</p>
                        <p>${formatDate(client.created_at)}</p>
                        <div class="flex-row flex-center gap-lrg">
                            <i class="fa-regular fa-envelope smlbut bt-hover" title="Send Email"></i>
                            ${client.is_banned?'<i class="fa-solid fa-lock-open unbanbut bt-hover"></i>':'<i class="fa-solid fa-ban banbut bt-hover" title="Suspend"></i>'}
                        </div>
                    `
                    clientsTableBody.appendChild(tRow);
                });

                document.querySelectorAll('.unbanbut').forEach(bt=>{
                    bt.addEventListener('click', ()=>{
                        confirm(false, "Confirm Action", "Are you sure you want to unban client?").then((result) => {
                            if(result){
                                uid = parseInt(bt.parentElement.parentElement.children[0].textContent)
                                unbanUser(uid).then(data=>{
                                    pushNotif('i', data.message)
                                    refrechClients()
                                })
                            }
                        });
                    })
                })

                document.querySelectorAll('.banbut').forEach(bt=>{
                    bt.addEventListener('click', ()=>{
                        uid = parseInt(bt.parentElement.parentElement.children[0].textContent)
                        openBanner(uid)
                    })
                })

                document.querySelectorAll('.smlbut').forEach(bt=>{
                    bt.addEventListener('click', async ()=>{
                        const uemail = bt.parentElement.parentElement.children[5].textContent
                        openMailer(uemail)
                    })
                })
    
                gsap.set(".rt-row-el:nth-child(2n+1)", { opacity: 0, x:100 });
                gsap.set(".rt-row-el:nth-child(2n)", { opacity: 0, x:-100 });
                gsap.to(".rt-row-el", { stagger: 0.1, opacity: 1,x:0 });
    
                const totalPages = Math.ceil(total / limit);
                const currentPage = Math.floor(offset / limit) + 1;
    
                let options = "";
                for (let i = 1; i <= totalPages; i++) {
                    options += `<option value="${i}" ${i === currentPage ? 'selected' : ''}>${i}</option>`;
                }
    
                document.getElementById('rtPagination').innerHTML = `
                    <div class="flex-row center-start gap-lrg">
                        <p class="para-sml">Page: </p>
                        <select class="select-reg" id="clientsCurrentPage">
                            ${options}
                        </select>
                        <p class="para-sml">Show per page: </p>
                        <input class="select-reg" type="number" min="0" max="50" value="${limit}" id="clientsLimit" style="width: 4em; padding-right: 0; height: 2.5em; text-align: center;">
                        <p class="para-sml">Offset: </p>
                        <input class="select-reg" type="number" value="${offset}" id="clientsOffset" style="width: 4em; padding-right: 0; height: 2.5em; text-align: center;">
                    </div>
                    <div class="flex-row center-start gap-lrg" id="clientTableFoot">
                        <p class="para-sml">${offset + 1}-${Math.min(offset + limit, total)} of ${total} clients</p>
                        <div class="flex-row center-start gap-lrg">
                            <button class="bt bt-hover bt-pagin" id="oPrevB">&lt;</button>
                            <button class="bt bt-hover bt-pagin" id="oNextB">&gt;</button>
                        </div>
                    </div>
                `;

                document.getElementById('clientsLimit').addEventListener('change', ()=> {refrechClients()})
                document.getElementById('clientsOffset').addEventListener('change', ()=> {refrechClients()})
    
                const newClientsCurrentPage = document.getElementById('clientsCurrentPage');
    
                newClientsCurrentPage.addEventListener('change', () => {
                    const selectedPage = parseInt(newClientsCurrentPage.value);
                    const newOffset = (selectedPage - 1) * limit;
                    clientsOffset.value = newOffset; 
                    refrechClients(limit, newOffset);
                });
    
                document.getElementById('oPrevB').addEventListener('click', () => {
                    const prevPage = parseInt(newClientsCurrentPage.value) - 1;
                    if (prevPage >= 1) {
                        const newOffset = (prevPage - 1) * limit;
                        clientsOffset.value = newOffset;
                        refrechClients(limit, newOffset);
                    }
                });
    
                document.getElementById('oNextB').addEventListener('click', () => {
                    const nextPage = parseInt(newClientsCurrentPage.value) + 1;
                    if (nextPage <= totalPages) {
                        const newOffset = (nextPage - 1) * limit;
                        clientsOffset.value = newOffset;
                        refrechClients(limit, newOffset);
                    }
                });
            }
        })
        .catch(error => {
            clientsLoader.style.opacity = "0";
            pushNotif("e", "Something went wrong!");
            console.error(error);
        });
    } catch (error) {
        console.error(error)
    }
}

document.addEventListener("DOMContentLoaded", ()=>{
    refrechClients()
})

shC = document.getElementById('searchClient')
swC = document.getElementById('filterWilaya')
sxC = document.getElementById('filterSexe')

shC.addEventListener('input', ()=>{
    refrechClients(50, 0, shC.value, sxC.value, swC.value)
})

swC.addEventListener('change', ()=>{
    refrechClients(50, 0, shC.value, sxC.value, swC.value)
})

sxC.addEventListener('change', ()=>{
    refrechClients(50, 0, shC.value, sxC.value, swC.value)
})

const exportBut = document.getElementById('exportBut')

exportBut.addEventListener('click', ()=>{
    try {
        openLoader()
        getData(parseInt(document.getElementById('clientsLimit').value), parseInt(document.getElementById('clientsOffset').value), shC.value, sxC.value, swC.value).then(data => {
            if (!data || !data.clients || data.clients.length === 0) return;
            const headers = [
                "ID",
                "First name",
                "Last name",
                "address",
                "sexe",
                "age",
                "email",
                "phone"
            ];
        
            const csvRows = [
                headers.join(",")
            ];

            data.clients.forEach(client => {
                const row = [
                    client.id,
                    client.fname,
                    client.lname,
                    `${client.wilaya}, ${client.city}, ${client.address}`,
                    client.sexe=="M"?"Male":"Female",
                    client.age,
                    client.email,
                    client.phone
                ];
                csvRows.push(row.map(val => `"${val}"`).join(","));
            });

            const csvContent = csvRows.join("\n");
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            closeLoader()
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `Clients_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        })
        .finally(()=>{closeLoader()})
    } catch (error) {
        closeLoader()
        pushNotif("e", "Something went wrong!")
        console.error(error)
    }
})

bnCancelBut.addEventListener('click', closeBanner)
bnCloseBut.addEventListener('click', closeBanner)
mailCancelBut.addEventListener('click', closeMailer)
mailCloseBut.addEventListener('click', closeMailer)