"use strict";

/* =========================================================
   IMPORTS
========================================================= */

import {
    clearTwitchAccessToken,
    getTwitchApiHeaders
} from "./auth.js";

import {
    getTwitchUserId
} from "./user.js";


/* =========================================================
   CONFIGURATION
========================================================= */

const TWITCH_VIDEOS_URL =
    "https://api.twitch.tv/helix/videos";

const DEFAULT_CHANNEL =
    "couaxia";

const MAX_VIDEOS_PER_REQUEST =
    100;

const ALLOWED_VIDEO_TYPES = [
    "all",
    "upload",
    "archive",
    "highlight"
];

const ALLOWED_SORT_VALUES = [
    "time",
    "trending",
    "views"
];

const ALLOWED_PERIOD_VALUES = [
    "all",
    "day",
    "week",
    "month"
];


/* =========================================================
   NORMALISATION
========================================================= */

/**
 * Nettoie le nom de la chaîne Twitch.
 *
 * @param {string} channelLogin
 * @returns {string}
 */
function normalizeChannelLogin(
    channelLogin
) {
    const normalizedLogin =
        String(channelLogin ?? "")
            .trim()
            .toLowerCase();

    if (!normalizedLogin) {
        throw new Error(
            "Le nom de la chaîne Twitch est vide."
        );
    }

    return normalizedLogin;
}


/**
 * Limite le nombre de vidéos entre 1 et 100.
 *
 * @param {number} value
 * @returns {number}
 */
function normalizeLimit(value) {
    const parsedValue =
        Number.parseInt(value, 10);

    if (!Number.isFinite(parsedValue)) {
        return 5;
    }

    return Math.min(
        Math.max(parsedValue, 1),
        MAX_VIDEOS_PER_REQUEST
    );
}


/**
 * Vérifie le type de vidéo demandé.
 *
 * Valeurs possibles :
 * - all
 * - upload
 * - archive
 * - highlight
 *
 * @param {string} type
 * @returns {string}
 */
function normalizeVideoType(type) {
    const normalizedType =
        String(type ?? "all")
            .trim()
            .toLowerCase();

    return ALLOWED_VIDEO_TYPES.includes(
        normalizedType
    )
        ? normalizedType
        : "all";
}


/**
 * Vérifie le mode de tri.
 *
 * Valeurs possibles :
 * - time
 * - trending
 * - views
 *
 * @param {string} sort
 * @returns {string}
 */
function normalizeSort(sort) {
    const normalizedSort =
        String(sort ?? "time")
            .trim()
            .toLowerCase();

    return ALLOWED_SORT_VALUES.includes(
        normalizedSort
    )
        ? normalizedSort
        : "time";
}


/**
 * Vérifie la période.
 *
 * Valeurs possibles :
 * - all
 * - day
 * - week
 * - month
 *
 * @param {string} period
 * @returns {string}
 */
function normalizePeriod(period) {
    const normalizedPeriod =
        String(period ?? "all")
            .trim()
            .toLowerCase();

    return ALLOWED_PERIOD_VALUES.includes(
        normalizedPeriod
    )
        ? normalizedPeriod
        : "all";
}


/* =========================================================
   REQUÊTE TWITCH
========================================================= */

/**
 * Effectue une requête vers Twitch.
 *
 * En cas d'erreur 401, le token est renouvelé,
 * puis la requête est retentée une seule fois.
 *
 * @param {URL} url
 * @returns {Promise<Response>}
 */
async function fetchTwitchVideosApi(url) {
    let headers =
        await getTwitchApiHeaders();

    let response =
        await fetch(
            url.toString(),
            {
                method: "GET",
                headers,
                cache: "no-store"
            }
        );

    if (response.status === 401) {
        clearTwitchAccessToken();

        headers =
            await getTwitchApiHeaders({
                forceRefresh: true
            });

        response =
            await fetch(
                url.toString(),
                {
                    method: "GET",
                    headers,
                    cache: "no-store"
                }
            );
    }

    return response;
}


/**
 * Appelle l'endpoint Twitch Get Videos.
 *
 * @param {object} options
 * @param {string} options.userId
 * @param {number} options.first
 * @param {string} options.type
 * @param {string} options.sort
 * @param {string} options.period
 * @param {string|null} options.after
 * @param {string|null} options.before
 * @returns {Promise<object>}
 */
