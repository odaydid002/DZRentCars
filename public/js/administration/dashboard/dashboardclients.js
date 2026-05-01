
const clientsLoader = document.getElementById('clientsLoader')
const clientsTableBody = document.getElementById('clientsTableBody')
const clientsLimit = document.getElementById('clientsLimit')
const clientsOffset = document.getElementById('clientsOffset')
const clientsCurrentPage = document.getElementById('clientsCurrentPage')

const getStaticsData = async () => {
  try {
    openLoader()
    let u = new URL(`${window.location.origin}/api/users/clients/statics`);
    const response = await fetch(u);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const { 
      total,
      verified,
      newC,
      population,
      genders,
      ages 
    } = await response.json();

    closeLoader()
    return {  
      total: parseInt(total.count),
      verified: parseInt(verified.count),
      newC: parseInt(newC.count),
      population,
      females: parseInt(genders.count),
      males: parseInt(total.count) - parseInt(genders.count),
      ages 
    };
      
  } catch (error) {
    closeLoader()
    console.error("Failed to fetch Clients:", error);
    pushNotif("e", "Something went wrong!");
    return null;
  }
}

const updateStatics = async () => {
  try {
    getStaticsData().then(data => {
      if (data) {
        const { 
          total,
          verified,
          newC,
          population,
          males,
          females,
          ages
        } = data;

        const genders = [males, females]

        const wilayaData = population.map(item => ({
          name: item.wilaya,
          value: parseInt(item.user_count)
        }));

        const dashtotal = document.getElementById('dashtotal')
        const dashVerified = document.getElementById('dashVerified')
        const dashGuests = document.getElementById('dashGuests')
        const dashNewC = document.getElementById('dashNewC')

        animateNumber('dashtotal', parseInt(dashtotal.innerText), total, 1000);
        animateNumber('dashVerified', parseInt(dashVerified.innerText), verified, 1000);
        animateNumber('dashGuests', parseInt(dashGuests.innerText), 5, 1000);
        animateNumber('dashNewC', parseInt(dashNewC.innerText), newC, 1000);

        fetch('../json/algeria2.geojson')
        .then(response => response.json())
        .then(geojsonData => {

        const containerBgColor = getComputedStyle(document.documentElement).getPropertyValue('--container').trim();

        const reversedColorScale = 'Blues_r';

        var data = [{
          type: 'choroplethmap',
          geojson: geojsonData,
          locations: wilayaData.map(item => item.name),
          z: wilayaData.map(item => item.value),
          colorscale: reversedColorScale,
          colorbar: { title: 'Values' },
          featureidkey: "properties.name"
        }];
        var layout = {
          map: {
            style: containerBgColor === "white" ? "carto-positron" : "carto-darkmatter",
            center: { lon: 3, lat: 28 },
            zoom: 4,
            showland: false,
            showwater: false
          },
          margin: { t: 0, b: 0, l: 0, r: 0 },
          displayModeBar: false,
          showlegend: false,
          xaxis: { showgrid: false, zeroline: false },
          yaxis: { showgrid: false, zeroline: false },

          paper_bgcolor: containerBgColor,
          plot_bgcolor: containerBgColor
        };

        Plotly.newPlot('algeriaMap', data, layout, { responsive: true });
        })
        .catch(error => console.error('Error loading GeoJSON:', error));

        const ctx = document.getElementById('pieChart').getContext('2d');
        new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Female', 'Male'],
            datasets: [{
              label: '',
              data: genders,
              backgroundColor: ['rgba(255, 93, 228, 0.099)', 'rgba(93, 174, 255, 0.099)'],
              borderColor: ['rgb(255, 29, 142)', 'rgb(90, 153, 230)'],
              borderWidth: 3, 
              hoverOffset: 5
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                dispay: false,
              },
              title: {
                display: false,
              }
            }
          }
        });

        const ageChart = document.getElementById('ageChart').getContext('2d');
        const ageGroups = ages.map(item => item.age_range.replace('-', '–')); 
        const clientCounts = ages.map(item => parseInt(item.count));
        new Chart(ageChart, {
          type: 'bar',
          data: {
            labels: ageGroups,
            datasets: [{
              label: 'Clients',
              data: clientCounts,
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
            responsive: true,
            plugins: {
              legend: { display: false },
              title: {
                display: false 
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: false
                }
              },
              x: {
                title: {
                  display: false
                }
              }
            }
          }
        });

      }else{
        pushNotif("e", 'Error while fetching data')
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

const getTableData = async (limit = 5, offset = 0, order = 'created_at') => {
  try {
    let u = new URL(`${window.location.origin}/api/users/clients/verified`);
    let params = u.searchParams;

    params.set("limit", limit);
    params.set("offset", offset);
    params.set("order", "created_at");

    u.search = params.toString();

    const response = await fetch(u);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const { data, total } = await response.json();
    return { clients: data, total: total.count };
  } catch (error) {
      console.error("Failed to fetch Clients:", error);
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
          if (data && data.clients && data.total) {
              const { clients, total } = data;

              clients.forEach(client => {
                  const tRow = document.createElement("div");
                  tRow.classList.add("dbm-table-row", "row-clients-verf");
                  tRow.innerHTML = `
                    <div class="dbm-table-col table-id">
                        <p>${client.id}</p>
                    </div>
                    <div class="dbm-table-col">
                        <p>${client.fname}</p>
                    </div>
                    <div class="dbm-table-col">
                        <p>${client.lname}</p>
                    </div>
                    <div class="dbm-table-col">
                        <p>${client.age}</p>
                    </div>
                    <div class="dbm-table-col">
                        <p class='sexe ${client.sexe==='M'?'male':'female'}'>${client.sexe==='M'?'Male':'Female'}</p>
                    </div>
                    <div class="dbm-table-col">
                        <p>${client.wilaya}, ${client.city}, ${client.address}</p>
                    </div>
                    <div class="dbm-table-col">
                        <p>${client.email}</p>
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
            if (!d || d.clients.length === 0) return
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
                "Client ID", "First name", "Last name", "Age",  "Sexe", "Address", "email", "phone", "Joined At"
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
  updateStatics()
}
document.addEventListener("DOMContentLoaded", refrechContent)