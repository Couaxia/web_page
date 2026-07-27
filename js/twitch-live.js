"use strict";

document.addEventListener("DOMContentLoaded", () => {
    /* =========================================================
       CONFIGURATION
    ========================================================= */

    const TWITCH_CHANNEL =
        "couaxia";

    /*
     * Ta fonction Vercel se trouve actuellement ici :
     *
     * WEB_PAGE/twitch/api/twitch-status.js
     *
     * L’URL publique correspond donc à :
     *
     * /twitch/api/twitch-status
     *
     * La deuxième route est conservée comme solution de secours
     * si tu déplaces plus tard twitch-status.js dans /api.
     */
    const TWITCH_API_URLS = [
        "/twitch/api/twitch-status",
        "/api/twitch-status"
    ];

    /*
     * Nouvelle vérification automatique toutes les 60 secondes.
     */
    const REFRESH_DELAY =
        60_000;


    /* =========================================================
       ÉLÉMENTS HTML
    ========================================================= */

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


    /* =========================================================
       OUTILS GÉNÉRAUX
    ========================================================= */

    /**
     * Masque un élément.
     *
     * @param {HTMLElement|null} element
     */
    function hideElement(element) {
        element?.classList.add(
            "is-hidden"
        );
    }


    /**
     * Affiche un élément.
     *
     * @param {HTMLElement|null} element
     */
    function showElement(element) {
        element?.classList.remove(
            "is-hidden"
        );
    }


    /**
     * Retourne la première valeur définie.
     *
     * @param  {...unknown} values
     * @returns {unknown}
     */
    function firstDefined(...values) {
        return values.find(
            (value) =>
                value !== undefined &&
                value !== null &&
                value !== ""
        );
    }


    /**
     * Convertit une valeur en nombre fiable.
     *
     * @param {unknown} value
     * @param {number} fallback
     * @returns {number}
     */
    function toNumber(
        value,
        fallback = 0
    ) {
        const number =
            Number(value);

        return Number.isFinite(number)
            ? number
            : fallback;
    }


    /**
     * Formate un nombre en français.
     *
     * @param {unknown} value
     * @returns {string}
     */
    function formatNumber(value) {
        return toNumber(value)
            .toLocaleString("fr-FR");
    }


    /**
     * Protège les valeurs injectées dans innerHTML.
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
     * Formate les miniatures Twitch.
     *
     * Twitch renvoie parfois :
     * %{width} et %{height}
     *
     * @param {unknown} value
     * @param {number} width
     * @param {number} height
     * @returns {string}
     */
    function formatThumbnail(
        value,
        width = 640,
        height = 360
    ) {
        return String(value || "")
            .replaceAll(
                "%{width}",
                String(width)
            )
            .replaceAll(
                "%{height}",
                String(height)
            );
    }


    /**
     * Formate une date Twitch.
     *
     * @param {unknown} value
     * @returns {string}
     */
    function formatDateTime(value) {
        if (!value) {
            return "—";
        }

        const date =
            new Date(String(value));

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
        ).format(date);
    }


    /**
     * Récupère une liste valide.
     *
     * @param {unknown} value
     * @returns {Array<object>}
     */
    function getArray(value) {
        return Array.isArray(value)
            ? value
            : [];
    }


    /* =========================================================
       NORMALISATION DE LA RÉPONSE API
    ========================================================= */

    /**
     * Récupère le nombre total de followers.
     *
     * Cette fonction accepte plusieurs structures possibles :
     *
     * followerCount: 794
     *
     * followerCount: {
     *     total: 794
     * }
     *
     * followerCount: {
     *     followerCount: 794
     * }
     *
     * @param {object} data
     * @returns {number}
     */
    function getFollowerTotal(data) {
        const followerValue =
            data?.followerCount;

        const candidates = [
            followerValue,
            followerValue?.total,
            followerValue?.count,
            followerValue?.followerCount,
            data?.followers,
            data?.followers?.total,
            data?.followers?.count,
            data?.user?.followers,
            data?.user?.followerCount
        ];

        for (
            const candidate
            of candidates
        ) {
            const number =
                Number(candidate);

            if (
                Number.isFinite(number) &&
                number >= 0
            ) {
                return number;
            }
        }

        return 0;
    }


    /**
     * Récupère les clips.
     *
     * @param {object} data
     * @returns {Array<object>}
     */
    function getClips(data) {
        return getArray(
            firstDefined(
                data?.clips,
                data?.resources
                    ?.clips
                    ?.clips,
                data?.clipsResult
                    ?.clips
            )
        );
    }


    /**
     * Récupère les vidéos.
     *
     * @param {object} data
     * @returns {Array<object>}
     */
    function getVideos(data) {
        return getArray(
            firstDefined(
                data?.videos,
                data?.resources
                    ?.videos
                    ?.videos,
                data?.videosResult
                    ?.videos
            )
        );
    }


    /**
     * Récupère le statut du live.
     *
     * @param {object} data
     * @returns {boolean}
     */
    function getLiveStatus(data) {
        return Boolean(
            firstDefined(
                data?.live,
                data?.stream?.live,
                data?.stream?.isLive,
                false
            )
        );
    }


    /* =========================================================
       LECTEUR TWITCH PERMANENT
    ========================================================= */

    /**
     * Retourne le domaine autorisé pour l’intégration Twitch.
     *
     * @returns {string}
     */
    function getEmbedParent() {
        return (
            window.location.hostname ||
            "localhost"
        );
    }


    /**
     * Crée l’adresse du lecteur Twitch.
     *
     * Le paramètre parent est obligatoire.
     *
     * @returns {string}
     */
    function createPlayerUrl() {
        const parameters =
            new URLSearchParams({
                channel:
                    TWITCH_CHANNEL,

                parent:
                    getEmbedParent(),

                autoplay:
                    "false",

                muted:
                    "true"
            });

        return (
            "https://player.twitch.tv/" +
            `?${parameters.toString()}`
        );
    }


    /**
     * Initialise le lecteur.
     *
     * Contrairement à l’ancienne version, le lecteur n’est plus
     * supprimé lorsque Couaxia est hors ligne.
     */
    function initializePlayer() {
        if (!player) {
            return;
        }

        const playerUrl =
            createPlayerUrl();

        if (
            player.getAttribute("src") !==
            playerUrl
        ) {
            player.src =
                playerUrl;
        }
    }

    /* =========================================================
       APPEL DE L’API
    ========================================================= */

    /**
     * Essaie les routes API dans l’ordre.
     *
     * @returns {Promise<object>}
     */
    async function fetchTwitchData() {
        let lastError =
            new Error(
                "Aucune route Twitch n’a répondu."
            );

        for (
            const apiUrl
            of TWITCH_API_URLS
        ) {
            try {
                const response =
                    await fetch(
                        apiUrl,
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

                if (!response.ok) {
                    throw new Error(
                        `Erreur HTTP ${response.status} sur ${apiUrl}`
                    );
                }

                const data =
                    await response.json();

                if (
                    !data ||
                    typeof data !==
                    "object"
                ) {
                    throw new Error(
                        `Réponse JSON invalide sur ${apiUrl}`
                    );
                }

                if (
                    data.success ===
                    false
                ) {
                    throw new Error(
                        data.error ||
                        "L’API Twitch a renvoyé une erreur."
                    );
                }

                console.info(
                    `[Twitch] Route utilisée : ${apiUrl}`
                );

                return data;
            } catch (error) {
                lastError =
                    error instanceof Error
                        ? error
                        : new Error(
                            String(error)
                        );

                console.warn(
                    `[Twitch] Échec de ${apiUrl} :`,
                    lastError.message
                );
            }
        }

        throw lastError;
    }


    /* =========================================================
       AFFICHAGE DU STATUT
    ========================================================= */

    /**
     * Met à jour le statut visuel.
     *
     * @param {boolean} live
     */
    function displayStatus(live) {
        if (live) {
            if (statusPill) {
                statusPill.dataset.status =
                    "online";
            }

            if (statusLabel) {
                statusLabel.textContent =
                    "En direct";
            }

            if (playerBadge) {
                playerBadge.dataset.status =
                    "online";

                playerBadge.textContent =
                    "LIVE";
            }

            return;
        }

        if (statusPill) {
            statusPill.dataset.status =
                "offline";
        }

        if (statusLabel) {
            statusLabel.textContent =
                "Hors ligne";
        }

        if (playerBadge) {
            playerBadge.dataset.status =
                "offline";

            playerBadge.textContent =
                "Hors ligne";
        }
    }


    /**
     * Affiche toutes les informations du stream.
     *
     * @param {object} data
     */
    function displayChannelInformation(data) {
        const live =
            getLiveStatus(data);

        const stream =
            data?.stream &&
            typeof data.stream ===
            "object"
                ? data.stream
                : {};

        const user =
            data?.user &&
            typeof data.user ===
            "object"
                ? data.user
                : {};

        const game =
            data?.game &&
            typeof data.game ===
            "object"
                ? data.game
                : {};

        displayStatus(live);

        if (followersCount) {
            followersCount.textContent =
                formatNumber(
                    getFollowerTotal(data)
                );
        }

        if (viewerCount) {
            viewerCount.textContent =
                formatNumber(
                    firstDefined(
                        stream?.viewerCount,
                        stream?.viewers,
                        stream?.viewer_count,
                        0
                    )
                );
        }

        if (streamLanguage) {
            streamLanguage.textContent =
                String(
                    firstDefined(
                        stream?.language,
                        stream?.lang,
                        "FR"
                    )
                ).toUpperCase();
        }

        if (gameName) {
            gameName.textContent =
                String(
                    firstDefined(
                        game?.name,
                        stream?.gameName,
                        stream?.game_name,
                        "Aucune catégorie"
                    )
                );
        }

        if (startedAt) {
            startedAt.textContent =
                formatDateTime(
                    firstDefined(
                        stream?.startedAt,
                        stream?.started_at
                    )
                );
        }

        if (live) {
            if (streamHeading) {
                streamHeading.textContent =
                    String(
                        firstDefined(
                            stream?.title,
                            "Couaxia est actuellement en direct"
                        )
                    );
            }

            if (streamSubtitle) {
                const viewers =
                    formatNumber(
                        firstDefined(
                            stream?.viewerCount,
                            stream?.viewers,
                            stream?.viewer_count,
                            0
                        )
                    );

                streamSubtitle.textContent =
                    `${viewers} spectateur(s) actuellement sur le live.`;
            }

            return;
        }

        if (streamHeading) {
            streamHeading.textContent =
                "Couaxia est hors ligne";
        }

        if (streamSubtitle) {
            streamSubtitle.textContent =
                String(
                    firstDefined(
                        user?.description,
                        "Le prochain live sera annoncé prochainement."
                    )
                );
        }
    }
    /* =========================================================
       CARTES DES CLIPS ET VIDÉOS
    ========================================================= */

    /**
     * Crée une carte Twitch.
     *
     * @param {object} media
     * @param {"clip"|"video"} type
     * @returns {HTMLAnchorElement}
     */
    function createMediaCard(
        media,
        type
    ) {
        const isClip =
            type === "clip";

        const card =
            document.createElement(
                "a"
            );

        card.className =
            "twitch-media-card";

        card.target =
            "_blank";

        card.rel =
            "noopener noreferrer";

        const mediaId =
            firstDefined(
                media?.id,
                media?.videoId,
                media?.video_id
            );

        card.href =
            String(
                firstDefined(
                    media?.url,
                    media?.clipUrl,
                    media?.clip_url,
                    isClip
                        ? `https://www.twitch.tv/${TWITCH_CHANNEL}/clips`
                        : mediaId
                            ? `https://www.twitch.tv/videos/${mediaId}`
                            : `https://www.twitch.tv/${TWITCH_CHANNEL}/videos`
                )
            );

        const title =
            String(
                firstDefined(
                    media?.title,
                    isClip
                        ? "Clip Twitch de Couaxia"
                        : "Vidéo Twitch de Couaxia"
                )
            );

        const thumbnail =
            formatThumbnail(
                firstDefined(
                    media?.thumbnailUrl,
                    media?.thumbnail_url,
                    media?.thumbnail
                )
            );

        const creator =
            String(
                firstDefined(
                    media?.creatorName,
                    media?.creator_name,
                    media?.userName,
                    media?.user_name,
                    "Couaxia"
                )
            );

        const viewCount =
            firstDefined(
                media?.viewCount,
                media?.view_count
            );

        const duration =
            String(
                firstDefined(
                    media?.duration,
                    media?.formattedDuration,
                    viewCount !== undefined
                        ? `${formatNumber(viewCount)} vues`
                        : ""
                )
            );

        const publishedAt =
            firstDefined(
                media?.publishedAt,
                media?.published_at,
                media?.createdAt,
                media?.created_at
            );

        card.innerHTML = `
            <div class="twitch-media-thumbnail">
                ${
                    thumbnail
                        ? `
                            <img
                                src="${escapeHtml(thumbnail)}"
                                alt="${escapeHtml(title)}"
                                loading="lazy"
                            >
                        `
                        : ""
                }

                <span
                    class="twitch-media-play"
                    aria-hidden="true"
                >
                    ▶
                </span>

                ${
                    duration
                        ? `
                            <span class="twitch-media-duration">
                                ${escapeHtml(duration)}
                            </span>
                        `
                        : ""
                }
            </div>

            <div class="twitch-media-content">
                <h3>
                    ${escapeHtml(title)}
                </h3>

                <p>
                    ${
                        isClip
                            ? `Créé par ${escapeHtml(creator)}`
                            : publishedAt
                                ? `Publiée le ${escapeHtml(
                                    formatDateTime(publishedAt)
                                )}`
                                : "Rediffusion Twitch"
                    }
                </p>
            </div>
        `;

        return card;
    }


    /**
     * Affiche une liste de clips ou de vidéos.
     *
     * @param {HTMLElement|null} container
     * @param {Array<object>} mediaList
     * @param {"clip"|"video"} type
     */
    function displayMediaList(
        container,
        mediaList,
        type
    ) {
        if (!container) {
            return;
        }

        container.replaceChildren();

        if (
            !Array.isArray(mediaList) ||
            mediaList.length === 0
        ) {
            const emptyMessage =
                document.createElement(
                    "article"
                );

            emptyMessage.className =
                "twitch-empty-message";

            emptyMessage.textContent =
                type === "clip"
                    ? "Aucun clip n’est disponible pour le moment."
                    : "Aucune vidéo n’est disponible pour le moment.";

            container.appendChild(
                emptyMessage
            );

            return;
        }

        mediaList
            .slice(0, 3)
            .forEach((media) => {
                container.appendChild(
                    createMediaCard(
                        media,
                        type
                    )
                );
            });
    }


    /* =========================================================
       GESTION DES ERREURS
    ========================================================= */

    /**
     * Affiche une erreur sans supprimer le lecteur.
     *
     * @param {unknown} error
     */
    function displayError(error) {
        console.error(
            "[Twitch] Erreur de chargement :",
            error
        );

        if (statusPill) {
            statusPill.dataset.status =
                "error";
        }

        if (statusLabel) {
            statusLabel.textContent =
                "Informations indisponibles";
        }

        if (playerBadge) {
            playerBadge.dataset.status =
                "error";

            playerBadge.textContent =
                "Erreur API";
        }

        if (streamHeading) {
            streamHeading.textContent =
                "Le lecteur Twitch reste disponible";
        }

        if (streamSubtitle) {
            streamSubtitle.textContent =
                "Tu peux tout de même consulter la chaîne de Couaxia.";
        }

        showElement(
            apiMessage
        );

        displayMediaList(
            clipsList,
            [],
            "clip"
        );

        displayMediaList(
            videosList,
            [],
            "video"
        );
    }
    /* =========================================================
       CHARGEMENT PRINCIPAL
    ========================================================= */

    /**
     * Charge toutes les informations Twitch.
     */
    async function loadTwitchStatus() {
        hideElement(
            apiMessage
        );

        if (statusPill) {
            statusPill.dataset.status =
                "loading";
        }

        if (statusLabel) {
            statusLabel.textContent =
                "Vérification…";
        }

        if (playerBadge) {
            playerBadge.dataset.status =
                "loading";

            playerBadge.textContent =
                "Vérification";
        }

        try {
            const data =
                await fetchTwitchData();

            console.log(
                "[Twitch] Réponse complète :",
                data
            );

            displayChannelInformation(
                data
            );

            displayMediaList(
                clipsList,
                getClips(data),
                "clip"
            );

            displayMediaList(
                videosList,
                getVideos(data),
                "video"
            );
        } catch (error) {
            displayError(
                error
            );
        }
    }


    /* =========================================================
       ÉVÉNEMENTS
    ========================================================= */

    refreshButton?.addEventListener(
        "click",
        () => {
            loadTwitchStatus();
        }
    );


    /* =========================================================
       INITIALISATION
    ========================================================= */

    initializePlayer();

    loadTwitchStatus();

    window.setInterval(
        () => {
            loadTwitchStatus();
        },
        REFRESH_DELAY
    );
});            