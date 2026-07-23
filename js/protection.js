"use strict";

// ==========================================
// Protection du site — Couaxia
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // PROTECTION DES IMAGES
    // ==========================================

    document.querySelectorAll("img").forEach((image) => {

        image.setAttribute("draggable", "false");

        image.addEventListener("contextmenu", (event) => {
            event.preventDefault();
        });

        image.addEventListener("dragstart", (event) => {
            event.preventDefault();
        });

        image.addEventListener("selectstart", (event) => {
            event.preventDefault();
        });

    });

});


// ==========================================
// CLIC DROIT SUR LA PAGE
// ==========================================

document.addEventListener("contextmenu", (event) => {

    /*
     * Autorise les interactions sur les couleurs
     * de la palette.
     */
    if (event.target.closest(".oc-color")) {
        return;
    }

    event.preventDefault();

});


// ==========================================
// RACCOURCIS CLAVIER
// ==========================================

document.addEventListener("keydown", (event) => {

    const target = event.target;

    /*
     * Ne bloque pas les interactions dans :
     * - les champs de texte ;
     * - les zones de texte ;
     * - les éléments modifiables ;
     * - les boutons de couleur.
     */
    const isEditableElement =
        target instanceof HTMLElement &&
        (
            target.matches("input, textarea, select") ||
            target.isContentEditable ||
            target.closest(".oc-color")
        );

    if (isEditableElement) {
        return;
    }


    // F12

    if (event.key === "F12") {
        event.preventDefault();
        return;
    }


    // Ctrl + Shift + I

    if (
        event.ctrlKey &&
        event.shiftKey &&
        event.key.toLowerCase() === "i"
    ) {
        event.preventDefault();
        return;
    }


    // Ctrl + Shift + J

    if (
        event.ctrlKey &&
        event.shiftKey &&
        event.key.toLowerCase() === "j"
    ) {
        event.preventDefault();
        return;
    }


    // Ctrl + U

    if (
        event.ctrlKey &&
        event.key.toLowerCase() === "u"
    ) {
        event.preventDefault();
        return;
    }


    // Ctrl + S

    if (
        event.ctrlKey &&
        event.key.toLowerCase() === "s"
    ) {
        event.preventDefault();
    }

});


// ==========================================
// GLISSER-DÉPOSER
// ==========================================

document.addEventListener("dragstart", (event) => {

    /*
     * On laisse les boutons et contrôles interactifs
     * fonctionner normalement.
     */
    if (
        event.target.closest(
            "button, a, input, textarea, select, .oc-color"
        )
    ) {
        return;
    }

    event.preventDefault();

});