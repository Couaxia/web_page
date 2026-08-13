"use strict";

/* =========================================================
   API PUBLIQUE — JEUX
   COUAXIA
========================================================= */

import {
    supabaseAdmin
} from "./_lib/supabase.js";


/* =========================================================
   CONFIGURATION
========================================================= */

const TABLE_NAME =
    "games";


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
 * Transforme une valeur en booléen.
 *
 * @param {unknown} value
 * @param {boolean} defaultValue
 * @returns {boolean}
 */
function normalizeBoolean(
    value,
    defaultValue = true
) {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {

        return defaultValue;
    }


    if (
        typeof value ===
        "boolean"
    ) {

        return value;
    }


    const normalizedValue =
        String(
            value
        )
            .trim()
            .toLowerCase();


    if (
        [
            "true",
            "1",
            "yes",
            "oui",
            "on"
        ].includes(
            normalizedValue
        )
    ) {

        return true;
    }


    if (
        [
            "false",
            "0",
            "no",
            "non",
            "off"
        ].includes(
            normalizedValue
        )
    ) {

        return false;
    }


    return defaultValue;
}


/**
 * Retourne un message d'erreur Supabase lisible.
 *
 * @param {object} error
 * @returns {string}
 */
function getSupabaseErrorMessage(
    error
) {

    return (
        error?.message ||
        "Impossible de récupérer les jeux."
    );
}


/* =========================================================
   FORMATAGE
========================================================= */

/**
 * Transforme une ligne Supabase
 * en objet propre pour le frontend.
 *
 * @param {object} game
 * @returns {object}
 */
function formatGame(
    game
) {

    const sortOrder =
        Number(
            game?.sort_order ??
            0
        );


    return {

        id:
            game?.id ??
            null,

        twitch_game_id:
            normalizeText(
                game?.twitch_game_id
            ) ||
            null,

        name:
            normalizeText(
                game?.name
            ) ||
            null,

        description:
            normalizeText(
                game?.description
            ),

        status:
            normalizeText(
                game?.status
            )
                .toLowerCase() ||
            "backlog",

        visible:
            normalizeBoolean(
                game?.visible,
                true
            ),

        sort_order:
            Number.isFinite(
                sortOrder
            )
                ? sortOrder
                : 0,

        created_at:
            game?.created_at ??
            null,

        updated_at:
            game?.updated_at ??
            null

    };
}


/* =========================================================
   GET — JEUX PUBLICS
========================================================= */

async function handleGet(
    request,
    response
) {

    /* =====================================================
       REQUÊTE SUPABASE
    ====================================================== */

    const {
        data,
        error
    } =
        await supabaseAdmin
            .from(
                TABLE_NAME
            )
            .select(`
                id,
                twitch_game_id,
                name,
                description,
                status,
                visible,
                sort_order,
                created_at,
                updated_at
            `)
            .eq(
                "visible",
                true
            )
            .order(
                "sort_order",
                {
                    ascending:
                        true
                }
            )
            .order(
                "created_at",
                {
                    ascending:
                        true
                }
            );


    /* =====================================================
       ERREUR SUPABASE
    ====================================================== */

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

                games:
                    [],

                error:
                    getSupabaseErrorMessage(
                        error
                    )

            });


        return;
    }


    /* =====================================================
       FORMATAGE
    ====================================================== */

    const games =
        Array.isArray(
            data
        )
            ? data.map(
                formatGame
            )
            : [];


    /* =====================================================
       RÉPONSE
    ====================================================== */

    response
        .status(200)
        .json({

            success:
                true,

            returned:
                games.length,

            games

        });
}


/* =========================================================
   HANDLER PRINCIPAL
========================================================= */

/**
 * Route :
 *
 * GET /api/games
 */
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

                games:
                    [],

                error:
                    "Méthode non autorisée."

            });


        return;
    }


    /* =====================================================
       GET
    ====================================================== */

    try {

        await handleGet(
            request,
            response
        );


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

                games:
                    [],

                error:
                    error?.message ||
                    "Erreur interne de l'API jeux."

            });
    }
}