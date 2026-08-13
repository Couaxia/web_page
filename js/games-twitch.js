"use strict";

/* =========================================================
   TWITCH — INFORMATIONS DES JEUX
   COUAXIA
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =====================================================
           CONFIGURATION
        ====================================================== */

        const GAME_API =
            "/api/game";


        /* =====================================================
           RÉCUPÉRATION DES CARTES
        ====================================================== */

        /**
         * Retourne toutes les cartes de jeux.
         *
         * Utilise en priorité l'API publique
         * exposée par games.js.
         *
         * @returns {HTMLElement[]}
         */
        function getGameCards() {

            if (
                window.CouaxiaGames &&
                typeof window
                    .CouaxiaGames
                    .getCards ===
                    "function"
            ) {

                const cards =
                    window
                        .CouaxiaGames
                        .getCards();


                return Array.isArray(
                    cards
                )
                    ? cards
                    : Array.from(
                        cards ||
                        []
                    );
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

        /**
         * Retourne l'ID Twitch d'une carte.
         *
         * @param {HTMLElement} card
         * @returns {string}
         */
        function getTwitchGameId(
            card
        ) {

            return String(
                card?.dataset
                    ?.twitchGameId ??
                ""
            )
                .trim();
        }


        /* =====================================================
           ÉLÉMENTS D'UNE CARTE
        ====================================================== */

        function getTitleElement(
            card
        ) {

            return card.querySelector(
                ".game-title"
            );
        }


        function getCoverElement(
            card
        ) {

            return card.querySelector(
                ".game-cover-image"
            );
        }


        function getSourceBadge(
            card
        ) {

            return card.querySelector(
                ".game-twitch-source"
            );
        }


        /* =====================================================
           ÉTAT DE CHARGEMENT
        ====================================================== */

        function setLoadingState(
            card
        ) {

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


            if (
                title
            ) {

                title.textContent =
                    "Chargement...";
            }


            const badge =
                getSourceBadge(
                    card
                );


            if (
                badge
            ) {

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


            if (
                title
            ) {

                title.textContent =
                    message;
            }


            const badge =
                getSourceBadge(
                    card
                );


            if (
                badge
            ) {

                badge.textContent =
                    "Indisponible";


                badge.title =
                    "Impossible de récupérer ce jeu depuis Twitch";
            }
        }


        /* =====================================================
           API GAME
        ====================================================== */

        /**
         * Demande les informations d'un jeu
         * à notre API serveur.
         *
         * Le navigateur ne contacte jamais
         * directement Twitch.
         *
         * @param {string} twitchGameId
         * @returns {Promise<object|null>}
         */
        async function fetchGame(
            twitchGameId
        ) {

            const normalizedGameId =
                String(
                    twitchGameId ??
                    ""
                )
                    .trim();


            if (
                !normalizedGameId
            ) {

                return null;
            }


            const url =
                new URL(
                    GAME_API,
                    window.location.origin
                );


            url.searchParams.set(
                "id",
                normalizedGameId
            );


            const response =
                await fetch(
                    url.toString(),
                    {
                        method:
                            "GET",

                        cache:
                            "no-store",

                        headers: {

                            Accept:
                                "application/json"

                        }
                    }
                );


            const data =
                await response
                    .json()
                    .catch(
                        () => ({})
                    );


            /* =================================================
               JEU INTROUVABLE
            ================================================= */

            if (
                response.status ===
                404
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


            /* =================================================
               ERREUR
            ================================================= */

            if (
                !response.ok
            ) {

                throw new Error(
                    data?.error ||
                    `Erreur HTTP ${response.status}`
                );
            }


            /* =================================================
               FORMAT /api/game
            ================================================= */

            const game =
                data?.game;


            if (
                !game
            ) {

                return null;
            }


            return game;
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
                game.found ===
                    false
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


            if (
                title
            ) {

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


                cover.loading =
                    "lazy";


                cover.decoding =
                    "async";
            }


            /* =================================================
               ID TWITCH
            ================================================= */

            if (
                game.id
            ) {

                card.dataset
                    .twitchGameId =
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


            if (
                badge
            ) {

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

            if (
                !(
                    card instanceof
                    HTMLElement
                )
            ) {

                return null;
            }


            const twitchGameId =
                getTwitchGameId(
                    card
                );


            if (
                !twitchGameId
            ) {

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
                    await fetchGame(
                        twitchGameId
                    );


                if (
                    !game ||
                    game.found ===
                        false
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


            } catch (
                error
            ) {

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
             * On ne charge que les cartes
             * possédant un ID Twitch.
             */

            const cardsToLoad =
                cards.filter(
                    card =>
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


            /* =================================================
               SUPPRESSION DES DOUBLONS D'APPEL
            ================================================= */

            /*
             * Plusieurs cartes pourraient éventuellement
             * utiliser le même jeu.
             *
             * On met donc les réponses API en cache
             * pendant ce chargement.
             */

            const requestsByGameId =
                new Map();


            async function loadCardWithSharedRequest(
                card
            ) {

                const twitchGameId =
                    getTwitchGameId(
                        card
                    );


                if (
                    !twitchGameId
                ) {

                    return null;
                }


                setLoadingState(
                    card
                );


                try {

                    let gamePromise =
                        requestsByGameId.get(
                            twitchGameId
                        );


                    if (
                        !gamePromise
                    ) {

                        gamePromise =
                            fetchGame(
                                twitchGameId
                            );


                        requestsByGameId.set(
                            twitchGameId,
                            gamePromise
                        );
                    }


                    const game =
                        await gamePromise;


                    if (
                        !game ||
                        game.found ===
                            false
                    ) {

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


                } catch (
                    error
                ) {

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


            /* =================================================
               CHARGEMENT PARALLÈLE
            ================================================= */

            const results =
                await Promise.all(
                    cardsToLoad.map(
                        loadCardWithSharedRequest
                    )
                );


            /*
             * Une même réponse peut apparaître
             * plusieurs fois si plusieurs cartes utilisent
             * le même ID Twitch.
             *
             * On déduplique donc l'événement final.
             */

            const loadedGamesById =
                new Map();


            results
                .filter(
                    Boolean
                )
                .forEach(
                    game => {

                        const id =
                            String(
                                game?.id ??
                                ""
                            )
                                .trim();


                        if (
                            id
                        ) {

                            loadedGamesById.set(
                                id,
                                game
                            );
                        }
                    }
                );


            const loadedGames =
                Array.from(
                    loadedGamesById.values()
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
                                [
                                    ...loadedGames
                                ]

                        }
                    }
                )
            );


            console.info(
                `[Games Twitch] ${loadedGames.length} jeu(x) chargé(s) depuis l'API.`
            );


            return loadedGames;
        }


        /* =====================================================
           CARTES CRÉÉES DYNAMIQUEMENT
        ====================================================== */

        /*
         * Si games.js crée les cartes après
         * DOMContentLoaded, il pourra déclencher :
         *
         * couaxia:games-rendered
         */

        document.addEventListener(
            "couaxia:games-rendered",
            () => {

                initializeTwitchGames();
            }
        );


        /* =====================================================
           API PUBLIQUE
        ====================================================== */

        window.CouaxiaGamesTwitch = {

            /**
             * Recharge tous les jeux Twitch.
             */
            reload() {

                return initializeTwitchGames();
            },


            /**
             * Recharge une carte précise.
             */
            loadCard(
                card
            ) {

                return loadCard(
                    card
                );
            },


            /**
             * Demande directement un jeu
             * à /api/game.
             */
            getGame(
                twitchGameId
            ) {

                return fetchGame(
                    twitchGameId
                );
            }

        };


        /* =====================================================
           INITIALISATION
        ====================================================== */

        initializeTwitchGames();
    }
);