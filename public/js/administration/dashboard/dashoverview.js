const ctx = document.getElementById('myChart').getContext('2d');
const thisYear = new Date().getFullYear();
const lastYear = thisYear - 1;

const eventContainer = document.getElementById('eventContainer')

const eUserImg = document.getElementById('eUserImg')
const eUserFLN = document.getElementById('eUserFLN')
const eUserUN = document.getElementById('eUserUN')
const eCarImg = document.getElementById('eCarImg')
const eBName = document.getElementById('eBName')
const eBLogo = document.getElementById('eBLogo')
const ePD = document.getElementById('ePD')
const eRD = document.getElementById('eRD')
const eStatus = document.getElementById('eStatus')

const doClientsProg = document.getElementById('doClientsProg')
const doCarsProg = document.getElementById('doCarsProg')
const doProfitProg = document.getElementById('doProfitProg')
const doRentalsProg = document.getElementById('doRentalsProg')

const doProfit = document.getElementById('doProfit')
const doClients = document.getElementById('doClients')
const doActiveRentals = document.getElementById('doActiveRentals')
const doCars = document.getElementById('doCars')

const doCarsDisabled = document.getElementById('doCarsDisabled')
const doRentalsToday = document.getElementById('doRentalsToday')
const doClientsNew = document.getElementById('doClientsNew')
const doProfitToday = document.getElementById('doProfitToday')

const getOrders = async () => {
    try {
        const u = new URL(`${window.location.origin}/api/orders/getOrders`);
        const params = u.searchParams;
        
        params.set("limit", 1e9);
        params.set("offset", 0);
        params.set("order", "created_at");
        params.set("dire", "DESC");
        
        u.search = params.toString();
        
        const response = await fetch(u);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const { orders } = await response.json();
        return orders;
    } catch (error) {
        console.error("Failed to fetch orders:", error);
        pushNotif("e", "Something went wrong!");
        return [];
    }
};

const getOrder = async (rid) => {
    try {
        const u = new URL(`${window.location.origin}/api/orders/getOrder`);
        const params = u.searchParams;
        
        params.set("rid", rid);
        
        u.search = params.toString();
        
        const response = await fetch(u);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const { order } = await response.json();
        return order;
    } catch (error) {
        console.error("Failed to fetch order:", error);
        pushNotif("e", "Something went wrong!");
        return [];
    }
}

const getChartData = async () => {
    openLoader()
    try {
        const u = new URL(`${window.location.origin}/api/orders/getProfit`);

        const response = await fetch(u);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const { data } = await response.json();
        closeLoader()
        return data;
    } catch (error) {
        closeLoader()
        console.error("Failed to collect data:", error);
        pushNotif("e", "Something went wrong!");
        return [];
    }
}

const getStatics = async () => {
    openLoader()
    try {
        const u = new URL(`${window.location.origin}/api/vehicles/getStatics`);

        const response = await fetch(u);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const { data } = await response.json();
        closeLoader()
        console.log(data)
        return data;
    } catch (error) {
        closeLoader()
        console.error("Failed to collect data:", error);
        pushNotif("e", "Something went wrong!");
        return [];
    }
}

const updateStatics = async () => {
        try {

        const data = await getStatics();

        if (data && Array.isArray(data) && data.length > 0) {
            const cars = data[0].total_vehicle_stock
            const dCars = data[0].disabled_vehicle_stock
            const profit = data[0].total_profit
            const tProfit = data[0].today_profit
            const clients = data[0].total_clients
            const nClients = data[0].new_clients_last_7_days
            const rentals = data[0].total_active_rentals
            const tRentals = data[0].rentals_starting_today
            
            animateMoney('doProfit', parseInt(doProfit.textContent), profit, 1000)
            animateMoney('doProfitToday', parseInt(doProfitToday.textContent), tProfit, 1000)
            animateNumber('doCars', parseInt(doCars.textContent), cars, 1000)
            animateNumber('doCarsDisabled', parseInt(doCarsDisabled.textContent), dCars, 1000)
            animateNumber('doClients', parseInt(doClients.textContent), clients, 1000)
            animateNumber('doActiveRentals', parseInt(doActiveRentals.textContent), rentals, 1000)
            animateNumber('doRentalsToday', parseInt(doRentalsToday.textContent), tRentals, 1000)
            animateNumber('doClientsNew', parseInt(doClientsNew.textContent), nClients, 1000)

        } else {
            pushNotif("w", "No statics data available");
        }
    } catch (error) {
        console.error("Error updating statics:", error);
        pushNotif("e", "Something went wrong!");
        closeLoader();
    }
}

