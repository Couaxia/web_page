"use strict";

/* =========================================================
   API PUBLIQUE — PROPOSITIONS DE SONDAGES
   COUAXIA

   POST /api/poll-suggestions

   Permet à un viewer connecté avec Twitch
   de proposer une idée de sondage.

   Les propositions sont enregistrées avec :
   status = "pending"

   Elles devront ensuite être validées
   depuis l'administration.
========================================================= */

import {
    supabaseAdmin
} from "./_lib/supabase.js";


import {
    getPublicUserSession
} from "./_lib/public-auth.js";


/* =========================================================
   CONFIGURATION
========================================================= */

const TABLE_NAME =
    "poll_suggestions";


const MAX_QUESTION_LENGTH =
    150;


const MAX_DESCRIPTION_LENGTH =
    600;


/* =========================================================
   CATÉGORIES AUTORISÉES
========================================================= */

const ALLOWED_CATEGORIES =
    new Set([
        "games",
        "community",
        "vtuber",
        "content",
        "events",
        "fun"
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


/**
 * Retourne le body de la requête.
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
   DONNÉES TWITCH
========================================================= */

/**
 * Récupère l'identifiant Twitch
 * depuis la session publique.
 *
 * @param {object} session
 * @returns {string}
 */
function getSessionTwitchUserId(
    session
) {

    return normalizeText(

        session?.twitchUserId ??
        session?.twitch_user_id ??
        session?.userId ??
        session?.user_id ??
        session?.id

    );
}


/**
 * Récupère le login Twitch.
 *
 * La fonction accepte plusieurs noms
 * pour rester compatible avec différentes
 * versions de public-auth.js.
 *
 * @param {object} session
 * @returns {string}
 */
function getSessionTwitchLogin(
    session
) {

    return normalizeText(

        session?.twitchLogin ??
        session?.twitch_login ??
        session?.login ??
        session?.userLogin ??
        session?.user_login

    );
}


/**
 * Récupère le nom d'affichage Twitch.
 *
 * @param {object} session
 * @returns {string}
 */
function getSessionTwitchDisplayName(
    session
) {

    return normalizeText(

        session?.twitchDisplayName ??
        session?.twitch_display_name ??
        session?.displayName ??
        session?.display_name ??
        session?.name

    );
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
   VALIDATION CATÉGORIE
========================================================= */

function normalizeCategory(
    value
) {

    const category =
        normalizeText(
            value
        )
            .toLowerCase();


    if (
        !ALLOWED_CATEGORIES.has(
            category
        )
    ) {

        return "";
    }


    return category;
}


/* =========================================================
   FORMATAGE D'UNE PROPOSITION
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

        status:
            normalizeText(
                suggestion.status
            ) ||
            "pending",

        createdAt:
            suggestion.created_at ??
            null

    };
}


/* =========================================================
   POST
========================================================= */

async function handlePost(
    request,
    response
) {

    /* =====================================================
       AUTHENTIFICATION TWITCH
    ====================================================== */

    const session =
        getPublicUserSession(
            request
        );


    if (
        !session
    ) {

        response
            .status(401)
            .json({

                success:
                    false,

                authenticated:
                    false,

                loginRequired:
                    true,

                loginUrl:
                    "/api/auth/public-login",

                error:
                    "Tu dois être connecté avec Twitch pour proposer un sondage."

            });


        return;
    }


    /* =====================================================
       IDENTIFIANT TWITCH
    ====================================================== */

    const twitchUserId =
        getSessionTwitchUserId(
            session
        );


    if (
        !twitchUserId
    ) {

        console.error(
            "[Poll Suggestion] Session Twitch sans identifiant utilisateur.",
            session
        );


        response
            .status(401)
            .json({

                success:
                    false,

                authenticated:
                    false,

                loginRequired:
                    true,

                loginUrl:
                    "/api/auth/public-login",

                error:
                    "La session Twitch n'est pas valide."

            });


        return;
    }


    /* =====================================================
       BODY
    ====================================================== */

    const body =
        getRequestBody(
            request
        );


    const category =
        normalizeCategory(
            body.category
        );


    const question =
        normalizeText(
            body.question ??
            body.title
        );


    const description =
        normalizeText(
            body.description
        );


    /* =====================================================
       CATÉGORIE
    ====================================================== */

    if (
        !category
    ) {

        response
            .status(400)
            .json({

                success:
                    false,

                error:
                    "La catégorie de la proposition est invalide."

            });


        return;
    }


    /* =====================================================
       QUESTION
    ====================================================== */

    if (
        !question
    ) {

        response
            .status(400)
            .json({

                success:
                    false,

                error:
                    "Ton idée de sondage est obligatoire."

            });


        return;
    }


    if (
        question.length >
        MAX_QUESTION_LENGTH
    ) {

        response
            .status(400)
            .json({

                success:
                    false,

                error:
                    `La question ne peut pas dépasser ${MAX_QUESTION_LENGTH} caractères.`

            });


        return;
    }


    /* =====================================================
       DESCRIPTION
    ====================================================== */

    if (
        description.length >
        MAX_DESCRIPTION_LENGTH
    ) {

        response
            .status(400)
            .json({

                success:
                    false,

                error:
                    `La description ne peut pas dépasser ${MAX_DESCRIPTION_LENGTH} caractères.`

            });


        return;
    }


    /* =====================================================
       DONNÉES TWITCH
    ====================================================== */

    const twitchLogin =
        getSessionTwitchLogin(
            session
        );


    const twitchDisplayName =
        getSessionTwitchDisplayName(
            session
        );


    /* =====================================================
       INSERTION SUPABASE
    ====================================================== */

    const {
        data,
        error
    } =
        await supabaseAdmin
            .from(
                TABLE_NAME
            )
            .insert({

                category,

                question,

                description,

                twitch_user_id:
                    twitchUserId,

                twitch_login:
                    twitchLogin ||
                    null,

                twitch_display_name:
                    twitchDisplayName ||
                    twitchLogin ||
                    null,

                status:
                    "pending"

            })
            .select(`
                id,
                category,
                question,
                description,
                status,
                created_at
            `)
            .single();


    if (
        error
    ) {

        console.error(
            "[Poll Suggestion Insert]",
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
        .status(201)
        .json({

            success:
                true,

            authenticated:
                true,

            message:
                "Merci ! Ta proposition a bien été envoyée et doit maintenant être validée. 💜",

            suggestion:
                formatSuggestion(
                    data
                )

        });
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
        "no-store, max-age=0"
    );


    try {

        /* =================================================
           MÉTHODE
        ================================================= */

        switch (
            request.method
        ) {

            /* =============================================
               POST
            ============================================= */

            case "POST":

                await handlePost(
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
                    "POST"
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
            "[Public Poll Suggestions]",
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
                    "Impossible d'envoyer la proposition."

            });
    }
}