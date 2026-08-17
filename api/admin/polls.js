"use strict";

/* =========================================================
   API ADMIN — SONDAGES
   COUAXIA

   GET
   → récupérer tous les sondages

   POST
   → créer un sondage

   PUT
   → modifier un sondage

   DELETE
   → supprimer un sondage
   → supprimer également ses votes
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

const POLLS_TABLE =
    "polls";


const VOTES_TABLE =
    "poll_votes";


const MAX_OPTIONS =
    20;


const MAX_TITLE_LENGTH =
    150;


const MAX_SLUG_LENGTH =
    120;


const MAX_QUESTION_LENGTH =
    250;


const MAX_DESCRIPTION_LENGTH =
    600;


/* =========================================================
   CATÉGORIES
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
   STATUTS
========================================================= */

const ALLOWED_STATUSES =
    new Set([
        "active",
        "upcoming",
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
   BOOLÉEN
========================================================= */

function normalizeBoolean(
    value,
    fallback = false
) {

    if (
        typeof value ===
        "boolean"
    ) {

        return value;
    }


    if (
        value ===
            "true" ||
        value ===
            "1" ||
        value ===
            1
    ) {

        return true;
    }


    if (
        value ===
            "false" ||
        value ===
            "0" ||
        value ===
            0
    ) {

        return false;
    }


    return fallback;
}


/* =========================================================
   SLUG
========================================================= */

function slugify(
    value
) {

    return normalizeText(
        value
    )
        .toLowerCase()
        .normalize(
            "NFD"
        )
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace(
            /[^a-z0-9]+/g,
            "-"
        )
        .replace(
            /^-+|-+$/g,
            ""
        )
        .slice(
            0,
            MAX_SLUG_LENGTH
        );
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


    return "upcoming";
}


/* =========================================================
   CATÉGORIE
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
        ALLOWED_CATEGORIES.has(
            category
        )
    ) {

        return category;
    }


    return "community";
}


/* =========================================================
   DATE
========================================================= */

function normalizeDate(
    value
) {

    const text =
        normalizeText(
            value
        );


    if (
        !text
    ) {

        return null;
    }


    const date =
        new Date(
            text
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return null;
    }


    return date.toISOString();
}


/* =========================================================
   OPTIONS
========================================================= */

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
        [];


    const labels =
        new Set();


    value
        .slice(
            0,
            MAX_OPTIONS
        )
        .forEach(
            (
                option,
                index
            ) => {

                let id =
                    "";


                let label =
                    "";


                let imageUrl =
                    "";


                if (
                    typeof option ===
                    "string"
                ) {

                    label =
                        normalizeText(
                            option
                        );

                } else if (
                    option &&
                    typeof option ===
                        "object"
                ) {

                    id =
                        normalizeText(
                            option.id ??
                            option.optionId ??
                            option.option_id
                        );


                    label =
                        normalizeText(
                            option.label ??
                            option.name ??
                            option.text ??
                            option.title
                        );


                    imageUrl =
                        normalizeText(
                            option.imageUrl ??
                            option.image_url ??
                            option.cover
                        );
                }


                if (
                    !label
                ) {

                    return;
                }


                const normalizedLabel =
                    label.toLowerCase();


                if (
                    labels.has(
                        normalizedLabel
                    )
                ) {

                    return;
                }


                labels.add(
                    normalizedLabel
                );


                options.push({

                    id:
                        id ||
                        String(
                            index + 1
                        ),

                    label,

                    imageUrl,

                    votes:
                        0

                });
            }
        );


    return options;
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
   VOTES
========================================================= */

async function getPollVotes(
    pollId
) {

    if (
        !pollId
    ) {

        return [];
    }


    const {
        data,
        error
    } =
        await supabaseAdmin
            .from(
                VOTES_TABLE
            )
            .select(`
                poll_id,
                twitch_user_id,
                option_id,
                created_at
            `)
            .eq(
                "poll_id",
                String(
                    pollId
                )
            );


    if (
        error
    ) {

        throw error;
    }


    return Array.isArray(
        data
    )
        ? data
        : [];
}


/* =========================================================
   COMPTAGE
========================================================= */

function applyVoteCounts(
    options,
    votes
) {

    const counts =
        new Map();


    votes.forEach(
        vote => {

            const optionId =
                normalizeText(
                    vote?.option_id
                );


            if (
                !optionId
            ) {

                return;
            }


            counts.set(
                optionId,
                (
                    counts.get(
                        optionId
                    ) ||
                    0
                ) +
                1
            );
        }
    );


    return options.map(
        option => ({

            ...option,

            votes:
                counts.get(
                    String(
                        option.id
                    )
                ) ||
                0

        })
    );
}


/* =========================================================
   TOTAL
========================================================= */

function getTotalVotes(
    options
) {

    return options.reduce(
        (
            total,
            option
        ) =>
            total +
            Number(
                option?.votes ||
                0
            ),
        0
    );
}


/* =========================================================
   GAGNANT
========================================================= */

function getWinner(
    options
) {

    if (
        !Array.isArray(
            options
        ) ||
        options.length ===
            0
    ) {

        return null;
    }


    const sorted =
        [
            ...options
        ].sort(
            (
                a,
                b
            ) =>
                Number(
                    b.votes ||
                    0
                ) -
                Number(
                    a.votes ||
                    0
                )
        );


    if (
        Number(
            sorted[0]?.votes ||
            0
        ) <=
        0
    ) {

        return null;
    }


    return sorted[0];
}


/* =========================================================
   FORMATAGE
========================================================= */

async function formatPoll(
    poll
) {

    if (
        !poll
    ) {

        return null;
    }


    const options =
        normalizeOptions(
            poll.options
        );


    const votes =
        await getPollVotes(
            poll.id
        );


    const optionsWithVotes =
        applyVoteCounts(
            options,
            votes
        );


    const totalVotes =
        getTotalVotes(
            optionsWithVotes
        );


    const winner =
        getWinner(
            optionsWithVotes
        );


    return {

        id:
            poll.id ??
            null,

        slug:
            normalizeText(
                poll.slug
            ),

        title:
            normalizeText(
                poll.title
            ),

        question:
            normalizeText(
                poll.question
            ),

        description:
            normalizeText(
                poll.description
            ),

        category:
            normalizeCategory(
                poll.category
            ),

        status:
            normalizeStatus(
                poll.status
            ),

        options:
            optionsWithVotes,

        totalVotes,

        winner:
            winner
                ? {
                    id:
                        winner.id,

                    label:
                        winner.label,

                    votes:
                        winner.votes
                }
                : null,

        startsAt:
            poll.starts_at ??
            null,

        endsAt:
            poll.ends_at ??
            null,

        resultsVisible:
            normalizeBoolean(
                poll.results_visible,
                true
            ),

        allowSuggestions:
            normalizeBoolean(
                poll.allow_suggestions,
                false
            ),

        createdAt:
            poll.created_at ??
            null,

        updatedAt:
            poll.updated_at ??
            null

    };
}


/* =========================================================
   GET — TOUS LES SONDAGES
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
                POLLS_TABLE
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


    if (
        error
    ) {

        throw error;
    }


    const rawPolls =
        Array.isArray(
            data
        )
            ? data
            : [];


    const polls =
        [];


    for (
        const poll of
        rawPolls
    ) {

        polls.push(
            await formatPoll(
                poll
            )
        );
    }


    response
        .status(200)
        .json({

            success:
                true,

            polls

        });
}


/* =========================================================
   POST — CRÉER
========================================================= */

async function handlePost(
    request,
    response
) {

    const body =
        getRequestBody(
            request
        );


    const title =
        normalizeText(
            body.title
        )
            .slice(
                0,
                MAX_TITLE_LENGTH
            );


    const question =
        normalizeText(
            body.question
        )
            .slice(
                0,
                MAX_QUESTION_LENGTH
            );


    const description =
        normalizeText(
            body.description
        )
            .slice(
                0,
                MAX_DESCRIPTION_LENGTH
            );


    const slug =
        slugify(
            body.slug ||
            title
        );


    const category =
        normalizeCategory(
            body.category
        );


    const status =
        normalizeStatus(
            body.status
        );


    const options =
        normalizeOptions(
            body.options
        );


    const startsAt =
        normalizeDate(
            body.startsAt ??
            body.starts_at
        );


    const endsAt =
        normalizeDate(
            body.endsAt ??
            body.ends_at
        );


    const resultsVisible =
        normalizeBoolean(
            body.resultsVisible ??
            body.results_visible,
            true
        );


    const allowSuggestions =
        normalizeBoolean(
            body.allowSuggestions ??
            body.allow_suggestions,
            false
        );


    /* =====================================================
       VALIDATION
    ====================================================== */

    if (
        !title
    ) {

        response
            .status(400)
            .json({

                success:
                    false,

                error:
                    "Le titre du sondage est obligatoire."

            });


        return;
    }


    if (
        !slug
    ) {

        response
            .status(400)
            .json({

                success:
                    false,

                error:
                    "Le slug du sondage est obligatoire."

            });


        return;
    }


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
                    "Ajoute au moins deux réponses au sondage."

            });


        return;
    }


    if (
        startsAt &&
        endsAt &&
        new Date(
            endsAt
        ) <=
        new Date(
            startsAt
        )
    ) {

        response
            .status(400)
            .json({

                success:
                    false,

                error:
                    "La date de fin doit être après la date de début."

            });


        return;
    }


    /* =====================================================
       INSERTION
    ====================================================== */

    const {
        data,
        error
    } =
        await supabaseAdmin
            .from(
                POLLS_TABLE
            )
            .insert({

                slug,

                title,

                question,

                description,

                category,

                status,

                options,

                starts_at:
                    startsAt,

                ends_at:
                    endsAt,

                results_visible:
                    resultsVisible,

                allow_suggestions:
                    allowSuggestions,

                winner:
                    null

            })
            .select(
                "*"
            )
            .single();


    if (
        error
    ) {

        if (
            String(
                error.code
            ) ===
            "23505"
        ) {

            response
                .status(409)
                .json({

                    success:
                        false,

                    error:
                        "Un sondage utilise déjà ce slug."

                });


            return;
        }


        throw error;
    }


    response
        .status(201)
        .json({

            success:
                true,

            message:
                "Le sondage a bien été créé.",

            poll:
                await formatPoll(
                    data
                )

        });
}


