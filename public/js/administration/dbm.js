const vehiclesLoader = document.getElementById('vehiclesLoader')
const employeesLoader = document.getElementById('employeesLoader')
const ordersLoader = document.getElementById('ordersLoader')
const clientsLoader = document.getElementById('clientsLoader')

const clientsTableBody = document.getElementById('clientsTableBody')
const vehiclesTableBody = document.getElementById('vehiclesTableBody')
const ordersTableBody = document.getElementById('ordersTableBody')
const employeesTableBody = document.getElementById('employeesTableBody')

const clientsLimit = document.getElementById('clientsLimit')
const clientsOffset = document.getElementById('clientsOffset')
const employeesLimit = document.getElementById('employeesLimit')
const employeesOffset = document.getElementById('employeesOffset')
const vehiclesLimit = document.getElementById('vehiclesLimit')
const vehiclesOffset = document.getElementById('vehiclesOffset')
const ordersLimit = document.getElementById('ordersLimit')
const ordersOffset = document.getElementById('ordersOffset')
const sort = document.getElementById('table-filter-sort')
const dire = document.getElementById('table-filter-dire')

const vehiclesCurrentPage = document.getElementById('vehiclesCurrentPage')
const employeesCurrentPage = document.getElementById('employeesCurrentPage')
const clientsCurrentPage = document.getElementById('clientsCurrentPage')
const ordersCurrentPage = document.getElementById('ordersCurrentPage')

