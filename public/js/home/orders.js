const rentsSelectAll = document.getElementById('rentsSelectAll')
rentsSelectAll.addEventListener('change', ()=>{
  document.querySelectorAll('.rentCheckB').forEach(cb=>{
    cb.checked = rentsSelectAll.checked
  })
})

document.querySelectorAll(".ordTf").forEach(el=>{
  el.addEventListener('click', ()=>{
    document.querySelector(".orders-type-f").style.setProperty('--after-transform', `translateY(-50%) translateX(calc((var(--ord-filter-s) / 5.1)*${el.classList[1]}))`);
  })
  if(el.lastChild.checked) document.querySelector(".orders-type-f").style.setProperty('--after-transform', `translateY(-50%) translateX(calc((var(--ord-filter-s) / 5.1)*${el.classList[1]}))`);
})

let dtrtoday = new Date();
let pastDate = new Date();

pastDate.setDate(dtrtoday.getDate() - 1098);
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

flatpickr("#dateRange", {
    mode: "range",
    dateFormat: "Y-m-d",
    altInput: true,
    altFormat: "d M",
    defaultDate: [formatDate(pastDate), formatDate(dtrtoday)],
    onChange: function(selectedDates, dateStr, instance) {
        document.getElementById('filterStartDate').value = formatDate(selectedDates[0]);
        if(selectedDates[1]) document.getElementById('filterEndDate').value = formatDate(selectedDates[1]);
    }
});

document.getElementById('filterStartDate').value = formatDate(pastDate);
document.getElementById('filterEndDate').value = formatDate(dtrtoday);

const rentalsContainer =  document.querySelector('.rentals-container')

function clearRentals(){
  if(rentalsContainer.children.length>0){
    Array.from(rentalsContainer.children).forEach(rental=>{
      rental.parentElement.removeChild(rental)
    })
  }
}

function refreshRentals( id, name, created, payment, status, price, start_date, end_date, rental_type, uid ){
  const rentalContainer = document.createElement('li')
  rentalContainer.classList.add('rental-order', "rental-order-anm")

  const start = new Date(start_date);
  const end = new Date(end_date);
  const diffMs = end - start;
  let diff;
  if (rental_type === 'h') {
    diff = Math.round(diffMs / (1000 * 60 * 60)) + ' HOURS';
  } else if (rental_type === 'd') {
    diff = Math.round(diffMs / (1000 * 60 * 60 * 24)) + ' DAYS';
  } else {
    diff = '';
  }

  rentalContainer.innerHTML = `

    <div class="checkbox-wrapper-13 phd">
        <input class="rentCheckB" type="checkbox">
    </div>
    <div class="flex-col start-center">
        <p class="spec-tit">${name}</p>
        <p class="price-tag">#${id}</p>
    </div>
    <div class="flex-row center-start phd">
        <p class="spec-tit">${new Date(created).toDateString()}</p>
    </div>
    <div class="flex-row center-start phd">
        <p class="spec-tit">${diff}</p>                                                                              
    </div>
    <div class="flex-row center-start phd">
        <p class="rental-pay Paid">${payment}</p>
    </div>
    <div class="flex-row center-start">
      <p class="rental-price">${price}<span class="currence">DZD</span></p>
    </div>
    <div class="flex-row center-start">
      <p class="rental-state ${status}">${status}</p>
    </div>
  `

  editBut = document.createElement('div')
  editBut.classList.add('flex-row', 'rent-edit-but')
  icn = document.createElement('i')
  icn.classList.add("fa-solid", "fa-ellipsis-vertical", "bt", "bt-hover")
  editBut.appendChild(icn)
  editBut.addEventListener('click', (e)=>{

    try {
      document.querySelectorAll('.popmenu').forEach( pop => pop.remove())
    } catch (error) {}

    popmenu = document.createElement('ul')
    popmenu.classList.add('popmenu', "flex-row")

    removeBut = document.createElement('li')
    removeBut.classList.add("rent-remove-but")
    removeBut.innerHTML = `<i class="fa-solid fa-trash-can bt bt-hover"></i>`
    removeBut.setAttribute("title", "Delete")

    cancelBut = document.createElement('li')
    cancelBut.classList.add("rent-cancel-but")
    cancelBut.innerHTML = `<i class="fa-solid fa-ban bt bt-hover"></i>`
    cancelBut.setAttribute("title", "Cancel")

    removeBut.addEventListener('click', ()=>{
      confirm(true, "Confirm Action", "Are you sure you want to delete this record?").then((result) => {
        if(result){
          openLoader()
          try{
            fetch(`${window.location.origin}/api/orders/delete`, {
              method: "POST",
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ rid: id }),
            })
            .then(response => response.json())
            .then(data => {
              closeLoader()
                if (data.message) {
                    pushNotif("i", data.message)
                    rentalContainer.remove();
                } else {
                    pushNotif("e", `Somthing went wrong!`)
                }
            })
            .catch(error => {
                closeLoader()
                pushNotif("e", "Somthing went wrong!")
            });
          }catch(error){pushNotif('e', "Somthing went wrong!"); closeLoader()}
        }
      });
    })

    cancelBut.addEventListener('click', ()=>{
      confirm(false, "Confirm Action", "Are you sure you want to proceed?").then((result) => {
        if(result){
          openLoader()
          try{
            fetch(`${window.location.origin}/api/orders/status`, {
              method: "POST",
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ rid: id, status: "canceled" }),
            })
            .then(response => response.json())
            .then(data => {
              closeLoader()
                if (data.message) {
                    pushNotif("i", data.message)
                } else {
                    pushNotif("e", `Somthing went wrong!`)
                }
            })
            .catch(error => {
                closeLoader()
                pushNotif("e", "Somthing went wrong!")
            }); 
          }catch(error){
            closeLoader();
            pushNotif("e", "Somthing went wrong!")
          }
        }
      })
    })

    if(Array.from(["completed", "canceled"]).includes(status.toString().toLowerCase())) popmenu.appendChild(removeBut)
    if(Array.from(["pending"]).includes(status.toString().toLowerCase())) popmenu.appendChild(cancelBut)

    e.target.parentElement.appendChild(popmenu)
    setTimeout(() => {
      try {
        document.querySelectorAll('.popmenu').forEach( pop => pop.remove())
      } catch (error) {}
    }, 5000);
  })
  
  rentalContainer.appendChild(editBut)
  rentalsContainer.appendChild(rentalContainer)
}

