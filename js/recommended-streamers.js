"use strict";

/* =========================================================
   STREAMERS RECOMMANDÉS — ACCUEIL
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const streamersContainer =
        document.querySelector(
            "#recommended-streamers-list"
        );

    const resultsElement =
        document.querySelector(
            "#recommended-streamers-results"
        );

    if (!streamersContainer) {
        return;
    }


    const API_URL =
        "/api/recommended-streamers";


    /* =====================================================
       OUTILS
    ====================================================== */

    /**
     * Échappe une valeur HTML.
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
     * Formate un nombre en français.
     *
     * @param {unknown} value
     * @returns {string}
     */
    function formatNumber(value) {
        const number =
            Number(value);

        if (!Number.isFinite(number)) {
            return "0";
        }

        return new Intl.NumberFormat(
            "fr-FR"
        ).format(number);
    }


    /**
     * Retourne l’avatar du streamer
     * ou le logo de secours.
     *
     * @param {object} streamer
     * @returns {string}
     */
    function getAvatarUrl(streamer) {
        const avatarUrl =
            String(
                streamer?.profileImageUrl ||
                ""
            ).trim();

        if (avatarUrl) {
            return avatarUrl;
        }

        return (
            "/images/logo/" +
            "Logo Transparents 2.png"
        );
    }


    /**
     * Crée un texte pour l’infobulle.
     *
     * @param {object} streamer
     * @returns {string}
     */
    function createTooltipText(streamer) {
        if (!streamer.live) {
            return (
                `${streamer.displayName} est hors ligne.`
            );
        }

        const parts = [
            `${streamer.displayName} est en direct`
        ];

        if (streamer.gameName) {
            parts.push(
                `Catégorie : ${streamer.gameName}`
            );
        }

        if (
            Number.isFinite(
                Number(streamer.viewerCount)
            )
        ) {
            parts.push(
                `${formatNumber(
                    streamer.viewerCount
                )} spectateur(s)`
            );
        }

        return parts.join(" — ");
    }


    /* =====================================================
       CARTE COMPACTE
    ====================================================== */

    /**
     * Crée une carte d’avatar Twitch.
     *
     * @param {object} streamer
     * @returns {string}
     */
    function createStreamerCard(streamer) {
        const isLive =
            Boolean(
                streamer.live
            );

        const statusClass =
            isLive
                ? "is-live"
                : "is-offline";

        const statusLabel =
            isLive
                ? "En direct"
                : "Hors ligne";

        const avatarUrl =
            getAvatarUrl(
                streamer
            );

        const channelUrl =
            String(
                streamer.channelUrl ||
                `https://www.twitch.tv/${encodeURIComponent(
                    streamer.login ||
                    ""
                )}`
            );

        const tooltipText =
            createTooltipText(
                streamer
            );

        return `
            <article
                class="
                    recommended-streamer-item
                    ${statusClass}
                "
                data-streamer-login="${escapeHtml(
                    streamer.login
                )}"
                data-messages="${
                    isLive
                        ? `${escapeHtml(
                            streamer.displayName
                        )} est actuellement en direct !`
                        : `Découvre la chaîne de ${escapeHtml(
                            streamer.displayName
                        )} !`
                }"
            >
                <div
                    class="recommended-streamer-circle"
                    title="${escapeHtml(
                        tooltipText
                    )}"
                >
                    <img
                        class="recommended-streamer-avatar"
                        src="${escapeHtml(
                            avatarUrl
                        )}"
                        alt="Avatar Twitch de ${escapeHtml(
                            streamer.displayName
                        )}"
                        loading="lazy"
                        decoding="async"
                        draggable="false"
                    >


                    <a
                        class="recommended-streamer-external-link"
                        href="${escapeHtml(
                            channelUrl
                        )}"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Ouvrir la chaîne Twitch de ${escapeHtml(
                            streamer.displayName
                        )}"
                        title="Voir la chaîne Twitch"
                    >
                        <span aria-hidden="true">
                            ↗
                        </span>
                    </a>


                    <span
                        class="recommended-streamer-status-light"
                        role="img"
                        aria-label="${statusLabel}"
                        title="${statusLabel}"
                    ></span>


                    ${
                        isLive
                            ? `
                                <span
                                    class="recommended-streamer-live-label"
                                >
                                    LIVE
                                </span>
                            `
                            : ""
                    }
                </div>


                <h3 class="recommended-streamer-name">
                    ${escapeHtml(
                        streamer.displayName
                    )}
                </h3>
            </article>
        `;
    }


    /* =====================================================
       AFFICHAGE
    ====================================================== */

    /**
     * Affiche les streamers.
     *
     * @param {object[]} streamers
     */
    function renderStreamers(streamers) {
        if (
            !Array.isArray(streamers) ||
            streamers.length === 0
        ) {
            streamersContainer.innerHTML = `
                <p class="recommended-streamers-empty">
                    Aucune chaîne recommandée
                    disponible pour le moment.
                </p>
            `;

            if (resultsElement) {
                resultsElement.textContent =
                    "Aucune chaîne disponible.";
            }

            return;
        }

        streamersContainer.innerHTML =
            streamers
                .map(createStreamerCard)
                .join("");

        if (resultsElement) {
            const liveCount =
                streamers.filter(
                    (streamer) => {
                        return streamer.live;
                    }
                ).length;

            resultsElement.textContent =
                `${streamers.length} chaîne${
                    streamers.length > 1
                        ? "s"
                        : ""
                } recommandée${
                    streamers.length > 1
                        ? "s"
                        : ""
                } — ${liveCount} en direct.`;
        }

        document.dispatchEvent(
            new CustomEvent(
                "couaxia:recommended-streamers-ready",
                {
                    detail: {
                        streamers
                    }
                }
            )
        );
    }


    /**
     * Affiche l’erreur.
     *
     * @param {string} message
     */
    function renderError(message) {
        streamersContainer.innerHTML = `
            <div
                class="recommended-streamers-error"
                role="alert"
            >
                <p>
                    Impossible de charger
                    les chaînes recommandées.
                </p>

                <button
                    type="button"
                    class="recommended-streamers-retry"
                >
                    Réessayer
                </button>
            </div>
        `;

        console.error(
            "[Streamers recommandés]",
            message
        );

        const retryButton =
            streamersContainer.querySelector(
                ".recommended-streamers-retry"
            );

        retryButton?.addEventListener(
            "click",
            loadRecommendedStreamers
        );
    }


    /* =====================================================
       API
    ====================================================== */

    async function loadRecommendedStreamers() {
        streamersContainer.innerHTML = `
            <p class="recommended-streamers-loading">
                Chargement des chaînes Twitch…
            </p>
        `;

        streamersContainer.setAttribute(
            "aria-busy",
            "true"
        );

        try {
            const response =
                await fetch(
                    API_URL,
                    {
                        method:
                            "GET",

                        headers: {
                            Accept:
                                "application/json"
                        },

                        cache:
                            "no-store"
                    }
                );

            const data =
                await response.json();

            if (
                !response.ok ||
                data.success !== true
            ) {
                throw new Error(
                    data.details ||
                    data.error ||
                    `Erreur HTTP ${response.status}`
                );
            }

            renderStreamers(
                data.streamers
            );
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : String(error);

            renderError(
                message
            );
        } finally {
            streamersContainer.setAttribute(
                "aria-busy",
                "false"
            );
        }
    }


    loadRecommendedStreamers();
});