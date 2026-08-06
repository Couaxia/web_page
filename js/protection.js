"use strict";

/* =========================================================
   PROTECTION LÉGÈRE DES MÉDIAS — COUAXIA
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    /**
     * Sélecteurs qui doivent rester entièrement interactifs.
     */
    const interactiveSelector = [
        "a",
        "button",
        "input",
        "textarea",
        "select",
        "option",
        "label",
        "[contenteditable='true']",
        ".oc-color"
    ].join(", ");


    /**
     * Vérifie si la cible appartient à un élément interactif.
     *
     * @param {EventTarget|null} target
     * @returns {boolean}
     */
    function isInteractiveTarget(target) {
        return (
            target instanceof Element &&
            Boolean(target.closest(interactiveSelector))
        );
    }


    /**
     * Protège une image ou une vidéo.
     *
     * Cette fonction peut être appelée plusieurs fois
     * sans ajouter plusieurs fois les mêmes écouteurs.
     *
     * @param {HTMLImageElement|HTMLVideoElement} media
     */
    function protectMedia(media) {
        if (media.dataset.protectionReady === "true") {
            return;
        }

        media.dataset.protectionReady = "true";

        media.setAttribute("draggable", "false");

        /*
         * Évite le menu contextuel uniquement sur le média.
         */
        media.addEventListener("contextmenu", (event) => {
            event.preventDefault();
        });

        /*
         * Empêche le glisser-déposer du fichier.
         */
        media.addEventListener("dragstart", (event) => {
            event.preventDefault();
        });

        /*
         * Évite la sélection involontaire.
         */
        media.addEventListener("selectstart", (event) => {
            event.preventDefault();
        });
    }


    /**
     * Protège tous les médias présents dans un conteneur.
     *
     * @param {ParentNode} root
     */
    function protectMediaInside(root) {
        root
            .querySelectorAll("img, video")
            .forEach((media) => {
                if (
                    media instanceof HTMLImageElement ||
                    media instanceof HTMLVideoElement
                ) {
                    protectMedia(media);
                }
            });
    }


    /*
     * Médias présents au chargement initial.
     */
    protectMediaInside(document);


    /*
     * Ton fichier credits-gallery.js crée et clone des cartes
     * après le chargement de la page.
     *
     * MutationObserver protège automatiquement les nouveaux médias.
     */
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (!(node instanceof Element)) {
                    return;
                }

                if (
                    node.matches("img, video") &&
                    (
                        node instanceof HTMLImageElement ||
                        node instanceof HTMLVideoElement
                    )
                ) {
                    protectMedia(node);
                }

                protectMediaInside(node);
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });


    /* =====================================================
       GLISSER-DÉPOSER GLOBAL
    ====================================================== */

    document.addEventListener("dragstart", (event) => {
        const target = event.target;

        if (!(target instanceof Element)) {
            return;
        }

        /*
         * Les liens, boutons et champs restent utilisables.
         */
        if (isInteractiveTarget(target)) {
            return;
        }

        /*
         * On bloque uniquement les médias.
         */
        if (target.closest("img, video")) {
            event.preventDefault();
        }
    });


    /* =====================================================
       RACCOURCI D’ENREGISTREMENT DES IMAGES
    ====================================================== */

    document.addEventListener("keydown", (event) => {
        const target = event.target;

        if (isInteractiveTarget(target)) {
            return;
        }

        /*
         * Ctrl + S / Cmd + S
         *
         * Tu peux retirer ce bloc si tu souhaites laisser
         * le navigateur enregistrer normalement la page.
         */
        const isSaveShortcut =
            (event.ctrlKey || event.metaKey) &&
            event.key.toLowerCase() === "s";

        if (isSaveShortcut) {
            event.preventDefault();
        }
    });
});