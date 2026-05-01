const getStats = async (limit, offset) => {
    try {
        openLoader()
        let u = new URL(`${window.location.origin}/api/orders/counts`);

        const response = await fetch(u);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const { 
            total,
            pending,
            active,
            completed,
            canceled,
            approved,
            returning

        } = await response.json();

        closeLoader()

        return { 
            total,
            pending,
            active,
            completed,
            canceled,
            approved,
            returning
         };
    } catch (error) {
        closeLoader()
        console.error("Failed to fetch Rentals:", error);
        pushNotif("e", "Something went wrong!");
        return null;
    }
};

const statTot = document.getElementById('statTot')
const statCld = document.getElementById('statCld')
const statAtv = document.getElementById('statAtv')
const statPdg = document.getElementById('statPdg')
const statCcd = document.getElementById('statCcd')
const statApv = document.getElementById('statApv')
const statRtg = document.getElementById('statRtg')
const rntPgsCc = document.getElementById('rntPgsCc')
const rntPgsAp = document.getElementById('rntPgsAp')
const rntPgsRe = document.getElementById('rntPgsRe')
const rntPgsC = document.getElementById('rntPgsC')
const rntPgsA = document.getElementById('rntPgsA')
const rntPgsP = document.getElementById('rntPgsP')

const updateStats = async() => {
    try {
        getStats().then(data => {
            console.log(data)
            total = data.total
            pending = data.pending
            active = data.active
            completed = data.completed
            canceled = data.canceled
            approved = data.approved
            returning = data.returning

            console.log(data)

            animateNumber('statTot', parseInt(statTot.innerText), parseInt(total), 1000);
            animateNumber('statCld', parseInt(statCld.innerText), parseInt(completed), 1000);
            animateNumber('statAtv', parseInt(statAtv.innerText), parseInt(active), 1000);
            animateNumber('statPdg', parseInt(statPdg.innerText), parseInt(pending), 1000);
            animateNumber('statCcd', parseInt(statCcd.innerText), parseInt(canceled), 1000);
            animateNumber('statApv', parseInt(statApv.innerText), parseInt(approved), 1000);
            animateNumber('statRtg', parseInt(statRtg.innerText), parseInt(returning), 1000);

            rntPgsC.style.width = `${ completed * 100 / total}%`
            rntPgsA.style.width = `${ active * 100 / total}%`
            rntPgsP.style.width = `${ pending * 100 / total}%`
            rntPgsCc.style.width = `${ canceled * 100 / total}%`
            rntPgsAp.style.width = `${ approved * 100 / total}%`
            rntPgsRe.style.width = `${ returning * 100 / total}%`

        })
    }catch(error){
        console.error(error)
    }
}

const getData = async (limit, offset) => {
    try {

        let u = new URL(`${window.location.origin}/api/orders/getOrders`);
        let params = u.searchParams;

        params.set("limit", limit);
        params.set("offset", offset);
        params.set("order", "created_at");
        params.set("dire", "DESC");
        params.set("status", "")

        u.search = params.toString();

        const response = await fetch(u);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const { 
            orders, 
            total,
            pending,
            active,
            completed,
            canceled

         } = await response.json();
        return { 
            orders, 
            total,
            pending,
            active,
            completed,
            canceled

         };
    } catch (error) {
        console.error("Failed to fetch Rentals:", error);
        pushNotif("e", "Something went wrong!");
        return null;
    }
};

const getInvoiceData = async (rid) => {
      try {
        let u = new URL(`${window.location.origin}/api/orders/invoice/${rid}`);

        const response = await fetch(u);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const { 
            result
         } = await response.json();
        return { result };
    } catch (error) {
        console.error("Failed to fetch Rentals:", error);
        pushNotif("e", "Something went wrong!");
        return null;
    }  
}

const deleteRental = async (oid) => {
    try {
        openLoader()
        let u = new URL(`${window.location.origin}/api/orders/remove/${oid}`);

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
        console.error("Failed to delete order:", error);
        pushNotif("e", "Something went wrong!");
        return null;
    }
}

