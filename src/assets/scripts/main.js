const menuBtn = document.querySelector(".navigation [aria-expanded]");
document.addEventListener("click", (event) => {
    if (!event.target.closest(".navigation [aria-expanded]")) {
        return;
    }

    const expanded = menuBtn.getAttribute("aria-expanded") === "true" || false;
    menuBtn.setAttribute("aria-expanded", !expanded);
});
