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


// Get all project elements from the HTML.

const projects = document.querySelectorAll(".project");


// Used to bring the last dragged project to the front.

let highestZ = 1;



/* =========================================================
   INITIALIZE PROJECTS
   ========================================================= */

/*
   Wait until the entire page AND all project images
   have finished loading.

   This allows JavaScript to know the real dimensions
   of each image before calculating its position.
*/

window.addEventListener("load", () => {

    projects.forEach((project) => {


        /*
           1. Calculate the random position while
              the project is still invisible.
        */

        positionProjectRandomly(project);


        /*
           2. Activate mouse/touch dragging.
        */

        makeProjectDraggable(project);


        /*
           3. The position is now correct, so reveal it.
        */

        project.style.opacity = "1";

    });

});



/* =========================================================
   RANDOM POSITION
   ========================================================= */

function positionProjectRandomly(project) {


    /*
       Get the actual dimensions of this project
       after its image has loaded.
    */

    const projectWidth = project.offsetWidth;
    const projectHeight = project.offsetHeight;



    /*
       Define the safe area.

       The complete project must remain at least
       screenMargin pixels away from every edge.
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
       Generate a random X and Y coordinate
       inside the safe area.
    */

    const randomX =
        minX + Math.random() * (maxX - minX);

    const randomY =
        minY + Math.random() * (maxY - minY);



    /*
       Apply the calculated position.
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
           Remember exactly where inside the project
           the user clicked/touched.

           This prevents the image from jumping when
           dragging begins.
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
           the pointer temporarily leaves the element.
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
           Calculate proposed new position.
        */

        let x =
            event.clientX -
            offsetX;

        let y =
            event.clientY -
            offsetY;



        /*
           Recalculate the safe area.

           This uses the current browser dimensions,
           so it remains correct if the viewport changes.
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
           Clamp the position.

           This prevents the project from being dragged
           outside the safe area.
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
           Apply the new position.
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
           If the pointer moved, interpret the action
           as dragging rather than clicking.

           This prevents the project page from opening
           after moving an icon.
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
   If the browser window becomes smaller,
   check every project.

   Any project that would now be outside the safe area
   is automatically moved back inside.

   Existing positions are otherwise preserved.
*/

window.addEventListener("resize", () => {

    projects.forEach((project) => {

        keepProjectInsideScreen(project);

    });

});



/* =========================================================
   KEEP PROJECT INSIDE SCREEN
   ========================================================= */

function keepProjectInsideScreen(project) {


    /*
       Calculate current safe-area boundaries.
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
       Correct X only if it is outside the safe area.
    */

    x = Math.max(
        minX,
        Math.min(x, maxX)
    );



    /*
       Correct Y only if it is outside the safe area.
    */

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