function updateUrlFilters() {
  const i = document.getElementById('uIR').value;
  const limit = document.getElementById('filterLimit').value || "10";
  const offset = document.getElementById('filterOffset').value || "0";
  const status = document.querySelector('input[name="ordTf"]:checked')?.value || '';
  const search = document.getElementById('search4p').value || document.getElementById('search4pp').value || '';
  const orderBy = document.querySelector('.rental-fltr').value || '';
  const start_date = document.getElementById('filterStartDate').value || '';
  const end_date = document.getElementById('filterEndDate').value || '';

  // Initialize an empty URLSearchParams
  const params = new URLSearchParams();

  // Always required
  if (i) params.append('id', i);
  if (limit) params.append('limit', limit);
  if (offset) params.append('offset', offset);

  // Optional filters
  if (status) params.append('status', status);
  if (search) params.append('search', search.trim());
  if (orderBy) params.append('ody', orderBy);
  if (start_date) params.append('start_date', start_date);
  if (end_date) params.append('end_date', end_date);

  const FURL = `${window.location.origin}/api/users/rentals?${params.toString()}`
  openLoader()
  try {
    fetch(FURL)
    .then(response => {
      if (!response.ok) {
        closeLoader()
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      openLoader()
      clearRentals()
      data.rentals.forEach(rental=>{
        refreshRentals(
          rental.id,
          `${rental.brand_name} ${rental.model} ${rental.fab_year}`,
          rental.created_at,
          'paid',
          rental.status,
          rental.total_price,
          rental.start_date,
          rental.end_date,
          rental.rental_type,
          i
        );
      })
      gsap.set(".rental-order-anm", {y: 100, opacity: 0})
      
      gsap.to(".rental-order-anm", {
        y: 0,
        stagger: 0.1,
        opacity: 1
      });
      closeLoader()
    })
    .catch(error => {
      closeLoader()
      console.error('Failed to load rentals:', error);
    });
  } catch (error) {
    pushNotif("e", "Somthing went wrong!")
  }
}
  
updateUrlFilters()  
document.querySelectorAll('input[name="ordTf"]').forEach((radio) => {
  radio.addEventListener('change', updateUrlFilters);
});
document.getElementById('search4p').addEventListener('input',updateUrlFilters);
document.getElementById('search4pp').addEventListener('input',updateUrlFilters);
document.querySelector('.rental-fltr').addEventListener('change', updateUrlFilters);
document.getElementById('dateRange').addEventListener('change', updateUrlFilters);

