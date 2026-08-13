"use strict";

/* =========================================================
   API TWITCH — STATUT GLOBAL
   COUAXIA
========================================================= */

import {
    getChannelLogin
} from "./auth.js";

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

const VIDEOS_LIMIT =
    20;

const CLIPS_LIMIT =
    100;


/* =========================================================
   OUTILS
========================================================= */

/**
 * Retourne un message d'erreur lisible.
 *
 * @param {unknown} error
 * @returns {string}
 */
function getErrorMessage(
    error
) {

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


/**
 * Exécute une requête sans faire échouer
 * toute l'API si cette ressource précise échoue.
 *
 * @param {Promise} promise
 * @param {*} fallback
 * @param {string} serviceName
 * @returns {Promise<*>}
 */
async function safeRequest(
    promise,
    fallback,
    serviceName
) {

    try {

        return await promise;

    } catch (
        error
    ) {

        console.error(
            `[Twitch Status] Erreur ${serviceName} :`,
            getErrorMessage(
                error
            )
        );


        return fallback;
    }
}


/**
 * Normalise le compteur de followers.
 *
 * @param {unknown} result
 * @returns {number}
 */
function normalizeFollowerCount(
    result
) {

    if (
        typeof result ===
        "number"
    ) {

        return Number.isFinite(
            result
        )
            ? result
            : 0;
    }


    if (
        result &&
        typeof result ===
        "object"
    ) {

        const total =
            Number(
                result.total ??
                result.followers ??
                result.followersTotal ??
                0
            );


        return Number.isFinite(
            total
        )
            ? total
            : 0;
    }


    return 0;
}


/* =========================================================
   RÉSULTATS DE SECOURS
========================================================= */

/**
 * Résultat utilisé si la récupération
 * des vidéos échoue.
 *
 * @param {string} channel
 * @returns {object}
 */
function createEmptyVideosResult(
    channel
) {

    return {

        channel,

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


/**
 * Résultat utilisé si la récupération
 * des clips échoue.
 *
 * @param {string} channel
 * @returns {object}
 */
function createEmptyClipsResult(
    channel
) {

    return {

        channel,

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


/* =========================================================
   API HTTP
========================================================= */

/**
 * Route :
 *
 * GET /api/twitch-status
 *
 * Cette route regroupe :
 *
 * - statut du live
 * - profil Twitch
 * - followers
 * - vidéos
 * - clips
 * - jeu actuellement streamé
 */
export default async function handler(
    request,
    response
) {

    /* =====================================================
       CACHE
    ====================================================== */

    /*
     * Le statut Twitch peut changer rapidement.
     *
     * On évite donc de conserver une ancienne réponse.
     */

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


    /* =====================================================
       CHAÎNE TWITCH
    ====================================================== */

    let channel;


    try {

        channel =
            getChannelLogin();

    } catch (
        error
    ) {

        console.error(
            "[Twitch Status] Configuration :",
            error
        );


        response
            .status(500)
            .json({

                success:
                    false,

                error:
                    "La chaîne Twitch n'est pas configurée.",

                details:
                    getErrorMessage(
                        error
                    )

            });


        return;
    }


    try {

        /* =================================================
           LIVE + UTILISATEUR
        ================================================== */

        const [
            streamStatus,
            twitchUser
        ] =
            await Promise.all([

                getStreamStatus(
                    channel
                ),

                getTwitchUser(
                    channel
                )

            ]);


        /* =================================================
           UTILISATEUR INTROUVABLE
        ================================================== */

        if (
            !twitchUser ||
            twitchUser.found ===
                false
        ) {

            response
                .status(404)
                .json({

                    success:
                        false,

                    channel,

                    error:
                        `La chaîne Twitch "${channel}" est introuvable.`

                });


            return;
        }


        /* =================================================
           FOLLOWERS + VIDÉOS + CLIPS
        ================================================== */

        const [
            followerResult,
            videosResult,
            clipsResult
        ] =
            await Promise.all([

                safeRequest(
                    getFollowerCount(
                        channel
                    ),
                    0,
                    "followers"
                ),

                safeRequest(
                    getChannelVideos(
                        channel,
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
                    createEmptyVideosResult(
                        channel
                    ),
                    "vidéos"
                ),

                safeRequest(
                    getAllChannelClips(
                        channel,
                        {
                            maxClips:
                                CLIPS_LIMIT
                        }
                    ),
                    createEmptyClipsResult(
                        channel
                    ),
                    "clips"
                )

            ]);


        /* =================================================
           JEU ACTUEL
        ================================================== */

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


        /* =================================================
           FOLLOWERS
        ================================================== */

        const followers =
            normalizeFollowerCount(
                followerResult
            );


        /* =================================================
           VIDÉOS
        ================================================== */

        const videos =
            Array.isArray(
                videosResult?.videos
            )

                ? videosResult.videos

                : [];


        /* =================================================
           CLIPS
        ================================================== */

        const clips =
            Array.isArray(
                clipsResult?.clips
            )

                ? clipsResult.clips

                : [];


        /* =================================================
           RÉPONSE
        ================================================== */

        response
            .status(200)
            .json({

                success:
                    true,

                channel,

                fetchedAt:
                    new Date()
                        .toISOString(),

                /* =========================================
                   LIVE
                ========================================= */

                live:
                    Boolean(
                        streamStatus?.live
                    ),

                stream:
                    streamStatus,

                /* =========================================
                   PROFIL
                ========================================= */

                user:
                    twitchUser,

                /* =========================================
                   JEU
                ========================================= */

                game,

                /* =========================================
                   FOLLOWERS
                ========================================= */

                /*
                 * Nom utilisé par ton JavaScript public.
                 */

                followers,

                /*
                 * Conservé pour compatibilité avec
                 * les anciennes parties du site.
                 */

                followerCount:
                    followers,

                /* =========================================
                   VIDÉOS
                ========================================= */

                videos,

                /* =========================================
                   CLIPS
                ========================================= */

                clips,

                /* =========================================
                   DONNÉES COMPLÈTES
                ========================================= */

                resources: {

                    followers:
                        followerResult,

                    videos:
                        videosResult,

                    clips:
                        clipsResult

                }

            });


    } catch (
        error
    ) {

        const errorMessage =
            getErrorMessage(
                error
            );


        console.error(
            "[Twitch Status] Erreur :",
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

                channel,

                error:
                    "Impossible de récupérer les informations Twitch.",

                details:
                    errorMessage

            });
    }
}