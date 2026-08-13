"use strict";

/* =========================================================
   AUTH ME ADMIN — COUAXIA
========================================================= */

import {
    getAdminSession,
    getPublicAdminUser
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
        "GET"
    ) {

        response.setHeader(
            "Allow",
            "GET"
        );


        response
            .status(405)
            .json({
                authenticated:
                    false,

                error:
                    "Méthode non autorisée."
            });


        return;
    }


    try {

        /* =================================================
           RÉCUPÉRATION DE LA SESSION
        ================================================== */

        const session =
            getAdminSession(
                request
            );


        /* =================================================
           PAS DE SESSION
        ================================================== */

        if (!session) {

            response
                .status(401)
                .json({
                    authenticated:
                        false,

                    user:
                        null
                });


            return;
        }


        /* =================================================
           UTILISATEUR PUBLIC
        ================================================== */

        const user =
            getPublicAdminUser(
                session
            );


        if (!user) {

            response
                .status(401)
                .json({
                    authenticated:
                        false,

                    user:
                        null
                });


            return;
        }


        /* =================================================
           SESSION VALIDE
        ================================================== */

        response
            .status(200)
            .json({
                authenticated:
                    true,

                user: {
                    id:
                        user.id,

                    login:
                        user.login,

                    displayName:
                        user.displayName,

                    profileImageUrl:
                        user.profileImageUrl,

                    role:
                        "admin"
                }
            });

    } catch (error) {

        console.error(
            "[Admin Auth Me]",
            error
        );


        response
            .status(500)
            .json({
                authenticated:
                    false,

                user:
                    null,

                error:
                    "Impossible de vérifier la session administrateur."
            });

    }

}