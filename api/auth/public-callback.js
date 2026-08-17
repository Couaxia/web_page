"use strict";

/* =========================================================
   AUTH CALLBACK PUBLIC — TWITCH
   COUAXIA / RENDER
========================================================= */

import crypto from "node:crypto";

import {
    getTwitchClientId,
    getTwitchClientSecret
} from "../auth.js";

import {
    createPublicUserSession,
    createPublicSessionCookie,
    getCookie
} from "../_lib/public-auth.js";


/* =========================================================
   CONFIGURATION
========================================================= */

const TWITCH_TOKEN_URL =
    "https://id.twitch.tv/oauth2/token";


const TWITCH_USERS_URL =
    "https://api.twitch.tv/helix/users";


const OAUTH_STATE_COOKIE =
    "couaxia_public_oauth_state";


/* =========================================================
   URL DE REDIRECTION TWITCH
========================================================= */

/**
 * Retourne exactement l'URL publique
 * configurée dans Render.
 *
 * Cette URL doit être identique à celle
 * déclarée dans Twitch Developer Console.
 *
 * Render :
 *
 * TWITCH_PUBLIC_REDIRECT_URI=
 * https://couaxia.onrender.com/api/auth/callback
 *
 * @returns {string}
 */
function getPublicRedirectUri() {

    const redirectUri =
        String(
            process.env
                .TWITCH_PUBLIC_REDIRECT_URI ||
            ""
        )
            .trim();


    if (
        !redirectUri
    ) {

        throw new Error(
            "TWITCH_PUBLIC_REDIRECT_URI est absente des variables d'environnement."
        );
    }


    return redirectUri;
}


/* =========================================================
   ORIGINE PUBLIQUE
========================================================= */

/**
 * Retourne l'origine du site.
 *
 * Exemple :
 *
 * https://couaxia.onrender.com
 *
 * @returns {string}
 */
function getPublicOrigin() {

    const explicitOrigin =
        String(
            process.env.PUBLIC_BASE_URL ||
            process.env.APP_URL ||
            ""
        )
            .trim()
            .replace(
                /\/+$/,
                ""
            );


    if (
        explicitOrigin
    ) {

        return explicitOrigin;
    }


    /*
     * Si aucune variable supplémentaire
     * n'est configurée, on récupère simplement
     * l'origine depuis TWITCH_PUBLIC_REDIRECT_URI.
     */

    const redirectUri =
        getPublicRedirectUri();


    return new URL(
        redirectUri
    ).origin;
}


/* =========================================================
   SUPPRESSION COOKIE OAUTH STATE
========================================================= */

/**
 * Supprime le cookie temporaire utilisé
 * pendant la connexion Twitch.
 *
 * @returns {string}
 */
function clearOAuthStateCookie() {

    return [
        `${OAUTH_STATE_COOKIE}=`,
        "Path=/",
        "HttpOnly",
        "Secure",
        "SameSite=Lax",
        "Max-Age=0"
    ].join(
        "; "
    );
}


/* =========================================================
   COMPARAISON SÉCURISÉE DU STATE
========================================================= */

/**
 * Compare deux valeurs sans exposer
 * directement leur contenu.
 *
 * @param {string} valueA
 * @param {string} valueB
 * @returns {boolean}
 */
function safeStringEquals(
    valueA,
    valueB
) {

    const bufferA =
        Buffer.from(
            String(
                valueA ||
                ""
            )
        );


    const bufferB =
        Buffer.from(
            String(
                valueB ||
                ""
            )
        );


    if (
        bufferA.length !==
        bufferB.length
    ) {

        return false;
    }


    return crypto.timingSafeEqual(
        bufferA,
        bufferB
    );
}


/* =========================================================
   ÉCHANGE CODE -> TOKEN TWITCH
========================================================= */

/**
 * Échange le code OAuth temporaire
 * contre un token Twitch.
 *
 * @param {string} code
 * @returns {Promise<object>}
 */
async function exchangeCodeForToken(
    code
) {

    /* =====================================================
       IDENTIFIANTS TWITCH
    ====================================================== */

    const clientId =
        getTwitchClientId();


    const clientSecret =
        getTwitchClientSecret();


    const redirectUri =
        getPublicRedirectUri();


    /* =====================================================
       PARAMÈTRES
    ====================================================== */

    const parameters =
        new URLSearchParams();


    parameters.set(
        "client_id",
        clientId
    );


    parameters.set(
        "client_secret",
        clientSecret
    );


    parameters.set(
        "code",
        String(
            code
        )
    );


    parameters.set(
        "grant_type",
        "authorization_code"
    );


    /*
     * IMPORTANT :
     *
     * Cette redirect_uri doit être
     * STRICTEMENT identique à celle
     * utilisée dans public-login.js.
     */

    parameters.set(
        "redirect_uri",
        redirectUri
    );


    /* =====================================================
       TWITCH
    ====================================================== */

    const twitchResponse =
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
                    parameters.toString()

            }
        );


    const data =
        await twitchResponse
            .json()
            .catch(
                () => ({})
            );


    /* =====================================================
       ERREUR TWITCH
    ====================================================== */

    if (
        !twitchResponse.ok
    ) {

        console.error(
            "[Public Auth Callback] Twitch token :",
            data
        );


        throw new Error(
            data?.message ||
            "Impossible d'obtenir le token Twitch."
        );
    }


    if (
        !data?.access_token
    ) {

        throw new Error(
            "Twitch n'a pas retourné de token d'accès."
        );
    }


    return data;
}


