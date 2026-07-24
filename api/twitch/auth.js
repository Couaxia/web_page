"use strict";

/* =========================================================
   CONFIGURATION TWITCH
========================================================= */

const TWITCH_TOKEN_URL =
    "https://id.twitch.tv/oauth2/token";

/*
 * Cache temporaire du token.
 *
 * Une fonction Vercel peut conserver sa mémoire entre
 * plusieurs appels, mais ce n'est jamais garanti.
 * Si l'instance redémarre, un nouveau token sera simplement
 * demandé à Twitch.
 */
let cachedAccessToken = null;
let accessTokenExpiresAt = 0;


/* =========================================================
   VARIABLES D'ENVIRONNEMENT
========================================================= */

/**
 * Retourne le Client ID Twitch enregistré dans Vercel.
 */
export function getTwitchClientId() {
    const clientId =
        process.env.TWITCH_CLIENT_ID?.trim();

    if (!clientId) {
        throw new Error(
            "La variable TWITCH_CLIENT_ID est absente dans Vercel."
        );
    }

    return clientId;
}


/**
 * Retourne le Client Secret Twitch enregistré dans Vercel.
 *
 * Cette fonction ne doit être utilisée que côté serveur.
 */
function getTwitchClientSecret() {
    const clientSecret =
        process.env.TWITCH_CLIENT_SECRET?.trim();

    if (!clientSecret) {
        throw new Error(
            "La variable TWITCH_CLIENT_SECRET est absente dans Vercel."
        );
    }

    return clientSecret;
}


/* =========================================================
   CACHE DU TOKEN
========================================================= */

/**
 * Indique si le token conservé en mémoire est encore valide.
 *
 * Une marge de sécurité de 60 secondes évite d'utiliser
 * un token qui expirerait pendant une requête Twitch.
 */
function hasValidCachedToken() {
    const safetyDelay = 60_000;

    return Boolean(
        cachedAccessToken &&
        Date.now() <
            accessTokenExpiresAt - safetyDelay
    );
}


/**
 * Efface volontairement le token en cache.
 *
 * Cette fonction sera utile si Twitch répond 401.
 */
export function clearTwitchAccessToken() {
    cachedAccessToken = null;
    accessTokenExpiresAt = 0;
}


/* =========================================================
   CRÉATION DE L'APP ACCESS TOKEN
========================================================= */

/**
 * Demande un App Access Token à Twitch avec le flux
 * client_credentials.
 */
async function requestNewAccessToken() {
    const clientId =
        getTwitchClientId();

    const clientSecret =
        getTwitchClientSecret();

    const requestBody =
        new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: "client_credentials"
        });

    const response = await fetch(
        TWITCH_TOKEN_URL,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/x-www-form-urlencoded"
            },

            body: requestBody.toString(),

            /*
             * Le token ne doit pas être mis en cache
             * par un intermédiaire HTTP.
             */
            cache: "no-store"
        }
    );

    if (!response.ok) {
        const errorBody =
            await response.text();

        throw new Error(
            `Twitch a refusé la création du token ` +
            `(${response.status}) : ${errorBody}`
        );
    }

    const tokenData =
        await response.json();

    if (
        !tokenData.access_token ||
        !tokenData.expires_in
    ) {
        throw new Error(
            "La réponse OAuth Twitch est incomplète."
        );
    }

    cachedAccessToken =
        tokenData.access_token;

    accessTokenExpiresAt =
        Date.now() +
        Number(tokenData.expires_in) * 1000;

    return cachedAccessToken;
}


/* =========================================================
   FONCTION PUBLIQUE DU MODULE
========================================================= */

/**
 * Retourne un App Access Token Twitch valide.
 *
 * Le token existant est réutilisé lorsqu'il est encore
 * valide. Sinon, un nouveau token est demandé.
 */
export async function getTwitchAccessToken({
    forceRefresh = false
} = {}) {
    if (forceRefresh) {
        clearTwitchAccessToken();
    }

    if (hasValidCachedToken()) {
        return cachedAccessToken;
    }

    return requestNewAccessToken();
}


/* =========================================================
   EN-TÊTES POUR TWITCH HELIX
========================================================= */

/**
 * Prépare les en-têtes nécessaires aux appels Helix.
 */
export async function getTwitchApiHeaders({
    forceRefresh = false
} = {}) {
    const clientId =
        getTwitchClientId();

    const accessToken =
        await getTwitchAccessToken({
            forceRefresh
        });

    return {
        "Client-ID": clientId,
        Authorization:
            `Bearer ${accessToken}`,
        Accept: "application/json"
    };
}