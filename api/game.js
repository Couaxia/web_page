"use strict";

/* =========================================================
   API PUBLIQUE — TWITCH GAME
   COUAXIA
========================================================= */

import {
    clearTwitchAccessToken,
    getTwitchApiHeaders
} from "./auth.js";


/* =========================================================
   CONFIGURATION
========================================================= */

const TWITCH_GAMES_URL =
    "https://api.twitch.tv/helix/games";


/* =========================================================
   OUTILS
========================================================= */

/**
 * Normalise une valeur texte.
 *
 * @param {unknown} value
 * @returns {string}
 */
function normalizeText(
    value
) {

    return String(
        value ?? ""
    ).trim();
}


/**
 * Lit proprement une réponse Twitch.
 *
 * @param {Response} response
 * @returns {Promise<object>}
 */
async function readTwitchResponse(
    response
) {

    const contentType =
        response.headers.get(
            "content-type"
        ) || "";


    if (
        contentType.includes(
            "application/json"
        )
    ) {

        return response.json();
    }


    const text =
        await response.text();


    if (
        !text
    ) {

        return {};
    }


    try {

        return JSON.parse(
            text
        );

    } catch {

        return {
            message:
                text
        };
    }
}


/**
 * Retourne le message d'erreur Twitch.
 *
 * @param {object} data
 * @param {number} status
 * @returns {string}
 */
function getTwitchErrorMessage(
    data,
    status
) {

    return String(
        data?.message ||
        data?.error ||
        `Erreur HTTP ${status}`
    );
}


/* =========================================================
   JAQUETTE
========================================================= */

/**
 * Remplace les dimensions dynamiques Twitch.
 *
 * @param {unknown} value
 * @param {number} width
 * @param {number} height
 * @returns {string|null}
 */
function formatBoxArt(
    value,
    width = 285,
    height = 380
) {

    if (
        !value
    ) {

        return null;
    }


    return String(
        value
    )
        .replaceAll(
            "{width}",
            String(
                width
            )
        )
        .replaceAll(
            "{height}",
            String(
                height
            )
        )
        .replaceAll(
            "%{width}",
            String(
                width
            )
        )
        .replaceAll(
            "%{height}",
            String(
                height
            )
        );
}


/* =========================================================
   REQUÊTE TWITCH
========================================================= */

/**
 * Exécute la requête Twitch.
 *
 * @param {string} gameId
 * @param {boolean} forceRefresh
 * @returns {Promise<Response>}
 */
async function requestGame(
    gameId,
    forceRefresh = false
) {

    const url =
        new URL(
            TWITCH_GAMES_URL
        );


    url.searchParams.set(
        "id",
        gameId
    );


    const headers =
        await getTwitchApiHeaders({
            forceRefresh
        });


    return fetch(
        url.toString(),
        {
            method:
                "GET",

            headers,

            cache:
                "no-store"
        }
    );
}


/**
 * Récupère les données Twitch brutes.
 *
 * @param {string} gameId
 * @returns {Promise<object>}
 */
async function fetchGame(
    gameId
) {

    let response =
        await requestGame(
            gameId
        );


    /*
     * Si le token Twitch a expiré,
     * on le renouvelle automatiquement.
     */

    if (
        response.status ===
        401
    ) {

        clearTwitchAccessToken();


        response =
            await requestGame(
                gameId,
                true
            );
    }


    const data =
        await readTwitchResponse(
            response
        );


    if (
        !response.ok
    ) {

        throw new Error(
            `Erreur Twitch Games (${response.status}) : ` +
            getTwitchErrorMessage(
                data,
                response.status
            )
        );
    }


    return data;
}


/* =========================================================
   FORMATAGE
========================================================= */

/**
 * Formate un jeu Twitch.
 *
 * @param {object} game
 * @returns {object}
 */
function formatGame(
    game
) {

    return {

        found:
            true,

        id:
            String(
                game?.id ?? ""
            ),

        name:
            String(
                game?.name ?? ""
            ),

        boxArtUrl:
            formatBoxArt(
                game?.box_art_url
            )

    };
}


/* =========================================================
   GET GAME
========================================================= */

/**
 * Retourne un jeu Twitch.
 *
 * @param {string|number} gameId
 * @returns {Promise<object|null>}
 */
export async function getGame(
    gameId
) {

    const normalizedGameId =
        normalizeText(
            gameId
        );


    if (
        !normalizedGameId
    ) {

        return null;
    }


    const data =
        await fetchGame(
            normalizedGameId
        );


    const game =
        Array.isArray(
            data?.data
        )
            ? data.data[0]
            : null;


    if (
        !game
    ) {

        return {

            found:
                false,

            id:
                normalizedGameId,

            name:
                null,

            boxArtUrl:
                null

        };
    }


    return formatGame(
        game
    );
}


/* =========================================================
   API HTTP
========================================================= */

/**
 * Route publique :
 *
 * GET /api/game?id=509658
 */
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
       ID
    ====================================================== */

    const gameId =
        normalizeText(
            request.query?.id
        );


    if (
        !gameId
    ) {

        response
            .status(400)
            .json({
                success:
                    false,

                error:
                    "L'ID Twitch du jeu est obligatoire."
            });


        return;
    }


    /* =====================================================
       TWITCH
    ====================================================== */

    try {

        const game =
            await getGame(
                gameId
            );


        if (
            !game ||
            game.found ===
                false
        ) {

            response
                .status(404)
                .json({
                    success:
                        false,

                    game:
                        game ?? null,

                    error:
                        "Jeu Twitch introuvable."
                });


            return;
        }


        response
            .status(200)
            .json({

                success:
                    true,

                game

            });


    } catch (
        error
    ) {

        console.error(
            "[Public Game API]",
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
                    "Impossible de récupérer le jeu Twitch."
            });
    }
}