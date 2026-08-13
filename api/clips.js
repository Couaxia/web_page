"use strict";

/* =========================================================
   API TWITCH — CLIPS
   COUAXIA
========================================================= */

import {
    clearTwitchAccessToken,
    getTwitchApiHeaders,
    getChannelLogin
} from "./auth.js";

import {
    getTwitchUserId
} from "./user.js";


/* =========================================================
   CONFIGURATION
========================================================= */

const TWITCH_CLIPS_URL =
    "https://api.twitch.tv/helix/clips";

const MAX_CLIPS_PER_REQUEST =
    100;


/* =========================================================
   OUTILS
========================================================= */

function normalizeText(
    value
) {

    return String(
        value ?? ""
    ).trim();
}


/**
 * Retourne le nom de chaîne configuré.
 *
 * @returns {string}
 */
function getDefaultChannel() {

    return getChannelLogin();
}


/**
 * Nettoie le login Twitch.
 *
 * @param {unknown} channelLogin
 * @returns {string}
 */
function normalizeChannelLogin(
    channelLogin
) {

    const normalizedLogin =
        normalizeText(
            channelLogin
        )
            .toLowerCase();


    if (
        !normalizedLogin
    ) {

        throw new Error(
            "Le nom de la chaîne Twitch est vide."
        );
    }


    return normalizedLogin;
}


/**
 * Limite first entre 1 et 100.
 *
 * @param {unknown} value
 * @param {number} defaultValue
 * @returns {number}
 */
function normalizeLimit(
    value,
    defaultValue = 5
) {

    const parsedValue =
        Number.parseInt(
            value,
            10
        );


    if (
        !Number.isFinite(
            parsedValue
        )
    ) {

        return defaultValue;
    }


    return Math.min(
        Math.max(
            parsedValue,
            1
        ),
        MAX_CLIPS_PER_REQUEST
    );
}


/**
 * Convertit une date au format ISO.
 *
 * @param {string|Date|null} value
 * @returns {string|null}
 */
function normalizeDate(
    value
) {

    if (
        !value
    ) {

        return null;
    }


    const date =
        value instanceof Date
            ? value
            : new Date(
                value
            );


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
 * Transforme une période en date de début.
 *
 * @param {"day"|"week"|"month"|"year"|"all"|string|null} period
 * @returns {string|null}
 */
function getStartedAtFromPeriod(
    period
) {

    const normalizedPeriod =
        normalizeText(
            period || "all"
        )
            .toLowerCase();


    if (
        normalizedPeriod ===
        "all"
    ) {

        return null;
    }


    const startedAt =
        new Date();


    switch (
        normalizedPeriod
    ) {

        case "day":

            startedAt.setUTCDate(
                startedAt.getUTCDate() -
                1
            );

            break;


        case "week":

            startedAt.setUTCDate(
                startedAt.getUTCDate() -
                7
            );

            break;


        case "month":

            startedAt.setUTCMonth(
                startedAt.getUTCMonth() -
                1
            );

            break;


        case "year":

            startedAt.setUTCFullYear(
                startedAt.getUTCFullYear() -
                1
            );

            break;


        default:

            throw new Error(
                `Période de clips invalide : ${period}`
            );
    }


    return startedAt.toISOString();
}


/**
 * Nettoie un curseur Twitch.
 *
 * @param {unknown} cursor
 * @returns {string|null}
 */
function normalizeCursor(
    cursor
) {

    const normalizedCursor =
        normalizeText(
            cursor
        );


    return (
        normalizedCursor ||
        null
    );
}


/**
 * Convertit une valeur en booléen nullable.
 *
 * @param {unknown} value
 * @returns {boolean|null}
 */
function normalizeOptionalBoolean(
    value
) {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {

        return null;
    }


    if (
        typeof value ===
        "boolean"
    ) {

        return value;
    }


    const normalized =
        normalizeText(
            value
        )
            .toLowerCase();


    if (
        [
            "true",
            "1",
            "yes",
            "oui",
            "on"
        ].includes(
            normalized
        )
    ) {

        return true;
    }


    if (
        [
            "false",
            "0",
            "no",
            "non",
            "off"
        ].includes(
            normalized
        )
    ) {

        return false;
    }


    return null;
}


/* =========================================================
   RÉPONSE TWITCH
========================================================= */

async function readTwitchResponse(
    response
) {

    const contentType =
        response.headers.get(
            "content-type"
        ) || "";


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
            message:
                text
        };
    }
}


