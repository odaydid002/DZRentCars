const getchartData = async ()=> {
    try{
        let u = new URL(`${window.location.origin}/api/feedback/statics/year`);

        const response = await fetch(u);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const { data } = await response.json();
        return { data };
    } catch (error) {
        console.error("Failed to fetch chart data:", error);
        pushNotif("e", "Something went wrong!");
        return null;
    }
}

const ctx = document.getElementById('chart').getContext('2d');
const drawGraph = async () => {

    getchartData().then(data => {

        if(data.data){
            const labels = data.data.map(item => item.month);
            const dataset1 = data.data.map(item => parseInt(item.positives));
            const dataset2 = data.data.map(item => parseInt(item.negatives)); 
            const dataset3 = data.data.map(item => parseInt(item.reports)); 
    
            chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Negative Reviews',
                            data: dataset2,
                            backgroundColor: '#2C3E50',
                            borderWidth: 0,
                            barThickness: 12,
                            borderRadius: 8
                        },
                        {
                            label: 'Positive Reviews',
                            data: dataset1,
                            backgroundColor: '#F59E52',
                            borderWidth: 0,
                            barThickness: 12,
                            borderRadius: 8
                        },
                        {
                            label: 'Reports',
                            data: dataset3,
                            backgroundColor: '#FCD34D',
                            borderWidth: 0,
                            barThickness: 12,
                            borderRadius: 8
                        }
                    ]

                },
                options: {
                    responsive: true,              
                    maintainAspectRatio: false,   
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        },
                        x: {
                            categoryPercentage: 0.5,
                            barPercentage: 1.0
                        }
                    }
                }
            });
        }
    })
}

const getReportsData = async (limit = 1e9, offset = 0, order = 'created_at') => {
    try {
        let u = new URL(`${window.location.origin}/api/feedback/reports`);
        let params = u.searchParams;

        params.set("limit", limit);
        params.set("offset", offset);
        params.set("order", order);

        u.search = params.toString();

        const response = await fetch(u);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const { reports, total } = await response.json();

        console.log(reports, total)

        return { reports: reports, total: total };
    } catch (error) {
        console.error("Failed to fetch Reviews:", error);
        pushNotif("e", "Something went wrong!");
        return null;
    }
}

const reportsLoader = document.getElementById('reportsLoader')
const reportsBody = document.getElementById('reportsBody')

const refrechReports = async () => {
    try {
      reportsLoader.style.opacity = "1";
      Array.from(reportsBody.children).forEach(child => child.remove());

      getReportsData().then(data => {
          reportsLoader.style.opacity = "0";
          if (data && data.reports && data.total) {
              const { reports, total } = data;

              document.getElementById('reportsTotal').textContent = total

              reports.forEach(report => {
                  const tRow = document.createElement("li");
                  tRow.classList.add("ct-el", "w100", "flex-row", "start-center", "gap-lrg");
                  tRow.innerHTML = `
                    <div class="ct-prf flex-col flex-center">
                        <img src="${report.image}" alt="Profile">
                    </div>
                    <div class="flex-col h100">
                        <h5>${report.fname} ${report.lname} <span class="rep-prio prio-${report.priority}">${capitalizeFirstChar(report.priority)}</span></h5>
                        <p>${report.description}</p>
                    </div>
                  `
                  reportsBody.appendChild(tRow);
              });
  
              gsap.set(".ct-el", { x: -100, opacity: 0 });
              gsap.to(".ct-el", { x: 0, stagger: 0.1, opacity: 1 });

          }
      })
      .catch(error => {
          clientsLoader.style.opacity = "0";
          pushNotif("e", "Something went wrong!");
          console.error(error);
      });
  } catch (error) {
    clientsLoader.style.opacity = "0";
    pushNotif("e", "Something went wrong!");
    console.error(error)
  }
}

refrechReports()

const clientsLoader = document.getElementById('clientsLoader')
const clientsTableBody = document.getElementById('clientsTableBody')
const clientsLimit = document.getElementById('clientsLimit')
const clientsOffset = document.getElementById('clientsOffset')
const clientsCurrentPage = document.getElementById('clientsCurrentPage')

const getTableData = async (limit = 5, offset = 0, order = 'created_at') => {
  try {
    let u = new URL(`${window.location.origin}/api/feedback/reviews`);
    let params = u.searchParams;

    params.set("limit", limit);
    params.set("offset", offset);
    params.set("order", order);

    u.search = params.toString();

    const response = await fetch(u);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const { reviews, total } = await response.json();
    return { reviews: reviews, total: total };
  } catch (error) {
      console.error("Failed to fetch Reviews:", error);
      pushNotif("e", "Something went wrong!");
      return null;
  }
}

