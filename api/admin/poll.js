"use strict";

/* =========================================================
   API ADMIN — SONDAGE
   COUAXIA

   GET
   → récupérer le sondage
   → récupérer les jeux éligibles
   → récupérer les jeux sélectionnés

   PUT
   → créer / modifier le sondage
   → sélectionner les jeux du sondage
   → synchroniser proprement les votes

   DELETE
   → réinitialiser le sondage
   → supprimer tous les votes
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
   TABLEAU D'IDS
========================================================= */

function normalizeIdList(
    value
) {

    if (
        !Array.isArray(
            value
        )
    ) {

        return [];
    }


    return [
        ...new Set(
            value
                .map(
                    item =>
                        normalizeText(
                            item
                        )
                )
                .filter(
                    Boolean
                )
        )
    ];
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
   SONDAGE
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
   JEUX ÉLIGIBLES
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
                "twitch_name",
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
   FORMAT JEU
========================================================= */

function formatEligibleGame(
    game
) {

    return {

        id:
            normalizeText(
                game?.id
            ),

        gameId:
            normalizeText(
                game?.id
            ),

        twitchGameId:
            normalizeText(
                game?.twitch_game_id
            ) ||
            null,

        label:
            normalizeText(
                game?.twitch_name
            ),

        name:
            normalizeText(
                game?.twitch_name
            ),

        boxArtUrl:
            normalizeText(
                game?.box_art_url
            ),

        status:
            normalizeText(
                game?.status
            ),

        pollEnabled:
            Boolean(
                game?.poll_enabled
            )

    };
}


/* =========================================================
   FORMAT OPTIONS STOCKÉES
========================================================= */

function normalizeStoredOptions(
    options
) {

    if (
        !Array.isArray(
            options
        )
    ) {

        return [];
    }


    return options
        .map(
            option => {

                const id =
                    normalizeText(
                        option?.id ??
                        option?.gameId ??
                        option?.game_id
                    );


                const label =
                    normalizeText(
                        option?.label ??
                        option?.name
                    );


                if (
                    !id ||
                    !label
                ) {

                    return null;
                }


                return {

                    id,

                    gameId:
                        id,

                    label,

                    votes:
                        Number(
                            option?.votes ||
                            0
                        )

                };
            }
        )
        .filter(
            Boolean
        );
}


/* =========================================================
   JEUX SÉLECTIONNÉS
========================================================= */

function getSelectedGameIdsFromPoll(
    poll
) {

    return normalizeStoredOptions(
        poll?.options
    )
        .map(
            option =>
                String(
                    option.id
                )
        );
}


/* =========================================================
   CRÉER OPTIONS DEPUIS IDS
========================================================= */

function buildOptionsFromSelectedGames(
    eligibleGames,
    selectedGameIds
) {

    const selectedIds =
        new Set(
            normalizeIdList(
                selectedGameIds
            )
        );


    return eligibleGames
        .filter(
            game =>
                selectedIds.has(
                    String(
                        game.id
                    )
                )
        )
        .slice(
            0,
            MAX_OPTIONS
        )
        .map(
            game => ({

                id:
                    String(
                        game.id
                    ),

                gameId:
                    String(
                        game.id
                    ),

                label:
                    game.label,

                boxArtUrl:
                    game.boxArtUrl,

                gameStatus:
                    game.status,

                votes:
                    0

            })
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
                pollId
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
   APPLIQUER LES VOTES
========================================================= */

function applyVoteCounts(
    options,
    votes
) {

    const counts =
        getVoteCounts(
            votes
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
   TOTAL VOTES
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
   SUPPRIMER LES VOTES DES OPTIONS RETIRÉES
========================================================= */

async function cleanupRemovedOptionVotes(
    pollId,
    selectedGameIds
) {

    if (
        !pollId
    ) {

        return;
    }


    const selectedIds =
        normalizeIdList(
            selectedGameIds
        );


    /*
     * Aucun jeu sélectionné :
     * on supprime tous les votes du sondage.
     */
    if (
        selectedIds.length ===
        0
    ) {

        const {
            error
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
            error
        ) {

            throw error;
        }


        return;
    }


    /*
     * Supprime uniquement les votes dont
     * option_id n'existe plus dans le sondage.
     *
     * Plus besoin d'une colonne "id"
     * dans poll_votes.
     */
    const {
        error
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
            .not(
                "option_id",
                "in",
                `(${selectedIds
                    .map(
                        id =>
                            `"${id.replace(
                                /"/g,
                                ""
                            )}"`
                    )
                    .join(",")})`
            );


    if (
        error
    ) {

        throw error;
    }
}


/* =========================================================
   OPTIONS À ENREGISTRER
========================================================= */

function getStoredOptions(
    options
) {

    return options.map(
        option => ({

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
   FORMAT RÉPONSE
========================================================= */

function formatPoll(
    poll,
    options,
    votes,
    eligibleGames
) {

    const optionsWithVotes =
        applyVoteCounts(
            options,
            votes
        );


    return {

        id:
            poll?.id ??
            null,

        slug:
            poll?.slug ??
            POLL_SLUG,

        question:
            normalizeText(
                poll?.question
            ) ||
            DEFAULT_QUESTION,

        status:
            normalizeStatus(
                poll?.status
            ),

        options:
            optionsWithVotes,

        selectedGameIds:
            optionsWithVotes.map(
                option =>
                    String(
                        option.id
                    )
            ),

        eligibleGames,

        eligibleGamesCount:
            eligibleGames.length,

        selectedGamesCount:
            optionsWithVotes.length,

        totalVotes:
            getTotalVotes(
                optionsWithVotes
            ),

        canOpen:
            optionsWithVotes.length >=
            2,

        createdAt:
            poll?.created_at ??
            null,

        updatedAt:
            poll?.updated_at ??
            null,

        created_at:
            poll?.created_at ??
            null,

        updated_at:
            poll?.updated_at ??
            null

    };
}


/* =========================================================
   GET
========================================================= */

async function handleGet(
    response
) {

    try {

        const rawEligibleGames =
            await getEligibleGames();


        const eligibleGames =
            rawEligibleGames
                .map(
                    formatEligibleGame
                )
                .filter(
                    game =>
                        game.id &&
                        game.label
                );


        const poll =
            await getPoll();


        /*
         * Aucun sondage existant.
         */
        if (
            !poll
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
                            DEFAULT_QUESTION,

                        status:
                            "closed",

                        options:
                            [],

                        selectedGameIds:
                            [],

                        eligibleGames,

                        eligibleGamesCount:
                            eligibleGames.length,

                        selectedGamesCount:
                            0,

                        totalVotes:
                            0,

                        canOpen:
                            false

                    },

                    eligibleGames

                });


            return;
        }


        const selectedGameIds =
            getSelectedGameIdsFromPoll(
                poll
            );


        const selectedOptions =
            buildOptionsFromSelectedGames(
                eligibleGames,
                selectedGameIds
            );


        const votes =
            await getPollVotes(
                poll.id
            );


        response
            .status(200)
            .json({

                success:
                    true,

                poll:
                    formatPoll(
                        poll,
                        selectedOptions,
                        votes,
                        eligibleGames
                    ),

                eligibleGames

            });


    } catch (
        error
    ) {

        console.error(
            "[Admin Poll GET]",
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
                    "Impossible de charger le sondage.",

                details:
                    getSupabaseErrorMessage(
                        error
                    )

            });
    }
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


    const question =
        normalizeText(
            body.question
        )
            .slice(
                0,
                MAX_QUESTION_LENGTH
            ) ||
        DEFAULT_QUESTION;


    let status =
        normalizeStatus(
            body.status
        );


    const requestedSelectedIds =
        normalizeIdList(
            body.selectedGameIds ??
            body.selected_game_ids
        );


    try {

        /* =====================================================
           JEUX ÉLIGIBLES
        ====================================================== */

        const rawEligibleGames =
            await getEligibleGames();


        const eligibleGames =
            rawEligibleGames
                .map(
                    formatEligibleGame
                )
                .filter(
                    game =>
                        game.id &&
                        game.label
                );


        const eligibleIds =
            new Set(
                eligibleGames.map(
                    game =>
                        String(
                            game.id
                        )
                )
            );


        /*
         * Sécurité :
         * on ignore un ID envoyé par le navigateur
         * s'il n'est pas réellement éligible.
         */
        const selectedGameIds =
            requestedSelectedIds.filter(
                id =>
                    eligibleIds.has(
                        String(
                            id
                        )
                    )
            );


        const selectedOptions =
            buildOptionsFromSelectedGames(
                eligibleGames,
                selectedGameIds
            );


        /* =====================================================
           VALIDATION
        ====================================================== */

        if (
            status ===
                "open" &&
            selectedOptions.length <
                2
        ) {

            response
                .status(400)
                .json({

                    success:
                        false,

                    error:
                        "Sélectionne au moins deux jeux avant d'ouvrir le sondage.",

                    selectedGamesCount:
                        selectedOptions.length

                });


            return;
        }


        if (
            selectedOptions.length <
            2
        ) {

            status =
                "closed";
        }


        /* =====================================================
           SONDAGE EXISTANT
        ====================================================== */

        const existingPoll =
            await getPoll();


        /* =====================================================
           NETTOYAGE VOTES
        ====================================================== */

        if (
            existingPoll?.id
        ) {

            try {

                await cleanupRemovedOptionVotes(
                    existingPoll.id,
                    selectedGameIds
                );


            } catch (
                cleanupError
            ) {

                /*
                 * On log l'erreur mais on ne bloque
                 * plus l'enregistrement du sondage.
                 *
                 * Cela évite que le sondage entier
                 * devienne inutilisable pour un souci
                 * de nettoyage secondaire.
                 */
                console.error(
                    "[Admin Poll PUT] Nettoyage votes :",
                    cleanupError
                );
            }
        }


        /* =====================================================
           ENREGISTREMENT
        ====================================================== */

        const payload = {

            slug:
                POLL_SLUG,

            question,

            status,

            options:
                getStoredOptions(
                    selectedOptions
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


        if (
            error
        ) {

            throw error;
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
            voteError
        ) {

            console.error(
                "[Admin Poll PUT] Relecture votes :",
                voteError
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
                        selectedOptions,
                        votes,
                        eligibleGames
                    ),

                eligibleGames

            });


    } catch (
        error
    ) {

        console.error(
            "[Admin Poll PUT]",
            error
        );


        response
            .status(500)
            .json({

                success:
                    false,

                error:
                    "Impossible d'enregistrer le sondage.",

                details:
                    getSupabaseErrorMessage(
                        error
                    )

            });
    }
}


/* =========================================================
   DELETE
========================================================= */

async function handleDelete(
    response
) {

    try {

        const poll =
            await getPoll();


        const rawEligibleGames =
            await getEligibleGames();


        const eligibleGames =
            rawEligibleGames
                .map(
                    formatEligibleGame
                )
                .filter(
                    game =>
                        game.id &&
                        game.label
                );


        if (
            !poll
        ) {

            response
                .status(200)
                .json({

                    success:
                        true,

                    message:
                        "Le sondage est déjà réinitialisé.",

                    poll: {

                        id:
                            null,

                        slug:
                            POLL_SLUG,

                        question:
                            DEFAULT_QUESTION,

                        status:
                            "closed",

                        options:
                            [],

                        selectedGameIds:
                            [],

                        eligibleGames,

                        eligibleGamesCount:
                            eligibleGames.length,

                        selectedGamesCount:
                            0,

                        totalVotes:
                            0,

                        canOpen:
                            false

                    }

                });


            return;
        }


        /* =====================================================
           SUPPRIMER TOUS LES VOTES
        ====================================================== */

        const {
            error:
                voteDeleteError
        } =
            await supabaseAdmin
                .from(
                    VOTES_TABLE
                )
                .delete()
                .eq(
                    "poll_id",
                    poll.id
                );


        if (
            voteDeleteError
        ) {

            console.error(
                "[Admin Poll DELETE] Votes :",
                voteDeleteError
            );
        }


        /* =====================================================
           RESET
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

                    question:
                        DEFAULT_QUESTION,

                    status:
                        "closed",

                    options:
                        [],

                    updated_at:
                        new Date()
                            .toISOString()

                })
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
                .single();


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
                    "Le sondage a été réinitialisé.",

                poll:
                    formatPoll(
                        data,
                        [],
                        [],
                        eligibleGames
                    ),

                eligibleGames

            });


    } catch (
        error
    ) {

        console.error(
            "[Admin Poll DELETE]",
            error
        );


        response
            .status(500)
            .json({

                success:
                    false,

                error:
                    "Impossible de réinitialiser le sondage.",

                details:
                    getSupabaseErrorMessage(
                        error
                    )

            });
    }
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

    switch (
        request.method
    ) {

        case "GET":

            await handleGet(
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
                response
            );

            return;


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
}