/* =========================================================
   PUT — MODIFIER
========================================================= */

async function handlePut(
    request,
    response
) {

    const body =
        getRequestBody(
            request
        );


    const pollId =
        normalizeText(
            body.id ??
            body.pollId ??
            body.poll_id
        );


    if (
        !pollId
    ) {

        response
            .status(400)
            .json({

                success:
                    false,

                error:
                    "L'identifiant du sondage est obligatoire."

            });


        return;
    }


    const {
        data:
            existingPoll,
        error:
            existingError
    } =
        await supabaseAdmin
            .from(
                POLLS_TABLE
            )
            .select(
                "*"
            )
            .eq(
                "id",
                pollId
            )
            .maybeSingle();


    if (
        existingError
    ) {

        throw existingError;
    }


    if (
        !existingPoll
    ) {

        response
            .status(404)
            .json({

                success:
                    false,

                error:
                    "Ce sondage n'existe pas."

            });


        return;
    }


    const title =
        normalizeText(
            body.title ??
            existingPoll.title
        )
            .slice(
                0,
                MAX_TITLE_LENGTH
            );


    const question =
        normalizeText(
            body.question ??
            existingPoll.question
        )
            .slice(
                0,
                MAX_QUESTION_LENGTH
            );


    const description =
        normalizeText(
            body.description ??
            existingPoll.description
        )
            .slice(
                0,
                MAX_DESCRIPTION_LENGTH
            );


    const slug =
        slugify(
            body.slug ??
            existingPoll.slug ??
            title
        );


    const category =
        normalizeCategory(
            body.category ??
            existingPoll.category
        );


    const status =
        normalizeStatus(
            body.status ??
            existingPoll.status
        );


    const options =
        body.options !==
        undefined
            ? normalizeOptions(
                body.options
            )
            : normalizeOptions(
                existingPoll.options
            );


    const startsAt =
        body.startsAt !==
            undefined ||
        body.starts_at !==
            undefined
            ? normalizeDate(
                body.startsAt ??
                body.starts_at
            )
            : existingPoll.starts_at;


    const endsAt =
        body.endsAt !==
            undefined ||
        body.ends_at !==
            undefined
            ? normalizeDate(
                body.endsAt ??
                body.ends_at
            )
            : existingPoll.ends_at;


    const resultsVisible =
        body.resultsVisible !==
            undefined ||
        body.results_visible !==
            undefined
            ? normalizeBoolean(
                body.resultsVisible ??
                body.results_visible,
                true
            )
            : normalizeBoolean(
                existingPoll.results_visible,
                true
            );


    const allowSuggestions =
        body.allowSuggestions !==
            undefined ||
        body.allow_suggestions !==
            undefined
            ? normalizeBoolean(
                body.allowSuggestions ??
                body.allow_suggestions,
                false
            )
            : normalizeBoolean(
                existingPoll.allow_suggestions,
                false
            );


    /* =====================================================
       VALIDATION
    ====================================================== */

    if (
        !title ||
        !question ||
        !slug
    ) {

        response
            .status(400)
            .json({

                success:
                    false,

                error:
                    "Titre, slug et question sont obligatoires."

            });


        return;
    }


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
                    "Le sondage doit contenir au moins deux réponses."

            });


        return;
    }


    if (
        startsAt &&
        endsAt &&
        new Date(
            endsAt
        ) <=
        new Date(
            startsAt
        )
    ) {

        response
            .status(400)
            .json({

                success:
                    false,

                error:
                    "La date de fin doit être après la date de début."

            });


        return;
    }


    /* =====================================================
       OPTIONS RETIRÉES
       → SUPPRIMER LEURS VOTES
    ====================================================== */

    const allowedOptionIds =
        new Set(
            options.map(
                option =>
                    String(
                        option.id
                    )
            )
        );


    const currentVotes =
        await getPollVotes(
            pollId
        );


    const removedOptionIds =
        [
            ...new Set(
                currentVotes
                    .map(
                        vote =>
                            normalizeText(
                                vote.option_id
                            )
                    )
                    .filter(
                        optionId =>
                            optionId &&
                            !allowedOptionIds.has(
                                optionId
                            )
                    )
            )
        ];


    if (
        removedOptionIds.length >
        0
    ) {

        const {
            error:
                cleanupError
        } =
            await supabaseAdmin
                .from(
                    VOTES_TABLE
                )
                .delete()
                .eq(
                    "poll_id",
                    pollId
                )
                .in(
                    "option_id",
                    removedOptionIds
                );


        if (
            cleanupError
        ) {

            console.error(
                "[Admin Polls] Nettoyage votes :",
                cleanupError
            );
        }
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
                POLLS_TABLE
            )
            .update({

                slug,

                title,

                question,

                description,

                category,

                status,

                options,

                starts_at:
                    startsAt,

                ends_at:
                    endsAt,

                results_visible:
                    resultsVisible,

                allow_suggestions:
                    allowSuggestions,

                updated_at:
                    new Date()
                        .toISOString()

            })
            .eq(
                "id",
                pollId
            )
            .select(
                "*"
            )
            .single();


    if (
        error
    ) {

        if (
            String(
                error.code
            ) ===
            "23505"
        ) {

            response
                .status(409)
                .json({

                    success:
                        false,

                    error:
                        "Un autre sondage utilise déjà ce slug."

                });


            return;
        }


        throw error;
    }


    response
        .status(200)
        .json({

            success:
                true,

            message:
                "Le sondage a bien été modifié.",

            poll:
                await formatPoll(
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


    const pollId =
        normalizeText(
            body.id ??
            body.pollId ??
            body.poll_id
        );


    if (
        !pollId
    ) {

        response
            .status(400)
            .json({

                success:
                    false,

                error:
                    "L'identifiant du sondage est obligatoire."

            });


        return;
    }


    /* =====================================================
       VOTES
    ====================================================== */

    const {
        error:
            votesError
    } =
        await supabaseAdmin
            .from(
                VOTES_TABLE
            )
            .delete()
            .eq(
                "poll_id",
                pollId
            );


    if (
        votesError
    ) {

        console.error(
            "[Admin Polls DELETE Votes]",
            votesError
        );


        throw votesError;
    }


    /* =====================================================
       SONDAGE
    ====================================================== */

    const {
        error
    } =
        await supabaseAdmin
            .from(
                POLLS_TABLE
            )
            .delete()
            .eq(
                "id",
                pollId
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
                "Le sondage et ses votes ont été supprimés."

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
       AUTH
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
            "[Admin Polls]",
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
                    "Une erreur est survenue pendant la gestion des sondages.",

                details:
                    getSupabaseErrorMessage(
                        error
                    )

            });
    }
}