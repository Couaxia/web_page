"use strict";

document.addEventListener("DOMContentLoaded", () => {
    /*
     * Tous les éléments possédant data-messages
     * pourront déclencher un dialogue de la mascotte.
     */
    const interactiveElements = document.querySelectorAll(
        "[data-messages]"
    );

    if (interactiveElements.length === 0) {
        console.warn(
            "Aucun élément avec l’attribut data-messages n’a été trouvé."
        );

        return;
    }

    /**
     * Transforme la valeur de data-messages en tableau.
     *
     * Exemple :
     * data-messages="Phrase 1|Phrase 2|Phrase 3"
     */
    function getMessages(element) {
        const rawMessages =
            element.getAttribute("data-messages");

        if (!rawMessages) {
            return [];
        }

        return rawMessages
            .split("|")
            .map((message) => message.trim())
            .filter(Boolean);
    }

    /**
     * Sélectionne une phrase aléatoire.
     */
    function getRandomMessage(messages) {
        if (messages.length === 0) {
            return null;
        }

        const randomIndex =
            Math.floor(Math.random() * messages.length);

        return messages[randomIndex];
    }

    /**
     * Affiche un message avec la mascotte.
     */
    function displayMascotteMessage(element) {
        const messages = getMessages(element);
        const randomMessage = getRandomMessage(messages);

        if (!randomMessage) {
            return;
        }

        /*
         * Fonction publique recommandée dans mascotte.js
         */
        if (
            typeof window.showMascotteMessage === "function"
        ) {
            window.showMascotteMessage(
                randomMessage,
                3500
            );

            return;
        }

        /*
         * Compatibilité avec ton ancienne fonction.
         */
        if (typeof window.showMessage === "function") {
            window.showMessage(
                randomMessage,
                3500
            );

            return;
        }

        console.error(
            "La fonction de dialogue de la mascotte est introuvable."
        );
    }

    interactiveElements.forEach((element) => {
        /*
         * Ordinateur : déclenchement au survol.
         */
        element.addEventListener("mouseenter", () => {
            displayMascotteMessage(element);
        });

        /*
         * Clavier, téléphone et tablette.
         */
        element.addEventListener("focus", () => {
            displayMascotteMessage(element);
        });
    });
});