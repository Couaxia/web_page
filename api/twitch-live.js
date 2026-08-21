"use strict";

/* =========================================================
   API PUBLIQUE — STATUT LIVE TWITCH
   COUAXIA
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const TWITCH_API_BASE =
    "https://api.twitch.tv/helix";


const TWITCH_OAUTH_BASE =
    "https://id.twitch.tv/oauth2/token";


/*
 * Nom de la chaîne à surveiller.
 *
 * Tu peux définir TWITCH_CHANNEL_LOGIN=Couaxia
 * dans les variables d'environnement.
 */
const TWITCH_CHANNEL_LOGIN =
    String(
        process.env.TWITCH_CHANNEL_LOGIN ??
        "Couaxia"
    )
        .trim()
        .toLowerCase();


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
   VARIABLES TWITCH
========================================================= */

function getTwitchCredentials() {

    const clientId =
        normalizeText(
            process.env.TWITCH_CLIENT_ID
        );


    const clientSecret =
        normalizeText(
            process.env.TWITCH_CLIENT_SECRET
        );


    return {
        clientId,
        clientSecret
    };
}


/* =========================================================
   TOKEN APP TWITCH
========================================================= */

async function getAppAccessToken() {

    const {
        clientId,
        clientSecret
    } =
        getTwitchCredentials();


    if (
        !clientId ||
        !clientSecret
    ) {

        throw new Error(
            "TWITCH_CLIENT_ID ou TWITCH_CLIENT_SECRET manquant."
        );
    }


    const url =
        new URL(
            TWITCH_OAUTH_BASE
        );


    url.searchParams.set(
        "client_id",
        clientId
    );


    url.searchParams.set(
        "client_secret",
        clientSecret
    );


    url.searchParams.set(
        "grant_type",
        "client_credentials"
    );


    const twitchResponse =
        await fetch(
            url,
            {
                method:
                    "POST",

                headers: {
                    "Accept":
                        "application/json"
                }
            }
        );


    const payload =
        await twitchResponse
            .json()
            .catch(
                () => ({})
            );


    if (
        !twitchResponse.ok
    ) {

        console.error(
            "[Twitch Live] Erreur OAuth Twitch :",
            twitchResponse.status,
            payload
        );


        throw new Error(
            "Impossible d'obtenir le token Twitch."
        );
    }


    const accessToken =
        normalizeText(
            payload?.access_token
        );


    if (
        !accessToken
    ) {

        throw new Error(
            "Twitch n'a pas renvoyé de token d'accès."
        );
    }


    return accessToken;
}


/* =========================================================
   APPEL HELIX
========================================================= */

async function twitchHelixRequest(
    path,
    accessToken
) {

    const {
        clientId
    } =
        getTwitchCredentials();


    const twitchResponse =
        await fetch(
            `${TWITCH_API_BASE}${path}`,
            {
                method:
                    "GET",

                headers: {

                    "Client-Id":
                        clientId,

                    "Authorization":
                        `Bearer ${accessToken}`,

                    "Accept":
                        "application/json"
                }
            }
        );


    const payload =
        await twitchResponse
            .json()
            .catch(
                () => ({})
            );


    if (
        !twitchResponse.ok
    ) {

        console.error(
            "[Twitch Live] Erreur Helix :",
            twitchResponse.status,
            payload
        );


        throw new Error(
            `Erreur Twitch Helix (${twitchResponse.status}).`
        );
    }


    return payload;
}


/* =========================================================
   MINIATURE TWITCH
========================================================= */

function buildThumbnailUrl(
    template
) {

    const value =
        normalizeText(
            template
        );


    if (
        !value
    ) {

        return null;
    }


    /*
     * Twitch renvoie par exemple :
     *
     * .../{width}x{height}.jpg
     *
     * On choisit une taille raisonnable pour
     * notre notification.
     */

    return value
        .replace(
            "{width}",
            "640"
        )
        .replace(
            "{height}",
            "360"
        );
}


/* =========================================================
   FORMAT LIVE
========================================================= */

