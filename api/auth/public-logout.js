"use strict";

/* =========================================================
   AUTH LOGOUT PUBLIC — TWITCH
   COUAXIA / RENDER
========================================================= */

import {
    createPublicLogoutCookie
} from "../_lib/public-auth.js";


/* =========================================================
   HANDLER
========================================================= */

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
       MÉTHODE HTTP
    ====================================================== */

    if (
        request.method !==
        "POST"
    ) {

        response.setHeader(
            "Allow",
            "POST"
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
           SUPPRESSION SESSION PUBLIQUE
        ================================================== */

        response.setHeader(
            "Set-Cookie",
            createPublicLogoutCookie()
        );


        /* =================================================
           RÉPONSE
        ================================================== */

        response
            .status(200)
            .json({

                success:
                    true,

                authenticated:
                    false,

                user:
                    null,

                message:
                    "Déconnexion Twitch réussie."

            });


    } catch (
        error
    ) {

        console.error(
            "[Public Auth Logout]",
            error
        );


        response
            .status(500)
            .json({

                success:
                    false,

                error:
                    "Impossible de se déconnecter de Twitch.",

                details:
                    process.env.NODE_ENV ===
                        "development"
                        ? error?.message
                        : undefined

            });
    }
}