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

const TWITCH_USERS_URL =
    "https://api.twitch.tv/helix/users";

const DEFAULT_CHANNEL =
    "couaxia";


/* =========================================================
   OUTILS
========================================================= */

/**
 * Nettoie et normalise le nom d'une chaîne Twitch.
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
 * Effectue une requête vers l'API Twitch.
 *
 * Si le token est refusé avec une erreur 401,
 * un nouveau token est généré puis la requête
 * est retentée une seule fois.
 *
 * @param {URL} url
 * @returns {Promise<Response>}
 */
async function fetchTwitchApi(url) {
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
   APPEL À L'ENDPOINT GET USERS
========================================================= */

/**
 * Demande les informations publiques d'une chaîne Twitch.
 *
 * @param {string} channelLogin
 * @returns {Promise<object>}
 */
async function requestUserFromTwitch(
    channelLogin
) {
    const userUrl =
        new URL(TWITCH_USERS_URL);

    userUrl.searchParams.set(
        "login",
        channelLogin
    );

    const response =
        await fetchTwitchApi(userUrl);

    if (!response.ok) {
        const errorBody =
            await response.text();

        throw new Error(
            `Erreur Twitch Get Users ` +
            `(${response.status}) : ${errorBody}`
        );
    }

    return response.json();
}


/* =========================================================
   FORMATAGE
========================================================= */

/**
 * Transforme un utilisateur Twitch en objet simplifié.
 *
 * @param {object} twitchUser
 * @param {string} requestedLogin
 * @returns {object}
 */
function formatUser(
    twitchUser,
    requestedLogin
) {
    return {
        found: true,

        id:
            twitchUser.id ||
            null,

        login:
            twitchUser.login ||
            requestedLogin,

        displayName:
            twitchUser.display_name ||
            requestedLogin,

        description:
            twitchUser.description ||
            "",

        profileImageUrl:
            twitchUser.profile_image_url ||
            null,

        offlineImageUrl:
            twitchUser.offline_image_url ||
            null,

        broadcasterType:
            twitchUser.broadcaster_type ||
            "",

        userType:
            twitchUser.type ||
            "",

        createdAt:
            twitchUser.created_at ||
            null,

        twitchUrl:
            `https://www.twitch.tv/${
                twitchUser.login ||
                requestedLogin
            }`
    };
}


/**
 * Retourne un résultat cohérent lorsque la chaîne
 * demandée n'existe pas.
 *
 * @param {string} channelLogin
 * @returns {object}
 */
function createUserNotFoundResult(
    channelLogin
) {
    return {
        found: false,

        id: null,

        login:
            channelLogin,

        displayName:
            channelLogin,

        description: "",

        profileImageUrl: null,

        offlineImageUrl: null,

        broadcasterType: "",

        userType: "",

        createdAt: null,

        twitchUrl:
            `https://www.twitch.tv/${channelLogin}`
    };
}


/* =========================================================
   FONCTIONS PUBLIQUES
========================================================= */

/**
 * Récupère les informations publiques d'une chaîne Twitch.
 *
 * @param {string} channelLogin
 * @returns {Promise<object>}
 */
export async function getTwitchUser(
    channelLogin = DEFAULT_CHANNEL
) {
    const normalizedLogin =
        normalizeChannelLogin(
            channelLogin
        );

    const twitchData =
        await requestUserFromTwitch(
            normalizedLogin
        );

    const twitchUser =
        twitchData?.data?.[0];

    if (!twitchUser) {
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
 * Récupère uniquement l'identifiant numérique Twitch.
 *
 * Cette fonction sera très pratique pour les futurs
 * modules followers, vidéos, clips et planning.
 *
 * @param {string} channelLogin
 * @returns {Promise<string>}
 */
export async function getTwitchUserId(
    channelLogin = DEFAULT_CHANNEL
) {
    const user =
        await getTwitchUser(
            channelLogin
        );

    if (!user.found || !user.id) {
        throw new Error(
            `La chaîne Twitch "${channelLogin}" est introuvable.`
        );
    }

    return user.id;
}


/**
 * Vérifie si une chaîne Twitch existe.
 *
 * @param {string} channelLogin
 * @returns {Promise<boolean>}
 */
export async function twitchUserExists(
    channelLogin = DEFAULT_CHANNEL
) {
    const user =
        await getTwitchUser(
            channelLogin
        );

    return user.found;
}