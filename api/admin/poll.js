"use strict";

/* =========================================================
   API ADMIN — SONDAGE
   COUAXIA
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
    "polls";


const POLL_SLUG =
    "main";


const MAX_OPTIONS =
    10;


const MAX_QUESTION_LENGTH =
    250;


const MAX_OPTION_LENGTH =
    120;


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


/**
 * Normalise le statut.
 *
 * @param {unknown} value
 * @returns {"open"|"closed"}
 */
function normalizeStatus(
    value
) {

    const status =
        normalizeText(
            value
        )
            .toLowerCase();


    if (
        status ===
            "open" ||
        status ===
            "active" ||
        status ===
            "opened"
    ) {

        return "open";
    }


    return "closed";
}


/**
 * Normalise une option de sondage.
 *
 * @param {object|string} option
 * @param {number} index
 * @returns {object|null}
 */
function normalizeOption(
    option,
    index
) {

    /* =====================================================
       OPTION SIMPLE STRING
    ====================================================== */

    if (
        typeof option ===
        "string"
    ) {

        const label =
            normalizeText(
                option
            );


        if (
            !label
        ) {

            return null;
        }


        return {

            id:
                String(
                    index + 1
                ),

            label:
                label.slice(
                    0,
                    MAX_OPTION_LENGTH
                ),

            votes:
                0

        };
    }


    /* =====================================================
       OPTION OBJET
    ====================================================== */

    if (
        !option ||
        typeof option !==
            "object"
    ) {

        return null;
    }


    const label =
        normalizeText(
            option.label ??
            option.name ??
            option.text
        );


    if (
        !label
    ) {

        return null;
    }


    let votes =
        Number(
            option.votes ??
            0
        );


    if (
        !Number.isFinite(
            votes
        ) ||
        votes < 0
    ) {

        votes =
            0;
    }


    votes =
        Math.floor(
            votes
        );


    return {

        id:
            normalizeText(
                option.id
            ) ||
            String(
                index + 1
            ),

        label:
            label.slice(
                0,
                MAX_OPTION_LENGTH
            ),

        votes

    };
}


/**
 * Normalise la liste des options.
 *
 * @param {unknown} value
 * @returns {Array}
 */
function normalizeOptions(
    value
) {

    if (
        !Array.isArray(
            value
        )
    ) {

        return [];
    }


    const options =
        value
            .slice(
                0,
                MAX_OPTIONS
            )
            .map(
                normalizeOption
            )
            .filter(
                Boolean
            );


    /* =====================================================
       SUPPRESSION DES DOUBLONS
    ====================================================== */

    const labels =
        new Set();


    return options.filter(
        option => {

            const key =
                option.label
                    .toLowerCase();


            if (
                labels.has(
                    key
                )
            ) {

                return false;
            }


            labels.add(
                key
            );


            return true;
        }
    );
}


/**
 * Formate un sondage Supabase.
 *
 * @param {object|null} poll
 * @returns {object|null}
 */
function formatPoll(
    poll
) {

    if (
        !poll
    ) {

        return null;
    }


    return {

        id:
            poll.id ??
            null,

        slug:
            poll.slug ??
            POLL_SLUG,

        question:
            normalizeText(
                poll.question
            ),

        status:
            normalizeStatus(
                poll.status
            ),

        options:
            normalizeOptions(
                poll.options
            ),

        created_at:
            poll.created_at ??
            null,

        updated_at:
            poll.updated_at ??
            null

    };
}


/**
 * Message Supabase lisible.
 *
 * @param {object} error
 * @returns {string}
 */
function getSupabaseErrorMessage(
    error
) {

    return (
        error?.message ||
        "Une erreur Supabase est survenue."
    );
}


/* =========================================================
   GET — RÉCUPÉRER LE SONDAGE
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
            .select(`
                id,
                slug,
                question,
                status,
                options,
                created_at,
                updated_at
            `)
            .eq(
                "slug",
                POLL_SLUG
            )
            .maybeSingle();


    /* =====================================================
       ERREUR
    ====================================================== */

    if (
        error
    ) {

        console.error(
            "[Admin Poll GET] Supabase :",
            error
        );


        response
            .status(500)
            .json({

                success:
                    false,

                poll:
                    null,

                error:
                    getSupabaseErrorMessage(
                        error
                    )

            });


        return;
    }


    /* =====================================================
       AUCUN SONDAGE
    ====================================================== */

    if (
        !data
    ) {

        response
            .status(200)
            .json({

                success:
                    true,

                poll: {
                    id:
                        null,

                    slug:
                        POLL_SLUG,

                    question:
                        "",

                    status:
                        "closed",

                    options:
                        [],

                    created_at:
                        null,

                    updated_at:
                        null
                }

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

            poll:
                formatPoll(
                    data
                )

        });
}


