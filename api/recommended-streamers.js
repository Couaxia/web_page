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
 * Tu modifies uniquement cette liste pour ajouter,
 * supprimer ou réorganiser les chaînes.
 *
 * Utilise le login Twitch exact, sans l’adresse complète.
 */

const RECOMMENDED_STREAMERS = [
    {
        login: "myo_faunette",

        description:
            "Faunette, streameuse et grande partenaire de bêtises.",

        tags: [
            "VTuber",
            "Multi-gaming",
            "Collab"
        ]
    },

    {
        login: "celanyavt",

        description:
            "Une créatrice pleine de douceur et d’énergie.",

        tags: [
            "VTuber",
            "Folle"
        ]
    },

    {
        login: "sorine_e",

        description:
            "Des streams chaleureux et beaucoup de bonne humeur.",

        tags: [
            "Gaming",
            "Chill"
        ]
    },

    {
        login: "maman_mikii",

        description:
            "Une communauté accueillante et des moments très drôles.",

        tags: [
            "VTuber",
            "Chill"
        ]
    },

    {
        login: "babyhawk_yt",

        description:
            "Un créateur à découvrir un peu plus chaque jour, avec des streams variés et fun.",

        tags: [
            "VTuber",
            "Multi-gaming"
        ]
    }
];


/* =========================================================
   CORS
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


/* =========================================================
   CACHE
========================================================= */

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
 * Nettoie un login Twitch.
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
 * Construit une requête Twitch possédant
 * plusieurs paramètres identiques.
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


/**
 * Remplace les variables de taille
 * d’une miniature Twitch.
 *
 * @param {unknown} value
 * @param {number} width
 * @param {number} height
 * @returns {string}
 */
function formatThumbnail(
    value,
    width = 640,
    height = 360
) {
    return String(value ?? "")
        .replace(
            "{width}",
            String(width)
        )
        .replace(
            "{height}",
            String(height)
        );
}


/* =========================================================
   REQUÊTES TWITCH
========================================================= */

/**
 * Récupère les utilisateurs Twitch.
 *
 * @param {string[]} logins
 * @returns {Promise<object[]>}
 */
async function getRecommendedUsers(logins) {
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
 * Récupère les lives actuellement actifs.
 *
 * Les chaînes hors ligne ne sont pas renvoyées
 * par Twitch dans cette réponse.
 *
 * @param {string[]} logins
 * @returns {Promise<object[]>}
 */
async function getRecommendedStreams(logins) {
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
   FORMATAGE DE LA RÉPONSE
========================================================= */

/**
 * Fusionne :
 *
 * - la configuration manuelle ;
 * - le profil Twitch ;
 * - le statut du live.
 *
 * @param {object[]} users
 * @param {object[]} streams
 * @returns {object[]}
 */
function createRecommendedStreamerResults(
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
                originalPosition
            ) => {
                const login =
                    normalizeLogin(
                        configuredStreamer.login
                    );

                const user =
                    usersByLogin.get(login);

                /*
                 * Le compte peut avoir été supprimé
                 * ou le login peut être incorrect.
                 */
                if (!user) {
                    return null;
                }

                const stream =
                    streamsByLogin.get(login);

                const live =
                    Boolean(stream);

                return {
                    id:
                        String(user.id ?? ""),

                    login:
                        normalizeLogin(
                            user.login
                        ),

                    displayName:
                        String(
                            user.display_name ||
                            user.login ||
                            configuredStreamer.login
                        ),

                    profileImageUrl:
                        String(
                            user.profile_image_url ||
                            ""
                        ),

                    description:
                        String(
                            configuredStreamer.description ||
                            user.description ||
                            ""
                        ),

                    twitchDescription:
                        String(
                            user.description ||
                            ""
                        ),

                    tags:
                        Array.isArray(
                            configuredStreamer.tags
                        )
                            ? configuredStreamer.tags
                            : [],

                    channelUrl:
                        `https://www.twitch.tv/${encodeURIComponent(
                            login
                        )}`,

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
                            ? String(
                                stream.started_at ||
                                ""
                            )
                            : "",

                    language:
                        live
                            ? String(
                                stream.language ||
                                ""
                            )
                            : "",

                    thumbnailUrl:
                        live
                            ? formatThumbnail(
                                stream.thumbnail_url,
                                640,
                                360
                            )
                            : "",

                    isMature:
                        live
                            ? Boolean(
                                stream.is_mature
                            )
                            : false,

                    originalPosition
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
                 * Les lives passent devant.
                 */
                if (
                    firstStreamer.live !==
                    secondStreamer.live
                ) {
                    return Number(
                        secondStreamer.live
                    ) - Number(
                        firstStreamer.live
                    );
                }

                /*
                 * Parmi les lives :
                 * plus grand nombre de viewers en premier.
                 */
                if (
                    firstStreamer.live &&
                    secondStreamer.live &&
                    firstStreamer.viewerCount !==
                    secondStreamer.viewerCount
                ) {
                    return (
                        secondStreamer.viewerCount -
                        firstStreamer.viewerCount
                    );
                }

                /*
                 * Sinon on garde l’ordre
                 * de ta configuration.
                 */
                return (
                    firstStreamer.originalPosition -
                    secondStreamer.originalPosition
                );
            }
        )
        .map((streamer) => {
            const {
                originalPosition,
                ...publicStreamer
            } = streamer;

            return publicStreamer;
        });
}


/* =========================================================
   ROUTE VERCEL
========================================================= */

/**
 * Route :
 *
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

        if (logins.length === 0) {
            setCacheHeaders(response);

            response
                .status(200)
                .json({
                    success:
                        true,

                    fetchedAt:
                        new Date()
                            .toISOString(),

                    streamers:
                        []
                });

            return;
        }


        const [
            users,
            streams
        ] = await Promise.all([
            getRecommendedUsers(
                logins
            ),

            getRecommendedStreams(
                logins
            )
        ]);


        const streamers =
            createRecommendedStreamerResults(
                users,
                streams
            );


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

                liveCount:
                    streamers.filter(
                        (streamer) => {
                            return streamer.live;
                        }
                    ).length,

                streamers
            });
    } catch (error) {
        const errorMessage =
            getErrorMessage(
                error
            );

        console.error(
            "[Twitch API] Erreur recommended-streamers :",
            error
        );

        response
            .status(500)
            .json({
                success:
                    false,

                error:
                    "Impossible de récupérer les streamers recommandés.",

                /*
                 * Garde temporairement ce champ
                 * pour faciliter les tests.
                 */
                details:
                    errorMessage
            });
    }
}