/* =========================================================
   RÉCUPÉRATION UTILISATEUR TWITCH
========================================================= */

/**
 * Récupère le compte Twitch correspondant
 * au token utilisateur.
 *
 * @param {string} accessToken
 * @returns {Promise<object>}
 */
async function getTwitchUser(
    accessToken
) {

    const clientId =
        getTwitchClientId();


    /* =====================================================
       APPEL TWITCH
    ====================================================== */

    const twitchResponse =
        await fetch(
            TWITCH_USERS_URL,
            {

                method:
                    "GET",

                headers: {

                    "Client-Id":
                        clientId,

                    Authorization:
                        `Bearer ${accessToken}`

                }

            }
        );


    const data =
        await twitchResponse
            .json()
            .catch(
                () => ({})
            );


    /* =====================================================
       ERREUR
    ====================================================== */

    if (
        !twitchResponse.ok
    ) {

        console.error(
            "[Public Auth Callback] Twitch user :",
            data
        );


        throw new Error(
            data?.message ||
            "Impossible de récupérer le compte Twitch."
        );
    }


    /* =====================================================
       UTILISATEUR
    ====================================================== */

    const user =
        Array.isArray(
            data?.data
        )
            ? data.data[0]
            : null;


    if (
        !user?.id
    ) {

        throw new Error(
            "Compte Twitch introuvable."
        );
    }


    return user;
}


/* =========================================================
   ÉCHAPPEMENT HTML
========================================================= */

/**
 * Empêche l'injection de HTML
 * dans la page d'erreur.
 *
 * @param {unknown} value
 * @returns {string}
 */
