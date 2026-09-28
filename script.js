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
    projectElement.setAttribute("aria-label", plainProjectTitle(project.title));


    // Create project icon image
    const image = document.createElement("img");

    image.src = project.icon;
    image.alt = plainProjectTitle(project.title);
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
    let x = screenMargin;
    // If random attempts fail, fall back below the name rather than behind it.
    let y = Math.max(screenMargin, titleRect.bottom + 16);

    // Icons may overlap each other; only the name needs a clear gap.
    for (let attempt = 0; attempt < 200; attempt += 1) {
        const candidateX = screenMargin + Math.random() * availableWidth;
        const candidateY = screenMargin + Math.random() * availableHeight;
        if (
            candidateX < titleRect.right + 16 && candidateX + width > titleRect.left - 16 &&
            candidateY < titleRect.bottom + 16 && candidateY + height > titleRect.top - 16
        ) continue;
        x = candidateX;
        y = candidateY;
        break;
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

// Titles support **bold text**; labels use the same title without formatting.
function plainProjectTitle(title) {
    return title.replace(/\*\*([^*]+)\*\*/g, "$1");
}

function renderProjectPage() {

    projectContent.innerHTML = "";

    const info = document.createElement("article");
    info.classList.add("project-info");

    const header = document.createElement("header");
    header.classList.add("project-header");
    info.appendChild(header);
    const title = document.createElement("h1");
    activeProject.title.split(/(\*\*[^*]+\*\*)/g).forEach((part) => {
        if (/^\*\*[^*]+\*\*$/.test(part)) {
            const bold = document.createElement("strong");
            bold.textContent = part.slice(2, -2);
            title.appendChild(bold);
        } else {
            title.appendChild(document.createTextNode(part));
        }
    });
    header.appendChild(title);
    for (const field of ["details"]) {
        if (!activeProject[field]?.trim()) continue;
        const line = document.createElement("p");
        line.classList.add(`project-${field}`);
        line.textContent = activeProject[field].trim();
        header.appendChild(line);
    }

    function appendText(value) {
        if (!value?.trim()) return;
        const paragraph = document.createElement("p");
        paragraph.textContent = value.trim();
        info.appendChild(paragraph);
    }

    appendText(activeProject.description);
    renderProjectContent(activeProject, info);

    const credits = activeProject.credits?.trim().replace(/^credits\s*:\s*/i, "");
    if (credits) appendText(`Credits: ${credits}`);
    projectContent.appendChild(info);
    fitProjectHeader();
}

// Fit each header line independently, restoring its CSS size before measuring.
function fitProjectHeader() {
    if (!activeProject) return;
    projectContent.querySelectorAll(".project-header > *").forEach((line) => {
        line.style.removeProperty("font-size");
        const availableWidth = line.getBoundingClientRect().width;
        if (availableWidth <= 0) return;
        const fontSize = parseFloat(getComputedStyle(line).fontSize);
        const range = document.createRange();
        range.selectNodeContents(line);
        const textWidth = range.getBoundingClientRect().width;
        if (textWidth > availableWidth) {
            line.style.fontSize = `${fontSize * (availableWidth / textWidth) * 0.99}px`;
        }
    });
}

document.fonts.ready.then(fitProjectHeader);


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
        image.alt = entry.alt || `${plainProjectTitle(project.title)} - image ${imageNumber}`;
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
        video.title = entry.title || `${plainProjectTitle(project.title)} - video`;
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
            const videos = block.videos.map((entry) => {
                if (entry !== null) return createVideo(entry);
                // Explicit null entries reserve a column without loading a video.
                const slot = document.createElement("div");
                slot.classList.add("project-video-slot");
                slot.setAttribute("aria-hidden", "true");
                return slot;
            }).filter(Boolean);
            for (let index = 0; index < videos.length; index += 3) {
                const row = document.createElement("div");
                row.classList.add("project-video-row");
                row.append(...videos.slice(index, index + 3));
                container.appendChild(row);
            }
        } else if (block?.type === "row" && Array.isArray(block.images)) {
            const figures = block.images.map(createImage).filter(Boolean);
            // At most four columns. Extra images continue in another row.
            for (let index = 0; index < figures.length; index += 4) {
                const row = document.createElement("div");
                row.classList.add("project-image-row");
                row.append(...figures.slice(index, index + 4));
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
    fitProjectHeader();

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
