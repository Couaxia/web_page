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

    /*
     * Cet élément doit être un iframe dans le HTML.
     *
     * Exemple :
     *
     * <iframe id="twitch-player"></iframe>
     */
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
    
/* =========================================================
   CONFIGURATION DE LA PAGINATION
========================================================= */

    const MEDIA_PER_PAGE =2;
    let currentClipsPage =1;
    let currentVideosPage =1;

    let storedClips =[];

    let storedVideos =[];

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
     * Retourne la première valeur réellement définie.
     *
     * Les valeurs suivantes sont ignorées :
     *
     * undefined
     * null
     * chaîne vide
     *
     * @param  {...unknown} values
     * @returns {unknown}
     */
    function firstDefined(...values) {
    return values.find((value) => {
        if (
            value === undefined ||
            value === null
        ) {
            return false;
        }

        if (typeof value === "string") {
            const normalizedValue =
                value.trim().toLowerCase();

            return (
                normalizedValue !== "" &&
                normalizedValue !== "undefined" &&
                normalizedValue !== "null" &&
                normalizedValue !== "nan"
            );
        }

        return true;
    });
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
     * Formate un nombre selon le format français.
     *
     * Exemple :
     *
     * 1250 devient 1 250
     *
     * @param {unknown} value
     * @returns {string}
     */
    function formatNumber(value) {
        return toNumber(value)
            .toLocaleString("fr-FR");
    }


    /**
     * Protège une valeur avant son insertion
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
     * Formate les miniatures Twitch.
     *
     * Twitch peut renvoyer des adresses contenant :
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
     * Formate une date Twitch en français.
     *
     * @param {unknown} value
     * @returns {string}
     */
    function formatDateTime(value) {
        if (!value) {
            return "—";
        }

        const date =
            new Date(
                String(value)
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
        ).format(date);
    }


    /**
     * Retourne toujours un tableau.
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
     * pour rester compatible avec l’API Vercel.
     *
     * @param {object} data
     * @returns {number}
     */
    function getFollowerTotal(data) {
        return toNumber(
            firstDefined(
                data?.followers,
                data?.followerCount,
                data?.followersTotal,
                data?.followers?.total,
                data?.resources?.followers,
                data?.resources?.followers?.total,
                data?.followersResult?.total,
                0
            )
        );
    }


    /**
     * Récupère le nombre actuel de spectateurs.
     *
     * @param {object} data
     * @returns {number}
     */
    function getViewerTotal(data) {
        return toNumber(
            firstDefined(
                data?.viewerCount,
                data?.viewer_count,
                data?.viewers,
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
                data?.is_live,
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
                data?.stream_title,
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
            data?.category,
            data?.stream?.gameName,
            data?.stream?.game_name,
            data?.stream?.category,
            data?.stream?.game?.name,
            data?.channel?.gameName,
            data?.channel?.game_name,
            data?.channel?.category,
            data?.game?.name,
            ""
        ) ?? ""
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
                data?.stream_language,
                data?.stream?.language,
                data?.stream?.broadcasterLanguage,
                data?.stream?.broadcaster_language,
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
     * data.clips peut être :
     *
     * - directement un tableau ;
     * - un objet contenant une propriété clips ;
     * - un objet dans resources.clips.
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
                data?.status_message,
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
                data?.stream?.displayName,
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
                data?.channel?.profile_image_url,
                ""
            )
        );
    }


    /**
     * Récupère l’adresse Twitch de la chaîne.
     *
     * @param {object} data
     * @returns {string}
     */
    function getTwitchChannelUrl(data) {
        return String(
            firstDefined(
                data?.twitchUrl,
                data?.twitch_url,
                data?.user?.twitchUrl,
                data?.user?.twitch_url,
                data?.stream?.twitchUrl,
                data?.channel?.twitchUrl,
                `https://www.twitch.tv/${TWITCH_CHANNEL}`
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
     * Met à jour le badge indiquant si la chaîne
     * est en direct.
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

        setText(
            followersCount,
            formatNumber(followers)
        );

        setText(
            viewerCount,
            formatNumber(viewers)
        );
    }


    /**
     * Met à jour les informations textuelles
     * du stream.
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
                category ||
                "Non renseigné"
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
            category ||
            "Hors ligne"
        );

        setText(
            startedAt,
            "—"
        );
    }
        /* =========================================================
       LECTEUR TWITCH
    ========================================================= */

    /**
     * Construit l’URL officielle du lecteur Twitch.
     *
     * Twitch exige le paramètre "parent".
     * Il doit contenir uniquement le nom de domaine,
     * sans https:// et sans chemin.
     *
     * Exemples :
     *
     * localhost
     * mon-site.vercel.app
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

                /*
                 * false évite que le lecteur démarre
                 * automatiquement au chargement.
                 */
                autoplay:
                    "false",

                /*
                 * Le lecteur reste autorisé à démarrer
                 * sans son si Twitch en a besoin.
                 */
                muted:
                    "true"
            });

        return (
            "https://player.twitch.tv/?" +
            parameters.toString()
        );
    }


    /**
     * Affiche le lecteur Twitch en permanence.
     *
     * Lorsque la chaîne est en direct :
     * Twitch affiche le live.
     *
     * Lorsque la chaîne est hors ligne :
     * Twitch affiche sa carte hors ligne officielle.
     *
     * Le lecteur ne doit donc jamais être supprimé
     * ni masqué selon le statut du live.
     *
     * @param {boolean} isLive
     * @param {object} data
     */
    function updatePlayer(
        isLive,
        data
    ) {
        if (!player) {
            console.warn(
                "[Twitch] L’élément #twitch-player est introuvable."
            );

            return;
        }

        /*
         * Sécurité :
         * le code attend un iframe.
         */
        if (
            player.tagName
                .toLowerCase() !==
            "iframe"
        ) {
            console.error(
                "[Twitch] #twitch-player doit être un élément <iframe>."
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
         * On ne modifie l’URL que si elle est différente.
         *
         * Cela évite de recharger le lecteur Twitch
         * toutes les 60 secondes lors de la mise à jour API.
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
                ? `Live Twitch de ${getDisplayName(data)}`
                : `Chaîne Twitch hors ligne de ${getDisplayName(data)}`
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
         * Point essentiel :
         *
         * le lecteur reste visible même hors ligne.
         *
         * Il ne faut jamais faire :
         *
         * player.removeAttribute("src");
         * hideElement(player);
         */
        showElement(
            player
        );

        if (playerBadge) {
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
        /* =========================================================
       AFFICHAGE DES CLIPS TWITCH
    ========================================================= */

    /**
     * Crée le HTML d’un clip Twitch.
     *
     * @param {object} clip
     * @returns {string}
     */
    function createClipCard(clip) {
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
                    clip?.clipUrl,
                    clip?.clip_url,
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
            <article class="twitch-media-card twitch-clip-card">
                <a
                    class="twitch-media-link"
                    href="${escapeHtml(url)}"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Regarder le clip ${escapeHtml(title)} sur Twitch"
                >
                    <div class="twitch-media-thumbnail-wrapper">
                        ${
                            thumbnail
                                ? `
                                    <img
                                        class="twitch-media-thumbnail"
                                        src="${escapeHtml(thumbnail)}"
                                        alt="Miniature du clip ${escapeHtml(title)}"
                                        loading="lazy"
                                    >
                                `
                                : `
                                    <div class="twitch-media-thumbnail twitch-media-thumbnail-placeholder">
                                        Aucun aperçu
                                    </div>
                                `
                        }

                        <span class="twitch-media-type">
                            Clip
                        </span>
                    </div>

                    <div class="twitch-media-content">
                        <h3 class="twitch-media-title">
                            ${escapeHtml(title)}
                        </h3>

                        <p class="twitch-media-meta">
                            Par ${escapeHtml(creator)}
                        </p>

                        <p class="twitch-media-meta">
                            ${formatNumber(views)} vue${views > 1 ? "s" : ""}
                        </p>

                        ${
                            createdAt
                                ? `
                                    <time
                                        class="twitch-media-date"
                                        datetime="${escapeHtml(createdAt)}"
                                    >
                                        ${escapeHtml(formatDateTime(createdAt))}
                                    </time>
                                `
                                : ""
                        }
                    </div>
                </a>
            </article>
        `;
    }
/**
 * Crée les boutons d’une pagination.
 *
 * @param {HTMLElement|null} container
 * @param {number} currentPage
 * @param {number} totalPages
 * @param {(page: number) => void} onPageChange
 */
function renderPagination(
    container,
    currentPage,
    totalPages,
    onPageChange
) {
    if (!container) {
        return;
    }

    container.innerHTML = "";

    /*
     * Une seule page :
     * inutile d’afficher la pagination.
     */
    if (totalPages <= 1) {
        hideElement(container);
        return;
    }

    showElement(container);

    /*
     * Bouton précédent.
     */
    const previousButton =
        document.createElement("button");

    previousButton.type = "button";

    previousButton.className =
        "twitch-pagination-button twitch-pagination-arrow";

    previousButton.textContent = "←";

    previousButton.setAttribute(
        "aria-label",
        "Page précédente"
    );

    previousButton.disabled =
        currentPage === 1;

    previousButton.addEventListener(
        "click",
        () => {
            onPageChange(
                currentPage - 1
            );
        }
    );

    container.appendChild(
        previousButton
    );

    /*
     * Numéros des pages.
     */
    const pageButtonsContainer =
        document.createElement("div");

    pageButtonsContainer.className =
        "twitch-pagination-pages";

    for (
        let page = 1;
        page <= totalPages;
        page += 1
    ) {
        const pageButton =
            document.createElement("button");

        pageButton.type = "button";

        pageButton.className =
            "twitch-pagination-button";

        pageButton.textContent =
            String(page);

        pageButton.setAttribute(
            "aria-label",
            `Afficher la page ${page}`
        );

        if (page === currentPage) {
            pageButton.classList.add(
                "is-active"
            );

            pageButton.setAttribute(
                "aria-current",
                "page"
            );
        }

        pageButton.addEventListener(
            "click",
            () => {
                onPageChange(page);
            }
        );

        pageButtonsContainer.appendChild(
            pageButton
        );
    }

    container.appendChild(
        pageButtonsContainer
    );

    /*
     * Bouton suivant.
     */
    const nextButton =
        document.createElement("button");

    nextButton.type = "button";

    nextButton.className =
        "twitch-pagination-button twitch-pagination-arrow";

    nextButton.textContent = "→";

    nextButton.setAttribute(
        "aria-label",
        "Page suivante"
    );

    nextButton.disabled =
        currentPage === totalPages;

    nextButton.addEventListener(
        "click",
        () => {
            onPageChange(
                currentPage + 1
            );
        }
    );

    container.appendChild(
        nextButton
    );

    /*
     * Texte indiquant la page actuelle.
     */
    const pageIndicator =
        document.createElement("p");

    pageIndicator.className =
        "twitch-pagination-indicator";

    pageIndicator.textContent =
        `Page ${currentPage} sur ${totalPages}`;

    pageIndicator.setAttribute(
        "aria-live",
        "polite"
    );

    container.appendChild(
        pageIndicator
    );
}
/**
 * Affiche une page de clips Twitch.
 *
 * @param {Array<object>} clips
 * @param {number} requestedPage
 */
function renderClips(
    clips,
    requestedPage = currentClipsPage
) {
    if (!clipsList) {
        return;
    }

    storedClips =
        getArray(clips);

    if (
        storedClips.length ===
        0
    ) {
        clipsList.innerHTML = `
            <p class="twitch-empty-message">
                Aucun clip disponible pour le moment.
            </p>
        `;

        currentClipsPage =
            1;

        if (clipsPagination) {
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
            .join("");

    renderPagination(
        clipsPagination,
        currentClipsPage,
        totalPages,
        (page) => {
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
    /* =========================================================
       AFFICHAGE DES VIDÉOS TWITCH
    ========================================================= */

    /**
     * Crée le HTML d’une vidéo Twitch.
     *
     * @param {object} video
     * @returns {string}
     */
    function createVideoCard(video) {
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
                    video?.videoUrl,
                    video?.video_url,
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

        const descriptionValue =
            firstDefined(
                video?.description,
                ""
            );

        const description =
            descriptionValue
            ? String(descriptionValue)
            : "";

        return `
            <article class="twitch-media-card twitch-video-card">
                <a
                    class="twitch-media-link"
                    href="${escapeHtml(url)}"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Regarder la vidéo ${escapeHtml(title)} sur Twitch"
                >
                    <div class="twitch-media-thumbnail-wrapper">
                        ${
                            thumbnail
                                ? `
                                    <img
                                        class="twitch-media-thumbnail"
                                        src="${escapeHtml(thumbnail)}"
                                        alt="Miniature de la vidéo ${escapeHtml(title)}"
                                        loading="lazy"
                                    >
                                `
                                : `
                                    <div class="twitch-media-thumbnail twitch-media-thumbnail-placeholder">
                                        Aucun aperçu
                                    </div>
                                `
                        }

                        <span class="twitch-media-type">
                            Vidéo
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
                        <h3 class="twitch-media-title">
                            ${escapeHtml(title)}
                        </h3>

                        <p class="twitch-media-meta">
                            ${formatNumber(views)} vue${views > 1 ? "s" : ""}
                        </p>

                        ${
                            publishedAt
                                ? `
                                    <time
                                        class="twitch-media-date"
                                        datetime="${escapeHtml(publishedAt)}"
                                    >
                                        ${escapeHtml(formatDateTime(publishedAt))}
                                    </time>
                                `
                                : ""
                        }

                        ${
                            description
                                ? `
                                    <p class="twitch-media-description">
                                        ${escapeHtml(description)}
                                    </p>
                                `
                                : ""
                        }
                    </div>
                </a>
            </article>
        `;
    }


    /**
 * Affiche une page de vidéos Twitch.
 *
 * @param {Array<object>} videos
 * @param {number} requestedPage
 */
function renderVideos(
    videos,
    requestedPage = currentVideosPage
) {
    if (!videosList) {
        return;
    }

    storedVideos =
        getArray(videos);

    if (
        storedVideos.length ===
        0
    ) {
        videosList.innerHTML = `
            <p class="twitch-empty-message">
                Aucune vidéo disponible pour le moment.
            </p>
        `;

        currentVideosPage =
            1;

        if (videosPagination) {
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
            .join("");

    renderPagination(
        videosPagination,
        currentVideosPage,
        totalPages,
        (page) => {
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
        /* =========================================================
       MISE À JOUR GÉNÉRALE DE L’INTERFACE
    ========================================================= */

    /**
     * Met à jour toute la page avec les données
     * reçues depuis l’API Twitch.
     *
     * @param {object} data
     */
    
    function updateInterface(data) {
        const isLive =
            getLiveStatus(data);

        const clips =
            getClips(data);

        const videos =
            getVideos(data);
            
        
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
        * Lors d'une mise à jour de l'API,
        * on revient à la première page.
        */
        currentClipsPage = 1;
        currentVideosPage = 1;

        renderClips(
            clips,
            currentClipsPage
        );

        renderVideos(
            videos,
            currentVideosPage
        );

        const message =
            getApiMessage(data);

        if (message) {
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
    }


    /* =========================================================
       APPEL DE L’API VERCEL
    ========================================================= */

    /**
     * Effectue une requête vers une URL de l’API.
     *
     * @param {string} url
     * @returns {Promise<object>}
     */
    async function fetchTwitchDataFromUrl(url) {
        const response =
            await fetch(
                url,
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

        let data = null;

        try {
            data =
                await response.json();
        } catch {
            throw new Error(
                "La réponse de l’API Twitch n’est pas un JSON valide."
            );
        }

        if (!response.ok) {
            const errorMessage =
                firstDefined(
                    data?.message,
                    data?.error,
                    `Erreur HTTP ${response.status}`
                );

            throw new Error(
                String(errorMessage)
            );
        }

        if (
            !data ||
            typeof data !==
                "object"
        ) {
            throw new Error(
                "La réponse de l’API Twitch est vide ou invalide."
            );
        }

        return data;
    }


    /**
     * Teste les différentes URLs configurées.
     *
     * La première URL qui répond correctement
     * est utilisée.
     *
     * @returns {Promise<object>}
     */
    async function fetchTwitchData() {
        let lastError = null;

        for (
            const url
            of TWITCH_API_URLS
        ) {
            try {
                return await fetchTwitchDataFromUrl(
                    url
                );
            } catch (error) {
                lastError =
                    error;

                console.warn(
                    `[Twitch] Échec de la requête vers ${url} :`,
                    error
                );
            }
        }

        throw (
            lastError ||
            new Error(
                "Impossible de contacter l’API Twitch."
            )
        );
    }


    /* =========================================================
       CHARGEMENT DES DONNÉES
    ========================================================= */

    let isLoading =
        false;

    /**
     * Active ou désactive l’état de chargement.
     *
     * @param {boolean} loading
     */
    function setLoadingState(loading) {
        isLoading =
            loading;

        if (!refreshButton) {
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
            String(loading)
        );

        refreshButton.setAttribute(
            "aria-label",
            loading
                ? "Actualisation des informations Twitch en cours"
                : "Actualiser les informations Twitch"
        );
    }


    /**
     * Charge les informations Twitch
     * puis met à jour l’interface.
     *
     * @param {boolean} manualRefresh
     * @returns {Promise<void>}
     */
    async function loadTwitchData(
        manualRefresh = false
    ) {
        if (isLoading) {
            return;
        }

        setLoadingState(
            true
        );

        if (manualRefresh) {
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
        } catch (error) {
            console.error(
                "[Twitch] Impossible de charger les données :",
                error
            );

            /*
             * Même si l’API échoue, on garde le lecteur
             * Twitch officiel visible.
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

            showApiMessage(
                error instanceof Error
                    ? error.message
                    : "Une erreur inconnue est survenue lors du chargement de Twitch.",
                "error"
            );
        } finally {
            setLoadingState(
                false
            );
        }
    }
        /* =========================================================
       ÉVÉNEMENTS ET LANCEMENT
    ========================================================= */

    /**
     * Gestion du bouton d’actualisation manuelle.
     */
    if (refreshButton) {
        refreshButton.addEventListener(
            "click",
            () => {
                loadTwitchData(
                    true
                );
            }
        );
    }


    /**
     * Affiche immédiatement le lecteur officiel Twitch,
     * même avant que l’API ait répondu.
     *
     * Cela évite d’avoir une zone vide pendant
     * le chargement initial.
     */
    updatePlayer(
        false,
        {
            displayName:
                TWITCH_CHANNEL
        }
    );


    /**
     * Premier chargement des informations Twitch.
     */
    loadTwitchData();


    /**
     * Actualisation automatique toutes les 60 secondes.
     */
    const refreshInterval =
        window.setInterval(
            () => {
                loadTwitchData();
            },
            REFRESH_DELAY
        );


    /**
     * Nettoie l’intervalle lorsque l’utilisateur
     * quitte ou recharge la page.
     */
    window.addEventListener(
        "beforeunload",
        () => {
            window.clearInterval(
                refreshInterval
            );
        }
    );


    /**
     * Recharge les informations lorsque l’utilisateur
     * revient sur l’onglet après l’avoir quitté.
     */
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
});