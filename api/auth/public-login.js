"use strict";

/* =========================================================
   AUTH LOGIN PUBLIC — TWITCH
   COUAXIA / RENDER
========================================================= */

import crypto from "node:crypto";

import {
    getTwitchClientId
} from "../auth.js";


/* =========================================================
   CONFIGURATION
========================================================= */

const TWITCH_AUTHORIZE_URL =
    "https://id.twitch.tv/oauth2/authorize";


const OAUTH_STATE_COOKIE =
    "couaxia_public_oauth_state";


const OAUTH_STATE_DURATION_SECONDS =
    10 * 60;


/* =========================================================
   OUTILS
========================================================= */

/**
 * Récupère l'URL de redirection OAuth publique
 * configurée dans Render.
 *
 * @returns {string}
 */
function getPublicRedirectUri() {

    const redirectUri =
        process.env
            .TWITCH_PUBLIC_REDIRECT_URI
            ?.trim();


    if (
        !redirectUri
    ) {

        throw new Error(
            "TWITCH_PUBLIC_REDIRECT_URI est absente des variables d'environnement."
        );
    }


    return redirectUri;
}


/**
 * Génère un state OAuth sécurisé.
 *
 * @returns {string}
 */
function createOAuthState() {

    return crypto
        .randomBytes(
            32
        )
        .toString(
            "hex"
        );
}


/**
 * Crée le cookie temporaire contenant
 * le state OAuth public.
 *
 * @param {string} state
 * @returns {string}
 */
function createOAuthStateCookie(
    state
) {

    return [
        `${OAUTH_STATE_COOKIE}=${encodeURIComponent(
            state
        )}`,
        "Path=/",
        "HttpOnly",
        "Secure",
        "SameSite=Lax",
        `Max-Age=${OAUTH_STATE_DURATION_SECONDS}`
    ].join(
        "; "
    );
}


/* =========================================================
   HANDLER
========================================================= */

export default async function handler(
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

                success:
                    false,

                error:
                    "Méthode non autorisée."

            });


        return;
    }


    try {

        /* =================================================
           CONFIGURATION
        ================================================== */

        const clientId =
            getTwitchClientId();


        const redirectUri =
            getPublicRedirectUri();


        /* =================================================
           STATE OAUTH
        ================================================== */

        const state =
            createOAuthState();


        response.setHeader(
            "Set-Cookie",
            createOAuthStateCookie(
                state
            )
        );


        /* =================================================
           URL TWITCH
        ================================================== */

        const twitchUrl =
            new URL(
                TWITCH_AUTHORIZE_URL
            );


        twitchUrl.searchParams.set(
            "client_id",
            clientId
        );


        twitchUrl.searchParams.set(
            "redirect_uri",
            redirectUri
        );


        twitchUrl.searchParams.set(
            "response_type",
            "code"
        );


        twitchUrl.searchParams.set(
            "state",
            state
        );


        /*
         * Aucun scope particulier n'est nécessaire
         * simplement pour identifier le compte Twitch.
         */
        twitchUrl.searchParams.set(
            "scope",
            ""
        );


        /*
         * Facultatif :
         * force Twitch à afficher l'écran
         * de connexion / autorisation.
         *
         * Ça évite qu'un ancien compte Twitch
         * soit repris automatiquement.
         */
        twitchUrl.searchParams.set(
            "force_verify",
            "true"
        );


        /* =================================================
           LOG RENDER
        ================================================== */

        console.info(
            "[Public Auth Login] Redirection OAuth vers Twitch."
        );


        console.info(
            "[Public Auth Login] Callback :",
            redirectUri
        );


        /* =================================================
           REDIRECTION
        ================================================== */

        response.redirect(
            302,
            twitchUrl.toString()
        );


    } catch (
        error
    ) {

        console.error(
            "[Public Auth Login]",
            error
        );


        response
            .status(500)
            .json({

                success:
                    false,

                error:
                    "Impossible de démarrer la connexion Twitch.",

                details:
                    process.env.NODE_ENV ===
                        "development"
                        ? error?.message
                        : undefined

            });
    }
}