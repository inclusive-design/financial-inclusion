document.addEventListener("click", (event) => {
    if (!event.target.closest(".navigation [aria-expanded]")) {
        return;
    }

    const menuBtn = event.target.closest(".navigation [aria-expanded]");
    const expanded = menuBtn.getAttribute("aria-expanded") === "true" || false;
    menuBtn.setAttribute("aria-expanded", !expanded);
});
