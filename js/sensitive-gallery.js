"use strict";

/* =========================================================
   CONTENUS +18 — COUAXIA
   Téléphone, tablette, souris et clavier
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       MESSAGES SPÉCIAUX +18
    ====================================================== */

    /**
     * Ajoute automatiquement des messages de mascotte
     * aux cartes marquées data-sensitive="true".
     *
     * Si la carte possède déjà data-messages,
     * les messages personnalisés sont conservés.
     *
     * @param {HTMLElement} card
     */
    function addSensitiveMessages(card) {
        if (
            card.dataset.sensitive !== "true"
        ) {
            return;
        }


        /*
         * Ne remplace pas les messages
         * personnalisés déjà présents.
         */
        if (
            card.dataset.messages?.trim()
        ) {
            return;
        }


        card.dataset.messages = [
            "Oh, tu es un petit coquin toi ? 😏",
            "Tu ne peux pas t'empêcher de regarder ! 👀",
            "Je t'ai vu ouvrir cette image ! 🔞",
            "Curieux, hein ? 😏",
            "On dirait que cette illustration t'intéresse beaucoup... 👀"
        ].join("|");
    }


    /* =====================================================
       INITIALISATION D'UNE CARTE +18
    ====================================================== */

    /**
     * Initialise une carte sensible.
     *
     * @param {HTMLElement} card
     */
    function initializeSensitiveCard(card) {

        /*
         * Évite d'initialiser plusieurs fois
         * la même carte.
         */
        if (
            card.dataset.sensitiveReady === "true"
        ) {
            return;
        }


        /*
         * Ajoute les messages spéciaux
         * pour la mascotte.
         */
        addSensitiveMessages(card);


        const imageContainer =
            card.querySelector(
                ".image-container"
            );


        if (!imageContainer) {
            return;
        }


        /*
         * La carte est maintenant initialisée.
         */
        card.dataset.sensitiveReady =
            "true";


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


        imageContainer.setAttribute(
            "aria-label",
            "Afficher ou masquer l’illustration réservée aux adultes"
        );


        imageContainer.setAttribute(
            "aria-pressed",
            "false"
        );


        /* =================================================
           AFFICHER / MASQUER LE CONTENU
        ================================================= */

        function toggleSensitiveContent() {

            const isRevealed =
                card.classList.toggle(
                    "is-sensitive-revealed"
                );


            imageContainer.setAttribute(
                "aria-pressed",
                String(isRevealed)
            );


            /*
             * Change aussi le texte accessible
             * selon l'état de l'image.
             */
            imageContainer.setAttribute(
                "aria-label",
                isRevealed
                    ? "Masquer l’illustration réservée aux adultes"
                    : "Afficher l’illustration réservée aux adultes"
            );
        }


        /* =================================================
           CLIC SOURIS / TACTILE
        ================================================= */

        imageContainer.addEventListener(
            "click",
            (event) => {

                /*
                 * Si un élément interactif est présent
                 * dans l'image, on ne déclenche pas
                 * l'ouverture +18.
                 */
                if (
                    event.target.closest(
                        "a, button"
                    )
                ) {
                    return;
                }


                toggleSensitiveContent();
            }
        );


        /* =================================================
           CLAVIER
        ================================================= */

        imageContainer.addEventListener(
            "keydown",
            (event) => {

                /*
                 * Entrée ou espace.
                 */
                if (
                    event.key !== "Enter" &&
                    event.key !== " "
                ) {
                    return;
                }


                event.preventDefault();


                toggleSensitiveContent();
            }
        );
    }


    /* =====================================================
       INITIALISATION DANS UN CONTENEUR
    ====================================================== */

    /**
     * Recherche toutes les cartes +18
     * présentes dans un élément.
     *
     * @param {ParentNode} root
     */
    function initializeInside(root) {

        /*
         * Si root est lui-même une carte sensible,
         * on l'initialise également.
         */
        if (
            root instanceof HTMLElement &&
            root.matches(
                '.artist-card[data-sensitive="true"]'
            )
        ) {
            initializeSensitiveCard(
                root
            );
        }


        /*
         * Recherche ensuite les cartes sensibles
         * contenues dans root.
         */
        root
            .querySelectorAll(
                '.artist-card[data-sensitive="true"]'
            )
            .forEach(
                initializeSensitiveCard
            );
    }


    /* =====================================================
       CARTES PRÉSENTES AU CHARGEMENT
    ====================================================== */

    initializeInside(
        document
    );


    /* =====================================================
       CARTES CRÉÉES PAR credits-gallery.js
    ====================================================== */

    /*
     * credits-gallery.js peut déplacer ou cloner
     * des cartes après le chargement de la page.
     *
     * MutationObserver permet donc d'initialiser
     * automatiquement les nouvelles cartes.
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

});