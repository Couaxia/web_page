"use strict";

/* =========================================================
   AUTH PUBLIC — UTILISATEUR ACTUEL
   COUAXIA / TWITCH
========================================================= */

import {
    getPublicUserSession,
    getPublicUser
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

                authenticated:
                    false,

                user:
                    null,

                error:
                    "Méthode non autorisée."

            });


        return;
    }


    try {

        /* =================================================
           SESSION PUBLIQUE
        ================================================== */

        const session =
            getPublicUserSession(
                request
            );


        /* =================================================
           NON CONNECTÉ
        ================================================== */

        if (
            !session
        ) {

            response
                .status(200)
                .json({

                    success:
                        true,

                    authenticated:
                        false,

                    user:
                        null,

                    loginUrl:
                        "/api/auth/public-login"

                });


            return;
        }


        /* =================================================
           UTILISATEUR PUBLIC
        ================================================== */

        const user =
            getPublicUser(
                session
            );


        /* =================================================
           SESSION INVALIDE
        ================================================== */

        if (
            !user
        ) {

            response
                .status(200)
                .json({

                    success:
                        true,

                    authenticated:
                        false,

                    user:
                        null,

                    loginUrl:
                        "/api/auth/public-login"

                });


            return;
        }


        /* =================================================
           CONNECTÉ
        ================================================== */

        response
            .status(200)
            .json({

                success:
                    true,

                authenticated:
                    true,

                user

            });


    } catch (
        error
    ) {

        console.error(
            "[Public Auth Me]",
            error
        );


        response
            .status(500)
            .json({

                success:
                    false,

                authenticated:
                    false,

                user:
                    null,

                error:
                    "Impossible de vérifier la connexion Twitch.",

                details:
                    process.env.NODE_ENV ===
                        "development"
                        ? error?.message
                        : undefined

            });
    }
}