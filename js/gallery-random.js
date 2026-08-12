"use strict";

/* =========================================================
   ŒUVRE ALÉATOIRE — GALERIE COUAXIA
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const randomButton =
        document.getElementById(
            "credits-random-art"
        );


    if (!randomButton) {
        console.warn(
            "[Œuvre aléatoire] Bouton introuvable."
        );

        return;
    }


    /* =====================================================
       OUTILS
    ====================================================== */

    /**
     * Récupère les cartes originales.
     *
     * On utilise volontairement la réserve source
     * afin d'éviter les doublons créés par
     * credits-gallery.js.
     */
    function getOriginalCards() {

        const source =
            document.getElementById(
                "credits-card-source"
            );


        if (!source) {
            console.warn(
                "[Œuvre aléatoire] #credits-card-source introuvable."
            );

            return [];
        }


        return Array.from(
            source.querySelectorAll(
                ".artist-card[data-art-id]"
            )
        );
    }


    /**
     * Choisit une carte aléatoirement.
     */
    function getRandomCard(cards) {

        if (
            !Array.isArray(cards) ||
            cards.length === 0
        ) {
            return null;
        }


        const randomIndex =
            Math.floor(
                Math.random() *
                cards.length
            );


        return cards[
            randomIndex
        ];
    }


    /**
     * Nom de l'artiste.
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


        return (
            heading?.textContent?.trim() ||
            "Artiste"
        );
    }


    /**
     * Recherche l'œuvre principale.
     *
     * Important :
     * on exclut les éventuels logos / watermarks.
     */
    function getArtwork(card) {

        const imageContainer =
            card.querySelector(
                ".image-container"
            );


        if (!imageContainer) {
            return null;
        }


        /*
         * Priorité à la vidéo.
         */
        const video =
            imageContainer.querySelector(
                ":scope > video"
            );


        if (video) {
            return video;
        }


        /*
         * Puis on recherche l'image principale
         * sans récupérer un watermark.
         */
        const images =
            Array.from(
                imageContainer.children
            ).filter(
                (element) =>
                    element instanceof
                        HTMLImageElement
            );


        return (
            images.find(
                (image) =>
                    !image.classList.contains(
                        "image-watermark-logo"
                    ) &&
                    !image.classList.contains(
                        "watermark-logo"
                    ) &&
                    !image.classList.contains(
                        "random-art-copyright-logo"
                    ) &&
                    !image.classList.contains(
                        "random-art-sensitive-logo"
                    )
            ) ||
            null
        );
    }


    /**
     * Vérifie si l'œuvre est +18.
     */
    function isSensitive(card) {

        return (
            card.dataset.sensitive ===
            "true"
        );
    }


    /* =====================================================
       CRÉATION DU MODAL
    ====================================================== */

    function createRandomModal() {

        const overlay =
            document.createElement(
                "div"
            );


        overlay.className =
            "random-art-modal";


        overlay.innerHTML = `
            <div
                class="random-art-dialog"
                role="dialog"
                aria-modal="true"
                aria-label="Œuvre aléatoire"
            >

                <!-- =====================================
                     FERMETURE
                ====================================== -->

                <button
                    type="button"
                    class="random-art-close"
                    aria-label="Fermer"
                    title="Fermer"
                >
                    ✕
                </button>


                <!-- =====================================
                     ŒUVRE
                ====================================== -->

                <div
                    class="random-art-stage"
                >

                    <div
                        class="random-art-media"
                    ></div>


                    <!-- =================================
                         +18
                    ================================== -->

                    <div
                        class="random-art-sensitive-warning"
                        hidden
                    >

                        <button
                            type="button"
                            class="random-art-sensitive-reveal"
                            aria-label="Révéler l’illustration réservée aux adultes"
                            title="Révéler l’illustration"
                        >

                            <img
                                src="./images/logo/Logo_Glow.png"
                                class="random-art-sensitive-logo"
                                alt=""
                                aria-hidden="true"
                                draggable="false"
                            >

                        </button>

                    </div>


                    <!-- =================================
                         LOGO COPYRIGHT PERMANENT
                    ================================== -->

                    <img
                        src="./images/logo/Logo_Glow.png"
                        class="random-art-copyright-logo"
                        alt=""
                        aria-hidden="true"
                        draggable="false"
                    >


                    <!-- =================================
                         CRÉDIT ARTISTE
                    ================================== -->

                    <div
                        class="random-art-credit"
                    >

                        <span
                            class="random-art-credit-artist"
                        ></span>


                        <span
                            class="random-art-credit-owner"
                        >
                            © Couaxia
                        </span>

                    </div>

                </div>


                <!-- =====================================
                     ACTIONS
                ====================================== -->

                <div
                    class="random-art-actions"
                >

                    <button
                        type="button"
                        class="random-art-again"
                    >
                        🎲 Une autre œuvre
                    </button>

                </div>

            </div>
        `;


        document.body.appendChild(
            overlay
        );


        return overlay;
    }


    /* =====================================================
       CRÉATION D'UNE COPIE DE L'ŒUVRE
    ====================================================== */

    function createArtworkClone(
        artwork
    ) {

        /* =================================================
           IMAGE
        ================================================= */

        if (
            artwork instanceof
            HTMLImageElement
        ) {

            const image =
                document.createElement(
                    "img"
                );


            /*
             * On utilise d'abord getAttribute("src").
             *
             * C'est important car les cartes originales
             * sont dans un conteneur hidden et currentSrc
             * peut parfois être vide.
             */
            const originalSource =
                artwork.getAttribute(
                    "src"
                );


            image.src =
                originalSource ||
                artwork.src;


            /*
             * srcset / sizes si présents.
             */
            const srcset =
                artwork.getAttribute(
                    "srcset"
                );


            const sizes =
                artwork.getAttribute(
                    "sizes"
                );


            if (srcset) {
                image.setAttribute(
                    "srcset",
                    srcset
                );
            }


            if (sizes) {
                image.setAttribute(
                    "sizes",
                    sizes
                );
            }


            image.alt =
                artwork.alt ||
                "Illustration";


            image.className =
                "random-artwork";


            image.draggable =
                false;


            image.decoding =
                "async";


            return image;
        }


        /* =================================================
           VIDÉO
        ================================================= */

        if (
            artwork instanceof
            HTMLVideoElement
        ) {

            const video =
                document.createElement(
                    "video"
                );


            const directSource =
                artwork.getAttribute(
                    "src"
                );


            if (directSource) {

                video.src =
                    directSource;

            } else {

                /*
                 * Certaines vidéos utilisent :
                 *
                 * <video>
                 *     <source ...>
                 * </video>
                 */

                artwork
                    .querySelectorAll(
                        "source"
                    )
                    .forEach(
                        (originalSource) => {

                            const source =
                                document.createElement(
                                    "source"
                                );


                            source.src =
                                originalSource.src;


                            if (
                                originalSource.type
                            ) {
                                source.type =
                                    originalSource.type;
                            }


                            video.appendChild(
                                source
                            );

                        }
                    );

            }


            video.className =
                "random-artwork";


            video.controls =
                true;


            video.autoplay =
                false;


            video.loop =
                true;


            video.playsInline =
                true;


            return video;
        }


        return null;
    }


    /* =====================================================
       AFFICHAGE DE L'ŒUVRE
    ====================================================== */

    function displayArtworkInModal(
        modal,
        card
    ) {

        const mediaContainer =
            modal.querySelector(
                ".random-art-media"
            );


        const artistElement =
            modal.querySelector(
                ".random-art-credit-artist"
            );


        const warning =
            modal.querySelector(
                ".random-art-sensitive-warning"
            );


        const revealButton =
            modal.querySelector(
                ".random-art-sensitive-reveal"
            );


        if (
            !mediaContainer ||
            !artistElement
        ) {
            console.error(
                "[Œuvre aléatoire] Structure du modal incomplète."
            );

            return;
        }


        const artwork =
            getArtwork(
                card
            );


        if (!artwork) {

            console.warn(
                "[Œuvre aléatoire] Aucun média trouvé pour l'œuvre :",
                card.dataset.artId
            );


            mediaContainer.innerHTML =
                `
                    <p class="random-art-error">
                        Impossible d'afficher cette œuvre.
                    </p>
                `;


            return;
        }


        /* =================================================
           NETTOYAGE
        ================================================= */

        mediaContainer.innerHTML =
            "";


        mediaContainer.classList.remove(
            "is-sensitive"
        );


        /* =================================================
           CRÉATION DE L'ŒUVRE
        ================================================= */

        const clone =
            createArtworkClone(
                artwork
            );


        if (!clone) {

            console.warn(
                "[Œuvre aléatoire] Type de média non compatible."
            );

            return;
        }


        mediaContainer.appendChild(
            clone
        );


        /* =================================================
           DEBUG ERREUR IMAGE
        ================================================= */

        if (
            clone instanceof
            HTMLImageElement
        ) {

            clone.addEventListener(
                "error",
                () => {

                    console.error(
                        "[Œuvre aléatoire] Impossible de charger l'image :",
                        clone.src
                    );

                },
                {
                    once:
                        true
                }
            );

        }


        /* =================================================
           ARTISTE
        ================================================= */

        const artistName =
            getArtistName(
                card
            );


        artistElement.textContent =
            `🎨 ${artistName}`;


        /* =================================================
           +18
        ================================================= */

        const sensitive =
            isSensitive(
                card
            );


        mediaContainer.classList.toggle(
            "is-sensitive",
            sensitive
        );


        /*
         * Le modal reste fonctionnel même
         * si le bloc +18 est absent du HTML.
         */
        if (warning) {

            warning.hidden =
                !sensitive;

        }


        if (revealButton) {

            revealButton.onclick =
                () => {

                    mediaContainer.classList.remove(
                        "is-sensitive"
                    );


                    if (warning) {
                        warning.hidden =
                            true;
                    }


                    if (
                        typeof window
                            .showMascotteMessage ===
                        "function"
                    ) {

                        window.showMascotteMessage(
                            "Oh, tu ne pouvais vraiment pas t'empêcher de regarder 😏",
                            3500
                        );

                    }

                };

        }


        /*
         * Recharge les sources d'une vidéo.
         */
        if (
            clone instanceof
            HTMLVideoElement
        ) {
            clone.load();
        }
    }


    /* =====================================================
       MESSAGE MASCOTTE
    ====================================================== */

    function showRandomMascotteMessage() {

        if (
            typeof window
                .showMascotteMessage !==
            "function"
        ) {
            return;
        }


        const messages = [
            "Le hasard a choisi celle-ci ! 🎲",
            "Ooooh, regarde cette œuvre ! 💜",
            "Tadaaam ! ✨",
            "Une œuvre sauvage apparaît ! 🎨",
            "Voyons voir ce que le destin a choisi ! 👀"
        ];


        const message =
            messages[
                Math.floor(
                    Math.random() *
                    messages.length
                )
            ];


        window.showMascotteMessage(
            message,
            3500
        );
    }


    /* =====================================================
       OUVERTURE
    ====================================================== */

    function openRandomArtwork() {

        const cards =
            getOriginalCards();


        if (
            cards.length ===
            0
        ) {

            console.warn(
                "[Œuvre aléatoire] Aucune carte avec data-art-id trouvée."
            );

            return;
        }


        const randomCard =
            getRandomCard(
                cards
            );


        if (!randomCard) {
            return;
        }


        console.info(
            "[Œuvre aléatoire] Œuvre choisie :",
            randomCard.dataset.artId
        );


        let modal =
            document.querySelector(
                ".random-art-modal"
            );


        if (!modal) {

            modal =
                createRandomModal();

        }


        displayArtworkInModal(
            modal,
            randomCard
        );


        modal.classList.add(
            "is-open"
        );


        document.body.classList.add(
            "random-art-open"
        );


        const closeButton =
            modal.querySelector(
                ".random-art-close"
            );


        closeButton?.focus();


        showRandomMascotteMessage();
    }


    /* =====================================================
       FERMETURE
    ====================================================== */

    function closeRandomModal(
        modal
    ) {

        if (!modal) {
            return;
        }


        modal.classList.remove(
            "is-open"
        );


        document.body.classList.remove(
            "random-art-open"
        );


        /*
         * Coupe toutes les vidéos.
         */
        modal
            .querySelectorAll(
                "video"
            )
            .forEach(
                (video) => {

                    video.pause();

                }
            );
    }


    /* =====================================================
       ÉVÉNEMENTS
    ====================================================== */

    randomButton.addEventListener(
        "click",
        openRandomArtwork
    );


    /*
     * Délégation d'événements du modal.
     */
    document.addEventListener(
        "click",
        (event) => {

            if (
                !(
                    event.target instanceof
                    Element
                )
            ) {
                return;
            }


            const modal =
                event.target.closest(
                    ".random-art-modal"
                );


            if (!modal) {
                return;
            }


            /* =============================================
               FERMER
            ============================================= */

            if (
                event.target.closest(
                    ".random-art-close"
                )
            ) {

                closeRandomModal(
                    modal
                );

                return;
            }


            /* =============================================
               AUTRE ŒUVRE
            ============================================= */

            if (
                event.target.closest(
                    ".random-art-again"
                )
            ) {

                openRandomArtwork();

                return;
            }


            /* =============================================
               CLIC À L'EXTÉRIEUR
            ============================================= */

            if (
                event.target ===
                modal
            ) {

                closeRandomModal(
                    modal
                );

            }

        }
    );


    /* =====================================================
       TOUCHE ÉCHAP
    ====================================================== */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key !==
                "Escape"
            ) {
                return;
            }


            const modal =
                document.querySelector(
                    ".random-art-modal.is-open"
                );


            if (!modal) {
                return;
            }


            closeRandomModal(
                modal
            );

        }
    );

});