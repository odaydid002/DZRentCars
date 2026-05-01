const getData = async (limit = 5, offset = 0, orderby = 'created_at') => {
    try {
        openLoader()
        let u = new URL(`${window.location.origin}/api/users/verfications`);
        let params = u.searchParams;

        params.set("limit", limit);
        params.set("offset", offset);
        params.set("orderby", orderby);

        u.search = params.toString();

        const response = await fetch(u);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const { data, approved, pending, rejected, total } = await response.json();
        closeLoader()
        return { data, approved, pending, rejected, total };
    } catch (error) {
        closeLoader()
        console.error("Failed to fetch orders:", error);
        pushNotif("e", "Something went wrong!");
        return null;
    }
};

const tableLimit = document.getElementById('accLimit')

let currentPage = 0;
let totalRows = 0;
let limit = parseInt(tableLimit.value);

const prevBtn = document.getElementById('tprevBtn');
const nextBtn = document.getElementById('tnextBtn');
const pageInfo = document.getElementById("tpageInfo");
const verfList = document.getElementById('verfList')
const dashtotal = document.getElementById('dashtotal')
const dashverified = document.getElementById('dashverified')
const dashPending = document.getElementById('dashPending')
const dashRejected = document.getElementById('dashRejected')
const totalpending = document.getElementById('totalpending')

const refrechContent = async () => {
    try {
        limit = parseInt(tableLimit.value);

        const offset = currentPage * limit;

        await getData(limit, offset).then(data => {
            if (!data) return;
            animateNumber('totalpending', 0, parseInt(data.pending), 500);

            totalRows = data.pending;
            verfList.innerHTML = '';

            let i = 1;
            data.data.forEach(user => {
                const row = document.createElement('div');
                row.classList.add("table-row");
                row.innerHTML = `
                    <div class="table-column"><p>${user.id}</p></div>
                    <div class="table-column">
                        <div class="flex-row center-start gap-lrg">
                            <div class="table-user-profile"><img src="${user.image}" alt="Profile"></div>
                            <div class="flex-col">
                                <p>${user.fname} ${user.lname}</p>
                                <span class="username">@${user.username}</span>
                            </div>
                        </div>
                    </div>
                    <div class="table-column"><p>${user.wilaya}, ${user.city}, ${user.address}</p></div>
                    <div class="table-column gap-min">
                        <i class="fa-solid fa-circle-${user.phone_status === true ? 'check' : 'xmark'}"></i>
                        <p>${user.phone}</p>
                    </div>
                    <div class="table-column"><p>${formatDate(user.date)}</p></div>
                    <div class="table-column">
                        <div class="flex-row center-start gap-lrg" style="margin-left: auto;">
                            <button class="uid-${user.uvid} bt bt-hover rej gap-lrg">
                                <i class="fa-solid fa-user-slash"></i><span>Reject</span>
                            </button>
                            <button class="uid-${user.uvid} bt bt-hover acc gap-lrg">
                                <i class="fa-regular fa-id-card"></i><span>Inspection</span>
                            </button>
                        </div>
                    </div>
                `;
                verfList.appendChild(row);
                verfList.style.height = `${i*3}em`
                i++;
            });

            document.querySelectorAll('.acc').forEach(bt=>{
                bt.addEventListener('click', async () => {
                    const uid = parseInt(bt.classList[0].substring(4))
                    await openInspection(uid)
                    document.querySelector('.req-approve').addEventListener('click', async ()=>{
                        confirm(false, "Confirm Action", "Are you sure you want to approve request?").then( async (result) => {
                            if(result){
                                openLoader()
                                const response = await fetch(`${window.location.origin}/api/users/verfications/update`, {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({ uid:uid, stat: "approved" }),
                                });
                                const data = await response.json();
                                if (response.ok) {
                                    refrechContent()
                                    refrechStats()
                                    closeLoader()
                                    closeInspection()
                                    pushNotif("s", "Request has been Approved!")
                                } else {
                                    closeLoader()
                                    throw new Error(data.error || "Failed!");
                                }
                            }
                        })
                    })
                    document.querySelector('.req-reject').addEventListener('click', async ()=>{
                        const uid = parseInt(bt.classList[0].substring(4))
                        openReject(uid)  
                    })
                })
            })

            document.querySelectorAll('.rej').forEach(bt=>{
                bt.addEventListener('click', async () => {
                    const uid = parseInt(bt.classList[0].substring(4))
                    openReject(uid)            
                })
            })

            gsap.set(".table-row", { x: -100, opacity: 0 });
            gsap.to(".table-row", { x: 0, stagger: 0.1, opacity: 1 });

            const start = totalRows === 0 ? 0 : (currentPage * limit) + 1;
            const end = Math.min((currentPage + 1) * limit, totalRows);
            pageInfo.textContent = `${start}-${end} of ${totalRows}`;

            prevBtn.disabled = currentPage === 0;
            nextBtn.disabled = (currentPage + 1) * limit >= totalRows;

        }).catch(error => {
            closeLoader()
            console.error(error);
            pushNotif("e", "Something went wrong!");
        })
    } catch (error) {
        console.error(error);
        pushNotif("e", "Something went wrong!");
        closeLoader();
    }
};

