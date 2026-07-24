"use strict";

/* =========================================================
   IMPORTS
========================================================= */

import {
    getChannelClips,
    getChannelVideos,
    getFollowerCount,
    getGame,
    getStreamStatus,
    getTwitchUser
} from "./index.js";


/* =========================================================
   CONFIGURATION
========================================================= */

const TWITCH_CHANNEL =
    "couaxia";

const VIDEOS_LIMIT =
    3;

const CLIPS_LIMIT =
    3;


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

/**
 * Transforme une erreur en message lisible.
 *
 * @param {unknown} error
 * @returns {string}
 */
function getErrorMessage(error) {
    if (
        error instanceof Error &&
        error.message
    ) {
        return error.message;
    }

    return String(
        error || "Erreur inconnue."
    );
}


/**
 * Exécute une promesse sans bloquer toute l'API
 * lorsqu'une donnée secondaire échoue.
 *
 * @param {Promise<any>} promise
 * @param {any} fallback
 * @param {string} serviceName
 * @returns {Promise<any>}
 */
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


/**
 * Crée la structure par défaut des vidéos.
 *
 * @returns {object}
 */
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


/**
 * Crée la structure par défaut des clips.
 *
 * @returns {object}
 */
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


/* =========================================================
   ROUTE API
========================================================= */

/**
 * Route :
 *
 * GET /api/twitch/twitch-status
 *
 * @param {import("@vercel/node").VercelRequest} request
 * @param {import("@vercel/node").VercelResponse} response
 * @returns {Promise<void>}
 */
export default async function handler(
    request,
    response
) {
    setCorsHeaders(response);

    /*
     * Réponse aux vérifications CORS du navigateur.
     */
    if (request.method === "OPTIONS") {
        response
            .status(204)
            .end();

        return;
    }

    /*
     * Cette route accepte uniquement GET.
     */
    if (request.method !== "GET") {
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
        /*
         * Le stream et l'utilisateur sont les deux données
         * principales de cette route.
         */
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
            twitchUser &&
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

        /*
         * Données secondaires.
         *
         * Une erreur sur les followers, vidéos ou clips
         * ne doit pas empêcher l'affichage du statut du live.
         */
        const [
            followerCount,
            videosResult,
            clipsResult
        ] = await Promise.all([
            safeRequest(
                getFollowerCount(
                    TWITCH_CHANNEL
                ),
                null,
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
                getChannelClips(
                    TWITCH_CHANNEL,
                    {
                        first:
                            CLIPS_LIMIT,

                        period:
                            "month"
                    }
                ),
                createEmptyClipsResult(),
                "clips"
            )
        ]);

        /*
         * Le jeu n'est recherché que lorsque Twitch
         * renvoie un identifiant de catégorie.
         */
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

        setCacheHeaders(response);

        response
            .status(200)
            .json({
                success:
                    true,

                channel:
                    TWITCH_CHANNEL,

                fetchedAt:
                    new Date().toISOString(),

                /*
                 * Informations du live.
                 */
                live:
                    Boolean(
                        streamStatus?.live
                    ),

                stream:
                    streamStatus,

                /*
                 * Profil de la chaîne.
                 */
                user:
                    twitchUser,

                /*
                 * Catégorie actuellement diffusée.
                 */
                game,

                /*
                 * Le compteur peut être null lorsque Twitch
                 * refuse l'accès aux followers.
                 */
                followerCount,

                /*
                 * Listes simplifiées pour le front-end.
                 */
                videos:
                    videosResult?.videos ||
                    [],

                clips:
                    clipsResult?.clips ||
                    [],

                /*
                 * Informations complètes, notamment
                 * la pagination.
                 */
                resources: {
                    videos:
                        videosResult,

                    clips:
                        clipsResult
                }
            });
    } catch (error) {
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

                details:
                    process.env.NODE_ENV ===
                    "development"
                        ? getErrorMessage(error)
                        : undefined
            });
    }
}