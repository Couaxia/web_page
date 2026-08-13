"use strict";

/* =========================================================
   API TWITCH — STREAMERS RECOMMANDÉS
   COUAXIA
========================================================= */

import {
    twitchFetch
} from "./auth.js";


/* =========================================================
   STREAMERS RECOMMANDÉS
========================================================= */

/*
 * Pour ajouter une personne :
 *
 * {
 *     login: "login_twitch",
 *     category: "friends"
 * }
 *
 * Catégories disponibles :
 *
 * friends
 * international
 * favorites
 */

const RECOMMENDED_STREAMERS = [

    {
        login: "myo_faunette",
        category: "friends"
    },

    {
        login: "celanyavt",
        category: "friends"
    },

    {
        login: "sorine_e",
        category: "friends"
    },

    {
        login: "maman_mikii",
        category: "friends"
    },

    {
        login: "babyhawk_vt",
        category: "friends"
    },

    {
        login: "Nymya_VT",
        category: "friends"
    },

    {
        login: "LykaMonarch",
        category: "favorites"
    },

    {
        login: "rvbyabyss",
        category: "friends"
    },

    {
        login: "YuTo_Mbc",
        category: "friends"
    },

    {
        login: "louxifr",
        category: "friends"
    },

    {
        login: "kimori_004",
        category: "friends"
    },

    {
        login: "Lunyvee",
        category: "friends"
    },

    {
        login: "Subbarath",
        category: "friends"
    },

    {
        login: "leareinepoulpe",
        category: "friends"
    },

    {
        login: "frouxyi",
        category: "friends"
    },

    {
        login: "sayarhe",
        category: "favorites"
    },

    {
        login: "omelyth",
        category: "friends"
    },

    {
        login: "petiteorca",
        category: "friends"
    },

    {
        login: "000dracko000",
        category: "friends"
    },

    {
        login: "vaxiria",
        category: "friends"
    },

    {
        login: "dreagonm",
        category: "friends"
    },

    {
        login: "vtyukiuwu",
        category: "favorites"
    },

    {
        login: "kuroka59",
        category: "friends"
    },

    {
        login: "ironmouse",
        category: "international"
    },

    {
        login: "natomiie",
        category: "international"
    },

    {
        login: "queenie",
        category: "international"
    },

    {
        login: "sinder",
        category: "international"
    },

    {
        login: "melibellule",
        category: "favorites"
    },

    {
        login: "keola",
        category: "favorites"
    },

    {
        login: "AuroraLeonisVT",
        category: "international"
    },

    {
        login: "biyona",
        category: "favorites"
    },

    {
        login: "yesseniavo",
        category: "international"
    },

    {
        login: "laynalazar",
        category: "international"
    },

    {
        login: "pakyotille",
        category: "favorites"
    },

    {
        login: "wankilstudio",
        category: "favorites"
    },

    {
        login: "nallena_vwolf",
        category: "favorites"
    },

    {
        login: "fengaryx",
        category: "favorites"
    },

    {
        login: "kammy64",
        category: "favorites"
    },

    {
        login: "sunray",
        category: "favorites"
    },

    {
        login: "Maiyasu",
        category: "friends"
    },

    {
        login: "yuutooushiro",
        category: "friends"
    },

    {
        login: "selini_s",
        category: "friends"
    },

    {
        login: "MrButler_17",
        category: "favorites"
    },

    {
        login: "PiikaNya",
        category: "friends"
    }

];


/* =========================================================
   CATÉGORIES
========================================================= */

const CATEGORY_ORDER = {

    friends: 0,

    international: 1,

    favorites: 2

};


const ALLOWED_CATEGORIES =
    new Set(
        Object.keys(
            CATEGORY_ORDER
        )
    );


/* =========================================================
   OUTILS
========================================================= */

function normalizeLogin(
    value
) {

    return String(
        value ?? ""
    )
        .trim()
        .toLowerCase();
}


