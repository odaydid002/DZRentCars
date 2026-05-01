let allcustomers = [];

document.addEventListener("DOMContentLoaded", function () {
    fetchCustomers("all"); // أول تحميل يعرض الجميع
});

document.getElementById("customers-menu-item").addEventListener("click", function () {
    fetchCustomers("all");
});

document.querySelectorAll(".button_cust").forEach(button => {
    button.addEventListener("click", function () {
        document.querySelectorAll(".button_cust").forEach(btn => btn.classList.remove("active"));
        this.classList.add("active");
        
        const selectedRole = this.getAttribute("data-role");
        fetchCustomers(selectedRole);
    });
});

function fetchCustomers(role) {
    openLoader()
    let url;

    switch (role) {
        case "Client":
            url = "http://localhost:4000/api/Users/getClients";
            break;
        case "Admin":
            url = "http://localhost:4000/api/Users/getAdmins";
            break;
        case "Employe":
            url = "http://localhost:4000/api/Users/getEmployees";
            break;
        default:
            url = "http://localhost:4000/api/Users/getUsers";
    }

    fetch(url)
        .then(response => response.json())
        .then(customers => {
            closeLoader()
            if (role === "all") {
                allcustomers = customers; // نخزنهم مرة واحدة
            }
            displayCustomers(customers);
        })
        .catch(pushNotif("e",`Error fetching Customers:${error}`))
}

function displayCustomers(customers) {
    const tableBody = document.getElementById("customersTableBody");
    tableBody.innerHTML = "";

    customers.forEach(customer => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${customer.id}</td>
            <td>${customer.fname}</td>
            <td>${customer.lname}</td>
            <td>${customer.email}</td>
            <td>${customer.phone}</td>
            <td>${customer.country}</td>
            <td>${customer.role}</td>
            <td><button class="delete-btn">Delete</button></td>
        `;

        tableBody.appendChild(row);
    });
}

document.getElementById("customersTableBody").addEventListener("click", function (e) {
    if (e.target.classList.contains("delete-btn")) {
        e.preventDefault();

        const row = e.target.closest("tr");
        const userId = row.querySelector("td").textContent.trim();

        if (!userId) {
            pushNotif("i", "User ID is missing")
            return;
        }

        confirm(true, "Confirm Action", "Are you sure you want to delete this user?").then((result) => {
            if(result){
                fetch(`http://localhost:4000/api/Users/deleteuser/${userId}`, {
                    method: "DELETE",
                })
                .then(response => response.json())
                .then(data => {
                    closeLoader()
                    if (data.message) {
                        pushNotif("i", data.message)
                        row.remove();
                    } else {
                        pushNotif("e", `Failed to delete user: "  ${(data.error || "Unknown error")}`)
                    }
                })
                .catch(error => {
                    console.error("Error deleting user:", error);
                    pushNotif("e", "An error occurred while deleting the user.")
                });
            }
        });

    }
});