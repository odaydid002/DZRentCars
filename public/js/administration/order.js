document.addEventListener("DOMContentLoaded", function () {
    fetchOrders(); 
  });
  
document.getElementById("orders-menu-item").addEventListener("click", function () {
  
    document.querySelectorAll(".button_ord").forEach(btn => btn.classList.remove("active"));
  
    const allOrdersButton = document.querySelector('.button_ord[data-role="all"]');
    if (allOrdersButton) {
      allOrdersButton.classList.add("active");
    }
  
    fetchOrders();
  });
  
  document.querySelectorAll(".button_ord").forEach(button => {
    button.addEventListener("click", function () {
      document.querySelectorAll(".button_ord").forEach(btn => btn.classList.remove("active"));
      this.classList.add("active");
  
      const role = this.dataset.role;
      let url;
  
      switch (role) {
        
        case "pending":
          openLoader()
          url = "http://localhost:4000/api/orders/getOrders/pending";
          closeLoader()
          break;
        case "completed":
          openLoader()
          url = "http://localhost:4000/api/orders/getOrders/completed";
          closeLoader()
          break;
        case "canceled":
          openLoader()
          url = "http://localhost:4000/api/orders/getOrders/canceled";
          closeLoader()
          break;
        case "active":
          openLoader()
          url = "http://localhost:4000/api/orders/getOrders/active";
          closeLoader()
          break;
          
        default:
          openLoader()
          url = "http://localhost:4000/api/orders/getOrders";
          closeLoader()
      }
  
      fetch(url)
        .then(response => response.json())
        .then(rentals => {
          displayOrders(rentals);
        })
        .catch(error => console.error("Error fetching orders:", error));
    });
  });
  
  function fetchOrders() {
    openLoader()
    fetch("http://localhost:4000/api/orders/getOrders")
      .then(response => response.json())
      .then(rentals => {
        closeLoader()
        displayOrders(rentals);
      })
      .catch(pushNotif("e",`Error fetching orders:${error}`))
      
  }

  
  function displayOrders(rentals) {
    const tableBody = document.getElementById("rentalsTableBody");
    tableBody.innerHTML = "";
  
    rentals.forEach(rental => {
      const row = document.createElement("tr");
  
      let statusClass = "";
      let statusIcon = "";
  
      switch (rental.status.toLowerCase()) {
        case "completed":
          statusClass = "status-completed";
          statusIcon = "✅";
          break;
        case "pending":
          statusClass = "status-pending";
          statusIcon = "⏳";
          break;
        case "canceled":
          statusClass = "status-canceled";
          statusIcon = "❌";
          break;
        case "active":
          statusClass = "status-active";
          statusIcon = "🟢";
          break;
      }
  
      row.innerHTML = `
        <td>${rental.user_id}</td>
        <td>${rental.vehicle_id}</td>
        <td>${new Date(rental.start_date).toDateString()}</td>
        <td>${new Date(rental.end_date).toDateString()}</td>
        <td class="${statusClass}">${statusIcon} ${rental.status}</td>
        <td>${rental.total_price} <span class="currence">DZD</span></td>
      `;
  
      tableBody.appendChild(row);
    });
  }