/* =========================================================
   REQUÊTE TWITCH
========================================================= */

async function fetchTwitchClipsApi(
    url
) {

    let response =
        await fetch(
            url.toString(),
            {
                method:
                    "GET",

                headers:
                    await getTwitchApiHeaders(),

                cache:
                    "no-store"
            }
        );


    /*
     * Si Twitch indique que le token n'est plus valide,
     * on le supprime puis on retente une seule fois.
     */

    if (
        response.status ===
        401
    ) {

        clearTwitchAccessToken();


        response =
            await fetch(
                url.toString(),
                {
                    method:
                        "GET",

                    headers:
                        await getTwitchApiHeaders({
                            forceRefresh:
                                true
                        }),

                    cache:
                        "no-store"
                }
            );
    }


    return response;
}


/**
 * Appelle Twitch et retourne les données JSON.
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


    const twitchData =
        await readTwitchResponse(
            response
        );


    if (
        !response.ok
    ) {

        throw new Error(
            `Erreur Twitch Get Clips (${response.status}) : ${
                twitchData?.message ||
                twitchData?.error ||
                "Erreur Twitch inconnue."
            }`
        );
    }


    return twitchData;
}


/* =========================================================
   FILTRES
========================================================= */

function applyClipFilters(
    clipsUrl,
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

    const normalizedFirst =
        normalizeLimit(
            first
        );


    let normalizedStartedAt =
        normalizeDate(
            startedAt
        );


    if (
        !normalizedStartedAt &&
        period
    ) {

        normalizedStartedAt =
            getStartedAtFromPeriod(
                period
            );
    }


    let normalizedEndedAt =
        normalizeDate(
            endedAt
        );


    /*
     * Pour nos filtres personnalisés,
     * une période va jusqu'au moment actuel.
     */

    if (
        normalizedStartedAt &&
        !normalizedEndedAt
    ) {

        normalizedEndedAt =
            new Date()
                .toISOString();
    }


    clipsUrl.searchParams.set(
        "first",
        String(
            normalizedFirst
        )
    );


    if (
        normalizedStartedAt
    ) {

        clipsUrl.searchParams.set(
            "started_at",
            normalizedStartedAt
        );
    }


    if (
        normalizedEndedAt
    ) {

        clipsUrl.searchParams.set(
            "ended_at",
            normalizedEndedAt
        );
    }


    const normalizedAfter =
        normalizeCursor(
            after
        );


    const normalizedBefore =
        normalizeCursor(
            before
        );


    /*
     * after et before ne sont pas utilisés
     * simultanément.
     */

    if (
        normalizedAfter
    ) {

        clipsUrl.searchParams.set(
            "after",
            normalizedAfter
        );

    } else if (
        normalizedBefore
    ) {

        clipsUrl.searchParams.set(
            "before",
            normalizedBefore
        );
    }


    const normalizedFeatured =
        normalizeOptionalBoolean(
            featured
        );


    if (
        typeof normalizedFeatured ===
        "boolean"
    ) {

        clipsUrl.searchParams.set(
            "is_featured",
            String(
                normalizedFeatured
            )
        );
    }


    return {

        first:
            normalizedFirst,

        startedAt:
            normalizedStartedAt,

        endedAt:
            normalizedEndedAt,

        after:
            normalizedAfter,

        before:
            normalizedBefore,

        featured:
            normalizedFeatured

    };
}


/* =========================================================
   FORMATAGE CLIP
========================================================= */

function formatThumbnailUrl(
    thumbnailUrl
) {

    const url =
        normalizeText(
            thumbnailUrl
        );


    return (
        url ||
        null
    );
}


