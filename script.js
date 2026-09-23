/* =========================================================
   SO MUCH FUN — HOMEPAGE INTERACTION
   ========================================================= */


/* =========================================================
   SETTINGS
   ========================================================= */

// Minimum distance between project images
// and the edge of the browser window.

const screenMargin = 30;


// All project elements

const projects = document.querySelectorAll(".project");


// Used to bring the last dragged project to the front.

let highestZ = 1;



/* =========================================================
   INITIALIZE PROJECTS
   ========================================================= */

/*
   We wait until the entire page (including all images)
   has loaded.

   This is important because JavaScript needs to know
   the REAL width and height of every project image
   before calculating its random position.
*/

window.addEventListener("load", () => {

    projects.forEach((project) => {

        positionProjectRandomly(project);

        makeProjectDraggable(project);

    });

});



/* =========================================================
   RANDOM POSITION
   ========================================================= */

function positionProjectRandomly(project) {

    /*
       Actual dimensions of this project after
       its image has loaded.
    */

    const projectWidth = project.offsetWidth;
    const projectHeight = project.offsetHeight;


    /*
       Define the safe area.

       The icon cannot start closer than screenMargin
       to the left or top edge.

       On the right and bottom we subtract the dimensions
       of the icon itself, so the WHOLE icon remains visible.
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
       Generate a random position inside the safe area.
    */

    const randomX =
        minX + Math.random() * (maxX - minX);

    const randomY =
        minY + Math.random() * (maxY - minY);


    /*
       Apply the position.
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
           Remember where inside the image the user clicked.
           This prevents the image from jumping when dragging
           starts.
        */

        offsetX = event.clientX - project.offsetLeft;
        offsetY = event.clientY - project.offsetTop;


        /*
           Bring the selected project to the front.
        */

        highestZ++;

        project.style.zIndex = highestZ;


        /*
           Continue receiving pointer events even if the
           pointer temporarily moves outside the element.
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

        let x = event.clientX - offsetX;
        let y = event.clientY - offsetY;



        /*
           Calculate the safe area again.

           We do this during dragging because the browser
           window may have changed size since the page loaded.
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

           The project cannot move outside these boundaries.
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
           If the pointer moved, interpret the interaction
           as dragging rather than clicking.

           This prevents opening a project accidentally
           after moving it.
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
   If the browser becomes smaller after the page has loaded,
   check every project and move it back inside the safe area
   if necessary.

   We DON'T randomize the positions again.
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


    let x = project.offsetLeft;
    let y = project.offsetTop;


    /*
       Correct the position only when necessary.
    */

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

}