const refrechStats = async () => {
    try {
        await getData(10e6, 0).then(data => {
            if (!data) return;
            animateNumber('dashverified', 0, parseInt(data.approved), 500);
            animateNumber('dashPending', 0, parseInt(data.pending), 500);
            animateNumber('dashRejected', 0, parseInt(data.rejected), 500);
            animateNumber('dashtotal', parseInt(dashtotal.innerText), parseInt(data.total), 500);
        }).catch(error => {
            closeLoader();
            console.error(error);
            pushNotif("e", "Something went wrong!");
        })
    } catch (error) {
        console.error(error);
        pushNotif("e", "Something went wrong!");
        closeLoader();
    }
}

tableLimit.addEventListener('change', () => {
    currentPage = 0; 
    refrechContent();
});

prevBtn.addEventListener('click', () => {
    if (currentPage > 0) {
        currentPage--;
        refrechContent();
    }
});

nextBtn.addEventListener('click', () => {
    if ((currentPage + 1) * limit < totalRows) {
        currentPage++;
        refrechContent();
    }
});

const getUData = async (rid) => {
    try {
        openLoader()
        let u = new URL(`${window.location.origin}/api/docs/getreq`);
        let params = u.searchParams;

        params.set("rid", rid);

        u.search = params.toString();

        const response = await fetch(u);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const { data } = await response.json();
        closeLoader()
        return { data };
    } catch (error) {
        closeLoader()
        console.error("Failed to fetch User data:", error);
        pushNotif("e", "Something went wrong!");
        return null;
    }
}

const listverification = document.getElementById('listverification')

const openInspection = async (rid) => {
    await getUData(rid).then(data => {
        const user = data.data
        const inspectContainer = document.createElement('div')
        inspectContainer.classList.add("inspection-container")
        inspectContainer.innerHTML = `
            <div class="inspection flex-col">
                <i class="fa-solid fa-xmark bt-hover" id="insprctionClose"></i>
                <div class="insp-head flex-row w100">
                    <div class="flex-col center-start h100 w100">
                        <div class="insp-profile">
                            <img src="${user.image}" alt="Profile">
                        </div>
                        <div class="flex-col">
                            <h1>${user.fname} ${user.lname} <span class="sexe ${user.sexe=='M'?'male':'female'}">${user.sexe=='M'?'Male':'Female'}</span> </h1>
                            <p class="username">@${user.username}</p>
                        </div>
                        <div class="flex-col req-u-info pd1">
                            <h4>Full name</h4>
                            <h5>${user.lname} ${user.fname}</h5>
                            <div class="nav-break"></div>
                            <h4>Age</h4>
                            <h5>${user.age}</h5>
                            <div class="nav-break"></div>
                            <h4>Email</h4>
                            <h5>${user.email}</h5>
                            <div class="nav-break"></div>
                            <h4>Phone</h4>
                            <h5>${user.phone}</h5>
                            <div class="nav-break"></div>
                            <h4>Address</h4>
                            <h5>${user.wilaya}, ${user.city}, ${user.address}</h5>
                        </div>
                    </div>
                    <div class="flex-col flex-center gap-lrg h100 h-fit">
                        <div class="doc-container">
                            <img src="${user.image_front}" alt="Document">
                        </div>
                        <div class="doc-container">
                            <img src="${user.image_back}" alt="Document">
                        </div>
                    </div>
                </div>
                <div class="insp-foot flex-row center-spacebet">
                    <button class="bt bt-hover bt-req" id="reqCancel">Cancel</button>
                    <div class="flex-row center-start h100">
                        <button class="bt bt-hover req-approve">Approve</button>
                        <button class="bt bt-hover req-reject">Reject</button>
                    </div>
                </div>
            </div>
        `
        try { document.querySelectorAll('.inspection-container').forEach(c=>c.remove()) } catch (error) {}
        listverification.appendChild(inspectContainer)

        gsap.set(".inspection", { y: 100, opacity: 0 });
        gsap.to(".inspection", { y: 0, opacity: 1});

        document.getElementById('insprctionClose').addEventListener('click', closeInspection)
        document.getElementById('reqCancel').addEventListener('click', closeInspection)

    }).catch(error => {
        closeLoader();
        console.error(error);
        pushNotif("e", "Something went wrong!");
    })
}

