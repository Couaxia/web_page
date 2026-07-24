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

const TWITCH_FOLLOWERS_URL =
    "https://api.twitch.tv/helix/channels/followers";

const DEFAULT_CHANNEL =
    "couaxia";

const MAX_FOLLOWERS_PER_REQUEST =
    100;


/* =========================================================
   OUTILS
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
 * Limite le nombre de résultats entre 1 et 100.
 *
 * @param {number} value
 * @returns {number}
 */
function normalizeLimit(value) {
    const parsedValue =
        Number.parseInt(value, 10);

    if (!Number.isFinite(parsedValue)) {
        return 20;
    }

    return Math.min(
        Math.max(parsedValue, 1),
        MAX_FOLLOWERS_PER_REQUEST
    );
}


/**
 * Effectue une requête vers Twitch.
 *
 * Si le token est refusé, un nouveau token est créé
 * puis la requête est tentée une seconde fois.
 *
 * @param {URL} url
 * @returns {Promise<Response>}
 */
async function fetchTwitchFollowersApi(url) {
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


/* =========================================================
   REQUÊTE TWITCH
========================================================= */

/**
 * Appelle l'endpoint Get Channel Followers.
 *
 * @param {object} options
 * @param {string} options.broadcasterId
 * @param {number} options.first
 * @param {string | null} options.after
 * @param {string | null} options.userId
 * @returns {Promise<object>}
 */
async function requestFollowersFromTwitch({
    broadcasterId,
    first,
    after = null,
    userId = null
}) {
    const followersUrl =
        new URL(TWITCH_FOLLOWERS_URL);

    followersUrl.searchParams.set(
        "broadcaster_id",
        broadcasterId
    );

    followersUrl.searchParams.set(
        "first",
        String(first)
    );

    if (after) {
        followersUrl.searchParams.set(
            "after",
            after
        );
    }

    if (userId) {
        followersUrl.searchParams.set(
            "user_id",
            userId
        );
    }

    const response =
        await fetchTwitchFollowersApi(
            followersUrl
        );

    if (!response.ok) {
        const errorBody =
            await response.text();

        throw new Error(
            `Erreur Twitch Get Channel Followers ` +
            `(${response.status}) : ${errorBody}`
        );
    }

    return response.json();
}


/* =========================================================
   FORMATAGE
========================================================= */

/**
 * Formate un follower Twitch.
 *
 * Ces informations ne sont disponibles que lorsque
 * le token possède les autorisations nécessaires.
 *
 * @param {object} follower
 * @returns {object}
 */
function formatFollower(follower) {
    return {
        userId:
            follower.user_id ||
            null,

        login:
            follower.user_login ||
            null,

        displayName:
            follower.user_name ||
            follower.user_login ||
            null,

        followedAt:
            follower.followed_at ||
            null
    };
}


/**
 * Formate la réponse complète.
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
        Array.isArray(twitchData?.data)
            ? twitchData.data.map(
                formatFollower
            )
            : [];

    const total =
        Number(twitchData?.total) || 0;

    const cursor =
        twitchData?.pagination?.cursor ||
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
                Boolean(cursor)
        },

        /*
         * Avec un App Access Token, Twitch peut ne renvoyer
         * que le total et laisser la liste vide.
         */
        detailsAvailable:
            followers.length > 0,

        requiresUserAuthorization:
            followers.length === 0 &&
            total > 0
    };
}


/* =========================================================
   FONCTIONS PUBLIQUES
========================================================= */

/**
 * Récupère le total et, lorsque le token l'autorise,
 * les derniers followers d'une chaîne.
 *
 * @param {string} channelLogin
 * @param {object} options
 * @param {number} options.first
 * @param {string | null} options.after
 * @returns {Promise<object>}
 */
export async function getChannelFollowers(
    channelLogin = DEFAULT_CHANNEL,
    {
        first = 20,
        after = null
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

    const normalizedFirst =
        normalizeLimit(first);

    const twitchData =
        await requestFollowersFromTwitch({
            broadcasterId,
            first: normalizedFirst,
            after
        });

    return formatFollowersResult(
        twitchData,
        normalizedLogin,
        broadcasterId
    );
}


/**
 * Récupère uniquement le nombre total de followers.
 *
 * C'est la fonction recommandée pour afficher le compteur
 * sur la page d'accueil.
 *
 * @param {string} channelLogin
 * @returns {Promise<number>}
 */
export async function getFollowerCount(
    channelLogin = DEFAULT_CHANNEL
) {
    const result =
        await getChannelFollowers(
            channelLogin,
            {
                first: 1
            }
        );

    return result.total;
}


/**
 * Vérifie si un utilisateur suit une chaîne.
 *
 * Cette fonction nécessite normalement un User Access Token
 * avec le scope moderator:read:followers.
 *
 * @param {string} channelLogin
 * @param {string} followerUserId
 * @returns {Promise<object>}
 */
export async function checkUserFollowsChannel(
    channelLogin = DEFAULT_CHANNEL,
    followerUserId
) {
    const normalizedLogin =
        normalizeChannelLogin(
            channelLogin
        );

    const normalizedUserId =
        String(followerUserId ?? "")
            .trim();

    if (!normalizedUserId) {
        throw new Error(
            "L'identifiant Twitch du follower est vide."
        );
    }

    const broadcasterId =
        await getTwitchUserId(
            normalizedLogin
        );

    const twitchData =
        await requestFollowersFromTwitch({
            broadcasterId,
            first: 1,
            userId: normalizedUserId
        });

    const follower =
        twitchData?.data?.[0];

    return {
        follows:
            Boolean(follower),

        channel:
            normalizedLogin,

        broadcasterId,

        userId:
            normalizedUserId,

        follower:
            follower
                ? formatFollower(follower)
                : null
    };
}