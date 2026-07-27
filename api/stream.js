"use strict";

/* =========================================================
   IMPORTS
========================================================= */

import {
    clearTwitchAccessToken,
    getTwitchApiHeaders
} from "./auth.js";


/* =========================================================
   CONFIGURATION
========================================================= */

const TWITCH_STREAMS_URL =
    "https://api.twitch.tv/helix/streams";

const DEFAULT_CHANNEL =
    "couaxia";


/* =========================================================
   APPEL À TWITCH
========================================================= */

/**
 * Appelle Twitch Helix pour récupérer un live.
 *
 * @param {string} channelLogin
 * @returns {Promise<object>}
 */
async function requestStreamFromTwitch(
    channelLogin
) {
    const streamUrl =
        new URL(TWITCH_STREAMS_URL);

    streamUrl.searchParams.set(
        "user_login",
        channelLogin
    );

    let headers =
        await getTwitchApiHeaders();

    let response =
        await fetch(
            streamUrl.toString(),
            {
                method: "GET",
                headers,
                cache: "no-store"
            }
        );

    /*
     * Si Twitch refuse le token,
     * on le renouvelle puis on recommence une seule fois.
     */
    if (response.status === 401) {
        clearTwitchAccessToken();

        headers =
            await getTwitchApiHeaders({
                forceRefresh: true
            });

        response =
            await fetch(
                streamUrl.toString(),
                {
                    method: "GET",
                    headers,
                    cache: "no-store"
                }
            );
    }

    if (!response.ok) {
        const errorBody =
            await response.text();

        throw new Error(
            `Erreur Twitch Helix (${response.status}) : ${errorBody}`
        );
    }

    return response.json();
}


/* =========================================================
   FORMATAGE
========================================================= */

/**
 * Formate une miniature Twitch.
 *
 * @param {string | undefined} thumbnailUrl
 * @returns {string | null}
 */
function formatThumbnailUrl(
    thumbnailUrl
) {
    if (
        typeof thumbnailUrl !== "string"
    ) {
        return null;
    }

    return thumbnailUrl
        .replace("{width}", "1280")
        .replace("{height}", "720");
}


/**
 * Retourne le résultat hors ligne.
 *
 * @param {string} channelLogin
 * @returns {object}
 */
function createOfflineStreamResult(
    channelLogin
) {
    return {
        live: false,

        channel:
            channelLogin,

        displayName:
            channelLogin === "couaxia"
                ? "Couaxia"
                : channelLogin,

        title: null,

        category: null,

        gameId: null,

        viewers: 0,

        startedAt: null,

        language: null,

        mature: false,

        thumbnailUrl: null,

        twitchUrl:
            `https://www.twitch.tv/${channelLogin}`
    };
}


/**
 * Transforme la réponse Twitch.
 *
 * @param {object} twitchData
 * @param {string} channelLogin
 * @returns {object}
 */
function formatStreamResult(
    twitchData,
    channelLogin
) {
    const stream =
        twitchData?.data?.[0];

    if (!stream) {
        return createOfflineStreamResult(
            channelLogin
        );
    }

    return {
        live: true,

        id:
            stream.id ||
            null,

        channel:
            stream.user_login ||
            channelLogin,

        userId:
            stream.user_id ||
            null,

        displayName:
            stream.user_name ||
            channelLogin,

        title:
            stream.title ||
            "Live Twitch en cours",

        category:
            stream.game_name ||
            "Catégorie inconnue",

        gameId:
            stream.game_id ||
            null,

        type:
            stream.type ||
            "live",

        viewers:
            Number(
                stream.viewer_count
            ) || 0,

        startedAt:
            stream.started_at ||
            null,

        language:
            stream.language ||
            null,

        mature:
            Boolean(
                stream.is_mature
            ),

        tags:
            Array.isArray(
                stream.tags
            )
                ? stream.tags
                : [],

        thumbnailUrl:
            formatThumbnailUrl(
                stream.thumbnail_url
            ),

        twitchUrl:
            `https://www.twitch.tv/${channelLogin}`
    };
}


/* =========================================================
   FONCTIONS PUBLIQUES
========================================================= */

/**
 * Récupère le statut du live d'une chaîne Twitch.
 *
 * @param {string} channelLogin
 * @returns {Promise<object>}
 */
export async function getStreamStatus(
    channelLogin = DEFAULT_CHANNEL
) {
    const normalizedChannel =
        String(channelLogin)
            .trim()
            .toLowerCase();

    if (!normalizedChannel) {
        throw new Error(
            "Le nom de la chaîne Twitch est vide."
        );
    }

    const twitchData =
        await requestStreamFromTwitch(
            normalizedChannel
        );

    return formatStreamResult(
        twitchData,
        normalizedChannel
    );
}


/**
 * Indique simplement si une chaîne est en live.
 *
 * @param {string} channelLogin
 * @returns {Promise<boolean>}
 */
export async function isChannelLive(
    channelLogin = DEFAULT_CHANNEL
) {
    const streamStatus =
        await getStreamStatus(
            channelLogin
        );

    return streamStatus.live;
}