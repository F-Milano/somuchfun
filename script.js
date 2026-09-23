const projects = document.querySelectorAll(".project");

let highestZ = 1;

projects.forEach((project) => {

    // Random starting position
    const maxX = window.innerWidth - project.offsetWidth;
    const maxY = window.innerHeight - project.offsetHeight;

    project.style.left = Math.random() * maxX + "px";
    project.style.top = Math.random() * maxY + "px";


    let isPointerDown = false;
    let isDragging = false;

    let startX = 0;
    let startY = 0;

    let startLeft = 0;
    let startTop = 0;


    project.addEventListener("pointerdown", (event) => {

        isPointerDown = true;
        isDragging = false;

        startX = event.clientX;
        startY = event.clientY;

        startLeft = project.offsetLeft;
        startTop = project.offsetTop;

        highestZ++;
        project.style.zIndex = highestZ;

        project.setPointerCapture(event.pointerId);
    });


    project.addEventListener("pointermove", (event) => {

        if (!isPointerDown) return;

        const dx = event.clientX - startX;
        const dy = event.clientY - startY;

        // Only consider it a drag after moving 5px
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            isDragging = true;
        }

        if (!isDragging) return;


        let newX = startLeft + dx;
        let newY = startTop + dy;


        // Keep icon inside screen
        const maxX = window.innerWidth - project.offsetWidth;
        const maxY = window.innerHeight - project.offsetHeight;

        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));


        project.style.left = newX + "px";
        project.style.top = newY + "px";
    });


    project.addEventListener("pointerup", (event) => {

        isPointerDown = false;

        try {
            project.releasePointerCapture(event.pointerId);
        } catch (error) {
            // Pointer may already have been released
        }

    });


    project.addEventListener("click", (event) => {

        // Don't follow the link if this was a drag
        if (isDragging) {
            event.preventDefault();
            event.stopPropagation();
        }

        isDragging = false;
    });

});
