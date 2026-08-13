"use strict";

/* =========================================================
   ARTIST.JS
   COUAXIA — GALERIE DES CRÉDITS
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =================================================
           ÉLÉMENTS
        ================================================== */

        const filterSelect =
            document.querySelector(
                "#credits-category-filter"
            );

        const gallerySections =
            Array.from(
                document.querySelectorAll(
                    ".credits-gallery-section"
                )
            );

        const resultsMessage =
            document.querySelector(
                "#credits-global-results"
            );


        /* =================================================
           VÉRIFICATION
        ================================================== */

        if (
            !filterSelect ||
            gallerySections.length === 0
        ) {

            console.warn(
                "[Artist] Le filtre ou les galeries sont introuvables."
            );

            return;
        }


        /* =================================================
           CONFIGURATION
        ================================================== */

        const ANIMATION_DURATION =
            550;

        const CARD_DELAY =
            55;

        const MAX_CARD_DELAY =
            330;


        /* =================================================
           TAGS
        ================================================== */

        /**
         * Transforme :
         *
         * data-tags="couaxia myo collab couple"
         *
         * en :
         *
         * [
         *   "couaxia",
         *   "myo",
         *   "collab",
         *   "couple"
         * ]
         *
         * @param {HTMLElement} card
         * @returns {string[]}
         */
        function getCardTags(
            card
        ) {

            return String(
                card.dataset.tags ||
                ""
            )
                .toLowerCase()
                .trim()
                .split(/\s+/)
                .filter(
                    Boolean
                );
        }


        /**
         * Vérifie si une carte correspond
         * au filtre sélectionné.
         *
         * @param {HTMLElement} card
         * @param {string} selectedFilter
         * @returns {boolean}
         */
        function cardMatchesFilter(
            card,
            selectedFilter
        ) {

            if (
                selectedFilter ===
                "all"
            ) {

                return true;
            }


            const tags =
                getCardTags(
                    card
                );


            return tags.includes(
                selectedFilter
            );
        }


        /* =================================================
           GALERIES
        ================================================== */

        /**
         * Calcule et enregistre la hauteur
         * naturelle d'une galerie.
         *
         * @param {HTMLElement} section
         */
        function setSectionExpandedHeight(
            section
        ) {

            section.style.maxHeight =
                "none";


            const naturalHeight =
                section.scrollHeight;


            section.style.maxHeight =
                `${naturalHeight}px`;
        }


        /**
         * Déplie une galerie.
         *
         * @param {HTMLElement} section
         */
        function expandSection(
            section
        ) {

            section.classList.remove(
                "is-collapsed"
            );


            /*
             * Si la galerie est déjà ouverte,
             * on recalcule simplement sa hauteur.
             */

            if (
                section.style.maxHeight !==
                "0px"
            ) {

                setSectionExpandedHeight(
                    section
                );

                return;
            }


            section.style.maxHeight =
                "0px";


            requestAnimationFrame(
                () => {

                    const naturalHeight =
                        section.scrollHeight;


                    section.style.maxHeight =
                        `${naturalHeight}px`;
                }
            );


            /*
             * Après l'animation, on recalcule
             * la hauteur définitive.
             */

            window.setTimeout(
                () => {

                    if (
                        !section.classList.contains(
                            "is-collapsed"
                        )
                    ) {

                        setSectionExpandedHeight(
                            section
                        );
                    }

                },
                ANIMATION_DURATION
            );
        }


        /**
         * Replie une galerie.
         *
         * @param {HTMLElement} section
         */
        function collapseSection(
            section
        ) {

            /*
             * Évite de relancer inutilement
             * l'animation.
             */

            if (
                section.classList.contains(
                    "is-collapsed"
                )
            ) {

                return;
            }


            const currentHeight =
                section.scrollHeight;


            section.style.maxHeight =
                `${currentHeight}px`;


            /*
             * Force le navigateur à enregistrer
             * la hauteur actuelle.
             */

            void section.offsetHeight;


            section.classList.add(
                "is-collapsed"
            );


            section.style.maxHeight =
                "0px";
        }


        /* =================================================
           CARTES
        ================================================== */

        /**
         * Cache une carte.
         *
         * @param {HTMLElement} card
         */
        function hideCard(
            card
        ) {

            card.classList.remove(
                "is-visible-card"
            );

            card.classList.add(
                "is-hidden-card"
            );

            card.style.animationDelay =
                "0ms";
        }


        /**
         * Affiche une carte avec animation.
         *
         * @param {HTMLElement} card
         * @param {number} delay
         */
        function showCard(
            card,
            delay = 0
        ) {

            card.classList.remove(
                "is-hidden-card"
            );

            card.classList.remove(
                "is-visible-card"
            );


            card.style.animationDelay =
                `${delay}ms`;


            /*
             * Force le navigateur à relancer
             * l'animation.
             */

            void card.offsetWidth;


            card.classList.add(
                "is-visible-card"
            );
        }


        /* =================================================
           EFFET IMAGE
        ================================================== */

        /**
         * Active l'effet permettant de masquer
         * temporairement le contenu lorsque
         * l'utilisateur survole l'image.
         *
         * @param {HTMLElement} card
         */
        function initializeCardImageEffect(
            card
        ) {

            const imageContainer =
                card.querySelector(
                    ".image-container"
                );

            const content =
                card.querySelector(
                    ".artist-content"
                );


            if (
                !imageContainer ||
                !content
            ) {

                return;
            }


            imageContainer.addEventListener(
                "mouseenter",
                () => {

                    content.style.opacity =
                        "0";

                    content.style.pointerEvents =
                        "none";
                }
            );


            imageContainer.addEventListener(
                "mouseleave",
                () => {

                    content.style.opacity =
                        "1";

                    content.style.pointerEvents =
                        "auto";
                }
            );
        }


        /**
         * Initialise toutes les cartes
         * actuellement présentes.
         */
        function initializeCards() {

            const cards =
                document.querySelectorAll(
                    ".artist-card"
                );


            cards.forEach(
                initializeCardImageEffect
            );
        }


        /* =================================================
           COMPTEUR
        ================================================== */

        /**
         * Met à jour le texte indiquant
         * le nombre d'œuvres visibles.
         *
         * @param {number} visibleCardsCount
         * @param {number} visibleSectionsCount
         * @param {string} selectedFilter
         */
        function updateResultsMessage(
            visibleCardsCount,
            visibleSectionsCount,
            selectedFilter
        ) {

            if (
                !resultsMessage
            ) {

                return;
            }


            if (
                visibleCardsCount ===
                0
            ) {

                resultsMessage.textContent =
                    "Aucune œuvre ne correspond à cette catégorie.";

                return;
            }


            const artworkWord =
                visibleCardsCount > 1
                    ? "œuvres"
                    : "œuvre";


            const displayedWord =
                visibleCardsCount > 1
                    ? "affichées"
                    : "affichée";


            if (
                selectedFilter ===
                "all"
            ) {

                const galleryWord =
                    visibleSectionsCount > 1
                        ? "galeries"
                        : "galerie";


                const distributedWord =
                    visibleCardsCount > 1
                        ? "réparties"
                        : "répartie";


                resultsMessage.textContent =
                    `${visibleCardsCount} ${artworkWord} ` +
                    `${distributedWord} dans ` +
                    `${visibleSectionsCount} ${galleryWord}.`;


                return;
            }


            const selectedOption =
                filterSelect.options[
                    filterSelect.selectedIndex
                ];


            const selectedLabel =
                selectedOption
                    ?.textContent
                    ?.trim() ||
                "cette catégorie";


            resultsMessage.textContent =
                `${visibleCardsCount} ${artworkWord} ` +
                `${displayedWord} pour « ${selectedLabel} ».`;
        }


        /* =================================================
           FILTRAGE
        ================================================== */

        /**
         * Applique le filtre sélectionné.
         */
        function applyGalleryFilter() {

            const selectedFilter =
                String(
                    filterSelect.value ||
                    "all"
                )
                    .trim()
                    .toLowerCase();


            let totalVisibleCards =
                0;

            let totalVisibleSections =
                0;


            gallerySections.forEach(
                section => {

                    const cards =
                        Array.from(
                            section.querySelectorAll(
                                ".artist-card[data-tags]"
                            )
                        );


                    let sectionVisibleCards =
                        0;


                    cards.forEach(
                        (
                            card,
                            cardIndex
                        ) => {

                            const shouldBeVisible =
                                cardMatchesFilter(
                                    card,
                                    selectedFilter
                                );


                            if (
                                shouldBeVisible
                            ) {

                                const delay =
                                    Math.min(
                                        cardIndex *
                                            CARD_DELAY,

                                        MAX_CARD_DELAY
                                    );


                                showCard(
                                    card,
                                    delay
                                );


                                sectionVisibleCards +=
                                    1;

                                totalVisibleCards +=
                                    1;

                            } else {

                                hideCard(
                                    card
                                );
                            }
                        }
                    );


                    /*
                     * Une galerie sans carte
                     * correspondante est repliée.
                     */

                    if (
                        sectionVisibleCards >
                        0
                    ) {

                        totalVisibleSections +=
                            1;


                        expandSection(
                            section
                        );

                    } else {

                        collapseSection(
                            section
                        );
                    }
                }
            );


            updateResultsMessage(
                totalVisibleCards,
                totalVisibleSections,
                selectedFilter
            );
        }


        /* =================================================
           REDIMENSIONNEMENT
        ================================================== */

        let resizeTimer =
            null;


        window.addEventListener(
            "resize",
            () => {

                window.clearTimeout(
                    resizeTimer
                );


                resizeTimer =
                    window.setTimeout(
                        () => {

                            gallerySections.forEach(
                                section => {

                                    if (
                                        !section.classList.contains(
                                            "is-collapsed"
                                        )
                                    ) {

                                        setSectionExpandedHeight(
                                            section
                                        );
                                    }
                                }
                            );

                        },
                        150
                    );
            }
        );


        /* =================================================
           CHARGEMENT DES IMAGES
        ================================================== */

        function initializeImageLoading() {

            const galleryImages =
                document.querySelectorAll(
                    ".credits-gallery-section img"
                );


            galleryImages.forEach(
                image => {

                    if (
                        image.complete
                    ) {

                        return;
                    }


                    image.addEventListener(
                        "load",
                        () => {

                            const section =
                                image.closest(
                                    ".credits-gallery-section"
                                );


                            if (
                                section &&
                                !section.classList.contains(
                                    "is-collapsed"
                                )
                            ) {

                                setSectionExpandedHeight(
                                    section
                                );
                            }
                        }
                    );
                }
            );
        }


        /* =================================================
           ÉVÉNEMENTS
        ================================================== */

        filterSelect.addEventListener(
            "change",
            applyGalleryFilter
        );


        /* =================================================
           INITIALISATION
        ================================================== */

        initializeCards();

        initializeImageLoading();


        /*
         * Au chargement :
         *
         * toutes les catégories sont affichées.
         */

        filterSelect.value =
            "all";


        gallerySections.forEach(
            section => {

                setSectionExpandedHeight(
                    section
                );
            }
        );


        applyGalleryFilter();
    }
);