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
   TRUST PROXY
========================================================= */

/*
 * Render termine le HTTPS côté proxy.
 *
 * trust proxy permet notamment à Express
 * de comprendre correctement les requêtes
 * passant par Render.
 */

app.set(
    "trust proxy",
    1
);


/* =========================================================
   BODY PARSERS
========================================================= */

/*
 * gallery-upload.js envoie actuellement
 * les images en Base64.
 *
 * On autorise donc un body assez grand.
 */

app.use(
    express.json({
        limit:
            "15mb"
    })
);

app.use(
    express.urlencoded({
        extended:
            true,

        limit:
            "15mb"
    })
);


/* =========================================================
   ADAPTATEUR VERCEL -> EXPRESS
========================================================= */

/*
 * Tes fichiers API ont été écrits comme :
 *
 * export default async function handler(req, res)
 *
 * Ce format reste utilisable avec Express.
 *
 * Cette fonction ajoute simplement quelques propriétés
 * pratiques utilisées par les anciennes fonctions Vercel.
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
             * Vercel fournissait parfois req.query.
             * Express le fournit déjà.
             */

            request.query =
                request.query ||
                {};


            /*
             * Certaines fonctions peuvent lire req.body.
             * Express l'a déjà préparé.
             */

            request.body =
                request.body ||
                {};


            await handler(
                request,
                response
            );


            /*
             * Si le handler n'a envoyé aucune réponse,
             * on laisse Express poursuivre.
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
                status:
                    "ok",

                service:
                    "couaxia-web"
            });
    }
);


/* =========================================================
   API PUBLIQUE
========================================================= */

/*
 * Galerie publique.
 */

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

/*
 * Connexion Twitch.
 */

app.get(
    "/api/admin/auth-login",
    useHandler(
        adminAuthLoginHandler
    )
);


/*
 * Retour OAuth Twitch.
 */

app.get(
    "/api/admin/auth-callback",
    useHandler(
        adminAuthCallbackHandler
    )
);


/*
 * Session admin actuelle.
 */

app.get(
    "/api/admin/auth-me",
    useHandler(
        adminAuthMeHandler
    )
);


/*
 * Déconnexion.
 */

app.post(
    "/api/admin/auth-logout",
    useHandler(
        adminAuthLogoutHandler
    )
);


/* =========================================================
   FICHIERS STATIQUES
========================================================= */

/*
 * Sert automatiquement :
 *
 * /css/...
 * /js/...
 * /images/...
 * /admin/...
 * etc.
 */

app.use(
    express.static(
        __dirname,
        {
            extensions: [
                "html"
            ]
        }
    )
);


/* =========================================================
   PAGE D'ACCUEIL
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


/* =========================================================
   ROUTES HTML PROPRES
========================================================= */

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
   ADMIN HTML
========================================================= */

app.get(
    "/admin",
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
                error:
                    "Route API introuvable."
            });
    }
);


/* =========================================================
   ERREUR SERVEUR
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


        response
            .status(500)
            .json({
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
            `🌐 http://${HOST}:${PORT}`
        );

        console.log(
            `💚 Health : /health`
        );

        console.log(
            "========================================="
        );
    }
);