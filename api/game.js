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
                game?.id ??
                ""
            ),

        name:
            String(
                game?.name ??
                ""
            ),

        boxArtUrl:
            formatBoxArt(
                game?.box_art_url
            )

    };
}


/* =========================================================
   REQUÊTE TWITCH
========================================================= */

/**
 * Exécute une requête Twitch Games.
 *
 * On peut rechercher :
 *
 * - par ID
 * - par nom
 *
 * @param {"id"|"name"} type
 * @param {string} value
 * @param {boolean} forceRefresh
 * @returns {Promise<Response>}
 */
async function requestGame(
    type,
    value,
    forceRefresh = false
) {

    const url =
        new URL(
            TWITCH_GAMES_URL
        );


    /* =====================================================
       RECHERCHE PAR NOM
    ====================================================== */

    if (
        type ===
        "name"
    ) {

        url.searchParams.set(
            "name",
            value
        );

    }


    /* =====================================================
       RECHERCHE PAR ID
    ====================================================== */

    else {

        url.searchParams.set(
            "id",
            value
        );

    }


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
 * @param {"id"|"name"} type
 * @param {string} value
 * @returns {Promise<object>}
 */
async function fetchGame(
    type,
    value
) {

    let twitchResponse =
        await requestGame(
            type,
            value
        );


    /* =====================================================
       TOKEN TWITCH EXPIRÉ
    ====================================================== */

    if (
        twitchResponse.status ===
        401
    ) {

        clearTwitchAccessToken();


        twitchResponse =
            await requestGame(
                type,
                value,
                true
            );
    }


    /* =====================================================
       LECTURE
    ====================================================== */

    const data =
        await readTwitchResponse(
            twitchResponse
        );


    /* =====================================================
       ERREUR TWITCH
    ====================================================== */

    if (
        !twitchResponse.ok
    ) {

        throw new Error(
            `Erreur Twitch Games (${twitchResponse.status}) : ` +
            getTwitchErrorMessage(
                data,
                twitchResponse.status
            )
        );
    }


    return data;
}


/* =========================================================
   RECHERCHE PAR ID
========================================================= */

/**
 * Recherche un jeu avec son ID Twitch.
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
            "id",
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
   RECHERCHE PAR NOM
========================================================= */

/**
 * Recherche un jeu avec son nom Twitch.
 *
 * Exemple :
 *
 * getGameByName("Minecraft")
 *
 * @param {string} gameName
 * @returns {Promise<object|null>}
 */
export async function getGameByName(
    gameName
) {

    const normalizedGameName =
        normalizeText(
            gameName
        );


    if (
        !normalizedGameName
    ) {

        return null;
    }


    const data =
        await fetchGame(
            "name",
            normalizedGameName
        );


    const game =
        Array.isArray(
            data?.data
        )
            ? data.data[0]
            : null;


    /* =====================================================
       INTROUVABLE
    ====================================================== */

    if (
        !game
    ) {

        return {

            found:
                false,

            id:
                null,

            name:
                normalizedGameName,

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
 * Routes publiques :
 *
 * GET /api/game?id=509658
 *
 * OU
 *
 * GET /api/game?name=Minecraft
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
       PARAMÈTRES
    ====================================================== */

    const gameId =
        normalizeText(
            request.query?.id
        );


    const gameName =
        normalizeText(
            request.query?.name
        );


    /* =====================================================
       PARAMÈTRE MANQUANT
    ====================================================== */

    if (
        !gameId &&
        !gameName
    ) {

        response
            .status(400)
            .json({

                success:
                    false,

                error:
                    "L'ID Twitch ou le nom du jeu est obligatoire."

            });


        return;
    }


    /* =====================================================
       TWITCH
    ====================================================== */

    try {

        let game;


        /* =================================================
           PRIORITÉ À L'ID
        ================================================= */

        if (
            gameId
        ) {

            game =
                await getGame(
                    gameId
                );

        }


        /* =================================================
           SINON RECHERCHE PAR NOM
        ================================================= */

        else {

            game =
                await getGameByName(
                    gameName
                );

        }


        /* =================================================
           INTROUVABLE
        ================================================= */

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
                        game ??
                        null,

                    error:
                        gameName
                            ? `Le jeu "${gameName}" est introuvable sur Twitch.`
                            : "Jeu Twitch introuvable."

                });


            return;
        }


        /* =================================================
           SUCCÈS
        ================================================= */

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