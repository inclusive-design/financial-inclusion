document.addEventListener("click", (event) => {
    if (!event.target.closest(".navigation [aria-expanded]")) {
        const allMenuBtns = document.querySelectorAll(".navigation [aria-expanded='true']");
        [...allMenuBtns].forEach((btn) => {
            btn.setAttribute("aria-expanded", false);
        });

        return;
    }

    const menuBtn = event.target.closest(".navigation [aria-expanded]");
    const expanded = menuBtn.getAttribute("aria-expanded") === "true" || false;
    if (!expanded) {
        const allMenuBtns = document.querySelectorAll(".navigation li [aria-expanded='true']");
        [...allMenuBtns].forEach((btn) => {
            btn.setAttribute("aria-expanded", false);
        });
    }
    menuBtn.setAttribute("aria-expanded", !expanded);
});

document.addEventListener("keyup", (event) => {
    if (event.key === "Escape") {
        const allMenuBtns = document.querySelectorAll(".navigation [aria-expanded='true']");
        [...allMenuBtns].forEach((btn) => {
            btn.setAttribute("aria-expanded", false);
        });
    }
});

const subMenus = document.querySelectorAll(".navigation li:has([aria-expanded])");
[...subMenus].forEach((subMenu) => {
    subMenu.addEventListener(
        "blur",
        (event) => {
            if (!subMenu.contains(event.relatedTarget)) {
                subMenu.querySelector("[aria-expanded]").setAttribute("aria-expanded", false);
            }
        },
        true
    );
});
