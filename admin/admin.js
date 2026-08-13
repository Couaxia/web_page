"use strict";

/* =========================================================
   ADMINISTRATION — COUAXIA
========================================================= */

import {
    getGame
} from "../js/games.js";


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        /* =====================================================
           CONFIGURATION
        ====================================================== */

        const ADMIN_GAMES_API =
            "/api/admin/games";

        const ADMIN_GALLERY_API =
            "/api/admin/gallery";

        const ADMIN_GALLERY_UPLOAD_API =
            "/api/admin/gallery-upload";

        const MAX_ARTWORK_FILE_SIZE =
            10 * 1024 * 1024;

        const ALLOWED_ARTWORK_TYPES =
            new Set([
                "image/png",
                "image/jpeg",
                "image/webp",
                "image/gif"
            ]);


        /* =====================================================
           ÉLÉMENTS — ADMIN
        ====================================================== */

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


        /* =====================================================
           ÉLÉMENTS — NAVIGATION
        ====================================================== */

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


        /* =====================================================
           ÉLÉMENTS — DASHBOARD
        ====================================================== */

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


        /* =====================================================
           ÉLÉMENTS — JEUX
        ====================================================== */

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


        /* =====================================================
           ÉLÉMENTS — APERÇU TWITCH
        ====================================================== */

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


        /* =====================================================
           ÉLÉMENTS — LISTE JEUX
        ====================================================== */

        const gamesList =
            document.getElementById(
                "admin-games-list"
            );

        const gamesSearch =
            document.getElementById(
                "admin-games-search"
            );


        /* =====================================================
           ÉLÉMENTS — ARTWORKS
        ====================================================== */

        const artworkForm =
            document.getElementById(
                "admin-artwork-form"
            );

        const artworkFormPanel =
            document.getElementById(
                "admin-artwork-form-panel"
            );

        const artworkFormTitle =
            document.getElementById(
                "admin-artwork-form-title"
            );

        const artworkIdInput =
            document.getElementById(
                "admin-artwork-id"
            );

        const artworkArtIdInput =
            document.getElementById(
                "admin-artwork-art-id"
            );

        const artworkSortOrderInput =
            document.getElementById(
                "admin-artwork-sort-order"
            );

        const artworkArtistInput =
            document.getElementById(
                "admin-artwork-artist"
            );

        const artworkRoleInput =
            document.getElementById(
                "admin-artwork-role"
            );

        const artworkImageUrlInput =
            document.getElementById(
                "admin-artwork-image-url"
            );

        const artworkImageAltInput =
            document.getElementById(
                "admin-artwork-image-alt"
            );

        const artworkMediaTypeInput =
            document.getElementById(
                "admin-artwork-media-type"
            );

        const artworkTagsInput =
            document.getElementById(
                "admin-artwork-tags"
            );

        const artworkDescriptionInput =
            document.getElementById(
                "admin-artwork-description"
            );

        const artworkImageMessagesInput =
            document.getElementById(
                "admin-artwork-image-messages"
            );

        const artworkArtistUrlInput =
            document.getElementById(
                "admin-artwork-artist-url"
            );

        const artworkButtonTextInput =
            document.getElementById(
                "admin-artwork-button-text"
            );

        const artworkButtonMessagesInput =
            document.getElementById(
                "admin-artwork-button-messages"
            );

        const artworkSensitiveInput =
            document.getElementById(
                "admin-artwork-sensitive"
            );

        const artworkFavoriteInput =
            document.getElementById(
                "admin-artwork-favorite-enabled"
            );

        const artworkVisibleInput =
            document.getElementById(
                "admin-artwork-visible"
            );

        const artworkSubmitButton =
            document.getElementById(
                "admin-artwork-submit"
            );

        const artworkCancelButton =
            document.getElementById(
                "admin-artwork-cancel"
            );

        const newArtworkButton =
            document.getElementById(
                "admin-new-artwork"
            );


        /* =====================================================
           ÉLÉMENTS — UPLOAD ARTWORK
        ====================================================== */

        const artworkDropzone =
            document.getElementById(
                "admin-artwork-dropzone"
            );

        const artworkFileInput =
            document.getElementById(
                "admin-artwork-file"
            );

        const artworkUploadPreview =
            document.getElementById(
                "admin-artwork-upload-preview"
            );

        const artworkPreviewImage =
            document.getElementById(
                "admin-artwork-preview-image"
            );

        const artworkFileName =
            document.getElementById(
                "admin-artwork-file-name"
            );

        const artworkFileSize =
            document.getElementById(
                "admin-artwork-file-size"
            );

        const artworkRemoveImage =
            document.getElementById(
                "admin-artwork-remove-image"
            );


        /* =====================================================
           ÉLÉMENTS — LISTE ARTWORKS
        ====================================================== */

        const artworksList =
            document.getElementById(
                "admin-artworks-list"
            );

        const artworksSearch =
            document.getElementById(
                "admin-artworks-search"
            );

        const artworksFilter =
            document.getElementById(
                "admin-artworks-filter"
            );


        /* =====================================================
           ÉLÉMENTS — MODAL
        ====================================================== */

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


        /* =====================================================
           TOASTS
        ====================================================== */

        const toastContainer =
            document.getElementById(
                "admin-toast-container"
            );


        /* =====================================================
           SONDAGE
        ====================================================== */

        const pollGamesList =
            document.getElementById(
                "admin-poll-games-list"
            );

        const pollGameCount =
            document.getElementById(
                "admin-poll-game-count"
            );


        /* =====================================================
           ÉTAT
        ====================================================== */

        let games = [];

        let artworks = [];

        let currentEditingGameId =
            null;

        let currentEditingArtworkId =
            null;

        let currentTwitchPreview =
            null;

        let selectedArtworkFile =
            null;

        let artworkPreviewObjectUrl =
            null;

        let pendingDelete = {
            type: null,
            id: null
        };


        /* =====================================================
           OUTILS HTML
        ====================================================== */

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


        /* =====================================================
           NORMALISATION
        ====================================================== */

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
                            tag =>
                                tag
                                    .trim()
                                    .toLowerCase()
                        )
                        .filter(Boolean)
                )
            ];
        }


        function normalizeMessages(
            value
        ) {

            return [
                ...new Set(
                    String(
                        value || ""
                    )
                        .split("|")
                        .map(
                            message =>
                                message.trim()
                        )
                        .filter(Boolean)
                )
            ];
        }


        function formatFileSize(
            bytes
        ) {

            if (
                !Number.isFinite(bytes) ||
                bytes <= 0
            ) {
                return "0 octet";
            }


            if (
                bytes <
                1024
            ) {
                return `${bytes} octets`;
            }


            if (
                bytes <
                1024 * 1024
            ) {

                return (
                    `${(
                        bytes /
                        1024
                    ).toFixed(1)} Ko`
                );
            }


            return (
                `${(
                    bytes /
                    1024 /
                    1024
                ).toFixed(1)} Mo`
            );
        }


        /* =====================================================
           TOAST
        ====================================================== */

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


        /* =====================================================
           AUTHENTIFICATION
        ====================================================== */

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
                    response.status ===
                    401 ||
                    response.status ===
                    403
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

                    showAuthenticationError(
                        "Impossible de vérifier la session administrateur."
                    );

                    return null;
                }


                return data.user;

            } catch (error) {

                console.error(
                    "[Admin Auth]",
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
                        min-height:100vh;
                        display:flex;
                        justify-content:center;
                        align-items:center;
                        text-align:center;
                        padding:24px;
                    "
                >
                    <section>

                        <h1>
                            Administration indisponible
                        </h1>

                        <p>
                            ${escapeHtml(message)}
                        </p>

                        <a href="/api/admin/auth-login">
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
                    `Avatar Twitch de ${
                        user.displayName ||
                        user.login
                    }`;
            }
        }


        /* =====================================================
           DÉCONNEXION
        ====================================================== */

        function createLogoutButton() {

            const container =
                document.querySelector(
                    ".admin-header-actions"
                );


            if (
                !container ||
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

            button.addEventListener(
                "click",
                logoutAdmin
            );

            container.appendChild(
                button
            );
        }


        async function logoutAdmin() {

            try {

                await adminApiRequest(
                    "/api/admin/auth-logout",
                    {
                        method:
                            "POST"
                    }
                );

            } catch (error) {

                console.error(
                    error
                );
            }


            window.location.replace(
                "/api/admin/auth-login"
            );
        }


        /* =====================================================
           API
        ====================================================== */

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


        /* =====================================================
           NAVIGATION
        ====================================================== */

        function openSection(
            sectionName
        ) {

            navButtons.forEach(
                button => {

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
                section => {

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
                "gallery"
            ) {
                renderArtworks();
            }


            if (
                sectionName ===
                "poll"
            ) {
                renderPollGames();
            }
        }


        /* =====================================================
           JEUX — CHARGEMENT
        ====================================================== */

        async function loadGames() {

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

            } catch (error) {

                console.error(
                    "[Games]",
                    error
                );


                showToast(
                    error.message,
                    "error"
                );
            }
        }


        /* =====================================================
           TWITCH
        ====================================================== */

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

            currentTwitchPreview =
                game;


            if (twitchPreviewName) {

                twitchPreviewName.textContent =
                    game.name ||
                    "Jeu Twitch";
            }


            if (twitchPreviewId) {

                twitchPreviewId.textContent =
                    `ID Twitch : ${game.id}`;
            }


            if (
                twitchPreviewCover &&
                game.boxArtUrl
            ) {

                twitchPreviewCover.src =
                    game.boxArtUrl;
            }


            if (twitchResult) {
                twitchResult.hidden =
                    false;
            }
        }


        async function previewTwitchGame() {

            const id =
                String(
                    twitchGameIdInput
                        ?.value ||
                    ""
                ).trim();


            if (!id) {

                showToast(
                    "Entre un ID Twitch.",
                    "warning"
                );

                return;
            }


            try {

                twitchPreviewButton.disabled =
                    true;

                twitchPreviewButton.textContent =
                    "⏳ Vérification...";


                const game =
                    await getGame(
                        id
                    );


                if (
                    !game ||
                    game.found === false
                ) {

                    throw new Error(
                        "Jeu Twitch introuvable."
                    );
                }


                showTwitchPreview(
                    game
                );


                showToast(
                    `${game.name} trouvé.`,
                    "success"
                );

            } catch (error) {

                showToast(
                    error.message,
                    "error"
                );

            } finally {

                twitchPreviewButton.disabled =
                    false;

                twitchPreviewButton.textContent =
                    "🔎 Vérifier";
            }
        }


        /* =====================================================
           FORMULAIRE JEU
        ====================================================== */

        function resetGameForm() {

            currentEditingGameId =
                null;

            gameForm?.reset();

            resetTwitchPreview();


            if (gameIdInput) {
                gameIdInput.value =
                    "";
            }


            if (twitchGameIdInput) {
                twitchGameIdInput.disabled =
                    false;
            }


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
                        "smooth"
                });
        }


        function fillGameForm(
            game
        ) {

            currentEditingGameId =
                game.id;


            gameIdInput.value =
                game.id;

            twitchGameIdInput.value =
                game.twitchGameId ||
                "";

            twitchGameIdInput.disabled =
                true;

            statusInput.value =
                game.status ||
                "backlog";

            tagsInput.value =
                (game.tags || [])
                    .join(", ");

            descriptionInput.value =
                game.description ||
                "";

            ratingInput.value =
                game.rating ??
                "";

            youtubeInput.value =
                game.youtubePlaylist ||
                "";

            pollInput.checked =
                Boolean(
                    game.pollEnabled
                );


            gameFormTitle.textContent =
                "Modifier le jeu";

            submitGameButton.textContent =
                "💾 Enregistrer les modifications";


            showTwitchPreview({
                id:
                    game.twitchGameId,

                name:
                    game.twitchName,

                boxArtUrl:
                    game.boxArtUrl
            });


            gameFormPanel
                ?.scrollIntoView({
                    behavior:
                        "smooth"
                });
        }


        function buildGameFromForm() {

            return {

                id:
                    currentEditingGameId,

                twitchGameId:
                    String(
                        twitchGameIdInput
                            ?.value ||
                        ""
                    ).trim(),

                status:
                    statusInput?.value ||
                    "backlog",

                tags:
                    normalizeTags(
                        tagsInput?.value
                    ),

                description:
                    String(
                        descriptionInput
                            ?.value ||
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
                        youtubeInput
                            ?.value ||
                        ""
                    ).trim(),

                pollEnabled:
                    Boolean(
                        pollInput?.checked
                    )
            };
        }


        async function saveGameFromForm(
            event
        ) {

            event.preventDefault();


            const game =
                buildGameFromForm();


            if (!game.twitchGameId) {

                showToast(
                    "L'ID Twitch est obligatoire.",
                    "warning"
                );

                return;
            }


            const editing =
                Boolean(
                    currentEditingGameId
                );


            try {

                submitGameButton.disabled =
                    true;


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


                if (editing) {

                    const index =
                        games.findIndex(
                            item =>
                                item.id ===
                                data.game.id
                        );


                    if (index >= 0) {
                        games[index] =
                            data.game;
                    }

                } else {

                    games.unshift(
                        data.game
                    );
                }


                resetGameForm();

                renderGames();

                renderPollGames();

                updateDashboardStats();


                showToast(
                    editing
                        ? "Jeu modifié."
                        : "Jeu ajouté.",
                    "success"
                );

            } catch (error) {

                showToast(
                    error.message,
                    "error"
                );

            } finally {

                submitGameButton.disabled =
                    false;
            }
        }


        /* =====================================================
           AFFICHAGE JEUX
        ====================================================== */

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
                labels[status] ||
                status
            );
        }


        function createGameItem(
            game
        ) {

            const article =
                document.createElement(
                    "article"
                );

            article.className =
                "admin-game-item";


            article.innerHTML = `

                <div class="admin-game-item-cover">

                    ${
                        game.boxArtUrl
                            ? `
                                <img
                                    src="${escapeHtmlAttribute(
                                        game.boxArtUrl
                                    )}"
                                    alt=""
                                >
                            `
                            : "🎮"
                    }

                </div>

                <div class="admin-game-item-content">

                    <h3>
                        ${escapeHtml(
                            game.twitchName
                        )}
                    </h3>

                    <div class="admin-game-item-meta">

                        <span>
                            ${escapeHtml(
                                getStatusLabel(
                                    game.status
                                )
                            )}
                        </span>

                        ${
                            game.pollEnabled
                                ? "<span>🗳️ Sondage</span>"
                                : ""
                        }

                    </div>

                    <div class="admin-game-item-actions">

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


            const filtered =
                games.filter(
                    game =>
                        !search ||
                        [
                            game.twitchName,
                            game.status,
                            ...(game.tags || [])
                        ]
                            .join(" ")
                            .toLowerCase()
                            .includes(search)
                );


            gamesList.innerHTML =
                "";


            if (
                filtered.length ===
                0
            ) {

                gamesList.innerHTML = `
                    <p class="admin-empty-state">
                        Aucun jeu trouvé.
                    </p>
                `;

                return;
            }


            filtered.forEach(
                game =>
                    gamesList.appendChild(
                        createGameItem(
                            game
                        )
                    )
            );
        }


        /* =====================================================
           ARTWORKS — FORMAT API
        ====================================================== */

        function formatArtwork(
            artwork
        ) {

            return {

                id:
                    artwork.id,

                artId:
                    artwork.art_id,

                artist:
                    artwork.artist,

                artistRole:
                    artwork.artist_role,

                description:
                    artwork.description,

                imageUrl:
                    artwork.image_url,

                imageAlt:
                    artwork.image_alt,

                mediaType:
                    artwork.media_type,

                tags:
                    artwork.tags || [],

                imageMessages:
                    artwork.image_messages || [],

                artistUrl:
                    artwork.artist_url,

                buttonText:
                    artwork.button_text,

                buttonMessages:
                    artwork.button_messages || [],

                sensitive:
                    Boolean(
                        artwork.sensitive
                    ),

                favoriteEnabled:
                    Boolean(
                        artwork.favorite_enabled
                    ),

                visible:
                    Boolean(
                        artwork.visible
                    ),

                sortOrder:
                    Number(
                        artwork.sort_order ||
                        0
                    )
            };
        }


        /* =====================================================
           ARTWORKS — CHARGEMENT
        ====================================================== */

        async function loadArtworks() {

            try {

                const data =
                    await adminApiRequest(
                        ADMIN_GALLERY_API,
                        {
                            method:
                                "GET"
                        }
                    );


                artworks =
                    Array.isArray(
                        data?.artworks
                    )
                        ? data.artworks.map(
                            formatArtwork
                        )
                        : [];


                renderArtworks();

                updateDashboardStats();

            } catch (error) {

                console.error(
                    "[Artworks]",
                    error
                );


                showToast(
                    error.message,
                    "error"
                );
            }
        }


        /* =====================================================
           ARTWORK — APERÇU IMAGE
        ====================================================== */

        function revokeArtworkPreviewUrl() {

            if (
                artworkPreviewObjectUrl
            ) {

                URL.revokeObjectURL(
                    artworkPreviewObjectUrl
                );

                artworkPreviewObjectUrl =
                    null;
            }
        }


        function showArtworkPreview(
            {
                src,
                filename = "",
                size = null
            }
        ) {

            if (
                artworkPreviewImage
            ) {

                artworkPreviewImage.src =
                    src;

                artworkPreviewImage.alt =
                    "Aperçu de l'illustration";
            }


            if (
                artworkFileName
            ) {

                artworkFileName.textContent =
                    filename ||
                    "Illustration actuelle";
            }


            if (
                artworkFileSize
            ) {

                artworkFileSize.textContent =
                    size !== null
                        ? formatFileSize(
                            size
                        )
                        : "";
            }


            if (
                artworkUploadPreview
            ) {

                artworkUploadPreview.hidden =
                    false;
            }
        }


        function hideArtworkPreview() {

            revokeArtworkPreviewUrl();


            if (
                artworkPreviewImage
            ) {

                artworkPreviewImage.src =
                    "";
            }


            if (
                artworkUploadPreview
            ) {

                artworkUploadPreview.hidden =
                    true;
            }
        }


        /* =====================================================
           ARTWORK — FICHIER
        ====================================================== */

        function selectArtworkFile(
            file
        ) {

            if (!file) {
                return;
            }


            if (
                !ALLOWED_ARTWORK_TYPES
                    .has(
                        file.type
                    )
            ) {

                showToast(
                    "Format non autorisé. PNG, JPG, WEBP ou GIF uniquement.",
                    "error"
                );

                return;
            }


            if (
                file.size >
                MAX_ARTWORK_FILE_SIZE
            ) {

                showToast(
                    "L'image dépasse 10 Mo.",
                    "error"
                );

                return;
            }


            selectedArtworkFile =
                file;


            revokeArtworkPreviewUrl();


            artworkPreviewObjectUrl =
                URL.createObjectURL(
                    file
                );


            showArtworkPreview({
                src:
                    artworkPreviewObjectUrl,

                filename:
                    file.name,

                size:
                    file.size
            });


            if (
                artworkMediaTypeInput
            ) {

                artworkMediaTypeInput.value =
                    file.type ===
                    "image/gif"
                        ? "gif"
                        : "image";
            }
        }


        function removeSelectedArtworkImage() {

            selectedArtworkFile =
                null;


            if (
                artworkFileInput
            ) {

                artworkFileInput.value =
                    "";
            }


            if (
                artworkImageUrlInput
            ) {

                artworkImageUrlInput.value =
                    "";
            }


            hideArtworkPreview();
        }


        /* =====================================================
           FICHIER -> BASE64
        ====================================================== */

        function fileToBase64(
            file
        ) {

            return new Promise(
                (
                    resolve,
                    reject
                ) => {

                    const reader =
                        new FileReader();


                    reader.onload =
                        () => {

                            const result =
                                String(
                                    reader.result ||
                                    ""
                                );


                            const commaIndex =
                                result.indexOf(
                                    ","
                                );


                            resolve(
                                commaIndex >= 0
                                    ? result.slice(
                                        commaIndex + 1
                                    )
                                    : result
                            );
                        };


                    reader.onerror =
                        () => {

                            reject(
                                new Error(
                                    "Impossible de lire l'image."
                                )
                            );
                        };


                    reader.readAsDataURL(
                        file
                    );
                }
            );
        }


        /* =====================================================
           UPLOAD ARTWORK
        ====================================================== */

        async function uploadArtworkFile(
            file,
            artId
        ) {

            const fileBase64 =
                await fileToBase64(
                    file
                );


            const data =
                await adminApiRequest(
                    ADMIN_GALLERY_UPLOAD_API,
                    {
                        method:
                            "POST",

                        body: {
                            artId,

                            filename:
                                file.name,

                            mimeType:
                                file.type,

                            fileBase64
                        }
                    }
                );


            if (
                !data?.file?.url
            ) {

                throw new Error(
                    "L'URL de l'image n'a pas été retournée."
                );
            }


            return data.file;
        }


        /* =====================================================
           FORMULAIRE ARTWORK
        ====================================================== */

        function resetArtworkForm() {

            currentEditingArtworkId =
                null;

            selectedArtworkFile =
                null;

            artworkForm?.reset();


            if (
                artworkIdInput
            ) {
                artworkIdInput.value =
                    "";
            }


            if (
                artworkImageUrlInput
            ) {
                artworkImageUrlInput.value =
                    "";
            }


            if (
                artworkSortOrderInput
            ) {
                artworkSortOrderInput.value =
                    "0";
            }


            if (
                artworkButtonTextInput
            ) {
                artworkButtonTextInput.value =
                    "Voir son profil";
            }


            if (
                artworkFavoriteInput
            ) {
                artworkFavoriteInput.checked =
                    true;
            }


            if (
                artworkVisibleInput
            ) {
                artworkVisibleInput.checked =
                    true;
            }


            if (
                artworkMediaTypeInput
            ) {
                artworkMediaTypeInput.value =
                    "image";
            }


            hideArtworkPreview();


            if (
                artworkFormTitle
            ) {

                artworkFormTitle.textContent =
                    "Ajouter une illustration";
            }


            if (
                artworkSubmitButton
            ) {

                artworkSubmitButton.textContent =
                    "💾 Enregistrer l'œuvre";
            }
        }


        function openNewArtworkForm() {

            openSection(
                "gallery"
            );

            resetArtworkForm();


            artworkFormPanel
                ?.scrollIntoView({
                    behavior:
                        "smooth"
                });


            artworkArtIdInput
                ?.focus();
        }


        function fillArtworkForm(
            artwork
        ) {

            currentEditingArtworkId =
                artwork.id;

            selectedArtworkFile =
                null;


            artworkIdInput.value =
                artwork.id;

            artworkArtIdInput.value =
                artwork.artId ||
                "";

            artworkSortOrderInput.value =
                artwork.sortOrder ??
                0;

            artworkArtistInput.value =
                artwork.artist ||
                "";

            artworkRoleInput.value =
                artwork.artistRole ||
                "";

            artworkImageUrlInput.value =
                artwork.imageUrl ||
                "";

            artworkImageAltInput.value =
                artwork.imageAlt ||
                "";

            artworkMediaTypeInput.value =
                artwork.mediaType ||
                "image";

            artworkTagsInput.value =
                (artwork.tags || [])
                    .join(", ");

            artworkDescriptionInput.value =
                artwork.description ||
                "";

            artworkImageMessagesInput.value =
                (
                    artwork.imageMessages ||
                    []
                ).join("|");

            artworkArtistUrlInput.value =
                artwork.artistUrl ||
                "";

            artworkButtonTextInput.value =
                artwork.buttonText ||
                "Voir son profil";

            artworkButtonMessagesInput.value =
                (
                    artwork.buttonMessages ||
                    []
                ).join("|");

            artworkSensitiveInput.checked =
                artwork.sensitive;

            artworkFavoriteInput.checked =
                artwork.favoriteEnabled;

            artworkVisibleInput.checked =
                artwork.visible;


            if (
                artwork.imageUrl
            ) {

                showArtworkPreview({
                    src:
                        artwork.imageUrl,

                    filename:
                        "Image actuelle"
                });
            }


            artworkFormTitle.textContent =
                "Modifier l'illustration";

            artworkSubmitButton.textContent =
                "💾 Enregistrer les modifications";


            artworkFormPanel
                ?.scrollIntoView({
                    behavior:
                        "smooth"
                });
        }


        function buildArtworkFromForm(
            imageUrl
        ) {

            return {

                id:
                    currentEditingArtworkId,

                artId:
                    String(
                        artworkArtIdInput
                            ?.value ||
                        ""
                    ).trim(),

                artist:
                    String(
                        artworkArtistInput
                            ?.value ||
                        ""
                    ).trim(),

                artistRole:
                    String(
                        artworkRoleInput
                            ?.value ||
                        ""
                    ).trim(),

                description:
                    String(
                        artworkDescriptionInput
                            ?.value ||
                        ""
                    ).trim(),

                imageUrl,

                imageAlt:
                    String(
                        artworkImageAltInput
                            ?.value ||
                        ""
                    ).trim(),

                mediaType:
                    artworkMediaTypeInput
                        ?.value ||
                    "image",

                tags:
                    normalizeTags(
                        artworkTagsInput
                            ?.value
                    ),

                imageMessages:
                    normalizeMessages(
                        artworkImageMessagesInput
                            ?.value
                    ),

                artistUrl:
                    String(
                        artworkArtistUrlInput
                            ?.value ||
                        ""
                    ).trim(),

                buttonText:
                    String(
                        artworkButtonTextInput
                            ?.value ||
                        "Voir son profil"
                    ).trim(),

                buttonMessages:
                    normalizeMessages(
                        artworkButtonMessagesInput
                            ?.value
                    ),

                sensitive:
                    Boolean(
                        artworkSensitiveInput
                            ?.checked
                    ),

                favoriteEnabled:
                    Boolean(
                        artworkFavoriteInput
                            ?.checked
                    ),

                visible:
                    Boolean(
                        artworkVisibleInput
                            ?.checked
                    ),

                sortOrder:
                    Number(
                        artworkSortOrderInput
                            ?.value ||
                        0
                    )
            };
        }


        /* =====================================================
           ENREGISTRER ARTWORK
        ====================================================== */

        async function saveArtworkFromForm(
            event
        ) {

            event.preventDefault();


            const artId =
                String(
                    artworkArtIdInput
                        ?.value ||
                    ""
                ).trim();


            const artist =
                String(
                    artworkArtistInput
                        ?.value ||
                    ""
                ).trim();


            if (!artId) {

                showToast(
                    "L'ID de l'œuvre est obligatoire.",
                    "warning"
                );

                return;
            }


            if (!artist) {

                showToast(
                    "Le nom de l'artiste est obligatoire.",
                    "warning"
                );

                return;
            }


            const editing =
                Boolean(
                    currentEditingArtworkId
                );


            let imageUrl =
                String(
                    artworkImageUrlInput
                        ?.value ||
                    ""
                ).trim();


            if (
                !selectedArtworkFile &&
                !imageUrl
            ) {

                showToast(
                    "Ajoute une image.",
                    "warning"
                );

                return;
            }


            try {

                artworkSubmitButton.disabled =
                    true;

                artworkSubmitButton.textContent =
                    selectedArtworkFile
                        ? "⏳ Upload de l'image..."
                        : "⏳ Enregistrement...";


                /* =============================================
                   UPLOAD IMAGE
                ============================================== */

                if (
                    selectedArtworkFile
                ) {

                    const uploaded =
                        await uploadArtworkFile(
                            selectedArtworkFile,
                            artId
                        );


                    imageUrl =
                        uploaded.url;


                    artworkImageUrlInput.value =
                        imageUrl;


                    artworkSubmitButton.textContent =
                        "⏳ Enregistrement...";
                }


                /* =============================================
                   DONNÉES
                ============================================== */

                const artwork =
                    buildArtworkFromForm(
                        imageUrl
                    );


                const data =
                    await adminApiRequest(
                        ADMIN_GALLERY_API,
                        {
                            method:
                                editing
                                    ? "PUT"
                                    : "POST",

                            body:
                                artwork
                        }
                    );


                if (
                    !data?.artwork
                ) {

                    throw new Error(
                        "L'œuvre enregistrée n'a pas été retournée."
                    );
                }


                const savedArtwork =
                    formatArtwork(
                        data.artwork
                    );


                if (editing) {

                    const index =
                        artworks.findIndex(
                            item =>
                                item.id ===
                                savedArtwork.id
                        );


                    if (
                        index >= 0
                    ) {

                        artworks[index] =
                            savedArtwork;

                    } else {

                        artworks.push(
                            savedArtwork
                        );
                    }

                } else {

                    artworks.push(
                        savedArtwork
                    );
                }


                artworks.sort(
                    (
                        a,
                        b
                    ) =>
                        a.sortOrder -
                        b.sortOrder
                );


                renderArtworks();

                updateDashboardStats();

                resetArtworkForm();


                showToast(
                    editing
                        ? "Illustration modifiée."
                        : "Illustration ajoutée.",
                    "success"
                );

            } catch (error) {

                console.error(
                    "[Artwork Save]",
                    error
                );


                showToast(
                    error.message ||
                    "Impossible d'enregistrer l'œuvre.",
                    "error"
                );

            } finally {

                artworkSubmitButton.disabled =
                    false;


                artworkSubmitButton.textContent =
                    currentEditingArtworkId
                        ? "💾 Enregistrer les modifications"
                        : "💾 Enregistrer l'œuvre";
            }
        }


        /* =====================================================
           CARTE ARTWORK ADMIN
        ====================================================== */

        function createArtworkItem(
            artwork
        ) {

            const article =
                document.createElement(
                    "article"
                );

            article.className =
                "admin-artwork-item";


            const tags =
                Array.isArray(
                    artwork.tags
                )
                    ? artwork.tags
                    : [];


            article.innerHTML = `

                <div class="admin-artwork-item-image">

                    <img
                        src="${escapeHtmlAttribute(
                            artwork.imageUrl
                        )}"
                        alt="${escapeHtmlAttribute(
                            artwork.imageAlt ||
                            artwork.artist
                        )}"
                        loading="lazy"
                        draggable="false"
                    >

                    ${
                        artwork.sensitive
                            ? `
                                <span
                                    class="admin-artwork-badge is-sensitive"
                                >
                                    🔞 +18
                                </span>
                            `
                            : ""
                    }

                    ${
                        !artwork.visible
                            ? `
                                <span
                                    class="admin-artwork-badge is-hidden"
                                >
                                    🚫 Masquée
                                </span>
                            `
                            : ""
                    }

                </div>


                <div class="admin-artwork-item-content">

                    <div class="admin-artwork-item-heading">

                        <div>

                            <span class="admin-artwork-id">
                                #${escapeHtml(
                                    artwork.artId
                                )}
                            </span>

                            <h3>
                                ${escapeHtml(
                                    artwork.artist
                                )}
                            </h3>

                        </div>

                    </div>


                    ${
                        artwork.artistRole
                            ? `
                                <p class="artist-role">
                                    ${escapeHtml(
                                        artwork.artistRole
                                    )}
                                </p>
                            `
                            : ""
                    }


                    ${
                        artwork.description
                            ? `
                                <p class="admin-artwork-description">
                                    ${escapeHtml(
                                        artwork.description
                                    )}
                                </p>
                            `
                            : ""
                    }


                    ${
                        tags.length
                            ? `
                                <div class="admin-game-item-meta">

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
                            `
                            : ""
                    }


                    <div class="admin-game-item-meta">

                        ${
                            artwork.favoriteEnabled
                                ? "<span>❤️ Favoris</span>"
                                : ""
                        }

                        ${
                            artwork.visible
                                ? "<span>👁️ Visible</span>"
                                : "<span>🚫 Masquée</span>"
                        }

                        <span>
                            ↕️ ${escapeHtml(
                                artwork.sortOrder
                            )}
                        </span>

                    </div>


                    <div class="admin-game-item-actions">

                        <button
                            type="button"
                            class="admin-secondary-button"
                            data-edit-artwork="${escapeHtmlAttribute(
                                artwork.id
                            )}"
                        >
                            ✏️ Modifier
                        </button>

                        <button
                            type="button"
                            class="admin-danger-button"
                            data-delete-artwork="${escapeHtmlAttribute(
                                artwork.id
                            )}"
                        >
                            🗑️ Supprimer
                        </button>

                    </div>

                </div>
            `;


            return article;
        }


        /* =====================================================
           AFFICHAGE ARTWORKS
        ====================================================== */

        function renderArtworks() {

            if (!artworksList) {
                return;
            }


            const search =
                String(
                    artworksSearch
                        ?.value ||
                    ""
                )
                    .trim()
                    .toLowerCase();


            const filter =
                artworksFilter
                    ?.value ||
                "all";


            let filtered =
                [...artworks];


            if (search) {

                filtered =
                    filtered.filter(
                        artwork => {

                            const searchable =
                                [
                                    artwork.artId,
                                    artwork.artist,
                                    artwork.artistRole,
                                    artwork.description,
                                    ...(artwork.tags || [])
                                ]
                                    .join(" ")
                                    .toLowerCase();


                            return searchable
                                .includes(
                                    search
                                );
                        }
                    );
            }


            switch (filter) {

                case "visible":

                    filtered =
                        filtered.filter(
                            artwork =>
                                artwork.visible
                        );

                    break;


                case "hidden":

                    filtered =
                        filtered.filter(
                            artwork =>
                                !artwork.visible
                        );

                    break;


                case "sensitive":

                    filtered =
                        filtered.filter(
                            artwork =>
                                artwork.sensitive
                        );

                    break;


                case "favorites":

                    filtered =
                        filtered.filter(
                            artwork =>
                                artwork.favoriteEnabled
                        );

                    break;
            }


            filtered.sort(
                (
                    a,
                    b
                ) =>
                    a.sortOrder -
                    b.sortOrder
            );


            artworksList.innerHTML =
                "";


            if (
                filtered.length ===
                0
            ) {

                artworksList.innerHTML = `
                    <p class="admin-empty-state">
                        Aucune illustration trouvée.
                    </p>
                `;

                return;
            }


            filtered.forEach(
                artwork => {

                    artworksList.appendChild(
                        createArtworkItem(
                            artwork
                        )
                    );
                }
            );
        }


        /* =====================================================
           MODAL SUPPRESSION
        ====================================================== */

        function openGameDeleteModal(
            id
        ) {

            const game =
                games.find(
                    item =>
                        item.id ===
                        id
                );


            if (!game) {
                return;
            }


            pendingDelete = {
                type:
                    "game",

                id
            };


            confirmMessage.textContent =
                `Veux-tu vraiment supprimer ${
                    game.twitchName
                } ?`;


            confirmModal.hidden =
                false;
        }


        function openArtworkDeleteModal(
            id
        ) {

            const artwork =
                artworks.find(
                    item =>
                        item.id ===
                        id
                );


            if (!artwork) {
                return;
            }


            pendingDelete = {
                type:
                    "artwork",

                id
            };


            confirmMessage.textContent =
                `Veux-tu vraiment supprimer l'œuvre #${
                    artwork.artId
                } de ${
                    artwork.artist
                } ? L'image sera également supprimée du Storage.`;


            confirmModal.hidden =
                false;
        }


        function closeDeleteModal() {

            pendingDelete = {
                type:
                    null,

                id:
                    null
            };


            confirmModal.hidden =
                true;
        }


        async function confirmPendingDelete() {

            if (
                !pendingDelete.type ||
                !pendingDelete.id
            ) {
                return;
            }


            const {
                type,
                id
            } =
                pendingDelete;


            try {

                confirmDelete.disabled =
                    true;

                confirmDelete.textContent =
                    "⏳ Suppression...";


                if (
                    type ===
                    "game"
                ) {

                    await adminApiRequest(
                        ADMIN_GAMES_API,
                        {
                            method:
                                "DELETE",

                            body: {
                                id
                            }
                        }
                    );


                    games =
                        games.filter(
                            game =>
                                game.id !==
                                id
                        );


                    if (
                        currentEditingGameId ===
                        id
                    ) {

                        resetGameForm();
                    }


                    renderGames();

                    renderPollGames();

                } else if (
                    type ===
                    "artwork"
                ) {

                    await adminApiRequest(
                        ADMIN_GALLERY_API,
                        {
                            method:
                                "DELETE",

                            body: {
                                id
                            }
                        }
                    );


                    artworks =
                        artworks.filter(
                            artwork =>
                                artwork.id !==
                                id
                        );


                    if (
                        currentEditingArtworkId ===
                        id
                    ) {

                        resetArtworkForm();
                    }


                    renderArtworks();
                }


                updateDashboardStats();

                closeDeleteModal();


                showToast(
                    type === "game"
                        ? "Jeu supprimé."
                        : "Illustration supprimée.",
                    "success"
                );

            } catch (error) {

                showToast(
                    error.message,
                    "error"
                );

            } finally {

                confirmDelete.disabled =
                    false;

                confirmDelete.textContent =
                    "🗑️ Supprimer";
            }
        }


        /* =====================================================
           SONDAGE
        ====================================================== */

        function renderPollGames() {

            if (!pollGamesList) {
                return;
            }


            const eligibleGames =
                games.filter(
                    game =>
                        game.pollEnabled
                );


            pollGamesList.innerHTML =
                "";


            if (
                eligibleGames.length ===
                0
            ) {

                pollGamesList.innerHTML = `
                    <p class="admin-empty-state">
                        Aucun jeu éligible au sondage.
                    </p>
                `;

            } else {

                eligibleGames.forEach(
                    game => {

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
                                    game.twitchName
                                )}
                            </span>
                        `;


                        pollGamesList
                            .appendChild(
                                label
                            );
                    }
                );
            }


            if (
                pollGameCount
            ) {

                pollGameCount.textContent =
                    String(
                        eligibleGames.length
                    );
            }
        }


        /* =====================================================
           DASHBOARD
        ====================================================== */

        function updateDashboardStats() {

            if (statGames) {

                statGames.textContent =
                    String(
                        games.length
                    );
            }


            if (statArtworks) {

                statArtworks.textContent =
                    String(
                        artworks.length
                    );
            }


            if (statPoll) {

                statPoll.textContent =
                    "—";
            }


            if (statVotes) {

                statVotes.textContent =
                    "0";
            }
        }


        /* =====================================================
           DRAG & DROP
        ====================================================== */

        artworkDropzone
            ?.addEventListener(
                "click",
                () => {

                    artworkFileInput
                        ?.click();
                }
            );


        artworkDropzone
            ?.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key ===
                        "Enter" ||
                        event.key ===
                        " "
                    ) {

                        event.preventDefault();

                        artworkFileInput
                            ?.click();
                    }
                }
            );


        artworkFileInput
            ?.addEventListener(
                "change",
                () => {

                    const file =
                        artworkFileInput
                            .files?.[0];


                    if (file) {

                        selectArtworkFile(
                            file
                        );
                    }
                }
            );


        [
            "dragenter",
            "dragover"
        ].forEach(
            eventName => {

                artworkDropzone
                    ?.addEventListener(
                        eventName,
                        event => {

                            event.preventDefault();

                            artworkDropzone
                                .classList
                                .add(
                                    "is-dragging"
                                );
                        }
                    );
            }
        );


        [
            "dragleave",
            "drop"
        ].forEach(
            eventName => {

                artworkDropzone
                    ?.addEventListener(
                        eventName,
                        event => {

                            event.preventDefault();

                            artworkDropzone
                                .classList
                                .remove(
                                    "is-dragging"
                                );
                        }
                    );
            }
        );


        artworkDropzone
            ?.addEventListener(
                "drop",
                event => {

                    const file =
                        event.dataTransfer
                            ?.files?.[0];


                    if (file) {

                        selectArtworkFile(
                            file
                        );
                    }
                }
            );


        artworkRemoveImage
            ?.addEventListener(
                "click",
                removeSelectedArtworkImage
            );


        /* =====================================================
           NAVIGATION — ÉVÉNEMENTS
        ====================================================== */

        navButtons.forEach(
            button => {

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
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const section =
                            button.dataset
                                .openSection;


                        if (
                            button.dataset
                                .adminAction ===
                            "new-game"
                        ) {

                            openNewGameForm();

                            return;
                        }


                        if (
                            button.dataset
                                .adminAction ===
                            "new-artwork"
                        ) {

                            openNewArtworkForm();

                            return;
                        }


                        openSection(
                            section
                        );
                    }
                );
            }
        );


        /* =====================================================
           JEUX — ÉVÉNEMENTS
        ====================================================== */

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


        gamesList
            ?.addEventListener(
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


                    const editButton =
                        event.target.closest(
                            "[data-edit-game]"
                        );


                    if (editButton) {

                        const game =
                            games.find(
                                item =>
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

                        openGameDeleteModal(
                            deleteButton.dataset
                                .deleteGame
                        );
                    }
                }
            );


        /* =====================================================
           ARTWORKS — ÉVÉNEMENTS
        ====================================================== */

        newArtworkButton
            ?.addEventListener(
                "click",
                openNewArtworkForm
            );


        artworkCancelButton
            ?.addEventListener(
                "click",
                resetArtworkForm
            );


        artworkForm
            ?.addEventListener(
                "submit",
                saveArtworkFromForm
            );


        artworksSearch
            ?.addEventListener(
                "input",
                renderArtworks
            );


        artworksFilter
            ?.addEventListener(
                "change",
                renderArtworks
            );


        artworksList
            ?.addEventListener(
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


                    const editButton =
                        event.target.closest(
                            "[data-edit-artwork]"
                        );


                    if (editButton) {

                        const artwork =
                            artworks.find(
                                item =>
                                    item.id ===
                                    editButton.dataset
                                        .editArtwork
                            );


                        if (artwork) {

                            fillArtworkForm(
                                artwork
                            );
                        }


                        return;
                    }


                    const deleteButton =
                        event.target.closest(
                            "[data-delete-artwork]"
                        );


                    if (deleteButton) {

                        openArtworkDeleteModal(
                            deleteButton.dataset
                                .deleteArtwork
                        );
                    }
                }
            );


        /* =====================================================
           MODAL
        ====================================================== */

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
                confirmPendingDelete
            );


        confirmModal
            ?.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        confirmModal
                    ) {

                        closeDeleteModal();
                    }
                }
            );


        /* =====================================================
           ESCAPE
        ====================================================== */

        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Escape" &&
                    confirmModal &&
                    !confirmModal.hidden
                ) {

                    closeDeleteModal();
                }
            }
        );


        /* =====================================================
           INITIALISATION
        ====================================================== */

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
         * Les deux bases sont chargées
         * en parallèle.
         */

        await Promise.all([
            loadGames(),
            loadArtworks()
        ]);


        updateDashboardStats();


        console.info(
            "[Admin] Interface initialisée pour :",
            authenticatedAdmin.login
        );
    }
);