"use strict";

/* =========================================================
   API PUBLIQUE — SONDAGES
   COUAXIA

   MULTI-SONDAGES

   GET  /api/polls
   POST /api/polls

   1 COMPTE TWITCH = 1 VOTE PAR SONDAGE
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

const POLLS_TABLE_NAME =
    "polls";


const VOTES_TABLE_NAME =
    "poll_votes";


const MAX_OPTIONS =
    20;


/* =========================================================
   OUTILS GÉNÉRAUX
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


/**
 * Convertit une valeur en booléen.
 *
 * @param {*} value
 * @param {boolean} fallback
 * @returns {boolean}
 */
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
            1 ||
        value ===
            "1" ||
        value ===
            "true"
    ) {

        return true;
    }


    if (
        value ===
            0 ||
        value ===
            "0" ||
        value ===
            "false"
    ) {

        return false;
    }


    return fallback;
}


/**
 * Convertit une valeur en Date.
 *
 * @param {*} value
 * @returns {Date|null}
 */
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


    return date;
}


/* =========================================================
   OPTIONS
========================================================= */

/**
 * Normalise une option de sondage.
 *
 * @param {*} option
 * @param {number} index
 * @returns {object|null}
 */
function normalizeOption(
    option,
    index
) {

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

            label,

            imageUrl:
                "",

            votes:
                0,

            percentage:
                0

        };
    }


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
            option.text ??
            option.title
        );


    if (
        !label
    ) {

        return null;
    }


    return {

        id:
            normalizeText(
                option.id ??
                option.optionId ??
                option.option_id
            ) ||
            String(
                index + 1
            ),

        label,

        imageUrl:
            normalizeText(
                option.imageUrl ??
                option.image_url ??
                option.cover ??
                option.image
            ),

        votes:
            0,

        percentage:
            0

    };
}


/**
 * Normalise toutes les options.
 *
 * @param {*} value
 * @returns {object[]}
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


    return value
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
}


/* =========================================================
   STATUT PUBLIC
========================================================= */

/**
 * Retourne :
 *
 * active
 * upcoming
 * finished
 *
 * Compatible avec les anciens :
 *
 * open
 * closed
 *
 * @param {object} poll
 * @returns {string}
 */
function getPublicPollStatus(
    poll
) {

    const rawStatus =
        normalizeText(
            poll?.status
        )
            .toLowerCase();


    const now =
        new Date();


    const startsAt =
        normalizeDate(
            poll?.starts_at ??
            poll?.startsAt
        );


    const endsAt =
        normalizeDate(
            poll?.ends_at ??
            poll?.endsAt
        );


    /* =====================================================
       DATE DE DÉBUT FUTURE
    ====================================================== */

    if (
        startsAt &&
        now <
        startsAt
    ) {

        return "upcoming";
    }


    /* =====================================================
       DATE DE FIN PASSÉE
    ====================================================== */

    if (
        endsAt &&
        now >=
        endsAt
    ) {

        return "finished";
    }


    /* =====================================================
       NOUVEAUX STATUTS
    ====================================================== */

    if (
        rawStatus ===
        "active"
    ) {

        return "active";
    }


    if (
        rawStatus ===
        "upcoming"
    ) {

        return "upcoming";
    }


    if (
        rawStatus ===
        "finished"
    ) {

        return "finished";
    }


    /* =====================================================
       ANCIENS STATUTS
    ====================================================== */

    if (
        rawStatus ===
        "open"
    ) {

        return "active";
    }


    if (
        rawStatus ===
        "closed"
    ) {

        return "finished";
    }


    /* =====================================================
       PAR DÉFAUT
    ====================================================== */

    return "finished";
}


/* =========================================================
   SUPABASE — ERREURS
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
   RÉCUPÉRATION DES SONDAGES
========================================================= */

/**
 * Récupère tous les sondages.
 *
 * select("*") permet de rester compatible avec
 * l'ancien schéma pendant qu'on ajoute progressivement
 * les nouvelles colonnes.
 *
 * @returns {Promise<object[]>}
 */
