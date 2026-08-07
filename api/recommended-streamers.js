"use strict";

/* =========================================================
   IMPORTS
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
 *     login: "login_twitch"
 * }
 *
 * Le login doit correspondre au nom présent
 * dans l’adresse twitch.tv/login_twitch.
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
        login: "xiriavt",
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
    }
];


/* =========================================================
   CORS ET CACHE
========================================================= */

function setCorsHeaders(response) {
    response.setHeader(
        "Access-Control-Allow-Origin",
        "*"
    );

    response.setHeader(
        "Access-Control-Allow-Methods",
        "GET, OPTIONS"
    );

    response.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );
}


function setCacheHeaders(response) {
    response.setHeader(
        "Cache-Control",
        [
            "public",
            "s-maxage=60",
            "stale-while-revalidate=120"
        ].join(", ")
    );
}


/* =========================================================
   OUTILS
========================================================= */

/**
 * Normalise un login Twitch.
 *
 * @param {unknown} value
 * @returns {string}
 */
function normalizeLogin(value) {
    return String(value ?? "")
        .trim()
        .toLowerCase();
}

/**
 * Normalise une catégorie de recommandation.
 *
 * @param {unknown} value
 * @returns {"friends"|"international"|"favorites"}
 */
function normalizeCategory(value) {
    const category =
        String(value ?? "")
            .trim()
            .toLowerCase();

    const allowedCategories = [
        "friends",
        "international",
        "favorites"
    ];

    return allowedCategories.includes(category)
        ? category
        : "favorites";
}


/**
 * Retourne un message d’erreur lisible.
 *
 * @param {unknown} error
 * @returns {string}
 */
function getErrorMessage(error) {
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


/**
 * Construit une requête avec plusieurs
 * paramètres identiques.
 *
 * Exemple :
 *
 * login=myo_faunette&login=celanyavt
 *
 * @param {string} parameterName
 * @param {string[]} values
 * @returns {string}
 */
function createRepeatedParameters(
    parameterName,
    values
) {
    const parameters =
        new URLSearchParams();

    values.forEach((value) => {
        parameters.append(
            parameterName,
            value
        );
    });

    return parameters.toString();
}


/* =========================================================
   TWITCH
========================================================= */

/**
 * Récupère les profils Twitch.
 *
 * @param {string[]} logins
 * @returns {Promise<object[]>}
 */
async function getUsers(logins) {
    if (logins.length === 0) {
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

    return Array.isArray(result?.data)
        ? result.data
        : [];
}


/**
 * Récupère les lives actifs.
 *
 * Les chaînes hors ligne ne sont pas
 * retournées par Twitch.
 *
 * @param {string[]} logins
 * @returns {Promise<object[]>}
 */
async function getStreams(logins) {
    if (logins.length === 0) {
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

    return Array.isArray(result?.data)
        ? result.data
        : [];
}


/* =========================================================
   FUSION DES DONNÉES
========================================================= */

/**
 * Fusionne les profils et les lives.
 *
 * @param {object[]} users
 * @param {object[]} streams
 * @returns {object[]}
 */
function createStreamerResults(
    users,
    streams
) {
    const usersByLogin =
        new Map();

    users.forEach((user) => {
        const login =
            normalizeLogin(
                user?.login
            );

        if (login) {
            usersByLogin.set(
                login,
                user
            );
        }
    });


    const streamsByLogin =
        new Map();

    streams.forEach((stream) => {
        const login =
            normalizeLogin(
                stream?.user_login
            );

        if (login) {
            streamsByLogin.set(
                login,
                stream
            );
        }
    });


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

                /*
                 * Login invalide ou compte absent.
                 */
                if (!user) {
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
                    Boolean(stream);

                return {
                    id:
                        String(
                            user.id ??
                            ""
                        ),

                    login,

                    displayName:
                        String(
                            user.display_name ||
                            user.login ||
                            configuredLogin
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
                    const categoryOrder = {
                        friends: 0,
                        international: 1,
                        favorites: 2
                    };

                    /*
                    * 1. On range d'abord
                    * les streamers par catégorie.
                    */
                    const firstCategoryPosition =
                        categoryOrder[
                            firstStreamer.category
                        ] ?? 999;

                    const secondCategoryPosition =
                        categoryOrder[
                            secondStreamer.category
                        ] ?? 999;

                    if (
                        firstCategoryPosition !==
                        secondCategoryPosition
                    ) {
                        return (
                            firstCategoryPosition -
                            secondCategoryPosition
                        );
                    }


                    /*
                    * 2. À l'intérieur d'une catégorie,
                    * les streamers en live passent devant.
                    */
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


                    /*
                    * 3. Pour le reste,
                    * on respecte ton ordre manuel.
                    */
                    return (
                        firstStreamer.originalIndex -
                        secondStreamer.originalIndex
                    );
                }
            )
        .map((streamer) => {
            const {
                originalIndex,
                ...publicStreamer
            } = streamer;

            return publicStreamer;
        });
}


/* =========================================================
   ROUTE VERCEL
========================================================= */

/**
 * GET /api/recommended-streamers
 */
export default async function handler(
    request,
    response
) {
    setCorsHeaders(response);

    if (
        request.method === "OPTIONS"
    ) {
        response
            .status(204)
            .end();

        return;
    }

    if (
        request.method !== "GET"
    ) {
        response.setHeader(
            "Allow",
            "GET, OPTIONS"
        );

        response
            .status(405)
            .json({
                success:
                    false,

                error:
                    "Méthode non autorisée.",

                allowedMethods: [
                    "GET",
                    "OPTIONS"
                ]
            });

        return;
    }

    try {
        const logins =
            RECOMMENDED_STREAMERS
                .map((streamer) => {
                    return normalizeLogin(
                        streamer.login
                    );
                })
                .filter(Boolean);

        const [
            users,
            streams
        ] = await Promise.all([
            getUsers(logins),
            getStreams(logins)
        ]);

        const streamers =
            createStreamerResults(
                users,
                streams
            );

        const liveCount =
            streamers.filter(
                (streamer) => {
                    return streamer.live;
                }
            ).length;

        setCacheHeaders(response);

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
    } catch (error) {
        const errorMessage =
            getErrorMessage(
                error
            );

        console.error(
            "[Twitch API] Streamers recommandés :",
            error
        );

        response
            .status(500)
            .json({
                success:
                    false,

                error:
                    "Impossible de récupérer les chaînes recommandées.",

                details:
                    errorMessage
            });
    }
}