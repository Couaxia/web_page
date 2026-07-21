"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const navigationButtons = document.querySelectorAll(
        ".history-nav-button[data-messages]"
    );

    if (navigationButtons.length === 0) {
        console.warn(
            "Aucun bouton d’histoire avec data-messages n’a été trouvé."
        );

        return;
    }

    navigationButtons.forEach((button) => {
        button.addEventListener("mouseenter", () => {
            const rawMessages = button.getAttribute("data-messages");

            if (!rawMessages) {
                return;
            }

            const messages = rawMessages
                .split("|")
                .map((message) => message.trim())
                .filter(Boolean);

            if (messages.length === 0) {
                return;
            }

            const randomMessage =
                messages[Math.floor(Math.random() * messages.length)];

            if (typeof window.showMessage === "function") {
                window.showMessage(randomMessage, 3500);
            } else if (typeof showMessage === "function") {
                showMessage(randomMessage, 3500);
            } else {
                console.error(
                    "La fonction showMessage() de la mascotte est introuvable."
                );
            }
        });

        /*
         * Utile sur téléphone et tablette,
         * car il n’existe pas vraiment de survol tactile.
         */
        button.addEventListener("focus", () => {
            const rawMessages = button.getAttribute("data-messages");

            if (!rawMessages) {
                return;
            }

            const messages = rawMessages
                .split("|")
                .map((message) => message.trim())
                .filter(Boolean);

            if (messages.length === 0) {
                return;
            }

            const randomMessage =
                messages[Math.floor(Math.random() * messages.length)];

            if (typeof window.showMessage === "function") {
                window.showMessage(randomMessage, 3500);
            }
        });
    });
});