"use strict";

/* =========================================================
   API TWITCH — UTILISATEUR
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

const TWITCH_USERS_URL =
    "https://api.twitch.tv/helix/users";


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
 * Nettoie et normalise le nom d'une chaîne Twitch.
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
 * Retourne la chaîne Twitch configurée.
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
   REQUÊTE TWITCH
========================================================= */

/**
 * Effectue une requête vers Twitch.
 *
 * Si le token est refusé avec une erreur 401,
 * il est renouvelé puis la requête est retentée
 * une seule fois.
 *
 * @param {URL} url
 * @returns {Promise<Response>}
 */
async function fetchTwitchApi(
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


/* =========================================================
   APPEL À TWITCH
========================================================= */

/**
 * Demande les informations publiques
 * d'une chaîne Twitch.
 *
 * @param {string} channelLogin
 * @returns {Promise<object>}
 */
async function requestUserFromTwitch(
    channelLogin
) {

    const userUrl =
        new URL(
            TWITCH_USERS_URL
        );


    userUrl.searchParams.set(
        "login",
        channelLogin
    );


    const response =
        await fetchTwitchApi(
            userUrl
        );


    const twitchData =
        await readTwitchResponse(
            response
        );


    if (
        !response.ok
    ) {

        throw new Error(
            `Erreur Twitch Get Users (${response.status}) : ${
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
 * Transforme un utilisateur Twitch
 * en objet simplifié.
 *
 * @param {object} twitchUser
 * @param {string} requestedLogin
 * @returns {object}
 */
function formatUser(
    twitchUser,
    requestedLogin
) {

    const login =
        normalizeText(
            twitchUser?.login
        )
            .toLowerCase() ||
        requestedLogin;


    return {

        found:
            true,

        id:
            twitchUser?.id ||
            null,

        login,

        displayName:
            twitchUser?.display_name ||
            login,

        description:
            twitchUser?.description ||
            "",

        profileImageUrl:
            twitchUser?.profile_image_url ||
            null,

        offlineImageUrl:
            twitchUser?.offline_image_url ||
            null,

        broadcasterType:
            twitchUser?.broadcaster_type ||
            "",

        userType:
            twitchUser?.type ||
            "",

        createdAt:
            twitchUser?.created_at ||
            null,

        twitchUrl:
            `https://www.twitch.tv/${encodeURIComponent(
                login
            )}`

    };
}


/**
 * Retourne un résultat cohérent
 * lorsque la chaîne n'existe pas.
 *
 * @param {string} channelLogin
 * @returns {object}
 */
function createUserNotFoundResult(
    channelLogin
) {

    return {

        found:
            false,

        id:
            null,

        login:
            channelLogin,

        displayName:
            channelLogin,

        description:
            "",

        profileImageUrl:
            null,

        offlineImageUrl:
            null,

        broadcasterType:
            "",

        userType:
            "",

        createdAt:
            null,

        twitchUrl:
            `https://www.twitch.tv/${encodeURIComponent(
                channelLogin
            )}`

    };
}


/* =========================================================
   FONCTIONS PUBLIQUES
========================================================= */

/**
 * Récupère les informations publiques
 * d'une chaîne Twitch.
 *
 * @param {string|null} channelLogin
 * @returns {Promise<object>}
 */
export async function getTwitchUser(
    channelLogin = null
) {

    const normalizedLogin =
        normalizeChannelLogin(
            channelLogin ||
            getDefaultChannel()
        );


    const twitchData =
        await requestUserFromTwitch(
            normalizedLogin
        );


    const twitchUser =
        Array.isArray(
            twitchData?.data
        )
            ? twitchData.data[0]
            : null;


    if (
        !twitchUser
    ) {

        return createUserNotFoundResult(
            normalizedLogin
        );
    }


    return formatUser(
        twitchUser,
        normalizedLogin
    );
}


/**
 * Récupère uniquement l'identifiant
 * numérique Twitch.
 *
 * @param {string|null} channelLogin
 * @returns {Promise<string>}
 */
export async function getTwitchUserId(
    channelLogin = null
) {

    const normalizedLogin =
        normalizeChannelLogin(
            channelLogin ||
            getDefaultChannel()
        );


    const user =
        await getTwitchUser(
            normalizedLogin
        );


    if (
        !user.found ||
        !user.id
    ) {

        throw new Error(
            `La chaîne Twitch "${normalizedLogin}" est introuvable.`
        );
    }


    return user.id;
}


/**
 * Vérifie si une chaîne Twitch existe.
 *
 * @param {string|null} channelLogin
 * @returns {Promise<boolean>}
 */
export async function twitchUserExists(
    channelLogin = null
) {

    const user =
        await getTwitchUser(
            channelLogin ||
            getDefaultChannel()
        );


    return Boolean(
        user.found
    );
}


/* =========================================================
   API HTTP
========================================================= */

/**
 * Exemples :
 *
 * GET /api/user
 *
 * GET /api/user?channel=couaxia
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

        const user =
            await getTwitchUser(
                channel
            );


        if (
            !user.found
        ) {

            response
                .status(404)
                .json({

                    success:
                        false,

                    user,

                    error:
                        `La chaîne Twitch "${channel}" est introuvable.`

                });


            return;
        }


        /* =================================================
           RÉPONSE
        ================================================== */

        response
            .status(200)
            .json({

                success:
                    true,

                user

            });


    } catch (
        error
    ) {

        console.error(
            "[User API]",
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

                user:
                    null,

                error:
                    error?.message ||
                    "Impossible de récupérer l'utilisateur Twitch."

            });
    }
}