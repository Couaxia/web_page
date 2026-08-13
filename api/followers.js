"use strict";

/* =========================================================
   API TWITCH — FOLLOWERS
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

const TWITCH_FOLLOWERS_URL =
    "https://api.twitch.tv/helix/channels/followers";

const MAX_FOLLOWERS_PER_REQUEST =
    100;


/* =========================================================
   OUTILS
========================================================= */

/**
 * Transforme une valeur en texte propre.
 *
 * @param {unknown} value
 * @returns {string}
 */
function normalizeText(
    value
) {

    return String(
        value ?? ""
    ).trim();
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
 * Normalise le login Twitch.
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
 * Limite le nombre de résultats entre 1 et 100.
 *
 * @param {unknown} value
 * @param {number} defaultValue
 * @returns {number}
 */
function normalizeLimit(
    value,
    defaultValue = 20
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
        MAX_FOLLOWERS_PER_REQUEST
    );
}


/**
 * Nettoie un curseur Twitch.
 *
 * @param {unknown} value
 * @returns {string|null}
 */
function normalizeCursor(
    value
) {

    const cursor =
        normalizeText(
            value
        );


    return (
        cursor ||
        null
    );
}


/* =========================================================
   RÉPONSE TWITCH
========================================================= */

/**
 * Lit proprement une réponse Twitch.
 *
 * @param {Response} response
 * @returns {Promise<object>}
 */
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

/**
 * Effectue une requête Twitch.
 *
 * En cas de 401, le token application est renouvelé
 * puis la requête est tentée une seule fois.
 *
 * @param {URL} url
 * @returns {Promise<Response>}
 */
