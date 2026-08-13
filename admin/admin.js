"use strict";

/* =========================================================
   ADMINISTRATION — COUAXIA
========================================================= */

import {
    getGame
} from "../js/game.js";


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        /* =================================================
           CONFIGURATION
        ================================================= */

        const ADMIN_GAMES_API =
            "/api/admin/games";


        /* =================================================
           ÉLÉMENTS — ADMIN
        ================================================= */

        const adminUserName =
            document.getElementById(
                "admin-user-name"
            );

        const adminUserRole =
            document.getElementById(
                "admin-user-role"
            );

        const adminUserAvatar =
            document.getElementById(
                "admin-user-avatar"
            );


        /* =================================================
           ÉLÉMENTS — NAVIGATION
        ================================================= */

        const navButtons =
            Array.from(
                document.querySelectorAll(
                    ".admin-nav-button[data-admin-section]"
                )
            );

        const sections =
            Array.from(
                document.querySelectorAll(
                    ".admin-section[data-admin-panel]"
                )
            );

        const quickActions =
            Array.from(
                document.querySelectorAll(
                    "[data-open-section]"
                )
            );


        /* =================================================
           ÉLÉMENTS — DASHBOARD
        ================================================= */

        const statGames =
            document.getElementById(
                "admin-stat-games"
            );

        const statArtworks =
            document.getElementById(
                "admin-stat-artworks"
            );

        const statPoll =
            document.getElementById(
                "admin-stat-poll"
            );

        const statVotes =
            document.getElementById(
                "admin-stat-votes"
            );


        /* =================================================
           ÉLÉMENTS — FORMULAIRE JEU
        ================================================= */

        const gameForm =
            document.getElementById(
                "admin-game-form"
            );

        const gameFormPanel =
            document.getElementById(
                "admin-game-form-panel"
            );

        const gameFormTitle =
            document.getElementById(
                "admin-game-form-title"
            );

        const gameIdInput =
            document.getElementById(
                "admin-game-id"
            );

        const twitchGameIdInput =
            document.getElementById(
                "admin-game-twitch-id"
            );

        const statusInput =
            document.getElementById(
                "admin-game-status"
            );

        const tagsInput =
            document.getElementById(
                "admin-game-tags"
            );

        const descriptionInput =
            document.getElementById(
                "admin-game-description"
            );

        const ratingInput =
            document.getElementById(
                "admin-game-rating"
            );

        const youtubeInput =
            document.getElementById(
                "admin-game-youtube"
            );

        const pollInput =
            document.getElementById(
                "admin-game-poll"
            );

        const newGameButton =
            document.getElementById(
                "admin-new-game"
            );

        const cancelGameButton =
            document.getElementById(
                "admin-game-cancel"
            );

        const twitchPreviewButton =
            document.getElementById(
                "admin-game-twitch-preview"
            );

        const submitGameButton =
            document.getElementById(
                "admin-game-submit"
            );


        /* =================================================
           ÉLÉMENTS — APERÇU TWITCH
        ================================================= */

        const twitchResult =
            document.getElementById(
                "admin-game-twitch-result"
            );

        const twitchPreviewCover =
            document.getElementById(
                "admin-game-preview-cover"
            );

        const twitchPreviewName =
            document.getElementById(
                "admin-game-preview-name"
            );

        const twitchPreviewId =
            document.getElementById(
                "admin-game-preview-id"
            );


        /* =================================================
           ÉLÉMENTS — LISTE DES JEUX
        ================================================= */

        const gamesList =
            document.getElementById(
                "admin-games-list"
            );

        const gamesSearch =
            document.getElementById(
                "admin-games-search"
            );


        /* =================================================
           ÉLÉMENTS — MODAL
        ================================================= */

        const confirmModal =
            document.getElementById(
                "admin-confirm-modal"
            );

        const confirmMessage =
            document.getElementById(
                "admin-confirm-message"
            );

        const confirmClose =
            document.getElementById(
                "admin-confirm-close"
            );

        const confirmCancel =
            document.getElementById(
                "admin-confirm-cancel"
            );

        const confirmDelete =
            document.getElementById(
                "admin-confirm-delete"
            );


        /* =================================================
           ÉLÉMENTS — TOASTS
        ================================================= */

        const toastContainer =
            document.getElementById(
                "admin-toast-container"
            );


        /* =================================================
           ÉLÉMENTS — SONDAGE
        ================================================= */

        const pollGamesList =
            document.getElementById(
                "admin-poll-games-list"
            );

        const pollGameCount =
            document.getElementById(
                "admin-poll-game-count"
            );


        /* =================================================
           ÉTAT
        ================================================= */

        let games = [];

        let currentEditingId =
            null;

        let pendingDeleteId =
            null;

        let currentTwitchPreview =
            null;


        /* =================================================
           SÉCURITÉ HTML
        ================================================= */

        function escapeHtml(
            value
        ) {

            const element =
                document.createElement(
                    "div"
                );

            element.textContent =
                String(
                    value ?? ""
                );

            return element.innerHTML;
        }


        function escapeHtmlAttribute(
            value
        ) {

            return escapeHtml(
                value
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


        /* =================================================
           TOAST
        ================================================= */

        function showToast(
            message,
            type = "success"
        ) {

            if (!toastContainer) {
                return;
            }


            const toast =
                document.createElement(
                    "div"
                );

            toast.className =
                `admin-toast is-${type}`;

            toast.textContent =
                message;

            toastContainer.appendChild(
                toast
            );


            window.setTimeout(
                () => {
                    toast.remove();
                },
                3500
            );
        }


        /* =================================================
           AUTHENTIFICATION ADMIN
        ================================================= */

        async function checkAdminAuthentication() {

            try {

                const response =
                    await fetch(
                        "/api/admin/auth-me",
                        {
                            method:
                                "GET",

                            credentials:
                                "same-origin",

                            cache:
                                "no-store",

                            headers: {
                                Accept:
                                    "application/json"
                            }
                        }
                    );


                if (
                    response.status === 401 ||
                    response.status === 403
                ) {

                    window.location.replace(
                        "/api/admin/auth-login"
                    );

                    return null;
                }


                const data =
                    await response
                        .json()
                        .catch(
                            () => null
                        );


                if (
                    !response.ok ||
                    !data?.authenticated ||
                    !data?.user
                ) {

                    console.error(
                        "[Admin Auth] Réponse invalide :",
                        data
                    );

                    showAuthenticationError(
                        "Impossible de vérifier la session administrateur."
                    );

                    return null;
                }


                return data.user;

            } catch (error) {

                console.error(
                    "[Admin Auth] Vérification impossible :",
                    error
                );

                showAuthenticationError(
                    "Impossible de contacter le service d'authentification."
                );

                return null;
            }
        }


        function showAuthenticationError(
            message
        ) {

            document.body.innerHTML = `
                <main
                    style="
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 24px;
                        text-align: center;
                    "
                >

                    <section>

                        <h1>
                            Administration indisponible
                        </h1>

                        <p>
                            ${escapeHtml(message)}
                        </p>

                        <a
                            href="/api/admin/auth-login"
                        >
                            Se reconnecter avec Twitch
                        </a>

                    </section>

                </main>
            `;
        }


        function applyAdminUser(
            user
        ) {

            if (adminUserName) {

                adminUserName.textContent =
                    user.displayName ||
                    user.login ||
                    "Couaxia";
            }


            if (adminUserRole) {

                adminUserRole.textContent =
                    "Administratrice";
            }


            if (
                adminUserAvatar &&
                user.profileImageUrl
            ) {

                adminUserAvatar.src =
                    user.profileImageUrl;

                adminUserAvatar.alt =
                    user.displayName
                        ? `Avatar Twitch de ${user.displayName}`
                        : "Avatar Twitch";
            }
        }


        /* =================================================
           DÉCONNEXION
        ================================================= */

        function createLogoutButton() {

            const headerActions =
                document.querySelector(
                    ".admin-header-actions"
                );


            if (
                !headerActions ||
                document.getElementById(
                    "admin-logout-button"
                )
            ) {
                return;
            }


            const button =
                document.createElement(
                    "button"
                );

            button.id =
                "admin-logout-button";

            button.type =
                "button";

            button.className =
                "admin-secondary-button";

            button.textContent =
                "🚪 Déconnexion";

            button.setAttribute(
                "aria-label",
                "Se déconnecter de l’administration"
            );

            button.addEventListener(
                "click",
                logoutAdmin
            );

            headerActions.appendChild(
                button
            );
        }


        async function logoutAdmin() {

            const logoutButton =
                document.getElementById(
                    "admin-logout-button"
                );


            if (logoutButton) {

                logoutButton.disabled =
                    true;

                logoutButton.textContent =
                    "⏳ Déconnexion...";
            }


            try {

                const response =
                    await fetch(
                        "/api/admin/auth-logout",
                        {
                            method:
                                "POST",

                            credentials:
                                "same-origin",

                            cache:
                                "no-store",

                            headers: {
                                Accept:
                                    "application/json"
                            }
                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        `HTTP ${response.status}`
                    );
                }


                window.location.replace(
                    "/api/admin/auth-login"
                );

            } catch (error) {

                console.error(
                    "[Admin Auth] Déconnexion impossible :",
                    error
                );


                if (logoutButton) {

                    logoutButton.disabled =
                        false;

                    logoutButton.textContent =
                        "🚪 Déconnexion";
                }


                showToast(
                    "Impossible de se déconnecter.",
                    "error"
                );
            }
        }


        /* =================================================
           API ADMIN
        ================================================= */

        async function adminApiRequest(
            url,
            options = {}
        ) {

            const requestOptions = {
                ...options,

                credentials:
                    "same-origin",

                cache:
                    "no-store",

                headers: {
                    Accept:
                        "application/json",

                    ...options.headers
                }
            };


            if (
                requestOptions.body &&
                typeof requestOptions.body !==
                "string"
            ) {

                requestOptions.headers[
                    "Content-Type"
                ] =
                    "application/json";

                requestOptions.body =
                    JSON.stringify(
                        requestOptions.body
                    );
            }


            const response =
                await fetch(
                    url,
                    requestOptions
                );


            if (
                response.status === 401 ||
                response.status === 403
            ) {

                window.location.replace(
                    "/api/admin/auth-login"
                );

                throw new Error(
                    "Session administrateur expirée."
                );
            }


            const data =
                await response
                    .json()
                    .catch(
                        () => ({})
                    );


            if (!response.ok) {

                throw new Error(
                    data?.error ||
                    `Erreur HTTP ${response.status}`
                );
            }


            return data;
        }


        /* =================================================
           CHARGER LES JEUX DEPUIS SUPABASE
        ================================================= */

        async function loadGames() {

            if (gamesList) {

                gamesList.innerHTML = `
                    <p class="admin-empty-state">
                        ⏳ Chargement des jeux...
                    </p>
                `;
            }


            try {

                const data =
                    await adminApiRequest(
                        ADMIN_GAMES_API,
                        {
                            method:
                                "GET"
                        }
                    );


                games =
                    Array.isArray(
                        data?.games
                    )
                        ? data.games
                        : [];


                renderGames();

                renderPollGames();

                updateDashboardStats();


                return games;

            } catch (error) {

                console.error(
                    "[Admin Games] Chargement impossible :",
                    error
                );


                games = [];


                if (gamesList) {

                    gamesList.innerHTML = `
                        <p class="admin-empty-state">
                            Impossible de charger les jeux.
                        </p>
                    `;
                }


                showToast(
                    error.message ||
                    "Impossible de charger les jeux.",
                    "error"
                );


                return [];
            }
        }


        /* =================================================
           NAVIGATION
        ================================================= */

        function openSection(
            sectionName
        ) {

            navButtons.forEach(
                (button) => {

                    const active =
                        button.dataset
                            .adminSection ===
                        sectionName;

                    button.classList.toggle(
                        "is-active",
                        active
                    );
                }
            );


            sections.forEach(
                (section) => {

                    const active =
                        section.dataset
                            .adminPanel ===
                        sectionName;

                    section.hidden =
                        !active;

                    section.classList.toggle(
                        "is-active",
                        active
                    );
                }
            );


            if (
                sectionName ===
                "games"
            ) {

                renderGames();
            }


            if (
                sectionName ===
                "poll"
            ) {

                renderPollGames();
            }
        }


        /* =================================================
           NORMALISER LES TAGS
        ================================================= */

        function normalizeTags(
            value
        ) {

            return [
                ...new Set(
                    String(
                        value || ""
                    )
                        .split(",")
                        .map(
                            (tag) =>
                                tag
                                    .trim()
                                    .toLowerCase()
                        )
                        .filter(Boolean)
                )
            ];
        }


        /* =================================================
           APERÇU TWITCH
        ================================================= */

        function resetTwitchPreview() {

            currentTwitchPreview =
                null;


            if (twitchResult) {

                twitchResult.hidden =
                    true;
            }


            if (twitchPreviewCover) {

                twitchPreviewCover.src =
                    "";

                twitchPreviewCover.alt =
                    "";
            }


            if (twitchPreviewName) {

                twitchPreviewName.textContent =
                    "—";
            }


            if (twitchPreviewId) {

                twitchPreviewId.textContent =
                    "";
            }
        }


        function showTwitchPreview(
            game
        ) {

            if (!game) {
                return;
            }


            currentTwitchPreview =
                game;


            if (twitchPreviewName) {

                twitchPreviewName.textContent =
                    game.name ||
                    "Jeu Twitch";
            }


            if (twitchPreviewId) {

                twitchPreviewId.textContent =
                    game.id
                        ? `ID Twitch : ${game.id}`
                        : "";
            }


            if (twitchPreviewCover) {

                if (game.boxArtUrl) {

                    twitchPreviewCover.src =
                        game.boxArtUrl;

                    twitchPreviewCover.alt =
                        game.name
                            ? `Jaquette de ${game.name}`
                            : "Jaquette Twitch";

                } else {

                    twitchPreviewCover.src =
                        "";

                    twitchPreviewCover.alt =
                        "";
                }
            }


            if (twitchResult) {

                twitchResult.hidden =
                    false;
            }
        }


        async function previewTwitchGame() {

            const twitchGameId =
                String(
                    twitchGameIdInput?.value ||
                    ""
                ).trim();


            if (!twitchGameId) {

                showToast(
                    "Entre d'abord un ID de jeu Twitch.",
                    "warning"
                );

                twitchGameIdInput?.focus();

                return;
            }


            if (twitchPreviewButton) {

                twitchPreviewButton.disabled =
                    true;

                twitchPreviewButton.textContent =
                    "⏳ Vérification...";
            }


            try {

                const game =
                    await getGame(
                        twitchGameId
                    );


                if (
                    !game ||
                    game.found === false
                ) {

                    resetTwitchPreview();

                    showToast(
                        "Aucun jeu trouvé avec cet ID Twitch.",
                        "warning"
                    );

                    return;
                }


                showTwitchPreview(
                    game
                );


                showToast(
                    `${game.name} trouvé sur Twitch.`,
                    "success"
                );

            } catch (error) {

                console.error(
                    "[Admin] Erreur Twitch :",
                    error
                );


                resetTwitchPreview();


                showToast(
                    "Impossible de récupérer ce jeu depuis Twitch.",
                    "error"
                );

            } finally {

                if (twitchPreviewButton) {

                    twitchPreviewButton.disabled =
                        false;

                    twitchPreviewButton.textContent =
                        "🔎 Vérifier";
                }
            }
        }


        /* =================================================
           FORMULAIRE
        ================================================= */

        function resetGameForm() {

            currentEditingId =
                null;

            gameForm?.reset();


            if (gameIdInput) {

                gameIdInput.value =
                    "";
            }


            if (twitchGameIdInput) {

                twitchGameIdInput.disabled =
                    false;
            }


            resetTwitchPreview();


            if (gameFormTitle) {

                gameFormTitle.textContent =
                    "Ajouter un jeu";
            }


            if (submitGameButton) {

                submitGameButton.textContent =
                    "💾 Enregistrer";
            }
        }


        function openNewGameForm() {

            openSection(
                "games"
            );

            resetGameForm();


            gameFormPanel
                ?.scrollIntoView({
                    behavior:
                        "smooth",

                    block:
                        "start"
                });


            twitchGameIdInput
                ?.focus();
        }


        function fillGameForm(
            game
        ) {

            if (!game) {
                return;
            }


            currentEditingId =
                game.id;


            if (gameIdInput) {

                gameIdInput.value =
                    game.id;
            }


            if (twitchGameIdInput) {

                twitchGameIdInput.value =
                    game.twitchGameId ||
                    "";

                /*
                 * L'ID Twitch est utilisé comme
                 * identifiant unique du jeu.
                 *
                 * On ne le modifie pas lors
                 * de l'édition.
                 */
                twitchGameIdInput.disabled =
                    true;
            }


            if (statusInput) {

                statusInput.value =
                    game.status ||
                    "backlog";
            }


            if (tagsInput) {

                tagsInput.value =
                    Array.isArray(
                        game.tags
                    )
                        ? game.tags.join(
                            ", "
                        )
                        : "";
            }


            if (descriptionInput) {

                descriptionInput.value =
                    game.description ||
                    "";
            }


            if (ratingInput) {

                ratingInput.value =
                    game.rating !== null &&
                    game.rating !== undefined
                        ? String(
                            game.rating
                        )
                        : "";
            }


            if (youtubeInput) {

                youtubeInput.value =
                    game.youtubePlaylist ||
                    "";
            }


            if (pollInput) {

                pollInput.checked =
                    Boolean(
                        game.pollEnabled
                    );
            }


            if (gameFormTitle) {

                gameFormTitle.textContent =
                    "Modifier le jeu";
            }


            if (submitGameButton) {

                submitGameButton.textContent =
                    "💾 Enregistrer les modifications";
            }


            showTwitchPreview({
                id:
                    game.twitchGameId,

                name:
                    game.twitchName,

                boxArtUrl:
                    game.boxArtUrl,

                found:
                    true
            });


            gameFormPanel
                ?.scrollIntoView({
                    behavior:
                        "smooth",

                    block:
                        "start"
                });
        }


        function buildGameFromForm() {

            const twitchGameId =
                String(
                    twitchGameIdInput?.value ||
                    ""
                ).trim();


            if (!twitchGameId) {

                return null;
            }


            return {

                id:
                    currentEditingId,

                twitchGameId,

                status:
                    statusInput?.value ||
                    "backlog",

                tags:
                    normalizeTags(
                        tagsInput?.value
                    ),

                description:
                    String(
                        descriptionInput?.value ||
                        ""
                    ).trim(),

                rating:
                    ratingInput?.value
                        ? Number(
                            ratingInput.value
                        )
                        : null,

                youtubePlaylist:
                    String(
                        youtubeInput?.value ||
                        ""
                    ).trim(),

                pollEnabled:
                    Boolean(
                        pollInput?.checked
                    )
            };
        }


        /* =================================================
           AJOUT / MODIFICATION SUPABASE
        ================================================= */

        async function saveGameFromForm(
            event
        ) {

            event.preventDefault();


            const game =
                buildGameFromForm();


            if (!game) {

                showToast(
                    "L'ID Twitch est obligatoire.",
                    "warning"
                );

                return;
            }


            const editing =
                Boolean(
                    currentEditingId
                );


            if (submitGameButton) {

                submitGameButton.disabled =
                    true;

                submitGameButton.textContent =
                    editing
                        ? "⏳ Modification..."
                        : "⏳ Ajout...";
            }


            try {

                const data =
                    await adminApiRequest(
                        ADMIN_GAMES_API,
                        {
                            method:
                                editing
                                    ? "PUT"
                                    : "POST",

                            body:
                                game
                        }
                    );


                if (!data?.game) {

                    throw new Error(
                        "Le serveur n'a pas retourné le jeu enregistré."
                    );
                }


                if (editing) {

                    const index =
                        games.findIndex(
                            (item) =>
                                item.id ===
                                data.game.id
                        );


                    if (index >= 0) {

                        games[
                            index
                        ] =
                            data.game;

                    } else {

                        games.push(
                            data.game
                        );
                    }


                    showToast(
                        "Jeu modifié avec succès.",
                        "success"
                    );

                } else {

                    games.unshift(
                        data.game
                    );


                    showToast(
                        `${data.game.twitchName} a été ajouté.`,
                        "success"
                    );
                }


                resetGameForm();

                renderGames();

                renderPollGames();

                updateDashboardStats();

            } catch (error) {

                console.error(
                    "[Admin Games] Enregistrement impossible :",
                    error
                );


                showToast(
                    error.message ||
                    "Impossible d'enregistrer le jeu.",
                    "error"
                );

            } finally {

                if (submitGameButton) {

                    submitGameButton.disabled =
                        false;

                    submitGameButton.textContent =
                        currentEditingId
                            ? "💾 Enregistrer les modifications"
                            : "💾 Enregistrer";
                }
            }
        }


        /* =================================================
           STATUT
        ================================================= */

        function getStatusLabel(
            status
        ) {

            const labels = {

                current:
                    "🔥 En cours",

                regular:
                    "🔁 Régulier",

                backlog:
                    "📚 À faire",

                paused:
                    "⏸️ En pause",

                finished:
                    "🏆 Terminé"
            };


            return (
                labels[
                    status
                ] ||
                status ||
                "Inconnu"
            );
        }


        /* =================================================
           CARTE ADMIN JEU
        ================================================= */

        function createGameItem(
            game
        ) {

            const article =
                document.createElement(
                    "article"
                );


            article.className =
                "admin-game-item";

            article.dataset.gameId =
                game.id;


            const tags =
                Array.isArray(
                    game.tags
                )
                    ? game.tags
                    : [];


            article.innerHTML = `

                <div
                    class="admin-game-item-cover"
                >

                    ${
                        game.boxArtUrl
                            ? `
                                <img
                                    src="${escapeHtmlAttribute(
                                        game.boxArtUrl
                                    )}"
                                    alt="Jaquette de ${escapeHtmlAttribute(
                                        game.twitchName || ""
                                    )}"
                                    draggable="false"
                                >
                            `
                            : `
                                <div
                                    class="admin-game-cover-placeholder"
                                >
                                    🎮
                                </div>
                            `
                    }

                </div>


                <div
                    class="admin-game-item-content"
                >

                    <h3>
                        ${escapeHtml(
                            game.twitchName ||
                            `Twitch #${game.twitchGameId}`
                        )}
                    </h3>


                    <div
                        class="admin-game-item-meta"
                    >

                        <span>
                            ${escapeHtml(
                                getStatusLabel(
                                    game.status
                                )
                            )}
                        </span>


                        ${
                            game.pollEnabled
                                ? `
                                    <span>
                                        🗳️ Sondage
                                    </span>
                                `
                                : ""
                        }


                        ${
                            game.rating !== null &&
                            game.rating !== undefined
                                ? `
                                    <span>
                                        💜 ${escapeHtml(
                                            game.rating
                                        )}/10
                                    </span>
                                `
                                : ""
                        }

                    </div>


                    ${
                        tags.length > 0
                            ? `
                                <div
                                    class="admin-game-item-meta"
                                >

                                    ${tags
                                        .map(
                                            (tag) => `
                                                <span>
                                                    ${escapeHtml(
                                                        tag
                                                    )}
                                                </span>
                                            `
                                        )
                                        .join("")}

                                </div>
                            `
                            : ""
                    }


                    ${
                        game.description
                            ? `
                                <p
                                    class="admin-game-item-description"
                                >
                                    ${escapeHtml(
                                        game.description
                                    )}
                                </p>
                            `
                            : ""
                    }


                    <div
                        class="admin-game-item-actions"
                    >

                        <button
                            type="button"
                            class="admin-secondary-button"
                            data-edit-game="${escapeHtmlAttribute(
                                game.id
                            )}"
                        >
                            ✏️ Modifier
                        </button>


                        <button
                            type="button"
                            class="admin-danger-button"
                            data-delete-game="${escapeHtmlAttribute(
                                game.id
                            )}"
                        >
                            🗑️ Supprimer
                        </button>

                    </div>

                </div>
            `;


            return article;
        }


        /* =================================================
           AFFICHAGE DES JEUX
        ================================================= */

        function renderGames() {

            if (!gamesList) {
                return;
            }


            const search =
                String(
                    gamesSearch?.value ||
                    ""
                )
                    .trim()
                    .toLowerCase();


            const filteredGames =
                games.filter(
                    (game) => {

                        if (!search) {

                            return true;
                        }


                        const searchable =
                            [
                                game.twitchName,
                                game.twitchGameId,
                                game.status,
                                game.description,
                                ...(game.tags || [])
                            ]
                                .join(" ")
                                .toLowerCase();


                        return searchable.includes(
                            search
                        );
                    }
                );


            gamesList.innerHTML =
                "";


            if (
                filteredGames.length ===
                0
            ) {

                const empty =
                    document.createElement(
                        "p"
                    );

                empty.className =
                    "admin-empty-state";

                empty.textContent =
                    games.length === 0
                        ? "Aucun jeu enregistré pour le moment."
                        : "Aucun jeu ne correspond à la recherche.";

                gamesList.appendChild(
                    empty
                );

                return;
            }


            filteredGames.forEach(
                (game) => {

                    gamesList.appendChild(
                        createGameItem(
                            game
                        )
                    );
                }
            );
        }


        /* =================================================
           MODAL SUPPRESSION
        ================================================= */

        function openDeleteModal(
            gameId
        ) {

            const game =
                games.find(
                    (item) =>
                        item.id ===
                        gameId
                );


            if (!game) {
                return;
            }


            pendingDeleteId =
                gameId;


            if (confirmMessage) {

                confirmMessage.textContent =
                    `Veux-tu vraiment supprimer ${
                        game.twitchName ||
                        "ce jeu"
                    } ?`;
            }


            if (confirmModal) {

                confirmModal.hidden =
                    false;
            }


            confirmDelete?.focus();
        }


        function closeDeleteModal() {

            pendingDeleteId =
                null;


            if (confirmModal) {

                confirmModal.hidden =
                    true;
            }
        }


        /* =================================================
           SUPPRESSION SUPABASE
        ================================================= */

        async function deletePendingGame() {

            if (!pendingDeleteId) {
                return;
            }


            const gameId =
                pendingDeleteId;


            if (confirmDelete) {

                confirmDelete.disabled =
                    true;

                confirmDelete.textContent =
                    "⏳ Suppression...";
            }


            try {

                await adminApiRequest(
                    ADMIN_GAMES_API,
                    {
                        method:
                            "DELETE",

                        body: {
                            id:
                                gameId
                        }
                    }
                );


                games =
                    games.filter(
                        (game) =>
                            game.id !==
                            gameId
                    );


                closeDeleteModal();

                renderGames();

                renderPollGames();

                updateDashboardStats();


                if (
                    currentEditingId ===
                    gameId
                ) {

                    resetGameForm();
                }


                showToast(
                    "Jeu supprimé.",
                    "success"
                );

            } catch (error) {

                console.error(
                    "[Admin Games] Suppression impossible :",
                    error
                );


                showToast(
                    error.message ||
                    "Impossible de supprimer le jeu.",
                    "error"
                );

            } finally {

                if (confirmDelete) {

                    confirmDelete.disabled =
                        false;

                    confirmDelete.textContent =
                        "🗑️ Supprimer";
                }
            }
        }


        /* =================================================
           SONDAGE — JEUX ÉLIGIBLES
        ================================================= */

        function renderPollGames() {

            if (!pollGamesList) {
                return;
            }


            const eligibleGames =
                games.filter(
                    (game) =>
                        game.pollEnabled ===
                        true
                );


            pollGamesList.innerHTML =
                "";


            if (
                eligibleGames.length ===
                0
            ) {

                const empty =
                    document.createElement(
                        "p"
                    );

                empty.className =
                    "admin-empty-state";

                empty.textContent =
                    "Aucun jeu n'est éligible au sondage.";

                pollGamesList.appendChild(
                    empty
                );

            } else {

                eligibleGames.forEach(
                    (game) => {

                        const label =
                            document.createElement(
                                "label"
                            );

                        label.className =
                            "admin-poll-game-option";


                        label.innerHTML = `

                            <input
                                type="checkbox"
                                value="${escapeHtmlAttribute(
                                    game.id
                                )}"
                                checked
                            >

                            <span>
                                ${escapeHtml(
                                    game.twitchName ||
                                    `Twitch #${game.twitchGameId}`
                                )}
                            </span>

                        `;


                        pollGamesList.appendChild(
                            label
                        );
                    }
                );
            }


            if (pollGameCount) {

                pollGameCount.textContent =
                    String(
                        eligibleGames.length
                    );
            }
        }


        /* =================================================
           DASHBOARD
        ================================================= */

        function updateDashboardStats() {

            if (statGames) {

                statGames.textContent =
                    String(
                        games.length
                    );
            }


            /*
             * La galerie sera connectée
             * plus tard.
             */

            if (statArtworks) {

                statArtworks.textContent =
                    "0";
            }


            /*
             * Le sondage sera connecté
             * à sa propre API plus tard.
             */

            if (statPoll) {

                statPoll.textContent =
                    "—";
            }


            if (statVotes) {

                statVotes.textContent =
                    "0";
            }
        }


        /* =================================================
           ÉVÉNEMENTS NAVIGATION
        ================================================= */

        navButtons.forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        openSection(
                            button.dataset
                                .adminSection
                        );
                    }
                );
            }
        );


        quickActions.forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        const section =
                            button.dataset
                                .openSection;


                        openSection(
                            section
                        );


                        if (
                            button.dataset
                                .adminAction ===
                            "new-game"
                        ) {

                            openNewGameForm();
                        }
                    }
                );
            }
        );


        /* =================================================
           ÉVÉNEMENTS JEU
        ================================================= */

        newGameButton
            ?.addEventListener(
                "click",
                openNewGameForm
            );


        cancelGameButton
            ?.addEventListener(
                "click",
                resetGameForm
            );


        twitchPreviewButton
            ?.addEventListener(
                "click",
                previewTwitchGame
            );


        twitchGameIdInput
            ?.addEventListener(
                "input",
                () => {

                    /*
                     * On n'efface l'aperçu que
                     * lors d'un nouvel ajout.
                     */
                    if (!currentEditingId) {

                        resetTwitchPreview();
                    }
                }
            );


        gameForm
            ?.addEventListener(
                "submit",
                saveGameFromForm
            );


        gamesSearch
            ?.addEventListener(
                "input",
                renderGames
            );


        /* =================================================
           DÉLÉGATION LISTE JEUX
        ================================================= */

        gamesList
            ?.addEventListener(
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


                    const editButton =
                        event.target.closest(
                            "[data-edit-game]"
                        );


                    if (editButton) {

                        const game =
                            games.find(
                                (item) =>
                                    item.id ===
                                    editButton.dataset
                                        .editGame
                            );


                        if (game) {

                            fillGameForm(
                                game
                            );
                        }


                        return;
                    }


                    const deleteButton =
                        event.target.closest(
                            "[data-delete-game]"
                        );


                    if (deleteButton) {

                        openDeleteModal(
                            deleteButton.dataset
                                .deleteGame
                        );
                    }
                }
            );


        /* =================================================
           MODAL
        ================================================= */

        confirmClose
            ?.addEventListener(
                "click",
                closeDeleteModal
            );


        confirmCancel
            ?.addEventListener(
                "click",
                closeDeleteModal
            );


        confirmDelete
            ?.addEventListener(
                "click",
                deletePendingGame
            );


        confirmModal
            ?.addEventListener(
                "click",
                (event) => {

                    if (
                        event.target ===
                        confirmModal
                    ) {

                        closeDeleteModal();
                    }
                }
            );


        /* =================================================
           TOUCHE ÉCHAP
        ================================================= */

        document.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key !==
                    "Escape"
                ) {
                    return;
                }


                if (
                    confirmModal &&
                    !confirmModal.hidden
                ) {

                    closeDeleteModal();
                }
            }
        );


        /* =================================================
           INITIALISATION
        ================================================= */

        const authenticatedAdmin =
            await checkAdminAuthentication();


        if (!authenticatedAdmin) {
            return;
        }


        applyAdminUser(
            authenticatedAdmin
        );


        createLogoutButton();


        /*
         * C'est maintenant Supabase,
         * via /api/admin/games,
         * qui fournit les jeux.
         */
        await loadGames();


        console.info(
            "[Admin] Interface initialisée pour :",
            authenticatedAdmin.login
        );
    }
);