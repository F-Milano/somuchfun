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

const aboutLink = document.querySelector("#about-link");
const aboutText = document.querySelector("#about-text");
const backToProjects = document.querySelector("#back-to-projects");

function syncAboutView() {
    const isAbout = window.location.hash === "#about";
    if (isAbout && activeProject) closeProject();
    document.body.classList.toggle("is-about", isAbout);
    aboutText.hidden = !isAbout;
    backToProjects.hidden = !isAbout;
    aboutLink.setAttribute("aria-expanded", String(isAbout));
    if (!isAbout) {
        canvas.querySelectorAll('.project:not([data-initialized="true"])')
            .forEach(initializeProject);
    }
    if (!isAbout && document.activeElement === backToProjects) aboutLink.focus();
}

window.addEventListener("hashchange", syncAboutView);
syncAboutView();



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
    if (document.body.classList.contains("is-about") || projectElement.dataset.initialized === "true") return;

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


    const titleRect = document.querySelector("#about-link").getBoundingClientRect();
    const obstacles = Array.from(
        document.querySelectorAll('.project[data-initialized="true"]')
    ).filter((element) => element !== projectElement)
        .map((element) => element.getBoundingClientRect());
    let x = screenMargin;
    let y = screenMargin;
    let bestScore = Infinity;

    // Prefer clear space for the whole revealed icon, with a small gap.
    for (let attempt = 0; attempt < 200; attempt += 1) {
        const candidateX = screenMargin + Math.random() * availableWidth;
        const candidateY = screenMargin + Math.random() * availableHeight;
        if (
            candidateX < titleRect.right + 16 && candidateX + width > titleRect.left - 16 &&
            candidateY < titleRect.bottom + 16 && candidateY + height > titleRect.top - 16
        ) continue;
        const score = obstacles.reduce((total, rect) => {
            const overlapWidth = Math.max(0,
                Math.min(candidateX + width, rect.right + 16) -
                Math.max(candidateX, rect.left - 16));
            const overlapHeight = Math.max(0,
                Math.min(candidateY + height, rect.bottom + 16) -
                Math.max(candidateY, rect.top - 16));
            return total + overlapWidth * overlapHeight;
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

    appendText(activeProject.details);
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
        const setImageRatio = () => {
            if (image.naturalWidth && image.naturalHeight) {
                image.style.setProperty("--image-ratio", image.naturalWidth / image.naturalHeight);
            }
        };
        image.addEventListener("load", setImageRatio, { once: true });
        setImageRatio();

        if (entry.caption?.trim()) {
            const caption = document.createElement("figcaption");
            caption.classList.add("project-image-caption");
            caption.textContent = entry.caption.trim();
            figure.appendChild(caption);
        }
        return figure;
    }

    function createVideo(entry) {
        if (!entry?.src) return null;
        const video = document.createElement("iframe");
        video.classList.add("project-page-video");
        video.src = entry.src;
        video.title = entry.title || `${project.title} - video`;
        video.width = "640";
        video.height = "360";
        video.referrerPolicy = "strict-origin-when-cross-origin";
        video.allow = "autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share";
        video.allowFullscreen = true;
        return video;
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
            container.appendChild(createVideo(block));
        } else if (block?.type === "video-row" && Array.isArray(block.videos)) {
            const videos = block.videos.map(createVideo).filter(Boolean);
            for (let index = 0; index < videos.length; index += 3) {
                const row = document.createElement("div");
                row.classList.add("project-video-row");
                row.append(...videos.slice(index, index + 3));
                container.appendChild(row);
            }
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
        const titleRect = document.querySelector("#about-link").getBoundingClientRect();
        const iconRect = projectElement.getBoundingClientRect();
        if (
            iconRect.left < titleRect.right + 16 && iconRect.right > titleRect.left - 16 &&
            iconRect.top < titleRect.bottom + 16 && iconRect.bottom > titleRect.top - 16
        ) positionProjectRandomly(projectElement);
    });
});