async function fetchTwitchFollowersApi(
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
 * Appelle l'endpoint Twitch
 * Get Channel Followers.
 *
 * @param {object} options
 * @param {string} options.broadcasterId
 * @param {number} options.first
 * @param {string|null} options.after
 * @param {string|null} options.userId
 * @returns {Promise<object>}
 */
async function requestFollowersFromTwitch({
    broadcasterId,
    first = 1,
    after = null,
    userId = null
}) {

    const normalizedBroadcasterId =
        normalizeText(
            broadcasterId
        );


    if (
        !normalizedBroadcasterId
    ) {

        throw new Error(
            "L'identifiant numérique du diffuseur Twitch est absent."
        );
    }


    const followersUrl =
        new URL(
            TWITCH_FOLLOWERS_URL
        );


    followersUrl.searchParams.set(
        "broadcaster_id",
        normalizedBroadcasterId
    );


    followersUrl.searchParams.set(
        "first",
        String(
            normalizeLimit(
                first
            )
        )
    );


    const normalizedAfter =
        normalizeCursor(
            after
        );


    if (
        normalizedAfter
    ) {

        followersUrl.searchParams.set(
            "after",
            normalizedAfter
        );
    }


    const normalizedUserId =
        normalizeText(
            userId
        );


    if (
        normalizedUserId
    ) {

        followersUrl.searchParams.set(
            "user_id",
            normalizedUserId
        );
    }


    const response =
        await fetchTwitchFollowersApi(
            followersUrl
        );


    const twitchData =
        await readTwitchResponse(
            response
        );


    if (
        !response.ok
    ) {

        throw new Error(
            `Erreur Twitch Get Channel Followers (${response.status}) : ${
                twitchData?.message ||
                twitchData?.error ||
                "Erreur Twitch inconnue."
            }`
        );
    }


    return twitchData;
}


/* =========================================================
   FORMATAGE
========================================================= */

/**
 * Formate un follower Twitch.
 *
 * @param {object} follower
 * @returns {object}
 */
function formatFollower(
    follower
) {

    return {

        userId:
            follower?.user_id ||
            null,

        login:
            follower?.user_login ||
            null,

        displayName:
            follower?.user_name ||
            follower?.user_login ||
            null,

        followedAt:
            follower?.followed_at ||
            null

    };
}


/**
 * Formate la réponse Twitch.
 *
 * @param {object} twitchData
 * @param {string} channelLogin
 * @param {string} broadcasterId
 * @returns {object}
 */
function formatFollowersResult(
    twitchData,
    channelLogin,
    broadcasterId
) {

    const followers =
        Array.isArray(
            twitchData?.data
        )
            ? twitchData.data.map(
                formatFollower
            )
            : [];


    const parsedTotal =
        Number(
            twitchData?.total
        );


    const total =
        Number.isFinite(
            parsedTotal
        )
            ? parsedTotal
            : 0;


    const cursor =
        twitchData
            ?.pagination
            ?.cursor ||
        null;


    return {

        channel:
            channelLogin,

        broadcasterId,

        total,

        followers,

        returned:
            followers.length,

        pagination: {

            cursor,

            hasNextPage:
                Boolean(
                    cursor
                )

        },

        /*
         * Avec un App Access Token,
         * Twitch peut donner le total mais
         * pas nécessairement les détails.
         */

        detailsAvailable:
            followers.length >
            0,

        requiresUserAuthorization:
            followers.length ===
                0 &&
            total >
                0

    };
}


/* =========================================================
   FOLLOWERS D'UNE CHAÎNE
========================================================= */

/**
 * Récupère le nombre de followers et,
 * si l'autorisation Twitch le permet,
 * leur liste détaillée.
 *
 * @param {string|null} channelLogin
 * @param {object} options
 * @param {number} options.first
 * @param {string|null} options.after
 * @returns {Promise<object>}
 */
export async function getChannelFollowers(
    channelLogin = null,
    {
        first = 20,
        after = null
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


    const twitchData =
        await requestFollowersFromTwitch({
            broadcasterId,

            first:
                normalizeLimit(
                    first
                ),

            after
        });


    return formatFollowersResult(
        twitchData,
        normalizedLogin,
        broadcasterId
    );
}


/* =========================================================
   COMPTEUR DE FOLLOWERS
========================================================= */

/**
 * Retourne uniquement le nombre total de followers.
 *
 * @param {string|null} channelLogin
 * @returns {Promise<number>}
 */
export async function getFollowerCount(
    channelLogin = null
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


    const twitchData =
        await requestFollowersFromTwitch({
            broadcasterId,
            first:
                1
        });


    const total =
        Number(
            twitchData?.total
        );


    return Number.isFinite(
        total
    )
        ? total
        : 0;
}


/* =========================================================
   VÉRIFIER UN FOLLOWER
========================================================= */

/**
 * Vérifie si un utilisateur suit une chaîne.
 *
 * ATTENTION :
 *
 * Pour obtenir ce détail, Twitch exige un User Access Token
 * avec le scope :
 *
 * moderator:read:followers
 *
 * Le token doit appartenir au broadcaster
 * ou à un modérateur du broadcaster.
 *
 * @param {string|null} channelLogin
 * @param {string} followerUserId
 * @returns {Promise<object>}
 */
export async function checkUserFollowsChannel(
    channelLogin = null,
    followerUserId
) {

    const normalizedLogin =
        normalizeChannelLogin(
            channelLogin ||
            getDefaultChannel()
        );


    const normalizedUserId =
        normalizeText(
            followerUserId
        );


    if (
        !normalizedUserId
    ) {

        throw new Error(
            "L'identifiant Twitch du follower est vide."
        );
    }


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


    const twitchData =
        await requestFollowersFromTwitch({
            broadcasterId,
            first:
                1,
            userId:
                normalizedUserId
        });


    const follower =
        twitchData
            ?.data
            ?.[0] ||
        null;


    return {

        follows:
            Boolean(
                follower
            ),

        channel:
            normalizedLogin,

        broadcasterId,

        userId:
            normalizedUserId,

        follower:
            follower
                ? formatFollower(
                    follower
                )
                : null

    };
}


/* =========================================================
   API HTTP PUBLIQUE
========================================================= */

/**
 * Exemples :
 *
 * GET /api/followers
 *
 * GET /api/followers?first=20
 *
 * GET /api/followers?channel=couaxia
 *
 * GET /api/followers?countOnly=true
 *
 * GET /api/followers?userId=123456
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


        const first =
            normalizeLimit(
                request.query?.first,
                20
            );


        const after =
            normalizeCursor(
                request.query?.after
            );


        const userId =
            normalizeText(
                request.query?.userId ??
                request.query?.user_id
            );


        const countOnly =
            [
                "true",
                "1",
                "yes",
                "oui"
            ].includes(
                normalizeText(
                    request.query?.countOnly ??
                    request.query?.count_only
                )
                    .toLowerCase()
            );


        /* =================================================
           COMPTEUR UNIQUEMENT
        ================================================== */

        if (
            countOnly
        ) {

            const total =
                await getFollowerCount(
                    channel
                );


            response
                .status(200)
                .json({

                    success:
                        true,

                    channel,

                    total

                });


            return;
        }


        /* =================================================
           UTILISATEUR PRÉCIS
        ================================================== */

        if (
            userId
        ) {

            const result =
                await checkUserFollowsChannel(
                    channel,
                    userId
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
           FOLLOWERS
        ================================================== */

        const result =
            await getChannelFollowers(
                channel,
                {
                    first,
                    after
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
            "[Followers API]",
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

                followers:
                    [],

                error:
                    error?.message ||
                    "Impossible de récupérer les followers Twitch."
            });
    }
}