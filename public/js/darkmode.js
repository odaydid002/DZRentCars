
document.addEventListener("DOMContentLoaded", () => {
    var root = document.documentElement;

    let dark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (dark) {
        toggleDark();
    } else {
        toggleLight();
    }

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
        if (e.matches) {
            toggleDark();
        } else {
            toggleLight();
        }
    });

    function toggleDark() {
        try {
            document.querySelector('.docard-sign').style.filter = "invert(1)";
        } catch (error) {}
        try {
            document.querySelector('.options').style.backgroundColor = "var(--border-low)";
            document.querySelectorAll('.pop-avilability').forEach(pop => {
                pop.style.backgroundColor = "var(--border)";
            });
        } catch (error) {}
        root.style.setProperty('--bg', 'rgb(24, 23, 23)');
        root.style.setProperty('--dark-bg', '#f0eded');
        root.style.setProperty('--bg-lower', 'rgb(39, 39, 39)');
        root.style.setProperty('--container', 'rgb(32, 32, 32)');
        root.style.setProperty('--txt-black', 'white');
        root.style.setProperty('--txt-white', 'black');
        root.style.setProperty('--text-low', 'rgba(129, 129, 129, 0.3)');
        root.style.setProperty('--text', 'rgb(179, 179, 179)');
        root.style.setProperty('--bg-darker', '#0f0f0f');
        root.style.setProperty('--border', 'rgba(122, 122, 122, 0.09)');
        root.style.setProperty('--border-low', 'rgba(122, 122, 122, 0.13)');
        root.style.setProperty('--input-4dark', 'rgba(122, 122, 122, 0.13)');
        root.style.setProperty('--select-4dark', 'rgb(39, 39, 39)');
    }

    function toggleLight() {
        try {
            document.querySelector('.docard-sign').style.filter = "invert(0)";
        } catch (error) {}
        try {
            document.querySelector('.options').style.backgroundColor = "transparent";
            document.querySelectorAll('.pop-avilability').forEach(pop => {
                pop.style.backgroundColor = "white";
            });
        } catch (error) {}
        root.style.setProperty('--bg', '#f0eded');
        root.style.setProperty('--dark-bg', '#1a1a1a');
        root.style.setProperty('--bg-lower', 'rgb(250, 250, 250)');
        root.style.setProperty('--container', 'white');
        root.style.setProperty('--txt-black', 'black');
        root.style.setProperty('--txt-white', 'white');
        root.style.setProperty('--text-low', '#3333334b');
        root.style.setProperty('--text', '#171b24');
        root.style.setProperty('--bg-darker', '#d3d0d0');
        root.style.setProperty('--input-4dark', 'transparent');
        root.style.setProperty('--select-4dark', 'white');
        root.style.setProperty('--border-low', 'rgba(128, 128, 128, 0.15)');
    }
});

