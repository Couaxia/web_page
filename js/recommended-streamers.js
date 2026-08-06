"use strict";

/* =========================================================
   STREAMERS RECOMMANDÉS PAR COUAXIA
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const streamersContainer =
        document.querySelector(
            "#recommended-streamers-list"
        );

    if (!streamersContainer) {
        return;
    }

    /*
     * Ajoute ou retire ici les streamers que tu recommandes.
     *
     * Pour les images, utilise de préférence des fichiers
     * enregistrés dans ton propre dossier :
     *
     * images/streamers/
     */
    const recommendedStreamers = [
        {
            login: "myo_faunette",
            displayName: "Myo_Faunette",
            avatar:
                "/images/streamers/myo_faunette.png",
            description:
                "Faunette, streameuse et grande partenaire de bêtises.",
            tags: [
                "VTuber",
                "Multi-gaming",
                "Collab"
            ],
            isLive: false,
            game: ""
        },
        {
            login: "celanyavt",
            displayName: "CelanyaVT",
            avatar:
                "/images/streamers/celanyavt.png",
            description:
                "Une créatrice pleine de douceur et d’énergie.",
            tags: [
                "VTuber",
                "Chill",
                "Folle"
            ],
            isLive: false,
            game: ""
        },
        {
            login: "sorine_e",
            displayName: "sorine_e",
            avatar:
                "/images/streamers/sorine_e.png",
            description:
                "Des streams chaleureux et beaucoup de bonne humeur.",
            tags: [
                "Gaming",
                "Collab"
            ],
            isLive: false,
            game: ""
        },
        {
            login: "maman_mikii",
            displayName: "Maman_Mikii",
            avatar:
                "/images/streamers/maman_mikii.png",
            description:
                "Une communauté accueillante et des moments très drôles.",
            tags: [
                "VTuber",
                "Chill"
            ],
            isLive: false,
            game: ""
        },
        {
            login: "yaochy_vt",
            displayName: "Yaochy_VT",
            avatar:
                "/images/streamers/yaochy_vt.png",
            description:
                "Une créatrice à découvrir pour son univers original.",
            tags: [
                "VTuber",
                "Multi-gaming"
            ],
            isLive: false,
            game: ""
        }
    ];


    /**
     * Échappe une valeur avant de l’insérer dans du HTML.
     *
     * @param {unknown} value
     * @returns {string}
     */
    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }


    /**
     * Crée les tags d’une chaîne.
     *
     * @param {string[]} tags
     * @returns {string}
     */
    function createTags(tags) {
        if (!Array.isArray(tags)) {
            return "";
        }

        return tags
            .map((tag) => {
                return `
                    <span class="recommended-streamer-tag">
                        ${escapeHtml(tag)}
                    </span>
                `;
            })
            .join("");
    }


    /**
     * Crée une carte de streamer.
     *
     * @param {object} streamer
     * @returns {string}
     */
    function createStreamerCard(streamer) {
        const channelUrl =
            `https://www.twitch.tv/${encodeURIComponent(
                streamer.login
            )}`;

        const statusClass =
            streamer.isLive
                ? "is-live"
                : "is-offline";

        const statusText =
            streamer.isLive
                ? "En direct"
                : "Hors ligne";

        const gameText =
            streamer.isLive && streamer.game
                ? `
                    <span class="recommended-streamer-game">
                        🎮 ${escapeHtml(streamer.game)}
                    </span>
                `
                : "";

        return `
            <article
                class="recommended-streamer-card ${statusClass}"
                data-streamer="${escapeHtml(streamer.login)}"
            >
                <a
                    class="recommended-streamer-avatar-link"
                    href="${channelUrl}"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Voir la chaîne Twitch de ${escapeHtml(
                        streamer.displayName
                    )}"
                >
                    <span class="recommended-streamer-avatar-wrapper">
                        <img
                            class="recommended-streamer-avatar"
                            src="${escapeHtml(streamer.avatar)}"
                            alt="Avatar Twitch de ${escapeHtml(
                                streamer.displayName
                            )}"
                            loading="lazy"
                            decoding="async"
                        >

                        <span
                            class="recommended-streamer-status-dot"
                            aria-hidden="true"
                        ></span>
                    </span>
                </a>

                <div class="recommended-streamer-content">
                    <h3>
                        <a
                            href="${channelUrl}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            ${escapeHtml(streamer.displayName)}
                        </a>
                    </h3>

                    <p class="recommended-streamer-status">
                        <span aria-hidden="true">
                            ${streamer.isLive ? "🔴" : "⚫"}
                        </span>

                        ${statusText}
                    </p>

                    ${gameText}

                    <p class="recommended-streamer-description">
                        ${escapeHtml(streamer.description)}
                    </p>

                    <div class="recommended-streamer-tags">
                        ${createTags(streamer.tags)}
                    </div>

                    <a
                        class="recommended-streamer-button"
                        href="${channelUrl}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Voir la chaîne
                        <span aria-hidden="true">↗</span>
                    </a>
                </div>
            </article>
        `;
    }


    /**
     * Affiche toutes les cartes.
     */
    function renderRecommendedStreamers() {
        if (recommendedStreamers.length === 0) {
            streamersContainer.innerHTML = `
                <p class="recommended-streamers-empty">
                    Aucune suggestion pour le moment.
                </p>
            `;

            return;
        }

        /*
         * Les streamers en direct apparaissent en premier.
         */
        const sortedStreamers = [
            ...recommendedStreamers
        ].sort((firstStreamer, secondStreamer) => {
            return (
                Number(secondStreamer.isLive) -
                Number(firstStreamer.isLive)
            );
        });

        streamersContainer.innerHTML =
            sortedStreamers
                .map(createStreamerCard)
                .join("");
    }


    renderRecommendedStreamers();
});