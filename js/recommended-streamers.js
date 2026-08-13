"use strict";

/* =========================================================
   STREAMERS RECOMMANDÉS — ACCUEIL COUAXIA
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

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


        if (
            !streamersContainer
        ) {

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


        const CATEGORY_ORDER = [

            "friends",
            "international",
            "favorites"

        ];


        /* =====================================================
           ÉTAT
        ====================================================== */

        let currentStreamers =
            [];

        let loading =
            false;


        /* =====================================================
           OUTILS
        ====================================================== */

        function normalizeString(
            value
        ) {

            return String(
                value ?? ""
            )
                .trim();
        }


        function escapeHtml(
            value
        ) {

            return String(
                value ?? ""
            )
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


        function normalizeCategory(
            value
        ) {

            const category =
                normalizeString(
                    value
                )
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


        function formatNumber(
            value
        ) {

            const number =
                Number(
                    value
                );


            if (
                !Number.isFinite(
                    number
                )
            ) {

                return "0";
            }


            return new Intl.NumberFormat(
                "fr-FR"
            ).format(
                number
            );
        }


        /* =====================================================
           NORMALISATION D'UN STREAMER
        ====================================================== */

        function normalizeStreamer(
            streamer
        ) {

            const login =
                normalizeString(
                    streamer?.login
                )
                    .toLowerCase();


            const displayName =
                normalizeString(
                    streamer?.displayName ||
                    streamer?.display_name ||
                    login
                );


            const profileImageUrl =
                normalizeString(
                    streamer?.profileImageUrl ||
                    streamer?.profile_image_url
                );


            const channelUrl =
                normalizeString(
                    streamer?.channelUrl ||
                    streamer?.channel_url
                ) ||
                (
                    login
                        ? `https://www.twitch.tv/${encodeURIComponent(
                            login
                        )}`
                        : ""
                );


            const gameName =
                normalizeString(
                    streamer?.gameName ||
                    streamer?.game_name
                );


            const viewerCount =
                Number(
                    streamer?.viewerCount ??
                    streamer?.viewer_count ??
                    0
                );


            return {

                ...streamer,

                login,

                displayName:
                    displayName ||
                    login ||
                    "Streamer",

                profileImageUrl,

                channelUrl,

                category:
                    normalizeCategory(
                        streamer?.category
                    ),

                live:
                    Boolean(
                        streamer?.live
                    ),

                gameName,

                viewerCount:
                    Number.isFinite(
                        viewerCount
                    )
                        ? viewerCount
                        : 0

            };
        }


        /* =====================================================
           AVATAR
        ====================================================== */

        function getAvatarUrl(
            streamer
        ) {

            const avatarUrl =
                normalizeString(
                    streamer
                        ?.profileImageUrl
                );


            if (
                avatarUrl
            ) {

                return avatarUrl;
            }


            return (
                "/images/logo/" +
                "Logo Transparents 2.png"
            );
        }


        /* =====================================================
           INFOBULLE
        ====================================================== */

        function createTooltipText(
            streamer
        ) {

            if (
                !streamer.live
            ) {

                return (
                    `${streamer.displayName} est hors ligne.`
                );
            }


            const parts = [

                `${streamer.displayName} est en direct`

            ];


            if (
                streamer.gameName
            ) {

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
                streamer.channelUrl;


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


                        ${
                            channelUrl
                                ?
                                `
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
                                        <span
                                            aria-hidden="true"
                                        >
                                            ↗
                                        </span>
                                    </a>
                                `
                                :
                                ""
                        }


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
           TRI D'UNE CATÉGORIE
        ====================================================== */

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

                    /* =========================================
                       LIVES EN PREMIER
                    ========================================== */

                    const liveDifference =
                        Number(
                            secondStreamer.live
                        ) -
                        Number(
                            firstStreamer.live
                        );


                    if (
                        liveDifference !==
                        0
                    ) {

                        return liveDifference;
                    }


                    /* =========================================
                       PLUS DE VIEWERS EN PREMIER
                       SI LES DEUX SONT EN LIVE
                    ========================================== */

                    if (
                        firstStreamer.live &&
                        secondStreamer.live
                    ) {

                        const viewerDifference =
                            Number(
                                secondStreamer
                                    .viewerCount
                            ) -
                            Number(
                                firstStreamer
                                    .viewerCount
                            );


                        if (
                            viewerDifference !==
                            0
                        ) {

                            return viewerDifference;
                        }
                    }


                    /* =========================================
                       ORDRE ALPHABÉTIQUE
                    ========================================== */

                    return String(
                        firstStreamer
                            .displayName
                    ).localeCompare(
                        String(
                            secondStreamer
                                .displayName
                        ),
                        "fr",
                        {
                            sensitivity:
                                "base"
                        }
                    );
                }
            );
        }


        /* =====================================================
           GROUPEMENT DES CATÉGORIES
        ====================================================== */

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
                streamer => {

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
                category => {

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
           CRÉATION D'UNE CATÉGORIE
        ====================================================== */

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
                !Array.isArray(
                    streamers
                ) ||
                streamers.length ===
                    0
            ) {

                return "";
            }


            const liveCount =
                streamers.filter(
                    streamer =>
                        Boolean(
                            streamer.live
                        )
                ).length;


            const liveText =
                liveCount > 0
                    ?
                    `
                        <span>
                            • ${liveCount}
                            en direct
                        </span>
                    `
                    :
                    "";


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
                                .join(
                                    ""
                                )
                        }
                    </div>

                </section>
            `;
        }


        /* =====================================================
           AFFICHAGE GLOBAL
        ====================================================== */

        function renderStreamers(
            streamers
        ) {

            if (
                !Array.isArray(
                    streamers
                ) ||
                streamers.length ===
                    0
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


                if (
                    resultsElement
                ) {

                    resultsElement.textContent =
                        "Aucune chaîne disponible.";
                }


                return;
            }


            const groups =
                groupStreamersByCategory(
                    streamers
                );


            const categoriesHtml =
                CATEGORY_ORDER
                    .map(
                        category => {

                            return createCategorySection(
                                category,
                                groups[
                                    category
                                ]
                            );
                        }
                    )
                    .filter(
                        Boolean
                    )
                    .join(
                        ""
                    );


            streamersContainer.innerHTML =
                categoriesHtml;


            /* =================================================
               COMPTEUR GLOBAL
            ================================================= */

            if (
                resultsElement
            ) {

                const liveCount =
                    streamers.filter(
                        streamer =>
                            Boolean(
                                streamer.live
                            )
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


            /* =================================================
               ÉVÉNEMENT
            ================================================= */

            document.dispatchEvent(
                new CustomEvent(
                    "couaxia:recommended-streamers-ready",
                    {
                        detail: {

                            streamers:
                                [
                                    ...streamers
                                ],

                            groups

                        }
                    }
                )
            );
        }


        /* =====================================================
           ERREUR
        ====================================================== */

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


            if (
                resultsElement
            ) {

                resultsElement.textContent =
                    "Impossible de charger les chaînes.";
            }


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
                loadRecommendedStreamers,
                {
                    once:
                        true
                }
            );
        }


        /* =====================================================
           LECTURE DE LA RÉPONSE
        ====================================================== */

        async function readResponse(
            response
        ) {

            const contentType =
                response.headers.get(
                    "content-type"
                ) ||
                "";


            if (
                contentType.includes(
                    "application/json"
                )
            ) {

                return response.json();
            }


            const text =
                await response.text();


            if (
                !text
            ) {

                return {};
            }


            try {

                return JSON.parse(
                    text
                );


            } catch {

                return {

                    error:
                        text

                };
            }
        }


        /* =====================================================
           CHARGEMENT API
        ====================================================== */

        async function loadRecommendedStreamers() {

            if (
                loading
            ) {

                return currentStreamers;
            }


            loading =
                true;


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


            if (
                resultsElement
            ) {

                resultsElement.textContent =
                    "Chargement…";
            }


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
                    await readResponse(
                        response
                    );


                if (
                    !response.ok ||
                    data?.success !==
                        true
                ) {

                    throw new Error(
                        data?.details ||
                        data?.error ||
                        `Erreur HTTP ${response.status}`
                    );
                }


                const rawStreamers =
                    Array.isArray(
                        data?.streamers
                    )
                        ? data.streamers
                        : [];


                currentStreamers =
                    rawStreamers
                        .map(
                            normalizeStreamer
                        )
                        .filter(
                            streamer =>
                                Boolean(
                                    streamer.login
                                )
                        );


                renderStreamers(
                    currentStreamers
                );


                return currentStreamers;


            } catch (
                error
            ) {

                const message =
                    error instanceof Error
                        ? error.message
                        : String(
                            error
                        );


                currentStreamers =
                    [];


                renderError(
                    message
                );


                return [];


            } finally {

                loading =
                    false;


                streamersContainer.setAttribute(
                    "aria-busy",
                    "false"
                );
            }
        }


        /* =====================================================
           API PUBLIQUE
        ====================================================== */

        window.CouaxiaRecommendedStreamers = {

            /**
             * Recharge les streamers.
             */
            reload() {

                return loadRecommendedStreamers();
            },


            /**
             * Retourne les données actuellement
             * chargées.
             */
            getStreamers() {

                return [
                    ...currentStreamers
                ];
            },


            /**
             * Retourne uniquement les lives.
             */
            getLiveStreamers() {

                return currentStreamers
                    .filter(
                        streamer =>
                            streamer.live
                    );
            }

        };


        /* =====================================================
           DÉMARRAGE
        ====================================================== */

        loadRecommendedStreamers();
    }
);