"use strict";

/* =========================================================
   TWITCH — INFORMATIONS DES JEUX
   COUAXIA
========================================================= */

import {
    getGame
} from "./game.js";


document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       RÉCUPÉRATION DES CARTES
    ====================================================== */

    function getGameCards() {

        /*
         * Utilise l'API publique de games.js
         * lorsqu'elle est disponible.
         */
        if (
            window.CouaxiaGames &&
            typeof window
                .CouaxiaGames
                .getCards ===
                "function"
        ) {
            return window
                .CouaxiaGames
                .getCards();
        }


        /*
         * Solution de secours.
         */
        return Array.from(
            document.querySelectorAll(
                "#games-grid .game-card"
            )
        );
    }


    /* =====================================================
       ID TWITCH
    ====================================================== */

    function getTwitchGameId(card) {

        return String(
            card.dataset.twitchGameId ||
            ""
        ).trim();
    }


    /* =====================================================
       ÉLÉMENTS D'UNE CARTE
    ====================================================== */

    function getTitleElement(card) {

        return card.querySelector(
            ".game-title"
        );
    }


    function getCoverElement(card) {

        return card.querySelector(
            ".game-cover-image"
        );
    }


    function getSourceBadge(card) {

        return card.querySelector(
            ".game-twitch-source"
        );
    }


    /* =====================================================
       ÉTAT DE CHARGEMENT
    ====================================================== */

    function setLoadingState(card) {

        card.classList.add(
            "is-twitch-loading"
        );


        card.classList.remove(
            "is-twitch-loaded",
            "is-twitch-error"
        );


        const title =
            getTitleElement(
                card
            );


        if (title) {
            title.textContent =
                "Chargement...";
        }


        const badge =
            getSourceBadge(
                card
            );


        if (badge) {
            badge.textContent =
                "Twitch";

            badge.title =
                "Chargement des informations Twitch";
        }
    }


    /* =====================================================
       ÉTAT ERREUR
    ====================================================== */

    function setErrorState(
        card,
        message =
            "Jeu introuvable"
    ) {

        card.classList.remove(
            "is-twitch-loading",
            "is-twitch-loaded"
        );


        card.classList.add(
            "is-twitch-error"
        );


        const title =
            getTitleElement(
                card
            );


        if (title) {
            title.textContent =
                message;
        }


        const badge =
            getSourceBadge(
                card
            );


        if (badge) {
            badge.textContent =
                "Indisponible";

            badge.title =
                "Impossible de récupérer ce jeu depuis Twitch";
        }
    }


    /* =====================================================
       APPLIQUER LES DONNÉES TWITCH
    ====================================================== */

    function applyGameData(
        card,
        game
    ) {

        if (
            !card ||
            !game ||
            game.found === false
        ) {
            return;
        }


        /* =================================================
           TITRE
        ================================================= */

        const title =
            getTitleElement(
                card
            );


        if (title) {
            title.textContent =
                game.name ||
                "Jeu";
        }


        /* =================================================
           JAQUETTE
        ================================================= */

        const cover =
            getCoverElement(
                card
            );


        if (
            cover &&
            game.boxArtUrl
        ) {
            cover.src =
                game.boxArtUrl;

            cover.alt =
                game.name
                    ? `Jaquette de ${game.name}`
                    : "Jaquette du jeu";
        }


        /* =================================================
           ID TWITCH
        ================================================= */

        if (game.id) {
            card.dataset.twitchGameId =
                String(
                    game.id
                );
        }


        /* =================================================
           BADGE TWITCH
        ================================================= */

        const badge =
            getSourceBadge(
                card
            );


        if (badge) {
            badge.textContent =
                "Twitch";

            badge.title =
                "Nom et jaquette récupérés depuis Twitch";
        }


        /* =================================================
           ÉTAT
        ================================================= */

        card.classList.remove(
            "is-twitch-loading",
            "is-twitch-error"
        );


        card.classList.add(
            "is-twitch-loaded"
        );
    }


    /* =====================================================
       CHARGEMENT D'UNE CARTE
    ====================================================== */

    async function loadCard(
        card
    ) {

        const twitchGameId =
            getTwitchGameId(
                card
            );


        if (!twitchGameId) {

            console.warn(
                "[Games Twitch] data-twitch-game-id manquant :",
                card
            );


            setErrorState(
                card,
                "ID Twitch manquant"
            );


            return null;
        }


        setLoadingState(
            card
        );


        try {

            const game =
                await getGame(
                    twitchGameId
                );


            if (
                !game ||
                game.found === false
            ) {

                console.warn(
                    `[Games Twitch] Jeu introuvable : ${twitchGameId}`
                );


                setErrorState(
                    card,
                    "Jeu introuvable"
                );


                return null;
            }


            applyGameData(
                card,
                game
            );


            return game;

        } catch (error) {

            console.error(
                `[Games Twitch] Erreur pour le jeu ${twitchGameId} :`,
                error
            );


            setErrorState(
                card,
                "Erreur Twitch"
            );


            return null;
        }
    }


    /* =====================================================
       CHARGEMENT DE TOUS LES JEUX
    ====================================================== */

    async function initializeTwitchGames() {

        const cards =
            getGameCards();


        if (
            cards.length ===
            0
        ) {

            console.warn(
                "[Games Twitch] Aucune carte trouvée."
            );

            return [];
        }


        /*
         * On ne charge que les cartes qui
         * possèdent data-twitch-game-id.
         */
        const cardsToLoad =
            cards.filter(
                (card) =>
                    Boolean(
                        getTwitchGameId(
                            card
                        )
                    )
            );


        if (
            cardsToLoad.length ===
            0
        ) {

            console.warn(
                "[Games Twitch] Aucun data-twitch-game-id trouvé."
            );

            return [];
        }


        /*
         * Les appels peuvent être faits en parallèle.
         */
        const results =
            await Promise.all(
                cardsToLoad.map(
                    loadCard
                )
            );


        const loadedGames =
            results.filter(
                Boolean
            );


        /* =================================================
           INFORMER LES AUTRES SCRIPTS
        ================================================= */

        document.dispatchEvent(
            new CustomEvent(
                "couaxia:games-updated",
                {
                    detail: {
                        source:
                            "twitch",

                        games:
                            [...loadedGames]
                    }
                }
            )
        );


        console.info(
            `[Games Twitch] ${loadedGames.length} jeu(x) chargé(s).`
        );


        return loadedGames;
    }


    /* =====================================================
       API PUBLIQUE
    ====================================================== */

    window.CouaxiaGamesTwitch = {

        reload() {

            return initializeTwitchGames();

        },


        loadCard(card) {

            return loadCard(
                card
            );

        }

    };


    /* =====================================================
       INITIALISATION
    ====================================================== */

    initializeTwitchGames();

});