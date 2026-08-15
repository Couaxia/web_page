"use strict";

/* =========================================================
   SERVEUR EXPRESS — COUAXIA
   RENDER
========================================================= */

import express
    from "express";


import path
    from "path";


import crypto
    from "crypto";


import {
    fileURLToPath
} from "url";


/* =========================================================
   IMPORTS — API PUBLIQUES
========================================================= */

import galleryHandler
    from "./api/gallery.js";


import gameHandler
    from "./api/game.js";


import gamesHandler
    from "./api/games.js";


import clipsHandler
    from "./api/clips.js";


import videosHandler
    from "./api/videos.js";


import followersHandler
    from "./api/followers.js";


import streamHandler
    from "./api/stream.js";


import userHandler
    from "./api/user.js";


import twitchStatusHandler
    from "./api/twitch-status.js";


import recommendedStreamersHandler
    from "./api/recommended-streamers.js";


import pollHandler
    from "./api/poll.js";


/* =========================================================
   AUTH PUBLIQUE
========================================================= */

import {
    createPublicUserSession,
    createPublicSessionCookie,
    createPublicLogoutCookie,
    getPublicUserSession,
    getPublicUser,
    getCookie
} from "./api/_lib/public-auth.js";


/* =========================================================
   IMPORTS — API ADMIN
========================================================= */

import adminGalleryHandler
    from "./api/admin/gallery.js";


import adminGalleryUploadHandler
    from "./api/admin/gallery-upload.js";


import adminGamesHandler
    from "./api/admin/games.js";


import adminAuthLoginHandler
    from "./api/admin/auth-login.js";


import adminAuthCallbackHandler
    from "./api/admin/auth-callback.js";


import adminAuthMeHandler
    from "./api/admin/auth-me.js";


import adminAuthLogoutHandler
    from "./api/admin/auth-logout.js";


/* =========================================================
   EXPRESS
========================================================= */

const app =
    express();


/* =========================================================
   CHEMINS
========================================================= */

const __filename =
    fileURLToPath(
        import.meta.url
    );


const __dirname =
    path.dirname(
        __filename
    );


/* =========================================================
   CONFIGURATION
========================================================= */

const PORT =
    Number(
        process.env.PORT
    ) ||
    10000;


const HOST =
    "0.0.0.0";


const TWITCH_CLIENT_ID =
    String(
        process.env.TWITCH_CLIENT_ID ||
        ""
    ).trim();


const TWITCH_CLIENT_SECRET =
    String(
        process.env.TWITCH_CLIENT_SECRET ||
        ""
    ).trim();


const TWITCH_AUTHORIZE_URL =
    "https://id.twitch.tv/oauth2/authorize";


const TWITCH_TOKEN_URL =
    "https://id.twitch.tv/oauth2/token";


const TWITCH_USERS_URL =
    "https://api.twitch.tv/helix/users";


const PUBLIC_OAUTH_STATE_COOKIE =
    "couaxia_public_oauth_state";


/* =========================================================
   TRUST PROXY — RENDER
========================================================= */

app.set(
    "trust proxy",
    1
);


/* =========================================================
   BODY PARSERS
========================================================= */

app.use(
    express.json({
        limit:
            "20mb"
    })
);


app.use(
    express.urlencoded({

        extended:
            true,

        limit:
            "20mb"

    })
);


/* =========================================================
   ADAPTATEUR HANDLER
========================================================= */

function useHandler(
    handler
) {

    return async (
        request,
        response,
        next
    ) => {

        try {

            await handler(
                request,
                response
            );


            if (
                !response.headersSent
            ) {

                next();
            }


        } catch (
            error
        ) {

            next(
                error
            );
        }
    };
}


/* =========================================================
   OUTILS AUTH PUBLIQUE
========================================================= */

function getOrigin(
    request
) {

    const forwardedProto =
        String(
            request.headers[
                "x-forwarded-proto"
            ] ||
            ""
        )
            .split(",")[0]
            .trim();


    const protocol =
        forwardedProto ||
        request.protocol ||
        "https";


    const host =
        request.get(
            "host"
        );


    return (
        `${protocol}://${host}`
    );
}


