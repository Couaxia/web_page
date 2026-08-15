"use strict";

/* =========================================================
   API PUBLIQUE — SONDAGE
   COUAXIA

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

const TABLE_NAME =
    "polls";


const VOTES_TABLE_NAME =
    "poll_votes";


const POLL_SLUG =
    "main";


const MAX_OPTIONS =
    10;


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


function normalizeStatus(
    value
) {

    const status =
        normalizeText(
            value
        )
            .toLowerCase();


    return (
        status ===
        "open"
            ? "open"
            : "closed"
    );
}


/* =========================================================
   OPTIONS
========================================================= */

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

            votes:
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
            option.text
        );


    if (
        !label
    ) {

        return null;
    }


    return {

        id:
            normalizeText(
                option.id
            ) ||
            String(
                index + 1
            ),

        label,

        votes:
            0

    };
}


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
   SUPABASE
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
   SONDAGE ACTUEL
========================================================= */

async function getCurrentPoll() {

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


    if (
        error
    ) {

        throw error;
    }


    return data;
}


/* =========================================================
   VOTES DU SONDAGE
========================================================= */

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
   FORMATAGE DU SONDAGE
========================================================= */

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


    return {

        id:
            poll.id ??
            null,

        question:
            normalizeText(
                poll.question
            ),

        status:
            normalizeStatus(
                poll.status
            ),

        options:
            formattedOptions,

        totalVotes,

        myVote:
            normalizeText(
                myVote
            ) ||
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

async function handleGet(
    request,
    response
) {

    const poll =
        await getCurrentPoll();


    if (
        !poll
    ) {

        response
            .status(200)
            .json({

                success:
                    true,

                open:
                    false,

                authenticated:
                    Boolean(
                        getPublicUserSession(
                            request
                        )
                    ),

                myVote:
                    null,

                poll:
                    null

            });


        return;
    }


    const session =
        getPublicUserSession(
            request
        );


    const votes =
        await getPollVotes(
            poll.id
        );


    let myVote =
        null;


    if (
        session
    ) {

        const userVote =
            await getUserVote(
                poll.id,
                session.twitchUserId
            );


        myVote =
            userVote
                ?.option_id ??
            null;
    }


    const formattedPoll =
        formatPoll(
            poll,
            votes,
            myVote
        );


    response
        .status(200)
        .json({

            success:
                true,

            authenticated:
                Boolean(
                    session
                ),

            open:
                formattedPoll.status ===
                "open",

            myVote:
                normalizeText(
                    myVote
                ) ||
                null,

            poll:
                formattedPoll

        });
}


/* =========================================================
   POST
========================================================= */

async function handlePost(
    request,
    response
) {

    /* =====================================================
       AUTHENTIFICATION
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


    const optionId =
        normalizeText(
            body.optionId ??
            body.option_id ??
            body.id
        );


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
        await getCurrentPoll();


    if (
        !poll
    ) {

        response
            .status(404)
            .json({

                success:
                    false,

                error:
                    "Aucun sondage n'est disponible."

            });


        return;
    }


    const requestedPollId =
        normalizeText(
            body.pollId ??
            body.poll_id
        );


    if (
        requestedPollId &&
        requestedPollId !==
        String(
            poll.id
        )
    ) {

        response
            .status(409)
            .json({

                success:
                    false,

                error:
                    "Ce sondage n'est plus le sondage actuel."

            });


        return;
    }


    if (
        normalizeStatus(
            poll.status
        ) !==
        "open"
    ) {

        response
            .status(403)
            .json({

                success:
                    false,

                error:
                    "Le sondage est actuellement fermé."

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
                        existingVote.option_id
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


    if (
        insertError
    ) {

        /*
         * 23505 =
         * contrainte UNIQUE PostgreSQL.
         *
         * Même si deux requêtes arrivent
         * au même instant, la seconde est refusée.
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
                                ?.option_id ??
                            null
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


    const formattedPoll =
        formatPoll(
            poll,
            votes,
            optionId
        );


    const formattedOption =
        formattedPoll.options.find(
            option =>
                String(
                    option.id
                ) ===
                String(
                    optionId
                )
        );


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
                formattedOption ??
                null,

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

    response.setHeader(
        "Cache-Control",
        "no-store, max-age=0"
    );


    try {

        switch (
            request.method
        ) {

            case "GET":

                await handleGet(
                    request,
                    response
                );

                return;


            case "POST":

                await handlePost(
                    request,
                    response
                );

                return;


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
            "[Public Poll]",
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
                    "Impossible de charger le sondage."

            });
    }
}