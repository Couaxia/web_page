"use strict";

/* =========================================================
   API ADMIN — SONDAGE
   COUAXIA

   GET
   → récupérer le sondage
   → récupérer automatiquement les jeux éligibles

   PUT
   → créer / modifier le sondage
   → options générées automatiquement depuis games.poll_enabled

   DELETE
   → réinitialiser le sondage
   → supprimer TOUS les votes associés

   IMPORTANT :
   1 JEU poll_enabled = true
   =
   1 OPTION AUTOMATIQUE DANS LE SONDAGE
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


const GAMES_TABLE =
    "games";


const POLL_SLUG =
    "main";


const MAX_OPTIONS =
    20;


const MAX_QUESTION_LENGTH =
    250;


const DEFAULT_QUESTION =
    "Quel jeu veux-tu voir lors d'un prochain live ?";


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
   RÉCUPÉRER LE SONDAGE
========================================================= */

async function getPoll() {

    const {
        data,
        error
    } =
        await supabaseAdmin
            .from(
                POLLS_TABLE
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


    if (
        error
    ) {

        throw error;
    }


    return data;
}


/* =========================================================
   JEUX ÉLIGIBLES AU SONDAGE
========================================================= */

async function getEligibleGames() {

    const {
        data,
        error
    } =
        await supabaseAdmin
            .from(
                GAMES_TABLE
            )
            .select(`
                id,
                twitch_game_id,
                twitch_name,
                box_art_url,
                status,
                poll_enabled,
                created_at
            `)
            .eq(
                "poll_enabled",
                true
            )
            .order(
                "created_at",
                {
                    ascending:
                        true
                }
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
   TRANSFORMER JEUX → OPTIONS DU SONDAGE
========================================================= */

function gamesToPollOptions(
    games
) {

    if (
        !Array.isArray(
            games
        )
    ) {

        return [];
    }


    return games
        .slice(
            0,
            MAX_OPTIONS
        )
        .map(
            game => {

                const id =
                    normalizeText(
                        game?.id
                    );


                const label =
                    normalizeText(
                        game?.twitch_name
                    );


                if (
                    !id ||
                    !label
                ) {

                    return null;
                }


                return {

                    /*
                     * Très important :
                     *
                     * L'ID de l'option correspond
                     * directement à l'ID Supabase du jeu.
                     */
                    id,

                    label,

                    votes:
                        0,

                    gameId:
                        id,

                    twitchGameId:
                        normalizeText(
                            game?.twitch_game_id
                        ) ||
                        null,

                    boxArtUrl:
                        normalizeText(
                            game?.box_art_url
                        ),

                    gameStatus:
                        normalizeText(
                            game?.status
                        )

                };
            }
        )
        .filter(
            Boolean
        );
}


/* =========================================================
   VOTES DU SONDAGE
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
                id,
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
   COMPTER LES VOTES
========================================================= */

function getVoteCounts(
    votes
) {

    const counts =
        new Map();


    if (
        !Array.isArray(
            votes
        )
    ) {

        return counts;
    }


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


    return counts;
}


/* =========================================================
   AJOUTER LES COMPTEURS AUX OPTIONS
========================================================= */

function applyVoteCounts(
    options,
    votes
) {

    const voteCounts =
        getVoteCounts(
            votes
        );


    return options.map(
        option => ({

            ...option,

            votes:
                voteCounts.get(
                    String(
                        option.id
                    )
                ) ||
                0

        })
    );
}


/* =========================================================
   TOTAL DES VOTES
========================================================= */

function getTotalVotes(
    options
) {

    return options.reduce(
        (
            total,
            option
        ) => {

            return (
                total +
                Number(
                    option?.votes ||
                    0
                )
            );

        },
        0
    );
}


/* =========================================================
   FORMAT SONDAGE
========================================================= */

function formatPoll(
    poll,
    options = [],
    votes = []
) {

    const finalOptions =
        applyVoteCounts(
            options,
            votes
        );


    const totalVotes =
        getTotalVotes(
            finalOptions
        );


    if (
        !poll
    ) {

        return {

            id:
                null,

            slug:
                POLL_SLUG,

            question:
                DEFAULT_QUESTION,

            status:
                "closed",

            options:
                finalOptions,

            totalVotes,

            eligibleGamesCount:
                finalOptions.length,

            canOpen:
                finalOptions.length >=
                2,

            createdAt:
                null,

            updatedAt:
                null,

            created_at:
                null,

            updated_at:
                null

        };
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
            ) ||
            DEFAULT_QUESTION,

        status:
            normalizeStatus(
                poll.status
            ),

        options:
            finalOptions,

        totalVotes,

        eligibleGamesCount:
            finalOptions.length,

        canOpen:
            finalOptions.length >=
            2,

        createdAt:
            poll.created_at ??
            null,

        updatedAt:
            poll.updated_at ??
            null,

        created_at:
            poll.created_at ??
            null,

        updated_at:
            poll.updated_at ??
            null

    };
}


/* =========================================================
   SUPPRIMER LES VOTES D'OPTIONS QUI N'EXISTENT PLUS
========================================================= */

async function removeInvalidVotes(
    pollId,
    validOptions
) {

    if (
        !pollId
    ) {

        return;
    }


    const votes =
        await getPollVotes(
            pollId
        );


    if (
        votes.length ===
        0
    ) {

        return;
    }


    const validOptionIds =
        new Set(
            validOptions.map(
                option =>
                    String(
                        option.id
                    )
            )
        );


    const invalidVoteIds =
        votes
            .filter(
                vote =>
                    !validOptionIds.has(
                        String(
                            vote.option_id
                        )
                    )
            )
            .map(
                vote =>
                    vote.id
            )
            .filter(
                Boolean
            );


    if (
        invalidVoteIds.length ===
        0
    ) {

        return;
    }


    const {
        error
    } =
        await supabaseAdmin
            .from(
                VOTES_TABLE
            )
            .delete()
            .in(
                "id",
                invalidVoteIds
            );


    if (
        error
    ) {

        throw error;
    }
}


/* =========================================================
   OPTIONS À STOCKER DANS POLLS
========================================================= */

function getStoredOptions(
    options
) {

    return options.map(
        option => ({

            /*
             * Seules les informations nécessaires
             * au sondage sont enregistrées.
             */
            id:
                String(
                    option.id
                ),

            label:
                option.label,

            votes:
                0

        })
    );
}


/* =========================================================
   GET — RÉCUPÉRER LE SONDAGE ADMIN
========================================================= */

async function handleGet(
    response
) {

    /* =====================================================
       JEUX ÉLIGIBLES
    ====================================================== */

    let eligibleGames;


    try {

        eligibleGames =
            await getEligibleGames();

    } catch (
        error
    ) {

        console.error(
            "[Admin Poll GET] Jeux éligibles :",
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
                    "Impossible de récupérer les jeux éligibles au sondage.",

                details:
                    getSupabaseErrorMessage(
                        error
                    )

            });


        return;
    }


    const generatedOptions =
        gamesToPollOptions(
            eligibleGames
        );


    /* =====================================================
       SONDAGE
    ====================================================== */

    let poll;


    try {

        poll =
            await getPoll();

    } catch (
        error
    ) {

        console.error(
            "[Admin Poll GET] Sondage :",
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
       PAS ENCORE DE SONDAGE
    ====================================================== */

    if (
        !poll
    ) {

        response
            .status(200)
            .json({

                success:
                    true,

                poll:
                    formatPoll(
                        null,
                        generatedOptions,
                        []
                    ),

                eligibleGames:
                    generatedOptions

            });


        return;
    }


    /* =====================================================
       NETTOYAGE DES ANCIENS VOTES
    ====================================================== */

    try {

        await removeInvalidVotes(
            poll.id,
            generatedOptions
        );

    } catch (
        error
    ) {

        console.error(
            "[Admin Poll GET] Nettoyage votes :",
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
                    "Impossible de synchroniser les votes du sondage.",

                details:
                    getSupabaseErrorMessage(
                        error
                    )

            });


        return;
    }


    /* =====================================================
       VOTES
    ====================================================== */

    let votes;


    try {

        votes =
            await getPollVotes(
                poll.id
            );

    } catch (
        error
    ) {

        console.error(
            "[Admin Poll GET] Votes :",
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
                    "Impossible de récupérer les votes du sondage.",

                details:
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
                    poll,
                    generatedOptions,
                    votes
                ),

            eligibleGames:
                generatedOptions

        });
}


/* =========================================================
   PUT — CRÉER / MODIFIER / OUVRIR LE SONDAGE
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
            ) ||
        DEFAULT_QUESTION;


    /* =====================================================
       STATUT
    ====================================================== */

    let status =
        normalizeStatus(
            body.status
        );


    /* =====================================================
       JEUX ÉLIGIBLES
    ====================================================== */

    let eligibleGames;


    try {

        eligibleGames =
            await getEligibleGames();

    } catch (
        error
    ) {

        console.error(
            "[Admin Poll PUT] Jeux éligibles :",
            error
        );


        response
            .status(500)
            .json({

                success:
                    false,

                error:
                    "Impossible de récupérer les jeux du sondage.",

                details:
                    getSupabaseErrorMessage(
                        error
                    )

            });


        return;
    }


    const generatedOptions =
        gamesToPollOptions(
            eligibleGames
        );


    /* =====================================================
       AU MOINS 2 JEUX POUR OUVRIR
    ====================================================== */

    if (
        status ===
            "open" &&
        generatedOptions.length <
            2
    ) {

        response
            .status(400)
            .json({

                success:
                    false,

                error:
                    "Il faut au moins deux jeux avec l'option « Participer au sondage » activée pour ouvrir le sondage.",

                eligibleGamesCount:
                    generatedOptions.length

            });


        return;
    }


    /*
     * Un sondage vide ou avec un seul jeu
     * reste automatiquement fermé.
     */
    if (
        generatedOptions.length <
        2
    ) {

        status =
            "closed";
    }


    /* =====================================================
       ANCIEN SONDAGE
    ====================================================== */

    let existingPoll;


    try {

        existingPoll =
            await getPoll();

    } catch (
        error
    ) {

        console.error(
            "[Admin Poll PUT] Ancien sondage :",
            error
        );


        response
            .status(500)
            .json({

                success:
                    false,

                error:
                    "Impossible de lire le sondage actuel."

            });


        return;
    }


    /* =====================================================
       SUPPRIMER VOTES DE JEUX RETIRÉS DU SONDAGE
    ====================================================== */

    if (
        existingPoll?.id
    ) {

        try {

            await removeInvalidVotes(
                existingPoll.id,
                generatedOptions
            );

        } catch (
            error
        ) {

            console.error(
                "[Admin Poll PUT] Nettoyage votes :",
                error
            );


            response
                .status(500)
                .json({

                    success:
                        false,

                    error:
                        "Impossible de nettoyer les votes des jeux retirés du sondage.",

                    details:
                        getSupabaseErrorMessage(
                            error
                        )

                });


            return;
        }
    }


    /* =====================================================
       OPTIONS STOCKÉES
    ====================================================== */

    const storedOptions =
        getStoredOptions(
            generatedOptions
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

        options:
            storedOptions,

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
                POLLS_TABLE
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
       VOTES
    ====================================================== */

    let votes =
        [];


    try {

        votes =
            await getPollVotes(
                data.id
            );

    } catch (
        error
    ) {

        console.error(
            "[Admin Poll PUT] Relecture votes :",
            error
        );
    }


    /* =====================================================
       RÉPONSE
    ====================================================== */

    response
        .status(200)
        .json({

            success:
                true,

            message:
                status ===
                    "open"
                    ? "Le sondage est ouvert."
                    : "Le sondage a bien été enregistré.",

            poll:
                formatPoll(
                    data,
                    generatedOptions,
                    votes
                ),

            eligibleGames:
                generatedOptions

        });
}


/* =========================================================
   DELETE — RÉINITIALISER COMPLÈTEMENT
========================================================= */

async function handleDelete(
    response
) {

    /* =====================================================
       SONDAGE
    ====================================================== */

    let poll;


    try {

        poll =
            await getPoll();

    } catch (
        error
    ) {

        console.error(
            "[Admin Poll DELETE] Lecture :",
            error
        );


        response
            .status(500)
            .json({

                success:
                    false,

                error:
                    "Impossible de récupérer le sondage."

            });


        return;
    }


    /* =====================================================
       AUCUN SONDAGE
    ====================================================== */

    if (
        !poll
    ) {

        const eligibleGames =
            await getEligibleGames()
                .catch(
                    () => []
                );


        const generatedOptions =
            gamesToPollOptions(
                eligibleGames
            );


        response
            .status(200)
            .json({

                success:
                    true,

                message:
                    "Le sondage est déjà réinitialisé.",

                poll:
                    formatPoll(
                        null,
                        generatedOptions,
                        []
                    )

            });


        return;
    }


    /* =====================================================
       SUPPRIMER TOUS LES VOTES
    ====================================================== */

    const {
        error:
            votesDeleteError
    } =
        await supabaseAdmin
            .from(
                VOTES_TABLE
            )
            .delete()
            .eq(
                "poll_id",
                String(
                    poll.id
                )
            );


    if (
        votesDeleteError
    ) {

        console.error(
            "[Admin Poll DELETE] Votes :",
            votesDeleteError
        );


        response
            .status(500)
            .json({

                success:
                    false,

                error:
                    "Impossible de supprimer les votes du sondage.",

                details:
                    getSupabaseErrorMessage(
                        votesDeleteError
                    )

            });


        return;
    }


    /* =====================================================
       JEUX TOUJOURS ÉLIGIBLES
    ====================================================== */

    let eligibleGames =
        [];


    try {

        eligibleGames =
            await getEligibleGames();

    } catch (
        error
    ) {

        console.error(
            "[Admin Poll DELETE] Jeux :",
            error
        );
    }


    const generatedOptions =
        gamesToPollOptions(
            eligibleGames
        );


    /* =====================================================
       REMETTRE LE SONDAGE À ZÉRO
    ====================================================== */

    const payload = {

        question:
            DEFAULT_QUESTION,

        status:
            "closed",

        /*
         * On conserve les jeux éligibles.
         *
         * Réinitialiser supprime les votes,
         * mais ne décoche pas les jeux.
         */
        options:
            getStoredOptions(
                generatedOptions
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
                POLLS_TABLE
            )
            .update(
                payload
            )
            .eq(
                "id",
                poll.id
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
            "[Admin Poll DELETE] Sondage :",
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

            message:
                "Le sondage et tous ses votes ont été réinitialisés.",

            poll:
                formatPoll(
                    data,
                    generatedOptions,
                    []
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
       ROUTAGE
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