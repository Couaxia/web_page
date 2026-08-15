"use strict";

/* =========================================================
   ADMINISTRATION — COUAXIA
========================================================= */

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

        const ADMIN_POLL_API =
            "/api/admin/poll";

        const TWITCH_GAME_API =
            "/api/game";

        const MAX_ARTWORK_FILE_SIZE =
            50 * 1024 * 1024;

        const ALLOWED_ARTWORK_TYPES =
            new Set([
                "image/png",
                "image/jpeg",
                "image/webp",
                "image/gif",
                "video/mp4",
                "video/webm"
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
           NAVIGATION
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
           DASHBOARD
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
           JEUX — FORMULAIRE
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

        const gameNameInput =
            document.getElementById(
                "admin-game-name"
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
           JEUX — APERÇU TWITCH
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
           JEUX — LISTE
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
           ARTWORKS — FORMULAIRE
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
           ARTWORKS — UPLOAD
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

        const artworkPreviewVideo =
            document.getElementById(
                "admin-artwork-preview-video"
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
           ARTWORKS — LISTE
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
           SONDAGE
        ====================================================== */

        const pollForm =
            document.getElementById(
                "admin-poll-form"
            );

        const pollQuestionInput =
            document.getElementById(
                "admin-poll-question"
            );

        const pollStatusInput =
            document.getElementById(
                "admin-poll-status"
            );

        const pollOptionsList =
            document.getElementById(
                "admin-poll-options-list"
            );

        /*
         * Ancien bouton d'ajout manuel d'option.
         *
         * Il n'est plus utilisé : les options sont
         * générées automatiquement depuis les jeux
         * avec pollEnabled = true.
         */
        const pollAddOptionButton =
            document.getElementById(
                "admin-poll-add-option"
            );

        const pollResetButton =
            document.getElementById(
                "admin-poll-reset"
            );

        const pollPreview =
            document.getElementById(
                "admin-poll-preview"
            );

        const pollPreviewQuestion =
            document.getElementById(
                "admin-poll-preview-question"
            );

        const pollPreviewOptions =
            document.getElementById(
                "admin-poll-preview-options"
            );


        /* =====================================================
           TOASTS
        ====================================================== */

        const toastContainer =
            document.getElementById(
                "admin-toast-container"
            );


        /* =====================================================
           ÉTAT LOCAL
        ====================================================== */

        let games =
            [];

        let artworks =
            [];

        let poll =
            null;

        let currentAdminUser =
            null;

        let selectedArtworkFile =
            null;

        let artworkPreviewObjectUrl =
            null;


        /* =====================================================
           OUTILS
        ====================================================== */

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


        function normalizeText(
            value
        ) {

            return String(
                value ?? ""
            ).trim();
        }


        function normalizeBoolean(
            value
        ) {

            return (
                value ===
                    true ||
                value ===
                    "true" ||
                value ===
                    1 ||
                value ===
                    "1"
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

                return [
                    ...new Set(
                        value
                            .map(
                                tag =>
                                    String(
                                        tag
                                    )
                                        .trim()
                                        .toLowerCase()
                            )
                            .filter(
                                Boolean
                            )
                    )
                ];
            }


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
                        .filter(
                            Boolean
                        )
                )
            ];
        }


        function normalizeMessages(
            value
        ) {

            if (
                Array.isArray(
                    value
                )
            ) {

                return value
                    .map(
                        message =>
                            String(
                                message
                            )
                                .trim()
                    )
                    .filter(
                        Boolean
                    );
            }


            return String(
                value || ""
            )
                .split("|")
                .map(
                    message =>
                        message.trim()
                )
                .filter(
                    Boolean
                );
        }


        function formatFileSize(
            bytes
        ) {

            if (
                !Number.isFinite(
                    bytes
                ) ||
                bytes <=
                    0
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
                1024 *
                    1024
            ) {

                return `${
                    (
                        bytes /
                        1024
                    ).toFixed(
                        1
                    )
                } Ko`;
            }


            return `${
                (
                    bytes /
                    1024 /
                    1024
                ).toFixed(
                    1
                )
            } Mo`;
        }


        /* =====================================================
           TOAST
        ====================================================== */

        function showToast(
            message,
            type =
                "success"
        ) {

            if (
                !toastContainer
            ) {

                console.log(
                    `[${type}]`,
                    message
                );

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

                    throw new Error(
                        "Impossible de vérifier la session administrateur."
                    );
                }


                return data.user;

            } catch (
                error
            ) {

                console.error(
                    "[Admin Auth]",
                    error
                );


                document.body.innerHTML = `
                    <main
                        style="
                            min-height:100vh;
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            padding:30px;
                            text-align:center;
                        "
                    >
                        <section>

                            <h1>
                                Administration indisponible
                            </h1>

                            <p>
                                ${escapeHtml(
                                    error.message
                                )}
                            </p>

                            <a
                                href="/api/admin/auth-login"
                            >
                                Se reconnecter avec Twitch
                            </a>

                        </section>
                    </main>
                `;


                return null;
            }
        }


        function applyAdminUser(
            user
        ) {

            if (
                adminUserName
            ) {

                adminUserName.textContent =
                    user.displayName ||
                    user.login ||
                    "Couaxia";
            }


            if (
                adminUserRole
            ) {

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
           API ADMIN
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
                response.status ===
                    401 ||
                response.status ===
                    403
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


            if (
                !response.ok
            ) {

                throw new Error(
                    data?.error ||
                    `Erreur HTTP ${response.status}`
                );
            }


            return data;
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
                "admin-logout-button";

            button.textContent =
                "🚪 Déconnexion";


            button.addEventListener(
                "click",
                async () => {

                    button.disabled =
                        true;


                    try {

                        await fetch(
                            "/api/admin/auth-logout",
                            {
                                method:
                                    "POST",

                                credentials:
                                    "same-origin",

                                cache:
                                    "no-store"
                            }
                        );


                        window.location.replace(
                            "../accueil.html"
                        );

                    } catch (
                        error
                    ) {

                        console.error(
                            "[Admin Logout]",
                            error
                        );


                        showToast(
                            "Impossible de se déconnecter.",
                            "error"
                        );


                        button.disabled =
                            false;
                    }
                }
            );


            container.appendChild(
                button
            );
        }


        /* =====================================================
           NAVIGATION ADMIN
        ====================================================== */

        function openSection(
            sectionName
        ) {

            const normalizedSection =
                normalizeText(
                    sectionName
                ) ||
                "dashboard";


            navButtons.forEach(
                button => {

                    const isActive =
                        button.dataset
                            .adminSection ===
                        normalizedSection;


                    button.classList.toggle(
                        "is-active",
                        isActive
                    );


                    if (
                        isActive
                    ) {

                        button.setAttribute(
                            "aria-current",
                            "page"
                        );

                    } else {

                        button.removeAttribute(
                            "aria-current"
                        );
                    }
                }
            );


            sections.forEach(
                section => {

                    const isActive =
                        section.dataset
                            .adminPanel ===
                        normalizedSection;


                    section.classList.toggle(
                        "is-active",
                        isActive
                    );


                    section.hidden =
                        !isActive;
                }
            );


            try {

                window.history
                    .replaceState(
                        null,
                        "",
                        `#${normalizedSection}`
                    );

            } catch {

                /* Rien à faire */
            }
        }


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

                        openSection(
                            button.dataset
                                .openSection
                        );
                    }
                );
            }
        );


        /* =====================================================
           DASHBOARD — STATISTIQUES
        ====================================================== */

        function updateDashboardStats() {

            if (
                statGames
            ) {

                statGames.textContent =
                    String(
                        games.length
                    );
            }


            if (
                statArtworks
            ) {

                statArtworks.textContent =
                    String(
                        artworks.length
                    );
            }


            if (
                statPoll
            ) {

                statPoll.textContent =
                    poll?.status ===
                        "open"
                        ? "Ouvert"
                        : "Fermé";
            }


            if (
                statVotes
            ) {

                const totalVotes =
                    Number(
                        poll?.totalVotes
                    ) ||
                    (
                        Array.isArray(
                            poll?.options
                        )
                            ? poll.options.reduce(
                                (
                                    total,
                                    option
                                ) =>
                                    total +
                                    Number(
                                        option?.votes ||
                                        0
                                    ),
                                0
                            )
                            : 0
                    );


                statVotes.textContent =
                    String(
                        totalVotes
                    );
            }
        }


        /* =====================================================
           JEUX — NORMALISATION
        ====================================================== */

        function normalizeGame(
            game
        ) {

            return {

                id:
                    normalizeText(
                        game?.id
                    ),

                twitchGameId:
                    normalizeText(
                        game?.twitchGameId ??
                        game?.twitch_game_id
                    ),

                name:
                    normalizeText(
                        game?.name ??
                        game?.twitchName ??
                        game?.twitch_name
                    ),

                boxArtUrl:
                    normalizeText(
                        game?.boxArtUrl ??
                        game?.box_art_url
                    ),

                status:
                    normalizeText(
                        game?.status
                    ) ||
                    "backlog",

                tags:
                    normalizeTags(
                        game?.tags
                    ),

                description:
                    normalizeText(
                        game?.description
                    ),

                rating:
                    Number(
                        game?.rating ||
                        0
                    ),

                youtubePlaylist:
                    normalizeText(
                        game?.youtubePlaylist ??
                        game?.youtube_playlist
                    ),

                pollEnabled:
                    normalizeBoolean(
                        game?.pollEnabled ??
                        game?.poll_enabled
                    ),

                createdAt:
                    game?.createdAt ??
                    game?.created_at ??
                    null,

                updatedAt:
                    game?.updatedAt ??
                    game?.updated_at ??
                    null
            };
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
                        ? data.games.map(
                            normalizeGame
                        )
                        : [];


                renderGames();

                updateDashboardStats();

            } catch (
                error
            ) {

                console.error(
                    "[Admin Games]",
                    error
                );


                games =
                    [];


                renderGames();

                updateDashboardStats();


                showToast(
                    error.message ||
                    "Impossible de charger les jeux.",
                    "error"
                );
            }
        }


        /* =====================================================
           JEUX — STATUT
        ====================================================== */

        function getGameStatusLabel(
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
                "—"
            );
        }


        /* =====================================================
           JEUX — AFFICHAGE
        ====================================================== */

        function renderGames() {

            if (
                !gamesList
            ) {

                return;
            }


            const query =
                normalizeText(
                    gamesSearch?.value
                )
                    .toLowerCase();


            const filteredGames =
                games.filter(
                    game => {

                        if (
                            !query
                        ) {

                            return true;
                        }


                        const haystack =
                            [
                                game.name,
                                game.twitchGameId,
                                game.status,
                                game.description,
                                ...game.tags
                            ]
                                .join(
                                    " "
                                )
                                .toLowerCase();


                        return haystack.includes(
                            query
                        );
                    }
                );


            if (
                filteredGames.length ===
                    0
            ) {

                gamesList.innerHTML = `
                    <div class="admin-empty-state">

                        <span
                            class="admin-empty-icon"
                            aria-hidden="true"
                        >
                            🎮
                        </span>

                        <h3>
                            Aucun jeu
                        </h3>

                        <p>
                            Ajoute ton premier jeu depuis
                            l'administration.
                        </p>

                    </div>
                `;


                return;
            }


            gamesList.innerHTML =
                filteredGames
                    .map(
                        game => {

                            const cover =
                                game.boxArtUrl
                                    ? `
                                        <img
                                            src="${escapeHtml(
                                                game.boxArtUrl
                                            )}"
                                            alt=""
                                            loading="lazy"
                                            draggable="false"
                                        >
                                    `
                                    : `
                                        <div
                                            class="admin-item-placeholder"
                                            aria-hidden="true"
                                        >
                                            🎮
                                        </div>
                                    `;


                            const tags =
                                game.tags.length >
                                    0
                                    ? game.tags
                                        .map(
                                            tag => `
                                                <span>
                                                    ${escapeHtml(
                                                        tag
                                                    )}
                                                </span>
                                            `
                                        )
                                        .join(
                                            ""
                                        )
                                    : `
                                        <span>
                                            Aucun tag
                                        </span>
                                    `;


                            const playlist =
                                game.youtubePlaylist
                                    ? `
                                        <div class="admin-game-playlist">

                                            <span class="admin-game-playlist-label">
                                                ▶️ Playlist YouTube
                                            </span>

                                            <a
                                                href="${escapeHtml(
                                                    game.youtubePlaylist
                                                )}"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                class="admin-game-playlist-link"
                                            >
                                                Voir la playlist
                                            </a>

                                        </div>
                                    `
                                    : `
                                        <div class="admin-game-playlist is-empty">

                                            <span class="admin-game-playlist-label">
                                                ▶️ Playlist YouTube
                                            </span>

                                            <span class="admin-game-playlist-empty">
                                                Non renseignée
                                            </span>

                                        </div>
                                    `;


                            const pollBadge =
                                game.pollEnabled
                                    ? `
                                        <span class="admin-game-poll-badge">
                                            🗳️ Participe au sondage
                                        </span>
                                    `
                                    : "";


                            return `
                                <article
                                    class="admin-list-item"
                                    data-game-id="${escapeHtml(
                                        game.id
                                    )}"
                                >

                                    <div class="admin-list-thumb">
                                        ${cover}
                                    </div>

                                    <div class="admin-list-content">

                                        <div class="admin-list-heading">

                                            <div>

                                                <h3>
                                                    ${escapeHtml(
                                                        game.name ||
                                                        "Jeu sans nom"
                                                    )}
                                                </h3>

                                                <p>
                                                    ${escapeHtml(
                                                        getGameStatusLabel(
                                                            game.status
                                                        )
                                                    )}
                                                </p>

                                                ${pollBadge}

                                            </div>

                                            <div class="admin-list-actions">

                                                <button
                                                    type="button"
                                                    class="admin-secondary-button"
                                                    data-edit-game="${escapeHtml(
                                                        game.id
                                                    )}"
                                                >
                                                    ✏️ Modifier
                                                </button>

                                                <button
                                                    type="button"
                                                    class="admin-danger-button"
                                                    data-delete-game="${escapeHtml(
                                                        game.id
                                                    )}"
                                                >
                                                    🗑️ Supprimer
                                                </button>

                                            </div>

                                        </div>

                                        <div class="admin-item-tags">
                                            ${tags}
                                        </div>

                                        ${playlist}

                                    </div>

                                </article>
                            `;
                        }
                    )
                    .join(
                        ""
                    );


            gamesList
                .querySelectorAll(
                    "[data-edit-game]"
                )
                .forEach(
                    button => {

                        button.addEventListener(
                            "click",
                            () => {

                                const game =
                                    games.find(
                                        item =>
                                            item.id ===
                                            button.dataset
                                                .editGame
                                    );


                                if (
                                    game
                                ) {

                                    fillGameForm(
                                        game
                                    );
                                }
                            }
                        );
                    }
                );


            gamesList
                .querySelectorAll(
                    "[data-delete-game]"
                )
                .forEach(
                    button => {

                        button.addEventListener(
                            "click",
                            () => {

                                deleteGame(
                                    button.dataset
                                        .deleteGame
                                );
                            }
                        );
                    }
                );
        }


        if (
            gamesSearch
        ) {

            gamesSearch.addEventListener(
                "input",
                renderGames
            );
        }


        /* =====================================================
           JEUX — APERÇU TWITCH PAR NOM
        ====================================================== */

        function hideTwitchPreview() {

            if (
                twitchResult
            ) {

                twitchResult.hidden =
                    true;
            }


            if (
                twitchPreviewCover
            ) {

                twitchPreviewCover.removeAttribute(
                    "src"
                );

                twitchPreviewCover.alt =
                    "";
            }


            if (
                twitchPreviewName
            ) {

                twitchPreviewName.textContent =
                    "—";
            }


            if (
                twitchPreviewId
            ) {

                twitchPreviewId.textContent =
                    "—";
            }
        }


        async function loadTwitchGamePreview() {

            const gameName =
                normalizeText(
                    gameNameInput?.value
                );


            if (
                !gameName
            ) {

                showToast(
                    "Entre d'abord le nom du jeu.",
                    "error"
                );


                gameNameInput?.focus();

                return;
            }


            if (
                twitchPreviewButton
            ) {

                twitchPreviewButton.disabled =
                    true;

                twitchPreviewButton.textContent =
                    "Recherche...";
            }


            try {

                const response =
                    await fetch(
                        `${TWITCH_GAME_API}?name=${encodeURIComponent(
                            gameName
                        )}`,
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
                    !response.ok ||
                    !data?.success ||
                    !data?.game
                ) {

                    throw new Error(
                        data?.error ||
                        `Le jeu "${gameName}" est introuvable sur Twitch.`
                    );
                }


                const game =
                    data.game;


                if (
                    gameNameInput &&
                    game.name
                ) {

                    gameNameInput.value =
                        game.name;
                }


                if (
                    twitchPreviewCover
                ) {

                    if (
                        game.boxArtUrl
                    ) {

                        twitchPreviewCover.src =
                            game.boxArtUrl;

                        twitchPreviewCover.alt =
                            `Jaquette de ${game.name || gameName}`;

                    } else {

                        twitchPreviewCover.removeAttribute(
                            "src"
                        );

                        twitchPreviewCover.alt =
                            "";
                    }
                }


                if (
                    twitchPreviewName
                ) {

                    twitchPreviewName.textContent =
                        game.name ||
                        gameName;
                }


                if (
                    twitchPreviewId
                ) {

                    twitchPreviewId.textContent =
                        game.id ||
                        "—";
                }


                if (
                    twitchResult
                ) {

                    twitchResult.hidden =
                        false;
                }


                showToast(
                    `Jeu trouvé : ${game.name || gameName}`,
                    "success"
                );


            } catch (
                error
            ) {

                console.error(
                    "[Twitch Game Preview]",
                    error
                );


                hideTwitchPreview();


                showToast(
                    error?.message ||
                    "Impossible de récupérer le jeu Twitch.",
                    "error"
                );


            } finally {

                if (
                    twitchPreviewButton
                ) {

                    twitchPreviewButton.disabled =
                        false;

                    twitchPreviewButton.textContent =
                        "🔎 Vérifier";
                }
            }
        }


        if (
            twitchPreviewButton
        ) {

            twitchPreviewButton.addEventListener(
                "click",
                loadTwitchGamePreview
            );
        }


        if (
            gameNameInput
        ) {

            gameNameInput.addEventListener(
                "input",
                () => {

                    hideTwitchPreview();
                }
            );
        }


        /* =====================================================
           JEUX — FORMULAIRE
        ====================================================== */

        function resetGameForm() {

            if (
                gameForm
            ) {

                gameForm.reset();
            }


            if (
                gameIdInput
            ) {

                gameIdInput.value =
                    "";
            }


            if (
                gameNameInput
            ) {

                gameNameInput.value =
                    "";
            }


            if (
                statusInput
            ) {

                statusInput.value =
                    "backlog";
            }


            if (
                ratingInput
            ) {

                ratingInput.value =
                    "";
            }


            if (
                pollInput
            ) {

                pollInput.checked =
                    false;
            }


            if (
                gameFormTitle
            ) {

                gameFormTitle.textContent =
                    "Ajouter un jeu";
            }


            if (
                submitGameButton
            ) {

                submitGameButton.disabled =
                    false;

                submitGameButton.textContent =
                    "💾 Enregistrer le jeu";
            }


            hideTwitchPreview();
        }


        function openGameForm() {

            if (
                gameFormPanel
            ) {

                gameFormPanel.hidden =
                    false;
            }


            window.setTimeout(
                () => {

                    gameNameInput?.focus();

                },
                50
            );
        }


        function closeGameForm() {

            resetGameForm();


            if (
                gameFormPanel
            ) {

                gameFormPanel.hidden =
                    true;
            }
        }


        function fillGameForm(
            game
        ) {

            resetGameForm();

            openGameForm();


            if (
                gameIdInput
            ) {

                gameIdInput.value =
                    game.id;
            }


            if (
                gameNameInput
            ) {

                gameNameInput.value =
                    game.name;
            }


            if (
                statusInput
            ) {

                statusInput.value =
                    game.status ||
                    "backlog";
            }


            if (
                tagsInput
            ) {

                tagsInput.value =
                    (
                        game.tags ||
                        []
                    )
                        .join(
                            ", "
                        );
            }


            if (
                descriptionInput
            ) {

                descriptionInput.value =
                    game.description ||
                    "";
            }


            if (
                ratingInput
            ) {

                ratingInput.value =
                    game.rating ??
                    "";
            }


            if (
                youtubeInput
            ) {

                youtubeInput.value =
                    game.youtubePlaylist ||
                    "";
            }


            if (
                pollInput
            ) {

                pollInput.checked =
                    Boolean(
                        game.pollEnabled
                    );
            }


            if (
                gameFormTitle
            ) {

                gameFormTitle.textContent =
                    "Modifier le jeu";
            }


            if (
                submitGameButton
            ) {

                submitGameButton.textContent =
                    "💾 Enregistrer les modifications";
            }


            if (
                twitchPreviewCover
            ) {

                if (
                    game.boxArtUrl
                ) {

                    twitchPreviewCover.src =
                        game.boxArtUrl;

                    twitchPreviewCover.alt =
                        `Jaquette de ${game.name}`;

                } else {

                    twitchPreviewCover.removeAttribute(
                        "src"
                    );
                }
            }


            if (
                twitchPreviewName
            ) {

                twitchPreviewName.textContent =
                    game.name ||
                    "—";
            }


            if (
                twitchPreviewId
            ) {

                twitchPreviewId.textContent =
                    game.twitchGameId ||
                    "—";
            }


            if (
                twitchResult &&
                (
                    game.name ||
                    game.boxArtUrl
                )
            ) {

                twitchResult.hidden =
                    false;
            }
        }


        if (
            newGameButton
        ) {

            newGameButton.addEventListener(
                "click",
                () => {

                    resetGameForm();

                    openGameForm();
                }
            );
        }


        if (
            cancelGameButton
        ) {

            cancelGameButton.addEventListener(
                "click",
                closeGameForm
            );
        }


        /* =====================================================
           JEUX — ENREGISTREMENT
        ====================================================== */

        if (
            gameForm
        ) {

            gameForm.addEventListener(
                "submit",
                async event => {

                    event.preventDefault();


                    const existingId =
                        normalizeText(
                            gameIdInput?.value
                        );


                    const gameName =
                        normalizeText(
                            gameNameInput?.value
                        );


                    if (
                        !gameName
                    ) {

                        showToast(
                            "Le nom du jeu est obligatoire.",
                            "error"
                        );

                        gameNameInput?.focus();

                        return;
                    }


                    const payload = {

                        gameName,

                        status:
                            normalizeText(
                                statusInput?.value
                            ) ||
                            "backlog",

                        tags:
                            normalizeTags(
                                tagsInput?.value
                            ),

                        description:
                            normalizeText(
                                descriptionInput?.value
                            ),

                        rating:
                            ratingInput?.value ===
                                ""
                                ? null
                                : Number(
                                    ratingInput?.value
                                ),

                        youtubePlaylist:
                            normalizeText(
                                youtubeInput?.value
                            ),

                        pollEnabled:
                            Boolean(
                                pollInput?.checked
                            )
                    };


                    if (
                        submitGameButton
                    ) {

                        submitGameButton.disabled =
                            true;

                        submitGameButton.textContent =
                            existingId
                                ? "Enregistrement..."
                                : "Ajout...";
                    }


                    try {

                        if (
                            existingId
                        ) {

                            await adminApiRequest(
                                ADMIN_GAMES_API,
                                {
                                    method:
                                        "PUT",

                                    body: {
                                        id:
                                            existingId,

                                        ...payload
                                    }
                                }
                            );


                            showToast(
                                `"${gameName}" a bien été modifié.`,
                                "success"
                            );

                        } else {

                            await adminApiRequest(
                                ADMIN_GAMES_API,
                                {
                                    method:
                                        "POST",

                                    body:
                                        payload
                                }
                            );


                            showToast(
                                `"${gameName}" a bien été ajouté.`,
                                "success"
                            );
                        }


                        closeGameForm();

                        /*
                         * IMPORTANT :
                         * on recharge les jeux ET le sondage.
                         *
                         * Ainsi si pollEnabled vient d'être
                         * coché ou décoché, la liste du sondage
                         * se met immédiatement à jour.
                         */
                        await loadGames();

                        await loadPoll();


                    } catch (
                        error
                    ) {

                        console.error(
                            "[Admin Game Save]",
                            error
                        );


                        showToast(
                            error?.message ||
                            "Impossible d'enregistrer le jeu.",
                            "error"
                        );


                    } finally {

                        if (
                            submitGameButton
                        ) {

                            submitGameButton.disabled =
                                false;

                            submitGameButton.textContent =
                                existingId
                                    ? "💾 Enregistrer les modifications"
                                    : "💾 Enregistrer le jeu";
                        }
                    }
                }
            );
        }


        /* =====================================================
           JEUX — SUPPRESSION
        ====================================================== */

        async function deleteGame(
            gameId
        ) {

            const normalizedId =
                normalizeText(
                    gameId
                );


            if (
                !normalizedId
            ) {

                showToast(
                    "Impossible de déterminer le jeu à supprimer.",
                    "error"
                );

                return;
            }


            const game =
                games.find(
                    item =>
                        String(
                            item.id
                        ) ===
                        String(
                            normalizedId
                        )
                );


            const gameName =
                game?.name ||
                "ce jeu";


            const confirmed =
                window.confirm(
                    `Supprimer définitivement "${gameName}" ?`
                );


            if (
                !confirmed
            ) {

                return;
            }


            try {

                await adminApiRequest(
                    ADMIN_GAMES_API,
                    {
                        method:
                            "DELETE",

                        body: {
                            id:
                                normalizedId
                        }
                    }
                );


                showToast(
                    `"${gameName}" a été supprimé.`,
                    "success"
                );


                await loadGames();

                /*
                 * Si le jeu participait au sondage,
                 * sa suppression doit aussi actualiser
                 * les options du sondage.
                 */
                await loadPoll();


            } catch (
                error
            ) {

                console.error(
                    "[Admin Game Delete]",
                    error
                );


                showToast(
                    error?.message ||
                    "Impossible de supprimer le jeu.",
                    "error"
                );
            }
        }
                /* =====================================================
           ARTWORKS — NORMALISATION
        ====================================================== */

        function normalizeArtwork(
            artwork
        ) {

            return {

                id:
                    normalizeText(
                        artwork?.id
                    ),

                artId:
                    normalizeText(
                        artwork?.artId ??
                        artwork?.art_id
                    ),

                sortOrder:
                    Number(
                        artwork?.sortOrder ??
                        artwork?.sort_order ??
                        0
                    ),

                artist:
                    normalizeText(
                        artwork?.artist
                    ),

                artistRole:
                    normalizeText(
                        artwork?.artistRole ??
                        artwork?.artist_role
                    ),

                description:
                    normalizeText(
                        artwork?.description
                    ),

                imageUrl:
                    normalizeText(
                        artwork?.imageUrl ??
                        artwork?.image_url
                    ),

                imageAlt:
                    normalizeText(
                        artwork?.imageAlt ??
                        artwork?.image_alt
                    ),

                mediaType:
                    normalizeText(
                        artwork?.mediaType ??
                        artwork?.media_type
                    ) ||
                    "image",

                tags:
                    normalizeTags(
                        artwork?.tags
                    ),

                imageMessages:
                    normalizeMessages(
                        artwork?.imageMessages ??
                        artwork?.image_messages
                    ),

                artistUrl:
                    normalizeText(
                        artwork?.artistUrl ??
                        artwork?.artist_url
                    ),

                buttonText:
                    normalizeText(
                        artwork?.buttonText ??
                        artwork?.button_text
                    ) ||
                    "Voir son profil",

                buttonMessages:
                    normalizeMessages(
                        artwork?.buttonMessages ??
                        artwork?.button_messages
                    ),

                sensitive:
                    normalizeBoolean(
                        artwork?.sensitive
                    ),

                favoriteEnabled:
                    artwork?.favoriteEnabled !==
                        undefined
                        ? normalizeBoolean(
                            artwork.favoriteEnabled
                        )
                        : artwork?.favorite_enabled !==
                            undefined
                            ? normalizeBoolean(
                                artwork.favorite_enabled
                            )
                            : true,

                visible:
                    artwork?.visible !==
                        undefined
                        ? normalizeBoolean(
                            artwork.visible
                        )
                        : true,

                createdAt:
                    artwork?.createdAt ??
                    artwork?.created_at ??
                    null,

                updatedAt:
                    artwork?.updatedAt ??
                    artwork?.updated_at ??
                    null

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
                            normalizeArtwork
                        )
                        : [];


                renderArtworks();

                updateDashboardStats();


            } catch (
                error
            ) {

                console.error(
                    "[Admin Gallery]",
                    error
                );


                artworks =
                    [];


                renderArtworks();

                updateDashboardStats();


                showToast(
                    error.message ||
                    "Impossible de charger les illustrations.",
                    "error"
                );
            }
        }


        /* =====================================================
           ARTWORKS — MÉDIA
        ====================================================== */

        function isVideoMedia(
            artwork
        ) {

            if (
                artwork?.mediaType ===
                "video"
            ) {

                return true;
            }


            const url =
                normalizeText(
                    artwork?.imageUrl
                )
                    .toLowerCase();


            return (
                url.endsWith(
                    ".mp4"
                ) ||
                url.endsWith(
                    ".webm"
                )
            );
        }


        function createArtworkMediaHtml(
            artwork
        ) {

            const url =
                escapeHtml(
                    artwork.imageUrl
                );


            const alt =
                escapeHtml(
                    artwork.imageAlt ||
                    artwork.artist ||
                    "Illustration"
                );


            if (
                !url
            ) {

                return `
                    <div
                        class="admin-item-placeholder"
                        aria-hidden="true"
                    >
                        🎨
                    </div>
                `;
            }


            if (
                isVideoMedia(
                    artwork
                )
            ) {

                return `
                    <video
                        src="${url}"
                        muted
                        loop
                        autoplay
                        playsinline
                        preload="metadata"
                    ></video>
                `;
            }


            return `
                <img
                    src="${url}"
                    alt="${alt}"
                    loading="lazy"
                    draggable="false"
                >
            `;
        }


        function renderArtworks() {

            if (
                !artworksList
            ) {

                return;
            }


            const query =
                normalizeText(
                    artworksSearch?.value
                )
                    .toLowerCase();


            const selectedFilter =
                normalizeText(
                    artworksFilter?.value
                ) ||
                "all";


            const filteredArtworks =
                artworks
                    .filter(
                        artwork => {

                            switch (
                                selectedFilter
                            ) {

                                case "visible":

                                    return Boolean(
                                        artwork.visible
                                    );


                                case "hidden":

                                    return !Boolean(
                                        artwork.visible
                                    );


                                case "sensitive":

                                    return Boolean(
                                        artwork.sensitive
                                    );


                                case "favorites":

                                    return Boolean(
                                        artwork.favoriteEnabled
                                    );


                                case "all":

                                default:

                                    return true;
                            }
                        }
                    )
                    .filter(
                        artwork => {

                            if (
                                !query
                            ) {

                                return true;
                            }


                            const haystack =
                                [
                                    artwork.artId,
                                    artwork.artist,
                                    artwork.artistRole,
                                    artwork.description,
                                    artwork.imageAlt,
                                    artwork.mediaType,
                                    artwork.artistUrl,
                                    ...(
                                        artwork.tags ||
                                        []
                                    )
                                ]
                                    .join(
                                        " "
                                    )
                                    .toLowerCase();


                            return haystack.includes(
                                query
                            );
                        }
                    )
                    .sort(
                        (
                            a,
                            b
                        ) =>
                            Number(
                                a.sortOrder ||
                                0
                            ) -
                            Number(
                                b.sortOrder ||
                                0
                            )
                    );


            if (
                filteredArtworks.length ===
                    0
            ) {

                artworksList.innerHTML = `
                    <div class="admin-empty-state">

                        <span
                            class="admin-empty-icon"
                            aria-hidden="true"
                        >
                            🎨
                        </span>

                        <h3>
                            Aucune illustration
                        </h3>

                        <p>
                            Aucune œuvre ne correspond
                            au filtre sélectionné.
                        </p>

                    </div>
                `;


                return;
            }


            artworksList.innerHTML =
                filteredArtworks
                    .map(
                        artwork => {

                            const tags =
                                Array.isArray(
                                    artwork.tags
                                ) &&
                                artwork.tags.length >
                                    0
                                    ? artwork.tags
                                        .map(
                                            tag => `
                                                <span
                                                    class="admin-artwork-tag"
                                                >
                                                    ${escapeHtml(
                                                        tag
                                                    )}
                                                </span>
                                            `
                                        )
                                        .join(
                                            ""
                                        )
                                    : `
                                        <span
                                            class="admin-artwork-tag is-empty"
                                        >
                                            Aucun tag
                                        </span>
                                    `;


                            const visibilityLabel =
                                artwork.visible
                                    ? "👁️ Visible"
                                    : "🙈 Masquée";


                            const sensitiveLabel =
                                artwork.sensitive
                                    ? `
                                        <span
                                            class="admin-artwork-status is-sensitive"
                                        >
                                            🔞 Sensible
                                        </span>
                                    `
                                    : "";


                            const favoriteLabel =
                                artwork.favoriteEnabled
                                    ? `
                                        <span
                                            class="admin-artwork-status is-favorite"
                                        >
                                            💗 Favoris
                                        </span>
                                    `
                                    : "";


                            return `
                                <article
                                    class="admin-list-item admin-artwork-card"
                                    data-artwork-id="${escapeHtml(
                                        artwork.id
                                    )}"
                                >

                                    <div
                                        class="admin-list-thumb admin-artwork-card-media"
                                    >
                                        ${createArtworkMediaHtml(
                                            artwork
                                        )}
                                    </div>


                                    <div
                                        class="admin-list-content admin-artwork-card-content"
                                    >

                                        <h3>
                                            ${escapeHtml(
                                                artwork.artist ||
                                                "Artiste inconnu"
                                            )}
                                        </h3>


                                        <p
                                            class="admin-artwork-role"
                                        >
                                            ${escapeHtml(
                                                artwork.artistRole ||
                                                "Illustration"
                                            )}
                                        </p>


                                        <div
                                            class="admin-artwork-statuses"
                                        >

                                            <span
                                                class="admin-artwork-status"
                                            >
                                                #${escapeHtml(
                                                    artwork.artId ||
                                                    "—"
                                                )}
                                            </span>

                                            <span
                                                class="admin-artwork-status"
                                            >
                                                ${escapeHtml(
                                                    visibilityLabel
                                                )}
                                            </span>

                                            ${sensitiveLabel}

                                            ${favoriteLabel}

                                        </div>


                                        ${
                                            artwork.description
                                                ? `
                                                    <p
                                                        class="admin-artwork-description"
                                                    >
                                                        ${escapeHtml(
                                                            artwork.description
                                                        )}
                                                    </p>
                                                `
                                                : ""
                                        }


                                        <div
                                            class="admin-artwork-tags"
                                        >
                                            ${tags}
                                        </div>


                                        ${
                                            artwork.artistUrl
                                                ? `
                                                    <a
                                                        href="${escapeHtml(
                                                            artwork.artistUrl
                                                        )}"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        class="admin-artwork-link"
                                                    >
                                                        🔗 ${escapeHtml(
                                                            artwork.buttonText ||
                                                            "Voir son profil"
                                                        )}
                                                    </a>
                                                `
                                                : ""
                                        }


                                        <div
                                            class="admin-list-actions"
                                        >

                                            <button
                                                type="button"
                                                class="admin-secondary-button"
                                                data-edit-artwork="${escapeHtml(
                                                    artwork.id
                                                )}"
                                            >
                                                ✏️ Modifier
                                            </button>


                                            <button
                                                type="button"
                                                class="admin-danger-button"
                                                data-delete-artwork="${escapeHtml(
                                                    artwork.id
                                                )}"
                                            >
                                                🗑️ Supprimer
                                            </button>

                                        </div>

                                    </div>

                                </article>
                            `;
                        }
                    )
                    .join(
                        ""
                    );


            /* =================================================
               MODIFIER ARTWORK
            ================================================= */

            artworksList
                .querySelectorAll(
                    "[data-edit-artwork]"
                )
                .forEach(
                    button => {

                        button.addEventListener(
                            "click",
                            () => {

                                const artwork =
                                    artworks.find(
                                        item =>
                                            String(
                                                item.id
                                            ) ===
                                            String(
                                                button.dataset
                                                    .editArtwork
                                            )
                                    );


                                if (
                                    artwork
                                ) {

                                    fillArtworkForm(
                                        artwork
                                    );
                                }
                            }
                        );
                    }
                );


            /* =================================================
               SUPPRIMER ARTWORK
            ================================================= */

            artworksList
                .querySelectorAll(
                    "[data-delete-artwork]"
                )
                .forEach(
                    button => {

                        button.addEventListener(
                            "click",
                            () => {

                                deleteArtwork(
                                    button.dataset
                                        .deleteArtwork
                                );
                            }
                        );
                    }
                );
        }


        if (
            artworksSearch
        ) {

            artworksSearch.addEventListener(
                "input",
                renderArtworks
            );
        }


        if (
            artworksFilter
        ) {

            artworksFilter.addEventListener(
                "change",
                renderArtworks
            );
        }


        /* =====================================================
           ARTWORKS — APERÇU UPLOAD
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


        function hideArtworkPreviewMedia() {

            if (
                artworkPreviewImage
            ) {

                artworkPreviewImage.hidden =
                    true;

                artworkPreviewImage.removeAttribute(
                    "src"
                );
            }


            if (
                artworkPreviewVideo
            ) {

                artworkPreviewVideo.hidden =
                    true;

                artworkPreviewVideo.pause();

                artworkPreviewVideo.removeAttribute(
                    "src"
                );

                artworkPreviewVideo.load();
            }
        }


        function showArtworkPreviewFromUrl(
            url,
            mediaType =
                "image"
        ) {

            const normalizedUrl =
                normalizeText(
                    url
                );


            if (
                !normalizedUrl
            ) {

                hideArtworkPreviewMedia();


                if (
                    artworkUploadPreview
                ) {

                    artworkUploadPreview.hidden =
                        true;
                }


                return;
            }


            hideArtworkPreviewMedia();


            if (
                mediaType ===
                    "video"
            ) {

                if (
                    artworkPreviewVideo
                ) {

                    artworkPreviewVideo.src =
                        normalizedUrl;

                    artworkPreviewVideo.hidden =
                        false;

                    artworkPreviewVideo.play()
                        .catch(
                            () => {

                                /*
                                 * autoplay non disponible
                                 */
                            }
                        );
                }

            } else {

                if (
                    artworkPreviewImage
                ) {

                    artworkPreviewImage.src =
                        normalizedUrl;

                    artworkPreviewImage.hidden =
                        false;
                }
            }


            if (
                artworkUploadPreview
            ) {

                artworkUploadPreview.hidden =
                    false;
            }
        }


        function clearArtworkFileSelection(
            options = {}
        ) {

            const {
                keepExistingPreview =
                    false
            } =
                options;


            selectedArtworkFile =
                null;


            revokeArtworkPreviewUrl();


            if (
                artworkFileInput
            ) {

                artworkFileInput.value =
                    "";
            }


            if (
                artworkFileName
            ) {

                artworkFileName.textContent =
                    "";
            }


            if (
                artworkFileSize
            ) {

                artworkFileSize.textContent =
                    "";
            }


            if (
                !keepExistingPreview
            ) {

                hideArtworkPreviewMedia();


                if (
                    artworkUploadPreview
                ) {

                    artworkUploadPreview.hidden =
                        true;
                }
            }
        }


        function validateArtworkFile(
            file
        ) {

            if (
                !file
            ) {

                throw new Error(
                    "Aucun fichier sélectionné."
                );
            }


            if (
                !ALLOWED_ARTWORK_TYPES.has(
                    file.type
                )
            ) {

                throw new Error(
                    "Format non autorisé. Utilise PNG, JPG, WEBP, GIF, MP4 ou WEBM."
                );
            }


            if (
                file.size >
                    MAX_ARTWORK_FILE_SIZE
            ) {

                throw new Error(
                    `Le fichier dépasse la limite de ${
                        formatFileSize(
                            MAX_ARTWORK_FILE_SIZE
                        )
                    }.`
                );
            }


            return true;
        }


        function selectArtworkFile(
            file
        ) {

            try {

                validateArtworkFile(
                    file
                );


                clearArtworkFileSelection();


                selectedArtworkFile =
                    file;


                artworkPreviewObjectUrl =
                    URL.createObjectURL(
                        file
                    );


                if (
                    artworkFileName
                ) {

                    artworkFileName.textContent =
                        file.name;
                }


                if (
                    artworkFileSize
                ) {

                    artworkFileSize.textContent =
                        formatFileSize(
                            file.size
                        );
                }


                const mediaType =
                    file.type.startsWith(
                        "video/"
                    )
                        ? "video"
                        : "image";


                if (
                    artworkMediaTypeInput
                ) {

                    artworkMediaTypeInput.value =
                        mediaType;
                }


                showArtworkPreviewFromUrl(
                    artworkPreviewObjectUrl,
                    mediaType
                );


                showToast(
                    "Fichier prêt à être envoyé.",
                    "success"
                );


            } catch (
                error
            ) {

                clearArtworkFileSelection();


                showToast(
                    error.message ||
                    "Fichier invalide.",
                    "error"
                );
            }
        }


        /* =====================================================
           INPUT FICHIER
        ====================================================== */

        if (
            artworkFileInput
        ) {

            artworkFileInput.addEventListener(
                "change",
                () => {

                    const file =
                        artworkFileInput
                            .files?.[0];


                    if (
                        file
                    ) {

                        selectArtworkFile(
                            file
                        );
                    }
                }
            );
        }


        /* =====================================================
           DROPZONE
        ====================================================== */

        if (
            artworkDropzone
        ) {

            artworkDropzone.addEventListener(
                "click",
                event => {

                    if (
                        event.target.closest(
                            "button"
                        )
                    ) {

                        return;
                    }


                    artworkFileInput?.click();
                }
            );


            artworkDropzone.addEventListener(
                "dragover",
                event => {

                    event.preventDefault();


                    artworkDropzone.classList.add(
                        "is-dragover"
                    );
                }
            );


            artworkDropzone.addEventListener(
                "dragleave",
                () => {

                    artworkDropzone.classList.remove(
                        "is-dragover"
                    );
                }
            );


            artworkDropzone.addEventListener(
                "drop",
                event => {

                    event.preventDefault();


                    artworkDropzone.classList.remove(
                        "is-dragover"
                    );


                    const file =
                        event.dataTransfer
                            ?.files?.[0];


                    if (
                        file
                    ) {

                        selectArtworkFile(
                            file
                        );
                    }
                }
            );
        }


        /* =====================================================
           RETIRER MÉDIA
        ====================================================== */

        if (
            artworkRemoveImage
        ) {

            artworkRemoveImage.addEventListener(
                "click",
                () => {

                    clearArtworkFileSelection();


                    if (
                        artworkImageUrlInput
                    ) {

                        artworkImageUrlInput.value =
                            "";
                    }


                    showToast(
                        "Média retiré du formulaire.",
                        "success"
                    );
                }
            );
        }
                /* =====================================================
           ARTWORKS — UPLOAD SERVEUR
        ====================================================== */

        async function uploadArtworkFile() {

            if (
                !selectedArtworkFile
            ) {

                return null;
            }


            validateArtworkFile(
                selectedArtworkFile
            );


            const formData =
                new FormData();


            formData.append(
                "file",
                selectedArtworkFile
            );


            const response =
                await fetch(
                    ADMIN_GALLERY_UPLOAD_API,
                    {
                        method:
                            "POST",

                        credentials:
                            "same-origin",

                        cache:
                            "no-store",

                        body:
                            formData
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


            if (
                !response.ok
            ) {

                throw new Error(
                    data?.error ||
                    "Impossible d'envoyer le média."
                );
            }


            const uploadedUrl =
                normalizeText(
                    data?.url ??
                    data?.imageUrl ??
                    data?.image_url ??
                    data?.fileUrl ??
                    data?.file_url
                );


            if (
                !uploadedUrl
            ) {

                throw new Error(
                    "Le serveur n'a pas retourné l'URL du média."
                );
            }


            return {

                url:
                    uploadedUrl,

                mediaType:
                    normalizeText(
                        data?.mediaType ??
                        data?.media_type
                    ) ||
                    (
                        selectedArtworkFile.type
                            .startsWith(
                                "video/"
                            )
                            ? "video"
                            : "image"
                    )

            };
        }


        /* =====================================================
           ARTWORKS — FORMULAIRE
        ====================================================== */

        function resetArtworkForm() {

            if (
                artworkForm
            ) {

                artworkForm.reset();
            }


            if (
                artworkIdInput
            ) {

                artworkIdInput.value =
                    "";
            }


            if (
                artworkArtIdInput
            ) {

                artworkArtIdInput.value =
                    "";
            }


            if (
                artworkSortOrderInput
            ) {

                artworkSortOrderInput.value =
                    "0";
            }


            if (
                artworkMediaTypeInput
            ) {

                artworkMediaTypeInput.value =
                    "image";
            }


            if (
                artworkButtonTextInput
            ) {

                artworkButtonTextInput.value =
                    "Voir son profil";
            }


            if (
                artworkSensitiveInput
            ) {

                artworkSensitiveInput.checked =
                    false;
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
                artworkFormTitle
            ) {

                artworkFormTitle.textContent =
                    "Ajouter une illustration";
            }


            if (
                artworkSubmitButton
            ) {

                artworkSubmitButton.disabled =
                    false;

                artworkSubmitButton.textContent =
                    "💾 Enregistrer l'illustration";
            }


            clearArtworkFileSelection();
        }


        function openArtworkForm() {

            if (
                artworkFormPanel
            ) {

                artworkFormPanel.hidden =
                    false;
            }


            window.setTimeout(
                () => {

                    artworkArtistInput?.focus();

                },
                50
            );
        }


        function closeArtworkForm() {

            resetArtworkForm();


            if (
                artworkFormPanel
            ) {

                artworkFormPanel.hidden =
                    true;
            }
        }


        function fillArtworkForm(
            artwork
        ) {

            resetArtworkForm();

            openArtworkForm();


            if (
                artworkIdInput
            ) {

                artworkIdInput.value =
                    artwork.id;
            }


            if (
                artworkArtIdInput
            ) {

                artworkArtIdInput.value =
                    artwork.artId;
            }


            if (
                artworkSortOrderInput
            ) {

                artworkSortOrderInput.value =
                    String(
                        artwork.sortOrder ??
                        0
                    );
            }


            if (
                artworkArtistInput
            ) {

                artworkArtistInput.value =
                    artwork.artist;
            }


            if (
                artworkRoleInput
            ) {

                artworkRoleInput.value =
                    artwork.artistRole;
            }


            if (
                artworkImageUrlInput
            ) {

                artworkImageUrlInput.value =
                    artwork.imageUrl;
            }


            if (
                artworkImageAltInput
            ) {

                artworkImageAltInput.value =
                    artwork.imageAlt;
            }


            if (
                artworkMediaTypeInput
            ) {

                artworkMediaTypeInput.value =
                    artwork.mediaType ||
                    "image";
            }


            if (
                artworkTagsInput
            ) {

                artworkTagsInput.value =
                    (
                        artwork.tags ||
                        []
                    ).join(
                        ", "
                    );
            }


            if (
                artworkDescriptionInput
            ) {

                artworkDescriptionInput.value =
                    artwork.description;
            }


            if (
                artworkImageMessagesInput
            ) {

                artworkImageMessagesInput.value =
                    (
                        artwork.imageMessages ||
                        []
                    ).join(
                        " | "
                    );
            }


            if (
                artworkArtistUrlInput
            ) {

                artworkArtistUrlInput.value =
                    artwork.artistUrl;
            }


            if (
                artworkButtonTextInput
            ) {

                artworkButtonTextInput.value =
                    artwork.buttonText ||
                    "Voir son profil";
            }


            if (
                artworkButtonMessagesInput
            ) {

                artworkButtonMessagesInput.value =
                    (
                        artwork.buttonMessages ||
                        []
                    ).join(
                        " | "
                    );
            }


            if (
                artworkSensitiveInput
            ) {

                artworkSensitiveInput.checked =
                    Boolean(
                        artwork.sensitive
                    );
            }


            if (
                artworkFavoriteInput
            ) {

                artworkFavoriteInput.checked =
                    Boolean(
                        artwork.favoriteEnabled
                    );
            }


            if (
                artworkVisibleInput
            ) {

                artworkVisibleInput.checked =
                    Boolean(
                        artwork.visible
                    );
            }


            if (
                artworkFormTitle
            ) {

                artworkFormTitle.textContent =
                    "Modifier l'illustration";
            }


            if (
                artworkSubmitButton
            ) {

                artworkSubmitButton.textContent =
                    "💾 Enregistrer les modifications";
            }


            if (
                artwork.imageUrl
            ) {

                showArtworkPreviewFromUrl(
                    artwork.imageUrl,
                    artwork.mediaType
                );
            }
        }


        if (
            newArtworkButton
        ) {

            newArtworkButton.addEventListener(
                "click",
                () => {

                    resetArtworkForm();

                    openArtworkForm();
                }
            );
        }


        if (
            artworkCancelButton
        ) {

            artworkCancelButton.addEventListener(
                "click",
                closeArtworkForm
            );
        }


        /* =====================================================
           ARTWORKS — APERÇU URL
        ====================================================== */

        if (
            artworkImageUrlInput
        ) {

            artworkImageUrlInput.addEventListener(
                "input",
                () => {

                    if (
                        selectedArtworkFile
                    ) {

                        return;
                    }


                    const url =
                        normalizeText(
                            artworkImageUrlInput.value
                        );


                    const mediaType =
                        normalizeText(
                            artworkMediaTypeInput?.value
                        ) ||
                        "image";


                    showArtworkPreviewFromUrl(
                        url,
                        mediaType
                    );
                }
            );
        }


        if (
            artworkMediaTypeInput
        ) {

            artworkMediaTypeInput.addEventListener(
                "change",
                () => {

                    if (
                        selectedArtworkFile
                    ) {

                        return;
                    }


                    showArtworkPreviewFromUrl(
                        artworkImageUrlInput?.value,
                        artworkMediaTypeInput.value
                    );
                }
            );
        }


        /* =====================================================
           ARTWORKS — ENREGISTREMENT
        ====================================================== */

        if (
            artworkForm
        ) {

            artworkForm.addEventListener(
                "submit",
                async event => {

                    event.preventDefault();


                    const existingId =
                        normalizeText(
                            artworkIdInput?.value
                        );


                    const artist =
                        normalizeText(
                            artworkArtistInput?.value
                        );


                    if (
                        !artist
                    ) {

                        showToast(
                            "Le nom de l'artiste est obligatoire.",
                            "error"
                        );


                        artworkArtistInput?.focus();

                        return;
                    }


                    if (
                        artworkSubmitButton
                    ) {

                        artworkSubmitButton.disabled =
                            true;

                        artworkSubmitButton.textContent =
                            selectedArtworkFile
                                ? "Envoi du média..."
                                : "Enregistrement...";
                    }


                    try {

                        let imageUrl =
                            normalizeText(
                                artworkImageUrlInput?.value
                            );


                        let mediaType =
                            normalizeText(
                                artworkMediaTypeInput?.value
                            ) ||
                            "image";


                        /*
                         * Si un nouveau fichier a été sélectionné,
                         * on commence par l'envoyer au serveur.
                         */
                        if (
                            selectedArtworkFile
                        ) {

                            const upload =
                                await uploadArtworkFile();


                            imageUrl =
                                upload.url;

                            mediaType =
                                upload.mediaType;
                        }


                        const payload = {

                            artId:
                                normalizeText(
                                    artworkArtIdInput?.value
                                ),

                            sortOrder:
                                Number(
                                    artworkSortOrderInput?.value ||
                                    0
                                ),

                            artist,

                            artistRole:
                                normalizeText(
                                    artworkRoleInput?.value
                                ),

                            description:
                                normalizeText(
                                    artworkDescriptionInput?.value
                                ),

                            imageUrl,

                            imageAlt:
                                normalizeText(
                                    artworkImageAltInput?.value
                                ),

                            mediaType,

                            tags:
                                normalizeTags(
                                    artworkTagsInput?.value
                                ),

                            imageMessages:
                                normalizeMessages(
                                    artworkImageMessagesInput?.value
                                ),

                            artistUrl:
                                normalizeText(
                                    artworkArtistUrlInput?.value
                                ),

                            buttonText:
                                normalizeText(
                                    artworkButtonTextInput?.value
                                ) ||
                                "Voir son profil",

                            buttonMessages:
                                normalizeMessages(
                                    artworkButtonMessagesInput?.value
                                ),

                            sensitive:
                                Boolean(
                                    artworkSensitiveInput?.checked
                                ),

                            favoriteEnabled:
                                Boolean(
                                    artworkFavoriteInput?.checked
                                ),

                            visible:
                                Boolean(
                                    artworkVisibleInput?.checked
                                )

                        };


                        if (
                            existingId
                        ) {

                            await adminApiRequest(
                                ADMIN_GALLERY_API,
                                {
                                    method:
                                        "PUT",

                                    body: {
                                        id:
                                            existingId,

                                        ...payload
                                    }
                                }
                            );


                            showToast(
                                `Illustration de "${artist}" modifiée.`,
                                "success"
                            );

                        } else {

                            await adminApiRequest(
                                ADMIN_GALLERY_API,
                                {
                                    method:
                                        "POST",

                                    body:
                                        payload
                                }
                            );


                            showToast(
                                `Illustration de "${artist}" ajoutée.`,
                                "success"
                            );
                        }


                        closeArtworkForm();

                        await loadArtworks();


                    } catch (
                        error
                    ) {

                        console.error(
                            "[Admin Artwork Save]",
                            error
                        );


                        showToast(
                            error?.message ||
                            "Impossible d'enregistrer l'illustration.",
                            "error"
                        );


                    } finally {

                        if (
                            artworkSubmitButton
                        ) {

                            artworkSubmitButton.disabled =
                                false;

                            artworkSubmitButton.textContent =
                                existingId
                                    ? "💾 Enregistrer les modifications"
                                    : "💾 Enregistrer l'illustration";
                        }
                    }
                }
            );
        }


        /* =====================================================
           ARTWORKS — SUPPRESSION
        ====================================================== */

        async function deleteArtwork(
            artworkId
        ) {

            const normalizedId =
                normalizeText(
                    artworkId
                );


            if (
                !normalizedId
            ) {

                showToast(
                    "Impossible de déterminer l'illustration à supprimer.",
                    "error"
                );

                return;
            }


            const artwork =
                artworks.find(
                    item =>
                        String(
                            item.id
                        ) ===
                        String(
                            normalizedId
                        )
                );


            const artist =
                artwork?.artist ||
                "cet artiste";


            const confirmed =
                window.confirm(
                    `Supprimer définitivement l'illustration de "${artist}" ?`
                );


            if (
                !confirmed
            ) {

                return;
            }


            try {

                await adminApiRequest(
                    ADMIN_GALLERY_API,
                    {
                        method:
                            "DELETE",

                        body: {
                            id:
                                normalizedId
                        }
                    }
                );


                showToast(
                    "Illustration supprimée.",
                    "success"
                );


                await loadArtworks();


            } catch (
                error
            ) {

                console.error(
                    "[Admin Artwork Delete]",
                    error
                );


                showToast(
                    error?.message ||
                    "Impossible de supprimer l'illustration.",
                    "error"
                );
            }
        }


        /* =====================================================
           SONDAGE — JEUX ÉLIGIBLES
        ====================================================== */

        function getPollEligibleGames() {

            return games
                .filter(
                    game =>
                        Boolean(
                            game.pollEnabled
                        )
                )
                .sort(
                    (
                        a,
                        b
                    ) =>
                        String(
                            a.name ||
                            ""
                        ).localeCompare(
                            String(
                                b.name ||
                                ""
                            ),
                            "fr",
                            {
                                sensitivity:
                                    "base"
                            }
                        )
                );
        }


        /* =====================================================
           SONDAGE — NORMALISATION
        ====================================================== */

        function normalizePollOption(
            option
        ) {

            return {

                id:
                    normalizeText(
                        option?.id ??
                        option?.gameId ??
                        option?.game_id
                    ),

                gameId:
                    normalizeText(
                        option?.gameId ??
                        option?.game_id ??
                        option?.id
                    ),

                label:
                    normalizeText(
                        option?.label ??
                        option?.name
                    ),

                votes:
                    Number(
                        option?.votes ||
                        0
                    )

            };
        }


        function normalizePoll(
            value
        ) {

            if (
                !value
            ) {

                return null;
            }


            return {

                question:
                    normalizeText(
                        value?.question
                    ) ||
                    "Quel jeu voulez-vous voir en stream ?",

                status:
                    normalizeText(
                        value?.status
                    ) ||
                    "closed",

                options:
                    Array.isArray(
                        value?.options
                    )
                        ? value.options.map(
                            normalizePollOption
                        )
                        : [],

                totalVotes:
                    Number(
                        value?.totalVotes ??
                        value?.total_votes ??
                        0
                    )

            };
        }


        /* =====================================================
           SONDAGE — CHARGEMENT
        ====================================================== */

        async function loadPoll() {

            try {

                const data =
                    await adminApiRequest(
                        ADMIN_POLL_API,
                        {
                            method:
                                "GET"
                        }
                    );


                poll =
                    normalizePoll(
                        data?.poll ??
                        data
                    );


                renderPoll();

                updateDashboardStats();


            } catch (
                error
            ) {

                console.error(
                    "[Admin Poll]",
                    error
                );


                poll =
                    null;


                renderPoll();

                updateDashboardStats();


                showToast(
                    error?.message ||
                    "Impossible de charger le sondage.",
                    "error"
                );
            }
        }


        /* =====================================================
           SONDAGE — CONSTRUCTION AUTOMATIQUE DES OPTIONS
        ====================================================== */

        function buildAutomaticPollOptions() {

            const eligibleGames =
                getPollEligibleGames();


            return eligibleGames.map(
                game => {

                    const existingOption =
                        poll?.options?.find(
                            option =>
                                String(
                                    option.gameId
                                ) ===
                                String(
                                    game.id
                                ) ||
                                String(
                                    option.id
                                ) ===
                                String(
                                    game.id
                                )
                        );


                    return {

                        id:
                            game.id,

                        gameId:
                            game.id,

                        label:
                            game.name,

                        votes:
                            Number(
                                existingOption?.votes ||
                                0
                            ),

                        boxArtUrl:
                            game.boxArtUrl ||
                            ""

                    };
                }
            );
        }


        /* =====================================================
           SONDAGE — AFFICHAGE
        ====================================================== */

        function renderPoll() {

            const question =
                normalizeText(
                    pollQuestionInput?.value
                ) ||
                normalizeText(
                    poll?.question
                ) ||
                "Quel jeu voulez-vous voir en stream ?";


            const status =
                normalizeText(
                    pollStatusInput?.value
                ) ||
                normalizeText(
                    poll?.status
                ) ||
                "closed";


            const automaticOptions =
                buildAutomaticPollOptions();


            if (
                pollQuestionInput &&
                document.activeElement !==
                    pollQuestionInput
            ) {

                pollQuestionInput.value =
                    question;
            }


            if (
                pollStatusInput
            ) {

                pollStatusInput.value =
                    status;
            }


            /*
             * Liste dans le formulaire administrateur.
             */
            if (
                pollOptionsList
            ) {

                if (
                    automaticOptions.length ===
                    0
                ) {

                    pollOptionsList.innerHTML = `
                        <div class="admin-empty-state">

                            <span
                                class="admin-empty-icon"
                                aria-hidden="true"
                            >
                                🗳️
                            </span>

                            <h3>
                                Aucun jeu sélectionné
                            </h3>

                            <p>
                                Coche « Participer au sondage »
                                sur les jeux que tu souhaites
                                proposer au vote.
                            </p>

                        </div>
                    `;

                } else {

                    pollOptionsList.innerHTML =
                        automaticOptions
                            .map(
                                option => `
                                    <article
                                        class="admin-poll-option"
                                        data-poll-game-id="${escapeHtml(
                                            option.gameId
                                        )}"
                                    >

                                        ${
                                            option.boxArtUrl
                                                ? `
                                                    <img
                                                        src="${escapeHtml(
                                                            option.boxArtUrl
                                                        )}"
                                                        alt=""
                                                        loading="lazy"
                                                        draggable="false"
                                                    >
                                                `
                                                : `
                                                    <span
                                                        class="admin-poll-option-placeholder"
                                                        aria-hidden="true"
                                                    >
                                                        🎮
                                                    </span>
                                                `
                                        }

                                        <div>

                                            <strong>
                                                ${escapeHtml(
                                                    option.label
                                                )}
                                            </strong>

                                            <span>
                                                ${Number(
                                                    option.votes ||
                                                    0
                                                )} vote${
                                                    Number(
                                                        option.votes ||
                                                        0
                                                    ) ===
                                                    1
                                                        ? ""
                                                        : "s"
                                                }
                                            </span>

                                        </div>

                                    </article>
                                `
                            )
                            .join(
                                ""
                            );
                }
            }


            /*
             * Aperçu du sondage.
             */
            if (
                pollPreview
            ) {

                pollPreview.hidden =
                    false;
            }


            if (
                pollPreviewQuestion
            ) {

                pollPreviewQuestion.textContent =
                    question;
            }


            if (
                pollPreviewOptions
            ) {

                if (
                    automaticOptions.length ===
                    0
                ) {

                    pollPreviewOptions.innerHTML = `
                        <p class="admin-poll-preview-empty">
                            Aucun jeu disponible pour le sondage.
                        </p>
                    `;

                } else {

                    const totalVotes =
                        automaticOptions.reduce(
                            (
                                total,
                                option
                            ) =>
                                total +
                                Number(
                                    option.votes ||
                                    0
                                ),
                            0
                        );


                    pollPreviewOptions.innerHTML =
                        automaticOptions
                            .map(
                                option => {

                                    const votes =
                                        Number(
                                            option.votes ||
                                            0
                                        );


                                    const percentage =
                                        totalVotes >
                                            0
                                            ? Math.round(
                                                (
                                                    votes /
                                                    totalVotes
                                                ) *
                                                100
                                            )
                                            : 0;


                                    return `
                                        <div
                                            class="admin-poll-preview-option"
                                        >

                                            <div
                                                class="admin-poll-preview-option-heading"
                                            >

                                                <strong>
                                                    ${escapeHtml(
                                                        option.label
                                                    )}
                                                </strong>

                                                <span>
                                                    ${votes} vote${
                                                        votes ===
                                                        1
                                                            ? ""
                                                            : "s"
                                                    }
                                                    ·
                                                    ${percentage} %
                                                </span>

                                            </div>

                                            <div
                                                class="admin-poll-preview-bar"
                                            >
                                                <span
                                                    style="width:${percentage}%"
                                                ></span>
                                            </div>

                                        </div>
                                    `;
                                }
                            )
                            .join(
                                ""
                            );
                }
            }


            updateDashboardStats();
        }


        /* =====================================================
           SONDAGE — MISE À JOUR APERÇU
        ====================================================== */

        if (
            pollQuestionInput
        ) {

            pollQuestionInput.addEventListener(
                "input",
                renderPoll
            );
        }


        if (
            pollStatusInput
        ) {

            pollStatusInput.addEventListener(
                "change",
                renderPoll
            );
        }


        /*
         * Le bouton manuel d'ajout d'option n'est plus utilisé.
         * On le masque si l'ancien HTML est encore présent.
         */
        if (
            pollAddOptionButton
        ) {

            pollAddOptionButton.hidden =
                true;
        }
                /* =====================================================
           SONDAGE — ENREGISTREMENT
        ====================================================== */

        if (
            pollForm
        ) {

            pollForm.addEventListener(
                "submit",
                async event => {

                    event.preventDefault();


                    /* =================================================
                       QUESTION
                    ================================================= */

                    const question =
                        normalizeText(
                            pollQuestionInput?.value
                        ) ||
                        "Quel jeu voulez-vous voir en stream ?";


                    /* =================================================
                       STATUT
                    ================================================= */

                    const status =
                        normalizeText(
                            pollStatusInput?.value
                        ) ||
                        "closed";


                    /* =================================================
                       JEUX ÉLIGIBLES
                    ================================================= */

                    const eligibleGames =
                        getPollEligibleGames();


                    /*
                     * Un sondage ouvert doit forcément
                     * avoir au moins deux jeux proposés.
                     */
                    if (
                        status ===
                            "open" &&
                        eligibleGames.length <
                            2
                    ) {

                        showToast(
                            "Il faut au moins deux jeux avec « Participer au sondage » activé pour ouvrir le sondage.",
                            "error"
                        );


                        return;
                    }


                    /* =================================================
                       BOUTON SUBMIT
                    ================================================= */

                    const submitButton =
                        pollForm.querySelector(
                            'button[type="submit"]'
                        );


                    const previousText =
                        submitButton
                            ?.textContent ||
                        "💾 Enregistrer le sondage";


                    if (
                        submitButton
                    ) {

                        submitButton.disabled =
                            true;


                        submitButton.textContent =
                            "Enregistrement...";
                    }


                    try {

                        /*
                         * Les options ne sont volontairement
                         * PAS envoyées ici.
                         *
                         * api/admin/poll.js récupère directement
                         * les jeux avec :
                         *
                         * poll_enabled = true
                         *
                         * et génère lui-même les options.
                         */
                        const data =
                            await adminApiRequest(
                                ADMIN_POLL_API,
                                {
                                    method:
                                        "PUT",

                                    body: {

                                        question,

                                        status

                                    }
                                }
                            );


                        poll =
                            normalizePoll(
                                data?.poll ??
                                data
                            );


                        renderPoll();

                        updateDashboardStats();


                        showToast(
                            status ===
                                "open"
                                ? "Le sondage est ouvert et visible publiquement."
                                : "Le sondage a bien été enregistré.",
                            "success"
                        );


                    } catch (
                        error
                    ) {

                        console.error(
                            "[Admin Poll Save]",
                            error
                        );


                        showToast(
                            error?.message ||
                            "Impossible d'enregistrer le sondage.",
                            "error"
                        );


                    } finally {

                        if (
                            submitButton
                        ) {

                            submitButton.disabled =
                                false;


                            submitButton.textContent =
                                previousText;
                        }
                    }
                }
            );
        }


        /* =====================================================
           SONDAGE — RÉINITIALISATION
        ====================================================== */

        if (
            pollResetButton
        ) {

            pollResetButton.addEventListener(
                "click",
                async () => {

                    const confirmed =
                        window.confirm(
                            "Réinitialiser le sondage ? Tous les votes actuels seront supprimés."
                        );


                    if (
                        !confirmed
                    ) {

                        return;
                    }


                    const previousText =
                        pollResetButton.textContent;


                    pollResetButton.disabled =
                        true;


                    pollResetButton.textContent =
                        "Réinitialisation...";


                    try {

                        const data =
                            await adminApiRequest(
                                ADMIN_POLL_API,
                                {
                                    method:
                                        "DELETE"
                                }
                            );


                        poll =
                            normalizePoll(
                                data?.poll ??
                                data
                            );


                        /*
                         * On remet le formulaire
                         * sur la version renvoyée
                         * par l'API.
                         */
                        if (
                            pollQuestionInput
                        ) {

                            pollQuestionInput.value =
                                poll?.question ||
                                "Quel jeu voulez-vous voir en stream ?";
                        }


                        if (
                            pollStatusInput
                        ) {

                            pollStatusInput.value =
                                poll?.status ||
                                "closed";
                        }


                        renderPoll();

                        updateDashboardStats();


                        showToast(
                            "Le sondage et tous ses votes ont été réinitialisés.",
                            "success"
                        );


                    } catch (
                        error
                    ) {

                        console.error(
                            "[Admin Poll Reset]",
                            error
                        );


                        showToast(
                            error?.message ||
                            "Impossible de réinitialiser le sondage.",
                            "error"
                        );


                    } finally {

                        pollResetButton.disabled =
                            false;


                        pollResetButton.textContent =
                            previousText;
                    }
                }
            );
        }


        /* =====================================================
           SYNCHRONISATION SONDAGE
        ====================================================== */

        /*
         * Cette fonction permet de rafraîchir
         * rapidement le sondage lorsque les jeux
         * changent.
         */
        async function refreshPollFromGames() {

            try {

                await loadPoll();


            } catch (
                error
            ) {

                console.error(
                    "[Admin Poll Refresh]",
                    error
                );
            }
        }


        /* =====================================================
           RACCOURCI CLAVIER — ÉCHAP
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


                if (
                    gameFormPanel &&
                    !gameFormPanel.hidden
                ) {

                    closeGameForm();
                }


                if (
                    artworkFormPanel &&
                    !artworkFormPanel.hidden
                ) {

                    closeArtworkForm();
                }
            }
        );


        /* =====================================================
           INITIALISATION — SECTION
        ====================================================== */

        function getInitialSection() {

            const hash =
                normalizeText(
                    window.location.hash
                        .replace(
                            "#",
                            ""
                        )
                );


            const allowedSections =
                new Set([
                    "dashboard",
                    "games",
                    "gallery",
                    "poll"
                ]);


            if (
                allowedSections.has(
                    hash
                )
            ) {

                return hash;
            }


            return "dashboard";
        }


        /* =====================================================
           INITIALISATION — AUTH
        ====================================================== */

        currentAdminUser =
            await checkAdminAuthentication();


        /*
         * Si aucune session valide,
         * checkAdminAuthentication a déjà
         * redirigé ou affiché une erreur.
         */
        if (
            !currentAdminUser
        ) {

            return;
        }


        /* =====================================================
           UTILISATEUR ADMIN
        ====================================================== */

        applyAdminUser(
            currentAdminUser
        );


        createLogoutButton();


        /* =====================================================
           FORMULAIRES
        ====================================================== */

        resetGameForm();

        resetArtworkForm();


        if (
            gameFormPanel
        ) {

            gameFormPanel.hidden =
                true;
        }


        if (
            artworkFormPanel
        ) {

            artworkFormPanel.hidden =
                true;
        }


        /* =====================================================
           SECTION INITIALE
        ====================================================== */

        openSection(
            getInitialSection()
        );


        /* =====================================================
           CHARGEMENT INITIAL
        ====================================================== */

        try {

            /*
             * On charge d'abord les jeux.
             *
             * C'est important car renderPoll()
             * utilise games pour savoir quels jeux
             * ont pollEnabled = true.
             */
            await loadGames();


            /*
             * Galerie indépendante.
             */
            await loadArtworks();


            /*
             * Puis seulement le sondage.
             *
             * Ainsi les options automatiques
             * peuvent être construites immédiatement.
             */
            await loadPoll();


        } catch (
            error
        ) {

            console.error(
                "[Admin Init]",
                error
            );


            showToast(
                "Une partie de l'administration n'a pas pu être chargée.",
                "error"
            );
        }


        /* =====================================================
           STATISTIQUES FINALES
        ====================================================== */

        updateDashboardStats();


        /* =====================================================
           HASH — NAVIGATION NAVIGATEUR
        ====================================================== */

        window.addEventListener(
            "hashchange",
            () => {

                const section =
                    getInitialSection();


                const activeButton =
                    navButtons.find(
                        button =>
                            button.dataset
                                .adminSection ===
                            section
                    );


                if (
                    activeButton &&
                    !activeButton.classList.contains(
                        "is-active"
                    )
                ) {

                    openSection(
                        section
                    );
                }
            }
        );


        /* =====================================================
           EXPOSITION DEBUG
        ====================================================== */

        /*
         * Pratique dans la console navigateur :
         *
         * CouaxiaAdmin.reloadGames()
         * CouaxiaAdmin.reloadGallery()
         * CouaxiaAdmin.reloadPoll()
         */
        window.CouaxiaAdmin = {

            reloadGames:
                loadGames,

            reloadGallery:
                loadArtworks,

            reloadPoll:
                loadPoll,

            refreshPollFromGames,

            getGames() {

                return [
                    ...games
                ];
            },

            getArtworks() {

                return [
                    ...artworks
                ];
            },

            getPoll() {

                return poll
                    ? {
                        ...poll,

                        options:
                            Array.isArray(
                                poll.options
                            )
                                ? poll.options.map(
                                    option => ({
                                        ...option
                                    })
                                )
                                : []
                    }
                    : null;
            }

        };


        /* =====================================================
           FIN INITIALISATION
        ====================================================== */

        console.info(
            "[Couaxia Admin] Administration chargée."
        );


        console.info(
            `[Couaxia Admin] ${games.length} jeu(x).`
        );


        console.info(
            `[Couaxia Admin] ${artworks.length} illustration(s).`
        );


        console.info(
            `[Couaxia Admin] Sondage : ${
                poll?.status ||
                "closed"
            }.`
        );

    }
);