async function requestVideosFromTwitch({
    userId,
    first,
    type,
    sort,
    period,
    after = null,
    before = null
}) {
    const videosUrl =
        new URL(TWITCH_VIDEOS_URL);

    videosUrl.searchParams.set(
        "user_id",
        userId
    );

    videosUrl.searchParams.set(
        "first",
        String(first)
    );

    videosUrl.searchParams.set(
        "type",
        type
    );

    videosUrl.searchParams.set(
        "sort",
        sort
    );

    videosUrl.searchParams.set(
        "period",
        period
    );

    /*
     * Twitch n'autorise pas l'utilisation simultanée
     * de "after" et "before".
     */
    if (after) {
        videosUrl.searchParams.set(
            "after",
            after
        );
    } else if (before) {
        videosUrl.searchParams.set(
            "before",
            before
        );
    }

    const response =
        await fetchTwitchVideosApi(
            videosUrl
        );

    if (!response.ok) {
        const errorBody =
            await response.text();

        throw new Error(
            `Erreur Twitch Get Videos ` +
            `(${response.status}) : ${errorBody}`
        );
    }

    return response.json();
}


/* =========================================================
   FORMATAGE
========================================================= */

/**
 * Remplace les variables présentes dans
 * les miniatures Twitch.
 *
 * @param {string|null} thumbnailUrl
 * @param {number} width
 * @param {number} height
 * @returns {string|null}
 */
function formatThumbnailUrl(
    thumbnailUrl,
    width = 640,
    height = 360
) {
    if (
        typeof thumbnailUrl !== "string" ||
        !thumbnailUrl
    ) {
        return null;
    }

    return thumbnailUrl
        .replace("%{width}", String(width))
        .replace("%{height}", String(height))
        .replace("{width}", String(width))
        .replace("{height}", String(height));
}


/**
 * Convertit une durée Twitch comme :
 *
 * 3h12m40s
 * 45m10s
 * 52s
 *
 * en nombre de secondes.
 *
 * @param {string} duration
 * @returns {number}
 */
