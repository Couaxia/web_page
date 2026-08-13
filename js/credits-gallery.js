"use strict";

/* =========================================================
   GALERIES DES CRÉDITS — COUAXIA
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =====================================================
           ÉLÉMENTS
        ====================================================== */

        const source =
            document.getElementById(
                "credits-card-source"
            );

        const generatedContainer =
            document.getElementById(
                "credits-generated-galleries"
            );

        const filter =
            document.getElementById(
                "credits-category-filter"
            );

        const results =
            document.getElementById(
                "credits-global-results"
            );


        if (
            !source ||
            !generatedContainer ||
            !filter
        ) {

            console.error(
                "[Crédits] Impossible d'initialiser la galerie : élément manquant."
            );

            return;
        }


        /* =====================================================
           ÉTAT
        ====================================================== */

        /*
         * IMPORTANT :
         *
         * Avant Supabase, les cartes existaient déjà
         * dans credits.html.
         *
         * Maintenant credits-data.js les ajoute
         * après avoir appelé /api/gallery.
         *
         * Cette variable sera donc remplie
         * APRÈS couaxia:credits-loaded.
         */

        let originalCards = [];

        let creditsLoaded = false;


        /* =====================================================
           CONFIGURATION DES GALERIES
        ====================================================== */

        const galleries = [

            /* =================================================
               COUAXIA
            ================================================= */

            {
                id:
                    "couaxia",

                title:
                    "🌌 Couaxia",

                description:
                    "Les différentes formes et illustrations de Couaxia.",

                tag:
                    "couaxia",

                subsections: [

                    {
                        id:
                            "forme-2",

                        title:
                            "✨ Forme 2",

                        tag:
                            "forme-2"
                    },

                    {
                        id:
                            "forme-3",

                        title:
                            "🌙 Forme 3",

                        tag:
                            "forme-3"
                    },

                    {
                        id:
                            "couaxia-other",

                        title:
                            "💜 Autres illustrations",

                        excludeTags: [
                            "forme-2",
                            "forme-3"
                        ]
                    }

                ]
            },


            /* =================================================
               COMPAGNONS
            ================================================= */

            {
                id:
                    "compagnons",

                title:
                    "🐉 Compagnons",

                description:
                    "Natsu, Cita et Hylda qui sont les compagnons de Couaxia.",

                tag:
                    "compagnons"
            },


            /* =================================================
               STREAM
            ================================================= */

            {
                id:
                    "stream",

                title:
                    "🎬 Stream",

                description:
                    "Emotes, badges, panels, animations et créations du stream.",

                tag:
                    "stream"
            },


            /* =================================================
               COLLAB
            ================================================= */

            {
                id:
                    "collab",

                title:
                    "🤝 Collabs",

                description:
                    "Les illustrations réalisées avec d'autres créateurs et VTubers.",

                tag:
                    "collab"
            },


            /* =================================================
               COUPLE
            ================================================= */

            {
                id:
                    "couple",

                title:
                    "💕 Couple",

                description:
                    "Les illustrations de couple de Couaxia.",

                tag:
                    "couple"
            },


            /* =================================================
               FANART
            ================================================= */

            {
                id:
                    "fanart",

                title:
                    "🎨 Fan Arts",

                description:
                    "Les magnifiques fan arts réalisés pour Couaxia.",

                tag:
                    "fanart"
            }

        ];


        /* =====================================================
           RÉCUPÉRATION DES CARTES SUPABASE
        ====================================================== */

        function refreshOriginalCards() {

            originalCards =
                Array.from(
                    source.querySelectorAll(
                        ".artist-card[data-tags]"
                    )
                );


            console.info(
                `[Crédits] ${originalCards.length} carte(s) récupérée(s) depuis la source.`
            );
        }


        /* =====================================================
           TAGS
        ====================================================== */

        /**
         * Retourne les tags d'une carte.
         *
         * @param {HTMLElement} card
         * @returns {string[]}
         */
        function getTags(
            card
        ) {

            return String(
                card.dataset.tags ||
                ""
            )
                .toLowerCase()
                .split(/\s+/)
                .filter(Boolean);
        }


        /**
         * Vérifie si une carte possède un tag.
         *
         * @param {HTMLElement} card
         * @param {string} tag
         * @returns {boolean}
         */
        function cardHasTag(
            card,
            tag
        ) {

            return getTags(
                card
            )
                .includes(
                    String(
                        tag
                    )
                        .toLowerCase()
                );
        }


        /* =====================================================
           IDENTIFIANT ART
        ====================================================== */

        /**
         * Retourne l'identifiant unique d'une œuvre.
         *
         * @param {HTMLElement} card
         * @returns {string}
         */
        function getArtId(
            card
        ) {

            return String(
                card.dataset.artId ||
                ""
            ).trim();
        }


        /* =====================================================
           FAVORIS
        ====================================================== */

        /**
         * Vérifie si une carte est favorite.
         *
         * @param {HTMLElement} card
         * @returns {boolean}
         */
        function isFavoriteCard(
            card
        ) {

            const artId =
                getArtId(
                    card
                );


            if (!artId) {
                return false;
            }


            /*
             * Méthode principale :
             * gallery-favorites.js
             */

            if (
                window.CouaxiaGalleryFavorites &&
                typeof window
                    .CouaxiaGalleryFavorites
                    .isFavorite ===
                    "function"
            ) {

                return Boolean(
                    window
                        .CouaxiaGalleryFavorites
                        .isFavorite(
                            artId
                        )
                );
            }


            /*
             * Solution de secours :
             * localStorage.
             */

            try {

                const rawFavorites =
                    localStorage.getItem(
                        "couaxia-gallery-favorites"
                    );


                if (!rawFavorites) {
                    return false;
                }


                const favorites =
                    JSON.parse(
                        rawFavorites
                    );


                return (
                    Array.isArray(
                        favorites
                    ) &&
                    favorites.includes(
                        artId
                    )
                );


            } catch (error) {

                console.error(
                    "[Crédits] Impossible de lire les favoris :",
                    error
                );

                return false;
            }
        }


        /* =====================================================
           CLONAGE DES CARTES
        ====================================================== */

        /**
         * Clone une carte provenant de
         * #credits-card-source.
         *
         * @param {HTMLElement} card
         * @returns {HTMLElement}
         */
        function cloneCard(
            card
        ) {

            const clone =
                card.cloneNode(
                    true
                );


            clone.removeAttribute(
                "id"
            );

            clone.removeAttribute(
                "hidden"
            );


            /*
             * Les scripts annexes doivent pouvoir
             * réinitialiser le clone.
             */

            clone.removeAttribute(
                "data-favorite-ready"
            );

            clone.removeAttribute(
                "data-watermark-ready"
            );

            clone.removeAttribute(
                "data-sensitive-ready"
            );


            /*
             * Si un ancien bouton favori se trouve
             * dans la source, on le retire.
             *
             * gallery-favorites.js le recréera.
             */

            clone
                .querySelectorAll(
                    ".gallery-favorite-button"
                )
                .forEach(
                    button => {

                        button.remove();
                    }
                );


            return clone;
        }


        /* =====================================================
           BANNIÈRES
        ====================================================== */

        function createBanner(
            gallery
        ) {

            const header =
                document.createElement(
                    "header"
                );


            header.className =
                "credits-banner";


            const title =
                document.createElement(
                    "h2"
                );

            title.textContent =
                gallery.title;


            const description =
                document.createElement(
                    "p"
                );

            description.textContent =
                gallery.description;


            header.appendChild(
                title
            );

            header.appendChild(
                description
            );


            return header;
        }


        /* =====================================================
           GRILLES
        ====================================================== */

        function createGrid(
            cards
        ) {

            const grid =
                document.createElement(
                    "div"
                );


            grid.className =
                "credits-grid";


            cards.forEach(
                card => {

                    grid.appendChild(
                        cloneCard(
                            card
                        )
                    );
                }
            );


            return grid;
        }


        /* =====================================================
           SOUS-SECTIONS
        ====================================================== */

        function createSubsection(
            title,
            cards,
            subsectionId
        ) {

            if (
                cards.length ===
                0
            ) {

                return null;
            }


            const subsection =
                document.createElement(
                    "section"
                );


            subsection.className =
                "credits-subsection";

            subsection.dataset.subsection =
                subsectionId;


            const heading =
                document.createElement(
                    "h3"
                );


            heading.className =
                "credits-subtitle";

            heading.textContent =
                title;


            subsection.appendChild(
                heading
            );


            subsection.appendChild(
                createGrid(
                    cards
                )
            );


            return subsection;
        }


        /* =====================================================
           GALERIE COUAXIA
        ====================================================== */

        function createCouaxiaGallery(
            gallery,
            cards
        ) {

            const section =
                document.createElement(
                    "section"
                );


            section.className =
                "credits-gallery-section";

            section.dataset.gallery =
                gallery.id;


            section.appendChild(
                createBanner(
                    gallery
                )
            );


            gallery.subsections
                .forEach(
                    subsectionData => {

                        let subsectionCards;


                        /* =====================================
                           SOUS-SECTION AVEC TAG
                        ====================================== */

                        if (
                            subsectionData.tag
                        ) {

                            subsectionCards =
                                cards.filter(
                                    card =>
                                        cardHasTag(
                                            card,
                                            subsectionData.tag
                                        )
                                );

                        } else {

                            /* =================================
                               AUTRES ILLUSTRATIONS
                            ================================== */

                            subsectionCards =
                                cards.filter(
                                    card => {

                                        const tags =
                                            getTags(
                                                card
                                            );


                                        return !subsectionData
                                            .excludeTags
                                            .some(
                                                tag =>
                                                    tags.includes(
                                                        tag
                                                    )
                                            );
                                    }
                                );
                        }


                        const subsection =
                            createSubsection(
                                subsectionData.title,
                                subsectionCards,
                                subsectionData.id
                            );


                        if (
                            subsection
                        ) {

                            section.appendChild(
                                subsection
                            );
                        }
                    }
                );


            return section;
        }


        /* =====================================================
           GALERIE STANDARD
        ====================================================== */

        function createStandardGallery(
            gallery,
            cards
        ) {

            const section =
                document.createElement(
                    "section"
                );


            section.className =
                "credits-gallery-section";

            section.dataset.gallery =
                gallery.id;


            section.appendChild(
                createBanner(
                    gallery
                )
            );


            section.appendChild(
                createGrid(
                    cards
                )
            );


            return section;
        }


        /* =====================================================
           FILTRAGE D'UNE CARTE
        ====================================================== */

        function filterCardForSelection(
            card,
            selectedFilter
        ) {

            /* =============================================
               TOUTES LES ŒUVRES
            ============================================== */

            if (
                selectedFilter ===
                "all"
            ) {

                return true;
            }


            /* =============================================
               FAVORIS
            ============================================== */

            if (
                selectedFilter ===
                "favorites"
            ) {

                return isFavoriteCard(
                    card
                );
            }


            /* =============================================
               FILTRES NORMAUX
            ============================================== */

            return cardHasTag(
                card,
                selectedFilter
            );
        }


        /* =====================================================
           GALERIES À AFFICHER
        ====================================================== */

        function shouldDisplayGallery(
            gallery,
            selectedFilter
        ) {

            if (
                selectedFilter ===
                "all"
            ) {

                return true;
            }


            const couaxiaFilters = [
                "couaxia",
                "forme-2",
                "forme-3"
            ];


            const companionFilters = [
                "compagnons",
                "natsu",
                "cit",
                "xaouc"
            ];


            const streamFilters = [
                "stream",
                "decor",
                "overlay",
                "panel",
                "badge",
                "emote",
                "animation",
                "reactive-discord"
            ];


            if (
                gallery.id ===
                    "couaxia" &&
                couaxiaFilters.includes(
                    selectedFilter
                )
            ) {

                return true;
            }


            if (
                gallery.id ===
                    "compagnons" &&
                companionFilters.includes(
                    selectedFilter
                )
            ) {

                return true;
            }


            if (
                gallery.id ===
                    "stream" &&
                streamFilters.includes(
                    selectedFilter
                )
            ) {

                return true;
            }


            return (
                gallery.id ===
                selectedFilter
            );
        }


        /* =====================================================
           TEXTE DES RÉSULTATS
        ====================================================== */

        function updateResults(
            cardCount,
            galleryCount,
            selectedFilter
        ) {

            if (
                !results
            ) {

                return;
            }


            /* =============================================
               CHARGEMENT PAS TERMINÉ
            ============================================== */

            if (
                !creditsLoaded
            ) {

                results.textContent =
                    "";

                return;
            }


            /* =============================================
               AUCUNE ŒUVRE DANS LA BASE
            ============================================== */

            if (
                originalCards.length ===
                0
            ) {

                results.textContent =
                    "Aucune œuvre n'est disponible pour le moment.";

                return;
            }


            /* =============================================
               AUCUN FAVORI
            ============================================== */

            if (
                selectedFilter ===
                    "favorites" &&
                cardCount ===
                    0
            ) {

                results.textContent =
                    "Aucune œuvre favorite pour le moment. Clique sur ♡ pour en ajouter !";

                return;
            }


            /* =============================================
               FAVORIS
            ============================================== */

            if (
                selectedFilter ===
                "favorites"
            ) {

                results.textContent =
                    `${cardCount} œuvre${
                        cardCount > 1
                            ? "s"
                            : ""
                    } dans tes favoris 💜`;

                return;
            }


            /* =============================================
               AUCUN RÉSULTAT
            ============================================== */

            if (
                cardCount ===
                0
            ) {

                results.textContent =
                    "Aucune œuvre ne correspond à ce filtre.";

                return;
            }


            const cardWord =
                cardCount > 1
                    ? "œuvres affichées"
                    : "œuvre affichée";


            const galleryWord =
                galleryCount > 1
                    ? "galeries"
                    : "galerie";


            if (
                selectedFilter ===
                "all"
            ) {

                results.textContent =
                    `${cardCount} ${cardWord} dans ${galleryCount} ${galleryWord}.`;

            } else {

                results.textContent =
                    `${cardCount} ${cardWord}.`;
            }
        }


        /* =====================================================
           INITIALISATION DES CARTES GÉNÉRÉES
        ====================================================== */

        function initializeGeneratedCards() {

            /*
             * Les autres scripts :
             *
             * - gallery-favorites.js
             * - watermark.js
             * - sensitive-gallery.js
             *
             * utilisent leurs MutationObserver.
             *
             * Ils détecteront donc automatiquement
             * les cartes créées ici.
             */

            document.dispatchEvent(
                new CustomEvent(
                    "couaxia:credits-rendered",
                    {
                        detail: {

                            count:
                                generatedContainer
                                    .querySelectorAll(
                                        ".artist-card"
                                    )
                                    .length
                        }
                    }
                )
            );
        }


        /* =====================================================
           RENDU DES GALERIES
        ====================================================== */

        function renderGalleries(
            selectedFilter = "all"
        ) {

            /*
             * On ne génère rien tant que
             * credits-data.js n'a pas terminé.
             */

            if (
                !creditsLoaded
            ) {

                return;
            }


            generatedContainer.innerHTML =
                "";


            let displayedCardCount =
                0;

            let displayedGalleryCount =
                0;


            /* =================================================
               AUCUNE CARTE
            ================================================= */

            if (
                originalCards.length ===
                0
            ) {

                updateResults(
                    0,
                    0,
                    selectedFilter
                );

                initializeGeneratedCards();

                return;
            }


            /* =================================================
               FAVORIS
            ================================================= */

            if (
                selectedFilter ===
                "favorites"
            ) {

                const favoriteCards =
                    originalCards.filter(
                        card =>
                            isFavoriteCard(
                                card
                            )
                    );


                if (
                    favoriteCards.length ===
                    0
                ) {

                    updateResults(
                        0,
                        0,
                        "favorites"
                    );

                    initializeGeneratedCards();

                    return;
                }


                /*
                 * Évite les doublons basés
                 * sur data-art-id.
                 */

                const uniqueFavoriteCards =
                    [];

                const usedArtIds =
                    new Set();


                favoriteCards.forEach(
                    card => {

                        const artId =
                            getArtId(
                                card
                            );


                        if (
                            !artId
                        ) {

                            return;
                        }


                        if (
                            usedArtIds.has(
                                artId
                            )
                        ) {

                            return;
                        }


                        usedArtIds.add(
                            artId
                        );


                        uniqueFavoriteCards.push(
                            card
                        );
                    }
                );


                const favoritesGallery = {

                    id:
                        "favorites",

                    title:
                        "♥ Mes favoris",

                    description:
                        "Toutes les œuvres que tu as ajoutées à tes favoris."
                };


                const favoritesSection =
                    createStandardGallery(
                        favoritesGallery,
                        uniqueFavoriteCards
                    );


                generatedContainer.appendChild(
                    favoritesSection
                );


                displayedCardCount =
                    uniqueFavoriteCards.length;

                displayedGalleryCount =
                    1;


                updateResults(
                    displayedCardCount,
                    displayedGalleryCount,
                    "favorites"
                );


                initializeGeneratedCards();

                return;
            }


            /* =================================================
               GALERIES NORMALES
            ================================================= */

            galleries.forEach(
                gallery => {

                    if (
                        !shouldDisplayGallery(
                            gallery,
                            selectedFilter
                        )
                    ) {

                        return;
                    }


                    /*
                     * Cartes appartenant
                     * à cette galerie.
                     */

                    let galleryCards =
                        originalCards.filter(
                            card =>
                                cardHasTag(
                                    card,
                                    gallery.tag
                                )
                        );


                    /*
                     * Application du filtre.
                     */

                    if (
                        selectedFilter !==
                        "all"
                    ) {

                        galleryCards =
                            galleryCards.filter(
                                card =>
                                    filterCardForSelection(
                                        card,
                                        selectedFilter
                                    )
                            );
                    }


                    if (
                        galleryCards.length ===
                        0
                    ) {

                        return;
                    }


                    let galleryElement;


                    if (
                        gallery.id ===
                        "couaxia"
                    ) {

                        galleryElement =
                            createCouaxiaGallery(
                                gallery,
                                galleryCards
                            );

                    } else {

                        galleryElement =
                            createStandardGallery(
                                gallery,
                                galleryCards
                            );
                    }


                    generatedContainer.appendChild(
                        galleryElement
                    );


                    displayedCardCount +=
                        galleryCards.length;

                    displayedGalleryCount +=
                        1;
                }
            );


            updateResults(
                displayedCardCount,
                displayedGalleryCount,
                selectedFilter
            );


            initializeGeneratedCards();
        }


        /* =====================================================
           CHANGEMENT DU FILTRE
        ====================================================== */

        filter.addEventListener(
            "change",
            () => {

                if (
                    !creditsLoaded
                ) {

                    return;
                }


                renderGalleries(
                    filter.value ||
                    "all"
                );
            }
        );


        /* =====================================================
           MISE À JOUR DES FAVORIS
        ====================================================== */

        document.addEventListener(
            "couaxia:gallery-favorites-changed",
            () => {

                if (
                    !creditsLoaded
                ) {

                    return;
                }


                /*
                 * Si on regarde actuellement
                 * la galerie Favoris,
                 * on la met immédiatement à jour.
                 */

                if (
                    filter.value !==
                    "favorites"
                ) {

                    return;
                }


                renderGalleries(
                    "favorites"
                );
            }
        );


        /* =====================================================
           DONNÉES SUPABASE CHARGÉES
        ====================================================== */

        document.addEventListener(
            "couaxia:credits-loaded",
            event => {

                console.info(
                    "[Crédits] Données Supabase reçues.",
                    event.detail
                );


                /*
                 * On relit maintenant les cartes
                 * créées par credits-data.js.
                 */

                refreshOriginalCards();


                creditsLoaded =
                    true;


                /*
                 * Premier véritable affichage.
                 */

                renderGalleries(
                    filter.value ||
                    "all"
                );
            }
        );


        /* =====================================================
           CAS DE SECOURS
        ====================================================== */

        /*
         * Normalement credits-data.js déclenche
         * couaxia:credits-loaded.
         *
         * Mais si les cartes étaient déjà présentes
         * avant l'exécution de ce script,
         * on peut quand même initialiser la galerie.
         */

        const existingCards =
            source.querySelectorAll(
                ".artist-card[data-tags]"
            );


        if (
            existingCards.length >
            0
        ) {

            refreshOriginalCards();

            creditsLoaded =
                true;


            renderGalleries(
                filter.value ||
                "all"
            );
        }


        /* =====================================================
           API PUBLIQUE
        ====================================================== */

        window.CouaxiaCreditsGallery = {

            /**
             * Force un nouveau rendu.
             */
            render() {

                if (
                    !creditsLoaded
                ) {

                    return;
                }


                refreshOriginalCards();


                renderGalleries(
                    filter.value ||
                    "all"
                );
            },


            /**
             * Retourne le nombre de cartes sources.
             */
            getCount() {

                return originalCards.length;
            },


            /**
             * Indique si les données sont chargées.
             */
            isLoaded() {

                return creditsLoaded;
            }

        };

    }
);