const getVehicles = async (limit, offset) => {
    try {
        const order = sort.value;
        const direction = dire.value;

        let u = new URL(`${window.location.origin}/api/vehicles/all`);
        let params = u.searchParams;

        params.set("limit", limit);
        params.set("offset", offset);
        params.set("order", order);
        params.set("dire", direction);

        u.search = params.toString();

        const response = await fetch(u);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const { vehicles, total } = await response.json();
        return { vehicles, total };
    } catch (error) {
        console.error("Failed to fetch vehicles:", error);
        pushNotif("e", "Something went wrong!");
        return null;
    }
};
const refrechVehiclesTable = (limit = parseInt(vehiclesLimit.value), offset = parseInt(vehiclesOffset.value)) => {
    vehiclesLoader.style.opacity = "1";
    Array.from(vehiclesTableBody.children).forEach(child => child.remove());
    vehiclesTableBody.parentElement.style.height = "fit-content"

    getVehicles(limit, offset).then(data => {
        vehiclesLoader.style.opacity = "0";
        if (data && data.vehicles) {
            const { vehicles, total } = data;
            document.getElementById('totalVehicles').innerText = formatNumber(parseInt(total))

            vehicles.forEach(vehicle => {
                const tRow = document.createElement("div");
                tRow.classList.add("dbm-table-row", "row-vehicles");
                tRow.innerHTML = `
                    <div class="dbm-table-col table-id">
                        <p>${vehicle.id}</p>
                    </div>
                    <div class="dbm-table-col">
                        <p>${vehicle.units}</p>
                    </div>
                    <div class="dbm-table-col">
                        <p>${vehicle.price}</p>
                    </div>
                    <div class="dbm-table-col">
                        <p>${vehicle.rental_type === "d"?"Days":"Hours"}</p>
                    </div>
                    <div class="dbm-table-col">
                        <div class="flex-row">
                            <img src="${vehicle.brand_logo}" alt="Brand" width="25" style="margin-right: 0.325em;">
                            <p>${vehicle.brand_name}</p>
                        </div>
                    </div>
                    <div class="dbm-table-col">
                        <p>${vehicle.country}</p>
                    </div>
                    <div class="dbm-table-col">
                        <p>${vehicle.wilaya}</p>
                    </div>
                    <div class="dbm-table-col">
                        <p>${vehicle.city}</p>
                    </div>
                    <div class="dbm-table-col">
                        <p>${vehicle.address}</p>
                    </div>
                    <div class="dbm-table-col">
                        <p>${vehicle.model}</p>
                    </div>
                    <div class="dbm-table-col">
                        <p>${vehicle.fab_year}</p>
                    </div>
                    <div class="dbm-table-col">
                        <p>${vehicle.body}</p>
                    </div>
                    <div class="dbm-table-col">
                        <p>${vehicle.fuel}</p>
                    </div>
                    <div class="dbm-table-col">
                        <p>${vehicle.color}</p>
                    </div>
                    <div class="dbm-table-col">
                        <p>${vehicle.transmission}</p>
                    </div>
                    <div class="dbm-table-col">
                        <p>${vehicle.capacity}</p>
                    </div>
                    <div class="dbm-table-col">
                        <p>${vehicle.doors}</p>
                    </div>
                    <div class="dbm-table-col">
                        <p>${vehicle.engine_type}</p>
                    </div>
                    <div class="dbm-table-col">
                        <p>${vehicle.horsepower}</p>
                    </div>
                    <div class="dbm-table-col">
                        <p>${vehicle.speed}</p>
                    </div>
                    <div class="dbm-table-col">
                        <p>${formatDate(vehicle.created_at)}</p>
                    </div>
                `
                vehiclesTableBody.appendChild(tRow);
            });

            gsap.set(".row-vehicles", { x: -100, opacity: 0 });
            gsap.to(".row-vehicles", { x: 0, stagger: 0.1, opacity: 1 });

            const totalPages = Math.ceil(total / limit);
            const currentPage = Math.floor(offset / limit) + 1;

            let options = "";
            for (let i = 1; i <= totalPages; i++) {
                options += `<option value="${i}" ${i === currentPage ? 'selected' : ''}>${i}</option>`;
            }

            document.getElementById('vehicleTableFoot').innerHTML = `
                <div class="only-pc flex-row center-start">
                    <p class="para-sml">${offset + 1}-${Math.min(offset + limit, total)} of ${total} Vehicles</p>
                </div>
                <div class="flex-row center-start" style="gap: 0.625em;">
                    <select class="dbm-select" id="vehiclesCurrentPage">
                        ${options}
                    </select>
                    <button class="bt bt-hover bt-reg" id="vPrevB">Previous</button>
                    <button class="bt bt-hover bt-reg" id="vNextB">Next</button>
                </div>
            `;

            const newVehiclesCurrentPage = document.getElementById('vehiclesCurrentPage');

            newVehiclesCurrentPage.addEventListener('change', () => {
                const selectedPage = parseInt(newVehiclesCurrentPage.value);
                const newOffset = (selectedPage - 1) * limit;
                vehiclesOffset.value = newOffset; 
                refrechVehiclesTable(limit, newOffset);
            });

            document.getElementById('vPrevB').addEventListener('click', () => {
                const prevPage = parseInt(newVehiclesCurrentPage.value) - 1;
                if (prevPage >= 1) {
                    const newOffset = (prevPage - 1) * limit;
                    vehiclesOffset.value = newOffset;
                    refrechVehiclesTable(limit, newOffset);
                }
            });

            document.getElementById('vNextB').addEventListener('click', () => {
                const nextPage = parseInt(newVehiclesCurrentPage.value) + 1;
                if (nextPage <= totalPages) {
                    const newOffset = (nextPage - 1) * limit;
                    vehiclesOffset.value = newOffset;
                    refrechVehiclesTable(limit, newOffset);
                }
            });
        }
    }).catch(error => {
        vehiclesLoader.style.opacity = "0";
        pushNotif("e", "Something went wrong!");
        console.error(error);
    });
};

