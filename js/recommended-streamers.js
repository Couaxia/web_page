"use strict";

/* =========================================================
   STREAMERS RECOMMANDÉS — ACCUEIL COUAXIA
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ÉLÉMENTS HTML
    ====================================================== */

    const streamersContainer =
        document.querySelector(
            "#recommended-streamers-list"
        );

    const resultsElement =
        document.querySelector(
            "#recommended-streamers-results"
        );

    if (!streamersContainer) {
        console.warn(
            "[Streamers recommandés] " +
            "#recommended-streamers-list est introuvable."
        );

        return;
    }


    /* =====================================================
       API
    ====================================================== */

    const API_URL =
        "/api/recommended-streamers";


    /* =====================================================
       CONFIGURATION DES CATÉGORIES
    ====================================================== */

    const CATEGORY_CONFIG = {

        friends: {
            icon:
                "💜",

            title:
                "Mes amis",

            description:
                "Les personnes avec qui je joue, collabore et partage mes aventures."
        },


        international: {
            icon:
                "🌍",

            title:
                "À découvrir dans le monde",

            description:
                "Des créateurs internationaux que j’aime suivre et vous faire découvrir."
        },


        favorites: {
            icon:
                "⭐",

            title:
                "Mes favoris",

            description:
                "Les streamers que j’aime regarder et qui m’inspirent."
        }

    };


    /*
     * Ordre d’affichage des catégories.
     */

    const CATEGORY_ORDER = [
        "friends",
        "international",
        "favorites"
    ];


    /* =====================================================
       OUTILS
    ====================================================== */

    /**
     * Échappe une valeur avant de l’insérer
     * dans une chaîne HTML.
     *
     * @param {unknown} value
     * @returns {string}
     */
    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll(
                "&",
                "&amp;"
            )
            .replaceAll(
                "<",
                "&lt;"
            )
            .replaceAll(
                ">",
                "&gt;"
            )
            .replaceAll(
                '"',
                "&quot;"
            )
            .replaceAll(
                "'",
                "&#039;"
            );
    }


    /**
     * Normalise une catégorie.
     *
     * @param {unknown} value
     * @returns {string}
     */
    function normalizeCategory(value) {
        const category =
            String(value ?? "")
                .trim()
                .toLowerCase();

        if (
            CATEGORY_ORDER.includes(
                category
            )
        ) {
            return category;
        }

        return "favorites";
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

        if (
            !Number.isFinite(number)
        ) {
            return "0";
        }

        return new Intl.NumberFormat(
            "fr-FR"
        ).format(number);
    }


    /**
     * Retourne l’avatar Twitch
     * ou un logo de secours.
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
     * Crée le texte affiché
     * dans l’infobulle du cercle.
     *
     * @param {object} streamer
     * @returns {string}
     */
    function createTooltipText(
        streamer
    ) {
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


        const viewerCount =
            Number(
                streamer.viewerCount
            );

        if (
            Number.isFinite(
                viewerCount
            )
        ) {
            parts.push(
                `${formatNumber(
                    viewerCount
                )} spectateur${
                    viewerCount > 1
                        ? "s"
                        : ""
                }`
            );
        }


        return parts.join(
            " — "
        );
    }


    /* =====================================================
       CARTE STREAMER
    ====================================================== */

    /**
     * Crée une carte compacte.
     *
     * @param {object} streamer
     * @returns {string}
     */
    function createStreamerCard(
        streamer
    ) {
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
                `https://www.twitch.tv/${
                    encodeURIComponent(
                        streamer.login ||
                        ""
                    )
                }`
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
                    class="
                        recommended-streamer-circle
                    "
                    title="${escapeHtml(
                        tooltipText
                    )}"
                >

                    <img
                        class="
                            recommended-streamer-avatar
                        "
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
                        class="
                            recommended-streamer-external-link
                        "
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
                        class="
                            recommended-streamer-status-light
                        "
                        role="img"
                        aria-label="${statusLabel}"
                        title="${statusLabel}"
                    ></span>

                </div>


                <h4
                    class="
                        recommended-streamer-name
                    "
                >
                    ${escapeHtml(
                        streamer.displayName
                    )}
                </h4>

            </article>
        `;
    }


    /* =====================================================
       TRI D’UNE CATÉGORIE
    ====================================================== */

    /**
     * Place les lives avant
     * les chaînes hors ligne.
     *
     * @param {object[]} streamers
     * @returns {object[]}
     */
    function sortCategoryStreamers(
        streamers
    ) {
        return [
            ...streamers
        ].sort(
            (
                firstStreamer,
                secondStreamer
            ) => {
                return (
                    Number(
                        secondStreamer.live
                    ) -
                    Number(
                        firstStreamer.live
                    )
                );
            }
        );
    }


    /* =====================================================
       GROUPEMENT DES CATÉGORIES
    ====================================================== */

    /**
     * Regroupe les chaînes par catégorie.
     *
     * @param {object[]} streamers
     * @returns {Record<string, object[]>}
     */
    function groupStreamersByCategory(
        streamers
    ) {
        const groups = {

            friends:
                [],

            international:
                [],

            favorites:
                []

        };


        streamers.forEach(
            (streamer) => {

                const category =
                    normalizeCategory(
                        streamer.category
                    );


                groups[
                    category
                ].push(
                    streamer
                );

            }
        );


        CATEGORY_ORDER.forEach(
            (category) => {

                groups[
                    category
                ] =
                    sortCategoryStreamers(
                        groups[
                            category
                        ]
                    );

            }
        );


        return groups;
    }


    /* =====================================================
       CRÉATION D’UNE CATÉGORIE
    ====================================================== */

    /**
     * Crée une section complète.
     *
     * @param {string} category
     * @param {object[]} streamers
     * @returns {string}
     */
    function createCategorySection(
        category,
        streamers
    ) {
        const config =
            CATEGORY_CONFIG[
                category
            ];


        if (
            !config ||
            !Array.isArray(streamers) ||
            streamers.length === 0
        ) {
            return "";
        }


        const liveCount =
            streamers.filter(
                (streamer) => {
                    return Boolean(
                        streamer.live
                    );
                }
            ).length;


        const liveText =
            liveCount > 0
                ? `
                    <span>
                        • ${liveCount}
                        en direct
                    </span>
                `
                : "";


        return `
            <section
                class="
                    recommended-streamers-category
                    recommended-streamers-category-${escapeHtml(
                        category
                    )}
                "
                data-recommended-category="${escapeHtml(
                    category
                )}"
            >

                <header
                    class="
                        recommended-category-header
                    "
                >

                    <div
                        class="
                            recommended-category-title-wrapper
                        "
                    >

                        <span
                            class="
                                recommended-category-icon
                            "
                            aria-hidden="true"
                        >
                            ${config.icon}
                        </span>


                        <div>

                            <h3
                                class="
                                    recommended-category-title
                                "
                            >
                                ${escapeHtml(
                                    config.title
                                )}
                            </h3>


                            <p
                                class="
                                    recommended-category-description
                                "
                            >
                                ${escapeHtml(
                                    config.description
                                )}
                            </p>

                        </div>

                    </div>


                    <div
                        class="
                            recommended-category-counter
                        "
                    >
                        <span>
                            ${streamers.length}
                            chaîne${
                                streamers.length > 1
                                    ? "s"
                                    : ""
                            }
                        </span>

                        ${liveText}
                    </div>

                </header>


                <!--
                    C'EST CETTE DIV QUI MANQUAIT
                    DANS TON ANCIEN JAVASCRIPT.

                    C'est elle que ton CSS
                    transforme en grille.
                -->

                <div
                    class="
                        recommended-category-grid
                    "
                >
                    ${
                        streamers
                            .map(
                                createStreamerCard
                            )
                            .join("")
                    }
                </div>

            </section>
        `;
    }


    /* =====================================================
       AFFICHAGE GLOBAL
    ====================================================== */

    /**
     * Affiche toutes les catégories.
     *
     * @param {object[]} streamers
     */
    function renderStreamers(
        streamers
    ) {
        if (
            !Array.isArray(
                streamers
            ) ||
            streamers.length === 0
        ) {
            streamersContainer.innerHTML = `
                <p
                    class="
                        recommended-streamers-empty
                    "
                >
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


        /*
         * Création des groupes.
         */

        const groups =
            groupStreamersByCategory(
                streamers
            );


        /*
         * Création automatique
         * des différentes sections.
         */

        const categoriesHtml =
            CATEGORY_ORDER
                .map(
                    (category) => {

                        return createCategorySection(
                            category,
                            groups[
                                category
                            ]
                        );

                    }
                )
                .filter(Boolean)
                .join("");


        streamersContainer.innerHTML =
            categoriesHtml;


        /* =================================================
           COMPTEUR GLOBAL
        ================================================= */

        if (resultsElement) {

            const liveCount =
                streamers.filter(
                    (streamer) => {
                        return Boolean(
                            streamer.live
                        );
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


        /*
         * Événement disponible
         * pour les autres scripts.
         */

        document.dispatchEvent(
            new CustomEvent(
                "couaxia:recommended-streamers-ready",
                {
                    detail: {
                        streamers,
                        groups
                    }
                }
            )
        );
    }


    /* =====================================================
       ERREUR
    ====================================================== */

    /**
     * Affiche un message d’erreur.
     *
     * @param {string} message
     */
    function renderError(
        message
    ) {
        streamersContainer.innerHTML = `
            <div
                class="
                    recommended-streamers-error
                "
                role="alert"
            >

                <p>
                    Impossible de charger
                    les chaînes recommandées.
                </p>


                <button
                    type="button"
                    class="
                        recommended-streamers-retry
                    "
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
       CHARGEMENT API
    ====================================================== */

    async function loadRecommendedStreamers() {

        streamersContainer.innerHTML = `
            <p
                class="
                    recommended-streamers-loading
                "
            >
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
                    `Erreur HTTP ${
                        response.status
                    }`
                );
            }


            renderStreamers(
                data.streamers
            );

        } catch (error) {

            const message =
                error instanceof Error
                    ? error.message
                    : String(
                        error
                    );


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


    /* =====================================================
       DÉMARRAGE
    ====================================================== */

    loadRecommendedStreamers();

});