const refrechClientsTable = async (limit = parseInt(clientsLimit.value), offset = parseInt(clientsOffset.value)) => {
  try {
      clientsLoader.style.opacity = "1";
      Array.from(clientsTableBody.children).forEach(child => child.remove());
      clientsTableBody.parentElement.style.height = "fit-content"

      getTableData(limit, offset).then(data => {
          clientsLoader.style.opacity = "0";
          if (data && data.reviews && data.total) {
              const { reviews, total } = data;

              reviews.forEach(review => {
                  const tRow = document.createElement("div");
                  tRow.classList.add("dbm-table-row", "row-reviews");
                  tRow.innerHTML = `
                    <div class="dbm-table-col table-id">
                        <p>${review.id}</p>
                    </div>
                    <div class="dbm-table-col flex-row center-start gap-min">
                        <div class="ct-prf">
                            <img src="${review.image}" alt="Profile">
                        </div>
                        <div class="flex-col">
                            <p class="name">${review.fname} ${review.lname}</p>
                            <p class="username">@${review.username}</p>
                        </div>
                    </div>
                    <div class="dbm-table-col flex-row center-start gap-min">
                        <div class="ct-prf">
                            <img src="${review.vimage}" alt="Profile">
                        </div>
                        <p>${review.brand_name} ${review.model} ${review.fab_year}</p>
                    </div>
                    <div class="dbm-table-col">
                        <h6 class="clp" 
                                style="
                                    font-size: 0.9rem;
                                    background: linear-gradient(90deg, yellow ${review.stars * 100/5}%,var(--text) 0%);
                                    -webkit-background-clip: text;
                                    -webkit-text-fill-color: transparent;
                                    background-clip: text;
                                "
                            >
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                        </h6>
                    </div>
                    <div class="dbm-table-col">
                        <p>${review.review}</p>
                    </div>
                    <div class="dbm-table-col">
                        <p>${formatDate(review.created_at)}</p>
                    </div>
                  `
                  clientsTableBody.appendChild(tRow);
              });
  
              gsap.set(".row-clients-verf", { x: -100, opacity: 0 });
              gsap.to(".row-clients-verf", { x: 0, stagger: 0.1, opacity: 1 });
  
              const totalPages = Math.ceil(total / limit);
              const currentPage = Math.floor(offset / limit) + 1;
  
              let options = "";
              for (let i = 1; i <= totalPages; i++) {
                  options += `<option value="${i}" ${i === currentPage ? 'selected' : ''}>${i}</option>`;
              }
  
              document.getElementById('clientsTableFoot').innerHTML = `
                  <div class="only-pc flex-row center-start">
                      <p class="para-sml">${offset + 1}-${Math.min(offset + limit, total)} of ${total} reviews</p>
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
      })
      .catch(error => {
          clientsLoader.style.opacity = "0";
          pushNotif("e", "Something went wrong!");
          console.error(error);
      });
  } catch (error) {
      console.error(error)
  }
};

clientsLimit.addEventListener('change', ()=> {refrechClientsTable()})
clientsOffset.addEventListener('change', ()=> {refrechClientsTable()})

document.getElementById('cDownload').addEventListener('click', ()=>{
    try {
        openLoader()
        getTableData(999999999, 0).then(data => {
            if (!data || !data.clients || data.clients.length === 0) return;
            const headers = [[
              "Client ID", "First name", "Last name", "Age",  "Sexe", "Address", "email", "phone", "Joined At"
            ]];
        
            const csvRows = [
                headers.join(",")
            ];

            data.clients.forEach(client => {
                const row = [
                  client.id,
                  client.fname,
                  client.lname,
                  client.age,
                  client.sexe=="M"?"Male":"Female",
                  `${client.wilaya}, ${client.city}, ${client.address}`,
                  client.email,
                  client.phone,
                  formatDate(client.created_at)
                ];
                csvRows.push(row.map(val => `"${val}"`).join(","));
            });

            const csvContent = csvRows.join("\n");
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            closeLoader()
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `verified_Clients${Date.now()}.csv`);
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
        getTableData(999999999, 0).then(d => {
            if (!d || !d.reviews || d.reviews.length === 0) return
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: "landscape" });

            const title = "DZRentCars - Verified Clients";
            const now = new Date();
            const formattedDate = now.toLocaleString();

            doc.setFontSize(18);
            doc.text(title, 14, 15);

            doc.setFontSize(10);
            doc.text(`Exported on: ${formattedDate}`, 230, 15, { align: "right" });
        
            const headers = [[
                "ID", "Client", ""
            ]];
            
            const data = d.clients.map(client => [
                client.id,
                client.fname,
                client.lname,
                client.age,
                client.sexe=="M"?"Male":"Female",
                `${client.wilaya}, ${client.city}, ${client.address}`,
                client.email,
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
            doc.save("verified_clients.pdf");                
        })
        .finally(()=>{closeLoader()})
    } catch (error) {
        closeLoader()
        pushNotif("e", "Something went wrong!")
        console.error(error)
    } 
})

const refrechContent =  ()=>{
  refrechClientsTable()
  drawGraph()
}

document.addEventListener("DOMContentLoaded", refrechContent)