function normalizeCategory(
    value
) {

    const category =
        String(
            value ?? ""
        )
            .trim()
            .toLowerCase();


    return ALLOWED_CATEGORIES.has(
        category
    )
        ? category
        : "favorites";
}


function getErrorMessage(
    error
) {

    if (
        error instanceof Error &&
        error.message
    ) {

        return error.message;
    }


    return String(
        error ||
        "Erreur inconnue."
    );
}


function getRecommendedLogins() {

    return [
        ...new Set(
            RECOMMENDED_STREAMERS
                .map(
                    streamer =>
                        normalizeLogin(
                            streamer.login
                        )
                )
                .filter(Boolean)
        )
    ];
}


function createRepeatedParameters(
    parameterName,
    values
) {

    const parameters =
        new URLSearchParams();


    for (
        const value of
        values
    ) {

        parameters.append(
            parameterName,
            value
        );
    }


    return parameters.toString();
}


/* =========================================================
   TWITCH — USERS
========================================================= */

async function getUsers(
    logins
) {

    if (
        logins.length === 0
    ) {

        return [];
    }


    const query =
        createRepeatedParameters(
            "login",
            logins
        );


    const result =
        await twitchFetch(
            `/users?${query}`
        );


    return Array.isArray(
        result?.data
    )
        ? result.data
        : [];
}


/* =========================================================
   TWITCH — STREAMS
========================================================= */

async function getStreams(
    logins
) {

    if (
        logins.length === 0
    ) {

        return [];
    }


    const query =
        createRepeatedParameters(
            "user_login",
            logins
        );


    const result =
        await twitchFetch(
            `/streams?${query}`
        );


    return Array.isArray(
        result?.data
    )
        ? result.data
        : [];
}


/* =========================================================
   FORMATAGE
========================================================= */

function createStreamerResults(
    users,
    streams
) {

    const usersByLogin =
        new Map();


    for (
        const user of
        users
    ) {

        const login =
            normalizeLogin(
                user?.login
            );


        if (
            login
        ) {

            usersByLogin.set(
                login,
                user
            );
        }
    }


    const streamsByLogin =
        new Map();


    for (
        const stream of
        streams
    ) {

        const login =
            normalizeLogin(
                stream?.user_login
            );


        if (
            login
        ) {

            streamsByLogin.set(
                login,
                stream
            );
        }
    }


    return RECOMMENDED_STREAMERS

        .map(
            (
                configuredStreamer,
                originalIndex
            ) => {

                const configuredLogin =
                    normalizeLogin(
                        configuredStreamer.login
                    );


                const user =
                    usersByLogin.get(
                        configuredLogin
                    );


                if (
                    !user
                ) {

                    return null;
                }


                const login =
                    normalizeLogin(
                        user.login
                    );


                const stream =
                    streamsByLogin.get(
                        login
                    );


                const live =
                    Boolean(
                        stream
                    );


                return {

                    id:
                        String(
                            user.id ?? ""
                        ),

                    login,

                    displayName:
                        String(
                            user.display_name ||
                            user.login ||
                            configuredLogin
                        ),

                    description:
                        String(
                            user.description ||
                            ""
                        ),

                    profileImageUrl:
                        String(
                            user.profile_image_url ||
                            ""
                        ),

                    channelUrl:
                        `https://www.twitch.tv/${encodeURIComponent(
                            login
                        )}`,

                    category:
                        normalizeCategory(
                            configuredStreamer.category
                        ),

                    live,

                    gameId:
                        live
                            ? String(
                                stream.game_id ||
                                ""
                            )
                            : "",

                    gameName:
                        live
                            ? String(
                                stream.game_name ||
                                ""
                            )
                            : "",

                    title:
                        live
                            ? String(
                                stream.title ||
                                ""
                            )
                            : "",

                    viewerCount:
                        live
                            ? Number(
                                stream.viewer_count ||
                                0
                            )
                            : 0,

                    startedAt:
                        live
                            ? stream.started_at ||
                              null
                            : null,

                    language:
                        live
                            ? stream.language ||
                              null
                            : null,

                    thumbnailUrl:
                        live &&
                        stream.thumbnail_url
                            ? String(
                                stream.thumbnail_url
                            )
                                .replace(
                                    "{width}",
                                    "440"
                                )
                                .replace(
                                    "{height}",
                                    "248"
                                )
                            : null,

                    originalIndex

                };
            }
        )

        .filter(Boolean)

        .sort(
            (
                firstStreamer,
                secondStreamer
            ) => {

                const firstCategoryPosition =
                    CATEGORY_ORDER[
                        firstStreamer.category
                    ] ??
                    999;


                const secondCategoryPosition =
                    CATEGORY_ORDER[
                        secondStreamer.category
                    ] ??
                    999;


                if (
                    firstCategoryPosition !==
                    secondCategoryPosition
                ) {

                    return (
                        firstCategoryPosition -
                        secondCategoryPosition
                    );
                }


                if (
                    firstStreamer.live !==
                    secondStreamer.live
                ) {

                    return (
                        Number(
                            secondStreamer.live
                        ) -
                        Number(
                            firstStreamer.live
                        )
                    );
                }


                return (
                    firstStreamer.originalIndex -
                    secondStreamer.originalIndex
                );
            }
        )

        .map(
            streamer => {

                const {
                    originalIndex,
                    ...publicStreamer
                } =
                    streamer;


                return publicStreamer;
            }
        );
}


