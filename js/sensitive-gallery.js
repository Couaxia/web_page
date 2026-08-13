"use strict";

/* =========================================================
   CONTENUS +18 — COUAXIA
   Téléphone, tablette, souris et clavier
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =====================================================
           MESSAGES SPÉCIAUX +18
        ====================================================== */

        const SENSITIVE_MESSAGES = [

            "Oh, tu es un petit coquin toi ? 😏",

            "Tu ne peux pas t'empêcher de regarder ! 👀",

            "Je t'ai vu ouvrir cette image ! 🔞",

            "Curieux, hein ? 😏",

            "On dirait que cette illustration t'intéresse beaucoup... 👀"

        ];


        /* =====================================================
           OUTILS
        ====================================================== */

        /**
         * Vérifie si une carte est sensible.
         *
         * @param {HTMLElement} card
         * @returns {boolean}
         */
        function isSensitiveCard(
            card
        ) {

            return (
                String(
                    card?.dataset?.sensitive ??
                    ""
                )
                    .trim()
                    .toLowerCase() ===
                "true"
            );
        }


        /**
         * Ajoute automatiquement des messages
         * aux cartes +18.
         *
         * Les messages personnalisés existants
         * sont conservés.
         *
         * @param {HTMLElement} card
         */
        function addSensitiveMessages(
            card
        ) {

            if (
                !isSensitiveCard(
                    card
                )
            ) {

                return;
            }


            if (
                card.dataset
                    .messages
                    ?.trim()
            ) {

                return;
            }


            card.dataset.messages =
                SENSITIVE_MESSAGES.join(
                    "|"
                );
        }


        /* =====================================================
           ÉTAT
        ====================================================== */

        /**
         * Met à jour l'accessibilité
         * en fonction de l'état révélé.
         *
         * @param {HTMLElement} card
         * @param {HTMLElement} imageContainer
         */
        function updateAccessibilityState(
            card,
            imageContainer
        ) {

            const revealed =
                card.classList.contains(
                    "is-sensitive-revealed"
                );


            imageContainer.setAttribute(
                "aria-pressed",
                String(
                    revealed
                )
            );


            imageContainer.setAttribute(
                "aria-label",
                revealed
                    ? "Masquer l’illustration réservée aux adultes"
                    : "Afficher l’illustration réservée aux adultes"
            );
        }


        /**
         * Affiche ou masque une œuvre +18.
         *
         * @param {HTMLElement} card
         * @param {HTMLElement} imageContainer
         */
        function toggleSensitiveContent(
            card,
            imageContainer
        ) {

            const revealed =
                card.classList.toggle(
                    "is-sensitive-revealed"
                );


            updateAccessibilityState(
                card,
                imageContainer
            );


            document.dispatchEvent(
                new CustomEvent(
                    "couaxia:sensitive-artwork-toggled",
                    {
                        detail: {

                            artId:
                                String(
                                    card.dataset
                                        .artId ??
                                    ""
                                )
                                    .trim(),

                            revealed

                        }
                    }
                )
            );
        }


        /* =====================================================
           INITIALISATION D'UNE CARTE
        ====================================================== */

        /**
         * Initialise une carte sensible.
         *
         * @param {HTMLElement} card
         */
        function initializeSensitiveCard(
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


            if (
                !isSensitiveCard(
                    card
                )
            ) {

                return;
            }


            if (
                card.dataset
                    .sensitiveReady ===
                "true"
            ) {

                return;
            }


            addSensitiveMessages(
                card
            );


            const imageContainer =
                card.querySelector(
                    ".image-container"
                );


            if (
                !imageContainer
            ) {

                return;
            }


            card.dataset
                .sensitiveReady =
                "true";


            /* =================================================
               ÉTAT INITIAL
            ================================================= */

            card.classList.remove(
                "is-sensitive-revealed"
            );


            /* =================================================
               ACCESSIBILITÉ
            ================================================= */

            imageContainer.setAttribute(
                "tabindex",
                "0"
            );


            imageContainer.setAttribute(
                "role",
                "button"
            );


            updateAccessibilityState(
                card,
                imageContainer
            );


            /* =================================================
               SOURIS / TACTILE
            ================================================= */

            imageContainer.addEventListener(
                "click",
                event => {

                    /*
                     * Évite d'intercepter :
                     *
                     * - lien artiste
                     * - bouton favoris
                     * - autres boutons
                     */

                    if (
                        event.target instanceof
                        Element &&
                        event.target.closest(
                            "a, button"
                        )
                    ) {

                        return;
                    }


                    toggleSensitiveContent(
                        card,
                        imageContainer
                    );
                }
            );


            /* =================================================
               CLAVIER
            ================================================= */

            imageContainer.addEventListener(
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


                    /*
                     * Si le focus se trouve sur un
                     * élément interactif contenu
                     * dans image-container, on ne
                     * bascule pas le +18.
                     */

                    if (
                        event.target instanceof
                            Element &&
                        event.target.closest(
                            "a, button"
                        )
                    ) {

                        return;
                    }


                    event.preventDefault();


                    toggleSensitiveContent(
                        card,
                        imageContainer
                    );
                }
            );
        }


        /* =====================================================
           INITIALISATION DANS UN CONTENEUR
        ====================================================== */

        /**
         * Initialise toutes les cartes sensibles
         * d'un élément.
         *
         * @param {ParentNode} root
         */
        function initializeInside(
            root
        ) {

            if (
                root instanceof
                    HTMLElement &&
                root.matches(
                    '.artist-card[data-sensitive="true"]'
                )
            ) {

                initializeSensitiveCard(
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
                    '.artist-card[data-sensitive="true"]'
                )
                .forEach(
                    initializeSensitiveCard
                );
        }


        /* =====================================================
           RÉINITIALISATION
        ====================================================== */

        /**
         * Masque à nouveau toutes les œuvres sensibles.
         *
         * Utile après un changement de galerie.
         */
        function hideAllSensitiveArtworks() {

            document
                .querySelectorAll(
                    '.artist-card[data-sensitive="true"]'
                )
                .forEach(
                    card => {

                        if (
                            !(
                                card instanceof
                                HTMLElement
                            )
                        ) {

                            return;
                        }


                        card.classList.remove(
                            "is-sensitive-revealed"
                        );


                        const imageContainer =
                            card.querySelector(
                                ".image-container"
                            );


                        if (
                            imageContainer instanceof
                            HTMLElement
                        ) {

                            updateAccessibilityState(
                                card,
                                imageContainer
                            );
                        }
                    }
                );
        }


        /* =====================================================
           CARTES PRÉSENTES AU CHARGEMENT
        ====================================================== */

        initializeInside(
            document
        );


        /* =====================================================
           CARTES SUPABASE CHARGÉES
        ====================================================== */

        document.addEventListener(
            "couaxia:credits-loaded",
            () => {

                initializeInside(
                    document.getElementById(
                        "credits-card-source"
                    ) ||
                    document
                );
            }
        );


        /* =====================================================
           CARTES RENDUES DANS LES GALERIES
        ====================================================== */

        document.addEventListener(
            "couaxia:credits-rendered",
            () => {

                const generatedContainer =
                    document.getElementById(
                        "credits-generated-galleries"
                    );


                if (
                    generatedContainer
                ) {

                    initializeInside(
                        generatedContainer
                    );
                }


                /*
                 * À chaque reconstruction de galerie,
                 * les œuvres +18 repartent masquées.
                 */

                hideAllSensitiveArtworks();
            }
        );


        /* =====================================================
           MUTATION OBSERVER
        ====================================================== */

        /*
         * Sécurité supplémentaire pour les cartes
         * ajoutées dynamiquement par un autre script.
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


                                        initializeInside(
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
           API PUBLIQUE
        ====================================================== */

        window.CouaxiaSensitiveGallery = {

            /**
             * Initialise manuellement un conteneur.
             */
            initialize(
                root = document
            ) {

                initializeInside(
                    root
                );
            },


            /**
             * Masque toutes les œuvres +18.
             */
            hideAll() {

                hideAllSensitiveArtworks();
            },


            /**
             * Vérifie si une œuvre est révélée.
             */
            isRevealed(
                artId
            ) {

                const normalizedArtId =
                    String(
                        artId ??
                        ""
                    )
                        .trim();


                if (
                    !normalizedArtId
                ) {

                    return false;
                }


                const card =
                    document.querySelector(
                        `.artist-card[data-art-id="${CSS.escape(
                            normalizedArtId
                        )}"][data-sensitive="true"]`
                    );


                return Boolean(
                    card?.classList.contains(
                        "is-sensitive-revealed"
                    )
                );
            }

        };


        console.info(
            "[Galerie +18] Module initialisé."
        );
    }
);