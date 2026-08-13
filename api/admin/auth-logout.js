"use strict";

/* =========================================================
   AUTH LOGOUT ADMIN — COUAXIA
========================================================= */

import {
    createLogoutCookie
} from "../_lib/admin-auth.js";


/* =========================================================
   HANDLER
========================================================= */

export default function handler(
    request,
    response
) {

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
           SUPPRESSION DU COOKIE ADMIN
        ================================================== */

        response.setHeader(
            "Set-Cookie",
            createLogoutCookie()
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

                message:
                    "Déconnexion réussie."
            });

    } catch (error) {

        console.error(
            "[Admin Auth Logout]",
            error
        );


        response
            .status(500)
            .json({
                success:
                    false,

                authenticated:
                    false,

                error:
                    "Impossible de fermer la session administrateur."
            });

    }

}