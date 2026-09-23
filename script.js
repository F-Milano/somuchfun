/* =========================================================
   SO MUCH FUN — HOMEPAGE INTERACTION
   ========================================================= */


/* =========================================================
   SETTINGS
   ========================================================= */

/*
   Minimum distance between a project image
   and the edge of the browser window.
*/

const screenMargin = 30;


// Get all project elements.

const projects = document.querySelectorAll(".project");


// Used to bring the last dragged project to the front.

let highestZ = 1;



/* =========================================================
   INITIALIZE PROJECTS
   ========================================================= */

/*
   IMPORTANT:

   We do NOT wait for the entire page to load anymore.

   Instead, every project is initialized independently
   as soon as its own image is ready.

   This means that one slow-loading image does not prevent
   all the other projects from appearing.
*/

projects.forEach((project) => {

    const image = project.querySelector("img");


    /*
       If the image is already cached / loaded,
       initialize the project immediately.
    */

    if (image.complete && image.naturalWidth > 0) {

        initializeProject(project);

    }


    /*
       Otherwise wait only for THIS image.
    */

    else {

        image.addEventListener(
            "load",
            () => initializeProject(project),
            { once: true }
        );

    }

});



/* =========================================================
   INITIALIZE ONE PROJECT
   ========================================================= */

function initializeProject(project) {


    /*
       First calculate its random position while
       it is still invisible.
    */

    positionProjectRandomly(project);


    /*
       Activate mouse / touch dragging.
    */

    makeProjectDraggable(project);


    /*
       The project is now correctly positioned,
       so make it visible.
    */

    project.style.opacity = "1";

}



/* =========================================================
   RANDOM POSITION
   ========================================================= */

function positionProjectRandomly(project) {


    /*
       Get the real dimensions of the project
       after its image has loaded.
    */

    const projectWidth = project.offsetWidth;
    const projectHeight = project.offsetHeight;



    /*
       Define the safe area.

       screenMargin is applied to all four sides.
    */

    const minX = screenMargin;
    const minY = screenMargin;

    const maxX =
        window.innerWidth -
        projectWidth -
        screenMargin;

    const maxY =
        window.innerHeight -
        projectHeight -
        screenMargin;



    /*
       Generate random coordinates inside
       the safe area.
    */

    const randomX =
        minX + Math.random() * (maxX - minX);

    const randomY =
        minY + Math.random() * (maxY - minY);



    /*
       Apply position.
    */

    project.style.left = randomX + "px";
    project.style.top = randomY + "px";

}



/* =========================================================
   DRAGGING
   ========================================================= */

function makeProjectDraggable(project) {


    let dragging = false;
    let moved = false;

    let offsetX = 0;
    let offsetY = 0;



    /* ---------------------------------------------------------
       POINTER DOWN
       --------------------------------------------------------- */

    project.addEventListener("pointerdown", (event) => {


        dragging = true;

        moved = false;



        /*
           Remember where inside the project
           the click/touch happened.
        */

        offsetX =
            event.clientX -
            project.offsetLeft;

        offsetY =
            event.clientY -
            project.offsetTop;



        /*
           Bring the selected project to the front.
        */

        highestZ++;

        project.style.zIndex = highestZ;



        /*
           Continue receiving pointer events even if
           the pointer moves outside the image.
        */

        project.setPointerCapture(event.pointerId);


        event.preventDefault();

    });



    /* ---------------------------------------------------------
       POINTER MOVE
       --------------------------------------------------------- */

    project.addEventListener("pointermove", (event) => {


        if (!dragging) return;


        moved = true;



        /*
           Proposed new position.
        */

        let x =
            event.clientX -
            offsetX;

        let y =
            event.clientY -
            offsetY;



        /*
           Calculate the current safe area.
        */

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



        /*
           Keep the COMPLETE project inside
           the safe area.
        */

        x = Math.max(
            minX,
            Math.min(x, maxX)
        );

        y = Math.max(
            minY,
            Math.min(y, maxY)
        );



        /*
           Apply position.
        */

        project.style.left = x + "px";
        project.style.top = y + "px";

    });



    /* ---------------------------------------------------------
       POINTER UP
       --------------------------------------------------------- */

    project.addEventListener("pointerup", () => {

        dragging = false;

    });



    /* ---------------------------------------------------------
       POINTER CANCEL
       --------------------------------------------------------- */

    project.addEventListener("pointercancel", () => {

        dragging = false;

    });



    /* ---------------------------------------------------------
       CLICK
       --------------------------------------------------------- */

    project.addEventListener("click", (event) => {


        /*
           If the project moved, interpret the interaction
           as a drag rather than a click.
        */

        if (moved) {

            event.preventDefault();

        }

    });

}



/* =========================================================
   WINDOW RESIZE
   ========================================================= */

/*
   If the browser window changes size, make sure
   every project remains inside the safe area.

   We do NOT randomize the positions again.
*/

window.addEventListener("resize", () => {

    projects.forEach((project) => {


        /*
           Only correct projects that have already
           been initialized.
        */

        if (project.style.opacity === "1") {

            keepProjectInsideScreen(project);

        }

    });

});



/* =========================================================
   KEEP PROJECT INSIDE SCREEN
   ========================================================= */

function keepProjectInsideScreen(project) {


    /*
       Calculate current boundaries.
    */

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



    /*
       Read current position.
    */

    let x = project.offsetLeft;
    let y = project.offsetTop;



    /*
       Clamp X and Y to the safe area.
    */

    x = Math.max(
        minX,
        Math.min(x, maxX)
    );

    y = Math.max(
        minY,
        Math.min(y, maxY)
    );



    /*
       Apply corrected position.
    */

    project.style.left = x + "px";
    project.style.top = y + "px";

}
