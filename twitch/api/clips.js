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

const TWITCH_CLIPS_URL =
    "https://api.twitch.tv/helix/clips";

const DEFAULT_CHANNEL =
    "couaxia";

const MAX_CLIPS_PER_REQUEST =
    100;


/* =========================================================
   NORMALISATION
========================================================= */

/**
 * Nettoie le nom d'une chaîne Twitch.
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
 * Limite le nombre de clips entre 1 et 100.
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
        MAX_CLIPS_PER_REQUEST
    );
}


/**
 * Convertit une date en format ISO compatible avec Twitch.
 *
 * @param {string|Date|null} value
 * @returns {string|null}
 */
function normalizeDate(value) {
    if (!value) {
        return null;
    }

    const date =
        value instanceof Date
            ? value
            : new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        throw new Error(
            `Date Twitch invalide : ${value}`
        );
    }

    return date.toISOString();
}


/**
 * Calcule la date de début correspondant
 * à une période prédéfinie.
 *
 * @param {"day"|"week"|"month"|"year"|"all"} period
 * @returns {string|null}
 */
function getStartedAtFromPeriod(
    period
) {
    const normalizedPeriod =
        String(period ?? "all")
            .trim()
            .toLowerCase();

    if (normalizedPeriod === "all") {
        return null;
    }

    const startedAt =
        new Date();

    switch (normalizedPeriod) {
        case "day":
            startedAt.setUTCDate(
                startedAt.getUTCDate() - 1
            );
            break;

        case "week":
            startedAt.setUTCDate(
                startedAt.getUTCDate() - 7
            );
            break;

        case "month":
            startedAt.setUTCMonth(
                startedAt.getUTCMonth() - 1
            );
            break;

        case "year":
            startedAt.setUTCFullYear(
                startedAt.getUTCFullYear() - 1
            );
            break;

        default:
            throw new Error(
                `Période de clips invalide : ${period}`
            );
    }

    return startedAt.toISOString();
}


/* =========================================================
   REQUÊTE TWITCH
========================================================= */

/**
 * Effectue une requête vers Twitch.
 *
 * Si le token reçoit une erreur 401,
 * il est renouvelé puis la requête est relancée une fois.
 *
 * @param {URL} url
 * @returns {Promise<Response>}
 */
