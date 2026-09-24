// ============================================================
// SO MUCH FUN — HOMEPAGE + PROJECT OVERLAY
// ============================================================

import { projects } from "./projects/projects.js";


// ============================================================
// SETTINGS
// ============================================================

const screenMargin = 30;
const dragThreshold = 5;

let highestZ = 1;


// ============================================================
// HOMEPAGE ELEMENTS
// ============================================================

const canvas = document.querySelector("#canvas");


// ============================================================
// PROJECT OVERLAY ELEMENTS
// ============================================================

const projectOverlay = document.querySelector("#project-overlay");
const projectWindow = document.querySelector("#project-window");
const projectContent = document.querySelector("#project-content");

const projectClose = document.querySelector("#project-close");
const projectPrev = document.querySelector("#project-prev");
const projectNext = document.querySelector("#project-next");


// Currently open project
let activeProject = null;

// Slide 0 = project information
// Slide 1 = first image
// Slide 2 = second image
// etc.
let currentSlide = 0;


// ============================================================
// CREATE HOMEPAGE PROJECT ICONS
// ============================================================

projects.forEach((project) => {

    const projectElement = document.createElement("a");

    projectElement.classList.add("project");
    projectElement.href = "#";
    projectElement.dataset.project = project.id;


    // Create project icon image
    const image = document.createElement("img");

    image.src = project.icon;
    image.alt = project.title;
    image.draggable = false;


    projectElement.appendChild(image);
    canvas.appendChild(projectElement);


    // Initialize this project as soon as its image is ready.
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
// INITIALIZE HOMEPAGE PROJECT
// ============================================================

function initializeProject(projectElement) {

    positionProjectRandomly(projectElement);
    activateDragging(projectElement);

    projectElement.dataset.initialized = "true";

    // Reveal only after positioning.
    projectElement.style.opacity = "1";
}


// ============================================================
// RANDOM HOMEPAGE POSITION
// ============================================================

function positionProjectRandomly(projectElement) {

    const width = projectElement.offsetWidth;
    const height = projectElement.offsetHeight;


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
// HOMEPAGE DRAGGING
// ============================================================

function activateDragging(projectElement) {

    let dragging = false;
    let moved = false;

    let startPointerX = 0;
    let startPointerY = 0;

    let startElementX = 0;
    let startElementY = 0;


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

        /*
            Keep homepage icons below the title and below
            the project overlay.
        */

        projectElement.style.zIndex =
            Math.min(highestZ, 999);


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


        const distance = Math.sqrt(
            deltaX * deltaX +
            deltaY * deltaY
        );


        /*
            Only consider it a drag after the pointer
            has moved more than a few pixels.
        */

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


        // Keep icon inside the viewport.

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


        /*
            If the pointer was dragged, do not open
            the project.
        */

        if (moved) {

            moved = false;

            return;
        }


        const projectId =
            projectElement.dataset.project;


        const selectedProject =
            projects.find(
                (project) => project.id === projectId
            );


        if (selectedProject) {
            openProject(selectedProject);
        }
    });
}


// ============================================================
// OPEN PROJECT
// ============================================================

function openProject(project) {

    activeProject = project;
    currentSlide = 0;


    /*
        Apply the colours defined in that project's
        project.js file.
    */

    projectWindow.style.backgroundColor =
        project.color || "#711FFF";

    projectWindow.style.color =
        project.textColor || "#FF3224";


    // Display overlay.
    projectOverlay.classList.add("is-open");

    projectOverlay.setAttribute(
        "aria-hidden",
        "false"
    );


    renderSlide();
}


// ============================================================
// CLOSE PROJECT
// ============================================================

function closeProject() {

    projectOverlay.classList.remove("is-open");

    projectOverlay.setAttribute(
        "aria-hidden",
        "true"
    );


    projectContent.innerHTML = "";

    activeProject = null;
    currentSlide = 0;
}


// ============================================================
// RENDER CURRENT SLIDE
// ============================================================

function renderSlide() {

    if (!activeProject) return;

    // Only image slides use the fitted frame; info keeps its original CSS.
    projectWindow.classList.toggle("is-image-slide", currentSlide > 0);


    /*
        Slide 0 is always the project information.

        Slides 1, 2, 3... correspond to entries in
        activeProject.images.
    */

    if (currentSlide === 0) {

        renderProjectInfo();

    } else {

        renderProjectImage();
    }


    updateNavigation();
}


// ============================================================
// RENDER PROJECT INFORMATION
// ============================================================

function renderProjectInfo() {

    projectContent.innerHTML = "";


    const info = document.createElement("div");

    info.classList.add("project-info");


    // --------------------------------------------------------
    // TITLE
    // --------------------------------------------------------

    const title = document.createElement("h1");

    title.textContent = activeProject.title;

    info.appendChild(title);


    // --------------------------------------------------------
    // DESCRIPTION
    // --------------------------------------------------------

    if (activeProject.description.trim()) {

        const description = document.createElement("p");

        description.textContent =
            activeProject.description.trim();

        info.appendChild(description);
    }


    // --------------------------------------------------------
    // YEAR
    // --------------------------------------------------------

    if (activeProject.year) {

        const year = document.createElement("p");

        year.textContent =
            `Year: ${activeProject.year}`;

        info.appendChild(year);
    }


    // --------------------------------------------------------
    // LOCATION
    // --------------------------------------------------------

    if (activeProject.location) {

        const location = document.createElement("p");

        location.textContent =
            `Location: ${activeProject.location}`;

        info.appendChild(location);
    }


    // --------------------------------------------------------
    // CREDITS
    // --------------------------------------------------------

    if (activeProject.credits.trim()) {

        const credits = document.createElement("p");

        credits.textContent =
            activeProject.credits.trim();

        info.appendChild(credits);
    }


    projectContent.appendChild(info);
}


// ============================================================
// RENDER PROJECT IMAGE
// ============================================================

function renderProjectImage() {

    projectContent.innerHTML = "";


    /*
        currentSlide 1 = images[0]
        currentSlide 2 = images[1]
        etc.
    */

    const imageIndex =
        currentSlide - 1;


    const imagePath =
        activeProject.images[imageIndex];


    if (!imagePath) return;


    const image =
        document.createElement("img");


    image.alt =
        `${activeProject.title} — image ${currentSlide}`;

    image.classList.add(
        "project-slide-image"
    );

    image.draggable = false;

    // A late load from a previous slide must not resize the current window.
    image.addEventListener("load", () => {
        if (image.parentNode === projectContent) resizeImageFrame();
    }, { once: true });

    projectContent.appendChild(image);
    image.src = imagePath;
    resizeImageFrame(); // Also handles images already in the browser cache.
}


// Fit the image and both frame edges inside 90% of the visible viewport.
// One shared scale preserves natural proportions without cropping/stretching.
function resizeImageFrame() {
    if (!activeProject || currentSlide === 0) return;

    const image = projectContent.querySelector(".project-slide-image");
    if (!image || !image.naturalWidth || !image.naturalHeight) return;

    const frame = parseFloat(
        getComputedStyle(projectWindow).getPropertyValue("--image-frame")
    );
    const viewport = window.visualViewport;
    const availableWidth = Math.max(1, (viewport?.width ?? window.innerWidth) * 0.9 - frame * 2);
    const availableHeight = Math.max(1, (viewport?.height ?? window.innerHeight) * 0.9 - frame * 2);
    const scale = Math.min(
        availableWidth / image.naturalWidth,
        availableHeight / image.naturalHeight
    );

    projectWindow.style.setProperty("--image-width", `${image.naturalWidth * scale}px`);
    projectWindow.style.setProperty("--image-height", `${image.naturalHeight * scale}px`);
}

// Keep fitting on rotation, resizing, and mobile browser toolbar changes.
// This is independent of the existing homepage resize handler.
window.addEventListener("resize", resizeImageFrame);
window.visualViewport?.addEventListener("resize", resizeImageFrame);


// ============================================================
// UPDATE NAVIGATION BUTTONS
// ============================================================

function updateNavigation() {

    if (!activeProject) return;


    /*
        Previous is disabled on INFO.
    */

    projectPrev.disabled =
        currentSlide === 0;


    /*
        Total number of slides is:

        INFO + number of images.

        Because INFO is slide 0, the highest valid
        currentSlide value equals images.length.
    */

    projectNext.disabled =
        currentSlide >= activeProject.images.length;
}


// ============================================================
// PREVIOUS SLIDE
// ============================================================

function previousSlide() {

    if (!activeProject) return;

    if (currentSlide <= 0) return;


    currentSlide -= 1;

    renderSlide();
}


// ============================================================
// NEXT SLIDE
// ============================================================

function nextSlide() {

    if (!activeProject) return;

    if (
        currentSlide >=
        activeProject.images.length
    ) {
        return;
    }


    currentSlide += 1;

    renderSlide();
}


// ============================================================
// OVERLAY BUTTON EVENTS
// ============================================================

projectClose.addEventListener(
    "click",
    closeProject
);


projectPrev.addEventListener(
    "click",
    previousSlide
);


projectNext.addEventListener(
    "click",
    nextSlide
);


// ============================================================
// KEYBOARD CONTROLS
// ============================================================

document.addEventListener("keydown", (event) => {

    if (!activeProject) return;


    if (event.key === "Escape") {

        closeProject();

        return;
    }


    if (event.key === "ArrowLeft") {

        previousSlide();

        return;
    }


    if (event.key === "ArrowRight") {

        nextSlide();
    }
});


// ============================================================
// WINDOW RESIZE
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


        const width =
            projectElement.offsetWidth;

        const height =
            projectElement.offsetHeight;


        const maxX = Math.max(
            screenMargin,
            window.innerWidth - width - screenMargin
        );

        const maxY = Math.max(
            screenMargin,
            window.innerHeight - height - screenMargin
        );


        let x =
            parseFloat(
                projectElement.style.left
            ) || screenMargin;

        let y =
            parseFloat(
                projectElement.style.top
            ) || screenMargin;


        x = Math.min(
            Math.max(x, screenMargin),
            maxX
        );

        y = Math.min(
            Math.max(y, screenMargin),
            maxY
        );


        projectElement.style.left =
            `${x}px`;

        projectElement.style.top =
            `${y}px`;
    });
});