const getClients = async (limit, offset) => {
    try {
        const order = sort.value;
        const direction = dire.value;

        let u = new URL(`${window.location.origin}/api/users/getClients`);
        let params = u.searchParams;

        params.set("limit", limit);
        params.set("offset", offset);
        params.set("order", order);
        params.set("dire", direction);

        u.search = params.toString();

        const response = await fetch(u);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const { clients, total } = await response.json();
        return { clients, total };
    } catch (error) {
        console.error("Failed to fetch clients:", error);
        pushNotif("e", "Something went wrong!");
        return null;
    }
};
const refrechClientsTable = (limit = parseInt(clientsLimit.value), offset = parseInt(clientsOffset.value)) => {
    clientsLoader.style.opacity = "1";
    Array.from(clientsTableBody.children).forEach(child => child.remove());
    clientsTableBody.parentElement.style.height = "fit-content"

    getClients(limit, offset).then(data => {
        clientsLoader.style.opacity = "0";
        if (data && data.clients) {
            const { clients, total } = data;
            document.getElementById('totalClients').innerText = formatNumber(parseInt(total))

            clients.forEach(client => {
                const tRow = document.createElement("div");
                tRow.classList.add("dbm-table-row", "row-clients");
                tRow.innerHTML = `
                    <div class="dbm-table-col table-id">
                        <p>${client.id}</p>
                    </div>
                    <div class="dbm-table-col">
                        <p>${client.username}</p>
                    </div>
                    <div class="dbm-table-col">
                        <p>${client.email}</p>
                    </div>
                    <div class="dbm-table-col">
                        <p class="account-stat-p ${client.account_status?'Ver':'notVer'}">${client.account_status?'Verified':'Not verified'}</p>
                    </div>
                    <div class="dbm-table-col">
                        <p>${client.fname}</p>
                    </div>
                    <div class="dbm-table-col">
                        <p>${client.lname}</p>
                    </div>
                    <div class="dbm-table-col">
                        <p class="sexe ${client.sexe==="M"?"male":"female"}">${client.sexe==="M"?"Male":"Female"}</p>
                    </div>
                    <div class="dbm-table-col">
                        <p>${formatDate(client.birthdate)}</p>
                    </div>
                    <div class="dbm-table-col">
                        <p>${client.country}</p>
                    </div>
                    <div class="dbm-table-col">
                        <p>${client.wilaya}</p>
                    </div>
                    <div class="dbm-table-col">
                        <p>${client.city}</p>
                    </div>
                    <div class="dbm-table-col">
                        <p>${client.zipcode}</p>
                    </div>
                    <div class="dbm-table-col">
                        <p>${client.address}</p>
                    </div>
                    <div class="dbm-table-col">
                        <p>${client.phone}</p>
                    </div>
                    <div class="dbm-table-col">
                        <p>${formatDate(client.created_at)}</p>
                    </div>        
                `
                clientsTableBody.appendChild(tRow);
            });

            gsap.set(".row-clients", { x: -100, opacity: 0 });
            gsap.to(".row-clients", { x: 0, stagger: 0.1, opacity: 1 });

            const totalPages = Math.ceil(total / limit);
            const currentPage = Math.floor(offset / limit) + 1;

            let options = "";
            for (let i = 1; i <= totalPages; i++) {
                options += `<option value="${i}" ${i === currentPage ? 'selected' : ''}>${i}</option>`;
            }

            document.getElementById('clientTableFoot').innerHTML = `
                <div class="only-pc flex-row center-start">
                    <p class="para-sml">${offset + 1}-${Math.min(offset + limit, total)} of ${total} Clients</p>
                </div>
                <div class="flex-row center-start" style="gap: 0.625em;">
                    <select class="dbm-select" id="clientsCurrentPage">
                        ${options}
                    </select>
                    <button class="bt bt-hover bt-reg" id="cPrevB">Previous</button>
                    <button class="bt bt-hover bt-reg" id="cNextB">Next</button>
                </div>
            `;

            const newClientsCurrentPage = document.getElementById('clientsCurrentPage');

            newClientsCurrentPage.addEventListener('change', () => {
                const selectedPage = parseInt(newClientsCurrentPage.value);
                const newOffset = (selectedPage - 1) * limit;
                clientsOffset.value = newOffset; 
                refrechClientsTable(limit, newOffset);
            });

            document.getElementById('cPrevB').addEventListener('click', () => {
                const prevPage = parseInt(newClientsCurrentPage.value) - 1;
                if (prevPage >= 1) {
                    const newOffset = (prevPage - 1) * limit;
                    clientsOffset.value = newOffset;
                    refrechClientsTable(limit, newOffset);
                }
            });

            document.getElementById('cNextB').addEventListener('click', () => {
                const nextPage = parseInt(newClientsCurrentPage.value) + 1;
                if (nextPage <= totalPages) {
                    const newOffset = (nextPage - 1) * limit;
                    clientsOffset.value = newOffset;
                    refrechClientsTable(limit, newOffset);
                }
            });
        }
    }).catch(error => {
        clientsLoader.style.opacity = "0";
        pushNotif("e", "Something went wrong!");
        console.error(error);
    });
};