function getPublicCallbackUrl(
    request
) {

    return (
        getOrigin(
            request
        ) +
        "/api/auth/callback"
    );
}


function createOAuthState() {

    return crypto
        .randomBytes(
            32
        )
        .toString(
            "hex"
        );
}


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


function createOAuthStateCookie(
    state
) {

    return [
        `${PUBLIC_OAUTH_STATE_COOKIE}=${encodeURIComponent(state)}`,
        "Path=/",
        "HttpOnly",
        "Secure",
        "SameSite=Lax",
        "Max-Age=600"
    ].join("; ");
}


function clearOAuthStateCookie() {

    return [
        `${PUBLIC_OAUTH_STATE_COOKIE}=`,
        "Path=/",
        "HttpOnly",
        "Secure",
        "SameSite=Lax",
        "Max-Age=0"
    ].join("; ");
}


/* =========================================================
   TWITCH — ÉCHANGE DU CODE
========================================================= */

async function exchangeTwitchCode(
    code,
    redirectUri
) {

    if (
        !TWITCH_CLIENT_ID ||
        !TWITCH_CLIENT_SECRET
    ) {

        throw new Error(
            "Configuration Twitch incomplète."
        );
    }


    const parameters =
        new URLSearchParams({

            client_id:
                TWITCH_CLIENT_ID,

            client_secret:
                TWITCH_CLIENT_SECRET,

            code:
                String(
                    code
                ),

            grant_type:
                "authorization_code",

            redirect_uri:
                redirectUri

        });


    const response =
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
        await response
            .json()
            .catch(
                () => ({})
            );


    if (
        !response.ok ||
        !data?.access_token
    ) {

        throw new Error(
            data?.message ||
            "Impossible d'obtenir le token Twitch."
        );
    }


    return data;
}


/* =========================================================
   TWITCH — UTILISATEUR CONNECTÉ
========================================================= */

async function getTwitchUserFromToken(
    accessToken
) {

    const response =
        await fetch(
            TWITCH_USERS_URL,
            {

                method:
                    "GET",

                headers: {

                    Authorization:
                        `Bearer ${accessToken}`,

                    "Client-Id":
                        TWITCH_CLIENT_ID

                }

            }
        );


    const data =
        await response
            .json()
            .catch(
                () => ({})
            );


    if (
        !response.ok
    ) {

        throw new Error(
            data?.message ||
            "Impossible de récupérer le compte Twitch."
        );
    }


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
            "Le compte Twitch est introuvable."
        );
    }


    return user;
}


/* =========================================================
   HEALTH CHECK
========================================================= */

app.get(
    "/health",
    (
        request,
        response
    ) => {

        response
            .status(200)
            .json({

                success:
                    true,

                status:
                    "ok",

                service:
                    "couaxia-web"

            });
    }
);


/* =========================================================
   AUTH TWITCH PUBLIQUE — LOGIN
========================================================= */