/* =========================================================
   API HTTP
========================================================= */

/**
 * GET /api/recommended-streamers
 *
 * GET /api/recommended-streamers?category=friends
 *
 * GET /api/recommended-streamers?category=international
 *
 * GET /api/recommended-streamers?category=favorites
 *
 * GET /api/recommended-streamers?liveOnly=true
 */
export default async function handler(
    request,
    response
) {

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

                streamers:
                    [],

                error:
                    "Méthode non autorisée."

            });


        return;
    }


    try {

        /* =================================================
           LOGINS
        ================================================== */

        const logins =
            getRecommendedLogins();


        /* =================================================
           TWITCH
        ================================================== */

        const [
            users,
            streams
        ] =
            await Promise.all([

                getUsers(
                    logins
                ),

                getStreams(
                    logins
                )

            ]);


        /* =================================================
           FUSION
        ================================================== */

        let streamers =
            createStreamerResults(
                users,
                streams
            );


        /* =================================================
           FILTRE CATÉGORIE
        ================================================== */

        const requestedCategory =
            String(
                request.query
                    ?.category ??
                ""
            )
                .trim()
                .toLowerCase();


        if (
            requestedCategory &&
            ALLOWED_CATEGORIES.has(
                requestedCategory
            )
        ) {

            streamers =
                streamers.filter(
                    streamer =>
                        streamer.category ===
                        requestedCategory
                );
        }


        /* =================================================
           LIVE UNIQUEMENT
        ================================================== */

        const liveOnly =
            [
                "true",
                "1",
                "yes",
                "oui"
            ].includes(
                String(
                    request.query
                        ?.liveOnly ??
                    request.query
                        ?.live_only ??
                    ""
                )
                    .trim()
                    .toLowerCase()
            );


        if (
            liveOnly
        ) {

            streamers =
                streamers.filter(
                    streamer =>
                        streamer.live
                );
        }


        /* =================================================
           STATISTIQUES
        ================================================== */

        const liveCount =
            streamers.filter(
                streamer =>
                    streamer.live
            )
                .length;


        /* =================================================
           RÉPONSE
        ================================================== */

        response
            .status(200)
            .json({

                success:
                    true,

                fetchedAt:
                    new Date()
                        .toISOString(),

                returned:
                    streamers.length,

                liveCount,

                streamers

            });


    } catch (
        error
    ) {

        const errorMessage =
            getErrorMessage(
                error
            );


        console.error(
            "[Recommended Streamers API]",
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

                streamers:
                    [],

                error:
                    "Impossible de récupérer les chaînes recommandées.",

                details:
                    errorMessage

            });
    }
}