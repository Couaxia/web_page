"use strict";

document.addEventListener("DOMContentLoaded", () => {
    /* =========================================================
       CONFIGURATION
    ========================================================= */

    const TWITCH_CHANNEL =
        "couaxia";

    /*
     * La fonction Vercel se trouve dans :
     *
     * WEB_PAGE/api/twitch-status.js
     *
     * Son URL publique est :
     *
     * /api/twitch-status
     */
    const TWITCH_API_URLS = [
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
     * Twitch peut renvoyer :
     *
     * %{width}
     * %{height}
     *
     * ou :
     *
     * {width}
     * {height}
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
            )
            .replaceAll(
                "{width}",
                String(width)
            )
            .replaceAll(
                "{height}",
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
     * La fonction accepte plusieurs structures possibles
     * afin de rester compatible avec l’API Vercel.
     *
     * @param {object} data
     * @returns {number}
     */
    function getFollowerTotal(data) {
        return toNumber(
            firstDefined(
                data?.followers,
                data?.followersTotal,
                data?.followers?.total,
                data?.resources?.followers?.total,
                data?.followersResult?.total,
                0
            )
        );
    }


    /**
     * Récupère le nombre de spectateurs actuels.
     *
     * @param {object} data
     * @returns {number}
     */
    function getViewerTotal(data) {
        return toNumber(
            firstDefined(
                data?.viewerCount,
                data?.viewer_count,
                data?.stream?.viewerCount,
                data?.stream?.viewer_count,
                data?.stream?.viewers,
                0
            )
        );
    }


    /**
     * Détermine si la chaîne est actuellement en direct.
     *
     * La valeur peut être :
     *
     * true
     * false
     * 1
     * 0
     * "1"
     * "0"
     * "true"
     * "false"
     *
     * @param {object} data
     * @returns {boolean}
     */
    function getLiveStatus(data) {
        const value =
            firstDefined(
                data?.live,
                data?.isLive,
                data?.stream?.live,
                data?.stream?.isLive,
                data?.stream?.is_live,
                false
            );

        return (
            value === true ||
            value === 1 ||
            value === "1" ||
            String(value)
                .toLowerCase() ===
                "true"
        );
    }


    /**
     * Récupère le titre du stream.
     *
     * @param {object} data
     * @returns {string}
     */
    function getStreamTitle(data) {
        return String(
            firstDefined(
                data?.title,
                data?.streamTitle,
                data?.stream?.title,
                data?.channel?.title,
                ""
            )
        );
    }


    /**
     * Récupère le nom du jeu ou de la catégorie.
     *
     * @param {object} data
     * @returns {string}
     */
    function getGameName(data) {
        return String(
            firstDefined(
                data?.gameName,
                data?.game_name,
                data?.stream?.gameName,
                data?.stream?.game_name,
                data?.game?.name,
                ""
            )
        );
    }


    /**
     * Récupère la langue du stream.
     *
     * @param {object} data
     * @returns {string}
     */
    function getStreamLanguage(data) {
        return String(
            firstDefined(
                data?.language,
                data?.streamLanguage,
                data?.stream?.language,
                data?.stream?.broadcasterLanguage,
                ""
            )
        ).toUpperCase();
    }


    /**
     * Récupère la date de début du live.
     *
     * @param {object} data
     * @returns {string}
     */
    function getStartedAt(data) {
        return String(
            firstDefined(
                data?.startedAt,
                data?.started_at,
                data?.stream?.startedAt,
                data?.stream?.started_at,
                ""
            )
        );
    }


    /**
     * Récupère l’URL de la miniature du live.
     *
     * @param {object} data
     * @returns {string}
     */
    function getStreamThumbnail(data) {
        const thumbnail =
            firstDefined(
                data?.thumbnailUrl,
                data?.thumbnail_url,
                data?.stream?.thumbnailUrl,
                data?.stream?.thumbnail_url,
                ""
            );

        return formatThumbnail(
            thumbnail,
            1280,
            720
        );
    }


    /**
     * Récupère les clips depuis la réponse API.
     *
     * Important :
     *
     * data.clips peut être directement un tableau,
     * mais peut également être un objet contenant
     * lui-même une propriété clips.
     *
     * @param {object} data
     * @returns {Array<object>}
     */
    function getClips(data) {
        const candidates = [
            data?.clips?.clips,
            data?.resources?.clips?.clips,
            data?.clipsResult?.clips,
            data?.clips
        ];

        for (
            const candidate
            of candidates
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


    /**
     * Récupère les vidéos depuis la réponse API.
     *
     * Comme pour les clips, la réponse peut contenir :
     *
     * videos: [...]
     *
     * ou :
     *
     * videos: {
     *     videos: [...]
     * }
     *
     * @param {object} data
     * @returns {Array<object>}
     */
    function getVideos(data) {
        const candidates = [
            data?.videos?.videos,
            data?.resources?.videos?.videos,
            data?.videosResult?.videos,
            data?.videos
        ];

        for (
            const candidate
            of candidates
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


    /**
     * Récupère le message général renvoyé par l’API.
     *
     * @param {object} data
     * @returns {string}
     */
    function getApiMessage(data) {
        return String(
            firstDefined(
                data?.message,
                data?.statusMessage,
                data?.error?.message,
                ""
            )
        );
    }


    /**
     * Récupère le nom d’affichage de la chaîne.
     *
     * @param {object} data
     * @returns {string}
     */
    function getDisplayName(data) {
        return String(
            firstDefined(
                data?.displayName,
                data?.display_name,
                data?.user?.displayName,
                data?.user?.display_name,
                data?.channel?.displayName,
                data?.channel?.display_name,
                TWITCH_CHANNEL
            )
        );
    }


    /**
     * Récupère la photo de profil Twitch.
     *
     * @param {object} data
     * @returns {string}
     */
    function getProfileImage(data) {
        return String(
            firstDefined(
                data?.profileImageUrl,
                data?.profile_image_url,
                data?.user?.profileImageUrl,
                data?.user?.profile_image_url,
                data?.channel?.profileImageUrl,
                ""
            )
        );
    }


    /* =========================================================
       GESTION DES TEXTES DE L’INTERFACE
    ========================================================= */

    /**
     * Modifie le texte d’un élément.
     *
     * @param {HTMLElement|null} element
     * @param {unknown} value
     */
    function setText(
        element,
        value
    ) {
        if (!element) {
            return;
        }

        element.textContent =
            String(value ?? "");
    }


    /**
     * Affiche un message provenant de l’API.
     *
     * @param {string} message
     * @param {"info"|"success"|"error"} type
     */
    function showApiMessage(
        message,
        type = "info"
    ) {
        if (!apiMessage) {
            return;
        }

        if (!message) {
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
        /* =========================================================
       GESTION VISUELLE DU STATUT TWITCH
    ========================================================= */

    /**
     * Met à jour le badge indiquant si la chaîne est en direct.
     *
     * @param {boolean} isLive
     */
    function updateStatusPill(isLive) {
        if (statusPill) {
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


    /**
     * Met à jour les statistiques principales.
     *
     * @param {object} data
     */
    function updateStatistics(data) {
        const followers =
            getFollowerTotal(data);

        const viewers =
            getViewerTotal(data);

        const language =
            getStreamLanguage(data);

        setText(
            followersCount,
            formatNumber(followers)
        );

        setText(
            viewerCount,
            formatNumber(viewers)
        );

        setText(
            streamLanguage,
            language || "—"
        );
    }


    /**
     * Met à jour les informations textuelles du stream.
     *
     * @param {object} data
     * @param {boolean} isLive
     */
    function updateStreamInformation(
        data,
        isLive
    ) {
        const displayName =
            getDisplayName(data);

        const title =
            getStreamTitle(data);

        const category =
            getGameName(data);

        const streamStartedAt =
            getStartedAt(data);

        if (isLive) {
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
                category || "Non renseigné"
            );

            setText(
                startedAt,
                streamStartedAt
                    ? formatDateTime(
                        streamStartedAt
                    )
                    : "—"
            );

            return;
        }

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
            category || "Hors ligne"
        );

        setText(
            startedAt,
            "—"
        );
    }


    /**
     * Construit l’URL du lecteur Twitch.
     *
     * Twitch exige le paramètre parent correspondant
     * au nom de domaine qui affiche le lecteur.
     *
     * @returns {string}
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
                    "true",

                muted:
                    "true"
            });

        return (
            "https://player.twitch.tv/?" +
            parameters.toString()
        );
    }


    /**
     * Affiche le lecteur Twitch lorsque la chaîne est en direct.
     *
     * @param {boolean} isLive
     * @param {object} data
     */
    function updatePlayer(
        isLive,
        data
    ) {
        if (!player) {
            return;
        }

        if (isLive) {
            const currentSource =
                player.getAttribute(
                    "src"
                );

            const playerUrl =
                createTwitchPlayerUrl();

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
                `Live Twitch de ${getDisplayName(data)}`
            );

            showElement(
                player
            );

            if (playerBadge) {
                playerBadge.classList.add(
                    "is-live"
                );

                playerBadge.classList.remove(
                    "is-offline"
                );
            }

            setText(
                playerBadge,
                "LIVE"
            );

            return;
        }

        player.removeAttribute(
            "src"
        );

        hideElement(
            player
        );

        if (playerBadge) {
            playerBadge.classList.remove(
                "is-live"
            );

            playerBadge.classList.add(
                "is-offline"
            );
        }

        setText(
            playerBadge,
            "HORS LIGNE"
        );
    }


    /**
     * Construit une image de remplacement lorsque Twitch
     * ne renvoie aucune miniature.
     *
     * @param {string} label
     * @returns {string}
     */
    function createFallbackThumbnail(label) {
        const safeLabel =
            encodeURIComponent(
                label || "Couaxia"
            );

        return (
            "https://placehold.co/" +
            `640x360?text=${safeLabel}`
        );
    }


    /**
     * Récupère l’URL principale d’un clip ou d’une vidéo.
     *
     * @param {object} media
     * @returns {string}
     */
    function getMediaUrl(media) {
        return String(
            firstDefined(
                media?.url,
                media?.watchUrl,
                media?.watch_url,
                media?.embedUrl,
                media?.embed_url,
                "#"
            )
        );
    }


    /**
     * Récupère le titre d’un clip ou d’une vidéo.
     *
     * @param {object} media
     * @returns {string}
     */
    function getMediaTitle(media) {
        return String(
            firstDefined(
                media?.title,
                media?.name,
                "Contenu Twitch"
            )
        );
    }


    /**
     * Récupère l’auteur d’un clip ou d’une vidéo.
     *
     * @param {object} media
     * @returns {string}
     */
    function getMediaAuthor(media) {
        return String(
            firstDefined(
                media?.creatorName,
                media?.creator_name,
                media?.userName,
                media?.user_name,
                media?.broadcasterName,
                media?.broadcaster_name,
                TWITCH_CHANNEL
            )
        );
    }


    /**
     * Récupère la miniature d’un média Twitch.
     *
     * @param {object} media
     * @returns {string}
     */
    function getMediaThumbnail(media) {
        const title =
            getMediaTitle(media);

        const thumbnail =
            firstDefined(
                media?.thumbnailUrl,
                media?.thumbnail_url,
                media?.thumbnail,
                ""
            );

        const formattedThumbnail =
            formatThumbnail(
                thumbnail,
                640,
                360
            );

        return (
            formattedThumbnail ||
            createFallbackThumbnail(
                title
            )
        );
    }


    /**
     * Récupère la date de publication d’un média.
     *
     * @param {object} media
     * @returns {string}
     */
    function getMediaDate(media) {
        return String(
            firstDefined(
                media?.createdAt,
                media?.created_at,
                media?.publishedAt,
                media?.published_at,
                ""
            )
        );
    }


    /**
     * Récupère la durée affichable d’une vidéo.
     *
     * @param {object} media
     * @returns {string}
     */
    function getMediaDuration(media) {
        return String(
            firstDefined(
                media?.formattedDuration,
                media?.duration,
                ""
            )
        );
    }


    /**
     * Récupère le nombre de vues d’un média.
     *
     * @param {object} media
     * @returns {number}
     */
    function getMediaViews(media) {
        return toNumber(
            firstDefined(
                media?.viewCount,
                media?.view_count,
                media?.views,
                0
            )
        );
    }


    /* =========================================================
       CRÉATION DES CARTES CLIPS ET VIDÉOS
    ========================================================= */

    /**
     * Crée une carte HTML pour un clip ou une vidéo.
     *
     * @param {object} media
     * @param {"clip"|"video"} type
     * @returns {HTMLElement}
     */
    function createMediaCard(
        media,
        type
    ) {
        const article =
            document.createElement(
                "article"
            );

        article.className =
            `twitch-media-card twitch-${type}-card`;

        const url =
            getMediaUrl(media);

        const title =
            getMediaTitle(media);

        const thumbnail =
            getMediaThumbnail(media);

        const author =
            getMediaAuthor(media);

        const date =
            getMediaDate(media);

        const duration =
            getMediaDuration(media);

        const views =
            getMediaViews(media);

        article.innerHTML = `
            <a
                class="twitch-media-link"
                href="${escapeHtml(url)}"
                target="_blank"
                rel="noopener noreferrer"
            >
                <div class="twitch-media-thumbnail-wrapper">
                    <img
                        class="twitch-media-thumbnail"
                        src="${escapeHtml(thumbnail)}"
                        alt="${escapeHtml(title)}"
                        loading="lazy"
                    >

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
                    <h3 class="twitch-media-title">
                        ${escapeHtml(title)}
                    </h3>

                    <p class="twitch-media-author">
                        Par ${escapeHtml(author)}
                    </p>

                    <div class="twitch-media-details">
                        <span>
                            ${
                                views > 0
                                    ? `${escapeHtml(formatNumber(views))} vues`
                                    : "Twitch"
                            }
                        </span>

                        <span>
                            ${
                                date
                                    ? escapeHtml(formatDateTime(date))
                                    : ""
                            }
                        </span>
                    </div>
                </div>
            </a>
        `;

        const image =
            article.querySelector(
                ".twitch-media-thumbnail"
            );

        image?.addEventListener(
            "error",
            () => {
                image.src =
                    createFallbackThumbnail(
                        title
                    );
            },
            {
                once:
                    true
            }
        );

        return article;
    }
        /**
     * Affiche une liste de clips ou de vidéos.
     *
     * @param {HTMLElement|null} container
     * @param {Array<object>} mediaList
     * @param {"clip"|"video"} type
     */
    function renderMediaList(
        container,
        mediaList,
        type
    ) {
        if (!container) {
            return;
        }

        container.innerHTML =
            "";

        const safeMediaList =
            getArray(mediaList);

        if (
            safeMediaList.length === 0
        ) {
            const emptyMessage =
                document.createElement(
                    "p"
                );

            emptyMessage.className =
                "twitch-media-empty";

            emptyMessage.textContent =
                type === "clip"
                    ? "Aucun clip disponible pour le moment."
                    : "Aucune vidéo disponible pour le moment.";

            container.appendChild(
                emptyMessage
            );

            return;
        }

        const fragment =
            document.createDocumentFragment();

        safeMediaList.forEach(
            (media) => {
                const card =
                    createMediaCard(
                        media,
                        type
                    );

                fragment.appendChild(
                    card
                );
            }
        );

        container.appendChild(
            fragment
        );
    }


    /**
     * Affiche les clips présents dans la réponse API.
     *
     * @param {object} data
     */
    function renderClips(data) {
        const clips =
            getClips(data);

        renderMediaList(
            clipsList,
            clips,
            "clip"
        );
    }


    /**
     * Affiche les vidéos présentes dans la réponse API.
     *
     * @param {object} data
     */
    function renderVideos(data) {
        const videos =
            getVideos(data);

        renderMediaList(
            videosList,
            videos,
            "video"
        );
    }


    /* =========================================================
       MISE À JOUR COMPLÈTE DE L’INTERFACE
    ========================================================= */

    /**
     * Met à jour toute l’interface avec les données Twitch.
     *
     * @param {object} data
     */
    function updateStatusDisplay(data) {
        const isLive =
            getLiveStatus(data);

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

        renderClips(
            data
        );

        renderVideos(
            data
        );

        const message =
            getApiMessage(data);

        if (message) {
            showApiMessage(
                message,
                "info"
            );
        } else {
            showApiMessage(
                "",
                "info"
            );
        }
    }


    /**
     * Affiche une interface temporaire pendant le chargement.
     */
    function showLoadingState() {
        if (refreshButton) {
            refreshButton.disabled =
                true;

            refreshButton.classList.add(
                "is-loading"
            );

            refreshButton.setAttribute(
                "aria-busy",
                "true"
            );
        }

        showApiMessage(
            "Chargement des informations Twitch…",
            "info"
        );
    }


    /**
     * Retire l’état de chargement.
     */
    function hideLoadingState() {
        if (refreshButton) {
            refreshButton.disabled =
                false;

            refreshButton.classList.remove(
                "is-loading"
            );

            refreshButton.removeAttribute(
                "aria-busy"
            );
        }
    }


    /**
     * Affiche un état d’erreur dans l’interface.
     *
     * @param {unknown} error
     */
    function showErrorState(error) {
        const message =
            error instanceof Error
                ? error.message
                : String(
                    error ||
                    "Une erreur inconnue est survenue."
                );

        console.error(
            "[Twitch]",
            error
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
            streamHeading,
            "Informations Twitch indisponibles"
        );

        setText(
            streamSubtitle,
            "Impossible de contacter le serveur Twitch pour le moment."
        );

        setText(
            gameName,
            "—"
        );

        setText(
            startedAt,
            "—"
        );

        showApiMessage(
            message,
            "error"
        );
    }


    /* =========================================================
       COMMUNICATION AVEC L’API VERCEL
    ========================================================= */

    /**
     * Construit une URL API avec le nom de la chaîne.
     *
     * @param {string} endpoint
     * @returns {string}
     */
    function createApiUrl(endpoint) {
        const url =
            new URL(
                endpoint,
                window.location.origin
            );

        url.searchParams.set(
            "channel",
            TWITCH_CHANNEL
        );

        /*
         * Empêche le navigateur de réutiliser une ancienne
         * réponse mise en cache.
         */
        url.searchParams.set(
            "_",
            String(Date.now())
        );

        return url.toString();
    }


    /**
     * Lit proprement la réponse JSON de l’API.
     *
     * @param {Response} response
     * @returns {Promise<object>}
     */
    async function readApiResponse(
        response
    ) {
        const contentType =
            response.headers.get(
                "content-type"
            ) || "";

        let data = {};

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

            if (text) {
                try {
                    data =
                        JSON.parse(text);
                } catch {
                    data = {
                        message:
                            text
                    };
                }
            }
        }

        if (!response.ok) {
            const errorMessage =
                firstDefined(
                    data?.error?.message,
                    data?.error,
                    data?.message,
                    `Erreur HTTP ${response.status}`
                );

            throw new Error(
                String(errorMessage)
            );
        }

        return (
            data &&
            typeof data === "object"
                ? data
                : {}
        );
    }


    /**
     * Essaie les différentes URL API configurées.
     *
     * @returns {Promise<object>}
     */
    async function fetchTwitchData() {
        let lastError = null;

        for (
            const endpoint
            of TWITCH_API_URLS
        ) {
            try {
                const apiUrl =
                    createApiUrl(
                        endpoint
                    );

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

                return await readApiResponse(
                    response
                );
            } catch (error) {
                lastError =
                    error;

                console.warn(
                    `[Twitch] Échec de ${endpoint}`,
                    error
                );
            }
        }

        throw (
            lastError ||
            new Error(
                "Aucune route Twitch n’est disponible."
            )
        );
    }


    /**
     * Charge les données Twitch puis met à jour l’interface.
     */
    async function loadTwitchStatus() {
        showLoadingState();

        try {
            const data =
                await fetchTwitchData();

            updateStatusDisplay(
                data
            );
        } catch (error) {
            showErrorState(
                error
            );
        } finally {
            hideLoadingState();
        }
    }
        /* =========================================================
       ÉVÉNEMENTS ET DÉMARRAGE
    ========================================================= */

    /**
     * Actualise manuellement les informations Twitch.
     */
    refreshButton?.addEventListener(
        "click",
        () => {
            loadTwitchStatus();
        }
    );


    /**
     * Recharge les données lorsque l’onglet redevient visible.
     *
     * Cela évite d’utiliser des informations trop anciennes
     * après avoir laissé la page ouverte en arrière-plan.
     */
    document.addEventListener(
        "visibilitychange",
        () => {
            if (
                document.visibilityState ===
                "visible"
            ) {
                loadTwitchStatus();
            }
        }
    );


    /**
     * Premier chargement dès que le DOM est prêt.
     */
    loadTwitchStatus();


    /**
     * Actualisation automatique toutes les 60 secondes.
     */
    const refreshInterval =
        window.setInterval(
            () => {
                if (
                    document.visibilityState ===
                    "visible"
                ) {
                    loadTwitchStatus();
                }
            },
            REFRESH_DELAY
        );


    /**
     * Nettoie l’intervalle lorsque la page est quittée.
     */
    window.addEventListener(
        "beforeunload",
        () => {
            window.clearInterval(
                refreshInterval
            );
        }
    );
});