function durationToSeconds(duration) {
    if (typeof duration !== "string") {
        return 0;
    }

    const durationPattern =
        /(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/;

    const match =
        duration.match(durationPattern);

    if (!match) {
        return 0;
    }

    const hours =
        Number(match[1]) || 0;

    const minutes =
        Number(match[2]) || 0;

    const seconds =
        Number(match[3]) || 0;

    return (
        hours * 3600 +
        minutes * 60 +
        seconds
    );
}


/**
 * Formate une durée pour l'affichage.
 *
 * @param {number} totalSeconds
 * @returns {string}
 */
function formatDuration(totalSeconds) {
    const safeSeconds =
        Math.max(
            Number(totalSeconds) || 0,
            0
        );

    const hours =
        Math.floor(
            safeSeconds / 3600
        );

    const minutes =
        Math.floor(
            (safeSeconds % 3600) / 60
        );

    const seconds =
        safeSeconds % 60;

    if (hours > 0) {
        return (
            `${hours} h ` +
            `${String(minutes).padStart(2, "0")} min`
        );
    }

    if (minutes > 0) {
        return (
            `${minutes} min ` +
            `${String(seconds).padStart(2, "0")} s`
        );
    }

    return `${seconds} s`;
}


/**
 * Formate une vidéo Twitch.
 *
 * @param {object} video
 * @returns {object}
 */
function formatVideo(video) {
    const durationSeconds =
        durationToSeconds(
            video.duration
        );

    return {
        id:
            video.id ||
            null,

        streamId:
            video.stream_id ||
            null,

        userId:
            video.user_id ||
            null,

        userLogin:
            video.user_login ||
            null,

        displayName:
            video.user_name ||
            video.user_login ||
            null,

        title:
            video.title ||
            "Vidéo Twitch",

        description:
            video.description ||
            "",

        createdAt:
            video.created_at ||
            null,

        publishedAt:
            video.published_at ||
            null,

        url:
            video.url ||
            null,

        thumbnailUrl:
            formatThumbnailUrl(
                video.thumbnail_url,
                640,
                360
            ),

        thumbnailLargeUrl:
            formatThumbnailUrl(
                video.thumbnail_url,
                1280,
                720
            ),

        viewable:
            video.viewable ||
            "public",

        viewCount:
            Number(video.view_count) || 0,

        language:
            video.language ||
            null,

        type:
            video.type ||
            null,

        duration:
            video.duration ||
            null,

        durationSeconds,

        formattedDuration:
            formatDuration(
                durationSeconds
            ),

        mutedSegments:
            Array.isArray(
                video.muted_segments
            )
                ? video.muted_segments
                : []
    };
}


/**
 * Formate la réponse complète.
 *
 * @param {object} twitchData
 * @param {string} channelLogin
 * @param {string} userId
 * @param {object} filters
 * @returns {object}
 */
function formatVideosResult(
    twitchData,
    channelLogin,
    userId,
    filters
) {
    const videos =
        Array.isArray(twitchData?.data)
            ? twitchData.data.map(
                formatVideo
            )
            : [];

    const cursor =
        twitchData?.pagination?.cursor ||
        null;

    return {
        channel:
            channelLogin,

        userId,

        videos,

        returned:
            videos.length,

        filters: {
            type:
                filters.type,

            sort:
                filters.sort,

            period:
                filters.period,

            first:
                filters.first
        },

        pagination: {
            cursor,

            hasNextPage:
                Boolean(cursor)
        }
    };
}


/* =========================================================
   FONCTIONS PUBLIQUES
========================================================= */

/**
 * Récupère les vidéos d'une chaîne Twitch.
 *
 * @param {string} channelLogin
 * @param {object} options
 * @param {number} options.first
 * @param {"all"|"upload"|"archive"|"highlight"} options.type
 * @param {"time"|"trending"|"views"} options.sort
 * @param {"all"|"day"|"week"|"month"} options.period
 * @param {string|null} options.after
 * @param {string|null} options.before
 * @returns {Promise<object>}
 */
export async function getChannelVideos(
    channelLogin = DEFAULT_CHANNEL,
    {
        first = 5,
        type = "all",
        sort = "time",
        period = "all",
        after = null,
        before = null
    } = {}
) {
    const normalizedLogin =
        normalizeChannelLogin(
            channelLogin
        );

    const userId =
        await getTwitchUserId(
            normalizedLogin
        );

    const normalizedOptions = {
        first:
            normalizeLimit(first),

        type:
            normalizeVideoType(type),

        sort:
            normalizeSort(sort),

        period:
            normalizePeriod(period),

        after:
            after
                ? String(after).trim()
                : null,

        before:
            before
                ? String(before).trim()
                : null
    };

    const twitchData =
        await requestVideosFromTwitch({
            userId,

            first:
                normalizedOptions.first,

            type:
                normalizedOptions.type,

            sort:
                normalizedOptions.sort,

            period:
                normalizedOptions.period,

            after:
                normalizedOptions.after,

            before:
                normalizedOptions.before
        });

    return formatVideosResult(
        twitchData,
        normalizedLogin,
        userId,
        normalizedOptions
    );
}


/**
 * Récupère les dernières rediffusions automatiques.
 *
 * Les archives correspondent généralement aux VOD
 * créées après un live.
 *
 * @param {string} channelLogin
 * @param {number} limit
 * @returns {Promise<object>}
 */
export async function getLatestArchives(
    channelLogin = DEFAULT_CHANNEL,
    limit = 5
) {
    return getChannelVideos(
        channelLogin,
        {
            first:
                limit,

            type:
                "archive",

            sort:
                "time",

            period:
                "all"
        }
    );
}


/**
 * Récupère les derniers highlights.
 *
 * @param {string} channelLogin
 * @param {number} limit
 * @returns {Promise<object>}
 */
export async function getLatestHighlights(
    channelLogin = DEFAULT_CHANNEL,
    limit = 5
) {
    return getChannelVideos(
        channelLogin,
        {
            first:
                limit,

            type:
                "highlight",

            sort:
                "time",

            period:
                "all"
        }
    );
}


/**
 * Récupère les vidéos mises en ligne manuellement.
 *
 * @param {string} channelLogin
 * @param {number} limit
 * @returns {Promise<object>}
 */
export async function getLatestUploads(
    channelLogin = DEFAULT_CHANNEL,
    limit = 5
) {
    return getChannelVideos(
        channelLogin,
        {
            first:
                limit,

            type:
                "upload",

            sort:
                "time",

            period:
                "all"
        }
    );
}


/**
 * Récupère la dernière vidéo disponible.
 *
 * @param {string} channelLogin
 * @returns {Promise<object|null>}
 */
export async function getLatestVideo(
    channelLogin = DEFAULT_CHANNEL
) {
    const result =
        await getChannelVideos(
            channelLogin,
            {
                first: 1,
                type: "all",
                sort: "time",
                period: "all"
            }
        );

    return result.videos[0] || null;
}