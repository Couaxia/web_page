"use strict";

/* =========================================================
   API TWITCH — VIDÉOS
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

const TWITCH_VIDEOS_URL =
    "https://api.twitch.tv/helix/videos";

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
 * Nettoie et normalise le nom d'une chaîne Twitch.
 *
 * @param {unknown} channelLogin
 * @returns {string}
 */
function normalizeChannelLogin(
    channelLogin
) {

    const normalizedLogin =
        String(
            channelLogin ?? ""
        )
            .trim()
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
 * Retourne la chaîne Twitch configurée.
 *
 * @returns {string}
 */
function getDefaultChannel() {

    return getChannelLogin();
}


/**
 * Limite le nombre de vidéos entre 1 et 100.
 *
 * @param {number|string} value
 * @returns {number}
 */
function normalizeLimit(
    value
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

        return 5;
    }


    return Math.min(
        Math.max(
            parsedValue,
            1
        ),
        MAX_VIDEOS_PER_REQUEST
    );
}


/**
 * Vérifie et normalise le type de vidéo.
 *
 * @param {unknown} type
 * @returns {"all"|"upload"|"archive"|"highlight"}
 */
function normalizeVideoType(
    type
) {

    const normalizedType =
        String(
            type ?? "all"
        )
            .trim()
            .toLowerCase();


    return ALLOWED_VIDEO_TYPES.includes(
        normalizedType
    )
        ? normalizedType
        : "all";
}


/**
 * Vérifie et normalise le mode de tri.
 *
 * @param {unknown} sort
 * @returns {"time"|"trending"|"views"}
 */
function normalizeSort(
    sort
) {

    const normalizedSort =
        String(
            sort ?? "time"
        )
            .trim()
            .toLowerCase();


    return ALLOWED_SORT_VALUES.includes(
        normalizedSort
    )
        ? normalizedSort
        : "time";
}


/**
 * Vérifie et normalise la période.
 *
 * @param {unknown} period
 * @returns {"all"|"day"|"week"|"month"}
 */
function normalizePeriod(
    period
) {

    const normalizedPeriod =
        String(
            period ?? "all"
        )
            .trim()
            .toLowerCase();


    return ALLOWED_PERIOD_VALUES.includes(
        normalizedPeriod
    )
        ? normalizedPeriod
        : "all";
}


/**
 * Nettoie un curseur de pagination Twitch.
 *
 * @param {unknown} cursor
 * @returns {string|null}
 */
function normalizeCursor(
    cursor
) {

    const normalizedCursor =
        String(
            cursor ?? ""
        )
            .trim();


    return normalizedCursor ||
        null;
}


/* =========================================================
   REQUÊTES TWITCH
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
async function fetchTwitchVideosApi(
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
 * Analyse une réponse Twitch.
 *
 * @param {Response} response
 * @returns {Promise<object>}
 */
async function parseTwitchResponse(
    response
) {

    const responseBody =
        await response.text();


    let twitchData = {};


    if (
        responseBody
    ) {

        try {

            twitchData =
                JSON.parse(
                    responseBody
                );

        } catch {

            throw new Error(
                "Twitch a renvoyé une réponse vidéos illisible."
            );
        }
    }


    if (
        !response.ok
    ) {

        const twitchMessage =
            twitchData?.message ||
            responseBody ||
            "Erreur Twitch inconnue.";


        throw new Error(
            `Erreur Twitch Get Videos (${response.status}) : ${twitchMessage}`
        );
    }


    return twitchData;
}


/**
 * Appelle l'endpoint Twitch Get Videos.
 *
 * @param {object} options
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

    if (
        !userId
    ) {

        throw new Error(
            "L'identifiant numérique Twitch de la chaîne est absent."
        );
    }


    const videosUrl =
        new URL(
            TWITCH_VIDEOS_URL
        );


    videosUrl.searchParams.set(
        "user_id",
        userId
    );

    videosUrl.searchParams.set(
        "first",
        String(
            first
        )
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
     * Twitch n'autorise pas after et before
     * simultanément.
     */

    if (
        after
    ) {

        videosUrl.searchParams.set(
            "after",
            after
        );

    } else if (
        before
    ) {

        videosUrl.searchParams.set(
            "before",
            before
        );
    }


    const response =
        await fetchTwitchVideosApi(
            videosUrl
        );


    return parseTwitchResponse(
        response
    );
}


