const projects = document.querySelectorAll(".project");

let highestZ = 1;

projects.forEach((project) => {

    // RANDOM STARTING POSITION
    const maxX = window.innerWidth - project.offsetWidth;
    const maxY = window.innerHeight - project.offsetHeight;

    project.style.left = Math.random() * maxX + "px";
    project.style.top = Math.random() * maxY + "px";


    let dragging = false;
    let moved = false;

    let offsetX = 0;
    let offsetY = 0;


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


    project.addEventListener("pointermove", (event) => {

        if (!dragging) return;

        moved = true;

        let x = event.clientX - offsetX;
        let y = event.clientY - offsetY;


        // Keep inside viewport
        x = Math.max(
            0,
            Math.min(x, window.innerWidth - project.offsetWidth)
        );

        y = Math.max(
            0,
            Math.min(y, window.innerHeight - project.offsetHeight)
        );


        project.style.left = x + "px";
        project.style.top = y + "px";
    });


    project.addEventListener("pointerup", () => {
        dragging = false;
    });


    project.addEventListener("click", (event) => {

        if (moved) {
            event.preventDefault();
        }

    });

});
