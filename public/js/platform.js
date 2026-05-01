document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", function (event) {
          event.preventDefault();
          const section = this.getAttribute("data-section");

          fetch(`/${section}`)
              .then(response => response.text())
              .then(html => {
                  document.getElementById("platContent").innerHTML = html;
              });
      });
  });
});

document.querySelectorAll('.plat-nav-element').forEach(el=>{
  el.addEventListener("click", ()=>{
    document.querySelectorAll('.plat-nav-element').forEach(ell=>{
      ell.classList.remove('plat-nav-selected')
    })
    el.classList.add('plat-nav-selected')
  })
})

function navTour() {
  const driver = window.driver.js.driver;

  const tour = driver({
      showProgress: true,
      showButtons: true,
      steps: isMobile()?
      [
          {
              element: '#navHome',
              popover: {
                  title: 'Home',
                  description: 'Go to the homepage where you can find an overview.',
                  position: 'right'
              }
          },
          {
              element: '#navCars',
              popover: {
                  title: 'Cars',
                  description: 'Explore available cars for rent.',
                  position: 'right'
              }
          },
          {
              element: '#navOrders',
              popover: {
                  title: 'Orders',
                  description: 'Check your current and past rentals.',
                  position: 'right'
              }
          },
          {
              element: '#navFav',
              popover: {
                  title: 'Favorites',
                  description: 'View cars you marked as favorite.',
                  position: 'right'
              }
          },
          {
              element: '#navProfile',
              popover: {
                  title: 'Documents',
                  description: 'Upload and manage your personal documents.',
                  position: 'right'
              }
          }
      ]:[
        {
            element: '#navHome',
            popover: {
                title: 'Home',
                description: 'Go to the homepage where you can find an overview.',
                position: 'right'
            }
        },
        {
            element: '#navCars',
            popover: {
                title: 'Cars',
                description: 'Explore available cars for rent.',
                position: 'right'
            }
        },
        {
            element: '#navOrders',
            popover: {
                title: 'Orders',
                description: 'Check your current and past rentals.',
                position: 'right'
            }
        },
        {
            element: '#navFav',
            popover: {
                title: 'Favorites',
                description: 'View cars you marked as favorite.',
                position: 'right'
            }
        },
        {
            element: '#navDocs',
            popover: {
                title: 'Documents',
                description: 'Upload and manage your personal documents.',
                position: 'right'
            }
        },
        {
            element: '#navHelp',
            popover: {
                title: 'Help',
                description: 'Need assistance? Visit our help section.',
                position: 'right'
            }
        }
    ],
    onDestroyed: async()=>{
        try {
            openLoader()
            user_id = document.getElementById('bodyTitle').value
            await fetch(`${window.location.origin}/api/users/newbie`, {
                    method: "POST",
                    headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify({ user_id: user_id, page: "navbar" }),
            })
            closeLoader()
            homeTour()
        } catch (error) {console.error(error); closeLoader()}
    }
  });

  tour.drive();
}

function homeTour() {
  const driver = window.driver.js.driver;

  const tour = driver({
      showProgress: true,
      showButtons: true,
      steps: !isMobile()? 
      [
          {
              element: '#homeOptions',
              popover: {
                  title: 'Book now',
                  description: 'Select brand, model you want and rent now.',
                  position: 'right'
              }
          },
          {
              element: '#homePopular',
              popover: {
                  title: '⭐ Best Reviewed Cars',
                  description: 'A quick guide to help you collect your rental car smoothly — from document check to vehicle inspection, everything you need for a hassle-free pickup.',
                  position: 'right'
              }
          },
          {
              element: '#collectionCars',
              popover: {
                  title: '🚗 Cars Collection',
                  description: 'A quick guide to help you collect your rental car smoothly — from document check to vehicle inspection.',
                  position: 'right'
              }
          }
      ]:[
        {
            element: '#homePopular',
            popover: {
                title: '⭐ Best Reviewed Cars',
                description: 'A quick guide to help you collect your rental car smoothly — from document check to vehicle inspection, everything you need for a hassle-free pickup.',
                position: 'right'
            }
        },
        {
            element: '#collectionCars',
            popover: {
                title: '🚗 Cars Collection',
                description: 'A quick guide to help you collect your rental car smoothly — from document check to vehicle inspection.',
                position: 'right'
            }
        }
    ],
    onDestroyed: async()=>{
        try {
            openLoader()
            user_id = document.getElementById('bodyTitle').value
            await fetch(`${window.location.origin}/api/users/newbie`, {
                    method: "POST",
                    headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify({ user_id: user_id, page: "home" }),
            })
            closeLoader()
        } catch (error) {console.error(error); closeLoader()}
    }
  });



  tour.drive();
}

