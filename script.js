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


// Currently open project
let activeProject = null;



// ============================================================
// CREATE HOMEPAGE PROJECT ICONS
// ============================================================

projects.forEach((project) => {

    const projectElement = document.createElement("a");

    projectElement.classList.add("project");
    projectElement.href = "#";
    projectElement.dataset.project = project.id;
    projectElement.setAttribute("aria-label", project.title);


    // Create project icon image
    const image = document.createElement("img");

    image.src = project.icon;
    image.alt = project.title;
    image.draggable = false;


    projectElement.appendChild(image);
    const hoverTitle = document.createElement("span");
    hoverTitle.classList.add("project-hover-title");
    hoverTitle.textContent = project.title;
    hoverTitle.setAttribute("aria-hidden", "true");
    projectElement.appendChild(hoverTitle);
    canvas.appendChild(projectElement);


    // Keep the dot available even if its image cannot load.
    if (image.complete && image.naturalWidth > 0) {
        projectElement.classList.add("has-icon");
    } else {

        image.addEventListener(
            "load",
            () => projectElement.classList.add("has-icon"),
            { once: true }
        );
    }
    // Measure the title after its custom font has loaded.
    document.fonts.ready.then(() => initializeProject(projectElement));
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
    const height = projectElement.offsetHeight +
        projectElement.querySelector(".project-hover-title").offsetHeight + 10;


    const availableWidth = Math.max(
        0,
        window.innerWidth - width - screenMargin * 2
    );

    const availableHeight = Math.max(
        0,
        window.innerHeight - height - screenMargin * 2
    );


    const title = document.querySelector("#about-link").getBoundingClientRect();
    const obstacles = [title, ...Array.from(
        document.querySelectorAll('.project[data-initialized="true"]')
    ).filter((element) => element !== projectElement)
        .map((element) => element.getBoundingClientRect())];
    let x = screenMargin;
    let y = screenMargin;
    let bestScore = Infinity;

    // Prefer clear space for the whole revealed icon, with a small gap.
    for (let attempt = 0; attempt < 200; attempt += 1) {
        const candidateX = screenMargin + Math.random() * availableWidth;
        const candidateY = screenMargin + Math.random() * availableHeight;
        const score = obstacles.reduce((total, rect, index) => {
            const overlapWidth = Math.max(0,
                Math.min(candidateX + width, rect.right + 16) -
                Math.max(candidateX, rect.left - 16));
            const overlapHeight = Math.max(0,
                Math.min(candidateY + height, rect.bottom + 16) -
                Math.max(candidateY, rect.top - 16));
            return total + overlapWidth * overlapHeight * (index === 0 ? 100 : 1);
        }, 0);
        if (score < bestScore) {
            bestScore = score;
            x = candidateX;
            y = candidateY;
        }
        if (score === 0) break;
    }


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
        const height = projectElement.offsetHeight +
            projectElement.querySelector(".project-hover-title").offsetHeight + 10;


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


    renderProjectPage();
    // Reset after showing and rendering, including when reopening the same project.
    projectContent.scrollTop = 0;
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
}


// ============================================================
// SCROLLING PROJECT PAGE
// ============================================================

function renderProjectPage() {

    projectContent.innerHTML = "";

    const info = document.createElement("article");
    info.classList.add("project-info");

    const title = document.createElement("h1");
    title.textContent = activeProject.title;
    info.appendChild(title);

    function appendText(value) {
        if (!value?.trim()) return;
        const paragraph = document.createElement("p");
        paragraph.textContent = value.trim();
        info.appendChild(paragraph);
    }

    if (activeProject.year) appendText(`Year: ${activeProject.year}`);
    if (activeProject.location) appendText(`Location: ${activeProject.location}`);
    appendText(activeProject.description);

    renderProjectContent(activeProject, info);

    appendText(activeProject.credits);
    projectContent.appendChild(info);
}


// ============================================================
// EDITORIAL CONTENT: images, rows, and videos, with legacy images-array support.
// A content array (even an empty one) takes precedence over images.
// ============================================================

function renderProjectContent(project, container) {
    const blocks = Array.isArray(project.content)
        ? project.content
        : (project.images || []).map((image) => ({
            ...(typeof image === "string" ? { src: image } : image),
            type: "image",
            layout: "full"
        }));
    let imageNumber = 0;

    function createImage(entry) {
        if (!entry?.src) return null;
        imageNumber += 1;

        const figure = document.createElement("figure");
        figure.classList.add("project-image-item");

        const image = document.createElement("img");
        image.src = entry.src;
        image.alt = entry.alt || `${project.title} - image ${imageNumber}`;
        image.classList.add("project-page-image");
        image.draggable = false;
        figure.appendChild(image);

        if (entry.caption?.trim()) {
            const caption = document.createElement("figcaption");
            caption.classList.add("project-image-caption");
            caption.textContent = entry.caption.trim();
            figure.appendChild(caption);
        }
        return figure;
    }

    blocks.forEach((block) => {
        if (block?.type === "image") {
            const figure = createImage(block);
            if (!figure) return;
            figure.classList.add(
                block.layout === "medium" ? "project-image--medium" : "project-image--full"
            );
            container.appendChild(figure);
        } else if (block?.type === "video" && block.src) {
            const video = document.createElement("iframe");
            video.classList.add("project-page-video");
            video.src = block.src;
            video.title = block.title || `${project.title} - video`;
            video.width = "640";
            video.height = "360";
            video.referrerPolicy = "strict-origin-when-cross-origin";
            video.allow = "autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share";
            video.allowFullscreen = true;
            container.appendChild(video);
        } else if (block?.type === "row" && Array.isArray(block.images)) {
            const figures = block.images.map(createImage).filter(Boolean);
            // At most three columns. Accidental extra images continue in another row.
            for (let index = 0; index < figures.length; index += 3) {
                const row = document.createElement("div");
                row.classList.add("project-image-row");
                row.append(...figures.slice(index, index + 3));
                container.appendChild(row);
            }
        }
    });
}


// ============================================================
// OVERLAY BUTTON EVENTS
// ============================================================

projectClose.addEventListener(
    "click",
    closeProject
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
            projectElement.offsetHeight +
            projectElement.querySelector(".project-hover-title").offsetHeight + 10;


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