const getEmployees = async (limit, offset) => {
    try {
        const order = sort.value;
        const direction = dire.value;

        let u = new URL(`${window.location.origin}/api/users/getEmployees`);
        let params = u.searchParams;

        params.set("limit", limit);
        params.set("offset", offset);
        params.set("order", order);
        params.set("dire", direction);

        u.search = params.toString();

        const response = await fetch(u);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const { employees, total } = await response.json();
        return { employees, total };
    } catch (error) {
        console.error("Failed to fetch employees:", error);
        pushNotif("e", "Something went wrong!");
        return null;
    }
};
const refrechEmployeesTable = (limit = parseInt(employeesLimit.value), offset = parseInt(employeesOffset.value)) => {
    try {
        employeesLoader.style.opacity = "1";
        Array.from(employeesTableBody.children).forEach(child => child.remove());
        employeesTableBody.parentElement.style.height = "fit-content"

        getEmployees(limit, offset).then(data => {
            employeesLoader.style.opacity = "0";
            if (data && data.employees) {
                const { employees, total } = data;
                document.getElementById('totalEmployees').innerText = formatNumber(parseInt(total))
    
                employees.forEach(employe => {
                    const tRow = document.createElement("div");
                    tRow.classList.add("dbm-table-row", "row-employees");
                    tRow.innerHTML = `
                        <div class="dbm-table-col table-id">
                            <p>${employe.id}</p>
                        </div>
                        <div class="dbm-table-col">
                            <p>${employe.username}</p>
                        </div>
                        <div class="dbm-table-col">
                            <p>${employe.email}</p>
                        </div>
                        <div class="dbm-table-col">
                            <p>${employe.office_country}</p>
                        </div>
                        <div class="dbm-table-col">
                            <p>${employe.office_wilaya}</p>
                        </div>
                        <div class="dbm-table-col">
                            <p>${employe.office_city}</p>
                        </div>
                        <div class="dbm-table-col">
                            <p>${employe.office_address}</p>
                        </div>
                        <div class="dbm-table-col">
                            <p>${employe.fname}</p>
                        </div>
                        <div class="dbm-table-col">
                            <p>${employe.lname}</p>
                        </div>
                        <div class="dbm-table-col">
                            <p>${employe.sexe==="M"?"Male":"Female"}</p>
                        </div>
                        <div class="dbm-table-col">
                            <p>${formatDate(employe.birthdate)}</p>
                        </div>
                        <div class="dbm-table-col">
                            <p>${employe.country}</p>
                        </div>
                        <div class="dbm-table-col">
                            <p>${employe.wilaya}</p>
                        </div>
                        <div class="dbm-table-col">
                            <p>${employe.city}</p>
                        </div>
                        <div class="dbm-table-col">
                            <p>${employe.zipcode}</p>
                        </div>
                        <div class="dbm-table-col">
                            <p>${employe.address}</p>
                        </div>
                        <div class="dbm-table-col">
                            <p>${employe.phone}</p>
                        </div>
                        <div class="dbm-table-col">
                            <p>${formatDate(employe.created_at)}</p>
                        </div>
                    `
                    employeesTableBody.appendChild(tRow);
                });
    
                gsap.set(".row-employees", { x: -100, opacity: 0 });
                gsap.to(".row-employees", { x: 0, stagger: 0.1, opacity: 1 });
    
                const totalPages = Math.ceil(total / limit);
                const currentPage = Math.floor(offset / limit) + 1;
    
                let options = "";
                for (let i = 1; i <= totalPages; i++) {
                    options += `<option value="${i}" ${i === currentPage ? 'selected' : ''}>${i}</option>`;
                }
    
                document.getElementById('employeeTableFoot').innerHTML = `
                    <div class="only-pc flex-row center-start">
                        <p class="para-sml">${offset + 1}-${Math.min(offset + limit, total)} of ${total} Employees</p>
                    </div>
                    <div class="flex-row center-start" style="gap: 0.625em;">
                        <select class="dbm-select" id="employeesCurrentPage">
                            ${options}
                        </select>
                        <button class="bt bt-hover bt-reg" id="ePrevB">Previous</button>
                        <button class="bt bt-hover bt-reg" id="eNextB">Next</button>
                    </div>
                `;
    
                const newEmployeesCurrentPage = document.getElementById('employeesCurrentPage');
    
                newEmployeesCurrentPage.addEventListener('change', () => {
                    const selectedPage = parseInt(newEmployeesCurrentPage.value);
                    const newOffset = (selectedPage - 1) * limit;
                    employeesOffset.value = newOffset; 
                    refrechEmployeesTable(limit, newOffset);
                });
    
                document.getElementById('ePrevB').addEventListener('click', () => {
                    const prevPage = parseInt(newEmployeesCurrentPage.value) - 1;
                    if (prevPage >= 1) {
                        const newOffset = (prevPage - 1) * limit;
                        employeesOffset.value = newOffset;
                        refrechEmployeesTable(limit, newOffset);
                    }
                });
    
                document.getElementById('eNextB').addEventListener('click', () => {
                    const nextPage = parseInt(newEmployeesCurrentPage.value) + 1;
                    if (nextPage <= totalPages) {
                        const newOffset = (nextPage - 1) * limit;
                        employeesOffset.value = newOffset;
                        refrechEmployeesTable(limit, newOffset);
                    }
                });
            }
        })
        .catch(error => {
            employeesLoader.style.opacity = "0";
            pushNotif("e", "Something went wrong!");
            console.error(error);
        });
    } catch (error) {
        console.error(error)
    }
};

