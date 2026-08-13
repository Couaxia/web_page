"use strict";

/* =========================================================
   AUTHENTIFICATION TWITCH
========================================================= */

const TWITCH_TOKEN_URL =
    "https://id.twitch.tv/oauth2/token";

const TWITCH_HELIX_URL =
    "https://api.twitch.tv/helix";


/* =========================================================
   CACHE TOKEN
========================================================= */

/*
 * Cache mémoire du token Twitch.
 *
 * Sur Render, une instance peut conserver ce token
 * entre plusieurs requêtes tant que le processus Node
 * reste actif.
 *
 * Il ne faut toutefois jamais dépendre uniquement
 * de ce cache.
 */

let cachedAccessToken =
    null;

let accessTokenExpiration =
    0;


/* =========================================================
   VARIABLES D'ENVIRONNEMENT
========================================================= */

/**
 * Retourne une variable d'environnement obligatoire.
 *
 * @param {string} name
 * @returns {string}
 */
function getRequiredEnvironmentVariable(
    name
) {

    const value =
        process.env[name]
            ?.trim();


    if (
        !value
    ) {

        throw new Error(
            `${name} est absent des variables d'environnement.`
        );
    }


    return value;
}


/**
 * Client ID Twitch.
 *
 * @returns {string}
 */
export function getTwitchClientId() {

    return getRequiredEnvironmentVariable(
        "TWITCH_CLIENT_ID"
    );
}


/**
 * Client Secret Twitch.
 *
 * @returns {string}
 */
function getTwitchClientSecret() {

    return getRequiredEnvironmentVariable(
        "TWITCH_CLIENT_SECRET"
    );
}


/**
 * Login de la chaîne Twitch.
 *
 * Exemple :
 *
 * couaxia
 *
 * @returns {string}
 */
export function getChannelLogin() {

    return getRequiredEnvironmentVariable(
        "TWITCH_CHANNEL_LOGIN"
    )
        .toLowerCase();
}


/* =========================================================
   CACHE
========================================================= */

/**
 * Vérifie si le token actuellement stocké
 * est encore valide.
 *
 * On garde une marge d'une minute.
 *
 * @returns {boolean}
 */
function hasValidToken() {

    if (
        !cachedAccessToken
    ) {

        return false;
    }


    return (
        Date.now() <
        accessTokenExpiration -
        60_000
    );
}


/**
 * Vide le cache du token Twitch.
 */
export function clearTwitchAccessToken() {

    cachedAccessToken =
        null;

    accessTokenExpiration =
        0;
}


/* =========================================================
   LECTURE DES RÉPONSES
========================================================= */

/**
 * Lit proprement une réponse HTTP.
 *
 * @param {Response} response
 * @returns {Promise<object>}
 */
async function readJsonResponse(
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
   DEMANDE D'UN TOKEN
========================================================= */

/**
 * Demande un App Access Token à Twitch.
 *
 * @returns {Promise<string>}
 */
async function requestAccessToken() {

    const body =
        new URLSearchParams({

            client_id:
                getTwitchClientId(),

            client_secret:
                getTwitchClientSecret(),

            grant_type:
                "client_credentials"

        });


    const response =
        await fetch(
            TWITCH_TOKEN_URL,
            {
                method:
                    "POST",

                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded",

                    Accept:
                        "application/json"
                },

                body,

                cache:
                    "no-store"
            }
        );


    const data =
        await readJsonResponse(
            response
        );


    if (
        !response.ok
    ) {

        throw new Error(
            `Erreur Twitch OAuth (${response.status}) : ${
                data?.message ||
                data?.error ||
                "Impossible d'obtenir un token Twitch."
            }`
        );
    }


    if (
        !data?.access_token
    ) {

        throw new Error(
            "Twitch n'a retourné aucun access_token."
        );
    }


    cachedAccessToken =
        String(
            data.access_token
        );


    const expiresIn =
        Number(
            data.expires_in
        );


    accessTokenExpiration =
        Date.now() +
        (
            Number.isFinite(
                expiresIn
            )
                ? expiresIn * 1000
                : 0
        );


    return cachedAccessToken;
}


/* =========================================================
   TOKEN PUBLIC
========================================================= */

/**
 * Retourne un App Access Token Twitch.
 *
 * @param {object} options
 * @param {boolean} options.forceRefresh
 * @returns {Promise<string>}
 */
export async function getTwitchAccessToken(
    {
        forceRefresh = false
    } = {}
) {

    if (
        forceRefresh
    ) {

        clearTwitchAccessToken();
    }


    if (
        hasValidToken()
    ) {

        return cachedAccessToken;
    }


    return requestAccessToken();
}


/* =========================================================
   HEADERS HELIX
========================================================= */

/**
 * Retourne les headers nécessaires
 * pour appeler Twitch Helix.
 *
 * @param {object} options
 * @param {boolean} options.forceRefresh
 * @returns {Promise<object>}
 */
export async function getTwitchApiHeaders(
    {
        forceRefresh = false
    } = {}
) {

    const accessToken =
        await getTwitchAccessToken({
            forceRefresh
        });


    return {

        "Client-ID":
            getTwitchClientId(),

        Authorization:
            `Bearer ${accessToken}`,

        Accept:
            "application/json"

    };
}


/* =========================================================
   TWITCH FETCH
========================================================= */

/**
 * Exécute une requête GET vers Twitch Helix.
 *
 * Exemple :
 *
 * twitchFetch("/games?id=509658")
 *
 * @param {string} endpoint
 * @param {object} options
 * @param {boolean} options.forceRefresh
 * @returns {Promise<object>}
 */
export async function twitchFetch(
    endpoint,
    {
        forceRefresh = false
    } = {}
) {

    const normalizedEndpoint =
        String(
            endpoint ?? ""
        )
            .trim();


    if (
        !normalizedEndpoint
    ) {

        throw new Error(
            "L'endpoint Twitch est obligatoire."
        );
    }


    const endpointWithSlash =
        normalizedEndpoint.startsWith(
            "/"
        )
            ? normalizedEndpoint
            : `/${normalizedEndpoint}`;


    async function executeRequest(
        refreshToken
    ) {

        return fetch(
            `${TWITCH_HELIX_URL}${endpointWithSlash}`,
            {
                method:
                    "GET",

                headers:
                    await getTwitchApiHeaders({
                        forceRefresh:
                            refreshToken
                    }),

                cache:
                    "no-store"
            }
        );
    }


    /* =====================================================
       PREMIÈRE REQUÊTE
    ====================================================== */

    let response =
        await executeRequest(
            forceRefresh
        );


    /* =====================================================
       TOKEN EXPIRÉ
    ====================================================== */

    if (
        response.status ===
        401 &&
        !forceRefresh
    ) {

        clearTwitchAccessToken();


        response =
            await executeRequest(
                true
            );
    }


    /* =====================================================
       DONNÉES
    ====================================================== */

    const data =
        await readJsonResponse(
            response
        );


    if (
        !response.ok
    ) {

        throw new Error(
            `Erreur Twitch (${response.status}) : ${
                data?.message ||
                data?.error ||
                "Erreur inconnue."
            }`
        );
    }


    return data;
}