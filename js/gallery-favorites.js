"use strict";

/* =========================================================
   FAVORIS DE LA GALERIE — COUAXIA
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =====================================================
           CONFIGURATION
        ====================================================== */

        const STORAGE_KEY =
            "couaxia-gallery-favorites";


        /* =====================================================
           STOCKAGE
        ====================================================== */

        /**
         * Lit les favoris enregistrés.
         *
         * @returns {string[]}
         */
        function getStoredFavorites() {

            try {

                const rawValue =
                    localStorage.getItem(
                        STORAGE_KEY
                    );


                if (
                    !rawValue
                ) {

                    return [];
                }


                const parsedValue =
                    JSON.parse(
                        rawValue
                    );


                if (
                    !Array.isArray(
                        parsedValue
                    )
                ) {

                    return [];
                }


                /*
                 * Nettoyage + suppression
                 * des doublons.
                 */

                return [
                    ...new Set(
                        parsedValue
                            .map(
                                value =>
                                    String(
                                        value ?? ""
                                    )
                                        .trim()
                            )
                            .filter(
                                Boolean
                            )
                    )
                ];


            } catch (
                error
            ) {

                console.error(
                    "[Favoris galerie] Impossible de lire les favoris :",
                    error
                );


                return [];
            }
        }


        /**
         * Enregistre les favoris.
         *
         * @param {string[]} favorites
         */
        function saveFavorites(
            favorites
        ) {

            try {

                const normalizedFavorites =
                    [
                        ...new Set(
                            favorites
                                .map(
                                    value =>
                                        String(
                                            value ?? ""
                                        )
                                            .trim()
                                )
                                .filter(
                                    Boolean
                                )
                        )
                    ];


                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(
                        normalizedFavorites
                    )
                );


            } catch (
                error
            ) {

                console.error(
                    "[Favoris galerie] Impossible d'enregistrer les favoris :",
                    error
                );
            }
        }


        /* =====================================================
           CARTE
        ====================================================== */

        /**
         * Retourne l'identifiant public
         * d'une œuvre.
         *
         * @param {HTMLElement} card
         * @returns {string}
         */
        function getArtId(
            card
        ) {

            return String(
                card.dataset.artId ??
                ""
            )
                .trim();
        }


        /**
         * Vérifie si les favoris sont
         * autorisés pour cette carte.
         *
         * Supabase :
         *
         * favorite_enabled = true
         *
         * devient :
         *
         * data-favorite-enabled="true"
         *
         * @param {HTMLElement} card
         * @returns {boolean}
         */
        function isFavoriteEnabled(
            card
        ) {

            /*
             * Par défaut on considère que
             * les favoris sont activés.
             *
             * Cela garde la compatibilité avec
             * d'anciennes cartes HTML.
             */

            const value =
                card.dataset
                    .favoriteEnabled;


            if (
                value === undefined
            ) {

                return true;
            }


            return String(
                value
            )
                .trim()
                .toLowerCase() !==
                "false";
        }


        /* =====================================================
           FAVORIS
        ====================================================== */

        /**
         * Vérifie si une œuvre est favorite.
         *
         * @param {string} artId
         * @returns {boolean}
         */
        function isFavorite(
            artId
        ) {

            const normalizedArtId =
                String(
                    artId ?? ""
                )
                    .trim();


            if (
                !normalizedArtId
            ) {

                return false;
            }


            return getStoredFavorites()
                .includes(
                    normalizedArtId
                );
        }


        /* =====================================================
           MASCOTTE
        ====================================================== */

        /**
         * Affiche une phrase via la mascotte.
         *
         * @param {string[]} messages
         */
        function showMascotteMessage(
            messages
        ) {

            if (
                !Array.isArray(
                    messages
                ) ||
                messages.length ===
                    0
            ) {

                return;
            }


            const randomIndex =
                Math.floor(
                    Math.random() *
                    messages.length
                );


            const message =
                messages[
                    randomIndex
                ];


            if (
                typeof window
                    .showMascotteMessage ===
                "function"
            ) {

                window.showMascotteMessage(
                    message,
                    3500
                );


                return;
            }


            if (
                typeof window
                    .showMessage ===
                "function"
            ) {

                window.showMessage(
                    message,
                    3500
                );
            }
        }


        const FAVORITE_ADDED_MESSAGES = [

            "Hop ! Dans tes favoris 💜",

            "Bon choix !",

            "Je savais que celle-là te plairait !",

            "Celle-ci mérite sa place dans tes favoris ✨",

            "Je la garde bien au chaud pour toi 💜"

        ];


        const FAVORITE_REMOVED_MESSAGES = [

            "QUOI ?! Tu ne l'aimes plus ?! 😭",

            "Bon... je vais faire comme si je n'avais rien vu.",

            "Retirée des favoris... quelle tristesse 😭",

            "Tu changes vite d'avis toi 👀",

            "D'accord... je la retire 😔"

        ];


        /* =====================================================
           BOUTON FAVORI
        ====================================================== */

        /**
         * Crée le bouton cœur.
         *
         * @param {string} artId
         * @returns {HTMLButtonElement}
         */
        function createFavoriteButton(
            artId
        ) {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "gallery-favorite-button";


            button.dataset.artId =
                artId;


            button.setAttribute(
                "aria-label",
                "Ajouter cette œuvre aux favoris"
            );


            button.setAttribute(
                "aria-pressed",
                "false"
            );


            button.setAttribute(
                "title",
                "Ajouter aux favoris"
            );


            const icon =
                document.createElement(
                    "span"
                );


            icon.className =
                "gallery-favorite-icon";


            icon.setAttribute(
                "aria-hidden",
                "true"
            );


            icon.textContent =
                "♡";


            button.appendChild(
                icon
            );


            return button;
        }


        /**
         * Met à jour l'apparence
         * du bouton cœur.
         *
         * @param {HTMLButtonElement} button
         * @param {boolean} favorite
         */
        function updateFavoriteButton(
            button,
            favorite
        ) {

            button.classList.toggle(
                "is-favorite",
                favorite
            );


            const icon =
                button.querySelector(
                    ".gallery-favorite-icon"
                );


            if (
                icon
            ) {

                icon.textContent =
                    favorite
                        ? "♥"
                        : "♡";
            }


            button.setAttribute(
                "aria-pressed",
                String(
                    favorite
                )
            );


            button.setAttribute(
                "aria-label",
                favorite
                    ? "Retirer cette œuvre des favoris"
                    : "Ajouter cette œuvre aux favoris"
            );


            button.setAttribute(
                "title",
                favorite
                    ? "Retirer des favoris"
                    : "Ajouter aux favoris"
            );
        }


        /* =====================================================
           SYNCHRONISATION D'UNE ŒUVRE
        ====================================================== */

        /**
         * Synchronise toutes les copies
         * d'une même œuvre.
         *
         * Une œuvre peut apparaître dans :
         *
         * Couaxia
         * Collab
         * Couple
         * Favoris
         *
         * mais elles partagent toutes
         * le même data-art-id.
         *
         * @param {string} artId
         */
        function syncArtworkFavorites(
            artId
        ) {

            const normalizedArtId =
                String(
                    artId ?? ""
                )
                    .trim();


            if (
                !normalizedArtId
            ) {

                return;
            }


            const favorite =
                isFavorite(
                    normalizedArtId
                );


            document
                .querySelectorAll(
                    `.artist-card[data-art-id="${CSS.escape(
                        normalizedArtId
                    )}"]`
                )
                .forEach(
                    card => {

                        const enabled =
                            isFavoriteEnabled(
                                card
                            );


                        /*
                         * Une œuvre pour laquelle
                         * favorite_enabled = false
                         * ne doit jamais afficher
                         * l'état favori.
                         */

                        card.classList.toggle(
                            "is-favorite",
                            enabled &&
                            favorite
                        );


                        const button =
                            card.querySelector(
                                ".gallery-favorite-button"
                            );


                        if (
                            button instanceof
                            HTMLButtonElement
                        ) {

                            if (
                                enabled
                            ) {

                                updateFavoriteButton(
                                    button,
                                    favorite
                                );

                            } else {

                                button.remove();
                            }
                        }
                    }
                );
        }


        /**
         * Synchronise toutes les œuvres.
         */
        function syncAllFavorites() {

            const artIds =
                new Set();


            document
                .querySelectorAll(
                    ".artist-card[data-art-id]"
                )
                .forEach(
                    card => {

                        const artId =
                            getArtId(
                                card
                            );


                        if (
                            artId
                        ) {

                            artIds.add(
                                artId
                            );
                        }
                    }
                );


            artIds.forEach(
                artId => {

                    syncArtworkFavorites(
                        artId
                    );
                }
            );
        }


        /* =====================================================
           AJOUT / RETRAIT
        ====================================================== */

        /**
         * Bascule l'état favori
         * d'une œuvre.
         *
         * @param {string} artId
         */
        function toggleFavorite(
            artId
        ) {

            const normalizedArtId =
                String(
                    artId ?? ""
                )
                    .trim();


            if (
                !normalizedArtId
            ) {

                return;
            }


            const favorites =
                getStoredFavorites();


            const index =
                favorites.indexOf(
                    normalizedArtId
                );


            let favorite;


            if (
                index ===
                -1
            ) {

                favorites.push(
                    normalizedArtId
                );


                favorite =
                    true;

            } else {

                favorites.splice(
                    index,
                    1
                );


                favorite =
                    false;
            }


            saveFavorites(
                favorites
            );


            syncArtworkFavorites(
                normalizedArtId
            );


            /* =============================================
               MASCOTTE
            ============================================== */

            if (
                favorite
            ) {

                showMascotteMessage(
                    FAVORITE_ADDED_MESSAGES
                );

            } else {

                showMascotteMessage(
                    FAVORITE_REMOVED_MESSAGES
                );
            }


            /* =============================================
               ÉVÉNEMENT
            ============================================== */

            document.dispatchEvent(
                new CustomEvent(
                    "couaxia:gallery-favorites-changed",
                    {
                        detail: {

                            artId:
                                normalizedArtId,

                            favorite,

                            favorites:
                                [
                                    ...favorites
                                ]

                        }
                    }
                )
            );
        }


        /* =====================================================
           INITIALISATION D'UNE CARTE
        ====================================================== */

        /**
         * Initialise une carte.
         *
         * @param {HTMLElement} card
         */
        function initializeFavoriteCard(
            card
        ) {

            if (
                !(
                    card instanceof
                    HTMLElement
                )
            ) {

                return;
            }


            /*
             * Déjà initialisée.
             */

            if (
                card.dataset
                    .favoriteReady ===
                "true"
            ) {

                return;
            }


            const artId =
                getArtId(
                    card
                );


            if (
                !artId
            ) {

                return;
            }


            /*
             * Marque la carte comme traitée.
             */

            card.dataset
                .favoriteReady =
                "true";


            /* =============================================
               FAVORIS DÉSACTIVÉS
            ============================================== */

            if (
                !isFavoriteEnabled(
                    card
                )
            ) {

                card.classList.remove(
                    "is-favorite"
                );


                card
                    .querySelectorAll(
                        ".gallery-favorite-button"
                    )
                    .forEach(
                        button => {

                            button.remove();
                        }
                    );


                return;
            }


            /* =============================================
               CONTENEUR IMAGE
            ============================================== */

            const imageContainer =
                card.querySelector(
                    ".image-container"
                );


            if (
                !imageContainer
            ) {

                return;
            }


            /* =============================================
               BOUTON
            ============================================== */

            let button =
                imageContainer.querySelector(
                    ".gallery-favorite-button"
                );


            if (
                !(
                    button instanceof
                    HTMLButtonElement
                )
            ) {

                button =
                    createFavoriteButton(
                        artId
                    );


                imageContainer.appendChild(
                    button
                );
            }


            /* =============================================
               ÉTAT INITIAL
            ============================================== */

            updateFavoriteButton(
                button,
                isFavorite(
                    artId
                )
            );


            card.classList.toggle(
                "is-favorite",
                isFavorite(
                    artId
                )
            );


            /* =============================================
               CLIC
            ============================================== */

            button.addEventListener(
                "click",
                event => {

                    /*
                     * Le cœur ne doit pas :
                     *
                     * - ouvrir le zoom
                     * - déclencher +18
                     * - déclencher la mascotte image
                     */

                    event.preventDefault();

                    event.stopPropagation();


                    toggleFavorite(
                        artId
                    );
                }
            );
        }


        /* =====================================================
           INITIALISATION DANS UN CONTENEUR
        ====================================================== */

        /**
         * Initialise toutes les cartes
         * présentes dans root.
         *
         * @param {ParentNode} root
         */
        function initializeFavoritesInside(
            root
        ) {

            if (
                root instanceof
                    HTMLElement &&
                root.matches(
                    ".artist-card[data-art-id]"
                )
            ) {

                initializeFavoriteCard(
                    root
                );
            }


            if (
                typeof root
                    ?.querySelectorAll !==
                "function"
            ) {

                return;
            }


            root
                .querySelectorAll(
                    ".artist-card[data-art-id]"
                )
                .forEach(
                    initializeFavoriteCard
                );
        }


        /* =====================================================
           INITIALISATION
        ====================================================== */

        initializeFavoritesInside(
            document
        );


        syncAllFavorites();


        /* =====================================================
           CARTES GÉNÉRÉES PAR credits-gallery.js
        ====================================================== */

        /*
         * credits-gallery.js reconstruit les galeries
         * lorsque :
         *
         * - Supabase est chargé
         * - un filtre change
         * - la galerie Favoris change
         *
         * Il déclenche ensuite :
         *
         * couaxia:credits-rendered
         */

        document.addEventListener(
            "couaxia:credits-rendered",
            () => {

                initializeFavoritesInside(
                    document.getElementById(
                        "credits-generated-galleries"
                    ) ||
                    document
                );


                syncAllFavorites();
            }
        );


        /* =====================================================
           MUTATION OBSERVER
        ====================================================== */

        /*
         * On conserve également le MutationObserver.
         *
         * Il sert de sécurité pour les cartes
         * éventuellement ajoutées par d'autres scripts.
         */

        const observer =
            new MutationObserver(
                mutations => {

                    mutations.forEach(
                        mutation => {

                            mutation
                                .addedNodes
                                .forEach(
                                    node => {

                                        if (
                                            !(
                                                node instanceof
                                                HTMLElement
                                            )
                                        ) {

                                            return;
                                        }


                                        initializeFavoritesInside(
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


        /* =====================================================
           SYNCHRONISATION ENTRE ONGLETS
        ====================================================== */

        window.addEventListener(
            "storage",
            event => {

                if (
                    event.key !==
                    STORAGE_KEY
                ) {

                    return;
                }


                syncAllFavorites();


                /*
                 * Si l'utilisateur regarde
                 * actuellement "Mes favoris",
                 * la galerie doit également
                 * être reconstruite.
                 */

                if (
                    window.CouaxiaCreditsGallery &&
                    typeof window
                        .CouaxiaCreditsGallery
                        .getFilter ===
                        "function" &&
                    window
                        .CouaxiaCreditsGallery
                        .getFilter() ===
                        "favorites"
                ) {

                    window
                        .CouaxiaCreditsGallery
                        .render();
                }
            }
        );


        /* =====================================================
           API PUBLIQUE
        ====================================================== */

        window.CouaxiaGalleryFavorites = {

            /**
             * Retourne tous les favoris.
             */
            getFavorites() {

                return [
                    ...getStoredFavorites()
                ];
            },


            /**
             * Vérifie si une œuvre est favorite.
             */
            isFavorite(
                artId
            ) {

                return isFavorite(
                    String(
                        artId ??
                        ""
                    )
                        .trim()
                );
            },


            /**
             * Ajoute ou retire un favori.
             */
            toggle(
                artId
            ) {

                toggleFavorite(
                    String(
                        artId ??
                        ""
                    )
                        .trim()
                );
            },


            /**
             * Force la synchronisation
             * de toutes les cartes.
             */
            sync() {

                syncAllFavorites();
            },


            /**
             * Retourne le nombre de favoris.
             */
            getCount() {

                return getStoredFavorites()
                    .length;
            },


            /**
             * Supprime tous les favoris.
             */
            clear() {

                saveFavorites(
                    []
                );


                syncAllFavorites();


                document.dispatchEvent(
                    new CustomEvent(
                        "couaxia:gallery-favorites-changed",
                        {
                            detail: {

                                artId:
                                    null,

                                favorite:
                                    false,

                                favorites:
                                    []

                            }
                        }
                    )
                );
            }

        };


        console.info(
            "[Galerie] Favoris initialisés."
        );
    }
);