gsap.set(".about-title span", { y: 0, opacity: 1 });
gsap.set(".cars-logo", { y: 0, opacity: 1 });
gsap.set(".cars-logo .car-logo", { y: 0, opacity: 1 });
gsap.set(".car-svg", { x: "0%" });
gsap.set("#wheel", { rotate: 0 });
gsap.set(".frame1", { x:-300, rotate: -20, y: -200, opacity: 1 });
gsap.set(".frame2", { x:-180, rotate: 10, y: -350, opacity: 1 });
gsap.set(".app-desc h1", { y: 0, opacity: 1 });
gsap.set(".app-desc p", { y: 0, opacity: 1 });
gsap.set(".app-but", { y: 0, opacity: 1 });
gsap.set(".type-image", { scale: 1, opacity: 1});
gsap.set(".type-image-s", { scale: 1, opacity: 1});
gsap.set(".feature-container", { scale: 1, y: 0, opacity: 1});
gsap.set(".features-desc", { scale: 1, y: 0, opacity: 1});
gsap.set(".features-desc2", { scale: 1, y: 0, opacity: 1});
gsap.set(".mapper", {y: 0, opacity:1});
gsap.set(".feature-icon i", { scale: 1});
gsap.set("footer", { opacity: 1});

gsap.to(".about-title span", {
    y: -200,
    duration: 1,
    opacity: 0,
    stagger: 0.1,
    scrollTrigger: {
        scrub: 2,
        start: "top top",
        trigger: "#aboutSection",
    }
});

gsap.to(".cars-logo", {
    y: 100,
    opacity: 0,
    duration: 0.5,
    scrollTrigger: {
        scrub: 2,
        start: "top top",
        trigger: "#aboutSection",
    }
});

gsap.to(".cars-logo .car-logo", {
    y: 50,
    opacity: 0,
    stagger: 0.1,
    scrollTrigger: {
        scrub: 2,
        start: "top top",
        trigger: "#aboutSection",
    }
});

gsap.to(".car-svg", {
    x: "100%",
    scrollTrigger: {
        scrub: 2,
        start: "top top",
        trigger: "#aboutSection",
    }
});

gsap.to("#wheel", {
    rotate: 360,
    svgOrigin: "266 602",
    scrollTrigger: {
        scrub: 2,
        start: "top top",
        trigger: "#aboutSection",
    }
});

gsap.from(".phone-frame", {
    rotate: 10,
    y: -50,
    opacity: 0,
    stagger: 0.1,
    scrollTrigger: {
        scrub: 2,
        start: "top top",
        trigger: "#aboutSection",
    }
});

gsap.from(".app-desc h1", {
    y: 100,
    opacity: 0,
    delay: 0.2,
    scrollTrigger: {
        scrub: 2,
        start: "top top",
        trigger: "#aboutSection",
    }
});

gsap.from(".app-desc p", {
    y: 100,
    opacity: 0,
    delay: 0.3,
    scrollTrigger: {
        scrub: 2,
        start: "top top",
        trigger: "#aboutSection",
    }
});

gsap.from(".app-but", {
    y: 50,
    opacity: 0,
    delay: 0.5,
    stagger: 0.1,
    scrollTrigger: {
        scrub: 2,
        start: "top top",
        trigger: "#aboutSection",
    }
});

gsap.from(".car-type", {
    y: 50,
    opacity: 0,
    stagger: 0.1,
    scrollTrigger: {
        scrub: 2,
        start: "center center",
        trigger: "#appSection",
    }
});

gsap.from(".cars-desc", {
    y: 50,
    opacity: 0,
    scrollTrigger: {
        scrub: 2,
        start: "center center",
        trigger: "#appSection",
    }
});

gsap.from(".type-image", {
    scale: 0.5,
    stagger: 0.1,
    opacity: 0,
    delay: 0.2,
    scrollTrigger: {
        scrub: 2,
        start: "center center",
        trigger: "#appSection",
    }
});

gsap.from(".type-image-s", {
    scale: 0.5,
    stagger: 0.2,
    delay: 0.3,
    opacity: 0,
    scrollTrigger: {
        scrub: 2,
        start: "center center",
        trigger: "#appSection",
    }
});

