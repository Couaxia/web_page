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

        /*
         * Aperçu vidéo.
         *
         * Cette balise doit être présente dans admin.html :
         *
         * <video
         *     id="admin-artwork-preview-video"
         *     muted
         *     loop
         *     controls
         *     playsinline
         *     hidden
         * ></video>
         */
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
                        : 0;


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
                        game?.name
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
           JEUX — APERÇU TWITCH
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

            const gameId =
                normalizeText(
                    twitchGameIdInput?.value
                );


            if (
                !gameId
            ) {

                showToast(
                    "Entre d'abord l'ID Twitch du jeu.",
                    "error"
                );

                return;
            }


            if (
                twitchPreviewButton
            ) {

                twitchPreviewButton.disabled =
                    true;

                twitchPreviewButton.textContent =
                    "Chargement...";
            }


            try {

                const response =
                    await fetch(
                        `${TWITCH_GAME_API}?id=${encodeURIComponent(
                            gameId
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
                        "Jeu Twitch introuvable."
                    );
                }


                const game =
                    data.game;


                if (
                    twitchPreviewCover
                ) {

                    twitchPreviewCover.src =
                        game.boxArtUrl ||
                        "";

                    twitchPreviewCover.alt =
                        game.name
                            ? `Jaquette de ${game.name}`
                            : "";
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
                        game.id ||
                        gameId;
                }


                if (
                    twitchResult
                ) {

                    twitchResult.hidden =
                        false;
                }


                showToast(
                    "Jeu Twitch trouvé.",
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
                    error.message ||
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

                    twitchGameIdInput?.focus();

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

            openGameForm();


            if (
                gameIdInput
            ) {

                gameIdInput.value =
                    game.id;
            }


            if (
                twitchGameIdInput
            ) {

                twitchGameIdInput.value =
                    game.twitchGameId;
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
                    game.tags.join(
                        ", "
                    );
            }


            if (
                descriptionInput
            ) {

                descriptionInput.value =
                    game.description;
            }


            if (
                ratingInput
            ) {

                ratingInput.value =
                    game.rating ||
                    "";
            }


            if (
                youtubeInput
            ) {

                youtubeInput.value =
                    game.youtubePlaylist;
            }


            if (
                pollInput
            ) {

                pollInput.checked =
                    game.pollEnabled;
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

                twitchPreviewCover.src =
                    game.boxArtUrl ||
                    "";

                twitchPreviewCover.alt =
                    game.name
                        ? `Jaquette de ${game.name}`
                        : "";
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

                    const twitchGameId =
                        normalizeText(
                            twitchGameIdInput?.value
                        );


                    if (
                        !twitchGameId
                    ) {

                        showToast(
                            "L'ID Twitch du jeu est obligatoire.",
                            "error"
                        );

                        twitchGameIdInput?.focus();

                        return;
                    }


                    const payload = {

                        twitchGameId,

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
                            Number(
                                ratingInput?.value ||
                                0
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
                                `${ADMIN_GAMES_API}?id=${encodeURIComponent(
                                    existingId
                                )}`,
                                {
                                    method:
                                        "PUT",

                                    body:
                                        payload
                                }
                            );


                            showToast(
                                "Le jeu a bien été modifié.",
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
                                "Le jeu a bien été ajouté.",
                                "success"
                            );
                        }


                        closeGameForm();

                        await loadGames();


                    } catch (
                        error
                    ) {

                        console.error(
                            "[Admin Game Save]",
                            error
                        );


                        showToast(
                            error.message ||
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

            const game =
                games.find(
                    item =>
                        item.id ===
                        gameId
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
                    `${ADMIN_GAMES_API}?id=${encodeURIComponent(
                        gameId
                    )}`,
                    {
                        method:
                            "DELETE"
                    }
                );


                showToast(
                    `"${gameName}" a été supprimé.`,
                    "success"
                );


                await loadGames();


            } catch (
                error
            ) {

                console.error(
                    "[Admin Game Delete]",
                    error
                );


                showToast(
                    error.message ||
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


        /* =====================================================
   ARTWORKS — AFFICHAGE
====================================================== */

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


    const filteredArtworks =
        artworks
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
                            ...artwork.tags
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
                    a.sortOrder -
                    b.sortOrder
            );


    /* =================================================
       AUCUNE ŒUVRE
    ================================================= */

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
                    Ajoute ta première œuvre depuis
                    l'administration.
                </p>

            </div>
        `;


        return;
    }


    /* =================================================
       CARTES
    ================================================= */

    artworksList.innerHTML =
        filteredArtworks
            .map(
                artwork => {

                    /* =====================================
                       TAGS
                    ====================================== */

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


                    /* =====================================
                       VISIBILITÉ
                    ====================================== */

                    const visibilityLabel =
                        artwork.visible
                            ? "👁️ Visible"
                            : "🙈 Masquée";


                    /* =====================================
                       SENSIBLE
                    ====================================== */

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


                    /* =====================================
                       FAVORIS
                    ====================================== */

                    const favoriteLabel =
                        artwork.favoriteEnabled
                            ? `
                                <span
                                    class="admin-artwork-status"
                                >
                                    ❤️ Favoris
                                </span>
                            `
                            : "";


                    /* =====================================
                       RETOUR CARTE
                    ====================================== */

                    return `
                        <article
                            class="admin-list-item"
                            data-artwork-id="${escapeHtml(
                                artwork.id
                            )}"
                        >

                            <div
                                class="admin-list-thumb"
                            >
                                ${createArtworkMediaHtml(
                                    artwork
                                )}
                            </div>


                            <div
                                class="admin-list-content"
                            >

                                <div
                                    class="admin-list-heading"
                                >

                                    <div
                                        class="admin-artwork-main-info"
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
                                                ${visibilityLabel}
                                            </span>


                                            ${sensitiveLabel}

                                            ${favoriteLabel}

                                        </div>

                                    </div>


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


                                <div
                                    class="admin-artwork-tags"
                                >
                                    ${tags}
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
       MODIFIER
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
                                    item.id ===
                                    button.dataset
                                        .editArtwork
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
       SUPPRIMER
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

                artworkPreviewVideo.pause();

                artworkPreviewVideo.hidden =
                    true;

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

            hideArtworkPreviewMedia();


            if (
                !url
            ) {

                if (
                    artworkUploadPreview
                ) {

                    artworkUploadPreview.hidden =
                        true;
                }

                return;
            }


            const isVideo =
                mediaType ===
                    "video" ||
                /\.(mp4|webm)(?:$|\?)/i.test(
                    url
                );


            if (
                isVideo
            ) {

                if (
                    artworkPreviewVideo
                ) {

                    artworkPreviewVideo.src =
                        url;

                    artworkPreviewVideo.hidden =
                        false;

                    artworkPreviewVideo.load();

                    artworkPreviewVideo
                        .play()
                        .catch(
                            () => {
                                /* autoplay non disponible */
                            }
                        );
                }

            } else {

                if (
                    artworkPreviewImage
                ) {

                    artworkPreviewImage.src =
                        url;

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

        async function uploadSelectedArtworkFile() {

    if (
        !selectedArtworkFile
    ) {

        return null;
    }


    validateArtworkFile(
        selectedArtworkFile
    );


    const artId =
        normalizeText(
            artworkArtIdInput?.value
        );


    if (
        !artId
    ) {

        throw new Error(
            "L'ID de l'œuvre est obligatoire avant l'upload."
        );
    }


    /* =====================================================
       1 — DEMANDE D'URL SIGNÉE À TON API
    ====================================================== */

    const signature =
        await adminApiRequest(
            ADMIN_GALLERY_UPLOAD_API,
            {
                method:
                    "POST",

                body: {

                    artId,

                    filename:
                        selectedArtworkFile.name,

                    mimeType:
                        selectedArtworkFile.type,

                    fileSize:
                        selectedArtworkFile.size
                }
            }
        );


    const upload =
        signature?.upload;


    if (
        !upload
    ) {

        throw new Error(
            "La préparation de l'upload a échoué."
        );
    }


    if (
        !upload.signedUrl
    ) {

        throw new Error(
            "L'URL d'upload Supabase est absente."
        );
    }


    if (
        !upload.publicUrl
    ) {

        throw new Error(
            "L'URL publique du fichier est absente."
        );
    }


    /* =====================================================
       2 — ENVOI DIRECT DU FICHIER À SUPABASE
    ====================================================== */

    const formData =
        new FormData();


    formData.append(
        "cacheControl",
        "3600"
    );


    formData.append(
        "",
        selectedArtworkFile,
        selectedArtworkFile.name
    );


    let uploadResponse;


    try {

        uploadResponse =
            await fetch(
                upload.signedUrl,
                {
                    method:
                        "PUT",

                    body:
                        formData
                }
            );


    } catch (
        error
    ) {

        console.error(
            "[Artwork Direct Upload]",
            error
        );


        throw new Error(
            "Impossible de contacter Supabase Storage."
        );
    }


    /* =====================================================
       3 — ERREUR SUPABASE
    ====================================================== */

    if (
        !uploadResponse.ok
    ) {

        let errorData =
            null;


        try {

            errorData =
                await uploadResponse
                    .json();

        } catch {

            errorData =
                null;
        }


        console.error(
            "[Artwork Direct Upload] Supabase :",
            {
                status:
                    uploadResponse.status,

                statusText:
                    uploadResponse.statusText,

                data:
                    errorData
            }
        );


        throw new Error(
            errorData?.message ||
            errorData?.error ||
            `Erreur Supabase (${uploadResponse.status}).`
        );
    }


    /* =====================================================
       4 — RETOUR
    ====================================================== */

    return {

        url:
            upload.publicUrl,

        mediaType:
            upload.mediaType ||
            (
                selectedArtworkFile.type
                    .startsWith(
                        "video/"
                    )
                    ? "video"
                    : "image"
            ),

        path:
            upload.path,

        bucket:
            upload.bucket,

        filename:
            upload.filename ||
            selectedArtworkFile.name

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
                artworkSensitiveInput
            ) {

                artworkSensitiveInput.checked =
                    false;
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

                    artworkArtIdInput?.focus();

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
                        artwork.sortOrder
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
                    artwork.mediaType;
            }


            if (
                artworkTagsInput
            ) {

                artworkTagsInput.value =
                    artwork.tags.join(
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
                    artwork.imageMessages.join(
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
                    artwork.buttonText;
            }


            if (
                artworkButtonMessagesInput
            ) {

                artworkButtonMessagesInput.value =
                    artwork.buttonMessages.join(
                        " | "
                    );
            }


            if (
                artworkSensitiveInput
            ) {

                artworkSensitiveInput.checked =
                    artwork.sensitive;
            }


            if (
                artworkFavoriteInput
            ) {

                artworkFavoriteInput.checked =
                    artwork.favoriteEnabled;
            }


            if (
                artworkVisibleInput
            ) {

                artworkVisibleInput.checked =
                    artwork.visible;
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


                if (
                    artworkFileName
                ) {

                    artworkFileName.textContent =
                        "Média actuel";
                }


                if (
                    artworkFileSize
                ) {

                    artworkFileSize.textContent =
                        "";
                }
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
        }        /* =====================================================
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


                    const artId =
                        normalizeText(
                            artworkArtIdInput?.value
                        );


                    const artist =
                        normalizeText(
                            artworkArtistInput?.value
                        );


                    if (
                        !artId
                    ) {

                        showToast(
                            "L'identifiant de l'illustration est obligatoire.",
                            "error"
                        );

                        artworkArtIdInput?.focus();

                        return;
                    }


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
                         * Si un nouveau fichier a été choisi,
                         * on l'envoie d'abord sur le serveur.
                         */
                        if (
                            selectedArtworkFile
                        ) {

                            const uploadResult =
                                await uploadSelectedArtworkFile();


                            if (
                                uploadResult
                            ) {

                                imageUrl =
                                    uploadResult.url;

                                mediaType =
                                    uploadResult.mediaType;


                                if (
                                    artworkImageUrlInput
                                ) {

                                    artworkImageUrlInput.value =
                                        imageUrl;
                                }


                                if (
                                    artworkMediaTypeInput
                                ) {

                                    artworkMediaTypeInput.value =
                                        mediaType;
                                }
                            }
                        }


                        if (
                            !imageUrl
                        ) {

                            throw new Error(
                                "Ajoute une image, une vidéo ou une URL de média."
                            );
                        }


                        const payload = {

                            artId,

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
                                `${ADMIN_GALLERY_API}?id=${encodeURIComponent(
                                    existingId
                                )}`,
                                {
                                    method:
                                        "PUT",

                                    body:
                                        payload
                                }
                            );


                            showToast(
                                "L'illustration a bien été modifiée.",
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
                                "L'illustration a bien été ajoutée.",
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
                            error.message ||
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

            const artwork =
                artworks.find(
                    item =>
                        item.id ===
                        artworkId
                );


            const artworkName =
                artwork?.artist
                    ? `l'illustration de ${artwork.artist}`
                    : "cette illustration";


            const confirmed =
                window.confirm(
                    `Supprimer définitivement ${artworkName} ?`
                );


            if (
                !confirmed
            ) {

                return;
            }


            try {

                await adminApiRequest(
                    `${ADMIN_GALLERY_API}?id=${encodeURIComponent(
                        artworkId
                    )}`,
                    {
                        method:
                            "DELETE"
                    }
                );


                showToast(
                    "L'illustration a été supprimée.",
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
                    error.message ||
                    "Impossible de supprimer l'illustration.",
                    "error"
                );
            }
        }


        /* =====================================================
           ARTWORKS — URL MANUELLE
        ====================================================== */

        if (
            artworkImageUrlInput
        ) {

            artworkImageUrlInput.addEventListener(
                "input",
                () => {

                    /*
                     * Un fichier local sélectionné reste prioritaire
                     * tant qu'il n'a pas été retiré.
                     */
                    if (
                        selectedArtworkFile
                    ) {

                        return;
                    }


                    const url =
                        normalizeText(
                            artworkImageUrlInput.value
                        );


                    if (
                        !url
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


                    const mediaType =
                        /\.(mp4|webm)(?:$|\?)/i.test(
                            url
                        )
                            ? "video"
                            : (
                                normalizeText(
                                    artworkMediaTypeInput?.value
                                ) ||
                                "image"
                            );


                    if (
                        artworkMediaTypeInput
                    ) {

                        artworkMediaTypeInput.value =
                            mediaType;
                    }


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


                    const url =
                        normalizeText(
                            artworkImageUrlInput?.value
                        );


                    if (
                        url
                    ) {

                        showArtworkPreviewFromUrl(
                            url,
                            artworkMediaTypeInput.value
                        );
                    }
                }
            );
        }


        /* =====================================================
           SONDAGE — NORMALISATION
        ====================================================== */

        function normalizePoll(
            pollData
        ) {

            if (
                !pollData ||
                typeof pollData !==
                    "object"
            ) {

                return {

                    question:
                        "",

                    status:
                        "closed",

                    options:
                        []

                };
            }


            return {

                id:
                    normalizeText(
                        pollData?.id
                    ),

                question:
                    normalizeText(
                        pollData?.question
                    ),

                status:
                    normalizeText(
                        pollData?.status
                    ) ||
                    "closed",

                options:
                    Array.isArray(
                        pollData?.options
                    )
                        ? pollData.options
                            .map(
                                (
                                    option,
                                    index
                                ) => ({

                                    id:
                                        normalizeText(
                                            option?.id
                                        ) ||
                                        String(
                                            index + 1
                                        ),

                                    label:
                                        normalizeText(
                                            option?.label ??
                                            option?.name ??
                                            option?.text
                                        ),

                                    votes:
                                        Number(
                                            option?.votes ||
                                            0
                                        )

                                })
                            )
                            .filter(
                                option =>
                                    Boolean(
                                        option.label
                                    )
                            )
                        : [],

                createdAt:
                    pollData?.createdAt ??
                    pollData?.created_at ??
                    null,

                updatedAt:
                    pollData?.updatedAt ??
                    pollData?.updated_at ??
                    null

            };
        }


        /* =====================================================
           SONDAGE — API
        ====================================================== */

        async function loadPoll() {

            try {

                const data =
                    await adminApiRequest(
                        "/api/admin/poll",
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


                fillPollForm();

                renderPollPreview();

                updateDashboardStats();


            } catch (
                error
            ) {

                console.error(
                    "[Admin Poll]",
                    error
                );


                poll =
                    normalizePoll(
                        null
                    );


                fillPollForm();

                renderPollPreview();

                updateDashboardStats();


                showToast(
                    error.message ||
                    "Impossible de charger le sondage.",
                    "error"
                );
            }
        }


        /* =====================================================
           SONDAGE — OPTIONS DU FORMULAIRE
        ====================================================== */

        function createPollOptionRow(
            option = {},
            index = 0
        ) {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "admin-poll-option-row";


            const input =
                document.createElement(
                    "input"
                );


            input.type =
                "text";

            input.className =
                "admin-input admin-poll-option-input";

            input.placeholder =
                `Option ${index + 1}`;

            input.value =
                normalizeText(
                    option?.label ??
                    option?.name ??
                    option?.text
                );

            input.maxLength =
                120;


            const votes =
                document.createElement(
                    "span"
                );


            votes.className =
                "admin-poll-option-votes";

            votes.textContent =
                `${Number(
                    option?.votes ||
                    0
                )} vote${
                    Number(
                        option?.votes ||
                        0
                    ) > 1
                        ? "s"
                        : ""
                }`;


            const removeButton =
                document.createElement(
                    "button"
                );


            removeButton.type =
                "button";

            removeButton.className =
                "admin-danger-button admin-poll-option-remove";

            removeButton.textContent =
                "✕";

            removeButton.title =
                "Supprimer cette option";

            removeButton.setAttribute(
                "aria-label",
                "Supprimer cette option"
            );


            removeButton.addEventListener(
                "click",
                () => {

                    row.remove();

                    renumberPollOptions();

                    renderPollPreviewFromForm();
                }
            );


            input.addEventListener(
                "input",
                renderPollPreviewFromForm
            );


            row.append(
                input,
                votes,
                removeButton
            );


            return row;
        }


        function renumberPollOptions() {

            if (
                !pollOptionsList
            ) {

                return;
            }


            const rows =
                Array.from(
                    pollOptionsList.querySelectorAll(
                        ".admin-poll-option-row"
                    )
                );


            rows.forEach(
                (
                    row,
                    index
                ) => {

                    const input =
                        row.querySelector(
                            ".admin-poll-option-input"
                        );


                    if (
                        input
                    ) {

                        input.placeholder =
                            `Option ${index + 1}`;
                    }
                }
            );
        }


        function getPollOptionsFromForm() {

            if (
                !pollOptionsList
            ) {

                return [];
            }


            return Array.from(
                pollOptionsList.querySelectorAll(
                    ".admin-poll-option-input"
                )
            )
                .map(
                    input =>
                        normalizeText(
                            input.value
                        )
                )
                .filter(
                    Boolean
                );
        }


        function addPollOption(
            option = {}
        ) {

            if (
                !pollOptionsList
            ) {

                return;
            }


            const currentRows =
                pollOptionsList.querySelectorAll(
                    ".admin-poll-option-row"
                );


            /*
             * Limite volontaire pour éviter un sondage
             * avec trop d'options côté interface.
             */
            if (
                currentRows.length >=
                10
            ) {

                showToast(
                    "Le sondage peut contenir au maximum 10 options.",
                    "error"
                );

                return;
            }


            const row =
                createPollOptionRow(
                    option,
                    currentRows.length
                );


            pollOptionsList.appendChild(
                row
            );


            renumberPollOptions();


            const input =
                row.querySelector(
                    ".admin-poll-option-input"
                );


            if (
                !normalizeText(
                    option?.label ??
                    option?.name ??
                    option?.text
                )
            ) {

                input?.focus();
            }


            renderPollPreviewFromForm();
        }


        if (
            pollAddOptionButton
        ) {

            pollAddOptionButton.addEventListener(
                "click",
                () => {

                    addPollOption();
                }
            );
        }


        /* =====================================================
           SONDAGE — REMPLISSAGE FORMULAIRE
        ====================================================== */

        function fillPollForm() {

            if (
                pollQuestionInput
            ) {

                pollQuestionInput.value =
                    poll?.question ||
                    "";
            }


            if (
                pollStatusInput
            ) {

                pollStatusInput.value =
                    poll?.status ||
                    "closed";
            }


            if (
                pollOptionsList
            ) {

                pollOptionsList.innerHTML =
                    "";


                const options =
                    Array.isArray(
                        poll?.options
                    )
                        ? poll.options
                        : [];


                if (
                    options.length >
                    0
                ) {

                    options.forEach(
                        option => {

                            addPollOption(
                                option
                            );
                        }
                    );

                } else {

                    addPollOption();

                    addPollOption();
                }
            }
        }


        /* =====================================================
           SONDAGE — APERÇU
        ====================================================== */

        function renderPollPreview() {

            if (
                pollPreviewQuestion
            ) {

                pollPreviewQuestion.textContent =
                    poll?.question ||
                    "Aucune question définie";
            }


            if (
                !pollPreviewOptions
            ) {

                return;
            }


            const options =
                Array.isArray(
                    poll?.options
                )
                    ? poll.options
                    : [];


            if (
                options.length ===
                0
            ) {

                pollPreviewOptions.innerHTML = `
                    <p class="admin-empty-text">
                        Aucune option définie.
                    </p>
                `;

                return;
            }


            const maxVotes =
                Math.max(
                    1,
                    ...options.map(
                        option =>
                            Number(
                                option.votes ||
                                0
                            )
                    )
                );


            pollPreviewOptions.innerHTML =
                options
                    .map(
                        option => {

                            const votes =
                                Number(
                                    option.votes ||
                                    0
                                );


                            const percentage =
                                Math.round(
                                    (
                                        votes /
                                        maxVotes
                                    ) *
                                    100
                                );


                            return `
                                <div class="admin-poll-preview-option">

                                    <div class="admin-poll-preview-option-header">

                                        <span>
                                            ${escapeHtml(
                                                option.label
                                            )}
                                        </span>

                                        <strong>
                                            ${votes}
                                        </strong>

                                    </div>

                                    <div
                                        class="admin-poll-preview-bar"
                                        aria-hidden="true"
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


        function renderPollPreviewFromForm() {

            const question =
                normalizeText(
                    pollQuestionInput?.value
                );


            const options =
                getPollOptionsFromForm();


            if (
                pollPreviewQuestion
            ) {

                pollPreviewQuestion.textContent =
                    question ||
                    "Aucune question définie";
            }


            if (
                !pollPreviewOptions
            ) {

                return;
            }


            if (
                options.length ===
                0
            ) {

                pollPreviewOptions.innerHTML = `
                    <p class="admin-empty-text">
                        Aucune option définie.
                    </p>
                `;

                return;
            }


            pollPreviewOptions.innerHTML =
                options
                    .map(
                        option => `
                            <div class="admin-poll-preview-option">

                                <div class="admin-poll-preview-option-header">

                                    <span>
                                        ${escapeHtml(
                                            option
                                        )}
                                    </span>

                                    <strong>
                                        0
                                    </strong>

                                </div>

                                <div
                                    class="admin-poll-preview-bar"
                                    aria-hidden="true"
                                >
                                    <span
                                        style="width:0%"
                                    ></span>
                                </div>

                            </div>
                        `
                    )
                    .join(
                        ""
                    );
        }


        if (
            pollQuestionInput
        ) {

            pollQuestionInput.addEventListener(
                "input",
                renderPollPreviewFromForm
            );
        }


        if (
            pollStatusInput
        ) {

            pollStatusInput.addEventListener(
                "change",
                renderPollPreviewFromForm
            );
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


                    const question =
                        normalizeText(
                            pollQuestionInput?.value
                        );


                    const status =
                        normalizeText(
                            pollStatusInput?.value
                        ) ||
                        "closed";


                    const options =
                        getPollOptionsFromForm();


                    if (
                        !question
                    ) {

                        showToast(
                            "La question du sondage est obligatoire.",
                            "error"
                        );

                        pollQuestionInput?.focus();

                        return;
                    }


                    if (
                        options.length <
                        2
                    ) {

                        showToast(
                            "Ajoute au moins deux options au sondage.",
                            "error"
                        );

                        return;
                    }


                    /*
                     * Vérifie qu'il n'y a pas deux options
                     * identiques, même avec une casse différente.
                     */
                    const normalizedOptionLabels =
                        options.map(
                            option =>
                                option.toLowerCase()
                        );


                    const uniqueOptionLabels =
                        new Set(
                            normalizedOptionLabels
                        );


                    if (
                        uniqueOptionLabels.size !==
                        normalizedOptionLabels.length
                    ) {

                        showToast(
                            "Deux options du sondage ne peuvent pas être identiques.",
                            "error"
                        );

                        return;
                    }


                    const existingOptions =
                        Array.isArray(
                            poll?.options
                        )
                            ? poll.options
                            : [];


                    /*
                     * On conserve l'ID et le nombre de votes
                     * d'une option existante lorsque son libellé
                     * n'a pas changé.
                     */
                    const pollOptions =
                        options.map(
                            (
                                label,
                                index
                            ) => {

                                const existingOption =
                                    existingOptions.find(
                                        option =>
                                            normalizeText(
                                                option.label
                                            ).toLowerCase() ===
                                            label.toLowerCase()
                                    );


                                return {

                                    id:
                                        existingOption?.id ||
                                        String(
                                            index + 1
                                        ),

                                    label,

                                    votes:
                                        Number(
                                            existingOption?.votes ||
                                            0
                                        )

                                };
                            }
                        );


                    const payload = {

                        question,

                        status,

                        options:
                            pollOptions

                    };


                    const submitButton =
                        pollForm.querySelector(
                            'button[type="submit"]'
                        );


                    if (
                        submitButton
                    ) {

                        submitButton.disabled =
                            true;

                        submitButton.textContent =
                            "Enregistrement...";
                    }


                    try {

                        const data =
                            await adminApiRequest(
                                "/api/admin/poll",
                                {
                                    method:
                                        "PUT",

                                    body:
                                        payload
                                }
                            );


                        poll =
                            normalizePoll(
                                data?.poll ??
                                {
                                    ...payload,

                                    id:
                                        poll?.id,

                                    createdAt:
                                        poll?.createdAt,

                                    updatedAt:
                                        new Date()
                                            .toISOString()
                                }
                            );


                        fillPollForm();

                        renderPollPreview();

                        updateDashboardStats();


                        showToast(
                            "Le sondage a bien été enregistré.",
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
                            error.message ||
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
                                "💾 Enregistrer le sondage";
                        }
                    }
                }
            );
        }


        /* =====================================================
           SONDAGE — RÉINITIALISATION
        ====================================================== */

        async function resetPoll() {

            const confirmed =
                window.confirm(
                    "Réinitialiser complètement le sondage et supprimer tous les votes ?"
                );


            if (
                !confirmed
            ) {

                return;
            }


            if (
                pollResetButton
            ) {

                pollResetButton.disabled =
                    true;

                pollResetButton.textContent =
                    "Réinitialisation...";
            }


            try {

                const data =
                    await adminApiRequest(
                        "/api/admin/poll",
                        {
                            method:
                                "DELETE"
                        }
                    );


                poll =
                    normalizePoll(
                        data?.poll ??
                        null
                    );


                fillPollForm();

                renderPollPreview();

                updateDashboardStats();


                showToast(
                    "Le sondage a été réinitialisé.",
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
                    error.message ||
                    "Impossible de réinitialiser le sondage.",
                    "error"
                );


            } finally {

                if (
                    pollResetButton
                ) {

                    pollResetButton.disabled =
                        false;

                    pollResetButton.textContent =
                        "🗑️ Réinitialiser";
                }
            }
        }


        if (
            pollResetButton
        ) {

            pollResetButton.addEventListener(
                "click",
                resetPoll
            );
        }


        /* =====================================================
           RACCOURCIS CLAVIER — FORMULAIRES
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


                /*
                 * Ferme en priorité le formulaire
                 * d'illustration s'il est ouvert.
                 */
                if (
                    artworkFormPanel &&
                    !artworkFormPanel.hidden
                ) {

                    closeArtworkForm();

                    return;
                }


                /*
                 * Sinon ferme le formulaire de jeu.
                 */
                if (
                    gameFormPanel &&
                    !gameFormPanel.hidden
                ) {

                    closeGameForm();
                }
            }
        );


        /* =====================================================
           RAFRAÎCHISSEMENT APRÈS RETOUR SUR L'ONGLET
        ====================================================== */

        document.addEventListener(
            "visibilitychange",
            async () => {

                if (
                    document.visibilityState !==
                    "visible"
                ) {

                    return;
                }


                try {

                    await Promise.all([
                        loadGames(),
                        loadArtworks(),
                        loadPoll()
                    ]);


                } catch (
                    error
                ) {

                    console.error(
                        "[Admin Refresh]",
                        error
                    );
                }
            }
        );


        /* =====================================================
           GESTION DES ERREURS D'IMAGES
        ====================================================== */

        document.addEventListener(
            "error",
            event => {

                const target =
                    event.target;


                if (
                    !target ||
                    target.tagName !==
                    "IMG"
                ) {

                    return;
                }


                /*
                 * Empêche de remplacer plusieurs fois
                 * la même image en erreur.
                 */
                if (
                    target.dataset
                        .adminImageErrorHandled ===
                    "true"
                ) {

                    return;
                }


                target.dataset
                    .adminImageErrorHandled =
                    "true";


                /*
                 * Pour l'avatar administrateur,
                 * on masque simplement l'image si Twitch
                 * ne fournit plus l'URL.
                 */
                if (
                    target ===
                    adminUserAvatar
                ) {

                    target.hidden =
                        true;

                    return;
                }


                /*
                 * Pour les miniatures des listes,
                 * on affiche un placeholder.
                 */
                const thumbnail =
                    target.closest(
                        ".admin-list-thumb"
                    );


                if (
                    thumbnail
                ) {

                    target.remove();


                    const placeholder =
                        document.createElement(
                            "div"
                        );


                    placeholder.className =
                        "admin-item-placeholder";

                    placeholder.setAttribute(
                        "aria-hidden",
                        "true"
                    );


                    placeholder.textContent =
                        "🖼️";


                    thumbnail.appendChild(
                        placeholder
                    );
                }
            },
            true
        );


        /* =====================================================
           GESTION DES ERREURS VIDÉO
        ====================================================== */

        document.addEventListener(
            "error",
            event => {

                const target =
                    event.target;


                if (
                    !target ||
                    target.tagName !==
                    "VIDEO"
                ) {

                    return;
                }


                if (
                    target.dataset
                        .adminVideoErrorHandled ===
                    "true"
                ) {

                    return;
                }


                target.dataset
                    .adminVideoErrorHandled =
                    "true";


                const thumbnail =
                    target.closest(
                        ".admin-list-thumb"
                    );


                if (
                    thumbnail
                ) {

                    target.remove();


                    const placeholder =
                        document.createElement(
                            "div"
                        );


                    placeholder.className =
                        "admin-item-placeholder";

                    placeholder.setAttribute(
                        "aria-hidden",
                        "true"
                    );


                    placeholder.textContent =
                        "🎬";


                    thumbnail.appendChild(
                        placeholder
                    );
                }
            },
            true
        );


        /* =====================================================
           SYNCHRONISATION DE L'URL
        ====================================================== */

        window.addEventListener(
            "hashchange",
            () => {

                const requestedSection =
                    normalizeText(
                        window.location.hash
                            .replace(
                                /^#/,
                                ""
                            )
                    );


                const sectionExists =
                    sections.some(
                        section =>
                            section.dataset
                                .adminPanel ===
                            requestedSection
                    );


                openSection(
                    sectionExists
                        ? requestedSection
                        : "dashboard"
                );
            }
        );


        /* =====================================================
           SECTION INITIALE
        ====================================================== */

        function openInitialSection() {

            const requestedSection =
                normalizeText(
                    window.location.hash
                        .replace(
                            /^#/,
                            ""
                        )
                );


            const sectionExists =
                sections.some(
                    section =>
                        section.dataset
                            .adminPanel ===
                        requestedSection
                );


            openSection(
                sectionExists
                    ? requestedSection
                    : "dashboard"
            );
        }


        /* =====================================================
           ÉTAT DE CHARGEMENT INITIAL
        ====================================================== */

        function setInitialLoadingState(
            loading
        ) {

            const interactiveElements =
                [
                    newGameButton,
                    newArtworkButton,
                    pollAddOptionButton,
                    pollResetButton
                ]
                    .filter(
                        Boolean
                    );


            interactiveElements.forEach(
                element => {

                    element.disabled =
                        Boolean(
                            loading
                        );
                }
            );


            document.body.classList.toggle(
                "admin-is-loading",
                Boolean(
                    loading
                )
            );
        }


        /* =====================================================
           INITIALISATION — PRÉPARATION
        ====================================================== */

        setInitialLoadingState(
            true
        );


        /*
         * On masque les formulaires au chargement.
         * Ils seront ouverts uniquement lorsque l'administratrice
         * clique sur le bouton correspondant.
         */
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


        /*
         * Prépare l'aperçu des médias.
         */
        hideTwitchPreview();

        hideArtworkPreviewMedia();


        if (
            artworkUploadPreview
        ) {

            artworkUploadPreview.hidden =
                true;
        }


        /*
         * Ouvre la bonne section selon le hash de l'URL.
         */
        openInitialSection();
                /* =====================================================
           INITIALISATION — AUTHENTIFICATION
        ====================================================== */

        try {

            const authenticatedAdmin =
                await checkAdminAuthentication();


            if (
                !authenticatedAdmin
            ) {

                setInitialLoadingState(
                    false
                );

                return;
            }


            currentAdminUser =
                authenticatedAdmin;


            applyAdminUser(
                authenticatedAdmin
            );


            createLogoutButton();


            /* =================================================
               CHARGEMENT DES DONNÉES
            ================================================= */

            await Promise.all([
                loadGames(),
                loadArtworks(),
                loadPoll()
            ]);


            /* =================================================
               RAFRAÎCHISSEMENT DES BLOCS
            ================================================= */

            renderGames();

            renderArtworks();

            renderPollPreview();

            updateDashboardStats();


            /* =================================================
               FORMULAIRES
            ================================================= */

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


            /* =================================================
               APERÇUS
            ================================================= */

            hideTwitchPreview();


            if (
                !selectedArtworkFile
            ) {

                hideArtworkPreviewMedia();


                if (
                    artworkUploadPreview
                ) {

                    artworkUploadPreview.hidden =
                        true;
                }
            }


            /* =================================================
               SECTION ACTIVE
            ================================================= */

            openInitialSection();


            /* =================================================
               ADMIN PRÊT
            ================================================= */

            document.documentElement
                .classList
                .add(
                    "admin-ready"
                );


            console.info(
                "[Admin] Interface initialisée.",
                {
                    user:
                        currentAdminUser?.login ||
                        currentAdminUser?.displayName ||
                        "Couaxia",

                    games:
                        games.length,

                    artworks:
                        artworks.length,

                    pollStatus:
                        poll?.status ||
                        "closed"
                }
            );


        } catch (
            error
        ) {

            /* =================================================
               ERREUR GLOBALE D'INITIALISATION
            ================================================= */

            console.error(
                "[Admin] Erreur pendant l'initialisation :",
                error
            );


            showToast(
                error?.message ||
                "Une erreur est survenue pendant le chargement de l'administration.",
                "error"
            );


        } finally {

            setInitialLoadingState(
                false
            );
        }


        /* =====================================================
           NETTOYAGE — AVANT QUITTER LA PAGE
        ====================================================== */

        window.addEventListener(
            "beforeunload",
            () => {

                revokeArtworkPreviewUrl();


                if (
                    artworkPreviewVideo
                ) {

                    try {

                        artworkPreviewVideo.pause();

                    } catch {

                        /* Rien à faire */
                    }
                }
            }
        );


        /* =====================================================
           NETTOYAGE — PAGEHIDE
        ====================================================== */

        window.addEventListener(
            "pagehide",
            () => {

                revokeArtworkPreviewUrl();
            }
        );


        /* =====================================================
           PROTECTION DROP GLOBAL
        ====================================================== */

        [
            "dragenter",
            "dragover",
            "drop"
        ].forEach(
            eventName => {

                document.addEventListener(
                    eventName,
                    event => {

                        /*
                         * Si le drag/drop se fait dans la dropzone,
                         * son propre gestionnaire s'en occupe.
                         */
                        if (
                            artworkDropzone &&
                            (
                                event.target ===
                                    artworkDropzone ||
                                artworkDropzone.contains(
                                    event.target
                                )
                            )
                        ) {

                            return;
                        }


                        /*
                         * Empêche le navigateur d'ouvrir le fichier
                         * lorsqu'il est lâché ailleurs sur la page.
                         */
                        event.preventDefault();
                    }
                );
            }
        );


        /* =====================================================
           APERÇU — ERREUR IMAGE
        ====================================================== */

        artworkPreviewImage
            ?.addEventListener(
                "error",
                () => {

                    console.warn(
                        "[Admin Gallery Preview] Impossible d'afficher l'image."
                    );
                }
            );


        /* =====================================================
           APERÇU — ERREUR VIDÉO
        ====================================================== */

        artworkPreviewVideo
            ?.addEventListener(
                "error",
                () => {

                    console.warn(
                        "[Admin Gallery Preview] Impossible d'afficher la vidéo."
                    );
                }
            );


         /* =====================================================
           FIN
        ====================================================== */

        console.info(
            "[Admin] Chargement du script terminé."
        );
    
    }
);