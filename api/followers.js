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

export async function checkUserFollowsChannel() {}
export async function getChannelFollowers() {}
async function getFollowerCount(channelLogin) {
    // ton code
}

export {
    getFollowerCount
};
/* =========================================================
   CONFIGURATION
========================================================= */

const TWITCH_FOLLOWERS_URL =
    "https://api.twitch.tv/helix/channels/followers";

const DEFAULT_CHANNEL =
    process.env.TWITCH_CHANNEL_LOGIN?.trim().toLowerCase() ||
    "couaxia";

const MAX_FOLLOWERS_PER_REQUEST = 100;


/* =========================================================
   OUTILS
========================================================= */

/**
 * Nettoie et normalise le nom de la chaîne Twitch.
 *
 * @param {string} channelLogin
 * @returns {string}
 */
function normalizeChannelLogin(channelLogin) {
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
 * Exécute une requête Twitch et renouvelle le token
 * une seule fois si Twitch répond avec une erreur 401.
 *
 * @param {URL} url
 * @returns {Promise<Response>}
 */
async function fetchTwitchFollowersApi(url) {
    let response =
        await fetch(
            url.toString(),
            {
                method: "GET",
                headers:
                    await getTwitchApiHeaders(),
                cache: "no-store"
            }
        );

    if (response.status === 401) {
        clearTwitchAccessToken();

        response =
            await fetch(
                url.toString(),
                {
                    method: "GET",
                    headers:
                        await getTwitchApiHeaders({
                            forceRefresh: true
                        }),
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
    if (!broadcasterId) {
        throw new Error(
            "L'identifiant numérique du diffuseur Twitch est absent."
        );
    }

    const followersUrl =
        new URL(TWITCH_FOLLOWERS_URL);

    followersUrl.searchParams.set(
        "broadcaster_id",
        broadcasterId
    );

    followersUrl.searchParams.set(
        "first",
        String(normalizeLimit(first))
    );

    if (after) {
        followersUrl.searchParams.set(
            "after",
            String(after)
        );
    }

    if (userId) {
        followersUrl.searchParams.set(
            "user_id",
            String(userId)
        );
    }

    const response =
        await fetchTwitchFollowersApi(
            followersUrl
        );

    const responseBody =
        await response.text();

    let twitchData = {};

    if (responseBody) {
        try {
            twitchData =
                JSON.parse(responseBody);
        } catch {
            throw new Error(
                "Twitch a renvoyé une réponse illisible."
            );
        }
    }

    if (!response.ok) {
        const twitchMessage =
            twitchData?.message ||
            responseBody ||
            "Erreur Twitch inconnue.";

        throw new Error(
            `Erreur Twitch Get Channel Followers ` +
            `(${response.status}) : ${twitchMessage}`
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
function formatFollower(follower) {
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
 * Formate la réponse complète de Twitch.
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

    const parsedTotal =
        Number(twitchData?.total);

    const total =
        Number.isFinite(parsedTotal)
            ? parsedTotal
            : 0;

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
 * Récupère le total des followers et, lorsque le token
 * l'autorise, la liste détaillée des followers.
 *
 * @param {string} channelLogin
 * @param {object} options
 * @param {number} options.first
 * @param {string|null} options.after
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

    const twitchData =
        await requestFollowersFromTwitch({
            broadcasterId,
            first,
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
 * @param {string} channelLogin
 * @returns {Promise<number>}
 */
export async function getFollowerCount(
    channelLogin = DEFAULT_CHANNEL
) {
    const normalizedLogin =
        normalizeChannelLogin(
            channelLogin
        );

    const broadcasterId =
        await getTwitchUserId(
            normalizedLogin
        );

    const twitchData =
        await requestFollowersFromTwitch({
            broadcasterId,
            first: 1
        });

    const total =
        Number(twitchData?.total);

    return Number.isFinite(total)
        ? total
        : 0;
}


/**
 * Vérifie si un utilisateur précis suit la chaîne.
 *
 * Cette fonction nécessite un User Access Token ayant
 * le scope moderator:read:followers.
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
        twitchData?.data?.[0] ||
        null;

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
export {
    getFollowerCount
};