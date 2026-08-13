"use strict";

/* =========================================================
   AUTH CALLBACK ADMIN — TWITCH
========================================================= */

import {
    createAdminSession,
    createSessionCookie
} from "../_lib/admin-auth.js";


/* =========================================================
   CONFIGURATION
========================================================= */

const TWITCH_TOKEN_URL =
    "https://id.twitch.tv/oauth2/token";

const TWITCH_USERS_URL =
    "https://api.twitch.tv/helix/users";

const OAUTH_STATE_COOKIE =
    "couaxia_admin_oauth_state";


/* =========================================================
   OUTILS
========================================================= */

/**
 * Récupère la valeur d'un cookie.
 *
 * @param {object} request
 * @param {string} name
 * @returns {string}
 */
function getCookie(
    request,
    name
) {
    const cookieHeader =
        request.headers.cookie || "";

    const cookies =
        cookieHeader
            .split(";")
            .map(
                (cookie) =>
                    cookie.trim()
            );

    const prefix =
        `${name}=`;

    const cookie =
        cookies.find(
            (item) =>
                item.startsWith(
                    prefix
                )
        );

    if (!cookie) {
        return "";
    }

    try {
        return decodeURIComponent(
            cookie.slice(
                prefix.length
            )
        );
    } catch {
        return "";
    }
}


/**
 * Supprime le cookie OAuth temporaire.
 *
 * @returns {string}
 */
function createClearOAuthCookie() {
    return [
        `${OAUTH_STATE_COOKIE}=`,
        "Path=/",
        "HttpOnly",
        "Secure",
        "SameSite=Lax",
        "Max-Age=0"
    ].join("; ");
}


/**
 * Retourne une erreur propre.
 *
 * @param {object} response
 * @param {number} status
 * @param {string} message
 */
function sendError(
    response,
    status,
    message
) {
    response
        .status(status)
        .send(`
            <!DOCTYPE html>

            <html lang="fr">

            <head>

                <meta charset="UTF-8">

                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                >

                <title>
                    Administration Couaxia
                </title>

            </head>

            <body>

                <main>

                    <h1>
                        Connexion impossible
                    </h1>

                    <p>
                        ${message}
                    </p>

                    <p>
                        <a href="/api/admin/auth-login">
                            Réessayer la connexion Twitch
                        </a>
                    </p>

                </main>

            </body>

            </html>
        `);
}


/* =========================================================
   HANDLER
========================================================= */

