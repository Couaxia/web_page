"use strict";

/* =========================================================
   API PUBLIQUE — JEUX
   COUAXIA
========================================================= */

import {
    supabaseAdmin
} from "./_lib/supabase.js";


/* =========================================================
   OUTILS
========================================================= */

function normalizeText(
    value
) {

    return String(
        value ??
        ""
    ).trim();
}


function normalizeTags(
    value
) {

    if (
        Array.isArray(
            value
        )
    ) {

        return value
            .map(
                tag =>
                    normalizeText(
                        tag
                    )
            )
            .filter(
                Boolean
            );
    }


    if (
        typeof value ===
        "string"
    ) {

        return value
            .split(
                /[,;]+/
            )
            .map(
                tag =>
                    normalizeText(
                        tag
                    )
            )
            .filter(
                Boolean
            );
    }


    return [];
}


/* =========================================================
   FORMAT JEU
========================================================= */

function formatGame(
    game
) {

    return {

        /* =================================================
           ID BASE
        ================================================= */

        id:
            game?.id ??
            null,


        /* =================================================
           TWITCH
        ================================================= */

        twitchGameId:
            normalizeText(
                game?.twitch_game_id ??
                game?.twitchGameId
            ) ||
            null,


        twitchName:
            normalizeText(
                game?.twitch_name ??
                game?.twitchName ??
                game?.name
            ),


        /*
         * On renvoie également "name"
         * pour simplifier games.js.
         */
        name:
            normalizeText(
                game?.twitch_name ??
                game?.twitchName ??
                game?.name
            ),


        boxArtUrl:
            normalizeText(
                game?.box_art_url ??
                game?.boxArtUrl
            ),


        /* =================================================
           INFORMATIONS DU JEU
        ================================================= */

        status:
            normalizeText(
                game?.status
            )
                .toLowerCase() ||
            "backlog",


        tags:
            normalizeTags(
                game?.tags
            ),


        description:
            normalizeText(
                game?.description
            ),


        rating:
            game?.rating ??
            null,


        /* =================================================
           YOUTUBE
        ================================================= */

        youtubePlaylist:
            normalizeText(
                game?.youtube_playlist ??
                game?.youtubePlaylist
            ),


        /* =================================================
           SONDAGE
        ================================================= */

        pollEnabled:
            Boolean(
                game?.poll_enabled ??
                game?.pollEnabled
            ),


        /* =================================================
           DATES
        ================================================= */

        createdAt:
            game?.created_at ??
            game?.createdAt ??
            null,


        updatedAt:
            game?.updated_at ??
            game?.updatedAt ??
            null

    };
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
        "no-store, no-cache, must-revalidate, max-age=0"
    );


    response.setHeader(
        "Pragma",
        "no-cache"
    );


    response.setHeader(
        "Expires",
        "0"
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


    /* =====================================================
       CHARGEMENT SUPABASE
    ====================================================== */

    try {

        console.info(
            "[Public Games] Chargement depuis Supabase..."
        );


        /*
         * IMPORTANT :
         *
         * On utilise select("*") afin qu'une colonne optionnelle
         * absente ne fasse pas planter toute l'API.
         */
        const {
            data,
            error
        } =
            await supabaseAdmin
                .from(
                    "games"
                )
                .select(
                    "*"
                )
                .order(
                    "created_at",
                    {
                        ascending:
                            false
                    }
                );


        /* =================================================
           ERREUR SUPABASE
        ================================================= */

        if (
            error
        ) {

            console.error(
                "[Public Games] Erreur Supabase :",
                error
            );


            response
                .status(500)
                .json({

                    success:
                        false,

                    error:
                        "Impossible de récupérer les jeux.",

                    /*
                     * Je te laisse volontairement les détails
                     * pour le moment afin de pouvoir déboguer.
                     */
                    details:
                        error?.message ??
                        null,

                    code:
                        error?.code ??
                        null

                });


            return;
        }


        /* =================================================
           DONNÉES
        ================================================= */

        const rawGames =
            Array.isArray(
                data
            )
                ? data
                : [];


        const games =
            rawGames
                .map(
                    formatGame
                )
                .filter(
                    game =>
                        Boolean(
                            game.id ||
                            game.twitchGameId ||
                            game.name
                        )
                );


        console.info(
            "[Public Games] Jeux Supabase :",
            rawGames.length
        );


        console.info(
            "[Public Games] Jeux formatés :",
            games.length
        );


        /* =================================================
           RÉPONSE
        ================================================= */

        response
            .status(200)
            .json({

                success:
                    true,

                count:
                    games.length,

                games

            });


    } catch (
        error
    ) {

        console.error(
            "[Public Games] Erreur inattendue :",
            error
        );


        if (
            response.headersSent
        ) {

            return;
        }


        response
            .status(500)
            .json({

                success:
                    false,

                error:
                    "Erreur interne lors du chargement des jeux.",

                details:
                    error?.message ??
                    null

            });
    }
}