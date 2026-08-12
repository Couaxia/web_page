"use strict";

/* =========================================================
   NAVIGATION / MESSAGES DE LA MASCOTTE — COUAXIA
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       OUTILS
    ====================================================== */

    /**
     * Transforme data-messages en tableau.
     *
     * Exemple :
     *
     * data-messages="Phrase 1|Phrase 2|Phrase 3"
     *
     * @param {HTMLElement} element
     * @returns {string[]}
     */
    function getMessages(element) {
        const rawMessages =
            element.getAttribute(
                "data-messages"
            );

        if (!rawMessages) {
            return [];
        }

        return rawMessages
            .split("|")
            .map(
                (message) =>
                    message.trim()
            )
            .filter(Boolean);
    }


    /**
     * Sélectionne une phrase aléatoire.
     *
     * @param {string[]} messages
     * @returns {string|null}
     */
    function getRandomMessage(
        messages
    ) {
        if (
            !Array.isArray(messages) ||
            messages.length === 0
        ) {
            return null;
        }

        const randomIndex =
            Math.floor(
                Math.random() *
                messages.length
            );

        return messages[
            randomIndex
        ];
    }


    /**
     * Affiche le dialogue de la mascotte.
     *
     * @param {HTMLElement} element
     */
    function displayMascotteMessage(
        element
    ) {
        const messages =
            getMessages(
                element
            );

        const randomMessage =
            getRandomMessage(
                messages
            );

        if (!randomMessage) {
            return;
        }


        /*
         * Fonction principale de mascotte.js.
         */
        if (
            typeof window
                .showMascotteMessage ===
            "function"
        ) {
            window.showMascotteMessage(
                randomMessage,
                3500
            );

            return;
        }


        /*
         * Compatibilité avec une ancienne
         * version de mascotte.js.
         */
        if (
            typeof window.showMessage ===
            "function"
        ) {
            window.showMessage(
                randomMessage,
                3500
            );

            return;
        }


        console.error(
            "[Mascotte] La fonction de dialogue est introuvable."
        );
    }


    /* =====================================================
       RECHERCHE DE L'ÉLÉMENT INTERACTIF
    ====================================================== */

    /**
     * Recherche l'élément data-messages
     * le plus proche.
     *
     * @param {EventTarget|null} target
     * @returns {HTMLElement|null}
     */
    function getInteractiveElement(
        target
    ) {
        if (
            !(
                target instanceof
                Element
            )
        ) {
            return null;
        }

        const element =
            target.closest(
                "[data-messages]"
            );

        return element instanceof
            HTMLElement
            ? element
            : null;
    }


    /* =====================================================
       SOURIS
    ====================================================== */

    /*
     * On utilise mouseover au lieu de mouseenter
     * car mouseover fonctionne avec la délégation
     * d'événements.
     */

    document.addEventListener(
        "mouseover",
        (event) => {

            const element =
                getInteractiveElement(
                    event.target
                );

            if (!element) {
                return;
            }


            /*
             * Empêche le message de se relancer
             * lorsque la souris passe d'un enfant
             * de la carte à un autre.
             *
             * Exemple :
             *
             * image → titre → bouton
             */
            const previousElement =
                event.relatedTarget;

            if (
                previousElement instanceof
                    Node &&
                element.contains(
                    previousElement
                )
            ) {
                return;
            }


            displayMascotteMessage(
                element
            );

        }
    );


    /* =====================================================
       CLAVIER
    ====================================================== */

    /*
     * focusin se propage contrairement à focus.
     * Il fonctionne donc aussi avec les éléments
     * créés dynamiquement.
     */

    document.addEventListener(
        "focusin",
        (event) => {

            const element =
                getInteractiveElement(
                    event.target
                );

            if (!element) {
                return;
            }


            /*
             * Évite de déclencher plusieurs fois
             * le message lorsque le focus passe
             * entre plusieurs enfants du même
             * élément data-messages.
             */
            const previousElement =
                event.relatedTarget;

            if (
                previousElement instanceof
                    Node &&
                element.contains(
                    previousElement
                )
            ) {
                return;
            }


            displayMascotteMessage(
                element
            );

        }
    );


    /* =====================================================
       TACTILE / CLIC
    ====================================================== */

    /*
     * Utile sur téléphone et tablette.
     *
     * Le clic sur une carte possédant
     * data-messages déclenche aussi un dialogue.
     */

    document.addEventListener(
        "click",
        (event) => {

            const element =
                getInteractiveElement(
                    event.target
                );

            if (!element) {
                return;
            }


            /*
             * Les liens et boutons disposent déjà
             * généralement de leur propre interaction.
             *
             * On évite donc un deuxième dialogue
             * si le clic vient directement d'eux.
             */
            const interactiveControl =
                event.target instanceof
                    Element
                    ? event.target.closest(
                        "a, button"
                    )
                    : null;

            if (
                interactiveControl &&
                interactiveControl !==
                    element
            ) {
                return;
            }


            /*
             * Sur un appareil possédant une souris,
             * mouseover s'est déjà occupé du message.
             *
             * Le clic est donc surtout utilisé
             * pour les écrans tactiles.
             */
            if (
                window.matchMedia(
                    "(hover: hover)"
                ).matches
            ) {
                return;
            }


            displayMascotteMessage(
                element
            );

        }
    );

    /* =====================================================
       INFORMATION DEBUG
    ====================================================== */
    console.info(
        "[Mascotte] Navigation dynamique prête."
    );

});