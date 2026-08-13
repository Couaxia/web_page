"use strict";

/* =========================================================
   API ADMIN — JEUX
   COUAXIA
========================================================= */

import {
    requireAdmin
} from "../_lib/admin-auth.js";

import {
    supabaseAdmin
} from "../_lib/supabase.js";

import {
    twitchFetch
} from "../auth.js";


/* =========================================================
   CONFIGURATION
========================================================= */

const ALLOWED_STATUSES =
    new Set([
        "current",
        "regular",
        "backlog",
        "paused",
        "finished"
    ]);


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


function normalizeNullableText(
    value
) {

    const text =
        normalizeText(
            value
        );

    return text || null;
}


function normalizeTags(
    value
) {

    if (
        Array.isArray(
            value
        )
    ) {

        return [
            ...new Set(
                value
                    .map(
                        (tag) =>
                            normalizeText(
                                tag
                            )
                                .toLowerCase()
                    )
                    .filter(Boolean)
            )
        ];
    }


    return [
        ...new Set(
            normalizeText(
                value
            )
                .split(",")
                .map(
                    (tag) =>
                        tag
                            .trim()
                            .toLowerCase()
                )
                .filter(Boolean)
        )
    ];
}


function normalizeRating(
    value
) {

    if (
        value === "" ||
        value === null ||
        value === undefined
    ) {
        return null;
    }


    const rating =
        Number(
            value
        );


    if (
        !Number.isFinite(
            rating
        ) ||
        rating < 0 ||
        rating > 10
    ) {

        throw new Error(
            "La note doit être comprise entre 0 et 10."
        );
    }


    return rating;
}


/* =========================================================
   FORMAT BASE -> FRONT
========================================================= */

function formatGame(
    game
) {

    return {

        id:
            game.id,

        twitchGameId:
            game.twitch_game_id,

        twitchName:
            game.twitch_name,

        boxArtUrl:
            game.box_art_url,

        status:
            game.status,

        tags:
            Array.isArray(
                game.tags
            )
                ? game.tags
                : [],

        description:
            game.description,

        rating:
            game.rating,

        youtubePlaylist:
            game.youtube_playlist,

        pollEnabled:
            Boolean(
                game.poll_enabled
            ),

        createdAt:
            game.created_at,

        updatedAt:
            game.updated_at

    };
}


/* =========================================================
   TWITCH — RÉCUPÉRER UN JEU PAR ID
========================================================= */

async function getTwitchGame(
    twitchGameId
) {

    const id =
        normalizeText(
            twitchGameId
        );


    if (!id) {

        throw new Error(
            "L'ID Twitch est obligatoire."
        );
    }


    const data =
        await twitchFetch(
            `/games?id=${encodeURIComponent(id)}`
        );


    const game =
        Array.isArray(
            data?.data
        )
            ? data.data[0]
            : null;


    if (!game) {

        return null;
    }


    let boxArtUrl =
        game.box_art_url
            ? String(
                game.box_art_url
            )
            : null;


    if (boxArtUrl) {

        boxArtUrl =
            boxArtUrl
                .replace(
                    "{width}",
                    "600"
                )
                .replace(
                    "{height}",
                    "800"
                )
                .replace(
                    "%{width}",
                    "600"
                )
                .replace(
                    "%{height}",
                    "800"
                );
    }


    return {

        id:
            String(
                game.id
            ),

        name:
            String(
                game.name ||
                ""
            ),

        boxArtUrl

    };
}


/* =========================================================
   GET — LISTER LES JEUX
========================================================= */

async function handleGet(
    response
) {

    const {
        data,
        error
    } =
        await supabaseAdmin
            .from(
                "games"
            )
            .select("*")
            .order(
                "created_at",
                {
                    ascending:
                        false
                }
            );


    if (error) {

        console.error(
            "[Admin Games] GET Supabase :",
            error
        );


        response
            .status(500)
            .json({
                error:
                    "Impossible de récupérer les jeux."
            });


        return;
    }


    response
        .status(200)
        .json({
            games:
                data.map(
                    formatGame
                )
        });
}


/* =========================================================
   POST — AJOUTER UN JEU
========================================================= */

