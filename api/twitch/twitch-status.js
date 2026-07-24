"use strict";

import {
    getStreamStatus
} from "./stream.js";
import {
    getTwitchUser
} from "./user.js";


const TWITCH_CHANNEL =
    "couaxia";


function isAllowedOrigin(origin) {
    if (!origin) {
        return true;
    }

    const allowedOrigins = [
        "https://couaxia.github.io",
        "https://couaxiawebsite.vercel.app"
    ];

    return (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
    );
}


function createCorsHeaders(request) {
    const origin =
        request.headers.get("origin");

    const allowedOrigin =
        isAllowedOrigin(origin)
            ? origin || "*"
            : "https://couaxiawebsite.vercel.app";

    return {
        "Access-Control-Allow-Origin":
            allowedOrigin,

        "Access-Control-Allow-Methods":
            "GET, OPTIONS",

        "Access-Control-Allow-Headers":
            "Content-Type",

        Vary: "Origin"
    };
}


export async function OPTIONS(request) {
    return new Response(null, {
        status: 204,
        headers:
            createCorsHeaders(request)
    });
}


export async function GET(request) {
    const corsHeaders =
        createCorsHeaders(request);

    try {
        const [
            streamStatus,
            twitchUser
        ] = await Promise.all([
            getStreamStatus(
                TWITCH_CHANNEL
            ),

            getTwitchUser(
                TWITCH_CHANNEL
            )
        ]);

        return Response.json(
            streamStatus,
            {
                status: 200,

                headers: {
                    ...corsHeaders,

                    "Cache-Control":
                        "public, s-maxage=30, stale-while-revalidate=60"
                }
            }
        );
    } catch (error) {
        console.error(
            "Erreur dans twitch-status.js :",
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

                headers: {
                    ...corsHeaders,
                    "Cache-Control":
                        "no-store"
                }
            }
        );
    }
}