/* =========================================================
   PUT — CRÉER / MODIFIER LE SONDAGE
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
       QUESTION
    ====================================================== */

    const question =
        normalizeText(
            body.question
        )
            .slice(
                0,
                MAX_QUESTION_LENGTH
            );


    if (
        !question
    ) {

        response
            .status(400)
            .json({

                success:
                    false,

                error:
                    "La question du sondage est obligatoire."

            });


        return;
    }


    /* =====================================================
       OPTIONS
    ====================================================== */

    const options =
        normalizeOptions(
            body.options
        );


    if (
        options.length <
        2
    ) {

        response
            .status(400)
            .json({

                success:
                    false,

                error:
                    "Le sondage doit contenir au moins deux options."

            });


        return;
    }


    /* =====================================================
       STATUT
    ====================================================== */

    const status =
        normalizeStatus(
            body.status
        );


    /* =====================================================
       PAYLOAD
    ====================================================== */

    const now =
        new Date()
            .toISOString();


    const payload = {

        slug:
            POLL_SLUG,

        question,

        status,

        options,

        updated_at:
            now

    };


    /* =====================================================
       UPSERT
    ====================================================== */

    const {
        data,
        error
    } =
        await supabaseAdmin
            .from(
                TABLE_NAME
            )
            .upsert(
                payload,
                {
                    onConflict:
                        "slug"
                }
            )
            .select(`
                id,
                slug,
                question,
                status,
                options,
                created_at,
                updated_at
            `)
            .single();


    /* =====================================================
       ERREUR
    ====================================================== */

    if (
        error
    ) {

        console.error(
            "[Admin Poll PUT] Supabase :",
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

            poll:
                formatPoll(
                    data
                )

        });
}


/* =========================================================
   DELETE — RÉINITIALISER LE SONDAGE
========================================================= */

async function handleDelete(
    response
) {

    /*
     * Ici on ne supprime pas forcément la ligne.
     *
     * On remet simplement le sondage à zéro.
     * Cela permet de conserver le même enregistrement
     * Supabase et évite de recréer une ligne à chaque fois.
     */

    const payload = {

        question:
            "",

        status:
            "closed",

        options:
            [],

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
                payload
            )
            .eq(
                "slug",
                POLL_SLUG
            )
            .select(`
                id,
                slug,
                question,
                status,
                options,
                created_at,
                updated_at
            `)
            .maybeSingle();


    /* =====================================================
       ERREUR
    ====================================================== */

    if (
        error
    ) {

        console.error(
            "[Admin Poll DELETE] Supabase :",
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
       SI LA LIGNE N'EXISTAIT PAS
    ====================================================== */

    if (
        !data
    ) {

        response
            .status(200)
            .json({

                success:
                    true,

                poll: {
                    id:
                        null,

                    slug:
                        POLL_SLUG,

                    question:
                        "",

                    status:
                        "closed",

                    options:
                        [],

                    created_at:
                        null,

                    updated_at:
                        null
                }

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

            poll:
                formatPoll(
                    data
                )

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
       AUTHENTIFICATION ADMIN
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
       MÉTHODES
    ====================================================== */

    try {

        switch (
            request.method
        ) {

            /* =================================================
               GET
            ================================================= */

            case "GET":

                await handleGet(
                    response
                );

                return;


            /* =================================================
               PUT
            ================================================= */

            case "PUT":

                await handlePut(
                    request,
                    response
                );

                return;


            /* =================================================
               DELETE
            ================================================= */

            case "DELETE":

                await handleDelete(
                    response
                );

                return;


            /* =================================================
               AUTRE
            ================================================= */

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
            "[Admin Poll] Erreur inattendue :",
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
                    "Erreur interne de l'API sondage."

            });
    }
}