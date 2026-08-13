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

/**
 * Transforme une valeur en texte propre.
 *
 * @param {unknown} value
 * @returns {string}
 */
function normalizeText(
    value
) {

    return String(
        value ?? ""
    ).trim();
}


/**
 * Retourne null lorsque le texte est vide.
 *
 * @param {unknown} value
 * @returns {string|null}
 */
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


/**
 * Normalise les tags.
 *
 * Accepte :
 *
 * ["horreur", "coop"]
 *
 * ou
 *
 * "horreur, coop"
 *
 * @param {unknown} value
 * @returns {string[]}
 */
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
                .filter(Boolean)
        )
    ];
}


/**
 * Normalise une note entre 0 et 10.
 *
 * @param {unknown} value
 * @returns {number|null}
 */
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


/**
 * Normalise un booléen.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
function normalizeBoolean(
    value
) {

    if (
        value === true ||
        value === "true" ||
        value === 1 ||
        value === "1"
    ) {

        return true;
    }


    return false;
}


/**
 * Retourne le body de la requête.
 *
 * Fonctionne aussi bien avec Express
 * qu'avec une fonction serverless.
 *
 * @param {object} request
 * @returns {object}
 */
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
   FORMAT BASE DE DONNÉES -> FRONT
========================================================= */

/**
 * Transforme une ligne Supabase
 * au format attendu par admin.js.
 *
 * @param {object} game
 * @returns {object}
 */
function formatGame(
    game
) {

    return {

        id:
            game?.id ?? null,

        twitchGameId:
            game?.twitch_game_id ?? null,

        twitchName:
            game?.twitch_name ?? "",

        boxArtUrl:
            game?.box_art_url ?? null,

        status:
            game?.status ?? "backlog",

        tags:
            Array.isArray(
                game?.tags
            )
                ? game.tags
                : [],

        description:
            game?.description ?? null,

        rating:
            game?.rating ?? null,

        youtubePlaylist:
            game?.youtube_playlist ?? null,

        pollEnabled:
            Boolean(
                game?.poll_enabled
            ),

        createdAt:
            game?.created_at ?? null,

        updatedAt:
            game?.updated_at ?? null

    };
}


/* =========================================================
   TWITCH — RÉCUPÉRER UN JEU
========================================================= */

/**
 * Récupère un jeu Twitch depuis son ID.
 *
 * @param {string} twitchGameId
 * @returns {Promise<object|null>}
 */
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


    if (
        boxArtUrl
    ) {

        boxArtUrl =
            boxArtUrl
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


    return {

        id:
            String(
                game.id
            ),

        name:
            String(
                game.name ?? ""
            ),

        boxArtUrl

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

                error:
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
       ID TWITCH
    ====================================================== */

    const twitchGameId =
        normalizeText(
            body.twitchGameId
        );


    if (
        !twitchGameId
    ) {

        response
            .status(400)
            .json({
                success:
                    false,

                error:
                    "L'ID Twitch est obligatoire."
            });


        return;
    }


    /* =====================================================
       TWITCH
    ====================================================== */

    const twitchGame =
        await getTwitchGame(
            twitchGameId
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
                    "Aucun jeu Twitch trouvé avec cet ID."
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
       VÉRIFIER SI LE JEU EXISTE DÉJÀ
    ====================================================== */

    const {
        data: existingGame,
        error: existingError
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
                    "Ce jeu est déjà enregistré."
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


        if (
            error.code ===
            "23505"
        ) {

            response
                .status(409)
                .json({
                    success:
                        false,

                    error:
                        "Ce jeu est déjà enregistré."
                });


            return;
        }


        response
            .status(500)
            .json({
                success:
                    false,

                error:
                    "Impossible d'enregistrer le jeu."
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
       ID INTERNE
    ====================================================== */

    const id =
        normalizeText(
            body.id
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
                    "L'ID interne du jeu est obligatoire."
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
       MODIFICATION
    ====================================================== */

    const updateData = {

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
            body.id
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
                    "L'ID du jeu est obligatoire."
            });


        return;
    }


    /* =====================================================
       VÉRIFIER QUE LE JEU EXISTE
    ====================================================== */

    const {
        data: existingGame,
        error: existingError
    } =
        await supabaseAdmin
            .from(
                TABLE_NAME
            )
            .select(
                "id"
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
                    "Impossible de supprimer le jeu."
            });


        return;
    }


    response
        .status(200)
        .json({

            success:
                true,

            id

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
       CACHE
    ====================================================== */

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

            /* =============================================
               GET
            ============================================== */

            case "GET":

                await handleGet(
                    response
                );

                return;


            /* =============================================
               POST
            ============================================== */

            case "POST":

                await handlePost(
                    request,
                    response
                );

                return;


            /* =============================================
               PUT
            ============================================== */

            case "PUT":

                await handlePut(
                    request,
                    response
                );

                return;


            /* =============================================
               DELETE
            ============================================== */

            case "DELETE":

                await handleDelete(
                    request,
                    response
                );

                return;


            /* =============================================
               AUTRE
            ============================================== */

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