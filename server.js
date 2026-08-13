"use strict";

/* =========================================================
   SERVEUR EXPRESS — COUAXIA
   COMPATIBLE RENDER
========================================================= */

import express from "express";
import path from "path";

import {
    fileURLToPath
} from "url";


/* =========================================================
   IMPORTS — API PUBLIQUES
========================================================= */

import galleryHandler
    from "./api/gallery.js";


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


/* =========================================================
   TRUST PROXY — RENDER
========================================================= */

/*
 * Render utilise un proxy HTTPS devant Node.
 *
 * Ceci permet notamment à Express
 * de connaître correctement le protocole HTTPS.
 */

app.set(
    "trust proxy",
    1
);


/* =========================================================
   BODY PARSERS
========================================================= */

/*
 * Une image de 10 Mo devient plus grosse
 * lorsqu'elle est convertie en Base64.
 *
 * On autorise donc jusqu'à 20 Mo
 * pour éviter qu'Express bloque l'upload
 * avant gallery-upload.js.
 */

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

/**
 * Permet de continuer à utiliser les anciens fichiers :
 *
 * export default async function handler(req, res)
 *
 * avec Express.
 *
 * @param {Function} handler
 * @returns {Function}
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

            /*
             * Express prépare déjà :
             *
             * request.query
             * request.body
             *
             * IMPORTANT :
             * on ne réassigne PAS request.query
             * avec Express 5.
             */

            await handler(
                request,
                response
            );


            /*
             * Normalement chaque API envoie
             * elle-même sa réponse.
             *
             * Si ce n'est pas le cas,
             * on continue vers le middleware suivant.
             */

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

/* ---------------------------------------------------------
   LOGIN
--------------------------------------------------------- */

app.get(
    "/api/admin/auth-login",
    useHandler(
        adminAuthLoginHandler
    )
);


/* ---------------------------------------------------------
   CALLBACK TWITCH
--------------------------------------------------------- */

app.get(
    "/api/admin/auth-callback",
    useHandler(
        adminAuthCallbackHandler
    )
);


/* ---------------------------------------------------------
   SESSION ACTUELLE
--------------------------------------------------------- */

app.get(
    "/api/admin/auth-me",
    useHandler(
        adminAuthMeHandler
    )
);


/* ---------------------------------------------------------
   LOGOUT
--------------------------------------------------------- */

app.post(
    "/api/admin/auth-logout",
    useHandler(
        adminAuthLogoutHandler
    )
);


/* =========================================================
   ROUTES HTML
========================================================= */

/*
 * Je mets les routes importantes AVANT express.static().
 *
 * C'est particulièrement important pour /admin,
 * puisque "admin" est aussi le nom d'un dossier.
 */


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

/*
 * Sert :
 *
 * /css/...
 * /js/...
 * /images/...
 * /admin/admin.js
 * /admin/admin.css
 * etc.
 */

app.use(
    express.static(
        __dirname,
        {
            extensions: [
                "html"
            ],

            /*
             * Évite qu'Express transforme automatiquement
             * certains dossiers en redirections.
             */

            redirect:
                false
        }
    )
);


/* =========================================================
   404 API
========================================================= */

/*
 * À placer APRÈS toutes les routes API.
 */

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
                    "Route API introuvable."
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


        /*
         * Erreur de body trop volumineux.
         */

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
                    "Erreur interne du serveur."
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
            "🎮 Games API : /api/admin/games"
        );


        console.log(
            "🎨 Gallery API : /api/admin/gallery"
        );


        console.log(
            "🖼️ Upload API : /api/admin/gallery-upload"
        );


        console.log(
            "========================================="
        );
    }
);