"use strict";

/* =========================================================
   AUTH LOGIN ADMIN — TWITCH
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
    "couaxia_admin_oauth_state";

const OAUTH_STATE_DURATION_SECONDS =
    10 * 60;


/* =========================================================
   OUTILS
========================================================= */

/**
 * Récupère l'URL de redirection OAuth
 * configurée dans Render.
 *
 * @returns {string}
 */
function getAdminRedirectUri() {

    const redirectUri =
        process.env
            .TWITCH_ADMIN_REDIRECT_URI
            ?.trim();


    if (
        !redirectUri
    ) {

        throw new Error(
            "TWITCH_ADMIN_REDIRECT_URI est absente des variables d'environnement."
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
 * le state OAuth.
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
            getAdminRedirectUri();


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
         * Force Twitch à afficher l'écran
         * d'autorisation.
         */
        twitchUrl.searchParams.set(
            "force_verify",
            "true"
        );


        /* =================================================
           LOG UTILE POUR RENDER
        ================================================== */

        console.info(
            "[Admin Auth Login] Redirection OAuth vers Twitch."
        );


        console.info(
            "[Admin Auth Login] Callback :",
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
            "[Admin Auth Login]",
            error
        );


        response
            .status(500)
            .json({
                success:
                    false,

                error:
                    "Impossible de démarrer la connexion administrateur Twitch.",

                details:
                    process.env.NODE_ENV ===
                        "development"
                        ? error?.message
                        : undefined
            });
    }
}