function formatStream(
    stream
) {

    if (
        !stream
    ) {

        return null;
    }


    return {

        /* =============================================
           IDENTIFIANTS
        ============================================== */

        id:
            normalizeText(
                stream.id
            ) ||
            null,


        userId:
            normalizeText(
                stream.user_id
            ) ||
            null,


        userLogin:
            normalizeText(
                stream.user_login
            ) ||
            TWITCH_CHANNEL_LOGIN,


        userName:
            normalizeText(
                stream.user_name
            ) ||
            "Couaxia",


        /* =============================================
           LIVE
        ============================================== */

        title:
            normalizeText(
                stream.title
            ),


        gameId:
            normalizeText(
                stream.game_id
            ) ||
            null,


        game:
            normalizeText(
                stream.game_name
            ),


        viewers:
            Number.isFinite(
                Number(
                    stream.viewer_count
                )
            )
                ? Number(
                    stream.viewer_count
                )
                : 0,


        startedAt:
            normalizeText(
                stream.started_at
            ) ||
            null,


        language:
            normalizeText(
                stream.language
            ) ||
            null,


        /* =============================================
           IMAGE
        ============================================== */

        thumbnail:
            buildThumbnailUrl(
                stream.thumbnail_url
            ),


        /* =============================================
           TWITCH
        ============================================== */

        url:
            `https://www.twitch.tv/${encodeURIComponent(
                normalizeText(
                    stream.user_login
                ) ||
                TWITCH_CHANNEL_LOGIN
            )}`

    };
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

    /*
     * On autorise un tout petit cache.
     *
     * Inutile de demander Twitch plusieurs fois par
     * seconde pour chaque visiteur.
     */

    response.setHeader(
        "Cache-Control",
        "public, max-age=0, s-maxage=30, stale-while-revalidate=30"
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

                error:
                    "Méthode non autorisée."

            });


        return;
    }


    /* =====================================================
       VÉRIFICATION CONFIGURATION
    ====================================================== */

    const {
        clientId,
        clientSecret
    } =
        getTwitchCredentials();


    if (
        !clientId ||
        !clientSecret
    ) {

        console.error(
            "[Twitch Live] Configuration Twitch manquante."
        );


        response
            .status(500)
            .json({

                success:
                    false,

                live:
                    false,

                error:
                    "Configuration Twitch manquante."

            });


        return;
    }


    /* =====================================================
       TWITCH
    ====================================================== */

    try {

        console.info(
            `[Twitch Live] Vérification de ${TWITCH_CHANNEL_LOGIN}...`
        );


        /* =============================================
           TOKEN APPLICATION
        ============================================== */

        const accessToken =
            await getAppAccessToken();


        /* =============================================
           STREAM
        ============================================== */

        const streamPayload =
            await twitchHelixRequest(
                `/streams?user_login=${encodeURIComponent(
                    TWITCH_CHANNEL_LOGIN
                )}`,
                accessToken
            );


        const stream =
            Array.isArray(
                streamPayload?.data
            )
                ? streamPayload.data[0]
                : null;


        /* =============================================
           HORS LIGNE
        ============================================== */

        if (
            !stream
        ) {

            console.info(
                `[Twitch Live] ${TWITCH_CHANNEL_LOGIN} est hors ligne.`
            );


            response
                .status(200)
                .json({

                    success:
                        true,

                    live:
                        false,

                    channel: {

                        login:
                            TWITCH_CHANNEL_LOGIN,

                        url:
                            `https://www.twitch.tv/${encodeURIComponent(
                                TWITCH_CHANNEL_LOGIN
                            )}`

                    },

                    stream:
                        null

                });


            return;
        }


        /* =============================================
           EN LIVE
        ============================================== */

        const formattedStream =
            formatStream(
                stream
            );


        console.info(
            `[Twitch Live] ${TWITCH_CHANNEL_LOGIN} est EN LIVE.`
        );


        response
            .status(200)
            .json({

                success:
                    true,

                live:
                    true,

                channel: {

                    login:
                        TWITCH_CHANNEL_LOGIN,

                    url:
                        formattedStream.url

                },

                stream:
                    formattedStream

            });


    } catch (
        error
    ) {

        console.error(
            "[Twitch Live] Erreur :",
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

                live:
                    false,

                error:
                    "Impossible de vérifier le statut Twitch.",

                details:
                    error?.message ??
                    null

            });
    }
}