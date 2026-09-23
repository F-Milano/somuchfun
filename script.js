// ============================================================
// SO MUCH FUN — HOMEPAGE
// ============================================================
//
// The homepage no longer contains a hardcoded list of projects.
// Projects are imported from /projects/projects.js.
//
// Each project is:
// - created automatically
// - positioned randomly
// - draggable
// - kept inside the viewport
//
// ============================================================


import { projects } from "./projects/projects.js";


// ============================================================
// SETTINGS
// ============================================================

const screenMargin = 30;
const dragThreshold = 5;

let highestZ = 1;


// ============================================================
// CANVAS
// ============================================================

const canvas = document.querySelector("#canvas");


// ============================================================
// CREATE PROJECT ICONS
// ============================================================

projects.forEach((project) => {

    // Create the project element.
    const projectElement = document.createElement("a");

    projectElement.classList.add("project");
    projectElement.href = "#";
    projectElement.dataset.project = project.id;

    // Create the image.
    const image = document.createElement("img");

    image.src = project.icon;
    image.alt = project.title;
    image.draggable = false;

    projectElement.appendChild(image);
    canvas.appendChild(projectElement);


    // --------------------------------------------------------
    // INITIALIZE ONLY WHEN THIS IMAGE IS READY
    // --------------------------------------------------------

    if (image.complete && image.naturalWidth > 0) {
        initializeProject(projectElement);
    } else {
        image.addEventListener(
            "load",
            () => initializeProject(projectElement),
            { once: true }
        );
    }
});


// ============================================================
// INITIALIZE PROJECT
// ============================================================

function initializeProject(projectElement) {

    positionProjectRandomly(projectElement);
    activateDragging(projectElement);

    projectElement.dataset.initialized = "true";

    // The project remains invisible until it has been
    // measured and positioned correctly.
    projectElement.style.opacity = "1";
}


// ============================================================
// RANDOM POSITION
// ============================================================

function positionProjectRandomly(projectElement) {

    const width = projectElement.offsetWidth;
    const height = projectElement.offsetHeight;

    /*
        Math.max() protects us against an unusual case where
        an image is larger than the available viewport.
    */

    const availableWidth = Math.max(
        0,
        window.innerWidth - width - screenMargin * 2
    );

    const availableHeight = Math.max(
        0,
        window.innerHeight - height - screenMargin * 2
    );

    const x =
        screenMargin +
        Math.random() * availableWidth;

    const y =
        screenMargin +
        Math.random() * availableHeight;

    projectElement.style.left = `${x}px`;
    projectElement.style.top = `${y}px`;
}


// ============================================================
// DRAGGING
// ============================================================

function activateDragging(projectElement) {

    let dragging = false;

    let startPointerX = 0;
    let startPointerY = 0;

    let startElementX = 0;
    let startElementY = 0;

    let moved = false;


    // --------------------------------------------------------
    // POINTER DOWN
    // --------------------------------------------------------

    projectElement.addEventListener("pointerdown", (event) => {

        dragging = true;
        moved = false;

        startPointerX = event.clientX;
        startPointerY = event.clientY;

        startElementX =
            parseFloat(projectElement.style.left) || 0;

        startElementY =
            parseFloat(projectElement.style.top) || 0;

        highestZ += 1;
        projectElement.style.zIndex = highestZ;

        projectElement.setPointerCapture(event.pointerId);

        event.preventDefault();
    });


    // --------------------------------------------------------
    // POINTER MOVE
    // --------------------------------------------------------

    projectElement.addEventListener("pointermove", (event) => {

        if (!dragging) return;

        const deltaX =
            event.clientX - startPointerX;

        const deltaY =
            event.clientY - startPointerY;


        // Determine whether this is really a drag
        // rather than tiny finger/mouse movement.

        const distance =
            Math.sqrt(
                deltaX * deltaX +
                deltaY * deltaY
            );

        if (distance > dragThreshold) {
            moved = true;
        }


        const width = projectElement.offsetWidth;
        const height = projectElement.offsetHeight;

        const maxX = Math.max(
            screenMargin,
            window.innerWidth - width - screenMargin
        );

        const maxY = Math.max(
            screenMargin,
            window.innerHeight - height - screenMargin
        );


        let newX =
            startElementX + deltaX;

        let newY =
            startElementY + deltaY;


        // Keep the entire icon inside the safe area.

        newX = Math.min(
            Math.max(newX, screenMargin),
            maxX
        );

        newY = Math.min(
            Math.max(newY, screenMargin),
            maxY
        );


        projectElement.style.left = `${newX}px`;
        projectElement.style.top = `${newY}px`;
    });


    // --------------------------------------------------------
    // END DRAG
    // --------------------------------------------------------

    function endDrag(event) {

        if (!dragging) return;

        dragging = false;

        if (
            projectElement.hasPointerCapture(event.pointerId)
        ) {
            projectElement.releasePointerCapture(
                event.pointerId
            );
        }
    }


    projectElement.addEventListener(
        "pointerup",
        endDrag
    );

    projectElement.addEventListener(
        "pointercancel",
        endDrag
    );


    // --------------------------------------------------------
    // CLICK / TAP
    // --------------------------------------------------------

    projectElement.addEventListener("click", (event) => {

        event.preventDefault();

        // Ignore a click generated at the end of a drag.
        if (moved) {
            moved = false;
            return;
        }

        /*
            Temporary.

            In the next step this will open the project
            information/slideshow window.
        */

        console.log(
            "Open project:",
            projectElement.dataset.project
        );
    });
}


// ============================================================
// WINDOW RESIZE
// ============================================================
//
// If the browser changes size or the phone rotates,
// keep every initialized project inside the viewport.
// ============================================================

window.addEventListener("resize", () => {

    const projectElements =
        document.querySelectorAll(".project");

    projectElements.forEach((projectElement) => {

        if (
            projectElement.dataset.initialized !== "true"
        ) {
            return;
        }


        const width = projectElement.offsetWidth;
        const height = projectElement.offsetHeight;

        const maxX = Math.max(
            screenMargin,
            window.innerWidth - width - screenMargin
        );

        const maxY = Math.max(
            screenMargin,
            window.innerHeight - height - screenMargin
        );


        let x =
            parseFloat(projectElement.style.left) || screenMargin;

        let y =
            parseFloat(projectElement.style.top) || screenMargin;


        x = Math.min(
            Math.max(x, screenMargin),
            maxX
        );

        y = Math.min(
            Math.max(y, screenMargin),
            maxY
        );


        projectElement.style.left = `${x}px`;
        projectElement.style.top = `${y}px`;
    });
});
