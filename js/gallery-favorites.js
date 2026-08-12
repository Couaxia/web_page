"use strict";

/* =========================================================
   FAVORIS DE LA GALERIE — COUAXIA
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       CONFIGURATION
    ====================================================== */

    const STORAGE_KEY =
        "couaxia-gallery-favorites";


    /* =====================================================
       OUTILS
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

            if (!rawValue) {
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

            return parsedValue
                .map(
                    (value) =>
                        String(
                            value
                        )
                )
                .filter(Boolean);

        } catch (error) {

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
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(
                    favorites
                )
            );
        } catch (error) {
            console.error(
                "[Favoris galerie] Impossible d'enregistrer les favoris :",
                error
            );
        }
    }


    /**
     * Retourne l'identifiant d'une carte.
     *
     * @param {HTMLElement} card
     * @returns {string}
     */
    function getArtId(card) {
        return String(
            card.dataset.artId ??
            ""
        ).trim();
    }


    /**
     * Vérifie si une œuvre est favorite.
     *
     * @param {string} artId
     * @returns {boolean}
     */
    function isFavorite(
        artId
    ) {
        return getStoredFavorites()
            .includes(
                artId
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
            !Array.isArray(messages) ||
            messages.length === 0
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
            typeof window.showMessage ===
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
     * Crée un bouton favori.
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
            "title",
            "Ajouter aux favoris"
        );

        button.innerHTML = `
            <span
                class="gallery-favorite-icon"
                aria-hidden="true"
            >
                ♡
            </span>
        `;

        return button;
    }


    /**
     * Met à jour l'état visuel
     * d'un bouton.
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

        if (icon) {
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
       SYNCHRONISATION DES CLONES
    ====================================================== */

    /**
     * Synchronise toutes les cartes
     * ayant le même data-art-id.
     *
     * @param {string} artId
     */
    function syncArtworkFavorites(
        artId
    ) {
        const favorite =
            isFavorite(
                artId
            );

        document
            .querySelectorAll(
                `.artist-card[data-art-id="${CSS.escape(
                    artId
                )}"]`
            )
            .forEach(
                (card) => {

                    card.classList.toggle(
                        "is-favorite",
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
                        updateFavoriteButton(
                            button,
                            favorite
                        );
                    }

                }
            );
    }


    /**
     * Synchronise toutes les cartes.
     */
    function syncAllFavorites() {
        document
            .querySelectorAll(
                ".artist-card[data-art-id]"
            )
            .forEach(
                (card) => {

                    const artId =
                        getArtId(
                            card
                        );

                    if (!artId) {
                        return;
                    }

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
        const favorites =
            getStoredFavorites();

        const index =
            favorites.indexOf(
                artId
            );

        let favorite;


        if (index === -1) {

            favorites.push(
                artId
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
            artId
        );


        if (favorite) {
            showMascotteMessage(
                FAVORITE_ADDED_MESSAGES
            );
        } else {
            showMascotteMessage(
                FAVORITE_REMOVED_MESSAGES
            );
        }


        /*
         * Événement personnalisé utile
         * pour le futur filtre "Mes favoris".
         */
        document.dispatchEvent(
            new CustomEvent(
                "couaxia:gallery-favorites-changed",
                {
                    detail: {
                        artId,
                        favorite,
                        favorites:
                            [...favorites]
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


        if (!artId) {
            return;
        }


        const imageContainer =
            card.querySelector(
                ".image-container"
            );


        if (!imageContainer) {
            return;
        }


        card.dataset
            .favoriteReady =
            "true";


        /*
         * Évite un doublon si le bouton
         * existe déjà.
         */
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


        updateFavoriteButton(
            button,
            isFavorite(
                artId
            )
        );


        button.addEventListener(
            "click",
            (event) => {

                /*
                 * Empêche le clic du cœur
                 * de déclencher le zoom
                 * ou le système +18.
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


        root
            .querySelectorAll(
                ".artist-card[data-art-id]"
            )
            .forEach(
                initializeFavoriteCard
            );
    }


    /* =====================================================
       CARTES DÉJÀ PRÉSENTES
    ====================================================== */

    initializeFavoritesInside(
        document
    );


    syncAllFavorites();


    /* =====================================================
       CARTES CRÉÉES / CLONÉES DYNAMIQUEMENT
    ====================================================== */

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

    /*
     * Si ton site est ouvert dans deux onglets
     * et qu'un favori change dans l'un,
     * l'autre se met à jour automatiquement.
     */

    window.addEventListener(
        "storage",
        (event) => {

            if (
                event.key !==
                STORAGE_KEY
            ) {
                return;
            }


            syncAllFavorites();

        }
    );


    /* =====================================================
       API PUBLIQUE
    ====================================================== */

    /*
     * Ces fonctions pourront être utilisées
     * plus tard par :
     *
     * - le filtre "Mes favoris"
     * - le bouton "Œuvre au hasard"
     */

    window.CouaxiaGalleryFavorites = {

        getFavorites() {
            return [
                ...getStoredFavorites()
            ];
        },


        isFavorite(artId) {
            return isFavorite(
                String(
                    artId
                )
            );
        },


        toggle(artId) {
            toggleFavorite(
                String(
                    artId
                )
            );
        },


        sync() {
            syncAllFavorites();
        }

    };


    console.info(
        "[Galerie] Favoris initialisés."
    );

});