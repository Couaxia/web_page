"use strict";

/* =========================================================
   CONFIGURATION
========================================================= */

const TWITCH_CHANNEL = "couaxia";

const TWITCH_TOKEN_URL =
    "https://id.twitch.tv/oauth2/token";

const TWITCH_STREAMS_URL =
    "https://api.twitch.tv/helix/streams";

/*
 * Le token est conservé temporairement en mémoire.
 * Cela évite d'en demander un nouveau à Twitch
 * à chaque visite de la page.
 */
let cachedAccessToken = null;
let accessTokenExpiresAt = 0;


/* =========================================================
   CRÉATION DU TOKEN TWITCH
========================================================= */

async function getTwitchAccessToken() {
    const now = Date.now();

    /*
     * Réutilisation du token s'il reste valide
     * pendant au moins encore une minute.
     */
    if (
        cachedAccessToken &&
        now < accessTokenExpiresAt - 60_000
    ) {
        return cachedAccessToken;
    }

    const clientId =
        process.env.TWITCH_CLIENT_ID;

    const clientSecret =
        process.env.TWITCH_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error(
            "TWITCH_CLIENT_ID ou TWITCH_CLIENT_SECRET est manquant dans Vercel."
        );
    }

    const requestBody = new URLSearchParams({
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

            body: requestBody.toString()
        }
    );

    if (!response.ok) {
        const errorText =
            await response.text();

        throw new Error(
            `Impossible de créer le token Twitch (${response.status}) : ${errorText}`
        );
    }

    const tokenData =
        await response.json();

    if (!tokenData.access_token) {
        throw new Error(
            "Twitch n'a renvoyé aucun access token."
        );
    }

    cachedAccessToken =
        tokenData.access_token;

    accessTokenExpiresAt =
        now +
        Number(tokenData.expires_in || 0) * 1000;

    return cachedAccessToken;
}


/* =========================================================
   RÉCUPÉRATION DU LIVE
========================================================= */

async function getTwitchStreamStatus() {
    const clientId =
        process.env.TWITCH_CLIENT_ID;

    const accessToken =
        await getTwitchAccessToken();

    const streamUrl = new URL(
        TWITCH_STREAMS_URL
    );

    streamUrl.searchParams.set(
        "user_login",
        TWITCH_CHANNEL
    );

    let response = await fetch(
        streamUrl,
        {
            method: "GET",

            headers: {
                "Client-ID": clientId,
                Authorization:
                    `Bearer ${accessToken}`
            }
        }
    );

    /*
     * Si Twitch refuse le token, on le renouvelle
     * automatiquement une fois.
     */
    if (response.status === 401) {
        cachedAccessToken = null;
        accessTokenExpiresAt = 0;

        const newAccessToken =
            await getTwitchAccessToken();

        response = await fetch(
            streamUrl,
            {
                method: "GET",

                headers: {
                    "Client-ID": clientId,
                    Authorization:
                        `Bearer ${newAccessToken}`
                }
            }
        );
    }

    if (!response.ok) {
        const errorText =
            await response.text();

        throw new Error(
            `Erreur Twitch Helix (${response.status}) : ${errorText}`
        );
    }

    const twitchData =
        await response.json();

    const stream =
        twitchData.data?.[0];

    /*
     * Aucun stream trouvé :
     * Couaxia est hors ligne.
     */
    if (!stream) {
        return {
            live: false,

            channel: TWITCH_CHANNEL,

            displayName: "Couaxia",

            twitchUrl:
                `https://www.twitch.tv/${TWITCH_CHANNEL}`
        };
    }

    const thumbnailUrl =
        stream.thumbnail_url
            ?.replace("{width}", "1280")
            .replace("{height}", "720") || null;

    return {
        live: true,

        channel:
            stream.user_login ||
            TWITCH_CHANNEL,

        displayName:
            stream.user_name ||
            "Couaxia",

        title:
            stream.title ||
            "Couaxia est actuellement en direct !",

        category:
            stream.game_name ||
            "Catégorie inconnue",

        gameId:
            stream.game_id ||
            null,

        viewers:
            Number(stream.viewer_count) || 0,

        startedAt:
            stream.started_at ||
            null,

        language:
            stream.language ||
            "fr",

        mature:
            Boolean(stream.is_mature),

        thumbnailUrl,

        twitchUrl:
            `https://www.twitch.tv/${TWITCH_CHANNEL}`
    };
}


/* =========================================================
   EN-TÊTES CORS
========================================================= */

function getCorsHeaders(request) {
    const allowedOrigins = [
        "https://couaxia.github.io",
        "https://couaxiawebsite.vercel.app"
    ];

    const requestOrigin =
        request.headers.get("origin");

    /*
     * Les URL de prévisualisation Vercel changent.
     * Elles sont donc autorisées lorsqu'elles finissent
     * bien par .vercel.app.
     */
    const isVercelPreview =
        requestOrigin?.endsWith(
            ".vercel.app"
        );

    const allowedOrigin =
        allowedOrigins.includes(requestOrigin) ||
        isVercelPreview
            ? requestOrigin
            : allowedOrigins[0];

    return {
        "Access-Control-Allow-Origin":
            allowedOrigin,

        "Access-Control-Allow-Methods":
            "GET, OPTIONS",

        "Access-Control-Allow-Headers":
            "Content-Type",

        "Vary":
            "Origin"
    };
}


/* =========================================================
   ROUTE OPTIONS
========================================================= */

export async function OPTIONS(request) {
    return new Response(
        null,
        {
            status: 204,
            headers: getCorsHeaders(request)
        }
    );
}


/* =========================================================
   ROUTE GET
========================================================= */

export async function GET(request) {
    const corsHeaders =
        getCorsHeaders(request);

    try {
        const twitchStatus =
            await getTwitchStreamStatus();

        return Response.json(
            twitchStatus,
            {
                status: 200,

                headers: {
                    ...corsHeaders,

                    /*
                     * Vercel peut conserver la réponse
                     * environ 30 secondes.
                     */
                    "Cache-Control":
                        "public, s-maxage=30, stale-while-revalidate=60"
                }
            }
        );
    } catch (error) {
        console.error(
            "Erreur API Twitch :",
            error
        );

        return Response.json(
            {
                live: false,

                error:
                    "Impossible de récupérer le statut Twitch.",

                details:
                    error instanceof Error
                        ? error.message
                        : "Erreur inconnue"
            },
            {
                status: 500,
                headers: corsHeaders
            }
        );
    }
}