app.get(
    "/api/auth/login",
    (
        request,
        response
    ) => {

        try {

            if (
                !TWITCH_CLIENT_ID ||
                !TWITCH_CLIENT_SECRET
            ) {

                response
                    .status(500)
                    .send(
                        "Configuration Twitch incomplète."
                    );

                return;
            }


            const state =
                createOAuthState();


            const redirectUri =
                getPublicCallbackUrl(
                    request
                );


            const authorizationUrl =
                new URL(
                    TWITCH_AUTHORIZE_URL
                );


            authorizationUrl
                .searchParams
                .set(
                    "client_id",
                    TWITCH_CLIENT_ID
                );


            authorizationUrl
                .searchParams
                .set(
                    "redirect_uri",
                    redirectUri
                );


            authorizationUrl
                .searchParams
                .set(
                    "response_type",
                    "code"
                );


            authorizationUrl
                .searchParams
                .set(
                    "state",
                    state
                );


            /*
             * Aucun scope particulier n'est nécessaire
             * pour connaître l'identité du compte.
             */
            authorizationUrl
                .searchParams
                .set(
                    "scope",
                    ""
                );


            response.setHeader(
                "Set-Cookie",
                createOAuthStateCookie(
                    state
                )
            );


            response.redirect(
                authorizationUrl.toString()
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
                .send(
                    "Impossible de démarrer la connexion Twitch."
                );
        }
    }
);


/* =========================================================
   AUTH TWITCH PUBLIQUE — CALLBACK
========================================================= */

app.get(
    "/api/auth/callback",
    async (
        request,
        response
    ) => {

        try {

            const {
                code,
                state,
                error,
                error_description:
                    errorDescription
            } =
                request.query;


            if (
                error
            ) {

                console.error(
                    "[Public Auth Twitch]",
                    error,
                    errorDescription
                );


                response.redirect(
                    "/games.html?login=refused"
                );

                return;
            }


            if (
                !code ||
                !state
            ) {

                response
                    .status(400)
                    .send(
                        "Callback Twitch invalide."
                    );

                return;
            }


            const savedState =
                getCookie(
                    request,
                    PUBLIC_OAUTH_STATE_COOKIE
                );


            if (
                !savedState ||
                !safeStringEquals(
                    state,
                    savedState
                )
            ) {

                response
                    .status(400)
                    .send(
                        "La vérification de sécurité OAuth a échoué."
                    );

                return;
            }


            const redirectUri =
                getPublicCallbackUrl(
                    request
                );


            const tokenData =
                await exchangeTwitchCode(
                    code,
                    redirectUri
                );


            const twitchUser =
                await getTwitchUserFromToken(
                    tokenData.access_token
                );


            const sessionToken =
                createPublicUserSession(
                    twitchUser
                );


            response.setHeader(
                "Set-Cookie",
                [
                    clearOAuthStateCookie(),
                    createPublicSessionCookie(
                        sessionToken
                    )
                ]
            );


            response.redirect(
                "/games.html?login=success"
            );


        } catch (
            error
        ) {

            console.error(
                "[Public Auth Callback]",
                error
            );


            response.redirect(
                "/games.html?login=error"
            );
        }
    }
);


/* =========================================================
   AUTH TWITCH PUBLIQUE — MOI
========================================================= */

app.get(
    "/api/auth/me",
    (
        request,
        response
    ) => {

        const session =
            getPublicUserSession(
                request
            );


        if (
            !session
        ) {

            response
                .status(200)
                .json({

                    authenticated:
                        false,

                    user:
                        null,

                    loginUrl:
                        "/api/auth/login"

                });


            return;
        }


        response
            .status(200)
            .json({

                authenticated:
                    true,

                user:
                    getPublicUser(
                        session
                    )

            });
    }
);


/* =========================================================
   AUTH TWITCH PUBLIQUE — LOGOUT
========================================================= */

app.post(
    "/api/auth/logout",
    (
        request,
        response
    ) => {

        response.setHeader(
            "Set-Cookie",
            createPublicLogoutCookie()
        );


        response
            .status(200)
            .json({

                success:
                    true,

                message:
                    "Déconnexion réussie."

            });
    }
);


/* =========================================================
   API PUBLIQUE — GALERIE
========================================================= */

app.get(
    "/api/gallery",
    useHandler(
        galleryHandler
    )
);


/* =========================================================
   API PUBLIQUE — UN JEU TWITCH
========================================================= */

app.get(
    "/api/game",
    useHandler(
        gameHandler
    )
);


/* =========================================================
   API PUBLIQUE — BIBLIOTHÈQUE DE JEUX
========================================================= */

app.get(
    "/api/games",
    useHandler(
        gamesHandler
    )
);


/* =========================================================
   API PUBLIQUE — CLIPS
========================================================= */

app.get(
    "/api/clips",
    useHandler(
        clipsHandler
    )
);


/* =========================================================
   API PUBLIQUE — VIDÉOS
========================================================= */

app.get(
    "/api/videos",
    useHandler(
        videosHandler
    )
);


/* =========================================================
   API PUBLIQUE — FOLLOWERS
========================================================= */

app.get(
    "/api/followers",
    useHandler(
        followersHandler
    )
);


/* =========================================================
   API PUBLIQUE — STREAM
========================================================= */

app.get(
    "/api/stream",
    useHandler(
        streamHandler
    )
);


/* =========================================================
   API PUBLIQUE — UTILISATEUR TWITCH
========================================================= */

app.get(
    "/api/user",
    useHandler(
        userHandler
    )
);


/* =========================================================
   API PUBLIQUE — STATUT TWITCH GLOBAL
========================================================= */

app.get(
    "/api/twitch-status",
    useHandler(
        twitchStatusHandler
    )
);


/* =========================================================
   API PUBLIQUE — STREAMERS RECOMMANDÉS
========================================================= */

app.get(
    "/api/recommended-streamers",
    useHandler(
        recommendedStreamersHandler
    )
);


/* =========================================================
   API PUBLIQUE — SONDAGE
========================================================= */

app.get(
    "/api/poll",
    useHandler(
        pollHandler
    )
);


app.post(
    "/api/poll",
    useHandler(
        pollHandler
    )
);


/* =========================================================
   API ADMIN — GALERIE
========================================================= */

app.get(
    "/api/admin/gallery",
    useHandler(
        adminGalleryHandler
    )
);


app.post(
    "/api/admin/gallery",
    useHandler(
        adminGalleryHandler
    )
);


app.put(
    "/api/admin/gallery",
    useHandler(
        adminGalleryHandler
    )
);


app.delete(
    "/api/admin/gallery",
    useHandler(
        adminGalleryHandler
    )
);


/* =========================================================
   API ADMIN — UPLOAD GALERIE
========================================================= */

app.post(
    "/api/admin/gallery-upload",
    useHandler(
        adminGalleryUploadHandler
    )
);


/* =========================================================
   API ADMIN — JEUX
========================================================= */

app.get(
    "/api/admin/games",
    useHandler(
        adminGamesHandler
    )
);


app.post(
    "/api/admin/games",
    useHandler(
        adminGamesHandler
    )
);


app.put(
    "/api/admin/games",
    useHandler(
        adminGamesHandler
    )
);


app.delete(
    "/api/admin/games",
    useHandler(
        adminGamesHandler
    )
);


/* =========================================================
   API ADMIN — AUTH TWITCH
========================================================= */

app.get(
    "/api/admin/auth-login",
    useHandler(
        adminAuthLoginHandler
    )
);


app.get(
    "/api/admin/auth-callback",
    useHandler(
        adminAuthCallbackHandler
    )
);


app.get(
    "/api/admin/auth-me",
    useHandler(
        adminAuthMeHandler
    )
);


app.post(
    "/api/admin/auth-logout",
    useHandler(
        adminAuthLogoutHandler
    )
);


/* =========================================================
   ROUTES HTML
========================================================= */

/* =========================================================
   ACCUEIL
========================================================= */

app.get(
    "/",
    (
        request,
        response
    ) => {

        response.sendFile(
            path.join(
                __dirname,
                "accueil.html"
            )
        );
    }
);


app.get(
    "/accueil",
    (
        request,
        response
    ) => {

        response.sendFile(
            path.join(
                __dirname,
                "accueil.html"
            )
        );
    }
);


app.get(
    "/accueil.html",
    (
        request,
        response
    ) => {

        response.sendFile(
            path.join(
                __dirname,
                "accueil.html"
            )
        );
    }
);


/* =========================================================
   CRÉDITS
========================================================= */

app.get(
    "/credits",
    (
        request,
        response
    ) => {

        response.sendFile(
            path.join(
                __dirname,
                "credits.html"
            )
        );
    }
);


app.get(
    "/credits.html",
    (
        request,
        response
    ) => {

        response.sendFile(
            path.join(
                __dirname,
                "credits.html"
            )
        );
    }
);


/* =========================================================
   JEUX
========================================================= */

app.get(
    "/games",
    (
        request,
        response
    ) => {

        response.sendFile(
            path.join(
                __dirname,
                "games.html"
            )
        );
    }
);


app.get(
    "/games.html",
    (
        request,
        response
    ) => {

        response.sendFile(
            path.join(
                __dirname,
                "games.html"
            )
        );
    }
);


/* =========================================================
   À PROPOS
========================================================= */

app.get(
    "/a-propos",
    (
        request,
        response
    ) => {

        response.sendFile(
            path.join(
                __dirname,
                "a-propos.html"
            )
        );
    }
);


app.get(
    "/a-propos.html",
    (
        request,
        response
    ) => {

        response.sendFile(
            path.join(
                __dirname,
                "a-propos.html"
            )
        );
    }
);


/* =========================================================
   ADMIN
========================================================= */

app.get(
    [
        "/admin",
        "/admin/"
    ],
    (
        request,
        response
    ) => {

        response.sendFile(
            path.join(
                __dirname,
                "admin",
                "admin.html"
            )
        );
    }
);


/* =========================================================
   FICHIERS STATIQUES
========================================================= */

app.use(
    express.static(
        __dirname,
        {

            extensions: [
                "html"
            ],

            redirect:
                false

        }
    )
);


/* =========================================================
   404 API
========================================================= */

app.use(
    "/api",
    (
        request,
        response
    ) => {

        response
            .status(404)
            .json({

                success:
                    false,

                error:
                    "Route API introuvable.",

                path:
                    request.originalUrl

            });
    }
);


/* =========================================================
   404 SITE
========================================================= */

app.use(
    (
        request,
        response
    ) => {

        response
            .status(404)
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
                            Page introuvable | Couaxia
                        </title>

                    </head>

                    <body>

                        <main>

                            <h1>
                                🐙 Page introuvable
                            </h1>

                            <p>
                                Cette page n'existe pas.
                            </p>

                            <a href="/">
                                Retour à l'accueil
                            </a>

                        </main>

                    </body>

                </html>
            `);
    }
);


/* =========================================================
   ERREURS SERVEUR
========================================================= */

app.use(
    (
        error,
        request,
        response,
        next
    ) => {

        console.error(
            "[Serveur Couaxia]",
            error
        );


        if (
            response.headersSent
        ) {

            return next(
                error
            );
        }


        if (
            error?.type ===
            "entity.too.large"
        ) {

            response
                .status(413)
                .json({

                    success:
                        false,

                    error:
                        "Le fichier envoyé est trop volumineux."

                });


            return;
        }


        response
            .status(500)
            .json({

                success:
                    false,

                error:
                    "Erreur interne du serveur.",

                details:
                    process.env.NODE_ENV ===
                    "development"
                        ? error?.message
                        : undefined

            });
    }
);


/* =========================================================
   DÉMARRAGE
========================================================= */

app.listen(
    PORT,
    HOST,
    () => {

        console.log(
            "========================================="
        );


        console.log(
            "🐙 Couaxia Web démarré"
        );


        console.log(
            `🌐 Port : ${PORT}`
        );


        console.log(
            "💚 Health : /health"
        );


        console.log(
            "🎨 Gallery : /api/gallery"
        );


        console.log(
            "🎮 Games : /api/games"
        );


        console.log(
            "🎮 Twitch Game : /api/game"
        );


        console.log(
            "📺 Twitch Status : /api/twitch-status"
        );


        console.log(
            "🎬 Clips : /api/clips"
        );


        console.log(
            "📼 Videos : /api/videos"
        );


        console.log(
            "👥 Followers : /api/followers"
        );


        console.log(
            "🔴 Stream : /api/stream"
        );


        console.log(
            "👤 Twitch User : /api/user"
        );


        console.log(
            "💜 Recommended : /api/recommended-streamers"
        );


        console.log(
            "🗳️ Poll : /api/poll"
        );


        console.log(
            "🔑 Public Twitch Login : /api/auth/login"
        );


        console.log(
            "👤 Public Twitch Me : /api/auth/me"
        );


        console.log(
            "🔐 Admin Games : /api/admin/games"
        );


        console.log(
            "🔐 Admin Gallery : /api/admin/gallery"
        );


        console.log(
            "🖼️ Upload : /api/admin/gallery-upload"
        );


        console.log(
            "========================================="
        );
    }
);