const getOrders = async (limit, offset) => {
    try {
        const order = sort.value;
        const direction = dire.value;

        let u = new URL(`${window.location.origin}/api/orders/getOrders`);
        let params = u.searchParams;

        params.set("limit", limit);
        params.set("offset", offset);
        params.set("order", order);
        params.set("dire", direction);

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
                document.getElementById('totalOrders').innerText = formatNumber(parseInt(total))
    
                orders.forEach(order => {
                    const tRow = document.createElement("div");
                    tRow.classList.add("dbm-table-row", "row-orders");
                    tRow.innerHTML = `
                        <div class="dbm-table-col table-id">
                            <p>${order.id}</p>
                        </div>
                        <div class="dbm-table-col">
                            <p>@${order.username}</p>
                        </div>
                        <div class="dbm-table-col">
                            <p>${order.brand_name} ${order.model} ${order.fab_year}</p>
                        </div>
                        <div class="dbm-table-col">
                            <p>${order.country}</p>
                        </div>
                        <div class="dbm-table-col">
                            <p>${order.wilaya}</p>
                        </div>
                        <div class="dbm-table-col">
                            <p>${order.city}</p>
                        </div>
                        <div class="dbm-table-col">
                            <p>${order.address}</p>
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
    
                gsap.set(".row-orders", { x: -100, opacity: 0 });
                gsap.to(".row-orders", { x: 0, stagger: 0.1, opacity: 1 });
    
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

const refrechContent =  ()=>{
    refrechVehiclesTable()
    refrechClientsTable()
    refrechEmployeesTable()
    refrechOrdersTable()
}

vehiclesLimit.addEventListener('change', ()=> {refrechVehiclesTable()})
vehiclesOffset.addEventListener('change', ()=> {refrechVehiclesTable()})
clientsLimit.addEventListener('change', ()=> {refrechClientsTable()})
clientsOffset.addEventListener('change', ()=> {refrechClientsTable()})
employeesLimit.addEventListener('change', ()=> {refrechEmployeesTable()})
employeesOffset.addEventListener('change', ()=> {refrechEmployeesTable()})
ordersLimit.addEventListener('change', ()=> {refrechOrdersTable()})
ordersOffset.addEventListener('change', ()=> {refrechOrdersTable()})
sort.addEventListener('change', ()=>{refrechContent()})
dire.addEventListener('change', ()=>{refrechContent()})
document.getElementById('refreshContent').addEventListener('click', ()=>{refrechContent()})
document.addEventListener('DOMContentLoaded', ()=>{refrechContent()})

document.getElementById('cDownload').addEventListener('click', ()=>{
    try {
        openLoader()
        getClients(999999999, 0).then(data => {
            if (!data || data.clients.length === 0) return
        
            const headers = [
                "ID",
                "Username",
                "Email",
                "Account Status",
                "First Name",
                "Last Name",
                "Sexe",
                "Birthdate",
                "Country",
                "Wilaya",
                "City",
                "Zipcode",
                "Address",
                "Phone",
                "Created At"
            ];            
            
            const csvRows = [headers.join(",")];

            data.clients.forEach(client => {
                const row = [
                    client.id,
                    client.username,
                    client.email,
                    client.account_status ? "Verified" : "Not verified",
                    client.fname,
                    client.lname,
                    client.sexe === "M" ? "Male" : "Female",
                    formatDate(client.birthdate),
                    client.country,
                    client.wilaya,
                    client.city,
                    client.zipcode,
                    client.address,
                    client.phone,
                    formatDate(client.created_at)
                ];
                csvRows.push(row.map(val => `"${val}"`).join(","));
            });


            const csvContent = csvRows.join("\n");
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
        
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `clients_${Date.now()}.csv`);
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
document.getElementById('vDownload').addEventListener('click', ()=>{
    try {
        openLoader()
        getVehicles(999999999, 0).then(data => {
            if (!data || data.vehicles.length === 0) return
        
            const headers = [
                "ID",
                "Units",
                "Price",
                "Rental Type",
                "Brand",
                "Office", 
                "Wilaya",
                "City",
                "Address",
                "Model",
                "Manufacture",
                "Body",
                "Fuel Type",
                "Color",
                "Transmission",
                "Capacity",
                "Doors",
                "Engine",
                "Power",
                "Speed",
                "Created At"
            ];
            
            const csvRows = [headers.join(",")];

            data.vehicles.forEach(vehicle => {
                const row = [
                    vehicle.id,
                    vehicle.units,
                    vehicle.price,
                    vehicle.rental_type === "d" ? "Days" : "Hours",
                    vehicle.brand_name,
                    vehicle.country,
                    vehicle.wilaya,
                    vehicle.city,
                    vehicle.address,
                    vehicle.model,
                    vehicle.fab_year,
                    vehicle.body,
                    vehicle.fuel,
                    vehicle.color,
                    vehicle.transmission,
                    vehicle.capacity,
                    vehicle.doors,
                    vehicle.engine_type,
                    vehicle.horsepower,
                    vehicle.speed,
                    formatDate(vehicle.created_at)
                ];
                csvRows.push(row.map(val => `"${val}"`).join(","));
            });

            const csvContent = csvRows.join("\n");
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
        
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `vehicles_${Date.now()}.csv`);
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
document.getElementById('eDownload').addEventListener('click', ()=>{
    try {
        openLoader()
        getEmployees(999999999, 0).then(data => {
            if (!data || data.employees.length === 0) return
        
            const headers = [[
                "ID", "Username", "Email", "Office", "First Name", "Last Name", "Sexe",
                "Birthdate", "Country", "Wilaya", "City", "Zipcode", "Address", "Phone", "Created At"
            ]];          
        
            const csvRows = [headers.join(",")];

            data.employees.forEach(employe => {
                const row = [
                    employe.id,
                    employe.username,
                    employe.email,
                    `${employe.office_country}, ${employe.office_wilaya}, ${employe.office_city}, ${employe.office_address}`,
                    employe.fname,
                    employe.lname,
                    employe.sexe === "M" ? "Male" : "Female",
                    formatDate(employe.birthdate),
                    employe.country,
                    employe.wilaya,
                    employe.city,
                    employe.zipcode,
                    employe.address,
                    employe.phone,
                    formatDate(employe.created_at)
                ];
                csvRows.push(row.map(val => `"${val}"`).join(","));
            });

        
            const csvContent = csvRows.join("\n");
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
        
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `employees_${Date.now()}.csv`);
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

document.getElementById('cPrint').addEventListener('click', async ()=>{
    try {
        openLoader()
        getClients(999999999, 0).then(d => {
            if (!d || d.clients.length === 0) return
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: "landscape" });

            const title = "DZRentCars - Clients";
            const now = new Date();
            const formattedDate = now.toLocaleString();

            doc.setFontSize(18);
            doc.text(title, 14, 15);

            doc.setFontSize(10);
            doc.text(`Exported on: ${formattedDate}`, 230, 15, { align: "right" });
        
            const headers = [
                ["ID", "Username", "Email", "Account Status", "First Name", "Last Name", "Sexe", "Birthdate", "Country", "Wilaya", "City", "Zipcode", "Address", "Phone", "Created At"]
            ];
        
            const data = d.clients.map(client => [
                client.id,
                client.username,
                client.email,
                client.account_status ? "Verified" : "Not verified",
                client.fname,
                client.lname,
                client.sexe === "M" ? "Male" : "Female",
                formatDate(client.birthdate),
                client.country,
                client.wilaya,
                client.city,
                client.zipcode,
                client.address,
                client.phone,
                formatDate(client.created_at)
            ]);
        
            doc.autoTable({
                head: headers,
                body: data,
                startY: 20,
                styles: { fontSize: 8 },
                headStyles: { fillColor: [243, 160, 40] },
            });
        
            closeLoader()
            doc.save("clients_list.pdf");                
        })
        .finally(()=>{closeLoader()})
    } catch (error) {
        closeLoader()
        pushNotif("e", "Something went wrong!")
        console.error(error)
    } 
})
document.getElementById('vPrint').addEventListener('click', async ()=>{
    try {
        openLoader()
        getVehicles(999999999, 0).then(d => {
            if (!d || d.vehicles.length === 0) return
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: "landscape" });

            const title = "DZRentCars - Vehicles";
            const now = new Date();
            const formattedDate = now.toLocaleString();

            doc.setFontSize(18);
            doc.text(title, 14, 15);

            doc.setFontSize(10);
            doc.text(`Exported on: ${formattedDate}`, 230, 15, { align: "right" });
        
            const headers = [[
                "ID", "Units", "Price", "Rental Type", "Brand", "Office", "Model", "Manufacture",
                "Body", "Fuel Type", "Color", "Transmission", "Capacity", "Doors", "Engine",
                "Power", "Speed", "Created At"
            ]];
        
            const data = d.vehicles.map(v => [
                v.id,
                v.units,
                v.price,
                v.rental_type === "d" ? "Days" : "Hours",
                v.brand_name,
                `${v.country}, ${v.wilaya}, ${v.city}, ${v.address}`,
                v.model,
                v.fab_year,
                v.body,
                v.fuel,
                v.color,
                v.transmission,
                v.capacity,
                v.doors,
                v.engine_type,
                v.horsepower,
                v.speed,
                formatDate(v.created_at)
            ]);
        
            doc.autoTable({
                head: headers,
                body: data,
                startY: 20,
                styles: { fontSize: 8 },
                headStyles: { fillColor: [243, 160, 40] },
            });
        
            closeLoader()
            doc.save("vehicles_list.pdf");                
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
document.getElementById('ePrint').addEventListener('click', async ()=>{
    try {
        openLoader()
        getEmployees(999999999, 0).then(d => {
            if (!d || d.employees.length === 0) return
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: "landscape" });

            const title = "DZRentCars - Employees";
            const now = new Date();
            const formattedDate = now.toLocaleString();

            doc.setFontSize(18);
            doc.text(title, 14, 15);

            doc.setFontSize(10);
            doc.text(`Exported on: ${formattedDate}`, 230, 15, { align: "right" });
        
            const headers = [[
                "ID", "Username", "Email", "Office", "First Name", "Last Name", "Sexe",
                "Birthdate", "Country", "Wilaya", "City", "Zipcode", "Address", "Phone", "Created At"
            ]];
        
            const data = d.employees.map(employe => [
                employe.id,
                employe.username,
                employe.email,
                `${employe.office_country}, ${employe.office_wilaya}, ${employe.office_city}, ${employe.office_address}`,
                employe.fname,
                employe.lname,
                employe.sexe === "M" ? "Male" : "Female",
                formatDate(employe.birthdate),
                employe.country,
                employe.wilaya,
                employe.city,
                employe.zipcode,
                employe.address,
                employe.phone,
                formatDate(employe.created_at)
            ]);
        
            doc.autoTable({
                head: headers,
                body: data,
                startY: 20,
                styles: { fontSize: 8 },
                headStyles: { fillColor: [243, 160, 40] },
            });
        
            closeLoader()
            doc.save("employees_list.pdf");                
        })
        .finally(()=>{closeLoader()})
    } catch (error) {
        closeLoader()
        pushNotif("e", "Something went wrong!")
        console.error(error)
    } 
})