"use strict";

/* =========================================================
   WATERMARK TEXTE DES ILLUSTRATIONS — COUAXIA
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    /**
     * Cherche le nom de l’artiste.
     *
     * Priorité :
     * 1. data-artist sur la carte ;
     * 2. contenu du h3 ;
     * 3. texte générique.
     *
     * @param {HTMLElement} card
     * @returns {string}
     */
    function getArtistName(card) {
        const dataArtist =
            card.dataset.artist?.trim();

        if (dataArtist) {
            return dataArtist;
        }

        const heading =
            card.querySelector(
                ".artist-content h3"
            );

        const headingName =
            heading?.textContent?.trim();

        return headingName || "l’artiste";
    }


    /**
     * Crée le bandeau du watermark.
     *
     * @param {string} artistName
     * @returns {HTMLDivElement}
     */
    function createWatermarkMessage(
        artistName
    ) {
        const message =
            document.createElement("div");

        message.className =
            "image-watermark-message";

        message.setAttribute(
            "aria-hidden",
            "true"
        );


        const title =
            document.createElement("span");

        title.className =
            "image-watermark-title";

        title.textContent =
            "© Couaxia";


        const artist =
            document.createElement("span");

        artist.className =
            "image-watermark-artist";

        artist.textContent =
            `Illustration par ${artistName}`;


        message.append(
            title,
            artist
        );

        return message;
    }


    /**
     * Initialise le watermark d’une carte.
     *
     * @param {HTMLElement} imageContainer
     */
    function initializeWatermark(
        imageContainer
    ) {
        if (
            imageContainer.dataset
                .watermarkReady === "true"
        ) {
            return;
        }

        const card =
            imageContainer.closest(
                ".artist-card"
            );

        if (!card) {
            return;
        }

        /*
         * Évite de créer un second bandeau
         * si le HTML en contient déjà un.
         */
        const existingMessage =
            imageContainer.querySelector(
                ".image-watermark-message"
            );

        if (existingMessage) {
            imageContainer.dataset
                .watermarkReady = "true";

            return;
        }

        const artistName =
            getArtistName(card);

        const message =
            createWatermarkMessage(
                artistName
            );

        imageContainer.appendChild(
            message
        );

        imageContainer.dataset
            .watermarkReady = "true";
    }


    /**
     * Initialise les cartes présentes
     * dans un conteneur.
     *
     * @param {ParentNode} root
     */
    function initializeWatermarksInside(
        root
    ) {
        root
            .querySelectorAll(
                ".artist-card .image-container"
            )
            .forEach(
                initializeWatermark
            );
    }


    /*
     * Cartes déjà présentes au chargement.
     */
    initializeWatermarksInside(
        document
    );


    /*
     * Les galeries étant créées dynamiquement
     * par credits-gallery.js, on surveille
     * l’apparition de nouvelles cartes.
     */
    const observer =
        new MutationObserver(
            (mutations) => {
                mutations.forEach(
                    (mutation) => {
                        mutation.addedNodes
                            .forEach(
                                (node) => {
                                    if (
                                        !(
                                            node
                                            instanceof
                                            Element
                                        )
                                    ) {
                                        return;
                                    }

                                    if (
                                        node.matches(
                                            ".artist-card .image-container"
                                        )
                                    ) {
                                        initializeWatermark(
                                            node
                                        );
                                    }

                                    initializeWatermarksInside(
                                        node
                                    );
                                }
                            );
                    }
                );
            }
        );

    observer.observe(
        document.body,
        {
            childList: true,
            subtree: true
        }
    );
});