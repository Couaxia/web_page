"use strict";

/* =========================================================
   TWITCH LIVE — COUAXIA
   Backend : Render + Express
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =====================================================
           CONFIGURATION
        ====================================================== */

        const TWITCH_CHANNEL =
            "couaxia";

        /*
         * API servie par notre backend Express.
         *
         * Le navigateur ne communique jamais directement
         * avec l'API Twitch pour récupérer les données.
         */
        const TWITCH_API_URL =
            "/api/twitch-status";


        /*
         * Actualisation automatique :
         * toutes les 60 secondes.
         */
        const REFRESH_DELAY =
            60_000;


        /*
         * Nombre de clips / vidéos
         * affichés par page.
         */
        const MEDIA_PER_PAGE =
            4;


        /* =====================================================
           ÉLÉMENTS HTML
        ====================================================== */

        const statusPill =
            document.getElementById(
                "twitch-status-pill"
            );

        const statusLabel =
            document.getElementById(
                "twitch-status-label"
            );

        const followersCount =
            document.getElementById(
                "twitch-followers-count"
            );

        const viewerCount =
            document.getElementById(
                "twitch-viewer-count"
            );

        const streamLanguage =
            document.getElementById(
                "twitch-stream-language"
            );

        const streamHeading =
            document.getElementById(
                "twitch-stream-heading"
            );

        const streamSubtitle =
            document.getElementById(
                "twitch-stream-subtitle"
            );

        const playerBadge =
            document.getElementById(
                "twitch-player-badge"
            );

        const player =
            document.getElementById(
                "twitch-player"
            );

        const gameName =
            document.getElementById(
                "twitch-game-name"
            );

        const startedAt =
            document.getElementById(
                "twitch-started-at"
            );

        const apiMessage =
            document.getElementById(
                "twitch-api-message"
            );

        const refreshButton =
            document.getElementById(
                "twitch-refresh-button"
            );

        const clipsList =
            document.getElementById(
                "twitch-clips-list"
            );

        const videosList =
            document.getElementById(
                "twitch-videos-list"
            );

        const clipsPagination =
            document.getElementById(
                "twitch-clips-pagination"
            );

        const videosPagination =
            document.getElementById(
                "twitch-videos-pagination"
            );


        /* =====================================================
           ÉTAT
        ====================================================== */

        let currentClipsPage =
            1;

        let currentVideosPage =
            1;

        let storedClips =
            [];

        let storedVideos =
            [];

        let isLoading =
            false;


        /* =====================================================
           OUTILS GÉNÉRAUX
        ====================================================== */

        /**
         * Masque un élément.
         */
        function hideElement(
            element
        ) {

            element?.classList.add(
                "is-hidden"
            );
        }


        /**
         * Affiche un élément.
         */
        function showElement(
            element
        ) {

            element?.classList.remove(
                "is-hidden"
            );
        }


        /**
         * Modifie le texte d'un élément.
         */
        function setText(
            element,
            value
        ) {

            if (
                !element
            ) {

                return;
            }


            element.textContent =
                String(
                    value ?? ""
                );
        }


        /**
         * Retourne la première valeur réellement définie.
         */
        function firstDefined(
            ...values
        ) {

            return values.find(
                value => {

                    if (
                        value === undefined ||
                        value === null
                    ) {

                        return false;
                    }


                    if (
                        typeof value ===
                        "string"
                    ) {

                        const normalized =
                            value
                                .trim()
                                .toLowerCase();


                        return (
                            normalized !== "" &&
                            normalized !== "undefined" &&
                            normalized !== "null" &&
                            normalized !== "nan"
                        );
                    }


                    return true;
                }
            );
        }


        /**
         * Convertit une valeur en nombre.
         */
        function toNumber(
            value,
            fallback = 0
        ) {

            const number =
                Number(
                    value
                );


            return Number.isFinite(
                number
            )
                ? number
                : fallback;
        }


        /**
         * Formate un nombre en français.
         */
        function formatNumber(
            value
        ) {

            return toNumber(
                value
            )
                .toLocaleString(
                    "fr-FR"
                );
        }


        /**
         * Échappe une valeur HTML.
         */
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


        /**
         * Retourne toujours un tableau.
         */
        function getArray(
            value
        ) {

            return Array.isArray(
                value
            )
                ? value
                : [];
        }


        /* =====================================================
           MINIATURES TWITCH
        ====================================================== */

        function formatThumbnail(
            value,
            width = 640,
            height = 360
        ) {

            return String(
                value ||
                ""
            )
                .replaceAll(
                    "%{width}",
                    String(
                        width
                    )
                )
                .replaceAll(
                    "%{height}",
                    String(
                        height
                    )
                )
                .replaceAll(
                    "{width}",
                    String(
                        width
                    )
                )
                .replaceAll(
                    "{height}",
                    String(
                        height
                    )
                );
        }


        /* =====================================================
           DATE
        ====================================================== */

        function formatDateTime(
            value
        ) {

            if (
                !value
            ) {

                return "—";
            }


            const date =
                new Date(
                    String(
                        value
                    )
                );


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {

                return "—";
            }


            return new Intl.DateTimeFormat(
                "fr-FR",
                {
                    dateStyle:
                        "short",

                    timeStyle:
                        "short"
                }
            )
                .format(
                    date
                );
        }


        /* =====================================================
           DURÉE DU LIVE
        ====================================================== */

        function formatLiveDuration(
            value
        ) {

            if (
                !value
            ) {

                return "—";
            }


            const start =
                new Date(
                    value
                );


            if (
                Number.isNaN(
                    start.getTime()
                )
            ) {

                return "—";
            }


            const difference =
                Math.max(
                    Date.now() -
                    start.getTime(),
                    0
                );


            const totalMinutes =
                Math.floor(
                    difference /
                    60_000
                );


            const hours =
                Math.floor(
                    totalMinutes /
                    60
                );


            const minutes =
                totalMinutes %
                60;


            if (
                hours >
                0
            ) {

                return (
                    `${hours} h ` +
                    `${String(
                        minutes
                    ).padStart(
                        2,
                        "0"
                    )}`
                );
            }


            return `${minutes} min`;
        }


        /* =====================================================
           NORMALISATION API
        ====================================================== */

        function getFollowerTotal(
            data
        ) {

            return toNumber(
                firstDefined(
                    data?.followers,
                    data?.followerCount,
                    data?.resources
                        ?.followers
                        ?.total,
                    0
                )
            );
        }


        function getViewerTotal(
            data
        ) {

            return toNumber(
                firstDefined(
                    data?.stream
                        ?.viewers,
                    data?.viewers,
                    data?.viewerCount,
                    0
                )
            );
        }


        function getLiveStatus(
            data
        ) {

            return (
                data?.live ===
                    true ||
                data?.stream
                    ?.live ===
                    true
            );
        }


        function getStreamTitle(
            data
        ) {

            return String(
                firstDefined(
                    data?.stream
                        ?.title,
                    data?.title,
                    ""
                ) ??
                ""
            );
        }


        function getGameName(
            data
        ) {

            return String(
                firstDefined(
                    data?.stream
                        ?.category,
                    data?.stream
                        ?.gameName,
                    data?.game
                        ?.name,
                    data?.category,
                    ""
                ) ??
                ""
            );
        }


        function getStreamLanguage(
            data
        ) {

            return String(
                firstDefined(
                    data?.stream
                        ?.language,
                    data?.language,
                    ""
                ) ??
                ""
            )
                .trim()
                .toUpperCase();
        }


        function getStartedAt(
            data
        ) {

            return String(
                firstDefined(
                    data?.stream
                        ?.startedAt,
                    data?.startedAt,
                    ""
                ) ??
                ""
            );
        }


        function getStreamThumbnail(
            data
        ) {

            const thumbnail =
                firstDefined(
                    data?.stream
                        ?.thumbnailUrl,
                    data?.thumbnailUrl,
                    ""
                );


            return formatThumbnail(
                thumbnail,
                1280,
                720
            );
        }


        function getDisplayName(
            data
        ) {

            return String(
                firstDefined(
                    data?.user
                        ?.displayName,
                    data?.stream
                        ?.displayName,
                    data?.displayName,
                    TWITCH_CHANNEL
                )
            );
        }


        function getProfileImage(
            data
        ) {

            return String(
                firstDefined(
                    data?.user
                        ?.profileImageUrl,
                    data?.profileImageUrl,
                    ""
                ) ??
                ""
            );
        }


        function getTwitchChannelUrl(
            data
        ) {

            return String(
                firstDefined(
                    data?.user
                        ?.twitchUrl,
                    data?.stream
                        ?.twitchUrl,
                    `https://www.twitch.tv/${TWITCH_CHANNEL}`
                )
            );
        }


        function getClips(
            data
        ) {

            const candidates = [

                data?.clips,

                data?.resources
                    ?.clips
                    ?.clips,

                data?.clips
                    ?.clips

            ];


            for (
                const candidate of
                candidates
            ) {

                if (
                    Array.isArray(
                        candidate
                    )
                ) {

                    return candidate;
                }
            }


            return [];
        }


        function getVideos(
            data
        ) {

            const candidates = [

                data?.videos,

                data?.resources
                    ?.videos
                    ?.videos,

                data?.videos
                    ?.videos

            ];


            for (
                const candidate of
                candidates
            ) {

                if (
                    Array.isArray(
                        candidate
                    )
                ) {

                    return candidate;
                }
            }


            return [];
        }


        function getApiMessage(
            data
        ) {

            return String(
                firstDefined(
                    data?.message,
                    data?.statusMessage,
                    ""
                ) ??
                ""
            );
        }


        /* =====================================================
           MESSAGE API
        ====================================================== */

        function showApiMessage(
            message,
            type = "info"
        ) {

            if (
                !apiMessage
            ) {

                return;
            }


            if (
                !message
            ) {

                hideElement(
                    apiMessage
                );


                apiMessage.textContent =
                    "";


                apiMessage.classList.remove(
                    "is-success",
                    "is-error",
                    "is-info"
                );


                return;
            }


            apiMessage.textContent =
                message;


            apiMessage.classList.remove(
                "is-success",
                "is-error",
                "is-info"
            );


            apiMessage.classList.add(
                `is-${type}`
            );


            showElement(
                apiMessage
            );
        }


        /* =====================================================
           STATUT LIVE
        ====================================================== */

        function updateStatusPill(
            isLive
        ) {

            if (
                statusPill
            ) {

                statusPill.classList.toggle(
                    "is-live",
                    isLive
                );


                statusPill.classList.toggle(
                    "is-offline",
                    !isLive
                );
            }


            setText(
                statusLabel,
                isLive
                    ? "En direct"
                    : "Hors ligne"
            );
        }


        /* =====================================================
           STATISTIQUES
        ====================================================== */

        function updateStatistics(
            data
        ) {

            const followers =
                getFollowerTotal(
                    data
                );


            const viewers =
                getViewerTotal(
                    data
                );


            setText(
                followersCount,
                formatNumber(
                    followers
                )
            );


            setText(
                viewerCount,
                formatNumber(
                    viewers
                )
            );
        }


        /* =====================================================
           INFORMATIONS DU LIVE
        ====================================================== */

        function updateStreamInformation(
            data,
            isLive
        ) {

            const displayName =
                getDisplayName(
                    data
                );


            const title =
                getStreamTitle(
                    data
                );


            const category =
                getGameName(
                    data
                );


            const language =
                getStreamLanguage(
                    data
                );


            const liveStartedAt =
                getStartedAt(
                    data
                );


            /* =================================================
               LIVE
            ================================================= */

            if (
                isLive
            ) {

                setText(
                    streamHeading,
                    title ||
                    `${displayName} est en direct`
                );


                setText(
                    streamSubtitle,
                    category
                        ? `En direct sur ${category}`
                        : `${displayName} diffuse actuellement`
                );


                setText(
                    gameName,
                    category ||
                    "Non renseigné"
                );


                setText(
                    streamLanguage,
                    language ||
                    "—"
                );


                setText(
                    startedAt,
                    liveStartedAt
                        ? formatLiveDuration(
                            liveStartedAt
                        )
                        : "—"
                );


                if (
                    startedAt &&
                    liveStartedAt
                ) {

                    startedAt.title =
                        `Live commencé le ${formatDateTime(
                            liveStartedAt
                        )}`;
                }


                return;
            }


            /* =================================================
               HORS LIGNE
            ================================================= */

            setText(
                streamHeading,
                `${displayName} est hors ligne`
            );


            setText(
                streamSubtitle,
                "Retrouvez les derniers clips et les dernières vidéos."
            );


            setText(
                gameName,
                "Hors ligne"
            );


            setText(
                streamLanguage,
                "—"
            );


            setText(
                startedAt,
                "—"
            );


            if (
                startedAt
            ) {

                startedAt.removeAttribute(
                    "title"
                );
            }
        }


        /* =====================================================
           LECTEUR TWITCH
        ====================================================== */

        /**
         * Twitch exige le paramètre parent.
         *
         * window.location.hostname fonctionne automatiquement
         * avec localhost et avec le domaine Render.
         */
        function createTwitchPlayerUrl() {

            const parent =
                window.location.hostname ||
                "localhost";


            const parameters =
                new URLSearchParams({

                    channel:
                        TWITCH_CHANNEL,

                    parent,

                    autoplay:
                        "false",

                    muted:
                        "true"

                });


            return (
                "https://player.twitch.tv/?" +
                parameters.toString()
            );
        }


        function updatePlayer(
            isLive,
            data
        ) {

            if (
                !player
            ) {

                console.warn(
                    "[Twitch] #twitch-player est introuvable."
                );

                return;
            }


            if (
                player.tagName
                    .toLowerCase() !==
                "iframe"
            ) {

                console.error(
                    "[Twitch] #twitch-player doit être un <iframe>."
                );

                return;
            }


            const playerUrl =
                createTwitchPlayerUrl();


            const currentSource =
                player.getAttribute(
                    "src"
                );


            /*
             * Ne recharge pas le lecteur toutes
             * les 60 secondes inutilement.
             */
            if (
                currentSource !==
                playerUrl
            ) {

                player.setAttribute(
                    "src",
                    playerUrl
                );
            }


            player.setAttribute(
                "title",
                isLive
                    ? `Live Twitch de ${getDisplayName(
                        data
                    )}`
                    : `Chaîne Twitch hors ligne de ${getDisplayName(
                        data
                    )}`
            );


            player.setAttribute(
                "allow",
                "autoplay; fullscreen"
            );


            player.setAttribute(
                "allowfullscreen",
                ""
            );


            player.setAttribute(
                "scrolling",
                "no"
            );


            player.setAttribute(
                "frameborder",
                "0"
            );


            /*
             * Le lecteur reste toujours visible,
             * même lorsque la chaîne est hors ligne.
             */
            showElement(
                player
            );


            if (
                playerBadge
            ) {

                playerBadge.classList.toggle(
                    "is-live",
                    isLive
                );


                playerBadge.classList.toggle(
                    "is-offline",
                    !isLive
                );
            }


            setText(
                playerBadge,
                isLive
                    ? "LIVE"
                    : "HORS LIGNE"
            );
        }


        /* =====================================================
           CLIP TWITCH
        ====================================================== */

        function createClipCard(
            clip
        ) {

            const title =
                String(
                    firstDefined(
                        clip?.title,
                        "Clip Twitch"
                    )
                );


            const url =
                String(
                    firstDefined(
                        clip?.url,
                        `https://www.twitch.tv/${TWITCH_CHANNEL}`
                    )
                );


            const thumbnail =
                formatThumbnail(
                    firstDefined(
                        clip?.thumbnailUrl,
                        clip?.thumbnail_url,
                        ""
                    ),
                    640,
                    360
                );


            const creator =
                String(
                    firstDefined(
                        clip?.creatorName,
                        clip?.creator_name,
                        clip?.broadcasterName,
                        clip?.broadcaster_name,
                        TWITCH_CHANNEL
                    )
                );


            const views =
                toNumber(
                    firstDefined(
                        clip?.viewCount,
                        clip?.view_count,
                        0
                    )
                );


            const createdAt =
                firstDefined(
                    clip?.createdAt,
                    clip?.created_at,
                    ""
                );


            return `
                <article
                    class="
                        twitch-media-card
                        twitch-clip-card
                    "
                >

                    <a
                        class="twitch-media-link"
                        href="${escapeHtml(
                            url
                        )}"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Regarder le clip ${escapeHtml(
                            title
                        )} sur Twitch"
                    >

                        <div
                            class="
                                twitch-media-thumbnail-wrapper
                            "
                        >

                            ${
                                thumbnail
                                    ?
                                    `
                                        <img
                                            class="
                                                twitch-media-thumbnail
                                            "
                                            src="${escapeHtml(
                                                thumbnail
                                            )}"
                                            alt="Miniature du clip ${escapeHtml(
                                                title
                                            )}"
                                            loading="lazy"
                                            decoding="async"
                                        >
                                    `
                                    :
                                    `
                                        <div
                                            class="
                                                twitch-media-thumbnail
                                                twitch-media-thumbnail-placeholder
                                            "
                                        >
                                            Aucun aperçu
                                        </div>
                                    `
                            }


                            <span
                                class="
                                    twitch-media-type
                                "
                            >
                                Clip
                            </span>

                        </div>


                        <div
                            class="
                                twitch-media-content
                            "
                        >

                            <h3
                                class="
                                    twitch-media-title
                                "
                            >
                                ${escapeHtml(
                                    title
                                )}
                            </h3>


                            <p
                                class="
                                    twitch-media-meta
                                "
                            >
                                Par ${escapeHtml(
                                    creator
                                )}
                            </p>


                            <p
                                class="
                                    twitch-media-meta
                                "
                            >
                                ${formatNumber(
                                    views
                                )} vue${
                                    views > 1
                                        ? "s"
                                        : ""
                                }
                            </p>


                            ${
                                createdAt
                                    ?
                                    `
                                        <time
                                            class="
                                                twitch-media-date
                                            "
                                            datetime="${escapeHtml(
                                                createdAt
                                            )}"
                                        >
                                            ${escapeHtml(
                                                formatDateTime(
                                                    createdAt
                                                )
                                            )}
                                        </time>
                                    `
                                    :
                                    ""
                            }

                        </div>

                    </a>

                </article>
            `;
        }


        /* =====================================================
           VIDÉO TWITCH
        ====================================================== */

        function createVideoCard(
            video
        ) {

            const title =
                String(
                    firstDefined(
                        video?.title,
                        "Vidéo Twitch"
                    )
                );


            const url =
                String(
                    firstDefined(
                        video?.url,
                        `https://www.twitch.tv/${TWITCH_CHANNEL}/videos`
                    )
                );


            const thumbnail =
                formatThumbnail(
                    firstDefined(
                        video?.thumbnailUrl,
                        video?.thumbnail_url,
                        ""
                    ),
                    640,
                    360
                );


            const views =
                toNumber(
                    firstDefined(
                        video?.viewCount,
                        video?.view_count,
                        0
                    )
                );


            const duration =
                String(
                    firstDefined(
                        video?.formattedDuration,
                        video?.duration,
                        ""
                    )
                );


            const publishedAt =
                firstDefined(
                    video?.publishedAt,
                    video?.published_at,
                    video?.createdAt,
                    video?.created_at,
                    ""
                );


            const description =
                String(
                    firstDefined(
                        video?.description,
                        ""
                    )
                );


            return `
                <article
                    class="
                        twitch-media-card
                        twitch-video-card
                    "
                >

                    <a
                        class="twitch-media-link"
                        href="${escapeHtml(
                            url
                        )}"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Regarder la vidéo ${escapeHtml(
                            title
                        )} sur Twitch"
                    >

                        <div
                            class="
                                twitch-media-thumbnail-wrapper
                            "
                        >

                            ${
                                thumbnail
                                    ?
                                    `
                                        <img
                                            class="
                                                twitch-media-thumbnail
                                            "
                                            src="${escapeHtml(
                                                thumbnail
                                            )}"
                                            alt="Miniature de la vidéo ${escapeHtml(
                                                title
                                            )}"
                                            loading="lazy"
                                            decoding="async"
                                        >
                                    `
                                    :
                                    `
                                        <div
                                            class="
                                                twitch-media-thumbnail
                                                twitch-media-thumbnail-placeholder
                                            "
                                        >
                                            Aucun aperçu
                                        </div>
                                    `
                            }


                            <span
                                class="
                                    twitch-media-type
                                "
                            >
                                Vidéo
                            </span>


                            ${
                                duration
                                    ?
                                    `
                                        <span
                                            class="
                                                twitch-media-duration
                                            "
                                        >
                                            ${escapeHtml(
                                                duration
                                            )}
                                        </span>
                                    `
                                    :
                                    ""
                            }

                        </div>


                        <div
                            class="
                                twitch-media-content
                            "
                        >

                            <h3
                                class="
                                    twitch-media-title
                                "
                            >
                                ${escapeHtml(
                                    title
                                )}
                            </h3>


                            <p
                                class="
                                    twitch-media-meta
                                "
                            >
                                ${formatNumber(
                                    views
                                )} vue${
                                    views > 1
                                        ? "s"
                                        : ""
                                }
                            </p>


                            ${
                                publishedAt
                                    ?
                                    `
                                        <time
                                            class="
                                                twitch-media-date
                                            "
                                            datetime="${escapeHtml(
                                                publishedAt
                                            )}"
                                        >
                                            ${escapeHtml(
                                                formatDateTime(
                                                    publishedAt
                                                )
                                            )}
                                        </time>
                                    `
                                    :
                                    ""
                            }


                            ${
                                description
                                    ?
                                    `
                                        <p
                                            class="
                                                twitch-media-description
                                            "
                                        >
                                            ${escapeHtml(
                                                description
                                            )}
                                        </p>
                                    `
                                    :
                                    ""
                            }

                        </div>

                    </a>

                </article>
            `;
        }


        /* =====================================================
           PAGINATION
        ====================================================== */

        function renderPagination(
            container,
            currentPage,
            totalPages,
            onPageChange
        ) {

            if (
                !container
            ) {

                return;
            }


            container.innerHTML =
                "";


            if (
                totalPages <=
                1
            ) {

                hideElement(
                    container
                );

                return;
            }


            showElement(
                container
            );


            /* =================================================
               PRÉCÉDENT
            ================================================= */

            const previousButton =
                document.createElement(
                    "button"
                );


            previousButton.type =
                "button";


            previousButton.className =
                [
                    "twitch-pagination-button",
                    "twitch-pagination-previous"
                ].join(
                    " "
                );


            previousButton.innerHTML =
                '<span aria-hidden="true">←</span> Précédent';


            previousButton.setAttribute(
                "aria-label",
                "Afficher la page précédente"
            );


            previousButton.disabled =
                currentPage <=
                1;


            previousButton.addEventListener(
                "click",
                () => {

                    if (
                        currentPage >
                        1
                    ) {

                        onPageChange(
                            currentPage -
                            1
                        );
                    }
                }
            );


            /* =================================================
               NUMÉRO DE PAGE
            ================================================= */

            const pageIndicator =
                document.createElement(
                    "span"
                );


            pageIndicator.className =
                "twitch-pagination-indicator";


            pageIndicator.textContent =
                `Page ${currentPage} / ${totalPages}`;


            pageIndicator.setAttribute(
                "aria-live",
                "polite"
            );


            /* =================================================
               SUIVANT
            ================================================= */

            const nextButton =
                document.createElement(
                    "button"
                );


            nextButton.type =
                "button";


            nextButton.className =
                [
                    "twitch-pagination-button",
                    "twitch-pagination-next"
                ].join(
                    " "
                );


            nextButton.innerHTML =
                'Suivant <span aria-hidden="true">→</span>';


            nextButton.setAttribute(
                "aria-label",
                "Afficher la page suivante"
            );


            nextButton.disabled =
                currentPage >=
                totalPages;


            nextButton.addEventListener(
                "click",
                () => {

                    if (
                        currentPage <
                        totalPages
                    ) {

                        onPageChange(
                            currentPage +
                            1
                        );
                    }
                }
            );


            container.append(
                previousButton,
                pageIndicator,
                nextButton
            );
        }


        /* =====================================================
           AFFICHAGE DES CLIPS
        ====================================================== */

        function renderClips(
            clips,
            requestedPage =
                currentClipsPage
        ) {

            if (
                !clipsList
            ) {

                return;
            }


            storedClips =
                getArray(
                    clips
                );


            if (
                storedClips.length ===
                0
            ) {

                clipsList.innerHTML = `
                    <p
                        class="
                            twitch-empty-message
                        "
                    >
                        Aucun clip disponible pour le moment.
                    </p>
                `;


                currentClipsPage =
                    1;


                if (
                    clipsPagination
                ) {

                    clipsPagination.innerHTML =
                        "";


                    hideElement(
                        clipsPagination
                    );
                }


                return;
            }


            const totalPages =
                Math.ceil(
                    storedClips.length /
                    MEDIA_PER_PAGE
                );


            currentClipsPage =
                Math.min(
                    Math.max(
                        requestedPage,
                        1
                    ),
                    totalPages
                );


            const startIndex =
                (
                    currentClipsPage -
                    1
                ) *
                MEDIA_PER_PAGE;


            const endIndex =
                startIndex +
                MEDIA_PER_PAGE;


            const visibleClips =
                storedClips.slice(
                    startIndex,
                    endIndex
                );


            clipsList.innerHTML =
                visibleClips
                    .map(
                        createClipCard
                    )
                    .join(
                        ""
                    );


            renderPagination(
                clipsPagination,
                currentClipsPage,
                totalPages,
                page => {

                    renderClips(
                        storedClips,
                        page
                    );


                    clipsList.scrollIntoView({
                        behavior:
                            "smooth",

                        block:
                            "start"
                    });
                }
            );
        }


        /* =====================================================
           AFFICHAGE DES VIDÉOS
        ====================================================== */

        function renderVideos(
            videos,
            requestedPage =
                currentVideosPage
        ) {

            if (
                !videosList
            ) {

                return;
            }


            storedVideos =
                getArray(
                    videos
                );


            if (
                storedVideos.length ===
                0
            ) {

                videosList.innerHTML = `
                    <p
                        class="
                            twitch-empty-message
                        "
                    >
                        Aucune vidéo disponible pour le moment.
                    </p>
                `;


                currentVideosPage =
                    1;


                if (
                    videosPagination
                ) {

                    videosPagination.innerHTML =
                        "";


                    hideElement(
                        videosPagination
                    );
                }


                return;
            }


            const totalPages =
                Math.ceil(
                    storedVideos.length /
                    MEDIA_PER_PAGE
                );


            currentVideosPage =
                Math.min(
                    Math.max(
                        requestedPage,
                        1
                    ),
                    totalPages
                );


            const startIndex =
                (
                    currentVideosPage -
                    1
                ) *
                MEDIA_PER_PAGE;


            const endIndex =
                startIndex +
                MEDIA_PER_PAGE;


            const visibleVideos =
                storedVideos.slice(
                    startIndex,
                    endIndex
                );


            videosList.innerHTML =
                visibleVideos
                    .map(
                        createVideoCard
                    )
                    .join(
                        ""
                    );


            renderPagination(
                videosPagination,
                currentVideosPage,
                totalPages,
                page => {

                    renderVideos(
                        storedVideos,
                        page
                    );


                    videosList.scrollIntoView({
                        behavior:
                            "smooth",

                        block:
                            "start"
                    });
                }
            );
        }


        /* =====================================================
           MISE À JOUR GÉNÉRALE
        ====================================================== */

        function updateInterface(
            data
        ) {

            const isLive =
                getLiveStatus(
                    data
                );


            const clips =
                getClips(
                    data
                );


            const videos =
                getVideos(
                    data
                );


            updateStatusPill(
                isLive
            );


            updateStatistics(
                data
            );


            updateStreamInformation(
                data,
                isLive
            );


            updatePlayer(
                isLive,
                data
            );


            /*
             * À chaque actualisation des données,
             * on revient à la première page.
             */
            currentClipsPage =
                1;

            currentVideosPage =
                1;


            renderClips(
                clips,
                currentClipsPage
            );


            renderVideos(
                videos,
                currentVideosPage
            );


            const message =
                getApiMessage(
                    data
                );


            if (
                message
            ) {

                showApiMessage(
                    message,
                    "success"
                );

                return;
            }


            showApiMessage(
                isLive
                    ? "Les informations du live ont été mises à jour."
                    : "La chaîne est actuellement hors ligne.",
                "success"
            );


            /* =================================================
               ÉVÉNEMENT
            ================================================= */

            document.dispatchEvent(
                new CustomEvent(
                    "couaxia:twitch-updated",
                    {
                        detail: {

                            live:
                                isLive,

                            data

                        }
                    }
                )
            );
        }


        /* =====================================================
           APPEL API RENDER / EXPRESS
        ====================================================== */

        async function fetchTwitchData() {

            const response =
                await fetch(
                    TWITCH_API_URL,
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


            const contentType =
                response.headers.get(
                    "content-type"
                ) ||
                "";


            let data;


            /* =================================================
               JSON
            ================================================= */

            if (
                contentType.includes(
                    "application/json"
                )
            ) {

                data =
                    await response.json();

            } else {

                const text =
                    await response.text();


                throw new Error(
                    text
                        ? `L'API Twitch a renvoyé une réponse invalide : ${text}`
                        : "L'API Twitch n'a renvoyé aucune donnée."
                );
            }


            /* =================================================
               ERREUR HTTP
            ================================================= */

            if (
                !response.ok
            ) {

                const errorMessage =
                    firstDefined(
                        data?.details,
                        data?.error,
                        data?.message,
                        `Erreur HTTP ${response.status}`
                    );


                throw new Error(
                    String(
                        errorMessage
                    )
                );
            }


            /* =================================================
               VALIDATION
            ================================================= */

            if (
                !data ||
                typeof data !==
                    "object"
            ) {

                throw new Error(
                    "La réponse de l'API Twitch est vide ou invalide."
                );
            }


            if (
                data.success ===
                false
            ) {

                throw new Error(
                    String(
                        firstDefined(
                            data?.details,
                            data?.error,
                            "Impossible de récupérer les informations Twitch."
                        )
                    )
                );
            }


            return data;
        }


        /* =====================================================
           CHARGEMENT
        ====================================================== */

        function setLoadingState(
            loading
        ) {

            isLoading =
                loading;


            if (
                !refreshButton
            ) {

                return;
            }


            refreshButton.disabled =
                loading;


            refreshButton.classList.toggle(
                "is-loading",
                loading
            );


            refreshButton.setAttribute(
                "aria-busy",
                String(
                    loading
                )
            );


            refreshButton.setAttribute(
                "aria-label",
                loading
                    ? "Actualisation des informations Twitch en cours"
                    : "Actualiser les informations Twitch"
            );
        }


        async function loadTwitchData(
            manualRefresh = false
        ) {

            if (
                isLoading
            ) {

                return;
            }


            setLoadingState(
                true
            );


            if (
                manualRefresh
            ) {

                showApiMessage(
                    "Actualisation des informations Twitch…",
                    "info"
                );
            }


            try {

                const data =
                    await fetchTwitchData();


                updateInterface(
                    data
                );


                console.info(
                    "[Twitch] Données reçues :",
                    data
                );


            } catch (
                error
            ) {

                console.error(
                    "[Twitch] Impossible de charger les données :",
                    error
                );


                /*
                 * Même si notre API échoue,
                 * le lecteur Twitch officiel reste visible.
                 */
                updatePlayer(
                    false,
                    {
                        displayName:
                            TWITCH_CHANNEL
                    }
                );


                updateStatusPill(
                    false
                );


                setText(
                    viewerCount,
                    "0"
                );


                setText(
                    streamLanguage,
                    "—"
                );


                setText(
                    startedAt,
                    "—"
                );


                showApiMessage(
                    error instanceof Error
                        ? error.message
                        : "Une erreur inconnue est survenue lors du chargement de Twitch.",
                    "error"
                );


                document.dispatchEvent(
                    new CustomEvent(
                        "couaxia:twitch-error",
                        {
                            detail: {
                                error
                            }
                        }
                    )
                );


            } finally {

                setLoadingState(
                    false
                );
            }
        }


        /* =====================================================
           BOUTON D'ACTUALISATION
        ====================================================== */

        if (
            refreshButton
        ) {

            refreshButton.addEventListener(
                "click",
                () => {

                    loadTwitchData(
                        true
                    );
                }
            );
        }


        /* =====================================================
           API PUBLIQUE JS
        ====================================================== */

        window.CouaxiaTwitchLive = {

            /**
             * Force une actualisation.
             */
            reload() {

                return loadTwitchData(
                    true
                );
            },


            /**
             * Retourne l'adresse de notre API.
             */
            getApiUrl() {

                return TWITCH_API_URL;
            },


            /**
             * Retourne le login Twitch.
             */
            getChannel() {

                return TWITCH_CHANNEL;
            }

        };


        /* =====================================================
           PREMIER AFFICHAGE DU LECTEUR
        ====================================================== */

        /*
         * Le lecteur officiel Twitch apparaît immédiatement,
         * sans attendre que /api/twitch-status ait répondu.
         */
        updatePlayer(
            false,
            {
                displayName:
                    TWITCH_CHANNEL
            }
        );


        /* =====================================================
           PREMIER CHARGEMENT
        ====================================================== */

        loadTwitchData();


        /* =====================================================
           ACTUALISATION AUTOMATIQUE
        ====================================================== */

        const refreshInterval =
            window.setInterval(
                () => {

                    /*
                     * Pas besoin de contacter Twitch
                     * lorsque l'onglet est caché.
                     */
                    if (
                        document.visibilityState ===
                        "visible"
                    ) {

                        loadTwitchData();
                    }

                },
                REFRESH_DELAY
            );


        /* =====================================================
           RETOUR SUR L'ONGLET
        ====================================================== */

        document.addEventListener(
            "visibilitychange",
            () => {

                if (
                    document.visibilityState ===
                    "visible"
                ) {

                    loadTwitchData();
                }
            }
        );


        /* =====================================================
           NETTOYAGE
        ====================================================== */

        window.addEventListener(
            "beforeunload",
            () => {

                window.clearInterval(
                    refreshInterval
                );
            }
        );


        console.info(
            "[Twitch] Module Twitch Live initialisé."
        );
    }
);