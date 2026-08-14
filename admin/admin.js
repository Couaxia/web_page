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

        const pollGamesList =
            document.getElementById(
                "admin-poll-games-list"
            );

        const pollGameCount =
            document.getElementById(
                "admin-poll-game-count"
            );


        /* =====================================================
           MODAL SUPPRESSION
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
           TOAST
        ====================================================== */

        const toastContainer =
            document.getElementById(
                "admin-toast-container"
            );


        /* =====================================================
           ÉTAT
        ====================================================== */

        let games =
            [];

        let artworks =
            [];

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
            type:
                null,

            id:
                null
        };


        /* =====================================================
           OUTILS
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
                "admin-secondary-button";

            button.textContent =
                "🚪 Déconnexion";


            button.addEventListener(
                "click",
                async () => {

                    try {

                        await adminApiRequest(
                            "/api/admin/auth-logout",
                            {
                                method:
                                    "POST"
                            }
                        );

                    } catch (
                        error
                    ) {

                        console.error(
                            error
                        );
                    }


                    window.location.replace(
                        "/api/admin/auth-login"
                    );
                }
            );


            container.appendChild(
                button
            );
        }


        /* =====================================================
           NAVIGATION
        ====================================================== */

        function openSection(
            sectionName
        ) {

            const normalizedSection =
                String(
                    sectionName ||
                    ""
                )
                    .trim();


            if (
                !normalizedSection
            ) {

                return;
            }


            navButtons.forEach(
                button => {

                    const active =
                        button.dataset
                            .adminSection ===
                        normalizedSection;


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
                        normalizedSection;


                    section.hidden =
                        !active;


                    section.classList.toggle(
                        "is-active",
                        active
                    );
                }
            );


            if (
                normalizedSection ===
                "games"
            ) {

                renderGames();
            }


            if (
                normalizedSection ===
                "gallery"
            ) {

                renderArtworks();
            }


            if (
                normalizedSection ===
                "poll"
            ) {

                renderPollGames();
            }
        }


        /* =====================================================
           TWITCH — GET GAME
        ====================================================== */

        async function getGame(
            gameId
        ) {

            const normalizedGameId =
                String(
                    gameId ?? ""
                )
                    .trim();


            if (
                !normalizedGameId
            ) {

                return null;
            }


            const url =
                new URL(
                    TWITCH_GAME_API,
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


            const data =
                await response
                    .json()
                    .catch(
                        () => ({})
                    );


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


            if (
                !response.ok
            ) {

                throw new Error(
                    data?.error ||
                    `Erreur HTTP ${response.status}`
                );
            }


            return (
                data?.game ??
                null
            );
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

            } catch (
                error
            ) {

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
           TWITCH — APERÇU
        ====================================================== */

        function resetTwitchPreview() {

            currentTwitchPreview =
                null;


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
                    "";
            }
        }


        function showTwitchPreview(
            game
        ) {

            if (
                !game
            ) {

                return;
            }


            currentTwitchPreview =
                game;


            if (
                twitchPreviewName
            ) {

                twitchPreviewName.textContent =
                    game.name ||
                    "Jeu Twitch";
            }


            if (
                twitchPreviewId
            ) {

                twitchPreviewId.textContent =
                    `ID Twitch : ${game.id}`;
            }


            if (
                twitchPreviewCover &&
                game.boxArtUrl
            ) {

                twitchPreviewCover.src =
                    game.boxArtUrl;

                twitchPreviewCover.alt =
                    game.name ||
                    "Jaquette Twitch";
            }


            if (
                twitchResult
            ) {

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
                )
                    .trim();


            if (
                !id
            ) {

                showToast(
                    "Entre un ID Twitch.",
                    "warning"
                );

                return;
            }


            if (
                !twitchPreviewButton
            ) {

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
                    game.found ===
                        false
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

            } catch (
                error
            ) {

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
           JEUX — FORMULAIRE
        ====================================================== */

        function resetGameForm() {

            currentEditingGameId =
                null;


            gameForm?.reset();


            resetTwitchPreview();


            if (
                gameIdInput
            ) {

                gameIdInput.value =
                    "";
            }


            if (
                twitchGameIdInput
            ) {

                twitchGameIdInput.disabled =
                    false;

                twitchGameIdInput.value =
                    "";
            }


            if (
                statusInput
            ) {

                statusInput.value =
                    "backlog";
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


            window.setTimeout(
                () => {

                    twitchGameIdInput
                        ?.focus();

                },
                300
            );
        }


        function fillGameForm(
            game
        ) {

            if (
                !game
            ) {

                return;
            }


            openSection(
                "games"
            );


            currentEditingGameId =
                game.id;


            if (
                gameIdInput
            ) {

                gameIdInput.value =
                    game.id ||
                    "";
            }


            if (
                twitchGameIdInput
            ) {

                twitchGameIdInput.value =
                    game.twitchGameId ||
                    "";

                twitchGameIdInput.disabled =
                    true;
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
                        "smooth",

                    block:
                        "start"
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
                    )
                        .trim(),

                status:
                    statusInput
                        ?.value ||
                    "backlog",

                tags:
                    normalizeTags(
                        tagsInput
                            ?.value
                    ),

                description:
                    String(
                        descriptionInput
                            ?.value ||
                        ""
                    )
                        .trim(),

                rating:
                    ratingInput
                        ?.value
                        ? Number(
                            ratingInput.value
                        )
                        : null,

                youtubePlaylist:
                    String(
                        youtubeInput
                            ?.value ||
                        ""
                    )
                        .trim(),

                pollEnabled:
                    Boolean(
                        pollInput
                            ?.checked
                    )
            };
        }


        async function saveGameFromForm(
            event
        ) {

            event.preventDefault();


            const game =
                buildGameFromForm();


            if (
                !game.twitchGameId
            ) {

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

                if (
                    submitGameButton
                ) {

                    submitGameButton.disabled =
                        true;

                    submitGameButton.textContent =
                        "⏳ Enregistrement...";
                }


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


                if (
                    !data?.game
                ) {

                    throw new Error(
                        "Le jeu enregistré n'a pas été retourné."
                    );
                }


                if (
                    editing
                ) {

                    const index =
                        games.findIndex(
                            item =>
                                item.id ===
                                data.game.id
                        );


                    if (
                        index >=
                        0
                    ) {

                        games[index] =
                            data.game;

                    } else {

                        games.push(
                            data.game
                        );
                    }

                } else {

                    games.unshift(
                        data.game
                    );
                }


                renderGames();

                renderPollGames();

                updateDashboardStats();

                resetGameForm();


                showToast(
                    editing
                        ? "Jeu modifié."
                        : "Jeu ajouté.",
                    "success"
                );

            } catch (
                error
            ) {

                console.error(
                    "[Game Save]",
                    error
                );


                showToast(
                    error.message,
                    "error"
                );

            } finally {

                if (
                    submitGameButton
                ) {

                    submitGameButton.disabled =
                        false;

                    submitGameButton.textContent =
                        currentEditingGameId
                            ? "💾 Enregistrer les modifications"
                            : "💾 Enregistrer";
                }
            }
        }


        /* =====================================================
           JEUX — AFFICHAGE
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
                labels[
                    status
                ] ||
                status ||
                "Jeu"
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
                                    alt="${escapeHtmlAttribute(
                                        game.twitchName ||
                                        "Jeu"
                                    )}"
                                    loading="lazy"
                                >
                            `
                            : "🎮"
                    }

                </div>


                <div
                    class="admin-game-item-content"
                >

                    <h3>
                        ${escapeHtml(
                            game.twitchName ||
                            game.name ||
                            "Jeu Twitch"
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
                                ? "<span>🗳️ Sondage</span>"
                                : ""
                        }

                    </div>


                    ${
                        game.description
                            ? `
                                <p>
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


        function renderGames() {

            if (
                !gamesList
            ) {

                return;
            }


            const search =
                String(
                    gamesSearch
                        ?.value ||
                    ""
                )
                    .trim()
                    .toLowerCase();


            const filtered =
                games.filter(
                    game => {

                        if (
                            !search
                        ) {

                            return true;
                        }


                        return [
                            game.twitchName,
                            game.name,
                            game.status,
                            game.description,
                            ...(
                                game.tags ||
                                []
                            )
                        ]
                            .join(
                                " "
                            )
                            .toLowerCase()
                            .includes(
                                search
                            );
                    }
                );


            gamesList.innerHTML =
                "";


            if (
                filtered.length ===
                0
            ) {

                gamesList.innerHTML = `
                    <p
                        class="admin-empty-state"
                    >
                        Aucun jeu trouvé.
                    </p>
                `;

                return;
            }


            filtered.forEach(
                game => {

                    gamesList.appendChild(
                        createGameItem(
                            game
                        )
                    );
                }
            );
        }


        /* =====================================================
           ARTWORKS — FORMAT
        ====================================================== */

        function formatArtwork(
            artwork
        ) {

            return {
                id:
                    artwork.id,

                artId:
                    artwork.art_id ??
                    artwork.artId,

                artist:
                    artwork.artist,

                artistRole:
                    artwork.artist_role ??
                    artwork.artistRole,

                description:
                    artwork.description,

                imageUrl:
                    artwork.image_url ??
                    artwork.imageUrl,

                imageAlt:
                    artwork.image_alt ??
                    artwork.imageAlt,

                mediaType:
                    artwork.media_type ??
                    artwork.mediaType ??
                    "image",

                tags:
                    normalizeTags(
                        artwork.tags
                    ),

                imageMessages:
                    normalizeMessages(
                        artwork.image_messages ??
                        artwork.imageMessages
                    ),

                artistUrl:
                    artwork.artist_url ??
                    artwork.artistUrl,

                buttonText:
                    artwork.button_text ??
                    artwork.buttonText ??
                    "Voir son profil",

                buttonMessages:
                    normalizeMessages(
                        artwork.button_messages ??
                        artwork.buttonMessages
                    ),

                sensitive:
                    Boolean(
                        artwork.sensitive
                    ),

                favoriteEnabled:
                    artwork.favorite_enabled !==
                    undefined
                        ? Boolean(
                            artwork.favorite_enabled
                        )
                        : Boolean(
                            artwork.favoriteEnabled
                        ),

                visible:
                    artwork.visible !==
                    undefined
                        ? Boolean(
                            artwork.visible
                        )
                        : true,

                sortOrder:
                    Number(
                        artwork.sort_order ??
                        artwork.sortOrder ??
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

            } catch (
                error
            ) {

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
           ARTWORK — APERÇU
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


        function showArtworkPreview({
            src,
            filename =
                "",
            size =
                null
        }) {

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
                    size !==
                    null
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

                artworkPreviewImage.removeAttribute(
                    "src"
                );
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

            if (
                !file
            ) {

                return;
            }


            if (
                !ALLOWED_ARTWORK_TYPES.has(
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
                    "L'image dépasse 50 Mo.",
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
                                commaIndex >=
                                    0
                                    ? result.slice(
                                        commaIndex +
                                        1
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
           ARTWORK — FORMULAIRE
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
                artworkFileInput
            ) {

                artworkFileInput.value =
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
                artworkSensitiveInput
            ) {

                artworkSensitiveInput.checked =
                    false;
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
                        "smooth",

                    block:
                        "start"
                });


            window.setTimeout(
                () => {

                    artworkArtIdInput
                        ?.focus();

                },
                300
            );
        }


        function fillArtworkForm(
            artwork
        ) {

            if (
                !artwork
            ) {

                return;
            }


            openSection(
                "gallery"
            );


            currentEditingArtworkId =
                artwork.id;

            selectedArtworkFile =
                null;


            if (
                artworkIdInput
            ) {

                artworkIdInput.value =
                    artwork.id ||
                    "";
            }


            if (
                artworkArtIdInput
            ) {

                artworkArtIdInput.value =
                    artwork.artId ||
                    "";
            }


            if (
                artworkSortOrderInput
            ) {

                artworkSortOrderInput.value =
                    artwork.sortOrder ??
                    0;
            }


            if (
                artworkArtistInput
            ) {

                artworkArtistInput.value =
                    artwork.artist ||
                    "";
            }


            if (
                artworkRoleInput
            ) {

                artworkRoleInput.value =
                    artwork.artistRole ||
                    "";
            }


            if (
                artworkImageUrlInput
            ) {

                artworkImageUrlInput.value =
                    artwork.imageUrl ||
                    "";
            }


            if (
                artworkImageAltInput
            ) {

                artworkImageAltInput.value =
                    artwork.imageAlt ||
                    "";
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
                    )
                        .join(
                            ", "
                        );
            }


            if (
                artworkDescriptionInput
            ) {

                artworkDescriptionInput.value =
                    artwork.description ||
                    "";
            }


            if (
                artworkImageMessagesInput
            ) {

                artworkImageMessagesInput.value =
                    (
                        artwork.imageMessages ||
                        []
                    )
                        .join(
                            "|"
                        );
            }


            if (
                artworkArtistUrlInput
            ) {

                artworkArtistUrlInput.value =
                    artwork.artistUrl ||
                    "";
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
                    )
                        .join(
                            "|"
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
                artwork.imageUrl
            ) {

                showArtworkPreview({
                    src:
                        artwork.imageUrl,

                    filename:
                        "Image actuelle"
                });
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


            artworkFormPanel
                ?.scrollIntoView({
                    behavior:
                        "smooth",

                    block:
                        "start"
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
                    )
                        .trim(),

                artist:
                    String(
                        artworkArtistInput
                            ?.value ||
                        ""
                    )
                        .trim(),

                artistRole:
                    String(
                        artworkRoleInput
                            ?.value ||
                        ""
                    )
                        .trim(),

                description:
                    String(
                        artworkDescriptionInput
                            ?.value ||
                        ""
                    )
                        .trim(),

                imageUrl,

                imageAlt:
                    String(
                        artworkImageAltInput
                            ?.value ||
                        ""
                    )
                        .trim(),

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
                    )
                        .trim(),

                buttonText:
                    String(
                        artworkButtonTextInput
                            ?.value ||
                        "Voir son profil"
                    )
                        .trim(),

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


        async function saveArtworkFromForm(
            event
        ) {

            event.preventDefault();


            const artId =
                String(
                    artworkArtIdInput
                        ?.value ||
                    ""
                )
                    .trim();


            const artist =
                String(
                    artworkArtistInput
                        ?.value ||
                    ""
                )
                    .trim();


            if (
                !artId
            ) {

                showToast(
                    "L'ID de l'œuvre est obligatoire.",
                    "warning"
                );

                return;
            }


            if (
                !artist
            ) {

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
                )
                    .trim();


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

                if (
                    artworkSubmitButton
                ) {

                    artworkSubmitButton.disabled =
                        true;

                    artworkSubmitButton.textContent =
                        selectedArtworkFile
                            ? "⏳ Upload de l'image..."
                            : "⏳ Enregistrement...";
                }


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


                    if (
                        artworkImageUrlInput
                    ) {

                        artworkImageUrlInput.value =
                            imageUrl;
                    }


                    if (
                        artworkSubmitButton
                    ) {

                        artworkSubmitButton.textContent =
                            "⏳ Enregistrement...";
                    }
                }


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


                if (
                    editing
                ) {

                    const index =
                        artworks.findIndex(
                            item =>
                                item.id ===
                                savedArtwork.id
                        );


                    if (
                        index >=
                        0
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
                        first,
                        second
                    ) =>
                        first.sortOrder -
                        second.sortOrder
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

            } catch (
                error
            ) {

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

                if (
                    artworkSubmitButton
                ) {

                    artworkSubmitButton.disabled =
                        false;

                    artworkSubmitButton.textContent =
                        currentEditingArtworkId
                            ? "💾 Enregistrer les modifications"
                            : "💾 Enregistrer l'œuvre";
                }
            }
        }


        /* =====================================================
           ARTWORK — AFFICHAGE
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
                <div
                    class="admin-artwork-item-image"
                >

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


                <div
                    class="admin-artwork-item-content"
                >

                    <span
                        class="admin-artwork-id"
                    >
                        #${escapeHtml(
                            artwork.artId
                        )}
                    </span>


                    <h3>
                        ${escapeHtml(
                            artwork.artist
                        )}
                    </h3>


                    ${
                        artwork.artistRole
                            ? `
                                <p
                                    class="artist-role"
                                >
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


                    ${
                        tags.length
                            ? `
                                <div
                                    class="admin-game-item-meta"
                                >
                                    ${
                                        tags
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
                                    }
                                </div>
                            `
                            : ""
                    }


                    <div
                        class="admin-game-item-meta"
                    >

                        ${
                            artwork.favoriteEnabled
                                ? "<span>❤️ Favoris</span>"
                                : "<span>🤍 Favoris désactivés</span>"
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


                    <div
                        class="admin-game-item-actions"
                    >

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


        function renderArtworks() {

            if (
                !artworksList
            ) {

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
                [
                    ...artworks
                ];


            if (
                search
            ) {

                filtered =
                    filtered.filter(
                        artwork => {

                            return [
                                artwork.artId,
                                artwork.artist,
                                artwork.artistRole,
                                artwork.description,
                                ...(
                                    artwork.tags ||
                                    []
                                )
                            ]
                                .join(
                                    " "
                                )
                                .toLowerCase()
                                .includes(
                                    search
                                );
                        }
                    );
            }


            switch (
                filter
            ) {

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
                    first,
                    second
                ) =>
                    first.sortOrder -
                    second.sortOrder
            );


            artworksList.innerHTML =
                "";


            if (
                filtered.length ===
                0
            ) {

                artworksList.innerHTML = `
                    <p
                        class="admin-empty-state"
                    >
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
           SONDAGE
        ====================================================== */

        function renderPollGames() {

            if (
                !pollGamesList
            ) {

                return;
            }


            const eligibleGames =
                games.filter(
                    game =>
                        Boolean(
                            game.pollEnabled
                        )
                );


            if (
                pollGameCount
            ) {

                pollGameCount.textContent =
                    String(
                        eligibleGames.length
                    );
            }


            pollGamesList.innerHTML =
                "";


            if (
                eligibleGames.length ===
                0
            ) {

                pollGamesList.innerHTML = `
                    <p
                        class="admin-empty-state"
                    >
                        Aucun jeu n'est activé pour le sondage.
                    </p>
                `;

                return;
            }


            eligibleGames.forEach(
                game => {

                    const article =
                        document.createElement(
                            "article"
                        );


                    article.className =
                        "admin-game-item";


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
                                            alt=""
                                            loading="lazy"
                                        >
                                    `
                                    : "🎮"
                            }

                        </div>

                        <div
                            class="admin-game-item-content"
                        >

                            <h3>
                                ${escapeHtml(
                                    game.twitchName ||
                                    game.name ||
                                    "Jeu"
                                )}
                            </h3>

                            <div
                                class="admin-game-item-meta"
                            >
                                <span>
                                    🗳️ Sondage activé
                                </span>
                            </div>

                        </div>
                    `;


                    pollGamesList.appendChild(
                        article
                    );
                }
            );
        }


        /* =====================================================
           DASHBOARD — STATS
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


            const pollGames =
                games.filter(
                    game =>
                        Boolean(
                            game.pollEnabled
                        )
                );


            if (
                statPoll
            ) {

                statPoll.textContent =
                    String(
                        pollGames.length
                    );
            }


            /*
             * Le vrai système de vote Supabase
             * n'est pas encore créé.
             */
            if (
                statVotes
            ) {

                statVotes.textContent =
                    "0";
            }
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


            if (
                !game
            ) {

                return;
            }


            pendingDelete = {
                type:
                    "game",

                id
            };


            if (
                confirmMessage
            ) {

                confirmMessage.textContent =
                    `Veux-tu vraiment supprimer ${
                        game.twitchName ||
                        game.name ||
                        "ce jeu"
                    } ?`;
            }


            if (
                confirmModal
            ) {

                confirmModal.hidden =
                    false;
            }
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


            if (
                !artwork
            ) {

                return;
            }


            pendingDelete = {
                type:
                    "artwork",

                id
            };


            if (
                confirmMessage
            ) {

                confirmMessage.textContent =
                    `Veux-tu vraiment supprimer l'œuvre #${
                        artwork.artId
                    } de ${
                        artwork.artist
                    } ? L'image sera également supprimée du Storage.`;
            }


            if (
                confirmModal
            ) {

                confirmModal.hidden =
                    false;
            }
        }


        function closeDeleteModal() {

            pendingDelete = {
                type:
                    null,

                id:
                    null
            };


            if (
                confirmModal
            ) {

                confirmModal.hidden =
                    true;
            }
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

                if (
                    confirmDelete
                ) {

                    confirmDelete.disabled =
                        true;

                    confirmDelete.textContent =
                        "⏳ Suppression...";
                }


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
                    type ===
                        "game"
                        ? "Jeu supprimé."
                        : "Illustration supprimée.",
                    "success"
                );

            } catch (
                error
            ) {

                showToast(
                    error.message,
                    "error"
                );

            } finally {

                if (
                    confirmDelete
                ) {

                    confirmDelete.disabled =
                        false;

                    confirmDelete.textContent =
                        "🗑️ Supprimer";
                }
            }
        }


        /* =====================================================
           UPLOAD — ÉVÉNEMENTS
        ====================================================== */

        artworkDropzone
            ?.addEventListener(
                "click",
                event => {

                    if (
                        event.target instanceof
                            Element &&
                        event.target.closest(
                            "button"
                        )
                    ) {

                        return;
                    }


                    artworkFileInput
                        ?.click();
                }
            );


        artworkDropzone
            ?.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key !==
                            "Enter" &&
                        event.key !==
                            " "
                    ) {

                        return;
                    }


                    event.preventDefault();


                    artworkFileInput
                        ?.click();
                }
            );


        artworkFileInput
            ?.addEventListener(
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
                        event
                            .dataTransfer
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


        artworkRemoveImage
            ?.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    removeSelectedArtworkImage();
                }
            );


        /* =====================================================
           NAVIGATION — MENU
        ====================================================== */

        navButtons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();


                        openSection(
                            button.dataset
                                .adminSection
                        );
                    }
                );
            }
        );


        /* =====================================================
           ACTIONS RAPIDES DU DASHBOARD
        ====================================================== */

        quickActions.forEach(
            button => {

                button.addEventListener(
                    "click",
                    event => {

                        /*
                         * IMPORTANT :
                         *
                         * Empêche un bouton du dashboard
                         * de soumettre un formulaire ou
                         * d'exécuter une navigation parasite.
                         */
                        event.preventDefault();


                        const section =
                            String(
                                button.dataset
                                    .openSection ||
                                ""
                            )
                                .trim();


                        const action =
                            String(
                                button.dataset
                                    .adminAction ||
                                ""
                            )
                                .trim();


                        console.info(
                            "[Admin Action]",
                            {
                                section,
                                action
                            }
                        );


                        if (
                            action ===
                            "new-game"
                        ) {

                            openNewGameForm();

                            return;
                        }


                        if (
                            action ===
                            "new-artwork"
                        ) {

                            openNewArtworkForm();

                            return;
                        }


                        if (
                            section
                        ) {

                            openSection(
                                section
                            );
                        }
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
                event => {

                    event.preventDefault();

                    openNewGameForm();
                }
            );


        cancelGameButton
            ?.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    resetGameForm();
                }
            );


        twitchPreviewButton
            ?.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    previewTwitchGame();
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


                    if (
                        editButton
                    ) {

                        const game =
                            games.find(
                                item =>
                                    item.id ===
                                    editButton.dataset
                                        .editGame
                            );


                        if (
                            game
                        ) {

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


                    if (
                        deleteButton
                    ) {

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
                event => {

                    event.preventDefault();

                    openNewArtworkForm();
                }
            );


        artworkCancelButton
            ?.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    resetArtworkForm();
                }
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


                    if (
                        editButton
                    ) {

                        const artwork =
                            artworks.find(
                                item =>
                                    item.id ===
                                    editButton.dataset
                                        .editArtwork
                            );


                        if (
                            artwork
                        ) {

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


                    if (
                        deleteButton
                    ) {

                        openArtworkDeleteModal(
                            deleteButton.dataset
                                .deleteArtwork
                        );
                    }
                }
            );


        /* =====================================================
           MODAL — ÉVÉNEMENTS
        ====================================================== */

        confirmClose
            ?.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    closeDeleteModal();
                }
            );


        confirmCancel
            ?.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    closeDeleteModal();
                }
            );


        confirmDelete
            ?.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    confirmPendingDelete();
                }
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


        if (
            !authenticatedAdmin
        ) {

            return;
        }


        applyAdminUser(
            authenticatedAdmin
        );


        createLogoutButton();


        await Promise.all([
            loadGames(),
            loadArtworks()
        ]);


        updateDashboardStats();


        /*
         * Si aucune section n'est active,
         * ouvre le dashboard.
         */
        const activeSection =
            sections.find(
                section =>
                    !section.hidden
            );


        if (
            !activeSection
        ) {

            openSection(
                "dashboard"
            );
        }


        console.info(
            "[Admin] Interface initialisée pour :",
            authenticatedAdmin.login
        );


        console.info(
            "[Admin] Actions rapides trouvées :",
            quickActions.length
        );
    }
);