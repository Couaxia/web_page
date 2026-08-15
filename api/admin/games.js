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

const TABLE_NAME =
    "games";


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
        value ?? ""
    ).trim();
}


function normalizeNullableText(
    value
) {

    const text =
        normalizeText(
            value
        );


    return (
        text ||
        null
    );
}


function normalizeTags(
    value
) {

    let tags;


    if (
        Array.isArray(
            value
        )
    ) {

        tags =
            value;

    } else {

        tags =
            normalizeText(
                value
            )
                .split(",");
    }


    return [
        ...new Set(
            tags
                .map(
                    tag =>
                        normalizeText(
                            tag
                        )
                            .toLowerCase()
                )
                .filter(
                    Boolean
                )
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


function normalizeBoolean(
    value
) {

    return (
        value === true ||
        value === "true" ||
        value === 1 ||
        value === "1"
    );
}


function getRequestBody(
    request
) {

    if (
        request?.body &&
        typeof request.body ===
            "object"
    ) {

        return request.body;
    }


    return {};
}


/* =========================================================
   FORMAT SUPABASE → FRONT
========================================================= */

function formatGame(
    game
) {

    return {

        id:
            game?.id ??
            null,

        twitchGameId:
            game?.twitch_game_id ??
            null,

        /*
         * On expose aussi "name"
         * pour simplifier admin.js.
         */
        name:
            game?.twitch_name ??
            "",

        twitchName:
            game?.twitch_name ??
            "",

        boxArtUrl:
            game?.box_art_url ??
            null,

        status:
            game?.status ??
            "backlog",

        tags:
            Array.isArray(
                game?.tags
            )
                ? game.tags
                : [],

        description:
            game?.description ??
            null,

        rating:
            game?.rating ??
            null,

        youtubePlaylist:
            game?.youtube_playlist ??
            null,

        pollEnabled:
            Boolean(
                game?.poll_enabled
            ),

        createdAt:
            game?.created_at ??
            null,

        updatedAt:
            game?.updated_at ??
            null

    };
}


/* =========================================================
   TWITCH — JAQUETTE
========================================================= */

function formatBoxArt(
    value
) {

    if (
        !value
    ) {

        return null;
    }


    return String(
        value
    )
        .replaceAll(
            "{width}",
            "600"
        )
        .replaceAll(
            "{height}",
            "800"
        )
        .replaceAll(
            "%{width}",
            "600"
        )
        .replaceAll(
            "%{height}",
            "800"
        );
}


/* =========================================================
   TWITCH — RECHERCHE PAR NOM
========================================================= */

async function getTwitchGameByName(
    gameName
) {

    const name =
        normalizeText(
            gameName
        );


    if (
        !name
    ) {

        throw new Error(
            "Le nom du jeu est obligatoire."
        );
    }


    const data =
        await twitchFetch(
            `/games?name=${encodeURIComponent(
                name
            )}`
        );


    const twitchGame =
        Array.isArray(
            data?.data
        )
            ? data.data[0]
            : null;


    if (
        !twitchGame
    ) {

        return null;
    }


    return {

        id:
            String(
                twitchGame.id
            ),

        name:
            String(
                twitchGame.name ??
                ""
            ),

        boxArtUrl:
            formatBoxArt(
                twitchGame.box_art_url
            )

    };
}


/* =========================================================
   GET — LISTE DES JEUX
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
                TABLE_NAME
            )
            .select("*")
            .order(
                "created_at",
                {
                    ascending:
                        false
                }
            );


    if (
        error
    ) {

        console.error(
            "[Admin Games GET] Supabase :",
            error
        );


        response
            .status(500)
            .json({

                success:
                    false,

                games:
                    [],

                error:
                    error?.message ||
                    "Impossible de récupérer les jeux."

            });


        return;
    }


    response
        .status(200)
        .json({

            success:
                true,

            games:
                Array.isArray(
                    data
                )
                    ? data.map(
                        formatGame
                    )
                    : []

        });
}


/* =========================================================
   POST — AJOUTER UN JEU
========================================================= */

async function handlePost(
    request,
    response
) {

    const body =
        getRequestBody(
            request
        );


    /* =====================================================
       NOM DU JEU
    ====================================================== */

    const gameName =
        normalizeText(
            body.gameName ??
            body.name ??
            body.twitchName
        );


    if (
        !gameName
    ) {

        response
            .status(400)
            .json({

                success:
                    false,

                error:
                    "Le nom du jeu est obligatoire."

            });


        return;
    }


    /* =====================================================
       RECHERCHE TWITCH
    ====================================================== */

    let twitchGame;


    try {

        twitchGame =
            await getTwitchGameByName(
                gameName
            );


    } catch (
        error
    ) {

        console.error(
            "[Admin Games POST] Twitch :",
            error
        );


        response
            .status(502)
            .json({

                success:
                    false,

                error:
                    error?.message ||
                    "Impossible de contacter Twitch."

            });


        return;
    }


    if (
        !twitchGame
    ) {

        response
            .status(404)
            .json({

                success:
                    false,

                error:
                    `Le jeu "${gameName}" est introuvable sur Twitch.`

            });


        return;
    }


    /* =====================================================
       STATUT
    ====================================================== */

    const status =
        normalizeText(
            body.status
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

                success:
                    false,

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
                body.rating
            );


    } catch (
        error
    ) {

        response
            .status(400)
            .json({

                success:
                    false,

                error:
                    error.message

            });


        return;
    }


    /* =====================================================
       DOUBLON
    ====================================================== */

    const {
        data:
            existingGame,

        error:
            existingError
    } =
        await supabaseAdmin
            .from(
                TABLE_NAME
            )
            .select(
                "id"
            )
            .eq(
                "twitch_game_id",
                twitchGame.id
            )
            .maybeSingle();


    if (
        existingError
    ) {

        console.error(
            "[Admin Games POST] Vérification doublon :",
            existingError
        );


        response
            .status(500)
            .json({

                success:
                    false,

                error:
                    existingError?.message ||
                    "Impossible de vérifier si le jeu existe déjà."

            });


        return;
    }


    if (
        existingGame
    ) {

        response
            .status(409)
            .json({

                success:
                    false,

                error:
                    `"${twitchGame.name}" est déjà enregistré.`

            });


        return;
    }


    /* =====================================================
       INSERTION
    ====================================================== */

    const now =
        new Date()
            .toISOString();


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
                body.tags
            ),

        description:
            normalizeNullableText(
                body.description
            ),

        rating,

        youtube_playlist:
            normalizeNullableText(
                body.youtubePlaylist
            ),

        poll_enabled:
            normalizeBoolean(
                body.pollEnabled
            ),

        updated_at:
            now

    };


    const {
        data,
        error
    } =
        await supabaseAdmin
            .from(
                TABLE_NAME
            )
            .insert(
                gameToInsert
            )
            .select()
            .single();


    if (
        error
    ) {

        console.error(
            "[Admin Games POST] Supabase :",
            error
        );


        response
            .status(
                error.code ===
                    "23505"
                    ? 409
                    : 500
            )
            .json({

                success:
                    false,

                error:
                    error.code ===
                        "23505"
                        ? "Ce jeu est déjà enregistré."
                        : (
                            error?.message ||
                            "Impossible d'enregistrer le jeu."
                        )

            });


        return;
    }


    response
        .status(201)
        .json({

            success:
                true,

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

    const body =
        getRequestBody(
            request
        );


    /* =====================================================
       ID SUPABASE INTERNE
    ====================================================== */

    const id =
        normalizeText(
            body.id ??
            request.query?.id
        );


    if (
        !id
    ) {

        response
            .status(400)
            .json({

                success:
                    false,

                error:
                    "L'identifiant Supabase du jeu est obligatoire."

            });


        return;
    }


    /* =====================================================
       VÉRIFIER LE JEU ACTUEL
    ====================================================== */

    const {
        data:
            previousGame,

        error:
            previousError
    } =
        await supabaseAdmin
            .from(
                TABLE_NAME
            )
            .select("*")
            .eq(
                "id",
                id
            )
            .maybeSingle();


    if (
        previousError
    ) {

        console.error(
            "[Admin Games PUT] Lecture :",
            previousError
        );


        response
            .status(500)
            .json({

                success:
                    false,

                error:
                    previousError?.message ||
                    "Impossible de récupérer le jeu."

            });


        return;
    }


    if (
        !previousGame
    ) {

        response
            .status(404)
            .json({

                success:
                    false,

                error:
                    "Jeu introuvable."

            });


        return;
    }


    /* =====================================================
       STATUT
    ====================================================== */

    const status =
        normalizeText(
            body.status
        ) ||
        previousGame.status ||
        "backlog";


    if (
        !ALLOWED_STATUSES.has(
            status
        )
    ) {

        response
            .status(400)
            .json({

                success:
                    false,

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
                body.rating
            );


    } catch (
        error
    ) {

        response
            .status(400)
            .json({

                success:
                    false,

                error:
                    error.message

            });


        return;
    }


    /* =====================================================
       DONNÉES TWITCH ACTUELLES
    ====================================================== */

    let twitchGameId =
        previousGame.twitch_game_id;

    let twitchName =
        previousGame.twitch_name;

    let boxArtUrl =
        previousGame.box_art_url;


    /* =====================================================
       CHANGEMENT DU NOM DU JEU
    ====================================================== */

    const requestedGameName =
        normalizeText(
            body.gameName ??
            body.name ??
            body.twitchName
        );


    /*
     * Si un nom est envoyé et qu'il est différent,
     * on recherche à nouveau le jeu sur Twitch.
     */
    if (
        requestedGameName &&
        requestedGameName.toLowerCase() !==
            normalizeText(
                previousGame.twitch_name
            ).toLowerCase()
    ) {

        const twitchGame =
            await getTwitchGameByName(
                requestedGameName
            );


        if (
            !twitchGame
        ) {

            response
                .status(404)
                .json({

                    success:
                        false,

                    error:
                        `Le jeu "${requestedGameName}" est introuvable sur Twitch.`

                });


            return;
        }


        /* =================================================
           ÉVITER UN DOUBLON
        ================================================= */

        const {
            data:
                duplicateGame,

            error:
                duplicateError
        } =
            await supabaseAdmin
                .from(
                    TABLE_NAME
                )
                .select(
                    "id"
                )
                .eq(
                    "twitch_game_id",
                    twitchGame.id
                )
                .neq(
                    "id",
                    id
                )
                .maybeSingle();


        if (
            duplicateError
        ) {

            console.error(
                "[Admin Games PUT] Doublon :",
                duplicateError
            );


            response
                .status(500)
                .json({

                    success:
                        false,

                    error:
                        "Impossible de vérifier le nouveau jeu."

                });


            return;
        }


        if (
            duplicateGame
        ) {

            response
                .status(409)
                .json({

                    success:
                        false,

                    error:
                        `"${twitchGame.name}" est déjà enregistré.`

                });


            return;
        }


        twitchGameId =
            twitchGame.id;

        twitchName =
            twitchGame.name;

        boxArtUrl =
            twitchGame.boxArtUrl;
    }


    /* =====================================================
       UPDATE
    ====================================================== */

    const updateData = {

        twitch_game_id:
            twitchGameId,

        twitch_name:
            twitchName,

        box_art_url:
            boxArtUrl,

        status,

        tags:
            normalizeTags(
                body.tags
            ),

        description:
            normalizeNullableText(
                body.description
            ),

        rating,

        youtube_playlist:
            normalizeNullableText(
                body.youtubePlaylist
            ),

        poll_enabled:
            normalizeBoolean(
                body.pollEnabled
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
                TABLE_NAME
            )
            .update(
                updateData
            )
            .eq(
                "id",
                id
            )
            .select()
            .maybeSingle();


    if (
        error
    ) {

        console.error(
            "[Admin Games PUT] Supabase :",
            error
        );


        response
            .status(500)
            .json({

                success:
                    false,

                error:
                    error?.message ||
                    "Impossible de modifier le jeu."

            });


        return;
    }


    if (
        !data
    ) {

        response
            .status(404)
            .json({

                success:
                    false,

                error:
                    "Jeu introuvable."

            });


        return;
    }


    response
        .status(200)
        .json({

            success:
                true,

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

    const body =
        getRequestBody(
            request
        );


    const id =
        normalizeText(
            body.id ??
            request.query?.id
        );


    if (
        !id
    ) {

        response
            .status(400)
            .json({

                success:
                    false,

                error:
                    "L'identifiant Supabase du jeu est obligatoire."

            });


        return;
    }


    /* =====================================================
       VÉRIFICATION
    ====================================================== */

    const {
        data:
            existingGame,

        error:
            existingError
    } =
        await supabaseAdmin
            .from(
                TABLE_NAME
            )
            .select(
                "id,twitch_name"
            )
            .eq(
                "id",
                id
            )
            .maybeSingle();


    if (
        existingError
    ) {

        console.error(
            "[Admin Games DELETE] Vérification :",
            existingError
        );


        response
            .status(500)
            .json({

                success:
                    false,

                error:
                    existingError?.message ||
                    "Impossible de vérifier le jeu."

            });


        return;
    }


    if (
        !existingGame
    ) {

        response
            .status(404)
            .json({

                success:
                    false,

                error:
                    "Jeu introuvable."

            });


        return;
    }


    /* =====================================================
       SUPPRESSION
    ====================================================== */

    const {
        error
    } =
        await supabaseAdmin
            .from(
                TABLE_NAME
            )
            .delete()
            .eq(
                "id",
                id
            );


    if (
        error
    ) {

        console.error(
            "[Admin Games DELETE] Supabase :",
            error
        );


        response
            .status(500)
            .json({

                success:
                    false,

                error:
                    error?.message ||
                    "Impossible de supprimer le jeu."

            });


        return;
    }


    response
        .status(200)
        .json({

            success:
                true,

            id,

            name:
                existingGame.twitch_name

        });
}


/* =========================================================
   HANDLER PRINCIPAL
========================================================= */

export default async function handler(
    request,
    response
) {

    response.setHeader(
        "Cache-Control",
        "no-store, max-age=0"
    );


    /* =====================================================
       PROTECTION ADMIN
    ====================================================== */

    const admin =
        requireAdmin(
            request,
            response
        );


    if (
        !admin
    ) {

        return;
    }


    /* =====================================================
       ROUTAGE
    ====================================================== */

    try {

        switch (
            request.method
        ) {

            case "GET":

                await handleGet(
                    response
                );

                return;


            case "POST":

                await handlePost(
                    request,
                    response
                );

                return;


            case "PUT":

                await handlePut(
                    request,
                    response
                );

                return;


            case "DELETE":

                await handleDelete(
                    request,
                    response
                );

                return;


            default:

                response.setHeader(
                    "Allow",
                    "GET, POST, PUT, DELETE"
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


    } catch (
        error
    ) {

        console.error(
            "[Admin Games] Erreur inattendue :",
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
                    error?.message ||
                    "Erreur interne de l'API jeux."

            });
    }
}