function escapeHtml(
    value
) {

    return String(
        value ||
        ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}


/* =========================================================
   PAGE D'ERREUR
========================================================= */

/**
 * Affiche une page d'erreur OAuth publique.
 *
 * @param {object} response
 * @param {string} message
 */
function sendErrorPage(
    response,
    message
) {

    const origin =
        getPublicOrigin();


    response
        .status(400)
        .send(`
<!DOCTYPE html>

<html lang="fr">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <meta
        name="robots"
        content="noindex,nofollow"
    >

    <title>
        Connexion Twitch impossible
    </title>

    <style>

        * {
            box-sizing: border-box;
        }

        html,
        body {
            margin: 0;
            min-height: 100%;
        }

        body {
            min-height: 100vh;

            display: grid;

            place-items: center;

            padding: 24px;

            font-family:
                Arial,
                Helvetica,
                sans-serif;

            color:
                #ffffff;

            background:
                linear-gradient(
                    145deg,
                    #12031f,
                    #310842
                );
        }

        .auth-error {
            width:
                min(
                    560px,
                    100%
                );

            padding:
                32px;

            text-align:
                center;

            border:
                2px solid
                #22f2ef;

            border-radius:
                24px;

            background:
                rgba(
                    43,
                    8,
                    61,
                    0.96
                );

            box-shadow:
                0 20px 60px
                rgba(
                    0,
                    0,
                    0,
                    0.4
                );
        }

        h1 {
            margin:
                0
                0
                16px;

            color:
                #f1c7ff;
        }

        p {
            margin:
                0;

            line-height:
                1.6;

            color:
                #e2d3e8;
        }

        a {
            display:
                inline-flex;

            align-items:
                center;

            justify-content:
                center;

            margin-top:
                22px;

            padding:
                13px
                20px;

            color:
                #ffffff;

            font-weight:
                800;

            text-decoration:
                none;

            border-radius:
                14px;

            background:
                linear-gradient(
                    135deg,
                    #8d00bd,
                    #d300d6
                );

            transition:
                transform
                0.2s
                ease;
        }

        a:hover {
            transform:
                translateY(-2px);
        }

    </style>

</head>

<body>

    <main class="auth-error">

        <h1>
            Connexion impossible
        </h1>

        <p>
            ${escapeHtml(
                message ||
                "La connexion Twitch a échoué."
            )}
        </p>

        <a href="${origin}/api/auth/public-login">
            Se connecter avec Twitch
        </a>

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
       CACHE
    ====================================================== */

    response.setHeader(
        "Cache-Control",
        "no-store, max-age=0"
    );


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

                success:
                    false,

                error:
                    "Méthode non autorisée."

            });


        return;
    }


    try {

        /* =================================================
           ERREUR RENVOYÉE PAR TWITCH
        ================================================== */

        const oauthError =
            String(
                request.query?.error ||
                ""
            )
                .trim();


        const oauthErrorDescription =
            String(
                request.query
                    ?.error_description ||
                ""
            )
                .trim();


        if (
            oauthError
        ) {

            console.error(
                "[Public Auth Callback] Twitch OAuth :",
                oauthError,
                oauthErrorDescription
            );


            /*
             * On supprime l'ancien state OAuth,
             * même si Twitch a refusé la connexion.
             */

            response.setHeader(
                "Set-Cookie",
                clearOAuthStateCookie()
            );


            sendErrorPage(
                response,
                oauthErrorDescription ||
                "La connexion Twitch a été annulée."
            );


            return;
        }


        /* =================================================
           CODE + STATE
        ================================================== */

        const code =
            String(
                request.query?.code ||
                ""
            )
                .trim();


        const state =
            String(
                request.query?.state ||
                ""
            )
                .trim();


        if (
            !code ||
            !state
        ) {

            console.error(
                "[Public Auth Callback] Code ou state manquant."
            );


            sendErrorPage(
                response,
                "Twitch n'a pas renvoyé les informations OAuth attendues."
            );


            return;
        }


        /* =================================================
           COOKIE STATE
        ================================================== */

        /*
         * IMPORTANT :
         *
         * On utilise maintenant getCookie()
         * provenant du même système public-auth
         * que le reste du site.
         */

        const expectedState =
            String(
                getCookie(
                    request,
                    OAUTH_STATE_COOKIE
                ) ||
                ""
            )
                .trim();


        if (
            !expectedState
        ) {

            console.error(
                "[Public Auth Callback] Cookie OAuth state absent."
            );


            sendErrorPage(
                response,
                "La session de connexion Twitch a expiré. Réessaie."
            );


            return;
        }


        /* =================================================
           VÉRIFICATION STATE
        ================================================== */

        if (
            !safeStringEquals(
                state,
                expectedState
            )
        ) {

            console.error(
                "[Public Auth Callback] State OAuth invalide."
            );


            response.setHeader(
                "Set-Cookie",
                clearOAuthStateCookie()
            );


            sendErrorPage(
                response,
                "La vérification de sécurité Twitch a échoué. Réessaie."
            );


            return;
        }


        /* =================================================
           TOKEN TWITCH
        ================================================== */

        const tokenData =
            await exchangeCodeForToken(
                code
            );


        /* =================================================
           UTILISATEUR TWITCH
        ================================================== */

        const twitchUser =
            await getTwitchUser(
                tokenData.access_token
            );


        console.info(
            "[Public Auth Callback] Twitch connecté :",
            twitchUser.login
        );


        console.info(
            "[Public Auth Callback] Twitch ID :",
            twitchUser.id
        );


        /* =================================================
           SESSION PUBLIQUE
        ================================================== */

        /*
         * IMPORTANT :
         *
         * On n'invente PLUS notre propre format
         * de session ici.
         *
         * On utilise exactement le même système
         * que :
         *
         * - api/poll.js
         * - public-me.js
         * - public-logout.js
         *
         * Cela permet à getPublicUserSession()
         * de reconnaître immédiatement
         * le visiteur connecté.
         */

        const sessionToken =
            createPublicUserSession(
                twitchUser
            );


        /* =================================================
           COOKIES
        ================================================== */

        /*
         * 1. suppression du cookie OAuth temporaire
         * 2. création du vrai cookie utilisateur public
         */

        response.setHeader(
            "Set-Cookie",
            [

                clearOAuthStateCookie(),

                createPublicSessionCookie(
                    sessionToken
                )

            ]
        );


        /* =================================================
           RETOUR SUR LA PAGE JEUX
        ================================================== */

        const origin =
            getPublicOrigin();


        console.info(
            "[Public Auth Callback] Connexion réussie."
        );


        console.info(
            "[Public Auth Callback] Retour vers :",
            `${origin}/games.html?login=success`
        );


        response.redirect(
            302,
            `${origin}/games.html?login=success`
        );


    } catch (
        error
    ) {

        console.error(
            "[Public Auth Callback]",
            error
        );


        /*
         * Nettoyage du state OAuth
         * en cas d'erreur.
         */

        try {

            response.setHeader(
                "Set-Cookie",
                clearOAuthStateCookie()
            );

        } catch (
            cookieError
        ) {

            console.error(
                "[Public Auth Callback] Nettoyage cookie :",
                cookieError
            );
        }


        sendErrorPage(
            response,
            process.env.NODE_ENV ===
                "development"
                ? (
                    error?.message ||
                    "Erreur interne."
                )
                : "Impossible de terminer la connexion Twitch."
        );
    }
}