export default async function handler(
    request,
    response
) {

    /* =====================================================
       MÉTHODE
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
                error:
                    "Méthode non autorisée."
            });

        return;
    }


    /* =====================================================
       CONFIGURATION
    ====================================================== */

    const clientId =
        process.env
            .TWITCH_CLIENT_ID;

    const clientSecret =
        process.env
            .TWITCH_CLIENT_SECRET;

    const redirectUri =
        process.env
            .TWITCH_ADMIN_REDIRECT_URI;

    const adminUserId =
        String(
            process.env
                .TWITCH_ADMIN_USER_ID ||
            ""
        ).trim();


    if (
        !clientId ||
        !clientSecret ||
        !redirectUri ||
        !adminUserId
    ) {
        console.error(
            "[Admin Auth] Variables d'environnement manquantes."
        );

        sendError(
            response,
            500,
            "La configuration de l'administration est incomplète."
        );

        return;
    }


    /* =====================================================
       PARAMÈTRES RENVOYÉS PAR TWITCH
    ====================================================== */

    const code =
        typeof request.query?.code ===
        "string"
            ? request.query.code
            : "";

    const state =
        typeof request.query?.state ===
        "string"
            ? request.query.state
            : "";

    const twitchError =
        typeof request.query?.error ===
        "string"
            ? request.query.error
            : "";


    /*
     * L'utilisateur a refusé
     * l'autorisation Twitch.
     */
    if (twitchError) {
        console.warn(
            "[Admin Auth] Twitch OAuth refusé :",
            twitchError
        );

        sendError(
            response,
            401,
            "La connexion Twitch a été annulée."
        );

        return;
    }


    if (
        !code ||
        !state
    ) {
        sendError(
            response,
            400,
            "Twitch n'a pas renvoyé les informations OAuth attendues."
        );

        return;
    }


    /* =====================================================
       VÉRIFICATION DU STATE
    ====================================================== */

    const expectedState =
        getCookie(
            request,
            OAUTH_STATE_COOKIE
        );


    if (!expectedState) {
        console.warn(
            "[Admin Auth] Cookie OAuth state absent."
        );

        sendError(
            response,
            400,
            "La session de connexion Twitch a expiré. Réessaie."
        );

        return;
    }


    if (
        state !==
        expectedState
    ) {
        console.warn(
            "[Admin Auth] OAuth state invalide."
        );

        sendError(
            response,
            400,
            "La vérification de sécurité OAuth a échoué."
        );

        return;
    }


    try {

        /* =================================================
           ÉCHANGE CODE -> ACCESS TOKEN
        ================================================== */

        const tokenParameters =
            new URLSearchParams();

        tokenParameters.set(
            "client_id",
            clientId
        );

        tokenParameters.set(
            "client_secret",
            clientSecret
        );

        tokenParameters.set(
            "code",
            code
        );

        tokenParameters.set(
            "grant_type",
            "authorization_code"
        );

        tokenParameters.set(
            "redirect_uri",
            redirectUri
        );


        const tokenResponse =
            await fetch(
                TWITCH_TOKEN_URL,
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded"
                    },

                    body:
                        tokenParameters.toString()
                }
            );


        const tokenData =
            await tokenResponse
                .json()
                .catch(
                    () => ({})
                );


        if (!tokenResponse.ok) {
            console.error(
                "[Admin Auth] Twitch token error :",
                tokenResponse.status,
                tokenData
            );

            sendError(
                response,
                502,
                "Twitch a refusé la création du jeton de connexion."
            );

            return;
        }


        const accessToken =
            tokenData?.access_token;


        if (!accessToken) {
            console.error(
                "[Admin Auth] Access token Twitch absent."
            );

            sendError(
                response,
                502,
                "Twitch n'a pas renvoyé de jeton d'accès."
            );

            return;
        }


        /* =================================================
           RÉCUPÉRATION DU COMPTE TWITCH
        ================================================== */

        const userResponse =
            await fetch(
                TWITCH_USERS_URL,
                {
                    method:
                        "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${accessToken}`,

                        "Client-Id":
                            clientId
                    }
                }
            );


        const userData =
            await userResponse
                .json()
                .catch(
                    () => ({})
                );


        if (!userResponse.ok) {
            console.error(
                "[Admin Auth] Twitch users error :",
                userResponse.status,
                userData
            );

            sendError(
                response,
                502,
                "Impossible de récupérer ton compte Twitch."
            );

            return;
        }


        const twitchUser =
            Array.isArray(
                userData?.data
            )
                ? userData.data[0]
                : null;


        if (!twitchUser) {
            console.error(
                "[Admin Auth] Aucun utilisateur Twitch retourné."
            );

            sendError(
                response,
                401,
                "Aucun compte Twitch n'a été trouvé."
            );

            return;
        }


        /* =================================================
           VÉRIFICATION DE L'ADMINISTRATEUR
        ================================================== */

        const twitchUserId =
            String(
                twitchUser.id ||
                ""
            ).trim();


        if (
            twitchUserId !==
            adminUserId
        ) {
            console.warn(
                "[Admin Auth] Tentative d'accès non autorisée.",
                {
                    twitchUserId,
                    login:
                        twitchUser.login
                }
            );

            /*
             * Important :
             * aucune session admin n'est créée.
             */
            sendError(
                response,
                403,
                "Ce compte Twitch n'est pas autorisé à accéder à l'administration."
            );

            return;
        }


        /* =================================================
           CRÉATION SESSION ADMIN
        ================================================== */

        const sessionToken =
            createAdminSession(
                twitchUser
            );


        const sessionCookie =
            createSessionCookie(
                sessionToken
            );


        /* =================================================
           COOKIES
        ================================================== */

        response.setHeader(
            "Set-Cookie",
            [
                sessionCookie,
                createClearOAuthCookie()
            ]
        );


        /* =================================================
           CONNEXION RÉUSSIE
        ================================================== */

        console.info(
            "[Admin Auth] Connexion admin réussie :",
            twitchUser.login
        );


        response.redirect(
            302,
            "/admin/admin.html"
        );

    } catch (error) {

        console.error(
            "[Admin Auth] Erreur inattendue :",
            error
        );


        sendError(
            response,
            500,
            "Une erreur est survenue pendant la connexion à Twitch."
        );
    }
}