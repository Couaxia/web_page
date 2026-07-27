"use strict";

/* =========================================================
   IMPORTS
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
 * Lit proprement une réponse Twitch.
 *
 * @param {Response} response
 * @returns {Promise<object>}
 */
async function readTwitchResponse(response) {
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

    if (!text) {
        return {};
    }

    try {
        return JSON.parse(text);
    } catch {
        return {
            message:
                text
        };
    }
}


/**
 * Retourne le message d’erreur envoyé par Twitch.
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
   REQUÊTE TWITCH
========================================================= */

/**
 * Exécute une requête vers l’endpoint Twitch Games.
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
 * Récupère une catégorie Twitch brute.
 *
 * Une seconde requête est effectuée lorsque le jeton
 * d’accès a expiré et que Twitch répond avec un code 401.
 *
 * @param {string} gameId
 * @returns {Promise<object|null>}
 */
async function fetchGame(gameId) {
    const normalizedGameId =
        String(
            gameId ?? ""
        ).trim();

    if (!normalizedGameId) {
        return null;
    }

    let response =
        await requestGame(
            normalizedGameId
        );

    if (
        response.status === 401
    ) {
        clearTwitchAccessToken();

        response =
            await requestGame(
                normalizedGameId,
                true
            );
    }

    const data =
        await readTwitchResponse(
            response
        );

    if (!response.ok) {
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
 * Remplace les dimensions dynamiques d’une jaquette Twitch.
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
    if (!value) {
        return null;
    }

    return String(value)
        .replaceAll(
            "{width}",
            String(width)
        )
        .replaceAll(
            "{height}",
            String(height)
        )
        .replaceAll(
            "%{width}",
            String(width)
        )
        .replaceAll(
            "%{height}",
            String(height)
        );
}


/**
 * Normalise une catégorie Twitch.
 *
 * @param {object} game
 * @returns {{
 *   found: true,
 *   id: string,
 *   name: string,
 *   boxArtUrl: string|null
 * }}
 */
function formatGame(game) {
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
   EXPORT
========================================================= */

/**
 * Retourne les informations d’une catégorie Twitch.
 *
 * @param {string|number} gameId
 * @returns {Promise<object|null>}
 */
export async function getGame(gameId) {
    const normalizedGameId =
        String(
            gameId ?? ""
        ).trim();

    if (!normalizedGameId) {
        return null;
    }

    const data =
        await fetchGame(
            normalizedGameId
        );

    const game =
        Array.isArray(data?.data)
            ? data.data[0]
            : null;

    if (!game) {
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