const drawChart = async () => {
    try {
        const ctx = document.getElementById('myChart').getContext('2d');

        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;

        const data = await getChartData();

        if (data && Array.isArray(data) && data.length > 0) {
            const labels = data.map(item => item.office_wilaya);
            const thisYearData = data.map(item => parseFloat(item.this_year_profit));
            const lastYearData = data.map(item => parseFloat(item.last_year_profit));

            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: `${previousYear}`,
                            data: lastYearData,
                            backgroundColor: '#ED6F21a5',
                        },
                        {
                            label: `${currentYear}`,
                            data: thisYearData,
                            backgroundColor: '#F3A028a5',
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: `Office Profit (DZD) Comparison ${previousYear} vs ${currentYear}`
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const value = context.raw;
                                    return `${context.dataset.label}: ${value.toLocaleString('en-DZ', { style: 'currency', currency: 'DZD' })}`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return value;
                                }
                            }
                        }
                    }
                }

            });
        } else {
            pushNotif("w", "No chart data available");
        }
    } catch (error) {
        console.error("Error drawing chart:", error);
        pushNotif("e", "Something went wrong!");
        closeLoader();
    }
};

const showEvent = async (rid) => {
    try {
        openLoader()
        await getOrder(rid).then(data=>{
            console.log(data[0])
            if (data){
                order = data[0]
                eUserImg.setAttribute("src", order.user_image)
                eUserFLN.textContent = `${order.fname} ${order.lname}`
                eUserUN.textContent = `@${order.username}`
                eCarImg.setAttribute('src', order.car_image)
                eBName.textContent = `${order.brand_name} ${order.model} ${order.fab_year}`
                eBLogo.setAttribute('src', order.brand_logo)
                ePD.textContent = formatDate(order.start_date)
                eRD.textContent = formatDate(order.end_date)
                eStatus.classList.remove("e-active", "e-pending", "e-completed")
                eStatus.classList.add(`e-${order.status}`)
                eStatus.innerHTML = `<p>${capitalizeFirstChar(order.status)}</p>`
                
                eventContainer.style.visibility = "visible"   
                gsap.set(".event-container", { y: 100, opacity: 0});
                gsap.to(".event-container", { y: 0, opacity: 1});


            }
        }).catch(error=>{
            closeLoader()
            pushNotif("e", "Somthing went Wrong!")
            console.error(error)
        })
        closeLoader()
    } catch (error) {
        console.error(rror)
        pushNotif("e", "Somthing went wrong!")
    }
}

const closeEvent = () => {
    try {
        gsap.to(".event-container", { y: -100, opacity: 0});
        setTimeout(() => {
            eventContainer.style.visibility = "hidden"   
        }, 400);
    } catch (error) {}
}

document.addEventListener('DOMContentLoaded', async () => {
    drawChart()
    updateStatics()
    const container = document.getElementById('calendar');
    const titleEl = document.getElementById('calTitle');
    
    const calendar = new tui.Calendar(container, {
        defaultView: 'month',
        isReadOnly: true,
        usageStatistics: false,
        popup: {
          enable: true    
        },
        calendars: [
            {
                id: '1',
                name: 'Orders',
                backgroundColor: '#03bd9e',
                borderColor: '#03bd9e'
            }
        ]
    });
    
    calendar.on('clickEvent', (eventInfo) => {
        const { id } = eventInfo.event;
        showEvent(id)
    });      
    
    const updateTitle = () => {
        const range = calendar.getDateRangeStart();
        const title = range.toDate().toLocaleString('default', { month: 'long', year: 'numeric' });
        titleEl.textContent = title;
    };
    
    // Load events
    const orders = await getOrders();
    
    const events = orders.map(order => {
        let color;
        switch (order.status) {
            case "completed": color = "#00a65a"; break;
            case "pending": color = "#888"; break;
            case "active": color = "#007bff"; break;
            default: color = "#aaa"; break;
        }
        
        return {
            id: String(order.id),
            calendarId: '1',
            title: `@${order.username} - ${order.brand_name} ${order.model} ${order.fab_year}`,
            start: order.start_date,
            end: order.end_date,
            category: 'time', 
            backgroundColor: color,
            color: '#fff',
            borderColor: color
        };
    });
    
    calendar.createEvents(events);
    updateTitle();
    
    // Navigation buttons
    document.getElementById('prevBtn').addEventListener('click', () => {
        calendar.prev();
        updateTitle();
    });
    
    document.getElementById('todayBtn').addEventListener('click', () => {
        calendar.today();
        updateTitle();
    });
    
    document.getElementById('nextBtn').addEventListener('click', () => {
        calendar.next();
        updateTitle();
    });
});

document.querySelector('.eventClose').addEventListener('click', closeEvent)
