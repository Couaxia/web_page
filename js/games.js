"use strict";

/* =========================================================
   PAGE JEUX — COUAXIA
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =====================================================
           CONFIGURATION
        ====================================================== */

        const GAMES_API =
            "/api/games";

        const VOTE_STORAGE_KEY =
            "couaxia-game-vote";

        /*
         * Seuls les jeux "À faire"
         * participent au vote.
         */
        const VOTE_STATUS =
            "backlog";


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

        const voteButton =
            document.getElementById(
                "games-vote-button"
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


        if (
            !gamesGrid ||
            !statusFilter
        ) {

            console.error(
                "[Games] Impossible d'initialiser la page."
            );

            return;
        }


        /* =====================================================
           ÉTAT
        ====================================================== */

        let gameCards = [];

        let gamesData = [];

        let loading =
            false;


        /* =====================================================
           OUTILS
        ====================================================== */

        function normalizeString(
            value
        ) {

            return String(
                value ?? ""
            )
                .trim();
        }


        function normalizeStatus(
            value
        ) {

            return normalizeString(
                value
            )
                .toLowerCase();
        }


        function escapeHtml(
            value
        ) {

            return String(
                value ?? ""
            )
                .replaceAll(
                    "&",
                    "&amp;"
                )
                .replaceAll(
                    "<",
                    "&lt;"
                )
                .replaceAll(
                    ">",
                    "&gt;"
                )
                .replaceAll(
                    '"',
                    "&quot;"
                )
                .replaceAll(
                    "'",
                    "&#039;"
                );
        }


        /* =====================================================
           INFORMATIONS D'UNE CARTE
        ====================================================== */

        function getStatus(
            card
        ) {

            return normalizeStatus(
                card?.dataset
                    ?.status
            );
        }


        function getGameId(
            card
        ) {

            return normalizeString(
                card?.dataset
                    ?.gameId
            );
        }


        function getTwitchGameId(
            card
        ) {

            return normalizeString(
                card?.dataset
                    ?.twitchGameId
            );
        }


        function getGameName(
            card
        ) {

            const heading =
                card?.querySelector(
                    ".game-content h2"
                ) ||
                card?.querySelector(
                    ".game-title"
                );


            return (
                heading
                    ?.textContent
                    ?.trim() ||
                "Jeu inconnu"
            );
        }


        function getGameCover(
            card
        ) {

            return (
                card?.querySelector(
                    ".game-cover-image"
                ) ||
                card?.querySelector(
                    ".game-cover img"
                ) ||
                null
            );
        }


        /* =====================================================
           LABELS DES STATUTS
        ====================================================== */

        function getStatusLabel(
            status
        ) {

            switch (
                normalizeStatus(
                    status
                )
            ) {

                case "current":

                    return "En cours";


                case "regular":

                    return "Régulier";


                case "backlog":

                    return "À faire";


                case "finished":

                    return "Terminé";


                default:

                    return "Jeu";
            }
        }


        /* =====================================================
           API
        ====================================================== */

        async function fetchGames() {

            const response =
                await fetch(
                    GAMES_API,
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


            if (
                !response.ok
            ) {

                throw new Error(
                    data?.error ||
                    `Erreur HTTP ${response.status}`
                );
            }


            /*
             * On accepte :
             *
             * {
             *     success: true,
             *     games: [...]
             * }
             *
             * ainsi qu'un tableau direct
             * pour garder le script robuste.
             */

            if (
                Array.isArray(
                    data
                )
            ) {

                return data;
            }


            return Array.isArray(
                data?.games
            )
                ? data.games
                : [];
        }


        /* =====================================================
           NORMALISATION SUPABASE
        ====================================================== */

        function normalizeGame(
            game,
            index
        ) {

            const id =
                normalizeString(
                    game?.id ||
                    game?.game_id ||
                    `game-${index + 1}`
                );


            const twitchGameId =
                normalizeString(
                    game?.twitch_game_id ||
                    game?.twitchGameId ||
                    game?.twitch_id
                );


            const status =
                normalizeStatus(
                    game?.status ||
                    "backlog"
                );


            const name =
                normalizeString(
                    game?.name ||
                    game?.title ||
                    "Chargement..."
                );


            const description =
                normalizeString(
                    game?.description
                );


            return {

                id,

                twitchGameId,

                status,

                name,

                description,

                visible:
                    game?.visible !==
                    false,

                sortOrder:
                    Number.isFinite(
                        Number(
                            game?.sort_order
                        )
                    )
                        ? Number(
                            game.sort_order
                        )
                        : 0

            };
        }


        /* =====================================================
           CRÉATION D'UNE CARTE
        ====================================================== */

        function createGameCard(
            game
        ) {

            const article =
                document.createElement(
                    "article"
                );


            article.className =
                "game-card";


            article.dataset.gameId =
                game.id;


            article.dataset.status =
                game.status;


            if (
                game.twitchGameId
            ) {

                article.dataset
                    .twitchGameId =
                    game.twitchGameId;
            }


            /* =================================================
               COUVERTURE
            ================================================= */

            const cover =
                document.createElement(
                    "div"
                );


            cover.className =
                "game-cover";


            const image =
                document.createElement(
                    "img"
                );


            image.className =
                "game-cover-image";


            /*
             * games-twitch.js remplacera
             * automatiquement cette image
             * par la jaquette Twitch.
             */

            image.alt =
                game.name
                    ? `Jaquette de ${game.name}`
                    : "Jaquette du jeu";


            image.loading =
                "lazy";


            image.decoding =
                "async";


            image.draggable =
                false;


            cover.appendChild(
                image
            );


            /* =================================================
               BADGE TWITCH
            ================================================= */

            const twitchBadge =
                document.createElement(
                    "span"
                );


            twitchBadge.className =
                "game-twitch-source";


            twitchBadge.textContent =
                game.twitchGameId
                    ? "Twitch"
                    : "Manuel";


            twitchBadge.title =
                game.twitchGameId
                    ? "Informations récupérées depuis Twitch"
                    : "Aucun identifiant Twitch";


            cover.appendChild(
                twitchBadge
            );


            /* =================================================
               CONTENU
            ================================================= */

            const content =
                document.createElement(
                    "div"
                );


            content.className =
                "game-content";


            const title =
                document.createElement(
                    "h2"
                );


            title.className =
                "game-title";


            title.textContent =
                game.name ||
                "Chargement...";


            content.appendChild(
                title
            );


            /* =================================================
               STATUT
            ================================================= */

            const status =
                document.createElement(
                    "span"
                );


            status.className =
                [
                    "game-status",
                    `game-status-${game.status}`
                ].join(
                    " "
                );


            status.textContent =
                getStatusLabel(
                    game.status
                );


            content.appendChild(
                status
            );


            /* =================================================
               DESCRIPTION
            ================================================= */

            if (
                game.description
            ) {

                const description =
                    document.createElement(
                        "p"
                    );


                description.className =
                    "game-description";


                description.textContent =
                    game.description;


                content.appendChild(
                    description
                );
            }


            /* =================================================
               ASSEMBLAGE
            ================================================= */

            article.appendChild(
                cover
            );


            article.appendChild(
                content
            );


            return article;
        }


        /* =====================================================
           RENDU
        ====================================================== */

        function renderGames() {

            gamesGrid.innerHTML =
                "";


            const fragment =
                document.createDocumentFragment();


            gamesData
                .filter(
                    game =>
                        game.visible
                )
                .sort(
                    (
                        first,
                        second
                    ) => {

                        return (
                            first.sortOrder -
                            second.sortOrder
                        );
                    }
                )
                .forEach(
                    game => {

                        fragment.appendChild(
                            createGameCard(
                                game
                            )
                        );
                    }
                );


            gamesGrid.appendChild(
                fragment
            );


            /* =================================================
               NOUVELLE LISTE DE CARTES
            ================================================= */

            gameCards =
                Array.from(
                    gamesGrid.querySelectorAll(
                        ".game-card"
                    )
                );


            /* =================================================
               STATISTIQUES
            ================================================= */

            updateStats();


            /* =================================================
               FILTRE
            ================================================= */

            applyFilter();


            /* =================================================
               INFORMER games-twitch.js
            ================================================= */

            document.dispatchEvent(
                new CustomEvent(
                    "couaxia:games-rendered",
                    {
                        detail: {

                            games:
                                [
                                    ...gamesData
                                ],

                            cards:
                                [
                                    ...gameCards
                                ]

                        }
                    }
                )
            );


            console.info(
                `[Games] ${gameCards.length} carte(s) générée(s).`
            );
        }


        /* =====================================================
           CHARGEMENT
        ====================================================== */

        async function loadGames() {

            if (
                loading
            ) {

                return gamesData;
            }


            loading =
                true;


            gamesGrid.classList.add(
                "is-loading"
            );


            if (
                results
            ) {

                results.textContent =
                    "Chargement des jeux...";
            }


            try {

                const rawGames =
                    await fetchGames();


                gamesData =
                    rawGames
                        .map(
                            normalizeGame
                        )
                        .filter(
                            game =>
                                game.id
                        );


                renderGames();


                document.dispatchEvent(
                    new CustomEvent(
                        "couaxia:games-loaded",
                        {
                            detail: {

                                games:
                                    [
                                        ...gamesData
                                    ]

                            }
                        }
                    )
                );


                return gamesData;


            } catch (
                error
            ) {

                console.error(
                    "[Games] Impossible de charger les jeux :",
                    error
                );


                gamesData =
                    [];


                gameCards =
                    [];


                gamesGrid.innerHTML =
                    `
                        <p class="games-load-error">
                            Impossible de charger les jeux pour le moment.
                        </p>
                    `;


                if (
                    results
                ) {

                    results.textContent =
                        "Erreur lors du chargement des jeux.";
                }


                document.dispatchEvent(
                    new CustomEvent(
                        "couaxia:games-error",
                        {
                            detail: {

                                error

                            }
                        }
                    )
                );


                return [];


            } finally {

                loading =
                    false;


                gamesGrid.classList.remove(
                    "is-loading"
                );
            }
        }


        /* =====================================================
           COMPTEURS
        ====================================================== */

        function countStatus(
            status
        ) {

            return gameCards.filter(
                card =>
                    getStatus(
                        card
                    ) ===
                    status
            ).length;
        }


        function updateStats() {

            if (
                statCurrent
            ) {

                statCurrent.textContent =
                    String(
                        countStatus(
                            "current"
                        )
                    );
            }


            if (
                statRegular
            ) {

                statRegular.textContent =
                    String(
                        countStatus(
                            "regular"
                        )
                    );
            }


            if (
                statBacklog
            ) {

                statBacklog.textContent =
                    String(
                        countStatus(
                            "backlog"
                        )
                    );
            }


            if (
                statFinished
            ) {

                statFinished.textContent =
                    String(
                        countStatus(
                            "finished"
                        )
                    );
            }
        }


        /* =====================================================
           FILTRAGE
        ====================================================== */

        function cardMatchesFilter(
            card,
            selectedStatus
        ) {

            if (
                selectedStatus ===
                "all"
            ) {

                return true;
            }


            return (
                getStatus(
                    card
                ) ===
                selectedStatus
            );
        }


        function applyFilter() {

            const selectedStatus =
                normalizeStatus(
                    statusFilter.value ||
                    "all"
                );


            let visibleCount =
                0;


            gameCards.forEach(
                card => {

                    const visible =
                        cardMatchesFilter(
                            card,
                            selectedStatus
                        );


                    card.hidden =
                        !visible;


                    card.classList.toggle(
                        "is-game-visible",
                        visible
                    );


                    if (
                        visible
                    ) {

                        visibleCount +=
                            1;
                    }
                }
            );


            updateResults(
                visibleCount,
                selectedStatus
            );
        }


        function updateResults(
            visibleCount,
            selectedStatus
        ) {

            if (
                !results
            ) {

                return;
            }


            if (
                visibleCount ===
                0
            ) {

                results.textContent =
                    "Aucun jeu ne correspond à ce filtre.";

                return;
            }


            if (
                selectedStatus ===
                "all"
            ) {

                results.textContent =
                    `${visibleCount} jeu${
                        visibleCount > 1
                            ? "x"
                            : ""
                    } dans la bibliothèque.`;

                return;
            }


            results.textContent =
                `${visibleCount} jeu${
                    visibleCount > 1
                        ? "x"
                        : ""
                } affiché${
                    visibleCount > 1
                        ? "s"
                        : ""
                }.`;
        }


        /* =====================================================
           VOTE — STOCKAGE
        ====================================================== */

        function getStoredVote() {

            try {

                return (
                    localStorage.getItem(
                        VOTE_STORAGE_KEY
                    ) ||
                    ""
                );


            } catch (
                error
            ) {

                console.error(
                    "[Games] Impossible de lire le vote.",
                    error
                );


                return "";
            }
        }


        function saveVote(
            gameId
        ) {

            try {

                localStorage.setItem(
                    VOTE_STORAGE_KEY,
                    gameId
                );


            } catch (
                error
            ) {

                console.error(
                    "[Games] Impossible d'enregistrer le vote.",
                    error
                );
            }
        }


        /* =====================================================
           JEUX ÉLIGIBLES AU VOTE
        ====================================================== */

        function getVoteCandidates() {

            return gameCards.filter(
                card =>
                    getStatus(
                        card
                    ) ===
                    VOTE_STATUS
            );
        }


        /* =====================================================
           MODAL DE VOTE
        ====================================================== */

        function createVoteModal() {

            const modal =
                document.createElement(
                    "div"
                );


            modal.className =
                "games-vote-modal";


            modal.innerHTML = `
                <div
                    class="games-vote-dialog"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="games-vote-title"
                >

                    <button
                        type="button"
                        class="games-vote-close"
                        aria-label="Fermer"
                    >
                        ✕
                    </button>


                    <div
                        class="games-vote-header"
                    >

                        <span
                            class="games-vote-eyebrow"
                        >
                            🗳️ Communauté
                        </span>


                        <h2
                            id="games-vote-title"
                        >
                            Vote pour le prochain jeu !
                        </h2>


                        <p>
                            Quel jeu aimerais-tu voir
                            prochainement en stream ?
                        </p>

                    </div>


                    <div
                        class="games-vote-list"
                    ></div>


                    <p
                        class="games-vote-message"
                        aria-live="polite"
                    ></p>

                </div>
            `;


            document.body.appendChild(
                modal
            );


            return modal;
        }


        /* =====================================================
           OPTION DE VOTE
        ====================================================== */

        function createVoteOption(
            card
        ) {

            const gameId =
                getGameId(
                    card
                );


            const gameName =
                getGameName(
                    card
                );


            const cover =
                getGameCover(
                    card
                );


            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "games-vote-option";


            button.dataset.gameId =
                gameId;


            const coverWrapper =
                document.createElement(
                    "span"
                );


            coverWrapper.className =
                "games-vote-cover";


            if (
                cover?.src
            ) {

                const image =
                    document.createElement(
                        "img"
                    );


                image.src =
                    cover.src;


                image.alt =
                    "";


                image.draggable =
                    false;


                coverWrapper.appendChild(
                    image
                );
            }


            const name =
                document.createElement(
                    "span"
                );


            name.className =
                "games-vote-name";


            name.textContent =
                gameName;


            const check =
                document.createElement(
                    "span"
                );


            check.className =
                "games-vote-check";


            check.setAttribute(
                "aria-hidden",
                "true"
            );


            check.textContent =
                "○";


            button.append(
                coverWrapper,
                name,
                check
            );


            return button;
        }


        /* =====================================================
           SYNCHRONISATION DU VOTE
        ====================================================== */

        function updateVoteModal(
            modal
        ) {

            const storedVote =
                getStoredVote();


            modal
                .querySelectorAll(
                    ".games-vote-option"
                )
                .forEach(
                    button => {

                        const selected =
                            button.dataset
                                .gameId ===
                            storedVote;


                        button.classList.toggle(
                            "is-selected",
                            selected
                        );


                        button.setAttribute(
                            "aria-pressed",
                            String(
                                selected
                            )
                        );


                        const check =
                            button.querySelector(
                                ".games-vote-check"
                            );


                        if (
                            check
                        ) {

                            check.textContent =
                                selected
                                    ? "♥"
                                    : "○";
                        }
                    }
                );


            const message =
                modal.querySelector(
                    ".games-vote-message"
                );


            if (
                !message
            ) {

                return;
            }


            if (
                !storedVote
            ) {

                message.textContent =
                    "Tu n'as pas encore voté.";

                return;
            }


            const selectedCard =
                gameCards.find(
                    card =>
                        getGameId(
                            card
                        ) ===
                        storedVote
                );


            /*
             * Le jeu peut avoir été supprimé
             * de Supabase depuis le dernier vote.
             */

            if (
                !selectedCard
            ) {

                message.textContent =
                    "Ton ancien vote n'est plus disponible.";

                return;
            }


            message.textContent =
                `Ton vote actuel : ${getGameName(
                    selectedCard
                )} 💜`;
        }


        /* =====================================================
           OUVRIR LE VOTE
        ====================================================== */

        function openVoteModal() {

            const candidates =
                getVoteCandidates();


            if (
                candidates.length ===
                0
            ) {

                if (
                    typeof window
                        .showMascotteMessage ===
                    "function"
                ) {

                    window.showMascotteMessage(
                        "Il n'y a aucun jeu à départager pour le moment ! 👀",
                        3500
                    );
                }


                return;
            }


            let modal =
                document.querySelector(
                    ".games-vote-modal"
                );


            if (
                !modal
            ) {

                modal =
                    createVoteModal();
            }


            const list =
                modal.querySelector(
                    ".games-vote-list"
                );


            if (
                !list
            ) {

                return;
            }


            list.innerHTML =
                "";


            candidates.forEach(
                card => {

                    list.appendChild(
                        createVoteOption(
                            card
                        )
                    );
                }
            );


            updateVoteModal(
                modal
            );


            modal.classList.add(
                "is-open"
            );


            document.body.classList.add(
                "games-vote-open"
            );


            modal
                .querySelector(
                    ".games-vote-close"
                )
                ?.focus();


            if (
                typeof window
                    .showMascotteMessage ===
                "function"
            ) {

                window.showMascotteMessage(
                    "À toi de choisir ce que je devrais jouer ! 🗳️💜",
                    3500
                );
            }
        }


        /* =====================================================
           FERMER LE VOTE
        ====================================================== */

        function closeVoteModal(
            modal
        ) {

            if (
                !modal
            ) {

                return;
            }


            modal.classList.remove(
                "is-open"
            );


            document.body.classList.remove(
                "games-vote-open"
            );
        }


        /* =====================================================
           ENREGISTRER UN VOTE
        ====================================================== */

        function voteForGame(
            modal,
            gameId
        ) {

            if (
                !gameId
            ) {

                return;
            }


            saveVote(
                gameId
            );


            updateVoteModal(
                modal
            );


            const selectedCard =
                gameCards.find(
                    card =>
                        getGameId(
                            card
                        ) ===
                        gameId
                );


            const gameName =
                selectedCard
                    ? getGameName(
                        selectedCard
                    )
                    : "ce jeu";


            if (
                typeof window
                    .showMascotteMessage ===
                "function"
            ) {

                const messages = [

                    `Vote enregistré pour ${gameName} ! 💜`,

                    `${gameName} ? Bon choix ! 👀`,

                    `Je note ton vote pour ${gameName} 🗳️`,

                    `On verra si ${gameName} gagne ! 😏`

                ];


                const message =
                    messages[
                        Math.floor(
                            Math.random() *
                            messages.length
                        )
                    ];


                window.showMascotteMessage(
                    message,
                    3500
                );
            }


            document.dispatchEvent(
                new CustomEvent(
                    "couaxia:game-vote-changed",
                    {
                        detail: {

                            gameId,

                            gameName

                        }
                    }
                )
            );
        }


        /* =====================================================
           ÉVÉNEMENTS — FILTRE
        ====================================================== */

        statusFilter.addEventListener(
            "change",
            applyFilter
        );


        /* =====================================================
           ÉVÉNEMENTS — VOTE
        ====================================================== */

        if (
            voteButton
        ) {

            voteButton.addEventListener(
                "click",
                openVoteModal
            );
        }


        /* =====================================================
           ÉVÉNEMENTS — MODAL
        ====================================================== */

        document.addEventListener(
            "click",
            event => {

                if (
                    !(
                        event.target instanceof
                        Element
                    )
                ) {

                    return;
                }


                const modal =
                    event.target.closest(
                        ".games-vote-modal"
                    );


                if (
                    !modal
                ) {

                    return;
                }


                /* =========================================
                   FERMER
                ========================================== */

                if (
                    event.target.closest(
                        ".games-vote-close"
                    )
                ) {

                    closeVoteModal(
                        modal
                    );

                    return;
                }


                /* =========================================
                   VOTER
                ========================================== */

                const voteOption =
                    event.target.closest(
                        ".games-vote-option"
                    );


                if (
                    voteOption
                ) {

                    voteForGame(
                        modal,
                        normalizeString(
                            voteOption.dataset
                                .gameId
                        )
                    );

                    return;
                }


                /* =========================================
                   CLIC SUR LE FOND
                ========================================== */

                if (
                    event.target ===
                    modal
                ) {

                    closeVoteModal(
                        modal
                    );
                }
            }
        );


        /* =====================================================
           ÉCHAP
        ====================================================== */

        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key !==
                    "Escape"
                ) {

                    return;
                }


                const modal =
                    document.querySelector(
                        ".games-vote-modal.is-open"
                    );


                if (
                    !modal
                ) {

                    return;
                }


                closeVoteModal(
                    modal
                );
            }
        );


        /* =====================================================
           MISE À JOUR TWITCH
        ====================================================== */

        /*
         * games-twitch.js déclenche cet événement
         * une fois les noms et jaquettes chargés.
         *
         * Si le modal de vote est ouvert,
         * on le reconstruit afin d'utiliser les
         * vraies jaquettes Twitch.
         */

        document.addEventListener(
            "couaxia:games-updated",
            event => {

                if (
                    event?.detail?.source !==
                    "twitch"
                ) {

                    return;
                }


                const modal =
                    document.querySelector(
                        ".games-vote-modal.is-open"
                    );


                if (
                    !modal
                ) {

                    return;
                }


                const list =
                    modal.querySelector(
                        ".games-vote-list"
                    );


                if (
                    !list
                ) {

                    return;
                }


                list.innerHTML =
                    "";


                getVoteCandidates()
                    .forEach(
                        card => {

                            list.appendChild(
                                createVoteOption(
                                    card
                                )
                            );
                        }
                    );


                updateVoteModal(
                    modal
                );
            }
        );


        /* =====================================================
           API PUBLIQUE
        ====================================================== */

        window.CouaxiaGames = {

            /**
             * Retourne les cartes actuellement
             * présentes dans la page.
             */
            getCards() {

                return [
                    ...gameCards
                ];
            },


            /**
             * Retourne les données provenant
             * de Supabase.
             */
            getGames() {

                return [
                    ...gamesData
                ];
            },


            /**
             * Recharge complètement les jeux.
             */
            reload() {

                return loadGames();
            },


            /**
             * Réapplique le filtre actuel.
             */
            applyFilter() {

                applyFilter();
            },


            /**
             * Retourne le vote local.
             */
            getVote() {

                return getStoredVote();
            }

        };


        /* =====================================================
           PREMIER CHARGEMENT
        ====================================================== */

        loadGames();
    }
);