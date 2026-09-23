const projects = document.querySelectorAll(".project");

let highestZ = 1;

// Minimum distance between an icon and the edge of the screen
const screenMargin = 50;


projects.forEach((project) => {

    // =========================================
    // RANDOM STARTING POSITION
    // =========================================

    const minX = screenMargin;
    const minY = screenMargin;

    const maxX =
        window.innerWidth -
        project.offsetWidth -
        screenMargin;

    const maxY =
        window.innerHeight -
        project.offsetHeight -
        screenMargin;


    const randomX =
        minX + Math.random() * (maxX - minX);

    const randomY =
        minY + Math.random() * (maxY - minY);


    project.style.left = randomX + "px";
    project.style.top = randomY + "px";


    // =========================================
    // DRAG VARIABLES
    // =========================================

    let dragging = false;
    let moved = false;

    let offsetX = 0;
    let offsetY = 0;


    // =========================================
    // POINTER DOWN
    // =========================================

    project.addEventListener("pointerdown", (event) => {

        dragging = true;
        moved = false;

        offsetX = event.clientX - project.offsetLeft;
        offsetY = event.clientY - project.offsetTop;

        highestZ++;

        project.style.zIndex = highestZ;

        project.setPointerCapture(event.pointerId);

        event.preventDefault();
    });


    // =========================================
    // POINTER MOVE
    // =========================================

    project.addEventListener("pointermove", (event) => {

        if (!dragging) return;

        moved = true;

        let x = event.clientX - offsetX;
        let y = event.clientY - offsetY;


        // -------------------------------------
        // SAFE AREA
        // -------------------------------------

        const minX = screenMargin;
        const minY = screenMargin;

        const maxX =
            window.innerWidth -
            project.offsetWidth -
            screenMargin;

        const maxY =
            window.innerHeight -
            project.offsetHeight -
            screenMargin;


        x = Math.max(
            minX,
            Math.min(x, maxX)
        );

        y = Math.max(
            minY,
            Math.min(y, maxY)
        );


        project.style.left = x + "px";
        project.style.top = y + "px";
    });


    // =========================================
    // POINTER UP
    // =========================================

    project.addEventListener("pointerup", () => {

        dragging = false;

    });


    // =========================================
    // CLICK
    // =========================================

    project.addEventListener("click", (event) => {

        // If the icon was dragged,
        // don't open the project page.

        if (moved) {
            event.preventDefault();
        }

    });

});