const completeRental = async (oid) => {
    try {
        openLoader()
        let u = new URL(`${window.location.origin}/api/orders/return/${oid}`);

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
        console.error("Failed to return order:", error);
        pushNotif("e", "Something went wrong!");
        return null;
    }
}

function generateInvoice(data) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const info = data.result;

  const additions = info.additions?.additions || [];
  const discounts = info.discounts?.discounts || [];

  // Header
  doc.setFontSize(16);
  doc.text("INVOICE", 105, 20, { align: "center" });

  // Client and Rental Info
  doc.setFontSize(10);
  doc.text(`Invoice #: ${info.bill_id}`, 14, 30);
  doc.text(`Date: ${new Date(info.invoice_created_at).toLocaleString()}`, 14, 36);

  doc.text(`Client: ${info.fname} ${info.lname}`, 14, 46);
  doc.text(`Phone: ${info.phone}`, 14, 52);
  doc.text(`Email: ${info.email}`, 14, 58);

  doc.text(`Car: ${info.brand_name} ${info.model} (${info.color}, ${info.fab_year})`, 14, 68);
  doc.text(`Rental Period: ${new Date(info.start_date).toLocaleString()} -> ${new Date(info.end_date).toLocaleString()}`, 14, 74);

  let y = 84;

  // Additions Table
  if (additions.length) {
    doc.autoTable({
      startY: y,
      head: [["Addition", "Qty", "Unit Price (DA)", "Total (DA)"]],
      body: additions.map(a => [
        a.name,
        a.quantity,
        a.price.toFixed(2),
        (a.price * a.quantity).toFixed(2)
      ])
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // Discounts Table
  if (discounts.length) {
    doc.autoTable({
      startY: y,
      head: [["Discount", "Value (%)"]],
      body: discounts.map(d => [
        d.name,
        `${d.value}%`
      ])
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // Summary
  const totalAdditions = additions.reduce((sum, a) => sum + a.price * a.quantity, 0);
  const discountPercent = discounts.reduce((sum, d) => sum + parseFloat(d.value), 0);
  const discountAmount = (parseFloat(info.vehicle_price) + totalAdditions) * discountPercent / 100;

  const total = parseFloat(info.total_price);
  const insurance = parseFloat(info.insurance);

  doc.setFontSize(12);
  doc.text("Summary:", 14, y);
  y += 6;

  const summary = [
    ["Vehicle Price", `${parseFloat(info.vehicle_price).toFixed(2)} DA`],
    ["Additions", `${totalAdditions.toFixed(2)} DA`],
    ["Discounts", `-${discountAmount.toFixed(2)} DA`],
    ["Insurance", `${insurance.toFixed(2)} DA`],
    ["Total", `${total.toFixed(2)} DA`]
  ];

  summary.forEach(([label, value]) => {
    doc.text(`${label}:`, 14, y);
    doc.text(value, 180, y, { align: "right" });
    y += 6;
  });

  // Save PDF
  doc.save(`invoice-${info.bill_id}.pdf`);
}

const ordersLoader = document.getElementById('ordersLoader')
const ordersTableBody = document.getElementById('rtBod')
const ordersLimit = document.getElementById('ordersLimit')
const ordersOffset = document.getElementById('ordersOffset')
const ordersCurrentPage = document.getElementById('ordersCurrentPage')

const refrechRentals = async (limit = parseInt(document.getElementById('ordersLimit').value), offset = parseInt(document.getElementById('ordersOffset').value)) => {
    try {
        ordersLoader.style.opacity = "1";
        Array.from(ordersTableBody.children).forEach(child => child.remove());

        getData(limit, offset).then(data => {
            ordersLoader.style.opacity = "0";
            if (data && data.orders) {
                const { orders, total } = data;
    
                orders.forEach(order => {
                    const tRow = document.createElement("div");
                    tRow.classList.add("rt-row", "rt-row-el");
                    let diffMs = new Date(new Date(order.end_date) - new Date(order.start_date))

                    if (order.rental_type === "d") {
                        period = Math.floor(diffMs / (1000 * 60 * 60 * 24))
                      } else if (order.rental_type === "h") {
                        period = Math.floor(diffMs / (1000 * 60 * 60))
                      }
                    tRow.innerHTML = `
                        <p>${order.id}</p>
                        <div class="flex-row center-start gap-lrg">
                            <div class="table-user-profile"><img src="${order.image}" alt="Profile"></div>
                            <div class="flex-col">
                                <p>${order.fname} ${order.lname}</p>
                                <span class="username">@${order.username}</span>
                            </div>
                        </div>
                        <div class="flex-row center-start gap-lrg">
                            <div class="table-user-profile"><img src="${order.logo}" alt="Vehicle"></div>
                            <p>${order.brand_name} ${order.model} ${order.fab_year}</p>
                        </div>
                        <p>${formatDate(order.created_at)}</p>
                        <p>${formatDate(order.start_date)}</p>
                        <p>${period} ${order.rental_type == "d"?"Days":"Hours"}</p>
                        <p>${formatMoney(order.total_price + order.fees + order.insurance, 2)} <span class="currence">DZD</span></p>
                        <p class="rt-status rt-${order.status}">${capitalizeFirstChar(order.status)}</p>
                        <div class="flex-row center-start gap-lrg">
                        <i class=" o${order.id} fa-regular fa-trash-can bt-delete bt-hover" title="Delete"></i>
                        <i class=" o${order.id} fa-solid fa-file-invoice bt-invoice bt-hover" title="Invoice"></i>
                            <i class=" o${order.id} ${order.status=="returning"?"":"bt-hidden"}  fa-solid fa-calendar-check bt-return bt-hover" title="Confirm return"></i>
                            <i class=" o${order.id} ${order.status=="pending"?"":"bt-hidden"} fa-solid fa-check-to-slot bt-confirm bt-hover" title="Confirm"></i>
                        </div>
                    `
                    ordersTableBody.appendChild(tRow);
                });
                document.querySelectorAll(".bt-delete").forEach(bt=>{
                    bt.addEventListener('click', ()=>{
                        confirm(true, "Confirm Action", "Are you sure you want to delete this rental?").then((result) => {
                            if(result){
                                const oid = bt.classList[0].substring(1)
                                deleteRental(oid).then(data => {
                                    if(data.message) pushNotif("i", data.message)
                                })
                                refrechRentals()
                            }
                        });
                    })
                })

                 document.querySelectorAll(".bt-confirm").forEach(bt=>{
                    bt.addEventListener('click', ()=>{
                        confirm(false, "Confirm Action", "Are you sure you want to approve this rental?").then((result) => {
                            if(result){
                                const oid = bt.classList[0].substring(1)
                                try{
                                    fetch(`${window.location.origin}/api/orders/status`, {
                                    method: "POST",
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ rid: oid, status: "approved" }),
                                    })
                                    .then(response => response.json())
                                    .then(data => {
                                        if (data.message) {
                                            pushNotif("i", data.message)
                                            refrechRentals()
                                        } else {
                                            pushNotif("e", `Somthing went wrong!`)
                                        }
                                    })
                                    .catch(error => {
                                        pushNotif("e", "Somthing went wrong!")
                                    }); 
                                }catch(error){
                                    pushNotif("e", "Somthing went wrong!")
                                }
                            }
                        });
                    })
                })

                document.querySelectorAll(".bt-invoice").forEach(bt=>{
                    bt.addEventListener('click', ()=>{
                        openLoader()
                        const rid = bt.classList[0].substring(1)
                        getInvoiceData(rid).then(data=>{
                            console.log(data)
                            generateInvoice(data)
                        }).finally(()=>{
                            closeLoader()
                        })
                    })
                })

                document.querySelectorAll(".bt-return").forEach(bt=>{
                    bt.addEventListener('click', ()=>{
                        confirm(false, "Confirm Action", "Are you sure you want to confirm return?").then((result) => {
                            if(result){
                                const oid = bt.classList[0].substring(1)
                                completeRental(oid).then(data=>{
                                    if(data) pushNotif('i', data.message)
                                    refrechRentals()
                                })
                            }
                        });
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
                        <select class="select-reg" id="ordersCurrentPage">
                            ${options}
                        </select>
                        <p class="para-sml">Show per page: </p>
                        <input class="select-reg" type="number" min="0" max="50" value="${limit}" id="ordersLimit" style="width: 4em; padding-right: 0; height: 2.5em; text-align: center;">
                        <p class="para-sml">Offset: </p>
                        <input class="select-reg" type="number" value="${offset}" id="ordersOffset" style="width: 4em; padding-right: 0; height: 2.5em; text-align: center;">
                    </div>
                    <div class="flex-row center-start gap-lrg" id="orderTableFoot">
                        <p class="para-sml">${offset + 1}-${Math.min(offset + limit, total)} of ${total} Orders</p>
                        <div class="flex-row center-start gap-lrg">
                            <button class="bt bt-hover bt-pagin" id="oPrevB">&lt;</button>
                            <button class="bt bt-hover bt-pagin" id="oNextB">&gt;</button>
                        </div>
                    </div>
                `;

                document.getElementById('ordersLimit').addEventListener('change', ()=> {refrechRentals()})
                document.getElementById('ordersOffset').addEventListener('change', ()=> {refrechRentals()})
    
                const newOrdersCurrentPage = document.getElementById('ordersCurrentPage');
    
                newOrdersCurrentPage.addEventListener('change', () => {
                    const selectedPage = parseInt(newOrdersCurrentPage.value);
                    const newOffset = (selectedPage - 1) * limit;
                    ordersOffset.value = newOffset; 
                    refrechRentals(limit, newOffset);
                });
    
                document.getElementById('oPrevB').addEventListener('click', () => {
                    const prevPage = parseInt(newOrdersCurrentPage.value) - 1;
                    if (prevPage >= 1) {
                        const newOffset = (prevPage - 1) * limit;
                        ordersOffset.value = newOffset;
                        refrechRentals(limit, newOffset);
                    }
                });
    
                document.getElementById('oNextB').addEventListener('click', () => {
                    const nextPage = parseInt(newOrdersCurrentPage.value) + 1;
                    if (nextPage <= totalPages) {
                        const newOffset = (nextPage - 1) * limit;
                        ordersOffset.value = newOffset;
                        refrechRentals(limit, newOffset);
                    }
                });
            }
        })
        .catch(error => {
            ordersLoader.style.opacity = "0";
            pushNotif("e", "Something went wrong!");
            console.error(error);
        });
    } catch (error) {
        console.error(error)
    }
}

const refrechContent = async () => {
    updateStats()
    refrechRentals()
}

const downBut = document.getElementById('oDownload')

downBut.addEventListener('click', ()=>{
    try {
        openLoader()
        getData(999999999, 0).then(data => {
            if (!data || !data.orders || data.orders.length === 0) return;
            const headers = [
                "Order ID",
                "Client",
                "Vehicle",
                "Created at",
                "Start at",
                "Period",
                "Total price (dzd)",
                "Status"
            ];
        
            const csvRows = [
                headers.join(",")
            ];

            data.orders.forEach(order => {

                let diffMs = new Date(new Date(order.end_date) - new Date(order.start_date))

                if (order.rental_type === "d") {
                    period = Math.floor(diffMs / (1000 * 60 * 60 * 24))
                } else if (order.rental_type === "h") {
                    period = Math.floor(diffMs / (1000 * 60 * 60))
                }

                const row = [
                    order.id,
                    `${order.fname} ${order.lname}`,
                    `${order.brand_name} ${order.model} ${order.fab_year}`,
                    formatDate(order.created_at),
                    formatDate(order.start_date),
                    `${period} ${order.rental_type == "d"?"Days":"Hours"}`,
                    order.total_price,
                    order.status
                ];
                csvRows.push(row.map(val => `"${val}"`).join(",")); // Escape values in quotes
            });

            const csvContent = csvRows.join("\n");
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            closeLoader()
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `rentals_${Date.now()}.csv`);
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

document.addEventListener('DOMContentLoaded', refrechContent)