"use strict";

/* =========================================================
   AUTHENTIFICATION TWITCH
========================================================= */

const TWITCH_TOKEN_URL =
    "https://id.twitch.tv/oauth2/token";

/*
 * Cache mémoire du token.
 * Sur Vercel il peut être conservé entre plusieurs requêtes
 * mais il ne faut jamais compter dessus.
 */

let cachedAccessToken = null;
let accessTokenExpiration = 0;


/* =========================================================
   VARIABLES D'ENVIRONNEMENT
========================================================= */

export function getTwitchClientId() {
    const clientId =
        process.env.TWITCH_CLIENT_ID?.trim();

    if (!clientId) {
        throw new Error(
            "TWITCH_CLIENT_ID est absent dans les variables Vercel."
        );
    }

    return clientId;
}

function getTwitchClientSecret() {
    const clientSecret =
        process.env.TWITCH_CLIENT_SECRET?.trim();

    if (!clientSecret) {
        throw new Error(
            "TWITCH_CLIENT_SECRET est absent dans les variables Vercel."
        );
    }

    return clientSecret;
}

export function getChannelLogin() {
    const login =
        process.env.TWITCH_CHANNEL_LOGIN?.trim();

    if (!login) {
        throw new Error(
            "TWITCH_CHANNEL_LOGIN est absent dans les variables Vercel."
        );
    }

    return login.toLowerCase();
}


/* =========================================================
   CACHE
========================================================= */

function hasValidToken() {
    if (!cachedAccessToken) {
        return false;
    }

    return (
        Date.now() <
        accessTokenExpiration - 60000
    );
}

export function clearTwitchAccessToken() {
    cachedAccessToken = null;
    accessTokenExpiration = 0;
}


/* =========================================================
   DEMANDE D'UN NOUVEAU TOKEN
========================================================= */

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
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded"
                },

                body,

                cache: "no-store"
            }
        );

    const data =
        await response.json();

    if (!response.ok) {

        throw new Error(
            `Erreur Twitch OAuth (${response.status}) : ${
                data.message ??
                JSON.stringify(data)
            }`
        );

    }

    cachedAccessToken =
        data.access_token;

    accessTokenExpiration =
        Date.now() +
        (data.expires_in * 1000);

    return cachedAccessToken;
}


/* =========================================================
   TOKEN PUBLIC
========================================================= */

export async function getTwitchAccessToken(
    {
        forceRefresh = false
    } = {}
) {

    if (forceRefresh) {
        clearTwitchAccessToken();
    }

    if (hasValidToken()) {
        return cachedAccessToken;
    }

    return requestAccessToken();
}


/* =========================================================
   HEADERS HELIX
========================================================= */

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
   REQUÊTES HELIX
========================================================= */

export async function twitchFetch(
    endpoint,
    {
        forceRefresh = false
    } = {}
) {

    let response =
        await fetch(
            `https://api.twitch.tv/helix${endpoint}`,
            {
                headers:
                    await getTwitchApiHeaders({
                        forceRefresh
                    }),

                cache: "no-store"
            }
        );

    /*
     * Si le token est expiré malgré le cache,
     * on en génère automatiquement un nouveau.
     */

    if (response.status === 401 && !forceRefresh) {

        clearTwitchAccessToken();

        response =
            await fetch(
                `https://api.twitch.tv/helix${endpoint}`,
                {
                    headers:
                        await getTwitchApiHeaders({
                            forceRefresh: true
                        }),

                    cache: "no-store"
                }
            );

    }

    const data =
        await response.json();

    if (!response.ok) {

        throw new Error(
            `Erreur Twitch (${response.status}) : ${
                data.message ??
                JSON.stringify(data)
            }`
        );

    }

    return data;

}