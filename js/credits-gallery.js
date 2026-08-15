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


        /* =====================================================
           VÉRIFICATION
        ====================================================== */

        if (
            !source ||
            !generatedContainer ||
            !filter
        ) {

            console.error(
                "[Credits Gallery] Impossible d'initialiser la galerie : élément manquant."
            );

            return;
        }


        /* =====================================================
           ÉTAT
        ====================================================== */

        /*
         * Les cartes ne sont plus écrites directement
         * dans credits.html.
         *
         * credits-data.js :
         *
         * Supabase
         *    ↓
         * /api/gallery
         *    ↓
         * #credits-card-source
         *
         * Une fois terminé, credits-data.js déclenche :
         *
         * couaxia:credits-loaded
         */

        let originalCards =
            [];

        let creditsLoaded =
            false;


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
                    "Natsu, Cit et les compagnons de Couaxia.",

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
           CARTES SOURCES
        ====================================================== */

        /**
         * Relit les cartes créées par credits-data.js.
         */
        function refreshOriginalCards() {

            originalCards =
                Array.from(
                    source.querySelectorAll(
                        ".artist-card[data-tags]"
                    )
                );


            console.info(
                `[Credits Gallery] ${originalCards.length} carte(s) source récupérée(s).`
            );
        }


        /* =====================================================
           TAGS
        ====================================================== */

        /**
         * Retourne les tags d'une carte.
         *
         * data-tags="couaxia forme-3 collab"
         *
         * devient :
         *
         * [
         *     "couaxia",
         *     "forme-3",
         *     "collab"
         * ]
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
                .trim()
                .toLowerCase()
                .split(/\s+/)
                .filter(
                    Boolean
                );
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

            const normalizedTag =
                String(
                    tag ??
                    ""
                )
                    .trim()
                    .toLowerCase();


            if (
                !normalizedTag
            ) {

                return false;
            }


            return getTags(
                card
            )
                .includes(
                    normalizedTag
                );
        }


        /* =====================================================
           ID ART
        ====================================================== */

        /**
         * Retourne l'identifiant public
         * de l'œuvre.
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
            )
                .trim();
        }


        /* =====================================================
           FAVORIS
        ====================================================== */

        /**
         * Vérifie si une œuvre fait partie
         * des favoris du visiteur.
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


            if (
                !artId
            ) {

                return false;
            }


            /* =============================================
               API DE gallery-favorites.js
            ============================================== */

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


            /* =============================================
               FALLBACK LOCALSTORAGE
            ============================================== */

            try {

                const rawFavorites =
                    localStorage.getItem(
                        "couaxia-gallery-favorites"
                    );


                if (
                    !rawFavorites
                ) {

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


            } catch (
                error
            ) {

                console.error(
                    "[Credits Gallery] Impossible de lire les favoris :",
                    error
                );


                return false;
            }
        }


        /* =====================================================
           VIDÉOS
        ====================================================== */

        /**
         * Configure une vidéo clonée.
         *
         * Comportement voulu :
         *
         * - démarre automatiquement ;
         * - démarre toujours sans son ;
         * - tourne en boucle ;
         * - reste intégrée dans la page ;
         * - affiche les contrôles ;
         * - l'utilisateur peut activer le son.
         *
         * @param {HTMLVideoElement} video
         */
        function prepareVideo(
            video
        ) {

            if (
                !video
            ) {

                return;
            }


            /* =============================================
               SON COUPÉ PAR DÉFAUT
            ============================================== */

            video.muted =
                true;

            video.defaultMuted =
                true;


            video.setAttribute(
                "muted",
                ""
            );


            /*
             * Permet de savoir si l'utilisateur
             * a volontairement activé le son.
             */

            video.dataset.userUnmuted =
                "false";


            /* =============================================
               AUTOPLAY
            ============================================== */

            video.autoplay =
                true;


            video.setAttribute(
                "autoplay",
                ""
            );


            /* =============================================
               BOUCLE
            ============================================== */

            video.loop =
                true;


            video.setAttribute(
                "loop",
                ""
            );


            /* =============================================
               MOBILE
            ============================================== */

            video.playsInline =
                true;


            video.setAttribute(
                "playsinline",
                ""
            );


            /* =============================================
               CONTRÔLES
            ============================================== */

            video.controls =
                true;


            video.setAttribute(
                "controls",
                ""
            );


            /* =============================================
               PRÉCHARGEMENT
            ============================================== */

            video.preload =
                "metadata";


            /* =============================================
               DRAG
            ============================================== */

            video.setAttribute(
                "draggable",
                "false"
            );


            /* =============================================
               UTILISATEUR ACTIVE LE SON
            ============================================== */

            video.addEventListener(
                "volumechange",
                () => {

                    if (
                        !video.muted &&
                        video.volume >
                            0
                    ) {

                        video.dataset.userUnmuted =
                            "true";
                    }
                }
            );


            /* =============================================
               SÉCURITÉ AU DÉMARRAGE
            ============================================== */

            video.addEventListener(
                "play",
                () => {

                    /*
                     * Tant que le visiteur
                     * n'a pas lui-même activé le son,
                     * on garde le mute.
                     */

                    if (
                        video.dataset.userUnmuted !==
                        "true"
                    ) {

                        video.muted =
                            true;
                    }
                }
            );


            /* =============================================
               TENTATIVE DE LECTURE
            ============================================== */

            /*
             * Les navigateurs autorisent normalement
             * autoplay lorsque muted = true.
             *
             * Si le navigateur refuse malgré tout,
             * les contrôles restent disponibles.
             */

            const tryPlay =
                () => {

                    video.muted =
                        true;


                    const playPromise =
                        video.play();


                    if (
                        playPromise &&
                        typeof playPromise.catch ===
                            "function"
                    ) {

                        playPromise.catch(
                            () => {

                                /*
                                 * Autoplay refusé.
                                 *
                                 * Aucun problème :
                                 * les contrôles permettent
                                 * de lancer la vidéo.
                                 */
                            }
                        );
                    }
                };


            /*
             * Si les métadonnées sont déjà chargées,
             * on essaie immédiatement.
             */

            if (
                video.readyState >=
                1
            ) {

                tryPlay();

            } else {

                video.addEventListener(
                    "loadedmetadata",
                    tryPlay,
                    {
                        once:
                            true
                    }
                );
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


            /*
             * Évite de dupliquer un éventuel id HTML.
             */

            clone.removeAttribute(
                "id"
            );


            clone.removeAttribute(
                "hidden"
            );


            /*
             * Les scripts externes pourront
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

            clone.removeAttribute(
                "data-artist-ready"
            );


            /*
             * gallery-favorites.js recréera
             * lui-même son bouton.
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


            /* =============================================
               VIDÉOS CLONÉES
            ============================================== */

            /*
             * cloneNode(true) recopie le <video>,
             * mais l'état de lecture du média
             * n'est pas forcément repris.
             *
             * On configure donc chaque vidéo clonée
             * explicitement.
             */

            clone
                .querySelectorAll(
                    "video"
                )
                .forEach(
                    video => {

                        prepareVideo(
                            video
                        );
                    }
                );


            return clone;
        }


        /* =====================================================
           BANNIÈRE
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
           GRILLE
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
           SOUS-SECTION
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

                        let subsectionCards =
                            [];


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


                        } else if (
                            Array.isArray(
                                subsectionData.excludeTags
                            )
                        ) {

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
                                                        String(
                                                            tag
                                                        )
                                                            .toLowerCase()
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
           FILTRE CARTE
        ====================================================== */

        function filterCardForSelection(
            card,
            selectedFilter
        ) {

            /* =============================================
               TOUT
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
               TAG CLASSIQUE
            ============================================== */

            return cardHasTag(
                card,
                selectedFilter
            );
        }


        /* =====================================================
           GALERIES COMPATIBLES AVEC UN FILTRE
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
                "cita",
                "xaouc",
                "hylda"
            ];


            const streamFilters = [
                "stream",
                "decor",
                "décor",
                "overlay",
                "panel",
                "panels",
                "badge",
                "badges",
                "emote",
                "emotes",
                "animation",
                "reactive-discord"
            ];


            /* =============================================
               COUAXIA
            ============================================== */

            if (
                gallery.id ===
                    "couaxia" &&
                couaxiaFilters.includes(
                    selectedFilter
                )
            ) {

                return true;
            }


            /* =============================================
               COMPAGNONS
            ============================================== */

            if (
                gallery.id ===
                    "compagnons" &&
                companionFilters.includes(
                    selectedFilter
                )
            ) {

                return true;
            }


            /* =============================================
               STREAM
            ============================================== */

            if (
                gallery.id ===
                    "stream" &&
                streamFilters.includes(
                    selectedFilter
                )
            ) {

                return true;
            }


            /* =============================================
               GALERIE DIRECTE
            ============================================== */

            return (
                gallery.id ===
                selectedFilter
            );
        }


        /* =====================================================
           RÉSULTATS
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
               CHARGEMENT
            ============================================== */

            if (
                !creditsLoaded
            ) {

                results.textContent =
                    "";

                return;
            }


            /* =============================================
               GALERIE VIDE
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

                const selectedOption =
                    filter.options[
                        filter.selectedIndex
                    ];


                const selectedLabel =
                    selectedOption
                        ?.textContent
                        ?.trim();


                results.textContent =
                    selectedLabel
                        ? `${cardCount} ${cardWord} pour « ${selectedLabel} ».`
                        : `${cardCount} ${cardWord}.`;
            }
        }


        /* =====================================================
           ÉVÉNEMENT — CARTES RENDUES
        ====================================================== */

        function dispatchCreditsRendered() {

            const cards =
                generatedContainer
                    .querySelectorAll(
                        ".artist-card"
                    );


            document.dispatchEvent(
                new CustomEvent(
                    "couaxia:credits-rendered",
                    {
                        detail: {

                            count:
                                cards.length

                        }
                    }
                )
            );


            console.info(
                `[Credits Gallery] ${cards.length} carte(s) affichée(s).`
            );
        }


        /* =====================================================
           RENDU
        ====================================================== */

        function renderGalleries(
            selectedFilter =
                "all"
        ) {

            if (
                !creditsLoaded
            ) {

                return;
            }


            const normalizedFilter =
                String(
                    selectedFilter ||
                    "all"
                )
                    .trim()
                    .toLowerCase();


            generatedContainer
                .replaceChildren();


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
                    normalizedFilter
                );


                dispatchCreditsRendered();


                return;
            }


            /* =================================================
               FAVORIS
            ================================================= */

            if (
                normalizedFilter ===
                "favorites"
            ) {

                const favoriteCards =
                    originalCards.filter(
                        card =>
                            isFavoriteCard(
                                card
                            )
                    );


                /* =============================================
                   DÉDOUBLONNAGE
                ============================================== */

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
                            !artId ||
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


                if (
                    uniqueFavoriteCards.length >
                    0
                ) {

                    const favoritesGallery = {

                        id:
                            "favorites",

                        title:
                            "♥ Mes favoris",

                        description:
                            "Toutes les œuvres que tu as ajoutées à tes favoris."

                    };


                    generatedContainer.appendChild(
                        createStandardGallery(
                            favoritesGallery,
                            uniqueFavoriteCards
                        )
                    );


                    displayedCardCount =
                        uniqueFavoriteCards.length;


                    displayedGalleryCount =
                        1;
                }


                updateResults(
                    displayedCardCount,
                    displayedGalleryCount,
                    "favorites"
                );


                dispatchCreditsRendered();


                return;
            }


            /* =================================================
               GALERIES NORMALES
            ================================================= */

            galleries.forEach(
                gallery => {

                    /* =========================================
                       GALERIE COMPATIBLE ?
                    ========================================== */

                    if (
                        !shouldDisplayGallery(
                            gallery,
                            normalizedFilter
                        )
                    ) {

                        return;
                    }


                    /* =========================================
                       CARTES DE LA GALERIE
                    ========================================== */

                    let galleryCards =
                        originalCards.filter(
                            card =>
                                cardHasTag(
                                    card,
                                    gallery.tag
                                )
                        );


                    /* =========================================
                       FILTRE SUPPLÉMENTAIRE
                    ========================================== */

                    if (
                        normalizedFilter !==
                        "all"
                    ) {

                        galleryCards =
                            galleryCards.filter(
                                card =>
                                    filterCardForSelection(
                                        card,
                                        normalizedFilter
                                    )
                            );
                    }


                    if (
                        galleryCards.length ===
                        0
                    ) {

                        return;
                    }


                    /* =========================================
                       CRÉATION
                    ========================================== */

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


            /* =================================================
               RÉSULTAT
            ================================================= */

            updateResults(
                displayedCardCount,
                displayedGalleryCount,
                normalizedFilter
            );


            /* =================================================
               INFORMER LES AUTRES SCRIPTS
            ================================================= */

            dispatchCreditsRendered();
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
           FAVORIS MODIFIÉS
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
                 * Si la galerie Favoris est ouverte,
                 * on la reconstruit immédiatement.
                 */

                if (
                    filter.value ===
                    "favorites"
                ) {

                    renderGalleries(
                        "favorites"
                    );
                }
            }
        );


        /* =====================================================
           DONNÉES SUPABASE CHARGÉES
        ====================================================== */

        document.addEventListener(
            "couaxia:credits-loaded",
            event => {

                console.info(
                    "[Credits Gallery] Données Supabase reçues.",
                    event.detail
                );


                /*
                 * Les cartes existent désormais
                 * dans #credits-card-source.
                 */

                refreshOriginalCards();


                creditsLoaded =
                    true;


                /*
                 * Premier rendu.
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
         * Si credits-data.js s'est exécuté avant
         * credits-gallery.js ou si des cartes sont
         * déjà présentes, on peut quand même démarrer.
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
           API PUBLIQUE JS
        ====================================================== */

        window.CouaxiaCreditsGallery = {

            /**
             * Force la reconstruction
             * de la galerie.
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
             * Recharge les données Supabase,
             * si credits-data.js est disponible.
             */
            async reload() {

                if (
                    window.CouaxiaCreditsData &&
                    typeof window
                        .CouaxiaCreditsData
                        .reload ===
                        "function"
                ) {

                    await window
                        .CouaxiaCreditsData
                        .reload();
                }
            },


            /**
             * Retourne le nombre
             * d'œuvres sources.
             */
            getCount() {

                return originalCards.length;
            },


            /**
             * Indique si les données
             * Supabase ont été chargées.
             */
            isLoaded() {

                return creditsLoaded;
            },


            /**
             * Retourne le filtre actuel.
             */
            getFilter() {

                return (
                    filter.value ||
                    "all"
                );
            },


            /**
             * Change le filtre par JS.
             *
             * Exemple :
             *
             * CouaxiaCreditsGallery.setFilter("fanart");
             */
            setFilter(
                value
            ) {

                const newValue =
                    String(
                        value ||
                        "all"
                    )
                        .trim()
                        .toLowerCase();


                const optionExists =
                    Array.from(
                        filter.options
                    )
                        .some(
                            option =>
                                option.value ===
                                newValue
                        );


                if (
                    !optionExists
                ) {

                    console.warn(
                        `[Credits Gallery] Filtre inconnu : ${newValue}`
                    );

                    return;
                }


                filter.value =
                    newValue;


                if (
                    creditsLoaded
                ) {

                    renderGalleries(
                        newValue
                    );
                }
            }

        };
    }
);