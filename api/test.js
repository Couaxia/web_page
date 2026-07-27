"use strict";

export default function handler(request, response) {
    response.status(200).json({
        success: true,
        message: "La fonction Vercel fonctionne.",
        nodeVersion: process.version,
        environment: process.env.NODE_ENV,
        hasClientId: Boolean(process.env.TWITCH_CLIENT_ID),
        hasClientSecret: Boolean(process.env.TWITCH_CLIENT_SECRET)
    });
}