async function fetchTwitchClipsApi(url) {
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
 * Appelle Twitch avec les paramètres fournis.
 *
 * @param {URL} clipsUrl
 * @returns {Promise<object>}
 */
async function requestClipsFromTwitch(
    clipsUrl
) {
    const response =
        await fetchTwitchClipsApi(
            clipsUrl
        );

    if (!response.ok) {
        const errorBody =
            await response.text();

        throw new Error(
            `Erreur Twitch Get Clips ` +
            `(${response.status}) : ${errorBody}`
        );
    }

    return response.json();
}


/* =========================================================
   FORMATAGE
========================================================= */

/**
 * Formate la miniature d'un clip.
 *
 * @param {string|null} thumbnailUrl
 * @returns {string|null}
 */
function formatThumbnailUrl(
    thumbnailUrl
) {
    if (
        typeof thumbnailUrl !== "string" ||
        !thumbnailUrl
    ) {
        return null;
    }

    return thumbnailUrl;
}


/**
 * Formate la durée d'un clip.
 *
 * @param {number} duration
 * @returns {string}
 */
function formatClipDuration(
    duration
) {
    const totalSeconds =
        Math.max(
            Number(duration) || 0,
            0
        );

    if (totalSeconds < 60) {
        return `${Math.round(totalSeconds)} s`;
    }

    const minutes =
        Math.floor(totalSeconds / 60);

    const seconds =
        Math.round(
            totalSeconds % 60
        );

    return (
        `${minutes} min ` +
        `${String(seconds).padStart(2, "0")} s`
    );
}


/**
 * Formate un clip Twitch.
 *
 * @param {object} clip
 * @returns {object}
 */
function formatClip(clip) {
    const duration =
        Number(clip.duration) || 0;

    return {
        id:
            clip.id ||
            null,

        url:
            clip.url ||
            null,

        embedUrl:
            clip.embed_url ||
            null,

        broadcasterId:
            clip.broadcaster_id ||
            null,

        broadcasterName:
            clip.broadcaster_name ||
            null,

        creatorId:
            clip.creator_id ||
            null,

        creatorName:
            clip.creator_name ||
            null,

        videoId:
            clip.video_id ||
            null,

        gameId:
            clip.game_id ||
            null,

        language:
            clip.language ||
            null,

        title:
            clip.title ||
            "Clip Twitch",

        viewCount:
            Number(
                clip.view_count
            ) || 0,

        createdAt:
            clip.created_at ||
            null,

        thumbnailUrl:
            formatThumbnailUrl(
                clip.thumbnail_url
            ),

        duration,

        formattedDuration:
            formatClipDuration(
                duration
            ),

        vodOffset:
            Number.isFinite(
                Number(clip.vod_offset)
            )
                ? Number(
                    clip.vod_offset
                )
                : null,

        featured:
            Boolean(
                clip.is_featured
            )
    };
}


/**
 * Formate une liste de clips Twitch.
 *
 * @param {object} twitchData
 * @param {object} context
 * @returns {object}
 */
function formatClipsResult(
    twitchData,
    context
) {
    const clips =
        Array.isArray(twitchData?.data)
            ? twitchData.data.map(
                formatClip
            )
            : [];

    const cursor =
        twitchData?.pagination?.cursor ||
        null;

    return {
        ...context,

        clips,

        returned:
            clips.length,

        pagination: {
            cursor,

            hasNextPage:
                Boolean(cursor)
        }
    };
}


/* =========================================================
   CLIPS D'UNE CHAÎNE
========================================================= */

/**
 * Récupère les clips d'une chaîne Twitch.
 *
 * @param {string} channelLogin
 * @param {object} options
 * @param {number} options.first
 * @param {string|Date|null} options.startedAt
 * @param {string|Date|null} options.endedAt
 * @param {"day"|"week"|"month"|"year"|"all"|null} options.period
 * @param {string|null} options.after
 * @param {string|null} options.before
 * @param {boolean|null} options.featured
 * @returns {Promise<object>}
 */
export async function getChannelClips(
    channelLogin = DEFAULT_CHANNEL,
    {
        first = 5,
        startedAt = null,
        endedAt = null,
        period = null,
        after = null,
        before = null,
        featured = null
    } = {}
) {
    const normalizedLogin =
        normalizeChannelLogin(
            channelLogin
        );

    const broadcasterId =
        await getTwitchUserId(
            normalizedLogin
        );

    const clipsUrl =
        new URL(TWITCH_CLIPS_URL);

    clipsUrl.searchParams.set(
        "broadcaster_id",
        broadcasterId
    );

    clipsUrl.searchParams.set(
        "first",
        String(
            normalizeLimit(first)
        )
    );

    let normalizedStartedAt =
        normalizeDate(startedAt);

    if (
        !normalizedStartedAt &&
        period
    ) {
        normalizedStartedAt =
            getStartedAtFromPeriod(
                period
            );
    }

    const normalizedEndedAt =
        normalizeDate(endedAt);

    if (normalizedStartedAt) {
        clipsUrl.searchParams.set(
            "started_at",
            normalizedStartedAt
        );
    }

    if (normalizedEndedAt) {
        clipsUrl.searchParams.set(
            "ended_at",
            normalizedEndedAt
        );
    }

    /*
     * Twitch ne permet pas d'utiliser after et before
     * simultanément.
     */
    if (after) {
        clipsUrl.searchParams.set(
            "after",
            String(after).trim()
        );
    } else if (before) {
        clipsUrl.searchParams.set(
            "before",
            String(before).trim()
        );
    }

    if (typeof featured === "boolean") {
        clipsUrl.searchParams.set(
            "is_featured",
            String(featured)
        );
    }

    const twitchData =
        await requestClipsFromTwitch(
            clipsUrl
        );

    return formatClipsResult(
        twitchData,
        {
            channel:
                normalizedLogin,

            broadcasterId,

            filters: {
                first:
                    normalizeLimit(first),

                startedAt:
                    normalizedStartedAt,

                endedAt:
                    normalizedEndedAt,

                featured:
                    typeof featured === "boolean"
                        ? featured
                        : null
            }
        }
    );
}


/* =========================================================
   CLIPS D'UN JEU
========================================================= */

/**
 * Récupère les clips associés à une catégorie Twitch.
 *
 * @param {string} gameId
 * @param {object} options
 * @returns {Promise<object>}
 */
export async function getGameClips(
    gameId,
    {
        first = 5,
        startedAt = null,
        endedAt = null,
        period = null,
        after = null,
        before = null,
        featured = null
    } = {}
) {
    const normalizedGameId =
        String(gameId ?? "")
            .trim();

    if (!normalizedGameId) {
        throw new Error(
            "L'identifiant du jeu Twitch est vide."
        );
    }

    const clipsUrl =
        new URL(TWITCH_CLIPS_URL);

    clipsUrl.searchParams.set(
        "game_id",
        normalizedGameId
    );

    clipsUrl.searchParams.set(
        "first",
        String(
            normalizeLimit(first)
        )
    );

    let normalizedStartedAt =
        normalizeDate(startedAt);

    if (
        !normalizedStartedAt &&
        period
    ) {
        normalizedStartedAt =
            getStartedAtFromPeriod(
                period
            );
    }

    const normalizedEndedAt =
        normalizeDate(endedAt);

    if (normalizedStartedAt) {
        clipsUrl.searchParams.set(
            "started_at",
            normalizedStartedAt
        );
    }

    if (normalizedEndedAt) {
        clipsUrl.searchParams.set(
            "ended_at",
            normalizedEndedAt
        );
    }

    if (after) {
        clipsUrl.searchParams.set(
            "after",
            String(after).trim()
        );
    } else if (before) {
        clipsUrl.searchParams.set(
            "before",
            String(before).trim()
        );
    }

    if (typeof featured === "boolean") {
        clipsUrl.searchParams.set(
            "is_featured",
            String(featured)
        );
    }

    const twitchData =
        await requestClipsFromTwitch(
            clipsUrl
        );

    return formatClipsResult(
        twitchData,
        {
            gameId:
                normalizedGameId,

            filters: {
                first:
                    normalizeLimit(first),

                startedAt:
                    normalizedStartedAt,

                endedAt:
                    normalizedEndedAt,

                featured:
                    typeof featured === "boolean"
                        ? featured
                        : null
            }
        }
    );
}


/* =========================================================
   CLIP PAR IDENTIFIANT
========================================================= */

/**
 * Récupère un clip précis grâce à son identifiant.
 *
 * @param {string} clipId
 * @returns {Promise<object|null>}
 */
export async function getClipById(
    clipId
) {
    const normalizedClipId =
        String(clipId ?? "")
            .trim();

    if (!normalizedClipId) {
        throw new Error(
            "L'identifiant du clip Twitch est vide."
        );
    }

    const clipsUrl =
        new URL(TWITCH_CLIPS_URL);

    clipsUrl.searchParams.append(
        "id",
        normalizedClipId
    );

    const twitchData =
        await requestClipsFromTwitch(
            clipsUrl
        );

    const clip =
        twitchData?.data?.[0];

    return clip
        ? formatClip(clip)
        : null;
}


/**
 * Récupère plusieurs clips grâce à leurs identifiants.
 *
 * Twitch accepte au maximum 100 identifiants.
 *
 * @param {string[]} clipIds
 * @returns {Promise<object[]>}
 */
export async function getClipsByIds(
    clipIds
) {
    if (!Array.isArray(clipIds)) {
        throw new Error(
            "La liste des identifiants de clips est invalide."
        );
    }

    const normalizedIds = [
        ...new Set(
            clipIds
                .map((clipId) =>
                    String(clipId ?? "").trim()
                )
                .filter(Boolean)
        )
    ].slice(0, 100);

    if (normalizedIds.length === 0) {
        return [];
    }

    const clipsUrl =
        new URL(TWITCH_CLIPS_URL);

    for (
        const clipId of normalizedIds
    ) {
        clipsUrl.searchParams.append(
            "id",
            clipId
        );
    }

    const twitchData =
        await requestClipsFromTwitch(
            clipsUrl
        );

    return Array.isArray(
        twitchData?.data
    )
        ? twitchData.data.map(
            formatClip
        )
        : [];
}


/* =========================================================
   RACCOURCIS
========================================================= */

/**
 * Récupère les clips des 7 derniers jours.
 *
 * @param {string} channelLogin
 * @param {number} limit
 * @returns {Promise<object>}
 */
export async function getWeeklyClips(
    channelLogin = DEFAULT_CHANNEL,
    limit = 5
) {
    return getChannelClips(
        channelLogin,
        {
            first:
                limit,

            period:
                "week"
        }
    );
}


/**
 * Récupère les clips des 30 derniers jours.
 *
 * @param {string} channelLogin
 * @param {number} limit
 * @returns {Promise<object>}
 */
export async function getMonthlyClips(
    channelLogin = DEFAULT_CHANNEL,
    limit = 5
) {
    return getChannelClips(
        channelLogin,
        {
            first:
                limit,

            period:
                "month"
        }
    );
}


/**
 * Récupère le clip le plus populaire de la semaine.
 *
 * L'API Twitch renvoie les clips triés par nombre
 * de vues décroissant.
 *
 * @param {string} channelLogin
 * @returns {Promise<object|null>}
 */
export async function getTopWeeklyClip(
    channelLogin = DEFAULT_CHANNEL
) {
    const result =
        await getWeeklyClips(
            channelLogin,
            1
        );

    return result.clips[0] || null;
}


/**
 * Récupère les clips mis en avant.
 *
 * @param {string} channelLogin
 * @param {number} limit
 * @returns {Promise<object>}
 */
export async function getFeaturedClips(
    channelLogin = DEFAULT_CHANNEL,
    limit = 5
) {
    return getChannelClips(
        channelLogin,
        {
            first:
                limit,

            featured:
                true
        }
    );
}