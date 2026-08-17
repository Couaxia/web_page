"use strict";

/* =========================================================
   API ADMIN — PROPOSITIONS DE SONDAGES
   COUAXIA

   GET
   → récupérer les propositions

   PUT
   → modifier le statut :
      pending
      approved
      rejected

   DELETE
   → supprimer définitivement une proposition
========================================================= */


/* =========================================================
   IMPORTS
========================================================= */

import {
    requireAdmin
} from "../_lib/admin-auth.js";


import {
    supabaseAdmin
} from "../_lib/supabase.js";


/* =========================================================
   CONFIGURATION
========================================================= */

const TABLE_NAME =
    "poll_suggestions";


const ALLOWED_STATUSES =
    new Set([
        "pending",
        "approved",
        "rejected"
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


/* =========================================================
   BODY
========================================================= */

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
   STATUT
========================================================= */

function normalizeStatus(
    value
) {

    const status =
        normalizeText(
            value
        )
            .toLowerCase();


    if (
        ALLOWED_STATUSES.has(
            status
        )
    ) {

        return status;
    }


    return "";
}


/* =========================================================
   FORMATAGE
========================================================= */

function formatSuggestion(
    suggestion
) {

    if (
        !suggestion
    ) {

        return null;
    }


    return {

        id:
            suggestion.id ??
            null,

        category:
            normalizeText(
                suggestion.category
            ),

        question:
            normalizeText(
                suggestion.question
            ),

        description:
            normalizeText(
                suggestion.description
            ),

        twitchUserId:
            normalizeText(
                suggestion.twitch_user_id
            ) ||
            null,

        twitchLogin:
            normalizeText(
                suggestion.twitch_login
            ) ||
            null,

        twitchDisplayName:
            normalizeText(
                suggestion.twitch_display_name
            ) ||
            null,

        status:
            normalizeText(
                suggestion.status
            ) ||
            "pending",

        createdAt:
            suggestion.created_at ??
            null,

        updatedAt:
            suggestion.updated_at ??
            null

    };
}


/* =========================================================
   ERREUR SUPABASE
========================================================= */

function getSupabaseErrorMessage(
    error
) {

    return (
        error?.message ||
        "Une erreur Supabase est survenue."
    );
}


/* =========================================================
   GET
========================================================= */

async function handleGet(
    request,
    response
) {

    const requestedStatus =
        normalizeText(
            request.query?.status
        )
            .toLowerCase();


    let query =
        supabaseAdmin
            .from(
                TABLE_NAME
            )
            .select(`
                id,
                category,
                question,
                description,
                twitch_user_id,
                twitch_login,
                twitch_display_name,
                status,
                created_at,
                updated_at
            `)
            .order(
                "created_at",
                {
                    ascending:
                        false
                }
            );


    /* =====================================================
       FILTRE OPTIONNEL
    ====================================================== */

    if (
        requestedStatus &&
        requestedStatus !==
            "all"
    ) {

        if (
            !ALLOWED_STATUSES.has(
                requestedStatus
            )
        ) {

            response
                .status(400)
                .json({

                    success:
                        false,

                    error:
                        "Le statut demandé est invalide."

                });


            return;
        }


        query =
            query.eq(
                "status",
                requestedStatus
            );
    }


    const {
        data,
        error
    } =
        await query;


    if (
        error
    ) {

        throw error;
    }


    const suggestions =
        (
            Array.isArray(
                data
            )
                ? data
                : []
        )
            .map(
                formatSuggestion
            )
            .filter(
                Boolean
            );


    /* =====================================================
       COMPTEURS
    ====================================================== */

    const {
        data:
            allSuggestions,
        error:
            countError
    } =
        await supabaseAdmin
            .from(
                TABLE_NAME
            )
            .select(`
                id,
                status
            `);


    if (
        countError
    ) {

        throw countError;
    }


    const all =
        Array.isArray(
            allSuggestions
        )
            ? allSuggestions
            : [];


    const counts = {

        total:
            all.length,

        pending:
            all.filter(
                item =>
                    item.status ===
                    "pending"
            ).length,

        approved:
            all.filter(
                item =>
                    item.status ===
                    "approved"
            ).length,

        rejected:
            all.filter(
                item =>
                    item.status ===
                    "rejected"
            ).length

    };


    response
        .status(200)
        .json({

            success:
                true,

            status:
                requestedStatus ||
                "all",

            suggestions,

            counts

        });
}


/* =========================================================
   PUT
========================================================= */

async function handlePut(
    request,
    response
) {

    const body =
        getRequestBody(
            request
        );


    const suggestionId =
        normalizeText(
            body.id ??
            body.suggestionId ??
            body.suggestion_id
        );


    const status =
        normalizeStatus(
            body.status
        );


    /* =====================================================
       VALIDATION
    ====================================================== */

    if (
        !suggestionId
    ) {

        response
            .status(400)
            .json({

                success:
                    false,

                error:
                    "L'identifiant de la proposition est obligatoire."

            });


        return;
    }


    if (
        !status
    ) {

        response
            .status(400)
            .json({

                success:
                    false,

                error:
                    "Le statut de la proposition est invalide."

            });


        return;
    }


    /* =====================================================
       EXISTENCE
    ====================================================== */

    const {
        data:
            existingSuggestion,
        error:
            existingError
    } =
        await supabaseAdmin
            .from(
                TABLE_NAME
            )
            .select(`
                id,
                category,
                question,
                description,
                twitch_user_id,
                twitch_login,
                twitch_display_name,
                status,
                created_at,
                updated_at
            `)
            .eq(
                "id",
                suggestionId
            )
            .maybeSingle();


    if (
        existingError
    ) {

        throw existingError;
    }


    if (
        !existingSuggestion
    ) {

        response
            .status(404)
            .json({

                success:
                    false,

                error:
                    "Cette proposition n'existe pas."

            });


        return;
    }


    /* =====================================================
       UPDATE
    ====================================================== */

    const {
        data,
        error
    } =
        await supabaseAdmin
            .from(
                TABLE_NAME
            )
            .update({

                status,

                updated_at:
                    new Date()
                        .toISOString()

            })
            .eq(
                "id",
                suggestionId
            )
            .select(`
                id,
                category,
                question,
                description,
                twitch_user_id,
                twitch_login,
                twitch_display_name,
                status,
                created_at,
                updated_at
            `)
            .single();


    if (
        error
    ) {

        throw error;
    }


    /* =====================================================
       MESSAGE
    ====================================================== */

    let message =
        "La proposition a bien été mise à jour.";


    if (
        status ===
        "approved"
    ) {

        message =
            "La proposition a été acceptée.";
    }


    if (
        status ===
        "rejected"
    ) {

        message =
            "La proposition a été refusée.";
    }


    if (
        status ===
        "pending"
    ) {

        message =
            "La proposition a été remise en attente.";
    }


    response
        .status(200)
        .json({

            success:
                true,

            message,

            suggestion:
                formatSuggestion(
                    data
                )

        });
}


/* =========================================================
   DELETE
========================================================= */

async function handleDelete(
    request,
    response
) {

    const body =
        getRequestBody(
            request
        );


    const suggestionId =
        normalizeText(
            body.id ??
            body.suggestionId ??
            body.suggestion_id
        );


    if (
        !suggestionId
    ) {

        response
            .status(400)
            .json({

                success:
                    false,

                error:
                    "L'identifiant de la proposition est obligatoire."

            });


        return;
    }


    /* =====================================================
       EXISTENCE
    ====================================================== */

    const {
        data:
            existingSuggestion,
        error:
            existingError
    } =
        await supabaseAdmin
            .from(
                TABLE_NAME
            )
            .select(`
                id,
                question
            `)
            .eq(
                "id",
                suggestionId
            )
            .maybeSingle();


    if (
        existingError
    ) {

        throw existingError;
    }


    if (
        !existingSuggestion
    ) {

        response
            .status(404)
            .json({

                success:
                    false,

                error:
                    "Cette proposition n'existe pas."

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
                suggestionId
            );


    if (
        error
    ) {

        throw error;
    }


    response
        .status(200)
        .json({

            success:
                true,

            message:
                "La proposition a été supprimée.",

            deletedSuggestion: {

                id:
                    existingSuggestion.id,

                question:
                    normalizeText(
                        existingSuggestion.question
                    )

            }

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
       AUTH ADMIN
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
            ============================================= */

            case "GET":

                await handleGet(
                    request,
                    response
                );


                return;


            /* =============================================
               PUT
            ============================================= */

            case "PUT":

                await handlePut(
                    request,
                    response
                );


                return;


            /* =============================================
               DELETE
            ============================================= */

            case "DELETE":

                await handleDelete(
                    request,
                    response
                );


                return;


            /* =============================================
               AUTRE
            ============================================= */

            default:

                response.setHeader(
                    "Allow",
                    "GET, PUT, DELETE"
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
            "[Admin Poll Suggestions]",
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
                    "Une erreur est survenue pendant la gestion des propositions.",

                details:
                    getSupabaseErrorMessage(
                        error
                    )

            });
    }
}