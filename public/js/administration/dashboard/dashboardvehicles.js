const ctx = document.getElementById('rentalLineChart').getContext('2d');

const truckPG = document.getElementById('truckPG')
const hatchbackPG = document.getElementById('hatchbackPG')
const coupePG = document.getElementById('coupePG')
const vanPG = document.getElementById('vanPG')
const offroadPG = document.getElementById('offroadPG')
const sportPG = document.getElementById('sportPG')
const suvPG = document.getElementById('suvPG')
const sedanPG = document.getElementById('sedanPG')

const sTotal = document.getElementById('sTotal')
const sBrands = document.getElementById('sBrands')
const sDisabled = document.getElementById('sDisabled')
const sRented = document.getElementById('sRented')


const getCarsStatics = async () => {
    try {
        const u = new URL(`${window.location.origin}/api/vehicles/getCarStatics`);

        const response = await fetch(u);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const { data, chartData } = await response.json();
        return {data: data, chartData: chartData};
    } catch (error) {
        closeLoader()
        console.error("Failed to collect data:", error);
        pushNotif("e", "Something went wrong!");
        return [];
    }
}

const drawChart = async () => {
    try {
        await getCarsStatics().then(data => {
            if (data && Array.isArray(data.chartData) && data.chartData.length > 0) {

                const chartData = data.chartData;

                const monthLabels = chartData.map(entry => entry.month);
                const rentalsData = chartData.map(entry => parseInt(entry.rentals, 10));
                const returnsData = chartData.map(entry => parseInt(entry.returns, 10));

                rentalLineChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: monthLabels,
                        datasets: [
                            {
                                label: 'Rented',
                                data: rentalsData,
                                borderColor: '#3B82F6',
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                fill: true,
                                tension: 0.4,
                                pointRadius: 4,
                                pointBackgroundColor: '#3B82F6',
                            },
                            {
                                label: 'Returned Successfully',
                                data: returnsData,
                                borderColor: '#10B981',
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                fill: true,
                                tension: 0.4,
                                pointRadius: 4,
                                pointBackgroundColor: '#10B981',
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top',
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }
        })
        .catch(error => {
            pushNotif('e', "Something went wrong!");
            console.error('Drawchart: ', error);
            closeLoader();
        });
    } catch (error) {
        pushNotif('e', "Something went wrong!");
        console.error('Drawchart: ', error);
        closeLoader();
    }
};

const updateTypes = async () => {
    try {
        await getCarsStatics().then(data => {
            if (data && data.data) {
                const total = data.data[0].total_vehicle_stock || 0
                const ccoupe = data.data[0].total_coupe || 0
                const csedan = data.data[0].total_sedan || 0
                const csuv = data.data[0].total_suv || 0
                const csport = data.data[0].total_sport || 0
                const cvan = data.data[0].total_van || 0
                const coffroad = data.data[0].total_offroad || 0
                const chatchback = data.data[0].total_hatchback || 0
                const ctruck = data.data[0].total_truck || 0

                animateNumber("ctruck",0, ctruck ,1000)
                animateNumber("chatchback",0, chatchback ,1000)
                animateNumber("ccoupe",0, ccoupe ,1000)
                animateNumber("cvan",0, cvan ,1000)
                animateNumber("coffroad",0, coffroad ,1000)
                animateNumber("csport",0, csport ,1000)
                animateNumber("csuv",0, csuv ,1000)
                animateNumber("csedan",0, csedan ,1000)

                animateNumber("truckPer",0, Math.round(ctruck*100 / total) ,1000)
                animateNumber("hatchbackPer",0, Math.round(chatchback*100 / total) ,1000)
                animateNumber("coupePer",0, Math.round(ccoupe*100 / total) ,1000)
                animateNumber("vanPer",0, Math.round(cvan*100 / total) ,1000)
                animateNumber("offroadPer",0, Math.round(coffroad*100 / total) ,1000)
                animateNumber("sportPer",0, Math.round(csport*100 / total) ,1000)
                animateNumber("suvPer",0, Math.round(csuv*100 / total) ,1000)
                animateNumber("sedanPer",0, Math.round(csedan*100 / total) ,1000)
                
                truckPG.style.width = `${ ctruck * 100 / total}%`
                hatchbackPG.style.width = `${ chatchback * 100 / total}%`
                coupePG.style.width = `${ ccoupe * 100 / total}%`
                vanPG.style.width = `${ cvan * 100 / total}%`
                offroadPG.style.width = `${ coffroad * 100 / total}%`
                sportPG.style.width = `${ csport * 100 / total}%`
                suvPG.style.width = `${ csuv * 100 / total}%`
                sedanPG.style.width = `${ csedan * 100 / total}%`
            }
        })
        .catch(error => {
            pushNotif('e', "Something went wrong!");
        console.error('Updating car types statics: ', error);
            closeLoader();
        });
    } catch (error) {
        pushNotif('e', "Something went wrong!");
        console.error('Updating car types statics: ', error);
        closeLoader();
    }
}

const updateStatics = async () => {
    try {
        await getCarsStatics().then(data => {
            if (data && data.data) {
                const total = data.data[0].total_vehicle_stock || 0
                const brands = data.data[0].total_brands || 0
                const disabledCars = data.data[0].disabled_vehicle_stock || 0
                const rented = data.data[0].total_active_rentals || 0

                animateNumber("sTotal", parseInt(sTotal.textContent) , total ,1000)
                animateNumber("sBrands", parseInt(sBrands.textContent) , brands ,1000)
                animateNumber("sDisabled", parseInt(sDisabled.textContent) , disabledCars ,1000)
                animateNumber("sRented", parseInt(sRented.textContent) , rented ,1000)
            }
        })
        .catch(error => {
            pushNotif('e', "Something went wrong!");
            console.error('Updating statics: ', error);
            closeLoader();
        });
    } catch (error) {
        pushNotif('e', "Something went wrong!");
        console.error('Updating statics: ', error);
        closeLoader();
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    openLoader()
    drawChart()
    updateTypes()
    updateStatics()
    closeLoader()
})