const openReject = (uid) => {
    const rejContainer = document.createElement('div')
    rejContainer.classList.add("rejection-container")
    rejContainer.innerHTML = `
        <div class="rejection">
            <div class="rejection-bod w100 flex-col">
                <h1>Provide reason for rejection</h1>
                <ul class="flex-col center-start w100 gap-min">
                    <label class="rej-opt flex-row center-spacebet w100">
                        <input type="radio" value="Invalid Documents" name="rejopt" checked hidden>
                        <div class="flex-row gap-lrg h100 center-start">
                            <i class="fa-solid fa-file-circle-xmark" style="background-color: rgba(137, 43, 226, 0.09); color: blueviolet;"></i>
                            <p>Invalid Documents</p>
                        </div>
                        <div class="flex-row flex-center h100">
                            <div class="radio-fk"></div>
                        </div>
                    </label>
                    <label class="rej-opt flex-row center-spacebet w100">
                        <input type="radio" value="Invalid or wrong Address" name="rejopt" hidden>
                        <div class="flex-row gap-lrg h100 center-start">
                            <i class="fa-solid fa-house-circle-exclamation" style="background-color: rgba(43, 198, 226, 0.09); color: rgb(43, 137, 226);"></i>
                            <p>Invalid or wrong Address</p>
                        </div>
                        <div class="flex-row flex-center h100">
                            <div class="radio-fk"></div>
                        </div>
                    </label>
                    <label class="rej-opt flex-row center-spacebet w100">
                        <input type="radio" value="Age is not sufficient" name="rejopt" hidden>
                        <div class="flex-row gap-lrg h100 center-start">
                            <i class="fa-solid fa-person-circle-exclamation" style="background-color: rgba(226, 43, 43, 0.09); color: rgb(226, 116, 43);"></i>
                            <p>Age is not sufficient</p>
                        </div>
                        <div class="flex-row flex-center h100">
                            <div class="radio-fk"></div>
                        </div>
                    </label>
                    <label class="rej-opt flex-row center-spacebet w100">
                        <input type="radio" value="Invalid or unconfirmed phone number" name="rejopt" hidden>
                        <div class="flex-row gap-lrg h100 center-start">
                            <i class="fa-solid fa-phone-slash" style="background-color: rgba(83, 226, 43, 0.09); color: rgb(150, 233, 109);"></i>
                            <p>Invalid or unconfirmed phone number</p>
                        </div>
                        <div class="flex-row flex-center h100">
                            <div class="radio-fk"></div>
                        </div>
                    </label>
                    <label class="rej-opt flex-row center-spacebet w100" id="otherReason">
                        <input type="radio" value="other" name="rejopt" hidden>
                        <div class="flex-row gap-lrg h100 center-start">
                            <i class="fa-solid fa-quote-right" style="background-color: rgba(129, 129, 129, 0.09); color: rgb(142, 142, 142);"></i>
                            <div class="flex-row center-start h100">
                                <p>Other</p>
                                <input id="reason" type="text">
                            </div>
                        </div>
                        <div class="flex-row flex-center h100">
                            <div class="radio-fk"></div>
                        </div>
                    </label>
                </ul>
            </div>
            <div class="rejection-foot w100 flex-row center-spacebet">
                <button class="bt bt-hover bt-req" id="rejCancel">Cancel</button>
                <button class="bt bt-hover req-reject" id="rejRej">Reject</button>
            </div>
        </div>
    `
    
    listverification.appendChild(rejContainer)
    gsap.from(".rejection", { y: -100, opacity: 0 });
    
    document.getElementById('rejRej').addEventListener('click', async () => {
        confirm(true, "Confirm Action", "Are you sure you want to reject request?").then( async (result) => {   
            if(result){
                openLoader()
                const reason = document.querySelector('input[name="rejopt"]:checked')
                const otherReason = document.getElementById('reason')
                const reasonVal = reason.value == "other"?otherReason.value:reason.value
                console.log(reasonVal)
                const response = await fetch(`${window.location.origin}/api/users/verfications/update`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ uid:uid, stat: "rejected", reason: reasonVal }),
                });
                const data = await response.json();
                if (response.ok) {
                    refrechContent()
                    refrechStats()
                    closeLoader()
                    closeReject()
                    closeInspection() 
                    pushNotif("i", "Request has been rejected!")
                } else {
                    closeLoader()
                    throw new Error(data.error || "Failed!");
                }
            }
        });
    })

    document.getElementById('rejCancel').addEventListener('click', closeReject)
}

const closeReject = () => {
    try {
        gsap.to(".rejection", { y: -300, opacity: 0 });
        gsap.to(".rejection-container", { opacity: 0 });
        setTimeout(
            ()=>{
                try { document.querySelectorAll('.rejection-container').forEach(el=>el.remove()) } catch (error) {}
        }, 500)
    } catch (error) {}
}

const closeInspection = ()=> {
    try {
        gsap.set(".inspection", { y: 0, opacity: 1 });
        gsap.to(".inspection", { y: -100, opacity: 0});
        gsap.to(".inspection-container", {opacity: 0});
        setTimeout(()=>{
            try { document.querySelector('.inspection-container').remove() }catch (error){}
        }, 500)
    }catch (error){}
}

document.addEventListener('DOMContentLoaded', () => {
    refrechContent();
    refrechStats()
});