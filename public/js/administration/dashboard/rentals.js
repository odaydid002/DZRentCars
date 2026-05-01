const ordersLoader = document.getElementById('ordersLoader')
const ordersTableBody = document.getElementById('ordersTableBody')
const clientsLimit = document.getElementById('clientsLimit')
const clientsOffset = document.getElementById('clientsOffset')
const ordersLimit = document.getElementById('ordersLimit')
const ordersOffset = document.getElementById('ordersOffset')
const ordersCurrentPage = document.getElementById('ordersCurrentPage')
let graph1;


const getOrders = async (limit, offset) => {
    try {

        //const office_id = document.getElementById('titlo').value

        let u = new URL(`${window.location.origin}/api/orders/getOrders`);
        let params = u.searchParams;

        params.set("limit", limit);
        params.set("offset", offset);
        params.set("order", "created_at");
        params.set("dire", "DESC");

        u.search = params.toString();

        const response = await fetch(u);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const { orders, total } = await response.json();
        return { orders, total };
    } catch (error) {
        console.error("Failed to fetch orders:", error);
        pushNotif("e", "Something went wrong!");
        return null;
    }
};

const refrechOrdersTable = (limit = parseInt(ordersLimit.value), offset = parseInt(ordersOffset.value)) => {
    try {
        ordersLoader.style.opacity = "1";
        Array.from(ordersTableBody.children).forEach(child => child.remove());
        ordersTableBody.parentElement.style.height = "fit-content"

        getOrders(limit, offset).then(data => {
            ordersLoader.style.opacity = "0";
            if (data && data.orders) {
                const { orders, total } = data;
    
                orders.forEach(order => {
                    const tRow = document.createElement("div");
                    tRow.classList.add("dbm-table-row", "row-orders-dash");
                    tRow.innerHTML = `
                        <div class="dbm-table-col table-id">
                            <p>${order.id}</p>
                        </div>
                        <div class="dbm-table-col">
                            <div class="flex-col">
                              <p>${order.fname} ${order.lname}</p>
                              <p class="plat-text para-sml">@${order.username}</p>
                            </div>
                        </div>
                        <div class="dbm-table-col">
                            <p>${order.brand_name} ${order.model} ${order.fab_year}</p>
                        </div>
                        <div class="dbm-table-col">
                            <p>${order.insurance}</p>
                        </div>
                        <div class="dbm-table-col">
                            <p>${order.fees}</p>
                        </div>
                        <div class="dbm-table-col">
                            <p>${order.total_price}</p>
                        </div>
                        <div class="dbm-table-col">
                            <p class="dbm-table-state dbm-${order.status.toString().toLowerCase()}">${order.status}</p>
                        </div>
                        <div class="dbm-table-col">
                            <p>${formatDate(order.start_date)}</p>
                        </div>
                        <div class="dbm-table-col">
                            <p>${formatDate(order.end_date)}</p>
                        </div>
                        <div class="dbm-table-col">
                            <p>${formatDate(order.created_at)}</p>
                        </div>
                    `
                    ordersTableBody.appendChild(tRow);
                });
    
                gsap.set(".row-orders-dash", { x: -100, opacity: 0 });
                gsap.to(".row-orders-dash", { x: 0, stagger: 0.1, opacity: 1 });
    
                const totalPages = Math.ceil(total / limit);
                const currentPage = Math.floor(offset / limit) + 1;
    
                let options = "";
                for (let i = 1; i <= totalPages; i++) {
                    options += `<option value="${i}" ${i === currentPage ? 'selected' : ''}>${i}</option>`;
                }
    
                document.getElementById('orderTableFoot').innerHTML = `
                    <div class="only-pc flex-row center-start">
                        <p class="para-sml">${offset + 1}-${Math.min(offset + limit, total)} of ${total} Orders</p>
                    </div>
                    <div class="flex-row center-start" style="gap: 0.625em;">
                        <select class="dbm-select" id="ordersCurrentPage">
                            ${options}
                        </select>
                        <button class="bt bt-hover bt-reg" id="oPrevB">Previous</button>
                        <button class="bt bt-hover bt-reg" id="oNextB">Next</button>
                    </div>
                `;
    
                const newOrdersCurrentPage = document.getElementById('ordersCurrentPage');
    
                newOrdersCurrentPage.addEventListener('change', () => {
                    const selectedPage = parseInt(newOrdersCurrentPage.value);
                    const newOffset = (selectedPage - 1) * limit;
                    ordersOffset.value = newOffset; 
                    refrechOrdersTable(limit, newOffset);
                });
    
                document.getElementById('oPrevB').addEventListener('click', () => {
                    const prevPage = parseInt(newOrdersCurrentPage.value) - 1;
                    if (prevPage >= 1) {
                        const newOffset = (prevPage - 1) * limit;
                        ordersOffset.value = newOffset;
                        refrechOrdersTable(limit, newOffset);
                    }
                });
    
                document.getElementById('oNextB').addEventListener('click', () => {
                    const nextPage = parseInt(newOrdersCurrentPage.value) + 1;
                    if (nextPage <= totalPages) {
                        const newOffset = (nextPage - 1) * limit;
                        ordersOffset.value = newOffset;
                        refrechOrdersTable(limit, newOffset);
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
};

const getStats = async (period) => {
    try{
        //const office_id = document.getElementById('titlo').value

        let u = new URL(`${window.location.origin}/api/orders/stats`);
        let params = u.searchParams;

        params.set("period", period);
        //params.set("office", office_id);

        u.search = params.toString();

        const response = await fetch(u);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const { stats, total } = await response.json();
        console.log(stats, total)
        return { stats, total };
    } catch (error) {
        console.error("Failed to fetch orders:", error);
        pushNotif("e", "Something went wrong!");
        return null;
    }
}

const getStatsDaily = async (period) => {
    try{
        //const office_id = document.getElementById('titlo').value

        let u = new URL(`${window.location.origin}/api/orders/stats/daily`);
        let params = u.searchParams;

        params.set("period", period);
        //params.set("office", office_id);

        u.search = params.toString();

        const response = await fetch(u);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const { stats, total } = await response.json();
        return { stats, total };
    } catch (error) {
        console.error("Failed to fetch orders:", error);
        pushNotif("e", "Something went wrong!");
        return null;
    }
}

const getStatsMonthly = async (period) => {
    try{
        //const office_id = document.getElementById('titlo').value

        let u = new URL(`${window.location.origin}/api/orders/stats/monthly`);
        let params = u.searchParams;

        params.set("period", period);
        //params.set("office", office_id);

        u.search = params.toString();

        const response = await fetch(u);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const { stats, total } = await response.json();
        console.log(stats, total)
        return { stats, total };
    } catch (error) {
        console.error("Failed to fetch orders:", error);
        pushNotif("e", "Something went wrong!");
        return null;
    }
}

const drawGraph1 = async (period) => {
    try {
        const { stats, total } = await getStatsDaily(period);

        const days = [];
        const incomes = [];

        stats.forEach(stat => {
            days.push(stat.day_name);
            incomes.push(stat.income);
        });

        const chart1 = document.getElementById('chart1').getContext('2d');

        // ✅ Destroy previous chart instance if it exists
        if (graph1) {
            graph1.destroy();
        }

        // ✅ Assign to existing 'graph1', don't redeclare it
        graph1 = new Chart(chart1, {
            type: 'line',
            data: {
                labels: days,
                datasets: [{
                    data: incomes,
                    fill: true,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.5
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

    } catch (error) {
        console.error(error);
        pushNotif("e", "something went wrong!");
    }
};

const drawGraph2 = async (period) => {
    try {
        const {stats, total} = await getStatsMonthly(period)
        const months = []
        const incomes = []
        stats.forEach(stat=>{
            months.push(stat.month_name)
            incomes.push(stat.rentals)
        })
        const chart2 = document.getElementById('chart2').getContext('2d');
        const myBarChart = new Chart(chart2, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    data: incomes,
                    backgroundColor: 
                        'rgba(255, 159, 64, 0.2)'
                    ,
                    borderColor: 
                        'rgba(255, 159, 64, 1)'
                    ,
                    borderWidth: 1 
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true // Always start Y axis at 0
                    }
                }
            },
            options: {
            plugins: {
                legend: {
                display: false
                }
            }
            }
        
        });
     } catch (error) {
        console.error(error)
        pushNotif("e", "something went wrong!")
    }
}

const refrechStats = async (period) => {
    try {
        const {stats, total} = await getStats(period)
        const incomeInp = document.getElementById('dashIncome')
        const insuranceInp = document.getElementById('dashInsurance')
        const returnsInp = document.getElementById('dashReturns')
        const rentalsInp = document.getElementById('dashRentals')
        
        animateNumber('dashReturns', parseInt(returnsInp.innerText), parseInt(stats.returns), 1000);
        animateNumber('dashRentals', parseInt(rentalsInp.innerText), parseInt(total.total), 1000);
        animateMoney('dashIncome', parseInt(incomeInp.innerText), parseInt(stats.icomme), 1000);
        animateMoney('dashInsurance', parseInt(insuranceInp.innerText), parseInt(stats.insurance), 1000);

    } catch (error) {
        console.error(error)
        pushNotif("e", "something went wrong!")
    }

}

const refrechContent =  ()=>{
    refrechOrdersTable()
    drawGraph1(60)
    drawGraph2(5)
    refrechStats(365)
}

document.getElementById('revLM').addEventListener('click', ()=> { 
    drawGraph1(30)
 })
document.getElementById('revLW').addEventListener('click', ()=> { 
    drawGraph1(7)
 })

ordersLimit.addEventListener('change', ()=> {refrechOrdersTable()})
ordersOffset.addEventListener('change', ()=> {refrechOrdersTable()})

document.getElementById('oDownload').addEventListener('click', ()=>{
    try {
        openLoader()
        getOrders(999999999, 0).then(data => {
            if (!data || !data.orders || data.orders.length === 0) return;
            const headers = [
                "Order ID",
                "Username",
                "Vehicle",
                "Country",
                "Wilaya",
                "City",
                "Address",
                "Total Price",
                "Status",
                "Start Date",
                "End Date",
                "Created At"
            ];
        
            const csvRows = [
                headers.join(",")
            ];

            data.orders.forEach(order => {
                const row = [
                    order.id,
                    `@${order.username}`,
                    `${order.brand_name} ${order.model} ${order.fab_year}`,
                    order.country,
                    order.wilaya,
                    order.city,
                    order.address,
                    order.total_price,
                    order.status,
                    formatDate(order.start_date),
                    formatDate(order.end_date),
                    formatDate(order.created_at)
                ];
                csvRows.push(row.map(val => `"${val}"`).join(",")); // Escape values in quotes
            });

            const csvContent = csvRows.join("\n");
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            closeLoader()
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `orders_${Date.now()}.csv`);
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

document.getElementById('oPrint').addEventListener('click', async ()=>{
    try {
        openLoader()
        getOrders(999999999, 0).then(d => {
            if (!d || d.orders.length === 0) return
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: "landscape" });

            const title = "DZRentCars - Orders";
            const now = new Date();
            const formattedDate = now.toLocaleString();

            doc.setFontSize(18);
            doc.text(title, 14, 15);

            doc.setFontSize(10);
            doc.text(`Exported on: ${formattedDate}`, 230, 15, { align: "right" });
        
            const headers = [[
                "Order ID", "Username", "Vehicle", "Country", "Wilaya", "City", "Address",
                "Total Price", "Status", "Start Date", "End Date", "Created At"
            ]];
        
            const data = d.orders.map(order => [
                order.id,
                `@${order.username}`,
                `${order.brand_name} ${order.model} ${order.fab_year}`,
                order.country,
                order.wilaya,
                order.city,
                order.address,
                order.total_price,
                order.status,
                formatDate(order.start_date),
                formatDate(order.end_date),
                formatDate(order.created_at)
            ]);
        
            doc.autoTable({
                head: headers,
                body: data,
                startY: 20,
                styles: { fontSize: 8 },
                headStyles: { fillColor: [243, 160, 40] },
            });
        
            closeLoader()
            doc.save("orders_list.pdf");                
        })
        .finally(()=>{closeLoader()})
    } catch (error) {
        closeLoader()
        pushNotif("e", "Something went wrong!")
        console.error(error)
    } 
})

document.addEventListener("DOMContentLoaded", refrechContent)