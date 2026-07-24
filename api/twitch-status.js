"use strict";

const TWITCH_TOKEN_URL =
    "https://id.twitch.tv/oauth2/token";

const TWITCH_STREAMS_URL =
    "https://api.twitch.tv/helix/streams";

const TWITCH_LOGIN = "couaxia";

/*
 * Le token est conservé temporairement en mémoire
 * pour éviter d'en demander un nouveau à chaque visite.
 */
let cachedAccessToken = null;
let tokenExpirationTime = 0;


/**
 * Obtient un App Access Token Twitch.
 */
async function getTwitchAccessToken() {
    const now = Date.now();

    /*
     * On réutilise le token tant qu'il reste valide
     * pendant au moins une minute.
     */
    if (
        cachedAccessToken &&
        now < tokenExpirationTime - 60_000
    ) {
        return cachedAccessToken;
    }

    const clientId = process.env.TWITCH_CLIENT_ID;
    const clientSecret =
        process.env.TWITCH_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error(
            "Les variables Twitch ne sont pas configurées."
        );
    }

    const body = new URLSearchParams({
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
            body
        }
    );

    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
            `Impossible d'obtenir le token Twitch : ${errorText}`
        );
    }

    const tokenData = await response.json();

    cachedAccessToken = tokenData.access_token;

    tokenExpirationTime =
        now + tokenData.expires_in * 1000;

    return cachedAccessToken;
}


/**
 * Interroge Twitch pour savoir si Couaxia est en live.
 */
async function getStreamStatus() {
    const clientId = process.env.TWITCH_CLIENT_ID;
    const accessToken =
        await getTwitchAccessToken();

    const url =
        `${TWITCH_STREAMS_URL}` +
        `?user_login=${encodeURIComponent(TWITCH_LOGIN)}`;

    const response = await fetch(url, {
        headers: {
            "Client-ID": clientId,
            Authorization: `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
            `Erreur Twitch Helix : ${errorText}`
        );
    }

    const twitchData = await response.json();
    const stream = twitchData.data?.[0];

    if (!stream) {
        return {
            live: false,
            channel: TWITCH_LOGIN,
            twitchUrl:
                `https://www.twitch.tv/${TWITCH_LOGIN}`
        };
    }

    const thumbnailUrl = stream.thumbnail_url
        .replace("{width}", "1280")
        .replace("{height}", "720");

    return {
        live: true,

        channel: TWITCH_LOGIN,

        displayName:
            stream.user_name || "Couaxia",

        title:
            stream.title ||
            "Couaxia est actuellement en direct !",

        category:
            stream.game_name ||
            "Catégorie inconnue",

        viewers:
            Number(stream.viewer_count) || 0,

        startedAt:
            stream.started_at || null,

        thumbnailUrl,

        twitchUrl:
            `https://www.twitch.tv/${TWITCH_LOGIN}`
    };
}


/**
 * Fonction appelée par Vercel.
 */
module.exports = async function handler(
    request,
    response
) {
    if (request.method !== "GET") {
        response.setHeader(
            "Allow",
            "GET"
        );

        return response
            .status(405)
            .json({
                error: "Méthode non autorisée."
            });
    }

    try {
        const streamStatus =
            await getStreamStatus();

        /*
         * Petit cache public :
         * actualisation possible après environ 30 secondes.
         */
        response.setHeader(
            "Cache-Control",
            "public, s-maxage=30, stale-while-revalidate=60"
        );

        return response
            .status(200)
            .json(streamStatus);
    } catch (error) {
        console.error(error);

        return response
            .status(500)
            .json({
                live: false,
                error:
                    "Impossible de récupérer le statut Twitch."
            });
    }
};