function carsTour() {
  const driver = window.driver.js.driver;

  const tour = driver({
      showProgress: true,
      showButtons: true,
      steps: isMobile()? 
      [
        {
            element: '#searchbarFilterM',
            popover: {
                title: '🔍 Search & Filter',
                description: 'Easily find your ideal ride by filtering cars by price, type, brand, and features. Fast, smart, and simple.',
                position: 'center'
            }
        },
        {
            element: '#platCarsContainer',
            popover: {
                title: '🚗 Browse Cars',
                description: 'Browse matching vehicles based on your search. Compare options, check details, and pick your perfect ride.',
                position: 'right'
            }
        },
        {
            element: '#carsPagin',
            popover: {
                title: '📄 Car Listings Pages',
                description: 'Navigate through multiple pages of car listings with ease. Find more options by browsing page by page.',
                position: 'right'
            }
        }
      ]:[
        {
            element: '#filterSec',
            popover: {
                title: '🔍 Search & Filter',
                description: 'Easily find your ideal ride by filtering cars by price, type, brand, and features. Fast, smart, and simple.',
                position: 'center'
            }
        },
        {
            element: '#applyFilter',
            popover: {
                title: 'Click here to apply filters',
                position: 'center'
            }
        },
        {
            element: '#platCarsContainer',
            popover: {
                title: '🚗 Browse Cars',
                description: 'Browse matching vehicles based on your search. Compare options, check details, and pick your perfect ride.',
                position: 'right'
            }
        },
        {
            element: '#carsPagin',
            popover: {
                title: '📄 Car Listings Pages',
                description: 'Navigate through multiple pages of car listings with ease. Find more options by browsing page by page.',
                position: 'right'
            }
        }
    ],
    onDestroyed: async()=>{
        try {
            openLoader()
            user_id = document.getElementById('bodyTitle').value
            await fetch(`${window.location.origin}/api/users/newbie`, {
                    method: "POST",
                    headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify({ user_id: user_id, page: "vehicles" }),
            })
            closeLoader()
        } catch (error) {console.error(error); closeLoader()}
    }
  });

  tour.drive();
}

function rentalsTour() {
  const driver = window.driver.js.driver;

  const tour = driver({
      showProgress: true,
      showButtons: true,
      steps: isMobile()? 
      [
        {
            element: '#rentalsFilterStatus',
            popover: {
                title: '✅ Filter by Status',
                description: 'Easily view orders by status — upcoming, active, completed, or cancelled — to track your rentals at a glance.',
                position: 'center'
            }
        },
        {
            element: '.rentalsFiltersP',
            popover: {
                title: '📑 Filter Orders',
                description: 'Quickly search, sort and filter your rental orders by date, or car type to manage your bookings with ease.',
                position: 'center'
            }
        },
        {
            element: '#rentalsContainer',
            popover: {
                title: '📋 Orders Result List',
                description: 'View all your filtered rental orders in one place. Check details, status, and actions for each booking.',
                position: 'right'
            }
        }
      ]:[
        {
            element: '#rentalsFilterStatus',
            popover: {
                title: '✅ Filter by Status',
                description: 'Easily view orders by status — upcoming, active, completed, or cancelled — to track your rentals at a glance.',
                position: 'center'
            }
        },
        {
            element: '#rentalsFiltersBar',
            popover: {
                title: '📑 Filter Orders',
                description: 'Quickly search, sort and filter your rental orders by date, or car type to manage your bookings with ease.',
                position: 'right'
            }
        },
        {
            element: '#rentalsContainer',
            popover: {
                title: '📋 Orders Result List',
                description: 'View all your filtered rental orders in one place. Check details, status, and actions for each booking.',
                position: 'right'
            }
        }
    ],
    onDestroyed: async()=>{
        try {
            openLoader()
            user_id = document.getElementById('bodyTitle').value
            await fetch(`${window.location.origin}/api/users/newbie`, {
                    method: "POST",
                    headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify({ user_id: user_id, page: "orders" }),
            })
            closeLoader()
        } catch (error) {console.error(error); closeLoader()}
    }
  });

  tour.drive();
}

function profileTour() {
  const driver = window.driver.js.driver;

  const tour = driver({
      showProgress: true,
      showButtons: true,
      steps:[
        {
            element: '#accountInfos',
            popover: {
                title: 'Account Information, Photo, and Status 📋📸',
                description: 'View and update your personal details, profile photo, and status to keep your account personalized and up to date. ✨',
                position: 'right'
            }
        },
        {
            element: '#accountStatus',
            popover: {
                title: 'Account Status 🟢🔴',
                description: 'Check and update your account status to reflect your current availability or activity. Stay connected and keep others informed! 💬',
                position: 'right'
            }
        },
        {
            element: '#accountStatusEtat',
            popover: {
                title: 'Account Status 🟢🔴',
                description: 'Check and update your account status to reflect your current availability or activity. Stay connected and keep others informed! 💬',
                position: 'right'
            }
        },
        {
            element: '#persInfo',
            popover: {
                title: 'Personal Information 📝',
                description: 'Manage and update your personal details, such as name, email, and contact information, to keep your profile accurate and up to date. 🔄',
                position: 'center'
            }
        }
      ],
      onDestroyed: async()=>{
        try {
            openLoader()
            user_id = document.getElementById('bodyTitle').value
            await fetch(`${window.location.origin}/api/users/newbie`, {
                    method: "POST",
                    headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify({ user_id: user_id, page: "profile" }),
            })
            closeLoader()
        } catch (error) {console.error(error); closeLoader()}
    }
  });

  tour.drive();
}