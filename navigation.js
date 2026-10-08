const menuButtons = document.querySelectorAll(".menu-toggle");

menuButtons.forEach((button) => {
    const sidebar = button.closest(".sidebar");
    const links = sidebar.querySelectorAll("nav a");

    const closeMenu = () => {
        sidebar.classList.remove("menu-open");
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-label", "Open navigation menu");
    };

    button.addEventListener("click", () => {
        const isOpen = sidebar.classList.toggle("menu-open");
        button.setAttribute("aria-expanded", String(isOpen));
        button.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
    });

    links.forEach((link) => link.addEventListener("click", closeMenu));

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMenu();
        }
    });
});
