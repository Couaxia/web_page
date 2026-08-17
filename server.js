"use strict";

/* =========================================================
   SERVEUR EXPRESS — COUAXIA
   RENDER
========================================================= */

import express
    from "express";

import path
    from "path";

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
   AUTH PUBLIQUE — TWITCH
========================================================= */

import publicAuthLoginHandler
    from "./api/auth/public-login.js";

import publicAuthCallbackHandler
    from "./api/auth/public-callback.js";

import publicAuthMeHandler
    from "./api/auth/public-me.js";

import publicAuthLogoutHandler
    from "./api/auth/public-logout.js";


/* =========================================================
   IMPORTS — API ADMIN
========================================================= */

import adminGalleryHandler
    from "./api/admin/gallery.js";

import adminGalleryUploadHandler
    from "./api/admin/gallery-upload.js";

import adminGamesHandler
    from "./api/admin/games.js";

/*
 * NOUVEAU :
 * gestion du sondage depuis l'administration.
 */
import adminPollHandler
    from "./api/admin/poll.js";

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

/*
 * Permet d'utiliser les fichiers :
 *
 * export default async function handler(req, res)
 *
 * directement dans Express.
 */
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
   AUTH TWITCH PUBLIQUE
========================================================= */


/* ---------------------------------------------------------
   LOGIN
--------------------------------------------------------- */

app.get(
    "/api/auth/public-login",
    useHandler(
        publicAuthLoginHandler
    )
);


/* ---------------------------------------------------------
   CALLBACK TWITCH
--------------------------------------------------------- */

app.get(
    "/api/auth/public-callback",
    useHandler(
        publicAuthCallbackHandler
    )
);


/* ---------------------------------------------------------
   SESSION UTILISATEUR
--------------------------------------------------------- */

app.get(
    "/api/auth/public-me",
    useHandler(
        publicAuthMeHandler
    )
);


/* ---------------------------------------------------------
   DÉCONNEXION
--------------------------------------------------------- */

app.post(
    "/api/auth/public-logout",
    useHandler(
        publicAuthLogoutHandler
    )
);



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

   GET  = récupérer le sondage
   POST = voter
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
   API ADMIN — SONDAGE

   GET    = charger le sondage dans l'admin
   PUT    = créer / modifier le sondage
   DELETE = réinitialiser le sondage et ses votes
========================================================= */

app.get(
    "/api/admin/poll",
    useHandler(
        adminPollHandler
    )
);


app.put(
    "/api/admin/poll",
    useHandler(
        adminPollHandler
    )
);


app.delete(
    "/api/admin/poll",
    useHandler(
        adminPollHandler
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


        /* =================================================
           FICHIER TROP GROS
        ================================================= */

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


        /* =================================================
           ERREUR GÉNÉRALE
        ================================================= */

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
            "🗳️ Admin Poll : /api/admin/poll"
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