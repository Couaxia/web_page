"use strict";

/* =========================================================
   PAGE JEUX — COUAXIA
   CHARGEMENT DEPUIS SUPABASE VIA /api/games
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =====================================================
           CONFIGURATION
        ====================================================== */

        const GAMES_API =
            "/api/games";


        /* =====================================================
           ÉLÉMENTS
        ====================================================== */

        const gamesGrid =
            document.getElementById(
                "games-grid"
            );


        const statusFilter =
            document.getElementById(
                "games-status-filter"
            );


        const results =
            document.getElementById(
                "games-results"
            );


        const emptyState =
            document.getElementById(
                "games-empty-state"
            );


        const statCurrent =
            document.getElementById(
                "games-stat-current"
            );


        const statRegular =
            document.getElementById(
                "games-stat-regular"
            );


        const statBacklog =
            document.getElementById(
                "games-stat-backlog"
            );


        const statFinished =
            document.getElementById(
                "games-stat-finished"
            );


        /* =====================================================
           ÉTAT
        ====================================================== */

        let games =
            [];


        /* =====================================================
           OUTILS
        ====================================================== */

        function normalizeText(
            value
        ) {

            return String(
                value ?? ""
            ).trim();
        }


        function escapeHtml(
            value
        ) {

            return String(
                value ?? ""
            )
                .replace(
                    /&/g,
                    "&amp;"
                )
                .replace(
                    /</g,
                    "&lt;"
                )
                .replace(
                    />/g,
                    "&gt;"
                )
                .replace(
                    /"/g,
                    "&quot;"
                )
                .replace(
                    /'/g,
                    "&#039;"
                );
        }


        function normalizeTags(
            value
        ) {

            if (
                Array.isArray(
                    value
                )
            ) {

                return value
                    .map(
                        normalizeText
                    )
                    .filter(
                        Boolean
                    );
            }


            if (
                typeof value ===
                "string"
            ) {

                return value
                    .split(
                        /[,;]+/
                    )
                    .map(
                        normalizeText
                    )
                    .filter(
                        Boolean
                    );
            }


            return [];
        }


        function normalizeGame(
            game
        ) {

            if (
                !game ||
                typeof game !==
                    "object"
            ) {

                return null;
            }


            return {

                id:
                    normalizeText(
                        game.id
                    ),

                twitchGameId:
                    normalizeText(
                        game.twitchGameId ??
                        game.twitch_game_id
                    ),

                name:
                    normalizeText(
                        game.twitchName ??
                        game.twitch_name ??
                        game.name
                    ) ||
                    "Jeu",

                boxArtUrl:
                    normalizeText(
                        game.boxArtUrl ??
                        game.box_art_url ??
                        game.image
                    ),

                status:
                    normalizeText(
                        game.status
                    )
                        .toLowerCase() ||
                    "backlog",

                tags:
                    normalizeTags(
                        game.tags
                    ),

                description:
                    normalizeText(
                        game.description
                    ),

                rating:
                    game.rating ??
                    null,

                youtubePlaylist:
                    normalizeText(
                        game.youtubePlaylist ??
                        game.youtube_playlist
                    ),

                pollEnabled:
                    Boolean(
                        game.pollEnabled ??
                        game.poll_enabled
                    )

            };
        }


        /* =====================================================
           STATUTS
        ====================================================== */

        function getStatusInfo(
            status
        ) {

            switch (
                status
            ) {

                case "current":

                    return {
                        icon: "🔥",
                        label: "En cours",
                        className:
                            "game-status-current"
                    };


                case "regular":

                    return {
                        icon: "🔁",
                        label: "Régulier",
                        className:
                            "game-status-regular"
                    };


                case "backlog":

                    return {
                        icon: "📚",
                        label: "À faire",
                        className:
                            "game-status-backlog"
                    };


                case "paused":

                    return {
                        icon: "⏸️",
                        label: "En pause",
                        className:
                            "game-status-paused"
                    };


                case "finished":

                    return {
                        icon: "🏆",
                        label: "Terminé",
                        className:
                            "game-status-finished"
                    };


                default:

                    return {
                        icon: "🎮",
                        label: "Jeu",
                        className:
                            ""
                    };
            }
        }


        /* =====================================================
           STATISTIQUES
        ====================================================== */

        function countStatus(
            status
        ) {

            return games.filter(
                game =>
                    game.status ===
                    status
            ).length;
        }


        function updateStats() {

            if (
                statCurrent
            ) {

                statCurrent.textContent =
                    countStatus(
                        "current"
                    );
            }


            if (
                statRegular
            ) {

                statRegular.textContent =
                    countStatus(
                        "regular"
                    );
            }


            if (
                statBacklog
            ) {

                statBacklog.textContent =
                    countStatus(
                        "backlog"
                    );
            }


            if (
                statFinished
            ) {

                statFinished.textContent =
                    countStatus(
                        "finished"
                    );
            }
        }


        /* =====================================================
           TAGS
        ====================================================== */

        function renderTags(
            tags
        ) {

            if (
                !Array.isArray(
                    tags
                ) ||
                tags.length ===
                    0
            ) {

                return "";
            }


            return `
                <div class="game-tags">

                    ${tags
                        .map(
                            tag => `
                                <span>
                                    ${escapeHtml(
                                        tag
                                    )}
                                </span>
                            `
                        )
                        .join("")}

                </div>
            `;
        }


        /* =====================================================
           NOTE
        ====================================================== */

        function renderRating(
            rating
        ) {

            if (
                rating ===
                    null ||
                rating ===
                    undefined ||
                rating ===
                    ""
            ) {

                return "";
            }


            const value =
                Number(
                    rating
                );


            if (
                !Number.isFinite(
                    value
                )
            ) {

                return "";
            }


            return `
                <div class="game-rating">

                    <span>
                        Ma note
                    </span>

                    <strong>
                        💜 ${escapeHtml(
                            value
                        )}/10
                    </strong>

                </div>
            `;
        }


        /* =====================================================
           CARTE
        ====================================================== */

        function renderGameCard(
            game
        ) {

            const status =
                getStatusInfo(
                    game.status
                );


            const cover =
                game.boxArtUrl
                    ? `
                        <img
                            class="game-cover-image"
                            src="${escapeHtml(
                                game.boxArtUrl
                            )}"
                            alt="Jaquette de ${escapeHtml(
                                game.name
                            )}"
                            loading="lazy"
                            draggable="false"
                        >
                    `
                    : `
                        <div
                            class="game-cover-placeholder"
                            aria-hidden="true"
                        >
                            🎮
                        </div>
                    `;


            const description =
                game.description
                    ? `
                        <p class="game-description">
                            ${escapeHtml(
                                game.description
                            )}
                        </p>
                    `
                    : "";


            const youtube =
                game.youtubePlaylist
                    ? `
                        <a
                            class="game-vods-button"
                            href="${escapeHtml(
                                game.youtubePlaylist
                            )}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span aria-hidden="true">
                                ▶
                            </span>

                            Voir les VOD
                        </a>
                    `
                    : "";


            return `
                <article
                    class="game-card"
                    data-game-id="${escapeHtml(
                        game.id
                    )}"
                    data-status="${escapeHtml(
                        game.status
                    )}"
                    data-tags="${escapeHtml(
                        game.tags.join(
                            " "
                        )
                    )}"
                    data-poll="${
                        game.pollEnabled
                            ? "true"
                            : "false"
                    }"
                >

                    <div class="game-cover">

                        ${cover}

                        <span
                            class="
                                game-status
                                ${escapeHtml(
                                    status.className
                                )}
                            "
                        >
                            ${status.icon}
                            ${escapeHtml(
                                status.label
                            )}
                        </span>

                    </div>


                    <div class="game-content">

                        <h2 class="game-title">
                            ${escapeHtml(
                                game.name
                            )}
                        </h2>

                        ${renderTags(
                            game.tags
                        )}

                        ${renderRating(
                            game.rating
                        )}

                        ${description}

                        ${youtube}

                    </div>

                </article>
            `;
        }


        /* =====================================================
           FILTRAGE
        ====================================================== */

        function getFilteredGames() {

            const selectedStatus =
                normalizeText(
                    statusFilter?.value
                )
                    .toLowerCase() ||
                "all";


            if (
                selectedStatus ===
                "all"
            ) {

                return games;
            }


            return games.filter(
                game =>
                    game.status ===
                    selectedStatus
            );
        }


        /* =====================================================
           AFFICHAGE
        ====================================================== */

        function renderGames() {

            if (
                !gamesGrid
            ) {

                return;
            }


            const filteredGames =
                getFilteredGames();


            if (
                games.length ===
                0
            ) {

                gamesGrid.innerHTML =
                    "";


                if (
                    emptyState
                ) {

                    emptyState.hidden =
                        false;
                }


                if (
                    results
                ) {

                    results.textContent =
                        "Aucun jeu enregistré.";
                }


                return;
            }


            if (
                emptyState
            ) {

                emptyState.hidden =
                    true;
            }


            if (
                filteredGames.length ===
                0
            ) {

                gamesGrid.innerHTML = `
                    <div class="games-empty-filter">
                        Aucun jeu ne correspond à ce filtre.
                    </div>
                `;


                if (
                    results
                ) {

                    results.textContent =
                        "Aucun résultat.";
                }


                return;
            }


            gamesGrid.innerHTML =
                filteredGames
                    .map(
                        renderGameCard
                    )
                    .join(
                        ""
                    );


            if (
                results
            ) {

                results.textContent =
                    `${filteredGames.length} jeu${
                        filteredGames.length >
                        1
                            ? "x"
                            : ""
                    } affiché${
                        filteredGames.length >
                        1
                            ? "s"
                            : ""
                    }.`;
            }


            /*
             * Informe les autres scripts,
             * notamment le système de sondage.
             */
            document.dispatchEvent(
                new CustomEvent(
                    "couaxia:games-updated",
                    {
                        detail: {
                            games:
                                [...games]
                        }
                    }
                )
            );
        }


        /* =====================================================
           CHARGEMENT API
        ====================================================== */

        async function loadGames() {

            if (
                !gamesGrid
            ) {

                return;
            }


            if (
                results
            ) {

                results.textContent =
                    "Chargement des jeux...";
            }


            try {

                const response =
                    await fetch(
                        GAMES_API,
                        {

                            method:
                                "GET",

                            cache:
                                "no-store",

                            credentials:
                                "same-origin",

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


                if (
                    !response.ok
                ) {

                    throw new Error(
                        data?.error ||
                        `Erreur HTTP ${response.status}`
                    );
                }


                const rawGames =
                    Array.isArray(
                        data
                    )
                        ? data
                        : Array.isArray(
                            data?.games
                        )
                            ? data.games
                            : [];


                games =
                    rawGames
                        .map(
                            normalizeGame
                        )
                        .filter(
                            Boolean
                        );


                console.info(
                    `[Games] ${games.length} jeu(x) chargé(s).`
                );


                updateStats();

                renderGames();


            } catch (
                error
            ) {

                console.error(
                    "[Games] Erreur API :",
                    error
                );


                games =
                    [];


                updateStats();


                gamesGrid.innerHTML =
                    "";


                if (
                    emptyState
                ) {

                    emptyState.hidden =
                        false;
                }


                if (
                    results
                ) {

                    results.textContent =
                        "Erreur lors du chargement des jeux.";
                }


                const emptyParagraph =
                    emptyState?.querySelector(
                        "p"
                    );


                if (
                    emptyParagraph
                ) {

                    emptyParagraph.textContent =
                        "Impossible de charger les jeux pour le moment.";
                }
            }
        }


        /* =====================================================
           FILTRE
        ====================================================== */

        statusFilter
            ?.addEventListener(
                "change",
                () => {

                    renderGames();

                }
            );


        /* =====================================================
           API PUBLIQUE JS
        ====================================================== */

        window.CouaxiaGames = {

            getGames() {

                return [
                    ...games
                ];
            },


            getCards() {

                return Array.from(
                    gamesGrid
                        ?.querySelectorAll(
                            ".game-card"
                        ) ||
                    []
                );
            },


            reload() {

                return loadGames();
            }

        };


        /* =====================================================
           INITIALISATION
        ====================================================== */

        loadGames();

    }
);