/**
 * Retourne une durée lisible.
 *
 * @param {number} duration
 * @returns {string}
 */
function formatClipDuration(
    duration
) {

    const totalSeconds =
        Math.max(
            Number(
                duration
            ) ||
            0,
            0
        );


    if (
        totalSeconds <
        60
    ) {

        return `${Math.round(
            totalSeconds
        )} s`;
    }


    const minutes =
        Math.floor(
            totalSeconds /
            60
        );


    const seconds =
        Math.round(
            totalSeconds %
            60
        );


    return (
        `${minutes} min ` +
        `${String(
            seconds
        ).padStart(
            2,
            "0"
        )} s`
    );
}


/**
 * Formate un clip Twitch.
 *
 * @param {object} clip
 * @returns {object}
 */
function formatClip(
    clip
) {

    const duration =
        Number(
            clip?.duration
        ) ||
        0;


    const viewCount =
        Number(
            clip?.view_count
        ) ||
        0;


    const rawVodOffset =
        Number(
            clip?.vod_offset
        );


    return {

        id:
            clip?.id ||
            null,

        url:
            clip?.url ||
            null,

        embedUrl:
            clip?.embed_url ||
            null,

        broadcasterId:
            clip?.broadcaster_id ||
            null,

        broadcasterName:
            clip?.broadcaster_name ||
            null,

        creatorId:
            clip?.creator_id ||
            null,

        creatorName:
            clip?.creator_name ||
            null,

        videoId:
            clip?.video_id ||
            null,

        gameId:
            clip?.game_id ||
            null,

        language:
            clip?.language ||
            null,

        title:
            clip?.title ||
            "Clip Twitch",

        viewCount,

        createdAt:
            clip?.created_at ||
            null,

        thumbnailUrl:
            formatThumbnailUrl(
                clip?.thumbnail_url
            ),

        duration,

        formattedDuration:
            formatClipDuration(
                duration
            ),

        vodOffset:
            Number.isFinite(
                rawVodOffset
            )
                ? rawVodOffset
                : null,

        featured:
            Boolean(
                clip?.is_featured
            )

    };
}


/**
 * Formate une réponse contenant plusieurs clips.
 *
 * @param {object} twitchData
 * @param {object} context
 * @returns {object}
 */
function formatClipsResult(
    twitchData,
    context = {}
) {

    const clips =
        Array.isArray(
            twitchData?.data
        )
            ? twitchData.data.map(
                formatClip
            )
            : [];


    const cursor =
        twitchData
            ?.pagination
            ?.cursor ||
        null;


    return {

        ...context,

        clips,

        returned:
            clips.length,

        pagination: {

            cursor,

            hasNextPage:
                Boolean(
                    cursor
                )

        }

    };
}


/* =========================================================
   CLIPS D'UNE CHAÎNE
========================================================= */

export async function getChannelClips(
    channelLogin = null,
    {
        first = 100,
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
            channelLogin ||
            getDefaultChannel()
        );


    const broadcasterId =
        await getTwitchUserId(
            normalizedLogin
        );


    if (
        !broadcasterId
    ) {

        throw new Error(
            `Chaîne Twitch introuvable : ${normalizedLogin}`
        );
    }


    const clipsUrl =
        new URL(
            TWITCH_CLIPS_URL
        );


    clipsUrl.searchParams.set(
        "broadcaster_id",
        broadcasterId
    );


    const filters =
        applyClipFilters(
            clipsUrl,
            {
                first,
                startedAt,
                endedAt,
                period,
                after,
                before,
                featured
            }
        );


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

            filters

        }
    );
}


/* =========================================================
   PLUSIEURS PAGES D'UNE CHAÎNE
========================================================= */