/* =========================================================
   FORMATAGE DES MINIATURES
========================================================= */

/**
 * Remplace les variables présentes
 * dans les miniatures Twitch.
 *
 * @param {unknown} thumbnailUrl
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
        typeof thumbnailUrl !==
            "string" ||
        !thumbnailUrl.trim()
    ) {

        return null;
    }


    return thumbnailUrl
        .trim()

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


/* =========================================================
   DURÉE
========================================================= */

/**
 * Convertit une durée Twitch comme :
 *
 * 3h12m40s
 *
 * en nombre de secondes.
 *
 * @param {unknown} duration
 * @returns {number}
 */
function durationToSeconds(
    duration
) {

    if (
        typeof duration !==
        "string"
    ) {

        return 0;
    }


    const normalizedDuration =
        duration.trim();


    if (
        !normalizedDuration
    ) {

        return 0;
    }


    const durationPattern =
        /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/;


    const match =
        normalizedDuration.match(
            durationPattern
        );


    if (
        !match
    ) {

        return 0;
    }


    const hours =
        Number(
            match[1]
        ) ||
        0;


    const minutes =
        Number(
            match[2]
        ) ||
        0;


    const seconds =
        Number(
            match[3]
        ) ||
        0;


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
function formatDuration(
    totalSeconds
) {

    const safeSeconds =
        Math.max(
            Math.floor(
                Number(
                    totalSeconds
                ) ||
                0
            ),
            0
        );


    const hours =
        Math.floor(
            safeSeconds /
            3600
        );


    const minutes =
        Math.floor(
            (
                safeSeconds %
                3600
            ) /
            60
        );


    const seconds =
        safeSeconds %
        60;


    if (
        hours >
        0
    ) {

        return (
            `${hours} h ` +
            `${String(minutes).padStart(
                2,
                "0"
            )} min`
        );
    }


    if (
        minutes >
        0
    ) {

        return (
            `${minutes} min ` +
            `${String(seconds).padStart(
                2,
                "0"
            )} s`
        );
    }


    return `${seconds} s`;
}


/* =========================================================
   FORMATAGE VIDÉO
========================================================= */

/**
 * Formate une vidéo Twitch.
 *
 * @param {object} video
 * @returns {object}
 */
function formatVideo(
    video
) {

    const durationSeconds =
        durationToSeconds(
            video?.duration
        );


    const viewCount =
        Number(
            video?.view_count
        ) ||
        0;


    return {

        id:
            video?.id ||
            null,

        streamId:
            video?.stream_id ||
            null,

        userId:
            video?.user_id ||
            null,

        userLogin:
            video?.user_login ||
            null,

        displayName:
            video?.user_name ||
            video?.user_login ||
            null,

        title:
            video?.title ||
            "Vidéo Twitch",

        description:
            video?.description ||
            "",

        createdAt:
            video?.created_at ||
            null,

        publishedAt:
            video?.published_at ||
            null,

        url:
            video?.url ||
            null,

        thumbnailUrl:
            formatThumbnailUrl(
                video?.thumbnail_url,
                640,
                360
            ),

        thumbnailLargeUrl:
            formatThumbnailUrl(
                video?.thumbnail_url,
                1280,
                720
            ),

        viewable:
            video?.viewable ||
            "public",

        viewCount,

        language:
            video?.language ||
            null,

        type:
            video?.type ||
            null,

        duration:
            video?.duration ||
            null,

        durationSeconds,

        formattedDuration:
            formatDuration(
                durationSeconds
            ),

        mutedSegments:
            Array.isArray(
                video?.muted_segments
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
        Array.isArray(
            twitchData?.data
        )
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
                Boolean(
                    cursor
                )

        }

    };
}


/* =========================================================
   FONCTIONS PUBLIQUES
========================================================= */

/**
 * Récupère les vidéos d'une chaîne Twitch.
 *
 * @param {string|null} channelLogin
 * @param {object} options
 * @returns {Promise<object>}
 */
export async function getChannelVideos(
    channelLogin = null,
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
            channelLogin ||
            getDefaultChannel()
        );


    const userId =
        await getTwitchUserId(
            normalizedLogin
        );


    const normalizedOptions = {

        first:
            normalizeLimit(
                first
            ),

        type:
            normalizeVideoType(
                type
            ),

        sort:
            normalizeSort(
                sort
            ),

        period:
            normalizePeriod(
                period
            ),

        after:
            normalizeCursor(
                after
            ),

        before:
            normalizeCursor(
                before
            )

    };


    /*
     * Sécurité supplémentaire :
     *
     * on ne conserve jamais les deux curseurs.
     */

    if (
        normalizedOptions.after
    ) {

        normalizedOptions.before =
            null;
    }


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
 * Récupère les dernières rediffusions.
 *
 * @param {string|null} channelLogin
 * @param {number} limit
 * @returns {Promise<object>}
 */
export async function getLatestArchives(
    channelLogin = null,
    limit = 5
) {

    return getChannelVideos(
        channelLogin ||
        getDefaultChannel(),
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
 * @param {string|null} channelLogin
 * @param {number} limit
 * @returns {Promise<object>}
 */
export async function getLatestHighlights(
    channelLogin = null,
    limit = 5
) {

    return getChannelVideos(
        channelLogin ||
        getDefaultChannel(),
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
 * Récupère les vidéos mises en ligne
 * manuellement.
 *
 * @param {string|null} channelLogin
 * @param {number} limit
 * @returns {Promise<object>}
 */
export async function getLatestUploads(
    channelLogin = null,
    limit = 5
) {

    return getChannelVideos(
        channelLogin ||
        getDefaultChannel(),
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
 * @param {string|null} channelLogin
 * @returns {Promise<object|null>}
 */
export async function getLatestVideo(
    channelLogin = null
) {

    const result =
        await getChannelVideos(
            channelLogin ||
            getDefaultChannel(),
            {
                first:
                    1,

                type:
                    "all",

                sort:
                    "time",

                period:
                    "all"
            }
        );


    return result.videos[0] ||
        null;
}


/* =========================================================
   API HTTP
========================================================= */

/**
 * Exemples :
 *
 * GET /api/videos
 *
 * GET /api/videos?first=20
 *
 * GET /api/videos?type=archive
 *
 * GET /api/videos?type=highlight
 *
 * GET /api/videos?sort=views
 *
 * GET /api/videos?period=month
 *
 * GET /api/videos?after=CURSEUR
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
            String(
                request.query?.channel ??
                ""
            )
                .trim()
                .toLowerCase() ||
            getDefaultChannel();


        const first =
            normalizeLimit(
                request.query?.first ??
                5
            );


        const type =
            normalizeVideoType(
                request.query?.type
            );


        const sort =
            normalizeSort(
                request.query?.sort
            );


        const period =
            normalizePeriod(
                request.query?.period
            );


        const after =
            normalizeCursor(
                request.query?.after
            );


        const before =
            after
                ? null
                : normalizeCursor(
                    request.query?.before
                );


        /* =================================================
           TWITCH
        ================================================== */

        const result =
            await getChannelVideos(
                channel,
                {
                    first,
                    type,
                    sort,
                    period,
                    after,
                    before
                }
            );


        /* =================================================
           RÉPONSE
        ================================================== */

        response
            .status(200)
            .json({

                success:
                    true,

                fetchedAt:
                    new Date()
                        .toISOString(),

                ...result

            });


    } catch (
        error
    ) {

        console.error(
            "[Videos API]",
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

                videos:
                    [],

                error:
                    error?.message ||
                    "Impossible de récupérer les vidéos Twitch."

            });
    }
}