"use strict";

/* =========================================================
   PAGE JEUX — COUAXIA
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

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


    const gameCards =
        Array.from(
            gamesGrid.querySelectorAll(
                ".game-card"
            )
        );


    /* =====================================================
       CONFIGURATION DU VOTE
    ====================================================== */

    const VOTE_STORAGE_KEY =
        "couaxia-game-vote";


    /*
     * Statuts autorisés dans le vote.
     *
     * Ici on ne propose que les jeux
     * "À faire".
     */
    const VOTE_STATUS =
        "backlog";


    /* =====================================================
       OUTILS
    ====================================================== */

    function getStatus(card) {

        return String(
            card.dataset.status ||
            ""
        )
            .trim()
            .toLowerCase();
    }


    function getGameId(card) {

        return String(
            card.dataset.gameId ||
            ""
        ).trim();
    }


    function getGameName(card) {

        const heading =
            card.querySelector(
                ".game-content h2"
            );


        return (
            heading?.textContent?.trim() ||
            "Jeu inconnu"
        );
    }


    function getGameCover(card) {

        return card.querySelector(
            ".game-cover img"
        );
    }


    /* =====================================================
       COMPTEURS
    ====================================================== */

    function countStatus(status) {

        return gameCards.filter(
            (card) =>
                getStatus(card) ===
                status
        ).length;
    }


    function updateStats() {

        if (statCurrent) {
            statCurrent.textContent =
                countStatus(
                    "current"
                );
        }


        if (statRegular) {
            statRegular.textContent =
                countStatus(
                    "regular"
                );
        }


        if (statBacklog) {
            statBacklog.textContent =
                countStatus(
                    "backlog"
                );
        }


        if (statFinished) {
            statFinished.textContent =
                countStatus(
                    "finished"
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
            getStatus(card) ===
            selectedStatus
        );
    }


    function applyFilter() {

        const selectedStatus =
            statusFilter.value;


        let visibleCount =
            0;


        gameCards.forEach(
            (card) => {

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


                if (visible) {
                    visibleCount += 1;
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

        if (!results) {
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

            const stored =
                localStorage.getItem(
                    VOTE_STORAGE_KEY
                );


            return stored || "";

        } catch (error) {

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

        } catch (error) {

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
            (card) =>
                getStatus(card) ===
                VOTE_STATUS
        );
    }


    /* =====================================================
       CRÉATION DU MODAL DE VOTE
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


                <div class="games-vote-header">

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
       CRÉATION D'UNE OPTION DE VOTE
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


        const imageSource =
            cover?.getAttribute(
                "src"
            ) || "";


        button.innerHTML = `
            <span
                class="games-vote-cover"
            >
                ${
                    imageSource
                        ?
                        `
                        <img
                            src="${imageSource}"
                            alt=""
                            draggable="false"
                        >
                        `
                        :
                        ""
                }
            </span>

            <span
                class="games-vote-name"
            >
                ${gameName}
            </span>

            <span
                class="games-vote-check"
                aria-hidden="true"
            >
                ○
            </span>
        `;


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
                (button) => {

                    const selected =
                        button.dataset.gameId ===
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


                    if (check) {
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


        if (!message) {
            return;
        }


        if (!storedVote) {

            message.textContent =
                "Tu n'as pas encore voté.";

            return;
        }


        const selectedCard =
            gameCards.find(
                (card) =>
                    getGameId(card) ===
                    storedVote
            );


        const selectedName =
            selectedCard
                ? getGameName(
                    selectedCard
                )
                : "ce jeu";


        message.textContent =
            `Ton vote actuel : ${selectedName} 💜`;
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


        if (!modal) {

            modal =
                createVoteModal();

        }


        const list =
            modal.querySelector(
                ".games-vote-list"
            );


        if (!list) {
            return;
        }


        list.innerHTML =
            "";


        candidates.forEach(
            (card) => {

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

        if (!gameId) {
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
                (card) =>
                    getGameId(card) ===
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
    }


    /* =====================================================
       ÉVÉNEMENTS — FILTRE
    ====================================================== */

    statusFilter.addEventListener(
        "change",
        applyFilter
    );


    /* =====================================================
       ÉVÉNEMENTS — OUVERTURE DU VOTE
    ====================================================== */

    if (voteButton) {

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
        (event) => {

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


            if (!modal) {
                return;
            }


            /* =============================================
               FERMER
            ============================================= */

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


            /* =============================================
               VOTER
            ============================================= */

            const voteOption =
                event.target.closest(
                    ".games-vote-option"
                );


            if (voteOption) {

                voteForGame(
                    modal,
                    String(
                        voteOption.dataset.gameId ||
                        ""
                    )
                );

                return;
            }


            /* =============================================
               CLIC SUR LE FOND
            ============================================= */

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
        (event) => {

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


            if (!modal) {
                return;
            }


            closeVoteModal(
                modal
            );

        }
    );


    /* =====================================================
       PREMIÈRE INITIALISATION
    ====================================================== */

    updateStats();

    applyFilter();

});