export async function getAllChannelClips(
    channelLogin = null,
    {
        maxClips = 300
    } = {}
) {

    const normalizedMaximum =
        Math.max(
            Number.parseInt(
                maxClips,
                10
            ) ||
            100,
            1
        );


    const normalizedLogin =
        normalizeChannelLogin(
            channelLogin ||
            getDefaultChannel()
        );


    const allClips =
        [];


    let cursor =
        null;

    let broadcasterId =
        null;

    let filters =
        null;


    do {

        const remaining =
            normalizedMaximum -
            allClips.length;


        const result =
            await getChannelClips(
                normalizedLogin,
                {

                    first:
                        Math.min(
                            remaining,
                            MAX_CLIPS_PER_REQUEST
                        ),

                    after:
                        cursor

                }
            );


        broadcasterId =
            result.broadcasterId;


        filters =
            result.filters;


        allClips.push(
            ...result.clips
        );


        cursor =
            result.pagination
                ?.cursor ||
            null;


    } while (
        cursor &&
        allClips.length <
            normalizedMaximum
    );


    const clips =
        allClips.slice(
            0,
            normalizedMaximum
        );


    return {

        channel:
            normalizedLogin,

        broadcasterId,

        clips,

        returned:
            clips.length,

        filters,

        pagination: {

            cursor,

            hasNextPage:
                Boolean(
                    cursor
                )

        }

    };
}


/* =========================================================
   CLIPS D'UN JEU
========================================================= */

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
        normalizeText(
            gameId
        );


    if (
        !normalizedGameId
    ) {

        throw new Error(
            "L'identifiant du jeu Twitch est vide."
        );
    }


    const clipsUrl =
        new URL(
            TWITCH_CLIPS_URL
        );


    clipsUrl.searchParams.set(
        "game_id",
        normalizedGameId
    );


    const filters =
        applyClipFilters(
            clipsUrl,
            {
                first,
                startedAt,
                endedAt,
                period,
                after,
                before,
                featured
            }
        );


    const twitchData =
        await requestClipsFromTwitch(
            clipsUrl
        );


    return formatClipsResult(
        twitchData,
        {

            gameId:
                normalizedGameId,

            filters

        }
    );
}


/* =========================================================
   CLIP PAR ID
========================================================= */

export async function getClipById(
    clipId
) {

    const normalizedClipId =
        normalizeText(
            clipId
        );


    if (
        !normalizedClipId
    ) {

        throw new Error(
            "L'identifiant du clip Twitch est vide."
        );
    }


    const clipsUrl =
        new URL(
            TWITCH_CLIPS_URL
        );


    clipsUrl.searchParams.append(
        "id",
        normalizedClipId
    );


    const twitchData =
        await requestClipsFromTwitch(
            clipsUrl
        );


    const clip =
        twitchData
            ?.data
            ?.[0] ||
        null;


    return (
        clip
            ? formatClip(
                clip
            )
            : null
    );
}


/* =========================================================
   PLUSIEURS CLIPS PAR ID
========================================================= */