async function handlePost(
    request,
    response
) {

    const twitchGameId =
        normalizeText(
            request.body
                ?.twitchGameId
        );


    if (!twitchGameId) {

        response
            .status(400)
            .json({
                error:
                    "L'ID Twitch est obligatoire."
            });


        return;
    }


    /* =====================================================
       RÉCUPÉRATION TWITCH
    ====================================================== */

    const twitchGame =
        await getTwitchGame(
            twitchGameId
        );


    if (!twitchGame) {

        response
            .status(404)
            .json({
                error:
                    "Aucun jeu Twitch trouvé avec cet ID."
            });


        return;
    }


    /* =====================================================
       STATUT
    ====================================================== */

    const status =
        normalizeText(
            request.body
                ?.status
        ) ||
        "backlog";


    if (
        !ALLOWED_STATUSES.has(
            status
        )
    ) {

        response
            .status(400)
            .json({
                error:
                    "Statut invalide."
            });


        return;
    }


    /* =====================================================
       NOTE
    ====================================================== */

    let rating;


    try {

        rating =
            normalizeRating(
                request.body
                    ?.rating
            );

    } catch (error) {

        response
            .status(400)
            .json({
                error:
                    error.message
            });


        return;
    }


    /* =====================================================
       INSERTION
    ====================================================== */

    const gameToInsert = {

        twitch_game_id:
            twitchGame.id,

        twitch_name:
            twitchGame.name,

        box_art_url:
            twitchGame.boxArtUrl,

        status,

        tags:
            normalizeTags(
                request.body
                    ?.tags
            ),

        description:
            normalizeNullableText(
                request.body
                    ?.description
            ),

        rating,

        youtube_playlist:
            normalizeNullableText(
                request.body
                    ?.youtubePlaylist
            ),

        poll_enabled:
            Boolean(
                request.body
                    ?.pollEnabled
            ),

        updated_at:
            new Date()
                .toISOString()

    };


    const {
        data,
        error
    } =
        await supabaseAdmin
            .from(
                "games"
            )
            .insert(
                gameToInsert
            )
            .select()
            .single();


    if (error) {

        console.error(
            "[Admin Games] POST Supabase :",
            error
        );


        if (
            error.code ===
            "23505"
        ) {

            response
                .status(409)
                .json({
                    error:
                        "Ce jeu est déjà enregistré."
                });


            return;
        }


        response
            .status(500)
            .json({
                error:
                    "Impossible d'enregistrer le jeu."
            });


        return;
    }


    response
        .status(201)
        .json({
            game:
                formatGame(
                    data
                )
        });
}


/* =========================================================
   PUT — MODIFIER UN JEU
========================================================= */

async function handlePut(
    request,
    response
) {

    const id =
        normalizeText(
            request.body?.id
        );


    if (!id) {

        response
            .status(400)
            .json({
                error:
                    "L'ID interne du jeu est obligatoire."
            });


        return;
    }


    const status =
        normalizeText(
            request.body
                ?.status
        ) ||
        "backlog";


    if (
        !ALLOWED_STATUSES.has(
            status
        )
    ) {

        response
            .status(400)
            .json({
                error:
                    "Statut invalide."
            });


        return;
    }


    let rating;


    try {

        rating =
            normalizeRating(
                request.body
                    ?.rating
            );

    } catch (error) {

        response
            .status(400)
            .json({
                error:
                    error.message
            });


        return;
    }


    const updateData = {

        status,

        tags:
            normalizeTags(
                request.body
                    ?.tags
            ),

        description:
            normalizeNullableText(
                request.body
                    ?.description
            ),

        rating,

        youtube_playlist:
            normalizeNullableText(
                request.body
                    ?.youtubePlaylist
            ),

        poll_enabled:
            Boolean(
                request.body
                    ?.pollEnabled
            ),

        updated_at:
            new Date()
                .toISOString()

    };


    const {
        data,
        error
    } =
        await supabaseAdmin
            .from(
                "games"
            )
            .update(
                updateData
            )
            .eq(
                "id",
                id
            )
            .select()
            .single();


    if (error) {

        console.error(
            "[Admin Games] PUT Supabase :",
            error
        );


        response
            .status(500)
            .json({
                error:
                    "Impossible de modifier le jeu."
            });


        return;
    }


    response
        .status(200)
        .json({
            game:
                formatGame(
                    data
                )
        });
}


/* =========================================================
   DELETE — SUPPRIMER UN JEU
========================================================= */

async function handleDelete(
    request,
    response
) {

    const id =
        normalizeText(
            request.body?.id
        );


    if (!id) {

        response
            .status(400)
            .json({
                error:
                    "L'ID du jeu est obligatoire."
            });


        return;
    }


    const {
        error
    } =
        await supabaseAdmin
            .from(
                "games"
            )
            .delete()
            .eq(
                "id",
                id
            );


    if (error) {

        console.error(
            "[Admin Games] DELETE Supabase :",
            error
        );


        response
            .status(500)
            .json({
                error:
                    "Impossible de supprimer le jeu."
            });


        return;
    }


    response
        .status(200)
        .json({
            success:
                true
        });
}


/* =========================================================
   HANDLER PRINCIPAL
========================================================= */

export default async function handler(
    request,
    response
) {

    /* =====================================================
       PROTECTION ADMIN
    ====================================================== */

    const admin =
        requireAdmin(
            request,
            response
        );


    if (!admin) {
        return;
    }


    try {

        switch (
            request.method
        ) {

            case "GET":

                await handleGet(
                    response
                );

                break;


            case "POST":

                await handlePost(
                    request,
                    response
                );

                break;


            case "PUT":

                await handlePut(
                    request,
                    response
                );

                break;


            case "DELETE":

                await handleDelete(
                    request,
                    response
                );

                break;


            default:

                response.setHeader(
                    "Allow",
                    "GET, POST, PUT, DELETE"
                );


                response
                    .status(405)
                    .json({
                        error:
                            "Méthode non autorisée."
                    });
        }

    } catch (error) {

        console.error(
            "[Admin Games]",
            error
        );


        response
            .status(500)
            .json({
                error:
                    "Erreur interne de l'API jeux."
            });
    }
}