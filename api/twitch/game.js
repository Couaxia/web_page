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
   REQUÊTE TWITCH
========================================================= */

async function fetchGame(gameId) {

    if (!gameId) {
        return null;
    }

    const url = new URL(TWITCH_GAMES_URL);

    url.searchParams.set("id", gameId);

    let headers =
        await getTwitchApiHeaders();

    let response =
        await fetch(url.toString(), {
            method: "GET",
            headers,
            cache: "no-store"
        });

    if (response.status === 401) {

        clearTwitchAccessToken();

        headers =
            await getTwitchApiHeaders({
                forceRefresh: true
            });

        response =
            await fetch(url.toString(), {
                method: "GET",
                headers,
                cache: "no-store"
            });
    }

    if (!response.ok) {

        const error =
            await response.text();

        throw new Error(
            `Erreur Twitch Games (${response.status}) : ${error}`
        );
    }

    return response.json();
}


/* =========================================================
   FORMATAGE
========================================================= */

function formatBoxArt(url) {
    if (!url) {
        return null;
    }
    return url
        .replace("{width}", "512")
        .replace("{height}", "512");
}

function formatGame(game) {
    return {
        found: true,
        id:
            game.id,
        name:
            game.name,
        boxArtUrl:
            formatBoxArt(
                game.box_art_url
            )
    };
}


/* =========================================================
   EXPORT
========================================================= */

/**
 * Retourne les informations
 * d'une catégorie Twitch.
 */
export async function getGame(gameId) {
    if (!gameId) {
        return null;
    }
    const data =
        await fetchGame(gameId);
    const game =
        data?.data?.[0];

    if (!game) {
        return {
            found: false,
            id: gameId,
            name: null,
            boxArtUrl: null
        };
    }

    return formatGame(game);
}