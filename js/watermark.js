"use strict";

/* =========================================================
   WATERMARK DES ILLUSTRATIONS — COUAXIA
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       NOM DE L'ARTISTE
    ====================================================== */

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


        return (
            headingName ||
            "Artiste inconnu"
        );
    }


    /* =====================================================
       WATERMARK TEXTE
    ====================================================== */

    /**
     * Crée la plaque avec :
     *
     * 🎨 Nom artiste
     * © Couaxia
     *
     * @param {string} artistName
     * @returns {HTMLDivElement}
     */
    function createWatermarkMessage(
        artistName
    ) {

        const message =
            document.createElement(
                "div"
            );


        message.className =
            "image-watermark-message";


        message.setAttribute(
            "aria-hidden",
            "true"
        );


        /* =============================================
           ARTISTE
        ============================================= */

        const artist =
            document.createElement(
                "span"
            );


        artist.className =
            "image-watermark-title";


        artist.textContent =
            `🎨 ${artistName}`;


        /* =============================================
           COPYRIGHT
        ============================================= */

        const copyright =
            document.createElement(
                "span"
            );


        copyright.className =
            "image-watermark-artist";


        copyright.textContent =
            "© Couaxia";


        message.append(
            artist,
            copyright
        );


        return message;
    }


    /* =====================================================
       LOGO WATERMARK DU ZOOM
    ====================================================== */

    /**
     * Crée le logo Couaxia affiché
     * uniquement pendant le zoom.
     *
     * @returns {HTMLImageElement}
     */
    function createZoomWatermark() {

        const logo =
            document.createElement(
                "img"
            );


        logo.src =
            "./images/logo/Logo_Glow.png";


        logo.className =
            "image-zoom-watermark";


        logo.alt =
            "";


        logo.setAttribute(
            "aria-hidden",
            "true"
        );


        logo.setAttribute(
            "draggable",
            "false"
        );


        logo.loading =
            "lazy";


        logo.decoding =
            "async";


        return logo;
    }


    /* =====================================================
       INITIALISATION D'UNE CARTE
    ====================================================== */

    /**
     * Initialise tous les watermarks
     * d'un conteneur d'image.
     *
     * @param {HTMLElement} imageContainer
     */
    function initializeWatermark(
        imageContainer
    ) {

        if (
            imageContainer.dataset
                .watermarkReady ===
            "true"
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


        const artistName =
            getArtistName(
                card
            );


        /* =================================================
           WATERMARK TEXTE
        ================================================= */

        const existingMessage =
            imageContainer.querySelector(
                ".image-watermark-message"
            );


        if (!existingMessage) {

            const message =
                createWatermarkMessage(
                    artistName
                );


            imageContainer.appendChild(
                message
            );

        }


        /* =================================================
           LOGO DU ZOOM
        ================================================= */

        const existingZoomWatermark =
            imageContainer.querySelector(
                ".image-zoom-watermark"
            );


        if (!existingZoomWatermark) {

            const zoomWatermark =
                createZoomWatermark();


            imageContainer.appendChild(
                zoomWatermark
            );

        }


        /* =================================================
           TERMINÉ
        ================================================= */

        imageContainer.dataset
            .watermarkReady =
            "true";
    }


    /* =====================================================
       INITIALISER PLUSIEURS CARTES
    ====================================================== */

    /**
     * Initialise toutes les cartes
     * présentes dans root.
     *
     * @param {ParentNode} root
     */
    function initializeWatermarksInside(
        root
    ) {

        /*
         * Si root est directement
         * un image-container.
         */
        if (
            root instanceof HTMLElement &&
            root.matches(
                ".artist-card .image-container"
            )
        ) {
            initializeWatermark(
                root
            );
        }


        /*
         * Recherche les cartes enfants.
         */
        root
            .querySelectorAll(
                ".artist-card .image-container"
            )
            .forEach(
                initializeWatermark
            );
    }


    /* =====================================================
       CARTES PRÉSENTES AU CHARGEMENT
    ====================================================== */

    initializeWatermarksInside(
        document
    );


    /* =====================================================
       CARTES GÉNÉRÉES DYNAMIQUEMENT
    ====================================================== */

    /*
     * credits-gallery.js clone les cartes.
     *
     * Le MutationObserver permet donc
     * d'ajouter automatiquement :
     *
     * - la plaque artiste ;
     * - le logo de zoom.
     */

    const observer =
        new MutationObserver(
            (mutations) => {

                mutations.forEach(
                    (mutation) => {

                        mutation
                            .addedNodes
                            .forEach(
                                (node) => {

                                    if (
                                        !(
                                            node instanceof
                                            Element
                                        )
                                    ) {
                                        return;
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
            childList:
                true,

            subtree:
                true
        }
    );

});