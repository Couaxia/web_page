"use strict";

/* =========================================================
   IMPORTS
========================================================= */

import {
    getAllChannelClips
} from "./clips.js";

import {
    getChannelVideos
} from "./videos.js";

import {
    getFollowerCount
} from "./followers.js";

import {
    getGame
} from "./game.js";

import {
    getStreamStatus
} from "./stream.js";

import {
    getTwitchUser
} from "./user.js";

/* =========================================================
   CONFIGURATION
========================================================= */

const TWITCH_CHANNEL =
    process.env.TWITCH_CHANNEL_LOGIN ||
    "couaxia";

const VIDEOS_LIMIT = 20;

const CLIPS_LIMIT = 100;


/* =========================================================
   CORS
========================================================= */

function setCorsHeaders(response) {
    response.setHeader(
        "Access-Control-Allow-Origin",
        "*"
    );

    response.setHeader(
        "Access-Control-Allow-Methods",
        "GET, OPTIONS"
    );

    response.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    );
}


/* =========================================================
   CACHE
========================================================= */

function setCacheHeaders(response) {
    response.setHeader(
        "Cache-Control",
        [
            "public",
            "s-maxage=30",
            "stale-while-revalidate=60"
        ].join(", ")
    );
}


/* =========================================================
   OUTILS
========================================================= */

function getErrorMessage(error) {
    if (
        error instanceof Error &&
        error.message
    ) {
        return error.message;
    }

    return String(
        error ||
        "Erreur inconnue."
    );
}


async function safeRequest(
    promise,
    fallback,
    serviceName
) {
    try {
        return await promise;
    } catch (error) {
        console.error(
            `[Twitch API] Erreur ${serviceName} :`,
            getErrorMessage(error)
        );

        return fallback;
    }
}


function createEmptyVideosResult() {
    return {
        channel:
            TWITCH_CHANNEL,

        userId:
            null,

        videos:
            [],

        returned:
            0,

        filters: {
            type:
                "all",

            sort:
                "time",

            period:
                "all",

            first:
                VIDEOS_LIMIT
        },

        pagination: {
            cursor:
                null,

            hasNextPage:
                false
        }
    };
}


function createEmptyClipsResult() {
    return {
        channel:
            TWITCH_CHANNEL,

        broadcasterId:
            null,

        clips:
            [],

        returned:
            0,

        pagination: {
            cursor:
                null,

            hasNextPage:
                false
        }
    };
}


/**
 * Normalise le résultat du compteur de followers.
 *
 * @param {unknown} result
 * @returns {number}
 */
function normalizeFollowerCount(result) {
    if (
        typeof result === "number"
    ) {
        return Number.isFinite(result)
            ? result
            : 0;
    }

    if (
        result &&
        typeof result === "object"
    ) {
        const total =
            Number(
                result.total ??
                result.followers ??
                result.followersTotal ??
                0
            );

        return Number.isFinite(total)
            ? total
            : 0;
    }

    return 0;
}


/* =========================================================
   ROUTE API
========================================================= */

/**
 * Route :
 *
 * GET /api/twitch-status
 */
export default async function handler(
    request,
    response
) {
    setCorsHeaders(response);

    if (
        request.method === "OPTIONS"
    ) {
        response
            .status(204)
            .end();

        return;
    }

    if (
        request.method !== "GET"
    ) {
        response.setHeader(
            "Allow",
            "GET, OPTIONS"
        );

        response
            .status(405)
            .json({
                success:
                    false,

                error:
                    "Méthode non autorisée.",

                allowedMethods: [
                    "GET",
                    "OPTIONS"
                ]
            });

        return;
    }

    try {
        const [
            streamStatus,
            twitchUser
        ] = await Promise.all([
            getStreamStatus(
                TWITCH_CHANNEL
            ),

            getTwitchUser(
                TWITCH_CHANNEL
            )
        ]);

        if (
            !twitchUser ||
            twitchUser.found === false
        ) {
            response
                .status(404)
                .json({
                    success:
                        false,

                    error:
                        `La chaîne Twitch "${TWITCH_CHANNEL}" est introuvable.`
                });

            return;
        }

        const [
            followerResult,
            videosResult,
            clipsResult
        ] = await Promise.all([
            safeRequest(
                getFollowerCount(
                    TWITCH_CHANNEL
                ),
                0,
                "followers"
            ),

            safeRequest(
                getChannelVideos(
                    TWITCH_CHANNEL,
                    {
                        first:
                            VIDEOS_LIMIT,

                        type:
                            "all",

                        sort:
                            "time",

                        period:
                            "all"
                    }
                ),
                createEmptyVideosResult(),
                "vidéos"
            ),

            safeRequest(
                getAllChannelClips(
                    TWITCH_CHANNEL,
                    {
                        maxClips:
                            CLIPS_LIMIT
                    }
                ),
                createEmptyClipsResult(),
                "clips"
            )
        ]);

        const game =
            streamStatus?.gameId
                ? await safeRequest(
                    getGame(
                        streamStatus.gameId
                    ),
                    null,
                    "jeu"
                )
                : null;

        const followers =
            normalizeFollowerCount(
                followerResult
            );

        const videos =
            Array.isArray(
                videosResult?.videos
            )
                ? videosResult.videos
                : [];

        const clips =
            Array.isArray(
                clipsResult?.clips
            )
                ? clipsResult.clips
                : [];

        setCacheHeaders(
            response
        );

        response
            .status(200)
            .json({
                success:
                    true,

                channel:
                    TWITCH_CHANNEL,

                fetchedAt:
                    new Date()
                        .toISOString(),

                live:
                    Boolean(
                        streamStatus?.live
                    ),

                stream:
                    streamStatus,

                user:
                    twitchUser,

                game,

                /*
                 * Nom attendu par twitch-live.js.
                 */
                followers,

                /*
                 * Nom conservé pour compatibilité.
                 */
                followerCount:
                    followers,

                videos,

                clips,

                resources: {
                    followers:
                        followerResult,

                    videos:
                        videosResult,

                    clips:
                        clipsResult
                }
            });
    } catch (error) {
        const errorMessage =
            getErrorMessage(
                error
            );

        console.error(
            "[Twitch API] Erreur twitch-status :",
            error
        );

        response
            .status(500)
            .json({
                success:
                    false,

                channel:
                    TWITCH_CHANNEL,

                error:
                    "Impossible de récupérer les informations Twitch.",

                /*
                 * À garder temporairement pour connaître
                 * l’erreur exacte sur le navigateur.
                 */
                details:
                    errorMessage
            });
    }
}