"use strict";

/* =========================================================
   GALERIE — NAVIGATION ENTRE LES ARTWORKS
   COUAXIA
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =====================================================
           ÉTAT
        ====================================================== */

        let artworks =
            [];

        let currentIndex =
            -1;

        let previousBodyOverflow =
            "";


        /* =====================================================
           CRÉATION DE LA VISIONNEUSE
        ====================================================== */

        const lightbox =
            document.createElement(
                "div"
            );


        lightbox.className =
            "gallery-navigation-lightbox";


        lightbox.hidden =
            true;


        lightbox.setAttribute(
            "role",
            "dialog"
        );


        lightbox.setAttribute(
            "aria-modal",
            "true"
        );


        lightbox.setAttribute(
            "aria-label",
            "Visionneuse des illustrations"
        );


        lightbox.innerHTML = `

            <div class="gallery-navigation-backdrop"></div>


            <div class="gallery-navigation-dialog">


                <!-- =========================================
                     FERMETURE
                ========================================== -->

                <button
                    type="button"
                    class="gallery-navigation-close"
                    aria-label="Fermer la visionneuse"
                    title="Fermer"
                >
                    ✕
                </button>


                <!-- =========================================
                     COMPTEUR
                ========================================== -->

                <div
                    class="gallery-navigation-counter"
                    aria-live="polite"
                >
                    1 / 1
                </div>

                <!-- =========================================
                    FAVORI
                ========================================== -->

                <button
                    type="button"
                    class="gallery-navigation-favorite"
                    aria-label="Ajouter aux favoris"
                    aria-pressed="false"
                    title="Ajouter aux favoris">
                    <span
                        class="gallery-navigation-favorite-icon"
                        aria-hidden="true">
                        ♡
                    </span>
                </button>
                <!-- =========================================
                     PRÉCÉDENT
                ========================================== -->

                <button
                    type="button"
                    class="
                        gallery-navigation-arrow
                        gallery-navigation-previous
                    "
                    aria-label="Illustration précédente"
                    title="Illustration précédente"
                >
                    <span aria-hidden="true">
                        ←
                    </span>
                </button>


                <!-- =========================================
                     MÉDIA
                ========================================== -->

                <div class="gallery-navigation-media">

                    <img
                        class="gallery-navigation-image"
                        src=""
                        alt=""
                        draggable="false"
                    >


                    <video
                        class="gallery-navigation-video"
                        autoplay
                        muted
                        loop
                        playsinline
                        preload="auto"
                        disablepictureinpicture
                        controlslist="nodownload noplaybackrate nofullscreen"
                        hidden
                    ></video>


                    <!-- Logo récupéré depuis la carte -->

                    <img
                        class="gallery-navigation-watermark"
                        src=""
                        alt=""
                        aria-hidden="true"
                        draggable="false"
                        hidden
                    >

                </div>


                <!-- =========================================
                     SUIVANT
                ========================================== -->

                <button
                    type="button"
                    class="
                        gallery-navigation-arrow
                        gallery-navigation-next
                    "
                    aria-label="Illustration suivante"
                    title="Illustration suivante"
                >
                    <span aria-hidden="true">
                        →
                    </span>
                </button>


                <!-- =========================================
                     INFORMATIONS
                ========================================== -->

                <div class="gallery-navigation-info">

                    <strong
                        class="gallery-navigation-title"
                    ></strong>


                    <span
                        class="gallery-navigation-artist"
                    ></span>

                </div>

            </div>
        `;


        document.body.appendChild(
            lightbox
        );


        /* =====================================================
           ÉLÉMENTS
        ====================================================== */

        const closeButton =
            lightbox.querySelector(
                ".gallery-navigation-close"
            );


        const previousButton =
            lightbox.querySelector(
                ".gallery-navigation-previous"
            );


        const nextButton =
            lightbox.querySelector(
                ".gallery-navigation-next"
            );


        const counter =
            lightbox.querySelector(
                ".gallery-navigation-counter"
            );
        
        const favoriteButton =
            lightbox.querySelector(
                ".gallery-navigation-favorite"
            );


        const favoriteIcon =
            lightbox.querySelector(
                ".gallery-navigation-favorite-icon"
            );    

        const image =
            lightbox.querySelector(
                ".gallery-navigation-image"
            );


        const video =
            lightbox.querySelector(
                ".gallery-navigation-video"
            );


        const watermark =
            lightbox.querySelector(
                ".gallery-navigation-watermark"
            );


        const title =
            lightbox.querySelector(
                ".gallery-navigation-title"
            );


        const artist =
            lightbox.querySelector(
                ".gallery-navigation-artist"
            );


        const backdrop =
            lightbox.querySelector(
                ".gallery-navigation-backdrop"
            );


        /* =====================================================
           OUTILS
        ====================================================== */

        function normalizeText(
            value
        ) {

            return String(
                value ??
                ""
            ).trim();
        }


        function isElementVisible(
            element
        ) {

            if (
                !(element instanceof HTMLElement)
            ) {

                return false;
            }


            if (
                element.hidden
            ) {

                return false;
            }


            if (
                element.classList.contains(
                    "is-hidden-card"
                )
            ) {

                return false;
            }


            const section =
                element.closest(
                    ".credits-gallery-section"
                );


            if (
                section?.hidden
            ) {

                return false;
            }


            const style =
                window.getComputedStyle(
                    element
                );


            return (
                style.display !==
                    "none" &&
                style.visibility !==
                    "hidden"
            );
        }


        /* =====================================================
           CRÉATION DE LA LISTE
        ====================================================== */

        function refreshArtworks() {

            artworks =
                Array.from(
                    document.querySelectorAll(
                        "#credits-generated-galleries .artist-card"
                    )
                )
                    .filter(
                        isElementVisible
                    )
                    .map(
                        card => {

                            const container =
                                card.querySelector(
                                    ".image-container"
                                );


                            if (
                                !container
                            ) {

                                return null;
                            }


                            /*
                             * IMPORTANT :
                             * on ne récupère PAS les watermarks.
                             */

                            const artworkImage =
                                container.querySelector(
                                    `
                                    img:not(
                                        .image-watermark-logo
                                    ):not(
                                        .image-zoom-watermark
                                    )
                                    `
                                );


                            const artworkVideo =
                                container.querySelector(
                                    "video"
                                );


                            if (
                                !artworkImage &&
                                !artworkVideo
                            ) {

                                return null;
                            }


                            const watermarkElement =
                                container.querySelector(
                                    ".image-watermark-logo"
                                ) ||
                                container.querySelector(
                                    ".image-zoom-watermark"
                                );


                            const titleElement =
                                card.querySelector(
                                    ".artist-content h3"
                                );

                            const artistElement =
                                card.querySelector(
                                    ".artist-role"
                                );
                            
                            const favoriteElement =
                                card.querySelector(
                                    ".gallery-favorite-button"
                                );    

                            return {

                                card,

                                container,
                                favoriteElement,
                                type:
                                    artworkVideo
                                        ? "video"
                                        : "image",

                                source:
                                    artworkVideo
                                        ? normalizeText(
                                            artworkVideo.currentSrc ||
                                            artworkVideo.src ||
                                            artworkVideo
                                                .querySelector(
                                                    "source"
                                                )
                                                ?.src
                                        )
                                        : normalizeText(
                                            artworkImage.currentSrc ||
                                            artworkImage.src
                                        ),

                                alt:
                                    normalizeText(
                                        artworkImage?.alt
                                    ) ||
                                    "Illustration de Couaxia",

                                title:
                                    normalizeText(
                                        titleElement?.textContent
                                    ),

                                artist:
                                    normalizeText(
                                        artistElement?.textContent
                                    ),

                                watermark:
                                    normalizeText(
                                        watermarkElement?.src
                                    )
                                
                            };
                        }
                    )
                    .filter(
                        artwork =>
                            artwork &&
                            artwork.source
                    );
        }

        /* =========================================================
        FAVORI — SYNCHRONISATION
        ========================================================= */

        function updateFavoriteButton() {

            if (
                currentIndex < 0 ||
                !artworks[currentIndex]
            ) {

                favoriteButton.hidden =
                    true;

                return;
            }


            const artwork =
                artworks[currentIndex];


            const originalButton =
                artwork.favoriteElement;


            if (
                !originalButton
            ) {

                favoriteButton.hidden =
                    true;

                return;
            }


            favoriteButton.hidden =
                false;


            /*
            * On récupère l'état du vrai bouton de la carte.
            */
            const isFavorite =
                originalButton.classList.contains(
                    "is-favorite"
                ) ||
                originalButton.getAttribute(
                    "aria-pressed"
                ) ===
                    "true";


            favoriteButton.classList.toggle(
                "is-favorite",
                isFavorite
            );


            favoriteButton.setAttribute(
                "aria-pressed",
                String(
                    isFavorite
                )
            );


            favoriteButton.setAttribute(
                "aria-label",
                isFavorite
                    ? "Retirer des favoris"
                    : "Ajouter aux favoris"
            );


            favoriteButton.title =
                isFavorite
                    ? "Retirer des favoris"
                    : "Ajouter aux favoris";


            favoriteIcon.textContent =
                isFavorite
                    ? "♥"
                    : "♡";
        }
        /* =====================================================
           AFFICHER UN ARTWORK
        ====================================================== */

        function showArtwork(
            index
        ) {

            refreshArtworks();


            if (
                artworks.length ===
                0
            ) {

                closeLightbox();

                return;
            }


            /*
             * Navigation en boucle :
             *
             * - précédent depuis le premier
             *   => dernier
             *
             * - suivant depuis le dernier
             *   => premier
             */

            if (
                index <
                0
            ) {

                index =
                    artworks.length -
                    1;
            }


            if (
                index >=
                artworks.length
            ) {

                index =
                    0;
            }


            currentIndex =
                index;


            const artwork =
                artworks[
                    currentIndex
                ];


            /* =================================================
               IMAGE / VIDÉO
            ================================================= */
/* =================================================
   IMAGE / VIDÉO
================================================= */

if (
    artwork.type ===
    "video"
) {

    /* =============================================
       CACHE L'IMAGE
    ============================================== */

    image.hidden =
        true;

    image.src =
        "";


    /* =============================================
       ARRÊTE UNE ÉVENTUELLE ANCIENNE VIDÉO
    ============================================== */

    video.pause();

    video.currentTime =
        0;


    /* =============================================
       PRÉPARE LA VIDÉO
    ============================================== */

    video.hidden =
        false;

    video.muted =
        true;

    video.loop =
        true;

    video.autoplay =
        true;

    video.playsInline =
        true;

    video.controls =
        false;


    /* =============================================
       CHARGE LE MP4
    ============================================== */

    video.src =
        artwork.source;

    video.load();


    /* =============================================
       LECTURE AUTOMATIQUE
    ============================================== */

    const playPromise =
        video.play();


    if (
        playPromise &&
        typeof playPromise.catch ===
            "function"
    ) {

        playPromise.catch(
            error => {

                console.debug(
                    "[Gallery Navigation] Autoplay vidéo bloqué :",
                    error
                );
            }
        );
    }


} else {

    /* =============================================
       ARRÊTE LA VIDÉO PRÉCÉDENTE
    ============================================== */

    video.pause();

    video.currentTime =
        0;

    video.removeAttribute(
        "src"
    );

    video.load();

    video.hidden =
        true;


    /* =============================================
       AFFICHE L'IMAGE
    ============================================== */

    image.hidden =
        false;

    image.src =
        artwork.source;

    image.alt =
        artwork.alt;
}

            /* =================================================
               WATERMARK
            ================================================= */

            if (
                artwork.watermark
            ) {

                watermark.src =
                    artwork.watermark;


                watermark.hidden =
                    false;


            } else {

                watermark.src =
                    "";


                watermark.hidden =
                    true;
            }


            /* =================================================
               INFORMATIONS
            ================================================= */

            title.textContent =
                artwork.title ||
                "";


            artist.textContent =
                artwork.artist ||
                "";


            title.hidden =
                !artwork.title;


            artist.hidden =
                !artwork.artist;

            /* =================================================
            FAVORI
            ================================================= */  

            updateFavoriteButton();

            /* =================================================
               COMPTEUR
            ================================================= */

            counter.textContent =
                `${
                    currentIndex + 1
                } / ${
                    artworks.length
                }`;


            /* =================================================
               FLÈCHES
            ================================================= */

            const multipleArtworks =
                artworks.length >
                1;


            previousButton.hidden =
                !multipleArtworks;


            nextButton.hidden =
                !multipleArtworks;
        }


        /* =====================================================
           OUVERTURE
        ====================================================== */

        function openLightbox(
            card
        ) {

            refreshArtworks();


            const index =
                artworks.findIndex(
                    artwork =>
                        artwork.card ===
                        card
                );


            if (
                index <
                0
            ) {

                return;
            }


            previousBodyOverflow =
                document.body.style
                    .overflow;


            document.body.style
                .overflow =
                "hidden";


            lightbox.hidden =
                false;


            lightbox.classList.add(
                "is-open"
            );


            showArtwork(
                index
            );


            closeButton.focus();
        }


        /* =====================================================
           FERMETURE
        ====================================================== */

        function closeLightbox() {

            if (
                lightbox.hidden
            ) {

                return;
            }


            /* =================================================
            VIDÉO
            ================================================= */

            video.pause();

            video.currentTime =
                0;

            video.removeAttribute(
                "src"
            );

            video.load();

            video.hidden =
                true;


            /* =================================================
            IMAGE
            ================================================= */

            image.src =
                "";

            image.hidden =
                false;


            /* =================================================
            WATERMARK
            ================================================= */

            watermark.src =
                "";

            watermark.hidden =
                true;


            /* =================================================
            LIGHTBOX
            ================================================= */

            lightbox.classList.remove(
                "is-open"
            );

            lightbox.hidden =
                true;


            document.body.style
                .overflow =
                previousBodyOverflow;


            currentIndex =
                -1;
        }

        /* =====================================================
           PRÉCÉDENT / SUIVANT
        ====================================================== */

        function previousArtwork() {

            if (
                currentIndex <
                0
            ) {

                return;
            }


            showArtwork(
                currentIndex -
                1
            );
        }


        function nextArtwork() {

            if (
                currentIndex <
                0
            ) {

                return;
            }


            showArtwork(
                currentIndex +
                1
            );
        }


        /* =====================================================
           CLIC SUR LES ARTWORKS
        ====================================================== */

        function initializeArtworkClicks() {

            document
                .querySelectorAll(
                    "#credits-generated-galleries .artist-card"
                )
                .forEach(
                    card => {

                        const container =
                            card.querySelector(
                                ".image-container"
                            );


                        if (
                            !container ||
                            container.dataset
                                .navigationReady ===
                                "true"
                        ) {

                            return;
                        }


                        container.dataset
                            .navigationReady =
                            "true";


                        container.setAttribute(
                            "role",
                            "button"
                        );


                        container.setAttribute(
                            "tabindex",
                            "0"
                        );


                        container.setAttribute(
                            "aria-label",
                            "Ouvrir cette illustration"
                        );


                        /* =========================================
                           CLIC
                        ========================================== */

                        container.addEventListener(
                            "click",
                            event => {

                                /*
                                 * Ne pas ouvrir si on clique
                                 * sur le bouton favori ou sur
                                 * un autre contrôle.
                                 */

                                if (
                                    event.target.closest(
                                        `
                                        button,
                                        a,
                                        .gallery-favorite-button
                                        `
                                    )
                                ) {

                                    return;
                                }


                                openLightbox(
                                    card
                                );
                            }
                        );

                        /* =========================================
                           CLAVIER
                        ========================================== */

                        container.addEventListener(
                            "keydown",
                            event => {

                                if (
                                    event.key !==
                                        "Enter" &&
                                    event.key !==
                                        " "
                                ) {

                                    return;
                                }


                                event.preventDefault();


                                openLightbox(
                                    card
                                );
                            }
                        );
                    }
                );
        }


        /* =====================================================
           BOUTONS
        ====================================================== */

        backdrop.addEventListener(
            "click",
            closeLightbox
        );

        previousButton.addEventListener(
            "click",
            event => {
                event.stopPropagation();
                previousArtwork();
            }
        );


        nextButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                nextArtwork();
            }
        );

        /* =====================================================
        FAVORI
        ===================================================== */

        favoriteButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();


                if (
                    currentIndex < 0 ||
                    !artworks[currentIndex]
                ) {

                    return;
                }


                const artwork =
                    artworks[currentIndex];


                const originalButton =
                    artwork.favoriteElement;


                if (
                    !originalButton
                ) {

                    return;
                }


                /*
                * Le bouton de la visionneuse utilise le vrai
                * bouton favori de la carte.
                */
                originalButton.click();


                /*
                * Synchronise ensuite l'affichage du cœur.
                */
                window.requestAnimationFrame(
                    () => {

                        updateFavoriteButton();

                    }
                );
            }
        );


        /* =====================================================
        FERMETURE
        ===================================================== */

        closeButton.addEventListener(
            "click",
            closeLightbox
        );


        /* =====================================================
           CLAVIER GLOBAL
        ====================================================== */

        document.addEventListener(
            "keydown",
            event => {

                if (
                    lightbox.hidden
                ) {

                    return;
                }


                switch (
                    event.key
                ) {

                    case "Escape":

                        event.preventDefault();

                        closeLightbox();

                        break;


                    case "ArrowLeft":

                        event.preventDefault();

                        previousArtwork();

                        break;


                    case "ArrowRight":

                        event.preventDefault();

                        nextArtwork();

                        break;
                }
            }
        );


        /* =====================================================
           APRÈS LE RENDER DE credits-gallery.js
        ====================================================== */

        document.addEventListener(
            "couaxia:credits-rendered",
            () => {

                window.requestAnimationFrame(
                    () => {

                        refreshArtworks();

                        initializeArtworkClicks();
                    }
                );
            }
        );


        /* =====================================================
           PREMIÈRE INITIALISATION
        ====================================================== */

        refreshArtworks();

        initializeArtworkClicks();


        /* =====================================================
           API OPTIONNELLE
        ====================================================== */

        window.CouaxiaGalleryNavigation = {

            refresh:
                refreshArtworks,

            close:
                closeLightbox,

            next:
                nextArtwork,

            previous:
                previousArtwork

        };

    }
);