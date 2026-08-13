"use strict";

/* =========================================================
   API PUBLIQUE — GALERIE / ARTWORKS
   COUAXIA
========================================================= */

import {
    supabaseAdmin
} from "./_lib/supabase.js";


/* =========================================================
   CONFIGURATION
========================================================= */

const TABLE_NAME =
    "artworks";


/* =========================================================
   ERREURS
========================================================= */

/**
 * Retourne un message d'erreur lisible.
 *
 * @param {object} error
 * @returns {string}
 */
function getSupabaseErrorMessage(
    error
) {

    return (
        error?.message ||
        "Impossible de récupérer les illustrations."
    );
}


/* =========================================================
   GET — GALERIE PUBLIQUE
========================================================= */

/**
 * Récupère uniquement les œuvres visibles.
 *
 * @param {object} response
 */
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
            .select(
                `
                    id,
                    art_id,
                    artist,
                    artist_role,
                    description,
                    image_url,
                    image_alt,
                    media_type,
                    tags,
                    image_messages,
                    artist_url,
                    button_text,
                    button_messages,
                    sensitive,
                    favorite_enabled,
                    visible,
                    sort_order,
                    created_at,
                    updated_at
                `
            )
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
       ERREUR
    ====================================================== */

    if (
        error
    ) {

        console.error(
            "[Public Gallery] Supabase :",
            error
        );


        response
            .status(500)
            .json({
                success:
                    false,

                error:
                    getSupabaseErrorMessage(
                        error
                    )
            });


        return;
    }


    /* =====================================================
       RÉPONSE
    ====================================================== */

    response
        .status(200)
        .json({
            success:
                true,

            artworks:
                Array.isArray(
                    data
                )
                    ? data
                    : []
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

    /*
     * Pour le moment on désactive le cache.
     *
     * Ainsi, lorsque tu modifies une œuvre
     * depuis l'administration, la page Crédits
     * peut récupérer immédiatement les données.
     */

    response.setHeader(
        "Cache-Control",
        "no-store, max-age=0"
    );


    /* =====================================================
       MÉTHODE AUTORISÉE
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
       GET
    ====================================================== */

    try {

        await handleGet(
            response
        );

    } catch (
        error
    ) {

        console.error(
            "[Public Gallery] Erreur inattendue :",
            error
        );


        response
            .status(500)
            .json({
                success:
                    false,

                error:
                    "Erreur interne de l'API galerie."
            });
    }
}