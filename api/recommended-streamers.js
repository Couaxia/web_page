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
        login: "myo_faunette"
    },
    {
        login: "celanyavt"
    },
    {
        login: "sorine_e"
    },
    {
        login: "maman_mikii"
    },
    {
        login: "babyhawk_vt"
    },
    {
        login: "Nymya_VT"
    },
    {
        login: "LykaMonarch"
    },
    {
        login: "rvbyabyss"
    },
    {
        login: "YuTo_Mbc"
    },
    {
        login: "louxifr"
    },
    {
        login: "kimori_004"
    },
    {
        login: "Lunyvee"
    },
    {
        login: "Subbarath"
    },
    {
        login: "leareinepoulpe"
    },
    {
        login: "frouxyi"
    },
    {
        login: "sayarhe"
    },
    {
        login: "omelyth"
    },
    {
        login: "petiteorca"
    },
    {
        login: "000dracko000"
    },
    {
        login: "xiriavt"
    },
    {
        login: "dreagonm"
    },
    {
        login: "vtyukiuwu"
    },
    {
        login: "kuroka59"
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
                /*
                 * Les lives apparaissent en premier.
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
                 * Ensuite, on conserve l’ordre
                 * de ta liste.
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