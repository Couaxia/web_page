"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const TWITCH_CHANNEL = "couaxia";

    /*
     * Même origine lorsque le site est hébergé sur Vercel.
     *
     * Pour un site restant sur GitHub Pages, remplace cette valeur
     * par l'adresse complète de ton API Vercel.
     */
    const TWITCH_API_URL =
        "/api/twitch-status";

    const loadingElement =
        document.getElementById("twitch-live-loading");

    const liveContent =
        document.getElementById("twitch-live-content");

    const offlineContent =
        document.getElementById("twitch-offline-content");

    const errorContent =
        document.getElementById("twitch-error-content");

    const headingText =
        document.getElementById(
            "twitch-live-heading-text"
        );

    const introduction =
        document.getElementById(
            "twitch-live-introduction"
        );

    const statusDot =
        document.getElementById("twitch-status-dot");

    const thumbnail =
        document.getElementById(
            "twitch-live-thumbnail"
        );

    const viewers =
        document.getElementById(
            "twitch-live-viewers"
        );

    const category =
        document.getElementById(
            "twitch-live-category"
        );

    const streamTitle =
        document.getElementById(
            "twitch-live-stream-title"
        );

    const twitchButton =
        document.getElementById(
            "twitch-live-button"
        );

    const player =
        document.getElementById(
            "twitch-live-player"
        );

    const chat =
        document.getElementById(
            "twitch-live-chat"
        );

    const notification =
        document.getElementById(
            "twitch-live-notification"
        );

    const notificationClose =
        document.getElementById(
            "twitch-live-notification-close"
        );


    function hideElement(element) {
        element?.classList.add("is-hidden");
    }


    function showElement(element) {
        element?.classList.remove("is-hidden");
    }


    function getEmbedParent() {
        return window.location.hostname || "localhost";
    }


    function formatViewerCount(viewerCount) {
        const count = Number(viewerCount) || 0;

        const formattedCount =
            new Intl.NumberFormat("fr-FR").format(count);

        return count > 1
            ? `${formattedCount} spectateurs`
            : `${formattedCount} spectateur`;
    }


    function createEmbedUrls() {
        const parent =
            encodeURIComponent(getEmbedParent());

        return {
            player:
                `https://player.twitch.tv/` +
                `?channel=${TWITCH_CHANNEL}` +
                `&parent=${parent}` +
                `&autoplay=true` +
                `&muted=true`,

            chat:
                `https://www.twitch.tv/embed/` +
                `${TWITCH_CHANNEL}/chat` +
                `?parent=${parent}`
        };
    }


    function destroyTwitchEmbeds() {
        if (player) {
            player.removeAttribute("src");
        }

        if (chat) {
            chat.removeAttribute("src");
        }
    }


    function displayLiveNotification() {
        if (!notification) {
            return;
        }

        /*
         * Évite de répéter l'animation à chaque actualisation
         * pendant une même session de navigation.
         */
        const alreadyDisplayed =
            sessionStorage.getItem(
                "couaxia-live-notification"
            );

        if (alreadyDisplayed === "true") {
            return;
        }

        notification.classList.add(
            "is-visible"
        );

        sessionStorage.setItem(
            "couaxia-live-notification",
            "true"
        );

        window.setTimeout(() => {
            notification.classList.remove(
                "is-visible"
            );
        }, 9000);
    }


    function displayLive(stream) {
        hideElement(loadingElement);
        hideElement(offlineContent);
        hideElement(errorContent);
        showElement(liveContent);

        statusDot?.classList.add("is-live");

        if (headingText) {
            headingText.textContent =
                "Couaxia est en direct !";
        }

        if (introduction) {
            introduction.textContent =
                "Rejoins le live et discute directement avec les Poups.";
        }

        if (thumbnail) {
            /*
             * La date évite d'afficher une ancienne miniature
             * conservée dans le cache du navigateur.
             */
            const separator =
                stream.thumbnailUrl.includes("?")
                    ? "&"
                    : "?";

            thumbnail.src =
                `${stream.thumbnailUrl}` +
                `${separator}refresh=${Date.now()}`;
        }

        if (viewers) {
            viewers.textContent =
                formatViewerCount(stream.viewers);
        }

        if (category) {
            category.textContent =
                stream.category ||
                "Catégorie non renseignée";
        }

        if (streamTitle) {
            streamTitle.textContent =
                stream.title ||
                "Couaxia est actuellement en direct !";
        }

        if (twitchButton) {
            twitchButton.href =
                stream.twitchUrl ||
                `https://www.twitch.tv/${TWITCH_CHANNEL}`;
        }

        const embedUrls = createEmbedUrls();

        if (
            player &&
            player.src !== embedUrls.player
        ) {
            player.src = embedUrls.player;
        }

        if (
            chat &&
            chat.src !== embedUrls.chat
        ) {
            chat.src = embedUrls.chat;
        }

        displayLiveNotification();
    }


    function displayOffline() {
        hideElement(loadingElement);
        hideElement(liveContent);
        hideElement(errorContent);
        showElement(offlineContent);

        statusDot?.classList.remove("is-live");

        if (headingText) {
            headingText.textContent =
                "Couaxia est actuellement hors ligne";
        }

        if (introduction) {
            introduction.textContent =
                "Le prochain voyage en direct commencera bientôt.";
        }

        destroyTwitchEmbeds();

        /*
         * Permet de réafficher la notification
         * lors d'un prochain live dans cette session.
         */
        sessionStorage.removeItem(
            "couaxia-live-notification"
        );
    }


    function displayError(error) {
        console.error(
            "Erreur lors de la récupération du live :",
            error
        );

        hideElement(loadingElement);
        hideElement(liveContent);
        hideElement(offlineContent);
        showElement(errorContent);

        statusDot?.classList.remove("is-live");

        if (headingText) {
            headingText.textContent =
                "Statut Twitch indisponible";
        }

        if (introduction) {
            introduction.textContent =
                "La chaîne Twitch reste accessible directement.";
        }

        destroyTwitchEmbeds();
    }


    async function loadTwitchStatus({
        showLoading = false
    } = {}) {
        if (showLoading) {
            showElement(loadingElement);
        }

        try {
            const response = await fetch(
                TWITCH_API_URL,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/json"
                    },
                    cache: "no-store"
                }
            );

            if (!response.ok) {
                throw new Error(
                    `Erreur HTTP ${response.status}`
                );
            }

            const stream = await response.json();

            if (stream.error) {
                throw new Error(stream.error);
            }

            if (stream.live) {
                displayLive(stream);
            } else {
                displayOffline();
            }
        } catch (error) {
            displayError(error);
        }
    }


    notificationClose?.addEventListener(
        "click",
        () => {
            notification?.classList.remove(
                "is-visible"
            );
        }
    );


    loadTwitchStatus({
        showLoading: true
    });

    /*
     * Nouvelle vérification toutes les 60 secondes.
     */
    window.setInterval(() => {
        loadTwitchStatus();
    }, 60_000);
});