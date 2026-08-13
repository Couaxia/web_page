"use strict";

/* =========================================================
   API TWITCH — STREAM
   COUAXIA
========================================================= */

import {
    clearTwitchAccessToken,
    getTwitchApiHeaders,
    getChannelLogin
} from "./auth.js";


/* =========================================================
   CONFIGURATION
========================================================= */

const TWITCH_STREAMS_URL =
    "https://api.twitch.tv/helix/streams";


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
 * Normalise le login Twitch.
 *
 * @param {unknown} channelLogin
 * @returns {string}
 */
function normalizeChannelLogin(
    channelLogin
) {

    const normalizedChannel =
        normalizeText(
            channelLogin
        )
            .toLowerCase();


    if (
        !normalizedChannel
    ) {

        throw new Error(
            "Le nom de la chaîne Twitch est vide."
        );
    }


    return normalizedChannel;
}


/**
 * Retourne la chaîne Twitch configurée
 * dans les variables d'environnement.
 *
 * @returns {string}
 */
function getDefaultChannel() {

    return getChannelLogin();
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
        new URL(
            TWITCH_STREAMS_URL
        );


    streamUrl.searchParams.set(
        "user_login",
        channelLogin
    );


    let response =
        await fetch(
            streamUrl.toString(),
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
     * Si Twitch refuse le token,
     * on le renouvelle puis on recommence
     * une seule fois.
     */

    if (
        response.status ===
        401
    ) {

        clearTwitchAccessToken();


        response =
            await fetch(
                streamUrl.toString(),
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


    const twitchData =
        await readTwitchResponse(
            response
        );


    if (
        !response.ok
    ) {

        throw new Error(
            `Erreur Twitch Helix (${response.status}) : ${
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
 * Formate la miniature Twitch.
 *
 * @param {unknown} thumbnailUrl
 * @param {number} width
 * @param {number} height
 * @returns {string|null}
 */
function formatThumbnailUrl(
    thumbnailUrl,
    width = 1280,
    height = 720
) {

    const url =
        normalizeText(
            thumbnailUrl
        );


    if (
        !url
    ) {

        return null;
    }


    return url
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
        )
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
        );
}


/**
 * Retourne le résultat quand la chaîne
 * n'est pas en live.
 *
 * @param {string} channelLogin
 * @returns {object}
 */
function createOfflineStreamResult(
    channelLogin
) {

    return {

        live:
            false,

        id:
            null,

        channel:
            channelLogin,

        userId:
            null,

        displayName:
            channelLogin,

        title:
            null,

        category:
            null,

        gameId:
            null,

        type:
            null,

        viewers:
            0,

        startedAt:
            null,

        language:
            null,

        mature:
            false,

        tags:
            [],

        thumbnailUrl:
            null,

        twitchUrl:
            `https://www.twitch.tv/${encodeURIComponent(
                channelLogin
            )}`

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
        Array.isArray(
            twitchData?.data
        )
            ? twitchData.data[0]
            : null;


    if (
        !stream
    ) {

        return createOfflineStreamResult(
            channelLogin
        );
    }


    const streamLogin =
        normalizeText(
            stream.user_login
        )
            .toLowerCase() ||
        channelLogin;


    return {

        live:
            true,

        id:
            stream.id ||
            null,

        channel:
            streamLogin,

        userId:
            stream.user_id ||
            null,

        displayName:
            stream.user_name ||
            streamLogin,

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
            ) ||
            0,

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
            `https://www.twitch.tv/${encodeURIComponent(
                streamLogin
            )}`

    };
}


/* =========================================================
   FONCTIONS PUBLIQUES
========================================================= */

/**
 * Récupère le statut du live d'une chaîne Twitch.
 *
 * @param {string|null} channelLogin
 * @returns {Promise<object>}
 */
export async function getStreamStatus(
    channelLogin = null
) {

    const normalizedChannel =
        normalizeChannelLogin(
            channelLogin ||
            getDefaultChannel()
        );


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
 * @param {string|null} channelLogin
 * @returns {Promise<boolean>}
 */
export async function isChannelLive(
    channelLogin = null
) {

    const streamStatus =
        await getStreamStatus(
            channelLogin ||
            getDefaultChannel()
        );


    return Boolean(
        streamStatus.live
    );
}


/* =========================================================
   API HTTP
========================================================= */

/**
 * Exemples :
 *
 * GET /api/stream
 *
 * GET /api/stream?channel=couaxia
 */
export default async function handler(
    request,
    response
) {

    /* =====================================================
       CACHE
    ====================================================== */

    /*
     * Le statut live peut changer rapidement,
     * donc on évite de conserver une ancienne réponse.
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


    try {

        /* =================================================
           CHAÎNE
        ================================================== */

        const channel =
            normalizeText(
                request.query?.channel
            ) ||
            getDefaultChannel();


        /* =================================================
           TWITCH
        ================================================== */

        const stream =
            await getStreamStatus(
                channel
            );


        /* =================================================
           RÉPONSE
        ================================================== */

        response
            .status(200)
            .json({

                success:
                    true,

                stream

            });


    } catch (
        error
    ) {

        console.error(
            "[Stream API]",
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

                stream:
                    null,

                error:
                    error?.message ||
                    "Impossible de récupérer le statut du live Twitch."

            });
    }
}