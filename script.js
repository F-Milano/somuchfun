const projects = document.querySelectorAll(".project");

let highestZ = 1;

projects.forEach((project) => {

    // -------------------------
    // RANDOM STARTING POSITION
    // -------------------------

    const maxX = window.innerWidth - project.offsetWidth;
    const maxY = window.innerHeight - project.offsetHeight;

    project.style.left = Math.random() * maxX + "px";
    project.style.top = Math.random() * maxY + "px";


    // -------------------------
    // DRAG
    // -------------------------

    let startX;
    let startY;

    let initialLeft;
    let initialTop;

    let dragging = false;


    project.addEventListener("pointerdown", (event) => {

        startX = event.clientX;
        startY = event.clientY;

        initialLeft = project.offsetLeft;
        initialTop = project.offsetTop;

        dragging = false;

        highestZ++;
        project.style.zIndex = highestZ;

        project.setPointerCapture(event.pointerId);
    });


    project.addEventListener("pointermove", (event) => {

        if (!project.hasPointerCapture(event.pointerId)) return;

        const dx = event.clientX - startX;
        const dy = event.clientY - startY;

        // Prevent tiny mouse movements
        // from being interpreted as dragging.

        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
            dragging = true;
        }

        if (!dragging) return;


        let newX = initialLeft + dx;
        let newY = initialTop + dy;


        // Keep project inside viewport.

        newX = Math.max(
            0,
            Math.min(
                newX,
                window.innerWidth - project.offsetWidth
            )
        );

        newY = Math.max(
            0,
            Math.min(
                newY,
                window.innerHeight - project.offsetHeight
            )
        );


        project.style.left = newX + "px";
        project.style.top = newY + "px";
    });


    project.addEventListener("click", (event) => {

        // Dragging should NOT open project.

        if (dragging) {
            event.preventDefault();
        }

    });

});