gsap.from(".feature-container", {
    scale: 1.5,
    y: 100,
    stagger: 0.5,
    opacity: 0,
    delay: 1,
    scrollTrigger: {
        scrub: 2,
        start: "center center",
        trigger: "#carsSection",
    }
});

gsap.from(".features-desc", {
    scale: 1.5,
    y: 100,
    stagger: 0.2,
    opacity: 0,
    delay: 0.3,
    scrollTrigger: {
        scrub: 2,
        start: "center center",
        trigger: "#carsSection"
    }
});

gsap.from(".features-desc2", {
    scale: 1.5,
    y: 100,
    stagger: 0.2,
    opacity: 0,
    delay: 0.3,
    scrollTrigger: {
        scrub: 2,
        start: "center center",
        trigger: "#featuresSection"
    }
});

gsap.from(".feature-icon i", {
    scale: 0.5,
    stagger: 0.1,
    scrollTrigger: {
        scrub: 2,
        trigger: ".feature-icon"
    }
});

gsap.to(".map-img", {
    opacity: 0,
    stagger: 0.1,
    scrollTrigger: {
        scrub: 2,
        start: "top top",
        trigger: "#appSection",
    }
});

gsap.from(".mapper", {
    y: 100,
    opacity: 0,
    stagger: 0.1,
    scrollTrigger: {
        scrub: 2,
        start: "center center",
        trigger: "#featuresSection"
    }
});

window.addEventListener("load", () => {
    ScrollTrigger.refresh();
    window.scrollTo(document.body.clientHeight*4, document.body.clientHeight*4);
    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 100);
});

document.addEventListener("DOMContentLoaded", function () {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show"); 
            } else {
                entry.target.classList.remove("show"); 
            }
        });
    }, { threshold: 0.2 }); 

    document.querySelectorAll(".scroll-animation").forEach(el => observer.observe(el));
});

window.addEventListener("reset", ()=>{
    ScrollTrigger.refresh();
    window.scrollTo(document.body.clientHeight*4, document.body.clientHeight*4);
    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 100);
})


const openNav = () => {
    document.getElementById("mainNavigator").style.left = 0;
}

const closeNav = () => {
    document.getElementById("mainNavigator").style.left = "-130px";
}

document.getElementById("homeNavIcon").addEventListener('click', openNav)
document.getElementById("homeNavClose").addEventListener('click', closeNav)


const carSvg = document.querySelector('.car-svg');
let timeout1, timeout2, timeout3; // Store timeouts

document.querySelectorAll('.car-logo').forEach(logo => {
    logo.addEventListener('click', () => {
        // Clear any pending timeouts
        clearTimeout(timeout1);
        clearTimeout(timeout2);
        clearTimeout(timeout3);

        document.querySelectorAll('.car-logo').forEach(logo1 => {
            logo1.classList.remove("car-logo-selected");
        });
        logo.classList.add("car-logo-selected");

        let carNam = logo.children[0].getAttribute("alt");
        const carImg = `/assets/images/${carNam}_no_wheel.png`;
        const wheelImg = `/assets/images/${carNam}_wheel.png`;

        // Animate car out
        gsap.to(".car-svg", { ease: "power2.in", x: "-200%" });
        gsap.from("#wheel", { rotate: 360, svgOrigin: "266 602" });
        gsap.set("#wheel", { rotate: 0 });

        timeout1 = setTimeout(() => {
            carSvg.style.display = "none";
            gsap.set(".car-svg", { x: "100%" });
        }, 600);

        timeout2 = setTimeout(() => {
            document.getElementById('imageWheel').setAttribute("href", wheelImg);
            document.getElementById('imageCar').setAttribute("href", carImg);
            carSvg.style.display = "flex";

            timeout3 = setTimeout(() => {
                gsap.to(".car-svg", { ease: "power4.inout", x: "0%" });
                gsap.from("#wheel", { ease: "power4.inout", rotate: 360, svgOrigin: "266 602" });
            }, 500);
        }, 700);
    });
});