export async function getClipsByIds(
    clipIds
) {

    if (
        !Array.isArray(
            clipIds
        )
    ) {

        throw new Error(
            "La liste des identifiants de clips est invalide."
        );
    }


    const normalizedIds =
        [
            ...new Set(
                clipIds
                    .map(
                        clipId =>
                            normalizeText(
                                clipId
                            )
                    )
                    .filter(Boolean)
            )
        ]
            .slice(
                0,
                MAX_CLIPS_PER_REQUEST
            );


    if (
        normalizedIds.length ===
        0
    ) {

        return [];
    }


    const clipsUrl =
        new URL(
            TWITCH_CLIPS_URL
        );


    for (
        const clipId of
        normalizedIds
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

export async function getDailyClips(
    channelLogin = null,
    limit = 5
) {

    return getChannelClips(
        channelLogin ||
        getDefaultChannel(),
        {

            first:
                limit,

            period:
                "day"

        }
    );
}


export async function getWeeklyClips(
    channelLogin = null,
    limit = 5
) {

    return getChannelClips(
        channelLogin ||
        getDefaultChannel(),
        {

            first:
                limit,

            period:
                "week"

        }
    );
}


/**
 * Conservé pour compatibilité avec ton projet.
 *
 * Cette fonction renvoie les meilleurs clips
 * disponibles sans forcer une période mensuelle.
 */
export async function getMonthlyClips(
    channelLogin = null,
    limit = 5
) {

    return getChannelClips(
        channelLogin ||
        getDefaultChannel(),
        {
            first:
                limit
        }
    );
}


export async function getTopWeeklyClip(
    channelLogin = null
) {

    const result =
        await getWeeklyClips(
            channelLogin ||
            getDefaultChannel(),
            1
        );


    return (
        result.clips[0] ||
        null
    );
}


export async function getFeaturedClips(
    channelLogin = null,
    limit = 5
) {

    return getChannelClips(
        channelLogin ||
        getDefaultChannel(),
        {

            first:
                limit,

            featured:
                true

        }
    );
}


/* =========================================================
   API HTTP PUBLIQUE
========================================================= */

/**
 * Exemples :
 *
 * GET /api/clips
 *
 * GET /api/clips?period=week&first=10
 *
 * GET /api/clips?channel=couaxia&first=20
 *
 * GET /api/clips?gameId=509658&first=10
 *
 * GET /api/clips?clipId=NomDuClip
 */
export default async function handler(
    request,
    response
) {

    /* =====================================================
       CACHE
    ====================================================== */

    response.setHeader(
        "Cache-Control",
        "no-store, max-age=0"
    );


    /* =====================================================
       MÉTHODE
    ====================================================== */

    if (
        request.method !==
        "GET"
    ) {

        response.setHeader(
            "Allow",
            "GET"
        );


        response
            .status(405)
            .json({
                success:
                    false,

                error:
                    "Méthode non autorisée."
            });


        return;
    }


    try {

        /* =================================================
           PARAMÈTRES
        ================================================== */

        const channel =
            normalizeText(
                request.query?.channel
            ) ||
            getDefaultChannel();


        const gameId =
            normalizeText(
                request.query?.gameId ??
                request.query?.game_id
            );


        const clipId =
            normalizeText(
                request.query?.clipId ??
                request.query?.clip_id
            );


        const first =
            normalizeLimit(
                request.query?.first,
                10
            );


        const period =
            normalizeText(
                request.query?.period
            ) ||
            null;


        const startedAt =
            normalizeText(
                request.query?.startedAt ??
                request.query?.started_at
            ) ||
            null;


        const endedAt =
            normalizeText(
                request.query?.endedAt ??
                request.query?.ended_at
            ) ||
            null;


        const after =
            normalizeText(
                request.query?.after
            ) ||
            null;


        const before =
            normalizeText(
                request.query?.before
            ) ||
            null;


        const featured =
            normalizeOptionalBoolean(
                request.query?.featured ??
                request.query?.is_featured
            );


        /* =================================================
           CLIP PRÉCIS
        ================================================== */

        if (
            clipId
        ) {

            const clip =
                await getClipById(
                    clipId
                );


            if (
                !clip
            ) {

                response
                    .status(404)
                    .json({
                        success:
                            false,

                        clip:
                            null,

                        error:
                            "Clip Twitch introuvable."
                    });


                return;
            }


            response
                .status(200)
                .json({

                    success:
                        true,

                    clip

                });


            return;
        }


        /* =================================================
           CLIPS D'UN JEU
        ================================================== */

        if (
            gameId
        ) {

            const result =
                await getGameClips(
                    gameId,
                    {
                        first,
                        period,
                        startedAt,
                        endedAt,
                        after,
                        before,
                        featured
                    }
                );


            response
                .status(200)
                .json({

                    success:
                        true,

                    ...result

                });


            return;
        }


        /* =================================================
           CLIPS DE LA CHAÎNE
        ================================================== */

        const result =
            await getChannelClips(
                channel,
                {
                    first,
                    period,
                    startedAt,
                    endedAt,
                    after,
                    before,
                    featured
                }
            );


        response
            .status(200)
            .json({

                success:
                    true,

                ...result

            });


    } catch (
        error
    ) {

        console.error(
            "[Clips API]",
            error
        );


        if (
            response.headersSent
        ) {

            return;
        }


        response
            .status(500)
            .json({
                success:
                    false,

                clips:
                    [],

                error:
                    error?.message ||
                    "Impossible de récupérer les clips Twitch."
            });
    }
}