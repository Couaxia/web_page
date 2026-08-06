"use strict";

/* =========================================================
   CONTENUS +18 — TÉLÉPHONE, TABLETTE ET CLAVIER
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    /**
     * Initialise une carte sensible.
     *
     * @param {HTMLElement} card
     */
    function initializeSensitiveCard(card) {
        if (card.dataset.sensitiveReady === "true") {
            return;
        }

        const imageContainer =
            card.querySelector(".image-container");

        if (!imageContainer) {
            return;
        }

        card.dataset.sensitiveReady = "true";

        imageContainer.setAttribute("tabindex", "0");
        imageContainer.setAttribute(
            "role",
            "button"
        );

        imageContainer.setAttribute(
            "aria-label",
            "Afficher ou masquer l’illustration réservée aux adultes"
        );

        imageContainer.setAttribute(
            "aria-pressed",
            "false"
        );


        function toggleSensitiveContent() {
            const isRevealed =
                card.classList.toggle(
                    "is-sensitive-revealed"
                );

            imageContainer.setAttribute(
                "aria-pressed",
                String(isRevealed)
            );
        }


        imageContainer.addEventListener(
            "click",
            toggleSensitiveContent
        );


        imageContainer.addEventListener(
            "keydown",
            (event) => {
                if (
                    event.key !== "Enter" &&
                    event.key !== " "
                ) {
                    return;
                }

                event.preventDefault();

                toggleSensitiveContent();
            }
        );
    }


    function initializeInside(root) {
        root
            .querySelectorAll(
                '.artist-card[data-sensitive="true"]'
            )
            .forEach(initializeSensitiveCard);
    }


    initializeInside(document);


    /*
     * Compatible avec les cartes clonées
     * par credits-gallery.js.
     */
    const observer =
        new MutationObserver(() => {
            initializeInside(document);
        });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});