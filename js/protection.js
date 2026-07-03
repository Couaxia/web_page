// ==========================================
// Protection des images - Couaxia
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    // Désactive le clic droit sur les images
    document.querySelectorAll("img").forEach(img => {

        img.setAttribute("draggable", "false");

        img.addEventListener("contextmenu", (event) => {
            event.preventDefault();
        });

        img.addEventListener("dragstart", (event) => {
            event.preventDefault();
        });

        img.addEventListener("selectstart", (event) => {
            event.preventDefault();
        });

    });

});

// ==========================================
// Désactive le clic droit sur toute la page
// ==========================================

document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
});

// ==========================================
// Bloque certains raccourcis clavier
// ==========================================

document.addEventListener("keydown", (event) => {

    // F12
    if (event.key === "F12") {
        event.preventDefault();
    }

    // Ctrl + Shift + I
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "i") {
        event.preventDefault();
    }

    // Ctrl + Shift + J
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "j") {
        event.preventDefault();
    }

    // Ctrl + U (code source)
    if (event.ctrlKey && event.key.toLowerCase() === "u") {
        event.preventDefault();
    }

    // Ctrl + S (enregistrer)
    if (event.ctrlKey && event.key.toLowerCase() === "s") {
        event.preventDefault();
    }

});

// ==========================================
// Désactive le glisser-déposer sur la page
// ==========================================

document.addEventListener("dragstart", (event) => {
    event.preventDefault();
});