async function getAllPolls() {

    const {
        data,
        error
    } =
        await supabaseAdmin
            .from(
                POLLS_TABLE_NAME
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


    return Array.isArray(
        data
    )
        ? data
        : [];
}


/**
 * Récupère un sondage par ID.
 *
 * @param {string} pollId
 * @returns {Promise<object|null>}
 */
async function getPollById(
    pollId
) {

    const normalizedPollId =
        normalizeText(
            pollId
        );


    if (
        !normalizedPollId
    ) {

        return null;
    }


    const {
        data,
        error
    } =
        await supabaseAdmin
            .from(
                POLLS_TABLE_NAME
            )
            .select(
                "*"
            )
            .eq(
                "id",
                normalizedPollId
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
   VOTES
========================================================= */

/**
 * Récupère tous les votes.
 *
 * Utilisé par GET pour éviter une requête
 * Supabase par sondage.
 *
 * @returns {Promise<object[]>}
 */
async function getAllVotes() {

    const {
        data,
        error
    } =
        await supabaseAdmin
            .from(
                VOTES_TABLE_NAME
            )
            .select(`
                id,
                poll_id,
                twitch_user_id,
                option_id,
                created_at
            `);


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


/**
 * Récupère les votes d'un sondage.
 *
 * @param {string} pollId
 * @returns {Promise<object[]>}
 */
async function getPollVotes(
    pollId
) {

    const {
        data,
        error
    } =
        await supabaseAdmin
            .from(
                VOTES_TABLE_NAME
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
   VOTE UTILISATEUR
========================================================= */

/**
 * Retourne le vote d'un utilisateur
 * pour un sondage donné.
 *
 * @param {string} pollId
 * @param {string} twitchUserId
 * @returns {Promise<object|null>}
 */
async function getUserVote(
    pollId,
    twitchUserId
) {

    if (
        !pollId ||
        !twitchUserId
    ) {

        return null;
    }


    const {
        data,
        error
    } =
        await supabaseAdmin
            .from(
                VOTES_TABLE_NAME
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
            )
            .eq(
                "twitch_user_id",
                String(
                    twitchUserId
                )
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
   REGROUPEMENT DES VOTES
========================================================= */

/**
 * Regroupe les votes par sondage.
 *
 * @param {object[]} votes
 * @returns {Map<string, object[]>}
 */
function groupVotesByPoll(
    votes
) {

    const map =
        new Map();


    votes.forEach(
        vote => {

            const pollId =
                normalizeText(
                    vote?.poll_id
                );


            if (
                !pollId
            ) {

                return;
            }


            if (
                !map.has(
                    pollId
                )
            ) {

                map.set(
                    pollId,
                    []
                );
            }


            map
                .get(
                    pollId
                )
                .push(
                    vote
                );
        }
    );


    return map;
}


/* =========================================================
   GAGNANT
========================================================= */

/**
 * Retourne l'option gagnante.
 *
 * Si plusieurs options sont à égalité,
 * la première est utilisée.
 *
 * @param {object[]} options
 * @returns {object|null}
 */
function getWinningOption(
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


    let winner =
        null;


    options.forEach(
        option => {

            if (
                !winner ||
                Number(
                    option.votes
                ) >
                Number(
                    winner.votes
                )
            ) {

                winner =
                    option;
            }
        }
    );


    if (
        !winner ||
        Number(
            winner.votes
        ) <=
        0
    ) {

        return null;
    }


    return winner;
}


/* =========================================================
   FORMATAGE D'UN SONDAGE
========================================================= */

/**
 * Convertit une ligne Supabase au format
 * utilisé par polls.js.
 *
 * @param {object} poll
 * @param {object[]} votes
 * @param {object|null} myVote
 * @returns {object|null}
 */
function formatPoll(
    poll,
    votes = [],
    myVote = null
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


    /* =====================================================
       COMPTE DES VOTES
    ====================================================== */

    const voteCounts =
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


            voteCounts.set(
                optionId,
                (
                    voteCounts.get(
                        optionId
                    ) ||
                    0
                ) +
                1
            );
        }
    );


    /* =====================================================
       OPTIONS AVEC VOTES
    ====================================================== */

    const formattedOptions =
        options.map(
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


    /* =====================================================
       TOTAL
    ====================================================== */

    const totalVotes =
        formattedOptions.reduce(
            (
                total,
                option
            ) =>
                total +
                Number(
                    option.votes ||
                    0
                ),
            0
        );


    /* =====================================================
       POURCENTAGES
    ====================================================== */

    formattedOptions.forEach(
        option => {

            option.percentage =
                totalVotes >
                0
                    ? (
                        Number(
                            option.votes
                        ) /
                        totalVotes
                    ) *
                    100
                    : 0;
        }
    );


    /* =====================================================
       STATUT
    ====================================================== */

    const status =
        getPublicPollStatus(
            poll
        );


    /* =====================================================
       CATÉGORIE
    ====================================================== */

    let category =
        normalizeText(
            poll.category
        )
            .toLowerCase();


    /*
     * Compatibilité avec ton ancien sondage
     * de jeux portant le slug "main".
     */
    if (
        !category
    ) {

        category =
            normalizeText(
                poll.slug
            ) ===
            "main"
                ? "games"
                : "community";
    }


    /* =====================================================
       TITRE
    ====================================================== */

    const question =
        normalizeText(
            poll.question
        );


    const title =
        normalizeText(
            poll.title
        ) ||
        question ||
        "Sondage";


    /* =====================================================
       VOTE DU VIEWER
    ====================================================== */

    const selectedOptionId =
        normalizeText(
            myVote?.option_id ??
            myVote
        );


    /* =====================================================
       GAGNANT
    ====================================================== */

    const winningOption =
        getWinningOption(
            formattedOptions
        );


    const storedWinner =
        normalizeText(
            poll.winner ??
            poll.winner_label
        );


    const winner =
        storedWinner ||
        (
            status ===
                "finished"
                ? winningOption
                    ?.label ||
                    ""
                : ""
        );


    /* =====================================================
       VISIBILITÉ DES RÉSULTATS
    ====================================================== */

    const resultsVisible =
        normalizeBoolean(
            poll.results_visible ??
            poll.resultsVisible,
            true
        );


    /* =====================================================
       PROPOSITIONS
    ====================================================== */

    const allowSuggestions =
        normalizeBoolean(
            poll.allow_suggestions ??
            poll.allowSuggestions,
            false
        );


    /* =====================================================
       RETOUR
    ====================================================== */

    return {

        id:
            poll.id ??
            null,

        slug:
            normalizeText(
                poll.slug
            ),

        title,

        question,

        description:
            normalizeText(
                poll.description
            ),

        category,

        status,

        options:
            formattedOptions,

        totalVotes,

        hasVoted:
            Boolean(
                selectedOptionId
            ),

        selectedOptionId:
            selectedOptionId ||
            null,

        myVote:
            selectedOptionId ||
            null,

        startsAt:
            poll.starts_at ??
            poll.startsAt ??
            null,

        endsAt:
            poll.ends_at ??
            poll.endsAt ??
            null,

        resultsVisible,

        allowSuggestions,

        winner:
            winner ||
            null,

        createdAt:
            poll.created_at ??
            null,

        updatedAt:
            poll.updated_at ??
            null

    };
}


/* =========================================================
   GET
========================================================= */

/**
 * GET /api/polls
 *
 * Retourne tous les sondages.
 */
async function handleGet(
    request,
    response
) {

    /* =====================================================
       SESSION TWITCH FACULTATIVE
    ====================================================== */

    const session =
        getPublicUserSession(
            request
        );


    /* =====================================================
       DONNÉES
    ====================================================== */

    const [
        polls,
        votes
    ] =
        await Promise.all([

            getAllPolls(),

            getAllVotes()

        ]);


    /* =====================================================
       REGROUPEMENT DES VOTES
    ====================================================== */

    const votesByPoll =
        groupVotesByPoll(
            votes
        );


    /* =====================================================
       FORMATAGE
    ====================================================== */

    const formattedPolls =
        polls
            .map(
                poll => {

                    const pollId =
                        String(
                            poll.id
                        );


                    const pollVotes =
                        votesByPoll.get(
                            pollId
                        ) ||
                        [];


                    let myVote =
                        null;


                    if (
                        session
                    ) {

                        myVote =
                            pollVotes.find(
                                vote =>
                                    String(
                                        vote.twitch_user_id
                                    ) ===
                                    String(
                                        session.twitchUserId
                                    )
                            ) ||
                            null;
                    }


                    return formatPoll(
                        poll,
                        pollVotes,
                        myVote
                    );
                }
            )
            .filter(
                Boolean
            );


    /* =====================================================
       TRI
    ====================================================== */

    const statusOrder = {

        active:
            0,

        upcoming:
            1,

        finished:
            2

    };


    formattedPolls.sort(
        (
            a,
            b
        ) => {

            const statusDifference =
                (
                    statusOrder[
                        a.status
                    ] ??
                    99
                ) -
                (
                    statusOrder[
                        b.status
                    ] ??
                    99
                );


            if (
                statusDifference !==
                0
            ) {

                return statusDifference;
            }


            const dateA =
                normalizeDate(
                    a.startsAt ??
                    a.createdAt
                )
                    ?.getTime() ||
                0;


            const dateB =
                normalizeDate(
                    b.startsAt ??
                    b.createdAt
                )
                    ?.getTime() ||
                0;


            return (
                dateB -
                dateA
            );
        }
    );


    /* =====================================================
       RÉPONSE
    ====================================================== */

    response
        .status(200)
        .json({

            success:
                true,

            authenticated:
                Boolean(
                    session
                ),

            polls:
                formattedPolls

        });
}


/* =========================================================
   POST — VOTE
========================================================= */

/**
 * POST /api/polls
 *
 * Body :
 *
 * {
 *     pollId: "...",
 *     optionId: "..."
 * }
 */
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
                    "/api/auth/login",

                error:
                    "Tu dois être connecté avec Twitch pour voter."

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


    const pollId =
        normalizeText(
            body.pollId ??
            body.poll_id
        );


    const optionId =
        normalizeText(
            body.optionId ??
            body.option_id ??
            body.id
        );


    /* =====================================================
       POLL ID
    ====================================================== */

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
       OPTION ID
    ====================================================== */

    if (
        !optionId
    ) {

        response
            .status(400)
            .json({

                success:
                    false,

                error:
                    "L'option du vote est obligatoire."

            });


        return;
    }


    /* =====================================================
       SONDAGE
    ====================================================== */

    const poll =
        await getPollById(
            pollId
        );


    if (
        !poll
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


    /* =====================================================
       STATUT
    ====================================================== */

    const publicStatus =
        getPublicPollStatus(
            poll
        );


    if (
        publicStatus ===
        "upcoming"
    ) {

        response
            .status(403)
            .json({

                success:
                    false,

                error:
                    "Ce sondage n'est pas encore ouvert."

            });


        return;
    }


    if (
        publicStatus ===
        "finished"
    ) {

        response
            .status(403)
            .json({

                success:
                    false,

                error:
                    "Ce sondage est terminé."

            });


        return;
    }


    /* =====================================================
       OPTIONS
    ====================================================== */

    const options =
        normalizeOptions(
            poll.options
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
                    "Le sondage ne contient pas assez d'options."

            });


        return;
    }


    const selectedOption =
        options.find(
            option =>
                String(
                    option.id
                ) ===
                String(
                    optionId
                )
        );


    if (
        !selectedOption
    ) {

        response
            .status(404)
            .json({

                success:
                    false,

                error:
                    "Cette option n'existe pas."

            });


        return;
    }


    /* =====================================================
       DÉJÀ VOTÉ
    ====================================================== */

    const existingVote =
        await getUserVote(
            poll.id,
            session.twitchUserId
        );


    if (
        existingVote
    ) {

        const votes =
            await getPollVotes(
                poll.id
            );


        response
            .status(409)
            .json({

                success:
                    false,

                alreadyVoted:
                    true,

                myVote:
                    existingVote.option_id,

                poll:
                    formatPoll(
                        poll,
                        votes,
                        existingVote
                    ),

                error:
                    "Tu as déjà voté pour ce sondage."

            });


        return;
    }


    /* =====================================================
       INSERTION DU VOTE
    ====================================================== */

    const {
        error:
            insertError
    } =
        await supabaseAdmin
            .from(
                VOTES_TABLE_NAME
            )
            .insert({

                poll_id:
                    String(
                        poll.id
                    ),

                twitch_user_id:
                    String(
                        session.twitchUserId
                    ),

                option_id:
                    String(
                        optionId
                    )

            });


    /* =====================================================
       ERREUR INSERTION
    ====================================================== */

    if (
        insertError
    ) {

        /*
         * 23505 :
         *
         * contrainte UNIQUE PostgreSQL.
         *
         * Même si deux requêtes de vote
         * arrivent simultanément, une seule
         * pourra être enregistrée.
         */
        if (
            String(
                insertError.code
            ) ===
            "23505"
        ) {

            const existing =
                await getUserVote(
                    poll.id,
                    session.twitchUserId
                );


            const votes =
                await getPollVotes(
                    poll.id
                );


            response
                .status(409)
                .json({

                    success:
                        false,

                    alreadyVoted:
                        true,

                    myVote:
                        existing
                            ?.option_id ??
                        null,

                    poll:
                        formatPoll(
                            poll,
                            votes,
                            existing
                        ),

                    error:
                        "Tu as déjà voté pour ce sondage."

                });


            return;
        }


        console.error(
            "[Poll Vote Insert]",
            insertError
        );


        response
            .status(500)
            .json({

                success:
                    false,

                error:
                    getSupabaseErrorMessage(
                        insertError
                    )

            });


        return;
    }


    /* =====================================================
       RÉSULTAT ACTUALISÉ
    ====================================================== */

    const votes =
        await getPollVotes(
            poll.id
        );


    const myVote = {

        option_id:
            optionId

    };


    const formattedPoll =
        formatPoll(
            poll,
            votes,
            myVote
        );


    const formattedOption =
        formattedPoll
            ?.options
            ?.find(
                option =>
                    String(
                        option.id
                    ) ===
                    String(
                        optionId
                    )
            ) ||
        null;


    /* =====================================================
       RÉPONSE
    ====================================================== */

    response
        .status(200)
        .json({

            success:
                true,

            authenticated:
                true,

            alreadyVoted:
                false,

            myVote:
                optionId,

            message:
                `Ton vote pour "${selectedOption.label}" a bien été enregistré ! 💜`,

            option:
                formattedOption,

            poll:
                formattedPoll

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
               GET
            ============================================= */

            case "GET":

                await handleGet(
                    request,
                    response
                );


                return;


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
                    "GET, POST"
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
            "[Public Polls]",
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
                    "Impossible de charger les sondages."

            });
    }
}