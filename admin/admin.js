"use strict";


/* =========================================================
   ADMINISTRATION COUAXIA
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        /* =====================================================
           CONFIGURATION API
        ====================================================== */

        const ADMIN_ME_API =
            "/api/admin/auth-me";

        const ADMIN_LOGOUT_API =
            "/api/admin/auth-logout";

        /* =====================================================
           API JEUX
        ====================================================== */

        const ADMIN_GAMES_API =
            "/api/admin/games";

        /* =====================================================
           API GALERIE / CRÉDITS
        ====================================================== */

        const ADMIN_GALLERY_API =
            "/api/admin/gallery";

        const ADMIN_GALLERY_UPLOAD_API =
            "/api/admin/gallery-upload";


        /* =====================================================
           API SONDAGES
        ====================================================== */

        const ADMIN_POLLS_API =
            "/api/admin/polls";

        const ADMIN_POLL_SUGGESTIONS_API =
            "/api/admin/poll-suggestions";


        /* =====================================================
           ÉTAT GLOBAL
        ====================================================== */

        let currentAdminUser =
            null;


        /* =====================================================
           JEUX
        ====================================================== */

        let games =
            [];

        let currentEditingGameId =
            null;


        /* =====================================================
           GALERIE / CRÉDITS
        ====================================================== */

        let artworks =
            [];

        let currentEditingArtworkId =
            null;

        let selectedArtworkFile =
            null;


        /* =====================================================
           SONDAGES
        ====================================================== */

        let polls =
            [];

        let pollSuggestions =
            [];

        let currentEditingPollId =
            null;

        let currentResultsPollId =
            null;


        /* =====================================================
           NAVIGATION ADMIN
        ====================================================== */

        const navigationButtons =
            Array.from(
                document.querySelectorAll(
                    "[data-admin-section]"
                )
            );


        const sections =
            Array.from(
                document.querySelectorAll(
                    "[data-admin-panel]"
                )
            );


        const quickActionButtons =
            Array.from(
                document.querySelectorAll(
                    "[data-open-section]"
                )
            );


        /* =====================================================
           INFORMATIONS ADMIN
        ====================================================== */

        const adminName =
            document.getElementById(
                "admin-user-name"
            );

        const adminAvatar =
            document.getElementById(
                "admin-user-avatar"
            );

        const adminLogoutContainer =
            document.getElementById(
                "admin-logout-container"
            );


        /* =====================================================
           DASHBOARD
        ====================================================== */

        const adminStatGames =
            document.getElementById(
                "admin-stat-games"
            );

        const adminStatGallery =
            document.getElementById(
                "admin-stat-artworks"
            );

        const adminStatPoll =
            document.getElementById(
                "admin-stat-poll"
            );

        const adminStatVotes =
            document.getElementById(
                "admin-stat-votes"
            );


        /* =====================================================
           ÉLÉMENTS — JEUX
        ====================================================== */

        const gamesList =
            document.getElementById(
                "admin-games-list"
            );

        const gamesSearchInput =
            document.getElementById(
                "admin-games-search"
            );

        const gamesStatusFilter =
            document.getElementById(
                "admin-games-status-filter"
            );

        const gamesResultsCount =
            document.getElementById(
                "admin-games-results-count"
            );

        const newGameButton =
            document.getElementById(
                "admin-new-game"
            );

        const gameFormPanel =
            document.getElementById(
                "admin-game-form-panel"
            );

        const gameForm =
            document.getElementById(
                "admin-game-form"
            );

        const gameFormTitle =
            document.getElementById(
                "admin-game-form-title"
            );

        const gameIdInput =
            document.getElementById(
                "admin-game-id"
            );

        const gameTwitchIdInput =
            document.getElementById(
                "admin-game-twitch-id"
            );

        const gameNameInput =
            document.getElementById(
                "admin-game-name"
            );

        const gameSlugInput =
            document.getElementById(
                "admin-game-slug"
            );

        const gameBoxArtInput =
            document.getElementById(
                "admin-game-box-art"
            );

        const gameStatusInput =
            document.getElementById(
                "admin-game-status"
            );

        const gameTagsInput =
            document.getElementById(
                "admin-game-tags"
            );

        const gameDescriptionInput =
            document.getElementById(
                "admin-game-description"
            );

        const gamePollEnabledInput =
            document.getElementById(
                "admin-game-poll-enabled"
            );

        const gameCancelButton =
            document.getElementById(
                "admin-game-cancel"
            );

        const gameDeleteButton =
            document.getElementById(
                "admin-game-delete"
            );

        const gameSubmitButton =
            document.getElementById(
                "admin-game-submit"
            );


        /* =====================================================
           ÉLÉMENTS — GALERIE / CRÉDITS
        ====================================================== */

        const artworksList =
            document.getElementById(
                "admin-artworks-list"
            );

        const artworksSearchInput =
            document.getElementById(
                "admin-artworks-search"
            );

        const artworksResultsCount =
            document.getElementById(
                "admin-artworks-results-count"
            );

        const newArtworkButton =
            document.getElementById(
                "admin-new-artwork"
            );

        const artworkFormPanel =
            document.getElementById(
                "admin-artwork-form-panel"
            );

        const artworkForm =
            document.getElementById(
                "admin-artwork-form"
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

        const artworkFileInput =
            document.getElementById(
                "admin-artwork-file"
            );

        const artworkFileName =
            document.getElementById(
                "admin-artwork-file-name"
            );

        const artworkPreview =
            document.getElementById(
                "admin-artwork-preview"
            );

        const artworkCancelButton =
            document.getElementById(
                "admin-artwork-cancel"
            );

        const artworkDeleteButton =
            document.getElementById(
                "admin-artwork-delete"
            );

        const artworkSubmitButton =
            document.getElementById(
                "admin-artwork-submit"
            );


        /* =====================================================
           ÉLÉMENTS — SONDAGES
        ====================================================== */

        const newPollButton =
            document.getElementById(
                "admin-new-poll"
            );


        /* =====================================================
           STATISTIQUES SONDAGES
        ====================================================== */

        const pollsStatActive =
            document.getElementById(
                "admin-polls-stat-active"
            );

        const pollsStatUpcoming =
            document.getElementById(
                "admin-polls-stat-upcoming"
            );

        const pollsStatFinished =
            document.getElementById(
                "admin-polls-stat-finished"
            );

        const pollsStatSuggestions =
            document.getElementById(
                "admin-polls-stat-suggestions"
            );


        /* =====================================================
           FORMULAIRE SONDAGE
        ====================================================== */

        const pollFormPanel =
            document.getElementById(
                "admin-poll-form-panel"
            );

        const pollForm =
            document.getElementById(
                "admin-poll-form"
            );

        const pollFormTitle =
            document.getElementById(
                "admin-poll-form-title"
            );

        const pollIdInput =
            document.getElementById(
                "admin-poll-id"
            );

        const pollTitleInput =
            document.getElementById(
                "admin-poll-title"
            );

        const pollSlugInput =
            document.getElementById(
                "admin-poll-slug"
            );

        const pollQuestionInput =
            document.getElementById(
                "admin-poll-question"
            );

        const pollDescriptionInput =
            document.getElementById(
                "admin-poll-description"
            );

        const pollCategoryInput =
            document.getElementById(
                "admin-poll-category"
            );

        const pollStatusInput =
            document.getElementById(
                "admin-poll-status"
            );

        const pollStartDateInput =
            document.getElementById(
                "admin-poll-start-date"
            );

        const pollStartTimeInput =
            document.getElementById(
                "admin-poll-start-time"
            );

        const pollEndDateInput =
            document.getElementById(
                "admin-poll-end-date"
            );

        const pollEndTimeInput =
            document.getElementById(
                "admin-poll-end-time"
            );

        const pollResultsVisibilityInput =
            document.getElementById(
                "admin-poll-results-visibility"
            );

        const pollAllowSuggestionsInput =
            document.getElementById(
                "admin-poll-allow-suggestions"
            );

        const pollOptionsList =
            document.getElementById(
                "admin-poll-options-list"
            );

        const pollAddOptionButton =
            document.getElementById(
                "admin-poll-add-option"
            );

        const pollCancelButton =
            document.getElementById(
                "admin-poll-cancel"
            );

        const pollDeleteButton =
            document.getElementById(
                "admin-poll-delete"
            );

        const pollSubmitButton =
            document.getElementById(
                "admin-poll-submit"
            );


        /* =====================================================
           LISTES / FILTRES SONDAGES
        ====================================================== */

        const pollsSearchInput =
            document.getElementById(
                "admin-polls-search"
            );

        const pollsStatusFilter =
            document.getElementById(
                "admin-polls-status-filter"
            );

        const pollsCategoryFilter =
            document.getElementById(
                "admin-polls-category-filter"
            );

        const pollsResultsCount =
            document.getElementById(
                "admin-polls-results-count"
            );


        /* =====================================================
           SONDAGES EN COURS
        ====================================================== */

        const pollsActiveSection =
            document.getElementById(
                "admin-polls-active-section"
            );

        const pollsActiveList =
            document.getElementById(
                "admin-polls-active-list"
            );

        const pollsActiveCount =
            document.getElementById(
                "admin-polls-active-count"
            );


        /* =====================================================
           SONDAGES À VENIR
        ====================================================== */

        const pollsUpcomingSection =
            document.getElementById(
                "admin-polls-upcoming-section"
            );

        const pollsUpcomingList =
            document.getElementById(
                "admin-polls-upcoming-list"
            );

        const pollsUpcomingCount =
            document.getElementById(
                "admin-polls-upcoming-count"
            );


        /* =====================================================
           SONDAGES TERMINÉS
        ====================================================== */

        const pollsFinishedSection =
            document.getElementById(
                "admin-polls-finished-section"
            );

        const pollsFinishedList =
            document.getElementById(
                "admin-polls-finished-list"
            );

        const pollsFinishedCount =
            document.getElementById(
                "admin-polls-finished-count"
            );


        /* =====================================================
           PROPOSITIONS COMMUNAUTÉ
        ====================================================== */

        const pollSuggestionsSection =
            document.getElementById(
                "admin-poll-suggestions-section"
            );

        const pollSuggestionsList =
            document.getElementById(
                "admin-poll-suggestions-list"
            );

        const pollSuggestionsCount =
            document.getElementById(
                "admin-poll-suggestions-count"
            );

        const pollSuggestionsFilter =
            document.getElementById(
                "admin-poll-suggestions-filter"
            );


        /* =====================================================
           RÉSULTATS SONDAGE
        ====================================================== */

        const pollResultsPanel =
            document.getElementById(
                "admin-poll-results-panel"
            );

        const pollResultsTitle =
            document.getElementById(
                "admin-poll-results-title"
            );

        const pollResultsTotal =
            document.getElementById(
                "admin-poll-results-total"
            );

        const pollResultsStatus =
            document.getElementById(
                "admin-poll-results-status"
            );

        const pollResultsWinner =
            document.getElementById(
                "admin-poll-results-winner"
            );

        const pollResultsList =
            document.getElementById(
                "admin-poll-results"
            );

        const pollResultsCloseButton =
            document.getElementById(
                "admin-poll-results-close"
            );


        /* =====================================================
           TOAST
        ====================================================== */

        const toast =
            document.getElementById(
                "admin-toast"
            );


        /* =====================================================
           OUTIL — TEXTE
        ====================================================== */

        function normalizeText(
            value
        ) {

            return String(
                value ??
                ""
            ).trim();
        }


        /* =====================================================
           OUTIL — HTML
        ====================================================== */

        function escapeHtml(
            value
        ) {

            return String(
                value ??
                ""
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


        /* =====================================================
           OUTIL — TABLEAU
        ====================================================== */

        function normalizeArray(
            value
        ) {

            if (
                Array.isArray(
                    value
                )
            ) {

                return value;
            }


            return [];
        }


        /* =====================================================
           OUTIL — BOOLÉEN
        ====================================================== */

        function normalizeBoolean(
            value,
            fallback = false
        ) {

            if (
                typeof value ===
                "boolean"
            ) {

                return value;
            }


            if (
                value ===
                    1 ||
                value ===
                    "1" ||
                value ===
                    "true"
            ) {

                return true;
            }


            if (
                value ===
                    0 ||
                value ===
                    "0" ||
                value ===
                    "false"
            ) {

                return false;
            }


            return fallback;
        }


        /* =====================================================
           OUTIL — NOMBRE
        ====================================================== */

        function normalizeNumber(
            value,
            fallback = 0
        ) {

            const number =
                Number(
                    value
                );


            return Number.isFinite(
                number
            )
                ? number
                : fallback;
        }


        /* =====================================================
           OUTIL — SLUG
        ====================================================== */

        function slugify(
            value
        ) {

            return normalizeText(
                value
            )
                .toLowerCase()
                .normalize(
                    "NFD"
                )
                .replace(
                    /[\u0300-\u036f]/g,
                    ""
                )
                .replace(
                    /[^a-z0-9]+/g,
                    "-"
                )
                .replace(
                    /^-+|-+$/g,
                    ""
                );
        }


        /* =====================================================
           OUTIL — DATE
        ====================================================== */

        function formatDate(
            value
        ) {

            if (
                !value
            ) {

                return "—";
            }


            const date =
                new Date(
                    value
                );


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {

                return "—";
            }


            return new Intl.DateTimeFormat(
                "fr-FR",
                {
                    dateStyle:
                        "medium",

                    timeStyle:
                        "short"
                }
            ).format(
                date
            );
        }


        /* =====================================================
           OUTIL — DATE POUR INPUT
        ====================================================== */

        function getDateInputValue(
            value
        ) {

            if (
                !value
            ) {

                return "";
            }


            const date =
                new Date(
                    value
                );


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {

                return "";
            }


            const year =
                date.getFullYear();

            const month =
                String(
                    date.getMonth() +
                    1
                ).padStart(
                    2,
                    "0"
                );

            const day =
                String(
                    date.getDate()
                ).padStart(
                    2,
                    "0"
                );


            return `${year}-${month}-${day}`;
        }


        /* =====================================================
           OUTIL — HEURE POUR INPUT
        ====================================================== */

        function getTimeInputValue(
            value
        ) {

            if (
                !value
            ) {

                return "";
            }


            const date =
                new Date(
                    value
                );


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {

                return "";
            }


            const hours =
                String(
                    date.getHours()
                ).padStart(
                    2,
                    "0"
                );

            const minutes =
                String(
                    date.getMinutes()
                ).padStart(
                    2,
                    "0"
                );


            return `${hours}:${minutes}`;
        }


        /* =====================================================
           OUTIL — CRÉER DATE ISO
        ====================================================== */

        function createDateTimeValue(
            dateValue,
            timeValue
        ) {

            const date =
                normalizeText(
                    dateValue
                );

            const time =
                normalizeText(
                    timeValue
                );


            if (
                !date
            ) {

                return null;
            }


            const dateTime =
                new Date(
                    `${date}T${
                        time ||
                        "00:00"
                    }`
                );


            if (
                Number.isNaN(
                    dateTime.getTime()
                )
            ) {

                return null;
            }


            return dateTime.toISOString();
        }


        /* =====================================================
           TOAST
        ====================================================== */

        let toastTimeout =
            null;


        function showToast(
            message,
            type = "success"
        ) {

            if (
                !toast
            ) {

                return;
            }


            if (
                toastTimeout
            ) {

                window.clearTimeout(
                    toastTimeout
                );
            }


            toast.textContent =
                normalizeText(
                    message
                );


            toast.dataset.type =
                type;


            toast.hidden =
                false;


            toast.classList.add(
                "is-visible"
            );


            toastTimeout =
                window.setTimeout(
                    () => {

                        toast.classList.remove(
                            "is-visible"
                        );


                        window.setTimeout(
                            () => {

                                toast.hidden =
                                    true;

                            },
                            250
                        );

                    },
                    3500
                );
        }


        /* =====================================================
           API ADMIN
        ====================================================== */

        async function adminApiRequest(
            url,
            options = {}
        ) {

            const requestOptions = {

                method:
                    options.method ||
                    "GET",

                credentials:
                    "same-origin",

                cache:
                    "no-store",

                headers: {
                    Accept:
                        "application/json",

                    ...(
                        options.headers ||
                        {}
                    )
                }

            };


            /* =================================================
               BODY
            ================================================= */

            if (
                options.body !==
                undefined
            ) {

                requestOptions.headers[
                    "Content-Type"
                ] =
                    "application/json";


                requestOptions.body =
                    typeof options.body ===
                        "string"
                        ? options.body
                        : JSON.stringify(
                            options.body
                        );
            }


            /* =================================================
               FETCH
            ================================================= */

            const response =
                await fetch(
                    url,
                    requestOptions
                );


            /* =================================================
               SESSION ADMIN EXPIRÉE
            ================================================= */

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


            /* =================================================
               JSON
            ================================================= */

            const data =
                await response
                    .json()
                    .catch(
                        () => ({})
                    );


            /* =================================================
               ERREUR
            ================================================= */

            if (
                !response.ok
            ) {

                throw new Error(
                    data?.error ||
                    data?.message ||
                    `Erreur serveur (${response.status}).`
                );
            }


            return data;
        }


        /* =====================================================
           AUTH — UTILISATEUR ADMIN
        ====================================================== */

        function applyAdminUser(
            user
        ) {

            if (
                !user
            ) {

                return;
            }


            const displayName =
                normalizeText(
                    user.displayName ??
                    user.display_name ??
                    user.login ??
                    user.name
                ) ||
                "Couaxia";


            const avatarUrl =
                normalizeText(
                    user.profileImageUrl ??
                    user.profile_image_url ??
                    user.avatar ??
                    user.avatarUrl
                );


            if (
                adminName
            ) {

                adminName.textContent =
                    displayName;
            }


            if (
                adminAvatar
            ) {

                if (
                    avatarUrl
                ) {

                    adminAvatar.src =
                        avatarUrl;

                    adminAvatar.alt =
                        `Avatar de ${displayName}`;

                    adminAvatar.hidden =
                        false;

                } else {

                    adminAvatar.hidden =
                        true;
                }
            }
        }


        /* =====================================================
           AUTH — CHARGEMENT
        ====================================================== */

        async function loadAdminUser() {

            const response =
                await fetch(
                    ADMIN_ME_API,
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
                !response.ok ||
                !data?.authenticated
            ) {

                window.location.replace(
                    data?.loginUrl ||
                    "/api/admin/auth-login"
                );


                return null;
            }


            return (
                data.user ||
                data.admin ||
                null
            );
        }


        /* =====================================================
           AUTH — BOUTON DÉCONNEXION
        ====================================================== */

        function createLogoutButton() {

            if (
                !adminLogoutContainer
            ) {

                return;
            }


            adminLogoutContainer.innerHTML =
                "";


            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "admin-logout-button";


            button.textContent =
                "Se déconnecter";


            button.addEventListener(
                "click",
                async () => {

                    button.disabled =
                        true;


                    button.textContent =
                        "Déconnexion...";


                    try {

                        const response =
                            await fetch(
                                ADMIN_LOGOUT_API,
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


                        if (
                            !response.ok
                        ) {

                            throw new Error(
                                "Impossible de se déconnecter."
                            );
                        }


                        window.location.replace(
                            "/admin.html"
                        );


                    } catch (
                        error
                    ) {

                        console.error(
                            "[Admin Logout]",
                            error
                        );


                        showToast(
                            error?.message ||
                            "Impossible de se déconnecter.",
                            "error"
                        );


                        button.disabled =
                            false;


                        button.textContent =
                            "Se déconnecter";
                    }
                }
            );


            adminLogoutContainer.appendChild(
                button
            );
        }


        /* =====================================================
           NAVIGATION — OUVRIR UNE SECTION
        ====================================================== */

        function openSection(
            sectionName
        ) {

            const normalizedSection =
                normalizeText(
                    sectionName
                ) ||
                "dashboard";


            /* =================================================
               PANELS
            ================================================= */

            sections.forEach(
                section => {

                    const isActive =
                        normalizeText(
                            section.dataset
                                .adminPanel
                        ) ===
                        normalizedSection;


                    section.hidden =
                        !isActive;


                    section.classList.toggle(
                        "is-active",
                        isActive
                    );
                }
            );


            /* =================================================
               BOUTONS NAVIGATION
            ================================================= */

            navigationButtons.forEach(
                button => {

                    const isActive =
                        normalizeText(
                            button.dataset
                                .adminSection
                        ) ===
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


            /* =================================================
               URL
            ================================================= */

            if (
                window.location.hash !==
                `#${normalizedSection}`
            ) {

                window.history.replaceState(
                    null,
                    "",
                    `#${normalizedSection}`
                );
            }
        }


        /* =====================================================
           NAVIGATION — MENU
        ====================================================== */

        navigationButtons.forEach(
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


        /* =====================================================
           NAVIGATION — ACTIONS RAPIDES
        ====================================================== */

        quickActionButtons.forEach(
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
           NAVIGATION — HASH
        ====================================================== */

        window.addEventListener(
            "hashchange",
            () => {

                const requestedSection =
                    normalizeText(
                        window.location.hash
                            .replace(
                                "#",
                                ""
                            )
                    );


                const validSections =
                    new Set(
                        sections
                            .map(
                                section =>
                                    normalizeText(
                                        section.dataset
                                            .adminPanel
                                    )
                            )
                            .filter(
                                Boolean
                            )
                    );


                if (
                    validSections.has(
                        requestedSection
                    )
                ) {

                    openSection(
                        requestedSection
                    );
                }
            }
        );


        /* =====================================================
           DASHBOARD — STATISTIQUES
        ====================================================== */

        function updateDashboardStats() {

            /* =================================================
               JEUX
            ================================================= */

            if (
                adminStatGames
            ) {

                adminStatGames.textContent =
                    String(
                        games.length
                    );
            }


            /* =================================================
               GALERIE
            ================================================= */

            if (
                adminStatGallery
            ) {

                adminStatGallery.textContent =
                    String(
                        artworks.length
                    );
            }


            /* =================================================
               SONDAGES ACTIFS
            ================================================= */

            const activePolls =
                polls.filter(
                    poll =>
                        poll.status ===
                        "active"
                );


            if (
                adminStatPoll
            ) {

                adminStatPoll.textContent =
                    String(
                        activePolls.length
                    );
            }


            /* =================================================
               TOTAL DES VOTES
            ================================================= */

            const totalVotes =
                polls.reduce(
                    (
                        total,
                        poll
                    ) =>
                        total +
                        normalizeNumber(
                            poll.totalVotes,
                            0
                        ),
                    0
                );


            if (
                adminStatVotes
            ) {

                adminStatVotes.textContent =
                    String(
                        totalVotes
                    );
            }


            /* =================================================
               STATS PAGE SONDAGES
            ================================================= */

            const upcomingPolls =
                polls.filter(
                    poll =>
                        poll.status ===
                        "upcoming"
                );


            const finishedPolls =
                polls.filter(
                    poll =>
                        poll.status ===
                        "finished"
                );


            const pendingSuggestions =
                pollSuggestions.filter(
                    suggestion =>
                        suggestion.status ===
                        "pending"
                );


            if (
                pollsStatActive
            ) {

                pollsStatActive.textContent =
                    String(
                        activePolls.length
                    );
            }


            if (
                pollsStatUpcoming
            ) {

                pollsStatUpcoming.textContent =
                    String(
                        upcomingPolls.length
                    );
            }


            if (
                pollsStatFinished
            ) {

                pollsStatFinished.textContent =
                    String(
                        finishedPolls.length
                    );
            }


            if (
                pollsStatSuggestions
            ) {

                pollsStatSuggestions.textContent =
                    String(
                        pendingSuggestions.length
                    );
            }
        }


        /* =====================================================
           LABEL STATUT SONDAGE
        ====================================================== */

        function getPollStatusLabel(
            status
        ) {

            switch (
                normalizeText(
                    status
                )
            ) {

                case "active":

                    return "🔥 En cours";


                case "upcoming":

                    return "📅 À venir";


                case "finished":

                    return "🏆 Terminé";


                default:

                    return "🗳️ Sondage";
            }
        }


        /* =====================================================
           LABEL CATÉGORIE SONDAGE
        ====================================================== */

        function getPollCategoryLabel(
            category
        ) {

            switch (
                normalizeText(
                    category
                )
            ) {

                case "games":

                    return "🎮 Jeux";


                case "community":

                    return "💜 Communauté";


                case "vtuber":

                    return "🎨 VTuber";


                case "content":

                    return "🎬 Contenu";


                case "events":

                    return "🎉 Événements";


                case "fun":

                    return "😂 Fun";


                default:

                    return "🗳️ Autre";
            }
        }
                /* =====================================================
           JEUX — NORMALISATION
        ====================================================== */

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


            const rawTags =
                game.tags ??
                game.gameTags ??
                game.game_tags ??
                [];


            let tags =
                [];


            if (
                Array.isArray(
                    rawTags
                )
            ) {

                tags =
                    rawTags
                        .map(
                            normalizeText
                        )
                        .filter(
                            Boolean
                        );

            } else {

                tags =
                    normalizeText(
                        rawTags
                    )
                        .split(
                            ","
                        )
                        .map(
                            normalizeText
                        )
                        .filter(
                            Boolean
                        );
            }


            return {

                id:
                    game.id ??
                    game.gameId ??
                    game.game_id ??
                    null,

                twitchId:
                    normalizeText(
                        game.twitchId ??
                        game.twitch_id ??
                        game.twitchGameId ??
                        game.twitch_game_id
                    ),

                name:
                    normalizeText(
                        game.name ??
                        game.title
                    ),

                slug:
                    normalizeText(
                        game.slug
                    ),

                boxArtUrl:
                    normalizeText(
                        game.boxArtUrl ??
                        game.box_art_url ??
                        game.imageUrl ??
                        game.image_url
                    ),

                status:
                    normalizeText(
                        game.status
                    ) ||
                    "published",

                tags,

                description:
                    normalizeText(
                        game.description
                    ),

                pollEnabled:
                    normalizeBoolean(
                        game.pollEnabled ??
                        game.poll_enabled,
                        false
                    ),

                createdAt:
                    game.createdAt ??
                    game.created_at ??
                    null,

                updatedAt:
                    game.updatedAt ??
                    game.updated_at ??
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
                        ADMIN_GAMES_API
                    );


                const rawGames =
                    Array.isArray(
                        data
                    )
                        ? data
                        : (
                            data.games ??
                            data.data ??
                            []
                        );


                games =
                    normalizeArray(
                        rawGames
                    )
                        .map(
                            normalizeGame
                        )
                        .filter(
                            Boolean
                        );


                games.sort(
                    (
                        firstGame,
                        secondGame
                    ) =>
                        firstGame.name.localeCompare(
                            secondGame.name,
                            "fr",
                            {
                                sensitivity:
                                    "base"
                            }
                        )
                );


                updateDashboardStats();


            } catch (
                error
            ) {

                console.error(
                    "[Admin Games] Chargement :",
                    error
                );


                games =
                    [];


                updateDashboardStats();


                showToast(
                    error?.message ||
                    "Impossible de charger les jeux.",
                    "error"
                );
            }
        }


        /* =====================================================
           JEUX — IMAGE
        ====================================================== */

        function getGameImageUrl(
            game
        ) {

            const imageUrl =
                normalizeText(
                    game?.boxArtUrl
                );


            if (
                !imageUrl
            ) {

                return "";
            }


            return imageUrl
                .replace(
                    "{width}",
                    "300"
                )
                .replace(
                    "{height}",
                    "400"
                );
        }


        /* =====================================================
           JEUX — LABEL STATUT
        ====================================================== */

        function getGameStatusLabel(
            status
        ) {

            switch (
                normalizeText(
                    status
                )
            ) {

                case "published":

                    return "Publié";


                case "draft":

                    return "Brouillon";


                case "hidden":

                    return "Masqué";


                case "archived":

                    return "Archivé";


                default:

                    return (
                        normalizeText(
                            status
                        ) ||
                        "Publié"
                    );
            }
        }


        /* =====================================================
           JEUX — FILTRES
        ====================================================== */

        function getFilteredGames() {

            const search =
                normalizeText(
                    gamesSearchInput
                        ?.value
                )
                    .toLowerCase();


            const status =
                normalizeText(
                    gamesStatusFilter
                        ?.value
                )
                    .toLowerCase();


            return games.filter(
                game => {

                    /* =========================================
                       RECHERCHE
                    ========================================= */

                    if (
                        search
                    ) {

                        const searchableText =
                            [
                                game.name,
                                game.slug,
                                game.description,
                                ...game.tags
                            ]
                                .join(
                                    " "
                                )
                                .toLowerCase();


                        if (
                            !searchableText.includes(
                                search
                            )
                        ) {

                            return false;
                        }
                    }


                    /* =========================================
                       STATUT
                    ========================================= */

                    if (
                        status &&
                        status !==
                            "all"
                    ) {

                        if (
                            game.status !==
                            status
                        ) {

                            return false;
                        }
                    }


                    return true;
                }
            );
        }


        /* =====================================================
           JEUX — CARTE
        ====================================================== */

        function createGameCard(
            game
        ) {

            const article =
                document.createElement(
                    "article"
                );


            article.className =
                "admin-game-card";


            article.dataset.gameId =
                String(
                    game.id ??
                    ""
                );


            /* =================================================
               IMAGE
            ================================================= */

            const media =
                document.createElement(
                    "div"
                );


            media.className =
                "admin-game-card-media";


            const imageUrl =
                getGameImageUrl(
                    game
                );


            if (
                imageUrl
            ) {

                const image =
                    document.createElement(
                        "img"
                    );


                image.src =
                    imageUrl;


                image.alt =
                    game.name
                        ? `Jaquette de ${game.name}`
                        : "Jaquette du jeu";


                image.loading =
                    "lazy";


                media.appendChild(
                    image
                );

            } else {

                const placeholder =
                    document.createElement(
                        "div"
                    );


                placeholder.className =
                    "admin-game-card-placeholder";


                placeholder.textContent =
                    "🎮";


                media.appendChild(
                    placeholder
                );
            }


            /* =================================================
               CONTENU
            ================================================= */

            const content =
                document.createElement(
                    "div"
                );


            content.className =
                "admin-game-card-content";


            const heading =
                document.createElement(
                    "div"
                );


            heading.className =
                "admin-game-card-heading";


            const title =
                document.createElement(
                    "h3"
                );


            title.textContent =
                game.name ||
                "Jeu sans nom";


            const status =
                document.createElement(
                    "span"
                );


            status.className =
                `admin-status-badge admin-status-${escapeHtml(
                    game.status
                )}`;


            status.textContent =
                getGameStatusLabel(
                    game.status
                );


            heading.append(
                title,
                status
            );


            content.appendChild(
                heading
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
                    "admin-game-card-description";


                description.textContent =
                    game.description;


                content.appendChild(
                    description
                );
            }


            /* =================================================
               TAGS
            ================================================= */

            if (
                game.tags.length >
                0
            ) {

                const tagsContainer =
                    document.createElement(
                        "div"
                    );


                tagsContainer.className =
                    "admin-game-card-tags";


                game.tags.forEach(
                    tag => {

                        const tagElement =
                            document.createElement(
                                "span"
                            );


                        tagElement.className =
                            "admin-game-tag";


                        tagElement.textContent =
                            tag;


                        tagsContainer.appendChild(
                            tagElement
                        );
                    }
                );


                content.appendChild(
                    tagsContainer
                );
            }


            /* =================================================
               INFORMATIONS
            ================================================= */

            const meta =
                document.createElement(
                    "div"
                );


            meta.className =
                "admin-game-card-meta";


            if (
                game.twitchId
            ) {

                const twitchId =
                    document.createElement(
                        "span"
                    );


                twitchId.textContent =
                    `Twitch ID : ${game.twitchId}`;


                meta.appendChild(
                    twitchId
                );
            }


            const pollStatus =
                document.createElement(
                    "span"
                );


            pollStatus.textContent =
                game.pollEnabled
                    ? "🗳️ Disponible pour les sondages"
                    : "🗳️ Non proposé dans les sondages";


            meta.appendChild(
                pollStatus
            );


            content.appendChild(
                meta
            );


            /* =================================================
               ACTIONS
            ================================================= */

            const actions =
                document.createElement(
                    "div"
                );


            actions.className =
                "admin-game-card-actions";


            const editButton =
                document.createElement(
                    "button"
                );


            editButton.type =
                "button";


            editButton.className =
                "admin-button admin-button-secondary";


            editButton.textContent =
                "✏️ Modifier";


            editButton.addEventListener(
                "click",
                () => {

                    openGameEditor(
                        game.id
                    );
                }
            );


            actions.appendChild(
                editButton
            );


            content.appendChild(
                actions
            );


            article.append(
                media,
                content
            );


            return article;
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


            const filteredGames =
                getFilteredGames();


            gamesList.innerHTML =
                "";


            /* =================================================
               COMPTEUR
            ================================================= */

            if (
                gamesResultsCount
            ) {

                gamesResultsCount.textContent =
                    filteredGames.length ===
                        1
                        ? "1 jeu"
                        : `${filteredGames.length} jeux`;
            }


            /* =================================================
               AUCUN JEU
            ================================================= */

            if (
                filteredGames.length ===
                0
            ) {

                const emptyState =
                    document.createElement(
                        "div"
                    );


                emptyState.className =
                    "admin-empty-state";


                emptyState.innerHTML =
                    `
                        <span class="admin-empty-state-icon">
                            🎮
                        </span>

                        <strong>
                            Aucun jeu trouvé
                        </strong>

                        <p>
                            Aucun jeu ne correspond aux filtres actuels.
                        </p>
                    `;


                gamesList.appendChild(
                    emptyState
                );


                return;
            }


            /* =================================================
               CARTES
            ================================================= */

            const fragment =
                document.createDocumentFragment();


            filteredGames.forEach(
                game => {

                    fragment.appendChild(
                        createGameCard(
                            game
                        )
                    );
                }
            );


            gamesList.appendChild(
                fragment
            );
        }


        /* =====================================================
           JEUX — RESET FORMULAIRE
        ====================================================== */

        function resetGameForm() {

            currentEditingGameId =
                null;


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
                gameTwitchIdInput
            ) {

                gameTwitchIdInput.value =
                    "";
            }


            if (
                gameSlugInput
            ) {

                gameSlugInput.value =
                    "";
            }


            if (
                gamePollEnabledInput
            ) {

                gamePollEnabledInput.checked =
                    false;
            }


            if (
                gameFormTitle
            ) {

                gameFormTitle.textContent =
                    "Ajouter un jeu";
            }


            if (
                gameDeleteButton
            ) {

                gameDeleteButton.hidden =
                    true;
            }


            if (
                gameSubmitButton
            ) {

                gameSubmitButton.textContent =
                    "Ajouter le jeu";
            }
        }


        /* =====================================================
           JEUX — NOUVEAU JEU
        ====================================================== */

        function openNewGameForm() {

            resetGameForm();


            if (
                gameFormPanel
            ) {

                gameFormPanel.hidden =
                    false;


                gameFormPanel.scrollIntoView({
                    behavior:
                        "smooth",

                    block:
                        "start"
                });
            }


            window.setTimeout(
                () => {

                    gameNameInput
                        ?.focus();

                },
                150
            );
        }


        /* =====================================================
           JEUX — OUVRIR ÉDITEUR
        ====================================================== */

        function openGameEditor(
            gameId
        ) {

            const game =
                games.find(
                    item =>
                        String(
                            item.id
                        ) ===
                        String(
                            gameId
                        )
                );


            if (
                !game
            ) {

                showToast(
                    "Impossible de trouver ce jeu.",
                    "error"
                );


                return;
            }


            currentEditingGameId =
                game.id;


            if (
                gameIdInput
            ) {

                gameIdInput.value =
                    game.id ??
                    "";
            }


            if (
                gameTwitchIdInput
            ) {

                gameTwitchIdInput.value =
                    game.twitchId;
            }


            if (
                gameNameInput
            ) {

                gameNameInput.value =
                    game.name;
            }


            if (
                gameSlugInput
            ) {

                gameSlugInput.value =
                    game.slug;
            }


            if (
                gameBoxArtInput
            ) {

                gameBoxArtInput.value =
                    game.boxArtUrl;
            }


            if (
                gameStatusInput
            ) {

                gameStatusInput.value =
                    game.status;
            }


            if (
                gameTagsInput
            ) {

                gameTagsInput.value =
                    game.tags.join(
                        ", "
                    );
            }


            if (
                gameDescriptionInput
            ) {

                gameDescriptionInput.value =
                    game.description;
            }


            if (
                gamePollEnabledInput
            ) {

                gamePollEnabledInput.checked =
                    game.pollEnabled;
            }


            if (
                gameFormTitle
            ) {

                gameFormTitle.textContent =
                    `Modifier : ${game.name}`;
            }


            if (
                gameDeleteButton
            ) {

                gameDeleteButton.hidden =
                    false;
            }


            if (
                gameSubmitButton
            ) {

                gameSubmitButton.textContent =
                    "Enregistrer les modifications";
            }


            if (
                gameFormPanel
            ) {

                gameFormPanel.hidden =
                    false;


                gameFormPanel.scrollIntoView({
                    behavior:
                        "smooth",

                    block:
                        "start"
                });
            }
        }


        /* =====================================================
           JEUX — FERMER FORMULAIRE
        ====================================================== */

        function closeGameForm() {

            resetGameForm();


            if (
                gameFormPanel
            ) {

                gameFormPanel.hidden =
                    true;
            }
        }


        /* =====================================================
           JEUX — TAGS DU FORMULAIRE
        ====================================================== */

        function getGameFormTags() {

            return normalizeText(
                gameTagsInput
                    ?.value
            )
                .split(
                    ","
                )
                .map(
                    normalizeText
                )
                .filter(
                    Boolean
                );
        }


        /* =====================================================
           JEUX — DONNÉES FORMULAIRE
        ====================================================== */

        function getGameFormData() {

            const name =
                normalizeText(
                    gameNameInput
                        ?.value
                );


            const slug =
                normalizeText(
                    gameSlugInput
                        ?.value
                ) ||
                slugify(
                    name
                );


            return {

                id:
                    currentEditingGameId,

                twitchId:
                    normalizeText(
                        gameTwitchIdInput
                            ?.value
                    ),

                name,

                slug,

                boxArtUrl:
                    normalizeText(
                        gameBoxArtInput
                            ?.value
                    ),

                status:
                    normalizeText(
                        gameStatusInput
                            ?.value
                    ) ||
                    "published",

                tags:
                    getGameFormTags(),

                description:
                    normalizeText(
                        gameDescriptionInput
                            ?.value
                    ),

                pollEnabled:
                    Boolean(
                        gamePollEnabledInput
                            ?.checked
                    )

            };
        }


        /* =====================================================
           JEUX — VALIDATION
        ====================================================== */

        function validateGameForm(
            gameData
        ) {

            if (
                !gameData.name
            ) {

                showToast(
                    "Le nom du jeu est obligatoire.",
                    "error"
                );


                gameNameInput
                    ?.focus();


                return false;
            }


            if (
                !gameData.slug
            ) {

                showToast(
                    "Le slug du jeu est obligatoire.",
                    "error"
                );


                gameSlugInput
                    ?.focus();


                return false;
            }


            return true;
        }


        /* =====================================================
           JEUX — ENREGISTREMENT
        ====================================================== */

        async function saveGame(
            event
        ) {

            event.preventDefault();


            const gameData =
                getGameFormData();


            if (
                !validateGameForm(
                    gameData
                )
            ) {

                return;
            }


            const isEditing =
                currentEditingGameId !==
                null;


            if (
                gameSubmitButton
            ) {

                gameSubmitButton.disabled =
                    true;


                gameSubmitButton.textContent =
                    isEditing
                        ? "Enregistrement..."
                        : "Ajout...";
            }


            try {

                const payload = {

                    twitchId:
                        gameData.twitchId,

                    name:
                        gameData.name,

                    slug:
                        gameData.slug,

                    boxArtUrl:
                        gameData.boxArtUrl,

                    status:
                        gameData.status,

                    tags:
                        gameData.tags,

                    description:
                        gameData.description,

                    pollEnabled:
                        gameData.pollEnabled

                };


                if (
                    isEditing
                ) {

                    payload.id =
                        currentEditingGameId;
                }


                await adminApiRequest(
                    ADMIN_GAMES_API,
                    {
                        method:
                            isEditing
                                ? "PUT"
                                : "POST",

                        body:
                            payload
                    }
                );


                showToast(
                    isEditing
                        ? "Le jeu a été modifié."
                        : "Le jeu a été ajouté."
                );


                closeGameForm();


                await loadGames();


                renderGames();


            } catch (
                error
            ) {

                console.error(
                    "[Admin Games] Enregistrement :",
                    error
                );


                showToast(
                    error?.message ||
                    "Impossible d'enregistrer le jeu.",
                    "error"
                );


            } finally {

                if (
                    gameSubmitButton
                ) {

                    gameSubmitButton.disabled =
                        false;


                    gameSubmitButton.textContent =
                        currentEditingGameId !==
                            null
                            ? "Enregistrer les modifications"
                            : "Ajouter le jeu";
                }
            }
        }


        /* =====================================================
           JEUX — SUPPRESSION
        ====================================================== */

        async function deleteCurrentGame() {

            if (
                currentEditingGameId ===
                null
            ) {

                return;
            }


            const game =
                games.find(
                    item =>
                        String(
                            item.id
                        ) ===
                        String(
                            currentEditingGameId
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


            if (
                gameDeleteButton
            ) {

                gameDeleteButton.disabled =
                    true;


                gameDeleteButton.textContent =
                    "Suppression...";
            }


            try {

                await adminApiRequest(
                    ADMIN_GAMES_API,
                    {
                        method:
                            "DELETE",

                        body: {
                            id:
                                currentEditingGameId
                        }
                    }
                );


                showToast(
                    "Le jeu a été supprimé."
                );


                closeGameForm();


                await loadGames();


                renderGames();


            } catch (
                error
            ) {

                console.error(
                    "[Admin Games] Suppression :",
                    error
                );


                showToast(
                    error?.message ||
                    "Impossible de supprimer le jeu.",
                    "error"
                );


            } finally {

                if (
                    gameDeleteButton
                ) {

                    gameDeleteButton.disabled =
                        false;


                    gameDeleteButton.textContent =
                        "Supprimer";
                }
            }
        }


        /* =====================================================
           JEUX — SLUG AUTOMATIQUE
        ====================================================== */

        let gameSlugEditedManually =
            false;


        gameNameInput
            ?.addEventListener(
                "input",
                () => {

                    if (
                        gameSlugEditedManually
                    ) {

                        return;
                    }


                    if (
                        gameSlugInput
                    ) {

                        gameSlugInput.value =
                            slugify(
                                gameNameInput.value
                            );
                    }
                }
            );


        gameSlugInput
            ?.addEventListener(
                "input",
                () => {

                    gameSlugEditedManually =
                        true;
                }
            );


        /* =====================================================
           JEUX — ÉVÉNEMENTS
        ====================================================== */

        newGameButton
            ?.addEventListener(
                "click",
                () => {

                    gameSlugEditedManually =
                        false;


                    openNewGameForm();
                }
            );


        gameCancelButton
            ?.addEventListener(
                "click",
                () => {

                    closeGameForm();
                }
            );


        gameDeleteButton
            ?.addEventListener(
                "click",
                async () => {

                    await deleteCurrentGame();
                }
            );


        gameForm
            ?.addEventListener(
                "submit",
                saveGame
            );


        gamesSearchInput
            ?.addEventListener(
                "input",
                () => {

                    renderGames();
                }
            );


        gamesStatusFilter
            ?.addEventListener(
                "change",
                () => {

                    renderGames();
                }
            );
                    /* =====================================================
           GALERIE / CRÉDITS
           ÉLÉMENTS COMPLÉMENTAIRES
        ====================================================== */

        const artworksFilter =
            document.getElementById(
                "admin-artworks-filter"
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


        const artworkDropzone =
            document.getElementById(
                "admin-artwork-dropzone"
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


        const artworkFileSize =
            document.getElementById(
                "admin-artwork-file-size"
            );


        const artworkRemoveImage =
            document.getElementById(
                "admin-artwork-remove-image"
            );


        /* =====================================================
           GALERIE — CONFIGURATION FICHIERS
        ====================================================== */

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


        let artworkPreviewObjectUrl =
            null;


        /* =====================================================
           GALERIE — NORMALISER LES TAGS
        ====================================================== */

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
                                    normalizeText(
                                        tag
                                    )
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
                    normalizeText(
                        value
                    )
                        .split(
                            ","
                        )
                        .map(
                            tag =>
                                normalizeText(
                                    tag
                                )
                                    .toLowerCase()
                        )
                        .filter(
                            Boolean
                        )
                )
            ];
        }


        /* =====================================================
           GALERIE — NORMALISER LES MESSAGES
        ====================================================== */

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
                            normalizeText(
                                message
                            )
                    )
                    .filter(
                        Boolean
                    );
            }


            return normalizeText(
                value
            )
                .split(
                    "|"
                )
                .map(
                    message =>
                        normalizeText(
                            message
                        )
                )
                .filter(
                    Boolean
                );
        }


        /* =====================================================
           GALERIE — TAILLE FICHIER
        ====================================================== */

        function formatFileSize(
            bytes
        ) {

            const size =
                Number(
                    bytes
                );


            if (
                !Number.isFinite(
                    size
                ) ||
                size <=
                    0
            ) {

                return "0 octet";
            }


            if (
                size <
                1024
            ) {

                return `${size} octets`;
            }


            if (
                size <
                1024 *
                1024
            ) {

                return `${
                    (
                        size /
                        1024
                    ).toFixed(
                        1
                    )
                } Ko`;
            }


            return `${
                (
                    size /
                    1024 /
                    1024
                ).toFixed(
                    1
                )
            } Mo`;
        }


        /* =====================================================
           ARTWORKS — NORMALISATION
        ====================================================== */

        function normalizeArtwork(
            artwork
        ) {

            if (
                !artwork ||
                typeof artwork !==
                    "object"
            ) {

                return null;
            }


            return {

                id:
                    normalizeText(
                        artwork.id
                    ),

                artId:
                    normalizeText(
                        artwork.artId ??
                        artwork.art_id
                    ),

                sortOrder:
                    normalizeNumber(
                        artwork.sortOrder ??
                        artwork.sort_order,
                        0
                    ),

                artist:
                    normalizeText(
                        artwork.artist
                    ),

                artistRole:
                    normalizeText(
                        artwork.artistRole ??
                        artwork.artist_role
                    ),

                description:
                    normalizeText(
                        artwork.description
                    ),

                imageUrl:
                    normalizeText(
                        artwork.imageUrl ??
                        artwork.image_url
                    ),

                imageAlt:
                    normalizeText(
                        artwork.imageAlt ??
                        artwork.image_alt
                    ),

                mediaType:
                    normalizeText(
                        artwork.mediaType ??
                        artwork.media_type
                    ) ||
                    "image",

                tags:
                    normalizeTags(
                        artwork.tags
                    ),

                imageMessages:
                    normalizeMessages(
                        artwork.imageMessages ??
                        artwork.image_messages
                    ),

                artistUrl:
                    normalizeText(
                        artwork.artistUrl ??
                        artwork.artist_url
                    ),

                buttonText:
                    normalizeText(
                        artwork.buttonText ??
                        artwork.button_text
                    ) ||
                    "Voir son profil",

                buttonMessages:
                    normalizeMessages(
                        artwork.buttonMessages ??
                        artwork.button_messages
                    ),

                sensitive:
                    normalizeBoolean(
                        artwork.sensitive,
                        false
                    ),

                favoriteEnabled:
                    artwork.favoriteEnabled !==
                        undefined
                        ? normalizeBoolean(
                            artwork.favoriteEnabled
                        )
                        : artwork.favorite_enabled !==
                            undefined
                            ? normalizeBoolean(
                                artwork.favorite_enabled
                            )
                            : true,

                visible:
                    artwork.visible !==
                        undefined
                        ? normalizeBoolean(
                            artwork.visible
                        )
                        : true,

                createdAt:
                    artwork.createdAt ??
                    artwork.created_at ??
                    null,

                updatedAt:
                    artwork.updatedAt ??
                    artwork.updated_at ??
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


                const rawArtworks =
                    Array.isArray(
                        data
                    )
                        ? data
                        : (
                            data.artworks ??
                            data.data ??
                            []
                        );


                artworks =
                    normalizeArray(
                        rawArtworks
                    )
                        .map(
                            normalizeArtwork
                        )
                        .filter(
                            Boolean
                        );


                artworks.sort(
                    (
                        firstArtwork,
                        secondArtwork
                    ) =>
                        normalizeNumber(
                            firstArtwork.sortOrder
                        ) -
                        normalizeNumber(
                            secondArtwork.sortOrder
                        )
                );


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
                    error?.message ||
                    "Impossible de charger les illustrations.",
                    "error"
                );
            }
        }


        /* =====================================================
           ARTWORKS — MÉDIA VIDÉO ?
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


        /* =====================================================
           ARTWORKS — HTML DU MÉDIA
        ====================================================== */

        function createArtworkMediaHtml(
            artwork
        ) {

            const url =
                normalizeText(
                    artwork?.imageUrl
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
                        src="${escapeHtml(
                            url
                        )}"
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
                    src="${escapeHtml(
                        url
                    )}"
                    alt="${escapeHtml(
                        artwork.imageAlt ||
                        artwork.artist ||
                        "Illustration"
                    )}"
                    loading="lazy"
                    draggable="false"
                >
            `;
        }


        /* =====================================================
           ARTWORKS — FILTRAGE
        ====================================================== */

        function getFilteredArtworks() {

            const query =
                normalizeText(
                    artworksSearchInput
                        ?.value
                )
                    .toLowerCase();


            const selectedFilter =
                normalizeText(
                    artworksFilter
                        ?.value
                ) ||
                "all";


            return artworks
                .filter(
                    artwork => {

                        switch (
                            selectedFilter
                        ) {

                            case "visible":

                                if (
                                    !artwork.visible
                                ) {

                                    return false;
                                }

                                break;


                            case "hidden":

                                if (
                                    artwork.visible
                                ) {

                                    return false;
                                }

                                break;


                            case "sensitive":

                                if (
                                    !artwork.sensitive
                                ) {

                                    return false;
                                }

                                break;


                            case "favorites":

                                if (
                                    !artwork.favoriteEnabled
                                ) {

                                    return false;
                                }

                                break;
                        }


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
                        firstArtwork,
                        secondArtwork
                    ) =>
                        normalizeNumber(
                            firstArtwork.sortOrder
                        ) -
                        normalizeNumber(
                            secondArtwork.sortOrder
                        )
                );
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


            const filteredArtworks =
                getFilteredArtworks();


            /* =================================================
               COMPTEUR
            ================================================= */

            if (
                artworksResultsCount
            ) {

                artworksResultsCount.textContent =
                    filteredArtworks.length ===
                        1
                        ? "1 illustration"
                        : `${filteredArtworks.length} illustrations`;
            }


            /* =================================================
               VIDE
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
                            Aucune œuvre ne correspond
                            au filtre sélectionné.
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

                            const tags =
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
                                    class="
                                        admin-list-item
                                        admin-artwork-card
                                    "
                                    data-artwork-id="${escapeHtml(
                                        artwork.id
                                    )}"
                                >

                                    <div
                                        class="
                                            admin-list-thumb
                                            admin-artwork-card-media
                                        "
                                    >
                                        ${createArtworkMediaHtml(
                                            artwork
                                        )}
                                    </div>


                                    <div
                                        class="
                                            admin-list-content
                                            admin-artwork-card-content
                                        "
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
                                                ${
                                                    artwork.visible
                                                        ? "👁️ Visible"
                                                        : "🙈 Masquée"
                                                }
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
                                                            artwork.buttonText
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

                                const artworkId =
                                    normalizeText(
                                        button.dataset
                                            .editArtwork
                                    );


                                const artwork =
                                    artworks.find(
                                        item =>
                                            String(
                                                item.id
                                            ) ===
                                            String(
                                                artworkId
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


        /* =====================================================
           ARTWORKS — APERÇU
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
            mediaType = "image"
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


                    artworkPreviewVideo
                        .play()
                        .catch(
                            () => {}
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


        /* =====================================================
           ARTWORKS — EFFACER FICHIER LOCAL
        ====================================================== */

        function clearArtworkFileSelection(
            {
                keepExistingPreview = false
            } = {}
        ) {

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


        /* =====================================================
           ARTWORKS — VALIDATION FICHIER
        ====================================================== */

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


        /* =====================================================
           ARTWORKS — SÉLECTION FICHIER
        ====================================================== */

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
                    "Fichier prêt à être envoyé."
                );


            } catch (
                error
            ) {

                clearArtworkFileSelection();


                showToast(
                    error?.message ||
                    "Fichier invalide.",
                    "error"
                );
            }
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


            /* =====================================================
            ID DE L'ŒUVRE
            ====================================================== */

            const artId =
                normalizeText(
                    artworkArtIdInput
                        ?.value
                );


            if (
                !artId
            ) {

                throw new Error(
                    "L'ID de l'œuvre est obligatoire avant l'upload."
                );
            }


            /* =====================================================
            1 — DEMANDER UNE SIGNATURE AU SERVEUR
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
            2 — ENVOYER LE FICHIER À SUPABASE
            ====================================================== */

            let uploadResponse;


            try {

                uploadResponse =
                    await fetch(
                        upload.signedUrl,
                        {
                            method:
                                "PUT",

                            headers: {

                                "Content-Type":
                                    selectedArtworkFile.type,

                                "x-upsert":
                                    "true"

                            },

                            body:
                                selectedArtworkFile
                        }
                    );


            } catch (
                error
            ) {

                console.error(
                    "[Artwork Upload Supabase]",
                    error
                );


                throw new Error(
                    "Impossible de contacter Supabase Storage."
                );
            }


            /* =====================================================
            ERREUR SUPABASE
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
                    "[Artwork Upload Supabase]",
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
            3 — RETOURNER LES INFOS
            ====================================================== */

            return {

                url:
                    upload.publicUrl,

                mediaType:
                    normalizeText(
                        upload.mediaType
                    ) ||
                    (
                        selectedArtworkFile
                            .type
                            .startsWith(
                                "video/"
                            )
                            ? "video"
                            : "image"
                    )
            };
        }


        /* =====================================================
           ARTWORKS — RESET FORMULAIRE
        ====================================================== */

        function resetArtworkForm() {

            currentEditingArtworkId =
                null;


            artworkForm
                ?.reset();


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
                artworkArtistInput
            ) {

                artworkArtistInput.value =
                    "";
            }


            if (
                artworkRoleInput
            ) {

                artworkRoleInput.value =
                    "";
            }


            if (
                artworkImageUrlInput
            ) {

                artworkImageUrlInput.value =
                    "";
            }


            if (
                artworkImageAltInput
            ) {

                artworkImageAltInput.value =
                    "";
            }


            if (
                artworkMediaTypeInput
            ) {

                artworkMediaTypeInput.value =
                    "image";
            }


            if (
                artworkTagsInput
            ) {

                artworkTagsInput.value =
                    "";
            }


            if (
                artworkDescriptionInput
            ) {

                artworkDescriptionInput.value =
                    "";
            }


            if (
                artworkImageMessagesInput
            ) {

                artworkImageMessagesInput.value =
                    "";
            }


            if (
                artworkArtistUrlInput
            ) {

                artworkArtistUrlInput.value =
                    "";
            }


            if (
                artworkButtonTextInput
            ) {

                artworkButtonTextInput.value =
                    "Voir son profil";
            }


            if (
                artworkButtonMessagesInput
            ) {

                artworkButtonMessagesInput.value =
                    "";
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
                artworkDeleteButton
            ) {

                artworkDeleteButton.hidden =
                    true;
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


        /* =====================================================
           ARTWORKS — OUVRIR / FERMER FORMULAIRE
        ====================================================== */

        function openArtworkForm() {

            if (
                artworkFormPanel
            ) {

                artworkFormPanel.hidden =
                    false;


                artworkFormPanel.scrollIntoView({
                    behavior:
                        "smooth",

                    block:
                        "start"
                });
            }


            window.setTimeout(
                () => {

                    artworkArtistInput
                        ?.focus();

                },
                100
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


        /* =====================================================
           ARTWORKS — REMPLIR FORMULAIRE
        ====================================================== */

        function fillArtworkForm(
            artwork
        ) {

            resetArtworkForm();


            currentEditingArtworkId =
                artwork.id;


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
                artworkDeleteButton
            ) {

                artworkDeleteButton.hidden =
                    false;
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
                        "Déjà enregistré";
                }
            }


            openArtworkForm();
        }


        /* =====================================================
           ARTWORKS — ENREGISTREMENT
        ====================================================== */

        async function saveArtwork(
            event
        ) {

            event.preventDefault();


            const existingId =
                normalizeText(
                    artworkIdInput
                        ?.value
                );


            const artist =
                normalizeText(
                    artworkArtistInput
                        ?.value
                );


            if (
                !artist
            ) {

                showToast(
                    "Le nom de l'artiste est obligatoire.",
                    "error"
                );


                artworkArtistInput
                    ?.focus();


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
                        artworkImageUrlInput
                            ?.value
                    );


                let mediaType =
                    normalizeText(
                        artworkMediaTypeInput
                            ?.value
                    ) ||
                    "image";


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


                if (
                    !imageUrl
                ) {

                    throw new Error(
                        "Ajoute une image, un GIF ou une vidéo."
                    );
                }


                const payload = {

                    artId:
                        normalizeText(
                            artworkArtIdInput
                                ?.value
                        ),

                    sortOrder:
                        normalizeNumber(
                            artworkSortOrderInput
                                ?.value
                        ),

                    artist,

                    artistRole:
                        normalizeText(
                            artworkRoleInput
                                ?.value
                        ),

                    description:
                        normalizeText(
                            artworkDescriptionInput
                                ?.value
                        ),

                    imageUrl,

                    imageAlt:
                        normalizeText(
                            artworkImageAltInput
                                ?.value
                        ),

                    mediaType,

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
                        normalizeText(
                            artworkArtistUrlInput
                                ?.value
                        ),

                    buttonText:
                        normalizeText(
                            artworkButtonTextInput
                                ?.value
                        ) ||
                        "Voir son profil",

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
                        `Illustration de "${artist}" modifiée.`
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
                        `Illustration de "${artist}" ajoutée.`
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


            const confirmed =
                window.confirm(
                    `Supprimer définitivement l'illustration de "${
                        artwork?.artist ||
                        "cet artiste"
                    }" ?`
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
                    "Illustration supprimée."
                );


                if (
                    currentEditingArtworkId &&
                    String(
                        currentEditingArtworkId
                    ) ===
                    normalizedId
                ) {

                    closeArtworkForm();
                }


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
           ARTWORKS — ÉVÉNEMENTS RECHERCHE
        ====================================================== */

        artworksSearchInput
            ?.addEventListener(
                "input",
                renderArtworks
            );


        artworksFilter
            ?.addEventListener(
                "change",
                renderArtworks
            );


        /* =====================================================
           ARTWORKS — NOUVELLE ILLUSTRATION
        ====================================================== */

        newArtworkButton
            ?.addEventListener(
                "click",
                () => {

                    resetArtworkForm();

                    openArtworkForm();
                }
            );


        /* =====================================================
           ARTWORKS — ANNULER
        ====================================================== */

        artworkCancelButton
            ?.addEventListener(
                "click",
                closeArtworkForm
            );


        /* =====================================================
           ARTWORKS — SUPPRIMER DEPUIS FORMULAIRE
        ====================================================== */

        artworkDeleteButton
            ?.addEventListener(
                "click",
                async () => {

                    if (
                        currentEditingArtworkId
                    ) {

                        await deleteArtwork(
                            currentEditingArtworkId
                        );
                    }
                }
            );


        /* =====================================================
           ARTWORKS — INPUT FICHIER
        ====================================================== */

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


        /* =====================================================
           ARTWORKS — DROPZONE
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


                    artworkFileInput
                        ?.click();
                }
            );


            artworkDropzone.addEventListener(
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


            artworkDropzone.addEventListener(
                "dragover",
                event => {

                    event.preventDefault();


                    artworkDropzone
                        .classList
                        .add(
                            "is-dragover"
                        );
                }
            );


            artworkDropzone.addEventListener(
                "dragleave",
                () => {

                    artworkDropzone
                        .classList
                        .remove(
                            "is-dragover"
                        );
                }
            );


            artworkDropzone.addEventListener(
                "drop",
                event => {

                    event.preventDefault();


                    artworkDropzone
                        .classList
                        .remove(
                            "is-dragover"
                        );


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
        }


        /* =====================================================
           ARTWORKS — RETIRER LE MÉDIA
        ====================================================== */

        artworkRemoveImage
            ?.addEventListener(
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
                        "Média retiré du formulaire."
                    );
                }
            );


        /* =====================================================
           ARTWORKS — APERÇU URL
        ====================================================== */

        artworkImageUrlInput
            ?.addEventListener(
                "input",
                () => {

                    if (
                        selectedArtworkFile
                    ) {

                        return;
                    }


                    showArtworkPreviewFromUrl(
                        artworkImageUrlInput.value,
                        normalizeText(
                            artworkMediaTypeInput
                                ?.value
                        ) ||
                        "image"
                    );
                }
            );


        /* =====================================================
           ARTWORKS — CHANGEMENT TYPE MÉDIA
        ====================================================== */

        artworkMediaTypeInput
            ?.addEventListener(
                "change",
                () => {

                    if (
                        selectedArtworkFile
                    ) {

                        return;
                    }


                    showArtworkPreviewFromUrl(
                        artworkImageUrlInput
                            ?.value,
                        artworkMediaTypeInput
                            .value
                    );
                }
            );


        /* =====================================================
           ARTWORKS — SUBMIT
        ====================================================== */

        artworkForm
            ?.addEventListener(
                "submit",
                saveArtwork
            );
                   /* =====================================================
           SONDAGES — NORMALISATION OPTION
        ====================================================== */

        function normalizePollOption(
            option,
            index = 0
        ) {

            if (
                typeof option ===
                "string"
            ) {

                return {

                    id:
                        String(
                            index + 1
                        ),

                    label:
                        normalizeText(
                            option
                        ),

                    imageUrl:
                        "",

                    votes:
                        0,

                    percentage:
                        0

                };
            }


            if (
                !option ||
                typeof option !==
                    "object"
            ) {

                return null;
            }


            return {

                id:
                    normalizeText(
                        option.id ??
                        option.optionId ??
                        option.option_id
                    ) ||
                    String(
                        index + 1
                    ),

                label:
                    normalizeText(
                        option.label ??
                        option.name ??
                        option.title ??
                        option.text
                    ),

                imageUrl:
                    normalizeText(
                        option.imageUrl ??
                        option.image_url ??
                        option.image
                    ),

                votes:
                    normalizeNumber(
                        option.votes,
                        0
                    ),

                percentage:
                    normalizeNumber(
                        option.percentage,
                        0
                    )

            };
        }


        /* =====================================================
           SONDAGES — NORMALISATION
        ====================================================== */

        function normalizePoll(
            poll
        ) {

            if (
                !poll ||
                typeof poll !==
                    "object"
            ) {

                return null;
            }


            const rawOptions =
                Array.isArray(
                    poll.options
                )
                    ? poll.options
                    : [];


            const options =
                rawOptions
                    .map(
                        (
                            option,
                            index
                        ) =>
                            normalizePollOption(
                                option,
                                index
                            )
                    )
                    .filter(
                        option =>
                            option &&
                            option.label
                    );


            const votesFromOptions =
                options.reduce(
                    (
                        total,
                        option
                    ) =>
                        total +
                        normalizeNumber(
                            option.votes,
                            0
                        ),
                    0
                );


            const status =
                normalizeText(
                    poll.status
                ) ||
                "upcoming";


            return {

                id:
                    poll.id ??
                    null,

                slug:
                    normalizeText(
                        poll.slug
                    ),

                title:
                    normalizeText(
                        poll.title
                    ) ||
                    normalizeText(
                        poll.question
                    ) ||
                    "Sondage",

                question:
                    normalizeText(
                        poll.question
                    ),

                description:
                    normalizeText(
                        poll.description
                    ),

                category:
                    normalizeText(
                        poll.category
                    ) ||
                    "community",

                status,

                options,

                totalVotes:
                    normalizeNumber(
                        poll.totalVotes ??
                        poll.total_votes,
                        votesFromOptions
                    ),

                winner:
                    poll.winner ??
                    null,

                startsAt:
                    poll.startsAt ??
                    poll.starts_at ??
                    null,

                endsAt:
                    poll.endsAt ??
                    poll.ends_at ??
                    null,

                resultsVisible:
                    normalizeBoolean(
                        poll.resultsVisible ??
                        poll.results_visible,
                        true
                    ),

                allowSuggestions:
                    normalizeBoolean(
                        poll.allowSuggestions ??
                        poll.allow_suggestions,
                        false
                    ),

                createdAt:
                    poll.createdAt ??
                    poll.created_at ??
                    null,

                updatedAt:
                    poll.updatedAt ??
                    poll.updated_at ??
                    null

            };
        }


        /* =====================================================
           SONDAGES — CHARGEMENT
        ====================================================== */

        async function loadPolls() {

            try {

                const data =
                    await adminApiRequest(
                        ADMIN_POLLS_API,
                        {
                            method:
                                "GET"
                        }
                    );


                const rawPolls =
                    Array.isArray(
                        data
                    )
                        ? data
                        : (
                            data.polls ??
                            data.data ??
                            []
                        );


                polls =
                    normalizeArray(
                        rawPolls
                    )
                        .map(
                            normalizePoll
                        )
                        .filter(
                            Boolean
                        );


                updateDashboardStats();


            } catch (
                error
            ) {

                console.error(
                    "[Admin Polls] Chargement :",
                    error
                );


                polls =
                    [];


                updateDashboardStats();


                showToast(
                    error?.message ||
                    "Impossible de charger les sondages.",
                    "error"
                );
            }
        }


        /* =====================================================
           SONDAGES — FILTRAGE
        ====================================================== */

        function getFilteredPolls() {

            const search =
                normalizeText(
                    pollsSearchInput
                        ?.value
                )
                    .toLowerCase();


            const status =
                normalizeText(
                    pollsStatusFilter
                        ?.value
                ) ||
                "all";


            const category =
                normalizeText(
                    pollsCategoryFilter
                        ?.value
                ) ||
                "all";


            return polls.filter(
                poll => {

                    /* =========================================
                       RECHERCHE
                    ========================================= */

                    if (
                        search
                    ) {

                        const haystack =
                            [
                                poll.title,
                                poll.slug,
                                poll.question,
                                poll.description,
                                poll.category,
                                ...poll.options.map(
                                    option =>
                                        option.label
                                )
                            ]
                                .join(
                                    " "
                                )
                                .toLowerCase();


                        if (
                            !haystack.includes(
                                search
                            )
                        ) {

                            return false;
                        }
                    }


                    /* =========================================
                       STATUT
                    ========================================= */

                    if (
                        status !==
                            "all" &&
                        poll.status !==
                            status
                    ) {

                        return false;
                    }


                    /* =========================================
                       CATÉGORIE
                    ========================================= */

                    if (
                        category !==
                            "all" &&
                        poll.category !==
                            category
                    ) {

                        return false;
                    }


                    return true;
                }
            );
        }


        /* =====================================================
           SONDAGES — TEXTE DU GAGNANT
        ====================================================== */

        function getPollWinnerLabel(
            poll
        ) {

            if (
                !poll
            ) {

                return "—";
            }


            if (
                typeof poll.winner ===
                "string"
            ) {

                return (
                    normalizeText(
                        poll.winner
                    ) ||
                    "—"
                );
            }


            if (
                poll.winner &&
                typeof poll.winner ===
                    "object"
            ) {

                return (
                    normalizeText(
                        poll.winner.label ??
                        poll.winner.name
                    ) ||
                    "—"
                );
            }


            if (
                poll.options.length ===
                0
            ) {

                return "—";
            }


            const sortedOptions =
                [
                    ...poll.options
                ].sort(
                    (
                        first,
                        second
                    ) =>
                        normalizeNumber(
                            second.votes
                        ) -
                        normalizeNumber(
                            first.votes
                        )
                );


            const bestOption =
                sortedOptions[0];


            if (
                !bestOption ||
                normalizeNumber(
                    bestOption.votes
                ) <=
                    0
            ) {

                return "—";
            }


            return bestOption.label;
        }


        /* =====================================================
           SONDAGES — CARTE
        ====================================================== */

        function createPollCardHtml(
            poll
        ) {

            const totalVotes =
                normalizeNumber(
                    poll.totalVotes
                );


            const dateParts =
                [];


            if (
                poll.startsAt
            ) {

                dateParts.push(
                    `Début : ${formatDate(
                        poll.startsAt
                    )}`
                );
            }


            if (
                poll.endsAt
            ) {

                dateParts.push(
                    `Fin : ${formatDate(
                        poll.endsAt
                    )}`
                );
            }


            const datesHtml =
                dateParts.length >
                    0
                    ? `
                        <div class="admin-poll-card-dates">

                            ${dateParts
                                .map(
                                    date => `
                                        <span>
                                            ${escapeHtml(
                                                date
                                            )}
                                        </span>
                                    `
                                )
                                .join(
                                    ""
                                )}

                        </div>
                    `
                    : "";


            return `
                <article
                    class="admin-poll-card"
                    data-poll-id="${escapeHtml(
                        poll.id
                    )}"
                >

                    <div class="admin-poll-card-header">

                        <div>

                            <span
                                class="
                                    admin-poll-status
                                    is-${escapeHtml(
                                        poll.status
                                    )}
                                "
                            >
                                ${escapeHtml(
                                    getPollStatusLabel(
                                        poll.status
                                    )
                                )}
                            </span>


                            <span
                                class="admin-poll-category"
                            >
                                ${escapeHtml(
                                    getPollCategoryLabel(
                                        poll.category
                                    )
                                )}
                            </span>

                        </div>


                        <strong
                            class="admin-poll-votes"
                        >
                            🗳️ ${totalVotes}
                            vote${
                                totalVotes >
                                1
                                    ? "s"
                                    : ""
                            }
                        </strong>

                    </div>


                    <div class="admin-poll-card-content">

                        <h3>
                            ${escapeHtml(
                                poll.title
                            )}
                        </h3>


                        ${
                            poll.question
                                ? `
                                    <p
                                        class="admin-poll-question"
                                    >
                                        ${escapeHtml(
                                            poll.question
                                        )}
                                    </p>
                                `
                                : ""
                        }


                        ${
                            poll.description
                                ? `
                                    <p
                                        class="admin-poll-description"
                                    >
                                        ${escapeHtml(
                                            poll.description
                                        )}
                                    </p>
                                `
                                : ""
                        }


                        <div
                            class="admin-poll-card-meta"
                        >

                            <span>
                                ☑️ ${poll.options.length}
                                réponse${
                                    poll.options.length >
                                    1
                                        ? "s"
                                        : ""
                                }
                            </span>


                            <span>
                                ${
                                    poll.resultsVisible
                                        ? "👁️ Résultats visibles"
                                        : "🙈 Résultats cachés"
                                }
                            </span>


                            ${
                                poll.allowSuggestions
                                    ? `
                                        <span>
                                            💡 Propositions autorisées
                                        </span>
                                    `
                                    : ""
                            }

                        </div>


                        ${datesHtml}

                    </div>


                    <div
                        class="admin-poll-card-actions"
                    >

                        <button
                            type="button"
                            class="admin-secondary-button"
                            data-poll-results="${escapeHtml(
                                poll.id
                            )}"
                        >
                            📊 Résultats
                        </button>


                        <button
                            type="button"
                            class="admin-secondary-button"
                            data-edit-poll="${escapeHtml(
                                poll.id
                            )}"
                        >
                            ✏️ Modifier
                        </button>


                        ${
                            poll.status ===
                                "upcoming"
                                ? `
                                    <button
                                        type="button"
                                        class="admin-primary-button"
                                        data-activate-poll="${escapeHtml(
                                            poll.id
                                        )}"
                                    >
                                        🔥 Ouvrir
                                    </button>
                                `
                                : ""
                        }


                        ${
                            poll.status ===
                                "active"
                                ? `
                                    <button
                                        type="button"
                                        class="admin-secondary-button"
                                        data-finish-poll="${escapeHtml(
                                            poll.id
                                        )}"
                                    >
                                        🏆 Terminer
                                    </button>
                                `
                                : ""
                        }

                    </div>

                </article>
            `;
        }


        /* =====================================================
           SONDAGES — ÉTAT VIDE
        ====================================================== */

        function getPollEmptyState(
            icon,
            title,
            description
        ) {

            return `
                <div class="admin-empty-state">

                    <span
                        class="admin-empty-icon"
                        aria-hidden="true"
                    >
                        ${icon}
                    </span>

                    <h3>
                        ${escapeHtml(
                            title
                        )}
                    </h3>

                    <p>
                        ${escapeHtml(
                            description
                        )}
                    </p>

                </div>
            `;
        }


        /* =====================================================
           SONDAGES — AFFICHAGE
        ====================================================== */

        function renderPolls() {

            const filteredPolls =
                getFilteredPolls();


            const activePolls =
                filteredPolls.filter(
                    poll =>
                        poll.status ===
                        "active"
                );


            const upcomingPolls =
                filteredPolls.filter(
                    poll =>
                        poll.status ===
                        "upcoming"
                );


            const finishedPolls =
                filteredPolls.filter(
                    poll =>
                        poll.status ===
                        "finished"
                );


            /* =================================================
               COMPTEUR GLOBAL
            ================================================= */

            if (
                pollsResultsCount
            ) {

                pollsResultsCount.textContent =
                    filteredPolls.length ===
                        1
                        ? "1 sondage affiché."
                        : `${filteredPolls.length} sondages affichés.`;
            }


            /* =================================================
               COMPTEURS
            ================================================= */

            if (
                pollsActiveCount
            ) {

                pollsActiveCount.textContent =
                    String(
                        activePolls.length
                    );
            }


            if (
                pollsUpcomingCount
            ) {

                pollsUpcomingCount.textContent =
                    String(
                        upcomingPolls.length
                    );
            }


            if (
                pollsFinishedCount
            ) {

                pollsFinishedCount.textContent =
                    String(
                        finishedPolls.length
                    );
            }


            /* =================================================
               ACTIVE
            ================================================= */

            if (
                pollsActiveList
            ) {

                pollsActiveList.innerHTML =
                    activePolls.length >
                        0
                        ? activePolls
                            .map(
                                createPollCardHtml
                            )
                            .join(
                                ""
                            )
                        : getPollEmptyState(
                            "🔥",
                            "Aucun sondage en cours",
                            "Aucun sondage actif ne correspond aux filtres."
                        );
            }


            /* =================================================
               UPCOMING
            ================================================= */

            if (
                pollsUpcomingList
            ) {

                pollsUpcomingList.innerHTML =
                    upcomingPolls.length >
                        0
                        ? upcomingPolls
                            .map(
                                createPollCardHtml
                            )
                            .join(
                                ""
                            )
                        : getPollEmptyState(
                            "📅",
                            "Aucun sondage à venir",
                            "Aucun sondage programmé ne correspond aux filtres."
                        );
            }


            /* =================================================
               FINISHED
            ================================================= */

            if (
                pollsFinishedList
            ) {

                pollsFinishedList.innerHTML =
                    finishedPolls.length >
                        0
                        ? finishedPolls
                            .map(
                                createPollCardHtml
                            )
                            .join(
                                ""
                            )
                        : getPollEmptyState(
                            "🏆",
                            "Aucun sondage terminé",
                            "Aucun sondage terminé ne correspond aux filtres."
                        );
            }


            bindPollCardEvents();


            updateDashboardStats();
        }


        /* =====================================================
           SONDAGES — AJOUTER UNE OPTION AU FORMULAIRE
        ====================================================== */

        function addPollOptionField(
            option = null
        ) {

            if (
                !pollOptionsList
            ) {

                return;
            }


            const normalizedOption =
                normalizePollOption(
                    option ||
                    {},
                    pollOptionsList.children.length
                );


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "admin-poll-option-row";


            row.dataset.optionId =
                normalizeText(
                    normalizedOption?.id
                ) ||
                crypto.randomUUID?.() ||
                String(
                    Date.now()
                );


            row.innerHTML = `
                <div class="admin-poll-option-fields">

                    <input
                        type="text"
                        class="admin-poll-option-label"
                        placeholder="Réponse..."
                        maxlength="150"
                        value="${escapeHtml(
                            normalizedOption?.label ||
                            ""
                        )}"
                        required
                    >


                    <input
                        type="url"
                        class="admin-poll-option-image"
                        placeholder="URL image facultative"
                        value="${escapeHtml(
                            normalizedOption?.imageUrl ||
                            ""
                        )}"
                    >

                </div>


                <button
                    type="button"
                    class="admin-danger-button admin-poll-option-remove"
                    aria-label="Supprimer cette réponse"
                >
                    🗑️
                </button>
            `;


            row
                .querySelector(
                    ".admin-poll-option-remove"
                )
                ?.addEventListener(
                    "click",
                    () => {

                        if (
                            pollOptionsList.children.length <=
                            2
                        ) {

                            showToast(
                                "Un sondage doit avoir au moins deux réponses.",
                                "error"
                            );


                            return;
                        }


                        row.remove();
                    }
                );


            pollOptionsList.appendChild(
                row
            );
        }


        /* =====================================================
           SONDAGES — RÉCUPÉRER LES OPTIONS DU FORMULAIRE
        ====================================================== */

        function getPollFormOptions() {

            if (
                !pollOptionsList
            ) {

                return [];
            }


            return Array.from(
                pollOptionsList.querySelectorAll(
                    ".admin-poll-option-row"
                )
            )
                .map(
                    (
                        row,
                        index
                    ) => {

                        const label =
                            normalizeText(
                                row
                                    .querySelector(
                                        ".admin-poll-option-label"
                                    )
                                    ?.value
                            );


                        const imageUrl =
                            normalizeText(
                                row
                                    .querySelector(
                                        ".admin-poll-option-image"
                                    )
                                    ?.value
                            );


                        return {

                            id:
                                normalizeText(
                                    row.dataset
                                        .optionId
                                ) ||
                                String(
                                    index + 1
                                ),

                            label,

                            imageUrl

                        };
                    }
                )
                .filter(
                    option =>
                        option.label
                );
        }


        /* =====================================================
           SONDAGES — RESET FORMULAIRE
        ====================================================== */

        function resetPollForm() {

            currentEditingPollId =
                null;


            pollForm
                ?.reset();


            if (
                pollIdInput
            ) {

                pollIdInput.value =
                    "";
            }


            if (
                pollTitleInput
            ) {

                pollTitleInput.value =
                    "";
            }


            if (
                pollSlugInput
            ) {

                pollSlugInput.value =
                    "";
            }


            if (
                pollQuestionInput
            ) {

                pollQuestionInput.value =
                    "";
            }


            if (
                pollDescriptionInput
            ) {

                pollDescriptionInput.value =
                    "";
            }


            if (
                pollCategoryInput
            ) {

                pollCategoryInput.value =
                    "games";
            }


            if (
                pollStatusInput
            ) {

                pollStatusInput.value =
                    "active";
            }


            if (
                pollStartDateInput
            ) {

                pollStartDateInput.value =
                    "";
            }


            if (
                pollStartTimeInput
            ) {

                pollStartTimeInput.value =
                    "";
            }


            if (
                pollEndDateInput
            ) {

                pollEndDateInput.value =
                    "";
            }


            if (
                pollEndTimeInput
            ) {

                pollEndTimeInput.value =
                    "";
            }


            if (
                pollResultsVisibilityInput
            ) {

                pollResultsVisibilityInput.value =
                    "visible";
            }


            if (
                pollAllowSuggestionsInput
            ) {

                pollAllowSuggestionsInput.checked =
                    false;
            }


            if (
                pollOptionsList
            ) {

                pollOptionsList.innerHTML =
                    "";


                addPollOptionField();

                addPollOptionField();
            }


            if (
                pollFormTitle
            ) {

                pollFormTitle.textContent =
                    "Créer un sondage";
            }


            if (
                pollDeleteButton
            ) {

                pollDeleteButton.hidden =
                    true;
            }


            if (
                pollSubmitButton
            ) {

                pollSubmitButton.disabled =
                    false;


                pollSubmitButton.textContent =
                    "💾 Enregistrer le sondage";
            }
        }


        /* =====================================================
           SONDAGES — OUVRIR FORMULAIRE
        ====================================================== */

        function openPollForm() {

            if (
                pollFormPanel
            ) {

                pollFormPanel.hidden =
                    false;


                pollFormPanel.scrollIntoView({
                    behavior:
                        "smooth",

                    block:
                        "start"
                });
            }


            window.setTimeout(
                () => {

                    pollTitleInput
                        ?.focus();

                },
                100
            );
        }


        /* =====================================================
           SONDAGES — FERMER FORMULAIRE
        ====================================================== */

        function closePollForm() {

            resetPollForm();


            if (
                pollFormPanel
            ) {

                pollFormPanel.hidden =
                    true;
            }
        }


        /* =====================================================
           SONDAGES — NOUVEAU
        ====================================================== */

        function openNewPollForm() {

            resetPollForm();

            openPollForm();
        }


        /* =====================================================
           SONDAGES — MODIFICATION
        ====================================================== */

        function openPollEditor(
            pollId
        ) {

            const poll =
                polls.find(
                    item =>
                        String(
                            item.id
                        ) ===
                        String(
                            pollId
                        )
                );


            if (
                !poll
            ) {

                showToast(
                    "Impossible de trouver ce sondage.",
                    "error"
                );


                return;
            }


            resetPollForm();


            currentEditingPollId =
                poll.id;


            if (
                pollIdInput
            ) {

                pollIdInput.value =
                    poll.id;
            }


            if (
                pollTitleInput
            ) {

                pollTitleInput.value =
                    poll.title;
            }


            if (
                pollSlugInput
            ) {

                pollSlugInput.value =
                    poll.slug;
            }


            if (
                pollQuestionInput
            ) {

                pollQuestionInput.value =
                    poll.question;
            }


            if (
                pollDescriptionInput
            ) {

                pollDescriptionInput.value =
                    poll.description;
            }


            if (
                pollCategoryInput
            ) {

                pollCategoryInput.value =
                    poll.category;
            }


            if (
                pollStatusInput
            ) {

                pollStatusInput.value =
                    poll.status;
            }


            if (
                pollStartDateInput
            ) {

                pollStartDateInput.value =
                    getDateInputValue(
                        poll.startsAt
                    );
            }


            if (
                pollStartTimeInput
            ) {

                pollStartTimeInput.value =
                    getTimeInputValue(
                        poll.startsAt
                    );
            }


            if (
                pollEndDateInput
            ) {

                pollEndDateInput.value =
                    getDateInputValue(
                        poll.endsAt
                    );
            }


            if (
                pollEndTimeInput
            ) {

                pollEndTimeInput.value =
                    getTimeInputValue(
                        poll.endsAt
                    );
            }


            if (
                pollResultsVisibilityInput
            ) {

                pollResultsVisibilityInput.value =
                    poll.resultsVisible
                        ? "visible"
                        : "after";
            }


            if (
                pollAllowSuggestionsInput
            ) {

                pollAllowSuggestionsInput.checked =
                    poll.allowSuggestions;
            }


            if (
                pollOptionsList
            ) {

                pollOptionsList.innerHTML =
                    "";


                poll.options.forEach(
                    option => {

                        addPollOptionField(
                            option
                        );
                    }
                );


                while (
                    pollOptionsList.children.length <
                    2
                ) {

                    addPollOptionField();
                }
            }


            if (
                pollFormTitle
            ) {

                pollFormTitle.textContent =
                    `Modifier : ${poll.title}`;
            }


            if (
                pollDeleteButton
            ) {

                pollDeleteButton.hidden =
                    false;
            }


            if (
                pollSubmitButton
            ) {

                pollSubmitButton.textContent =
                    "💾 Enregistrer les modifications";
            }


            openPollForm();
        }


        /* =====================================================
           SONDAGES — DONNÉES FORMULAIRE
        ====================================================== */

        function getPollFormData() {

            const title =
                normalizeText(
                    pollTitleInput
                        ?.value
                );


            const slug =
                normalizeText(
                    pollSlugInput
                        ?.value
                ) ||
                slugify(
                    title
                );


            const startsAt =
                createDateTimeValue(
                    pollStartDateInput
                        ?.value,
                    pollStartTimeInput
                        ?.value
                );


            const endsAt =
                createDateTimeValue(
                    pollEndDateInput
                        ?.value,
                    pollEndTimeInput
                        ?.value
                );


            return {

                id:
                    currentEditingPollId,

                title,

                slug,

                question:
                    normalizeText(
                        pollQuestionInput
                            ?.value
                    ),

                description:
                    normalizeText(
                        pollDescriptionInput
                            ?.value
                    ),

                category:
                    normalizeText(
                        pollCategoryInput
                            ?.value
                    ) ||
                    "community",

                status:
                    normalizeText(
                        pollStatusInput
                            ?.value
                    ) ||
                    "upcoming",

                startsAt,

                endsAt,

                resultsVisible:
                    pollResultsVisibilityInput
                        ?.value !==
                    "after",

                allowSuggestions:
                    Boolean(
                        pollAllowSuggestionsInput
                            ?.checked
                    ),

                options:
                    getPollFormOptions()

            };
        }


        /* =====================================================
           SONDAGES — VALIDATION
        ====================================================== */

        function validatePollForm(
            pollData
        ) {

            if (
                !pollData.title
            ) {

                showToast(
                    "Le titre du sondage est obligatoire.",
                    "error"
                );


                pollTitleInput
                    ?.focus();


                return false;
            }


            if (
                !pollData.slug
            ) {

                showToast(
                    "Le slug du sondage est obligatoire.",
                    "error"
                );


                pollSlugInput
                    ?.focus();


                return false;
            }


            if (
                !pollData.question
            ) {

                showToast(
                    "La question du sondage est obligatoire.",
                    "error"
                );


                pollQuestionInput
                    ?.focus();


                return false;
            }


            if (
                pollData.options.length <
                2
            ) {

                showToast(
                    "Ajoute au moins deux réponses.",
                    "error"
                );


                return false;
            }


            const uniqueLabels =
                new Set(
                    pollData.options.map(
                        option =>
                            option.label
                                .toLowerCase()
                    )
                );


            if (
                uniqueLabels.size !==
                pollData.options.length
            ) {

                showToast(
                    "Deux réponses ne peuvent pas avoir exactement le même nom.",
                    "error"
                );


                return false;
            }


            if (
                pollData.startsAt &&
                pollData.endsAt &&
                new Date(
                    pollData.endsAt
                ) <=
                new Date(
                    pollData.startsAt
                )
            ) {

                showToast(
                    "La date de fin doit être après la date de début.",
                    "error"
                );


                return false;
            }


            return true;
        }


        /* =====================================================
           SONDAGES — ENREGISTREMENT
        ====================================================== */

        async function savePoll(
            event
        ) {

            event.preventDefault();


            const pollData =
                getPollFormData();


            if (
                !validatePollForm(
                    pollData
                )
            ) {

                return;
            }


            const isEditing =
                currentEditingPollId !==
                null;


            if (
                pollSubmitButton
            ) {

                pollSubmitButton.disabled =
                    true;


                pollSubmitButton.textContent =
                    "Enregistrement...";
            }


            try {

                const payload = {

                    title:
                        pollData.title,

                    slug:
                        pollData.slug,

                    question:
                        pollData.question,

                    description:
                        pollData.description,

                    category:
                        pollData.category,

                    status:
                        pollData.status,

                    startsAt:
                        pollData.startsAt,

                    endsAt:
                        pollData.endsAt,

                    resultsVisible:
                        pollData.resultsVisible,

                    allowSuggestions:
                        pollData.allowSuggestions,

                    options:
                        pollData.options

                };


                if (
                    isEditing
                ) {

                    payload.id =
                        currentEditingPollId;
                }


                await adminApiRequest(
                    ADMIN_POLLS_API,
                    {
                        method:
                            isEditing
                                ? "PUT"
                                : "POST",

                        body:
                            payload
                    }
                );


                showToast(
                    isEditing
                        ? "Le sondage a été modifié."
                        : "Le sondage a été créé."
                );


                closePollForm();


                await loadPolls();


                renderPolls();


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
                    pollSubmitButton
                ) {

                    pollSubmitButton.disabled =
                        false;


                    pollSubmitButton.textContent =
                        currentEditingPollId !==
                            null
                            ? "💾 Enregistrer les modifications"
                            : "💾 Enregistrer le sondage";
                }
            }
        }


        /* =====================================================
           SONDAGES — SUPPRESSION
        ====================================================== */

        async function deletePoll(
            pollId
        ) {

            const poll =
                polls.find(
                    item =>
                        String(
                            item.id
                        ) ===
                        String(
                            pollId
                        )
                );


            if (
                !poll
            ) {

                return;
            }


            const confirmed =
                window.confirm(
                    `Supprimer définitivement le sondage "${poll.title}" et tous ses votes ?`
                );


            if (
                !confirmed
            ) {

                return;
            }


            try {

                await adminApiRequest(
                    ADMIN_POLLS_API,
                    {
                        method:
                            "DELETE",

                        body: {
                            id:
                                poll.id
                        }
                    }
                );


                showToast(
                    "Le sondage a été supprimé."
                );


                if (
                    currentEditingPollId &&
                    String(
                        currentEditingPollId
                    ) ===
                    String(
                        poll.id
                    )
                ) {

                    closePollForm();
                }


                if (
                    currentResultsPollId &&
                    String(
                        currentResultsPollId
                    ) ===
                    String(
                        poll.id
                    )
                ) {

                    closePollResults();
                }


                await loadPolls();


                renderPolls();


            } catch (
                error
            ) {

                console.error(
                    "[Admin Poll Delete]",
                    error
                );


                showToast(
                    error?.message ||
                    "Impossible de supprimer le sondage.",
                    "error"
                );
            }
        }


        /* =====================================================
           SONDAGES — MODIFIER RAPIDEMENT LE STATUT
        ====================================================== */

        async function changePollStatus(
            pollId,
            status
        ) {

            const poll =
                polls.find(
                    item =>
                        String(
                            item.id
                        ) ===
                        String(
                            pollId
                        )
                );


            if (
                !poll
            ) {

                return;
            }


            try {

                await adminApiRequest(
                    ADMIN_POLLS_API,
                    {
                        method:
                            "PUT",

                        body: {

                            id:
                                poll.id,

                            title:
                                poll.title,

                            slug:
                                poll.slug,

                            question:
                                poll.question,

                            description:
                                poll.description,

                            category:
                                poll.category,

                            status,

                            startsAt:
                                poll.startsAt,

                            endsAt:
                                poll.endsAt,

                            resultsVisible:
                                poll.resultsVisible,

                            allowSuggestions:
                                poll.allowSuggestions,

                            options:
                                poll.options.map(
                                    option => ({

                                        id:
                                            option.id,

                                        label:
                                            option.label,

                                        imageUrl:
                                            option.imageUrl

                                    })
                                )

                        }
                    }
                );


                showToast(
                    status ===
                        "active"
                        ? "Le sondage est maintenant ouvert."
                        : status ===
                            "finished"
                            ? "Le sondage est terminé."
                            : "Le statut du sondage a été modifié."
                );


                await loadPolls();


                renderPolls();


            } catch (
                error
            ) {

                console.error(
                    "[Admin Poll Status]",
                    error
                );


                showToast(
                    error?.message ||
                    "Impossible de modifier le statut du sondage.",
                    "error"
                );
            }
        }


        /* =====================================================
           SONDAGES — POURCENTAGE
        ====================================================== */

        function getPollOptionPercentage(
            poll,
            option
        ) {

            const explicitPercentage =
                normalizeNumber(
                    option.percentage,
                    -1
                );


            if (
                explicitPercentage >=
                    0 &&
                explicitPercentage <=
                    100 &&
                poll.totalVotes >
                    0
            ) {

                return explicitPercentage;
            }


            const totalVotes =
                normalizeNumber(
                    poll.totalVotes
                );


            if (
                totalVotes <=
                0
            ) {

                return 0;
            }


            return (
                normalizeNumber(
                    option.votes
                ) /
                totalVotes
            ) *
            100;
        }


        /* =====================================================
           SONDAGES — RÉSULTATS
        ====================================================== */

        function openPollResults(
            pollId
        ) {

            const poll =
                polls.find(
                    item =>
                        String(
                            item.id
                        ) ===
                        String(
                            pollId
                        )
                );


            if (
                !poll ||
                !pollResultsPanel
            ) {

                return;
            }


            currentResultsPollId =
                poll.id;


            if (
                pollResultsTitle
            ) {

                pollResultsTitle.textContent =
                    `Résultats — ${poll.title}`;
            }


            if (
                pollResultsTotal
            ) {

                pollResultsTotal.textContent =
                    String(
                        poll.totalVotes
                    );
            }


            if (
                pollResultsStatus
            ) {

                pollResultsStatus.textContent =
                    getPollStatusLabel(
                        poll.status
                    );
            }


            if (
                pollResultsWinner
            ) {

                pollResultsWinner.textContent =
                    getPollWinnerLabel(
                        poll
                    );
            }


            if (
                pollResultsList
            ) {

                if (
                    poll.options.length ===
                    0
                ) {

                    pollResultsList.innerHTML =
                        getPollEmptyState(
                            "📊",
                            "Aucun résultat",
                            "Ce sondage ne contient aucune réponse."
                        );

                } else {

                    pollResultsList.innerHTML =
                        poll.options
                            .map(
                                option => {

                                    const votes =
                                        normalizeNumber(
                                            option.votes
                                        );


                                    const percentage =
                                        getPollOptionPercentage(
                                            poll,
                                            option
                                        );


                                    return `
                                        <article
                                            class="admin-poll-result"
                                        >

                                            <div
                                                class="admin-poll-result-heading"
                                            >

                                                <strong>
                                                    ${escapeHtml(
                                                        option.label
                                                    )}
                                                </strong>


                                                <span>
                                                    ${votes}
                                                    vote${
                                                        votes >
                                                        1
                                                            ? "s"
                                                            : ""
                                                    }
                                                    —
                                                    ${percentage.toFixed(
                                                        1
                                                    )} %
                                                </span>

                                            </div>


                                            <div
                                                class="admin-poll-result-bar"
                                                aria-hidden="true"
                                            >

                                                <span
                                                    style="width: ${Math.min(
                                                        100,
                                                        Math.max(
                                                            0,
                                                            percentage
                                                        )
                                                    )}%"
                                                ></span>

                                            </div>

                                        </article>
                                    `;
                                }
                            )
                            .join(
                                ""
                            );
                }
            }


            pollResultsPanel.hidden =
                false;


            pollResultsPanel.scrollIntoView({
                behavior:
                    "smooth",

                block:
                    "start"
            });
        }


        /* =====================================================
           SONDAGES — FERMER RÉSULTATS
        ====================================================== */

        function closePollResults() {

            currentResultsPollId =
                null;


            if (
                pollResultsPanel
            ) {

                pollResultsPanel.hidden =
                    true;
            }
        }


        /* =====================================================
           SONDAGES — ÉVÉNEMENTS DES CARTES
        ====================================================== */

        function bindPollCardEvents() {

            document
                .querySelectorAll(
                    "[data-edit-poll]"
                )
                .forEach(
                    button => {

                        button.addEventListener(
                            "click",
                            () => {

                                openPollEditor(
                                    button.dataset
                                        .editPoll
                                );
                            }
                        );
                    }
                );


            document
                .querySelectorAll(
                    "[data-poll-results]"
                )
                .forEach(
                    button => {

                        button.addEventListener(
                            "click",
                            () => {

                                openPollResults(
                                    button.dataset
                                        .pollResults
                                );
                            }
                        );
                    }
                );


            document
                .querySelectorAll(
                    "[data-activate-poll]"
                )
                .forEach(
                    button => {

                        button.addEventListener(
                            "click",
                            async () => {

                                await changePollStatus(
                                    button.dataset
                                        .activatePoll,
                                    "active"
                                );
                            }
                        );
                    }
                );


            document
                .querySelectorAll(
                    "[data-finish-poll]"
                )
                .forEach(
                    button => {

                        button.addEventListener(
                            "click",
                            async () => {

                                const confirmed =
                                    window.confirm(
                                        "Terminer ce sondage ? Les visiteurs ne pourront plus voter."
                                    );


                                if (
                                    !confirmed
                                ) {

                                    return;
                                }


                                await changePollStatus(
                                    button.dataset
                                        .finishPoll,
                                    "finished"
                                );
                            }
                        );
                    }
                );
        }


        /* =====================================================
           SONDAGES — SLUG AUTOMATIQUE
        ====================================================== */

        let pollSlugEditedManually =
            false;


        pollTitleInput
            ?.addEventListener(
                "input",
                () => {

                    if (
                        pollSlugEditedManually
                    ) {

                        return;
                    }


                    if (
                        pollSlugInput
                    ) {

                        pollSlugInput.value =
                            slugify(
                                pollTitleInput.value
                            );
                    }
                }
            );


        pollSlugInput
            ?.addEventListener(
                "input",
                () => {

                    pollSlugEditedManually =
                        true;
                }
            );


        /* =====================================================
           SONDAGES — NOUVEAU
        ====================================================== */

        newPollButton
            ?.addEventListener(
                "click",
                () => {

                    pollSlugEditedManually =
                        false;


                    openNewPollForm();
                }
            );


        /* =====================================================
           SONDAGES — AJOUT OPTION
        ====================================================== */

        pollAddOptionButton
            ?.addEventListener(
                "click",
                () => {

                    addPollOptionField();
                }
            );


        /* =====================================================
           SONDAGES — ANNULER
        ====================================================== */

        pollCancelButton
            ?.addEventListener(
                "click",
                () => {

                    closePollForm();
                }
            );


        /* =====================================================
           SONDAGES — SUPPRIMER
        ====================================================== */

        pollDeleteButton
            ?.addEventListener(
                "click",
                async () => {

                    if (
                        currentEditingPollId
                    ) {

                        await deletePoll(
                            currentEditingPollId
                        );
                    }
                }
            );


        /* =====================================================
           SONDAGES — ENREGISTRER
        ====================================================== */

        pollForm
            ?.addEventListener(
                "submit",
                savePoll
            );


        /* =====================================================
           SONDAGES — FILTRES
        ====================================================== */

        pollsSearchInput
            ?.addEventListener(
                "input",
                renderPolls
            );


        pollsStatusFilter
            ?.addEventListener(
                "change",
                renderPolls
            );


        pollsCategoryFilter
            ?.addEventListener(
                "change",
                renderPolls
            );


        /* =====================================================
           SONDAGES — FERMER RÉSULTATS
        ====================================================== */

        pollResultsCloseButton
            ?.addEventListener(
                "click",
                closePollResults
            ); 

                    /* =====================================================
           PROPOSITIONS — NORMALISATION
        ====================================================== */

        function normalizePollSuggestion(
            suggestion
        ) {

            if (
                !suggestion ||
                typeof suggestion !==
                    "object"
            ) {

                return null;
            }


            return {

                id:
                    suggestion.id ??
                    null,

                category:
                    normalizeText(
                        suggestion.category
                    ) ||
                    "community",

                question:
                    normalizeText(
                        suggestion.question
                    ),

                description:
                    normalizeText(
                        suggestion.description
                    ),

                twitchUserId:
                    normalizeText(
                        suggestion.twitchUserId ??
                        suggestion.twitch_user_id
                    ),

                twitchLogin:
                    normalizeText(
                        suggestion.twitchLogin ??
                        suggestion.twitch_login
                    ),

                twitchDisplayName:
                    normalizeText(
                        suggestion.twitchDisplayName ??
                        suggestion.twitch_display_name
                    ),

                status:
                    normalizeText(
                        suggestion.status
                    ) ||
                    "pending",

                createdAt:
                    suggestion.createdAt ??
                    suggestion.created_at ??
                    null,

                updatedAt:
                    suggestion.updatedAt ??
                    suggestion.updated_at ??
                    null

            };
        }


        /* =====================================================
           PROPOSITIONS — LABEL STATUT
        ====================================================== */

        function getSuggestionStatusLabel(
            status
        ) {

            switch (
                normalizeText(
                    status
                )
            ) {

                case "pending":

                    return "⏳ En attente";


                case "approved":

                    return "✅ Acceptée";


                case "rejected":

                    return "❌ Refusée";


                default:

                    return "💡 Proposition";
            }
        }


        /* =====================================================
           PROPOSITIONS — CHARGEMENT
        ====================================================== */

        async function loadPollSuggestions() {

            try {

                const data =
                    await adminApiRequest(
                        ADMIN_POLL_SUGGESTIONS_API,
                        {
                            method:
                                "GET"
                        }
                    );


                const rawSuggestions =
                    Array.isArray(
                        data
                    )
                        ? data
                        : (
                            data.suggestions ??
                            data.data ??
                            []
                        );


                pollSuggestions =
                    normalizeArray(
                        rawSuggestions
                    )
                        .map(
                            normalizePollSuggestion
                        )
                        .filter(
                            Boolean
                        );


                updateDashboardStats();


            } catch (
                error
            ) {

                console.error(
                    "[Admin Poll Suggestions] Chargement :",
                    error
                );


                pollSuggestions =
                    [];


                updateDashboardStats();


                showToast(
                    error?.message ||
                    "Impossible de charger les propositions.",
                    "error"
                );
            }
        }


        /* =====================================================
           PROPOSITIONS — FILTRAGE
        ====================================================== */

        function getFilteredPollSuggestions() {

            const filter =
                normalizeText(
                    pollSuggestionsFilter
                        ?.value
                ) ||
                "pending";


            if (
                filter ===
                "all"
            ) {

                return [
                    ...pollSuggestions
                ];
            }


            return pollSuggestions.filter(
                suggestion =>
                    suggestion.status ===
                    filter
            );
        }


        /* =====================================================
           PROPOSITIONS — AUTEUR
        ====================================================== */

        function getSuggestionAuthor(
            suggestion
        ) {

            const displayName =
                normalizeText(
                    suggestion
                        ?.twitchDisplayName
                );


            if (
                displayName
            ) {

                return displayName;
            }


            const login =
                normalizeText(
                    suggestion
                        ?.twitchLogin
                );


            if (
                login
            ) {

                return login;
            }


            return "Viewer Twitch";
        }


        /* =====================================================
           PROPOSITIONS — CARTE
        ====================================================== */

        function createPollSuggestionHtml(
            suggestion
        ) {

            return `
                <article
                    class="admin-poll-suggestion-card"
                    data-suggestion-id="${escapeHtml(
                        suggestion.id
                    )}"
                >

                    <div
                        class="admin-poll-suggestion-header"
                    >

                        <div>

                            <span
                                class="
                                    admin-poll-suggestion-status
                                    is-${escapeHtml(
                                        suggestion.status
                                    )}
                                "
                            >
                                ${escapeHtml(
                                    getSuggestionStatusLabel(
                                        suggestion.status
                                    )
                                )}
                            </span>


                            <span
                                class="admin-poll-category"
                            >
                                ${escapeHtml(
                                    getPollCategoryLabel(
                                        suggestion.category
                                    )
                                )}
                            </span>

                        </div>


                        <span
                            class="admin-poll-suggestion-date"
                        >
                            ${escapeHtml(
                                formatDate(
                                    suggestion.createdAt
                                )
                            )}
                        </span>

                    </div>


                    <div
                        class="admin-poll-suggestion-content"
                    >

                        <h3>
                            ${escapeHtml(
                                suggestion.question ||
                                "Proposition sans titre"
                            )}
                        </h3>


                        ${
                            suggestion.description
                                ? `
                                    <p>
                                        ${escapeHtml(
                                            suggestion.description
                                        )}
                                    </p>
                                `
                                : ""
                        }


                        <div
                            class="admin-poll-suggestion-author"
                        >
                            💜 Proposé par
                            <strong>
                                ${escapeHtml(
                                    getSuggestionAuthor(
                                        suggestion
                                    )
                                )}
                            </strong>
                        </div>

                    </div>


                    <div
                        class="admin-poll-suggestion-actions"
                    >

                        <button
                            type="button"
                            class="admin-primary-button"
                            data-create-poll-from-suggestion="${escapeHtml(
                                suggestion.id
                            )}"
                        >
                            🗳️ Créer un sondage
                        </button>


                        ${
                            suggestion.status !==
                                "approved"
                                ? `
                                    <button
                                        type="button"
                                        class="admin-secondary-button"
                                        data-approve-suggestion="${escapeHtml(
                                            suggestion.id
                                        )}"
                                    >
                                        ✅ Accepter
                                    </button>
                                `
                                : ""
                        }


                        ${
                            suggestion.status !==
                                "rejected"
                                ? `
                                    <button
                                        type="button"
                                        class="admin-secondary-button"
                                        data-reject-suggestion="${escapeHtml(
                                            suggestion.id
                                        )}"
                                    >
                                        ❌ Refuser
                                    </button>
                                `
                                : ""
                        }


                        ${
                            suggestion.status !==
                                "pending"
                                ? `
                                    <button
                                        type="button"
                                        class="admin-secondary-button"
                                        data-pending-suggestion="${escapeHtml(
                                            suggestion.id
                                        )}"
                                    >
                                        ⏳ Remettre en attente
                                    </button>
                                `
                                : ""
                        }


                        <button
                            type="button"
                            class="admin-danger-button"
                            data-delete-suggestion="${escapeHtml(
                                suggestion.id
                            )}"
                        >
                            🗑️ Supprimer
                        </button>

                    </div>

                </article>
            `;
        }


        /* =====================================================
           PROPOSITIONS — AFFICHAGE
        ====================================================== */

        function renderPollSuggestions() {

            if (
                !pollSuggestionsList
            ) {

                return;
            }


            const filteredSuggestions =
                getFilteredPollSuggestions();


            const pendingCount =
                pollSuggestions.filter(
                    suggestion =>
                        suggestion.status ===
                        "pending"
                ).length;


            if (
                pollSuggestionsCount
            ) {

                pollSuggestionsCount.textContent =
                    String(
                        pendingCount
                    );
            }


            if (
                filteredSuggestions.length ===
                0
            ) {

                pollSuggestionsList.innerHTML =
                    getPollEmptyState(
                        "💡",
                        "Aucune proposition",
                        "Aucune proposition ne correspond au filtre sélectionné."
                    );


                updateDashboardStats();


                return;
            }


            pollSuggestionsList.innerHTML =
                filteredSuggestions
                    .map(
                        createPollSuggestionHtml
                    )
                    .join(
                        ""
                    );


            bindPollSuggestionEvents();


            updateDashboardStats();
        }


        /* =====================================================
           PROPOSITIONS — MODIFIER LE STATUT
        ====================================================== */

        async function updatePollSuggestionStatus(
            suggestionId,
            status
        ) {

            const suggestion =
                pollSuggestions.find(
                    item =>
                        String(
                            item.id
                        ) ===
                        String(
                            suggestionId
                        )
                );


            if (
                !suggestion
            ) {

                showToast(
                    "Cette proposition n'existe pas.",
                    "error"
                );


                return;
            }


            try {

                await adminApiRequest(
                    ADMIN_POLL_SUGGESTIONS_API,
                    {
                        method:
                            "PUT",

                        body: {

                            id:
                                suggestion.id,

                            status

                        }
                    }
                );


                switch (
                    status
                ) {

                    case "approved":

                        showToast(
                            "La proposition a été acceptée."
                        );

                        break;


                    case "rejected":

                        showToast(
                            "La proposition a été refusée."
                        );

                        break;


                    case "pending":

                        showToast(
                            "La proposition a été remise en attente."
                        );

                        break;
                }


                await loadPollSuggestions();


                renderPollSuggestions();


            } catch (
                error
            ) {

                console.error(
                    "[Admin Poll Suggestion Status]",
                    error
                );


                showToast(
                    error?.message ||
                    "Impossible de modifier la proposition.",
                    "error"
                );
            }
        }


        /* =====================================================
           PROPOSITIONS — SUPPRESSION
        ====================================================== */

        async function deletePollSuggestion(
            suggestionId
        ) {

            const suggestion =
                pollSuggestions.find(
                    item =>
                        String(
                            item.id
                        ) ===
                        String(
                            suggestionId
                        )
                );


            if (
                !suggestion
            ) {

                return;
            }


            const confirmed =
                window.confirm(
                    `Supprimer définitivement la proposition "${suggestion.question}" ?`
                );


            if (
                !confirmed
            ) {

                return;
            }


            try {

                await adminApiRequest(
                    ADMIN_POLL_SUGGESTIONS_API,
                    {
                        method:
                            "DELETE",

                        body: {
                            id:
                                suggestion.id
                        }
                    }
                );


                showToast(
                    "La proposition a été supprimée."
                );


                await loadPollSuggestions();


                renderPollSuggestions();


            } catch (
                error
            ) {

                console.error(
                    "[Admin Poll Suggestion Delete]",
                    error
                );


                showToast(
                    error?.message ||
                    "Impossible de supprimer la proposition.",
                    "error"
                );
            }
        }


        /* =====================================================
           PROPOSITIONS — CRÉER UN SONDAGE
        ====================================================== */

        function createPollFromSuggestion(
            suggestionId
        ) {

            const suggestion =
                pollSuggestions.find(
                    item =>
                        String(
                            item.id
                        ) ===
                        String(
                            suggestionId
                        )
                );


            if (
                !suggestion
            ) {

                showToast(
                    "Impossible de retrouver cette proposition.",
                    "error"
                );


                return;
            }


            /* =================================================
               OUVRIR LA SECTION SONDAGES
            ================================================= */

            openSection(
                "poll"
            );


            /* =================================================
               RESET DU FORMULAIRE
            ================================================= */

            resetPollForm();


            pollSlugEditedManually =
                false;


            /* =================================================
               PRÉREMPLISSAGE
            ================================================= */

            if (
                pollTitleInput
            ) {

                pollTitleInput.value =
                    suggestion.question;
            }


            if (
                pollSlugInput
            ) {

                pollSlugInput.value =
                    slugify(
                        suggestion.question
                    );
            }


            if (
                pollQuestionInput
            ) {

                pollQuestionInput.value =
                    suggestion.question;
            }


            if (
                pollDescriptionInput
            ) {

                pollDescriptionInput.value =
                    suggestion.description;
            }


            if (
                pollCategoryInput
            ) {

                pollCategoryInput.value =
                    suggestion.category;
            }


            if (
                pollStatusInput
            ) {

                pollStatusInput.value =
                    "upcoming";
            }


            /* =================================================
               OUVRIR FORMULAIRE
            ================================================= */

            openPollForm();


            showToast(
                "La proposition a été copiée dans le formulaire. Ajoute maintenant les réponses du sondage."
            );
        }


        /* =====================================================
           PROPOSITIONS — ÉVÉNEMENTS
        ====================================================== */

        function bindPollSuggestionEvents() {

            /* =================================================
               CRÉER SONDAGE
            ================================================= */

            pollSuggestionsList
                ?.querySelectorAll(
                    "[data-create-poll-from-suggestion]"
                )
                .forEach(
                    button => {

                        button.addEventListener(
                            "click",
                            () => {

                                createPollFromSuggestion(
                                    button.dataset
                                        .createPollFromSuggestion
                                );
                            }
                        );
                    }
                );


            /* =================================================
               ACCEPTER
            ================================================= */

            pollSuggestionsList
                ?.querySelectorAll(
                    "[data-approve-suggestion]"
                )
                .forEach(
                    button => {

                        button.addEventListener(
                            "click",
                            async () => {

                                await updatePollSuggestionStatus(
                                    button.dataset
                                        .approveSuggestion,
                                    "approved"
                                );
                            }
                        );
                    }
                );


            /* =================================================
               REFUSER
            ================================================= */

            pollSuggestionsList
                ?.querySelectorAll(
                    "[data-reject-suggestion]"
                )
                .forEach(
                    button => {

                        button.addEventListener(
                            "click",
                            async () => {

                                await updatePollSuggestionStatus(
                                    button.dataset
                                        .rejectSuggestion,
                                    "rejected"
                                );
                            }
                        );
                    }
                );


            /* =================================================
               REMETTRE EN ATTENTE
            ================================================= */

            pollSuggestionsList
                ?.querySelectorAll(
                    "[data-pending-suggestion]"
                )
                .forEach(
                    button => {

                        button.addEventListener(
                            "click",
                            async () => {

                                await updatePollSuggestionStatus(
                                    button.dataset
                                        .pendingSuggestion,
                                    "pending"
                                );
                            }
                        );
                    }
                );


            /* =================================================
               SUPPRIMER
            ================================================= */

            pollSuggestionsList
                ?.querySelectorAll(
                    "[data-delete-suggestion]"
                )
                .forEach(
                    button => {

                        button.addEventListener(
                            "click",
                            async () => {

                                await deletePollSuggestion(
                                    button.dataset
                                        .deleteSuggestion
                                );
                            }
                        );
                    }
                );
        }


        /* =====================================================
           PROPOSITIONS — FILTRE
        ====================================================== */

        pollSuggestionsFilter
            ?.addEventListener(
                "change",
                renderPollSuggestions
            );


        /* =====================================================
           RAFRAÎCHIR UNE SECTION QUAND ON L'OUVRE
        ====================================================== */

        navigationButtons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        const section =
                            normalizeText(
                                button.dataset
                                    .adminSection
                            );


                        /* =========================================
                           JEUX
                        ========================================= */

                        if (
                            section ===
                            "games"
                        ) {

                            await loadGames();

                            renderGames();
                        }


                        /* =========================================
                           GALERIE
                        ========================================= */

                        if (
                            section ===
                            "gallery"
                        ) {

                            await loadArtworks();

                            renderArtworks();
                        }


                        /* =========================================
                           SONDAGES
                        ========================================= */

                        if (
                            section ===
                            "poll"
                        ) {

                            await Promise.all([

                                loadPolls(),

                                loadPollSuggestions()

                            ]);


                            renderPolls();

                            renderPollSuggestions();
                        }
                    }
                );
            }
        );


        /* =====================================================
           INITIALISATION
        ====================================================== */

        async function initializeAdmin() {

            try {

                /* =================================================
                   UTILISATEUR ADMIN
                ================================================= */

                currentAdminUser =
                    await loadAdminUser();


                if (
                    !currentAdminUser
                ) {

                    return;
                }


                applyAdminUser(
                    currentAdminUser
                );


                createLogoutButton();


                /* =================================================
                   CHARGEMENT DES DONNÉES
                ================================================= */

                await Promise.all([

                    loadGames(),

                    loadArtworks(),

                    loadPolls(),

                    loadPollSuggestions()

                ]);


                /* =================================================
                   AFFICHAGE INITIAL
                ================================================= */

                renderGames();

                renderArtworks();

                renderPolls();

                renderPollSuggestions();

                updateDashboardStats();


                /* =================================================
                   FORMULAIRES FERMÉS AU DÉMARRAGE
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


                if (
                    pollFormPanel
                ) {

                    pollFormPanel.hidden =
                        true;
                }


                if (
                    pollResultsPanel
                ) {

                    pollResultsPanel.hidden =
                        true;
                }


                /* =================================================
                   SECTION INITIALE
                ================================================= */

                const requestedSection =
                    normalizeText(
                        window.location.hash
                            .replace(
                                "#",
                                ""
                            )
                    );


                const validSections =
                    new Set(
                        sections
                            .map(
                                section =>
                                    normalizeText(
                                        section.dataset
                                            .adminPanel
                                    )
                            )
                            .filter(
                                Boolean
                            )
                    );


                if (
                    requestedSection &&
                    validSections.has(
                        requestedSection
                    )
                ) {

                    openSection(
                        requestedSection
                    );

                } else {

                    openSection(
                        "dashboard"
                    );
                }

                /* =================================================
                ADMIN PRÊT
                ================================================= */

                document.documentElement
                    .classList
                    .add(
                        "admin-ready"
                    );


                document.body
                    .classList
                    .add(
                        "admin-ready"
                    );

                console.info(
                    "[Admin] Administration initialisée."
                );


            } catch (
                error
            ) {

                console.error(
                    "[Admin Init]",
                    error
                );


                showToast(
                    error?.message ||
                    "Impossible d'initialiser l'administration.",
                    "error"
                );
            }
        }


        /* =====================================================
           NETTOYAGE AVANT FERMETURE
        ====================================================== */

        window.addEventListener(
            "beforeunload",
            () => {

                revokeArtworkPreviewUrl();
            }
        );


        /* =====================================================
           DÉMARRAGE
        ====================================================== */

        await initializeAdmin();

    }
);

/* =========================================================
   ADMIN — ANNONCES & NOUVEAUTÉS
========================================================= */

const ADMIN_ANNOUNCEMENTS_API =
    "/api/admin/announcements";


/* =========================================================
   ÉLÉMENTS — ANNONCES
========================================================= */

const announcementForm =
    document.getElementById(
        "announcement-form"
    );


const announcementIdInput =
    document.getElementById(
        "announcement-id"
    );


const announcementTypeInput =
    document.getElementById(
        "announcement-type"
    );


const announcementIconInput =
    document.getElementById(
        "announcement-icon"
    );


const announcementTitleInput =
    document.getElementById(
        "announcement-title"
    );


const announcementMessageInput =
    document.getElementById(
        "announcement-message"
    );


const announcementLinkUrlInput =
    document.getElementById(
        "announcement-link-url"
    );


const announcementLinkLabelInput =
    document.getElementById(
        "announcement-link-label"
    );


const announcementImageUrlInput =
    document.getElementById(
        "announcement-image-url"
    );


const announcementPublishedInput =
    document.getElementById(
        "announcement-published"
    );


const announcementPinnedInput =
    document.getElementById(
        "announcement-pinned"
    );


const announcementImportantInput =
    document.getElementById(
        "announcement-important"
    );


const announcementPublishedAtInput =
    document.getElementById(
        "announcement-published-at"
    );


const announcementExpiresAtInput =
    document.getElementById(
        "announcement-expires-at"
    );


const announcementSubmitButton =
    document.getElementById(
        "announcement-submit"
    );


const announcementSubmitLabel =
    document.getElementById(
        "announcement-submit-label"
    );


const announcementCancelEditButton =
    document.getElementById(
        "announcement-cancel-edit"
    );


const announcementFormTitle =
    document.getElementById(
        "announcement-form-title"
    );


const announcementFormStatus =
    document.getElementById(
        "announcement-form-status"
    );


const announcementAdminList =
    document.getElementById(
        "announcement-admin-list"
    );


const announcementAdminCount =
    document.getElementById(
        "announcement-admin-count"
    );


const announcementImagePreview =
    document.getElementById(
        "announcement-image-preview"
    );


const announcementImagePreviewImg =
    document.getElementById(
        "announcement-image-preview-img"
    );


/* =========================================================
   ÉTAT — ANNONCES
========================================================= */

let adminAnnouncements =
    [];


/* =========================================================
   OUTILS — ANNONCES
========================================================= */

function escapeAnnouncementHtml(
    value
) {

    return String(
        value ??
        ""
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


function formatAnnouncementDateTimeLocal(
    value
) {

    if (
        !value
    ) {

        return "";
    }


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";
    }


    const pad =
        number =>
            String(
                number
            )
                .padStart(
                    2,
                    "0"
                );


    return [
        date.getFullYear(),
        "-",
        pad(
            date.getMonth() +
            1
        ),
        "-",
        pad(
            date.getDate()
        ),
        "T",
        pad(
            date.getHours()
        ),
        ":",
        pad(
            date.getMinutes()
        )
    ].join("");
}


function formatAnnouncementDisplayDate(
    value
) {

    if (
        !value
    ) {

        return "";
    }


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";
    }


    return new Intl.DateTimeFormat(
        "fr-FR",
        {
            dateStyle:
                "medium",

            timeStyle:
                "short"
        }
    )
        .format(
            date
        );
}


function getAnnouncementTypeLabel(
    type
) {

    switch (
        String(
            type ??
            ""
        )
            .toLowerCase()
    ) {

        case "announcement":
            return "📢 Annonce";

        case "poll":
            return "🗳️ Sondage";

        case "game":
            return "🎮 Jeu";

        case "artwork":
            return "🎨 Artwork";

        case "lore":
            return "📖 Lore";

        case "event":
            return "📅 Événement";

        case "stream":
            return "🔴 Stream";

        default:
            return "✨ Autre";
    }
}


/* =========================================================
   STATUT FORMULAIRE
========================================================= */

function setAnnouncementFormStatus(
    message,
    type = ""
) {

    if (
        !announcementFormStatus
    ) {

        return;
    }


    announcementFormStatus.textContent =
        message;


    announcementFormStatus.classList.remove(
        "is-success",
        "is-error"
    );


    if (
        type ===
        "success"
    ) {

        announcementFormStatus.classList.add(
            "is-success"
        );
    }


    if (
        type ===
        "error"
    ) {

        announcementFormStatus.classList.add(
            "is-error"
        );
    }
}


/* =========================================================
   APERÇU IMAGE
========================================================= */

function updateAnnouncementImagePreview() {

    if (
        !announcementImagePreview ||
        !announcementImagePreviewImg ||
        !announcementImageUrlInput
    ) {

        return;
    }


    const imageUrl =
        announcementImageUrlInput
            .value
            .trim();


    if (
        !imageUrl
    ) {

        announcementImagePreview.hidden =
            true;


        announcementImagePreviewImg.src =
            "";


        return;
    }


    announcementImagePreviewImg.src =
        imageUrl;


    announcementImagePreview.hidden =
        false;
}


/* =========================================================
   RESET FORMULAIRE
========================================================= */

function resetAnnouncementForm() {

    announcementForm
        ?.reset();


    if (
        announcementIdInput
    ) {

        announcementIdInput.value =
            "";
    }


    if (
        announcementFormTitle
    ) {

        announcementFormTitle.textContent =
            "Nouvelle annonce";
    }


    if (
        announcementSubmitLabel
    ) {

        announcementSubmitLabel.textContent =
            "Enregistrer l'annonce";
    }


    if (
        announcementCancelEditButton
    ) {

        announcementCancelEditButton.hidden =
            true;
    }


    if (
        announcementImagePreview
    ) {

        announcementImagePreview.hidden =
            true;
    }


    if (
        announcementImagePreviewImg
    ) {

        announcementImagePreviewImg.src =
            "";
    }


    setAnnouncementFormStatus(
        ""
    );
}


/* =========================================================
   REMPLIR FORMULAIRE POUR MODIFICATION
========================================================= */

function editAnnouncement(
    announcementId
) {

    const announcement =
        adminAnnouncements.find(
            item =>
                String(
                    item.id
                ) ===
                String(
                    announcementId
                )
        );


    if (
        !announcement
    ) {

        return;
    }


    if (
        announcementIdInput
    ) {

        announcementIdInput.value =
            announcement.id ??
            "";
    }


    if (
        announcementTypeInput
    ) {

        announcementTypeInput.value =
            announcement.type ??
            "announcement";
    }


    if (
        announcementIconInput
    ) {

        announcementIconInput.value =
            announcement.icon ??
            "";
    }


    if (
        announcementTitleInput
    ) {

        announcementTitleInput.value =
            announcement.title ??
            "";
    }


    if (
        announcementMessageInput
    ) {

        announcementMessageInput.value =
            announcement.message ??
            "";
    }


    if (
        announcementLinkUrlInput
    ) {

        announcementLinkUrlInput.value =
            announcement.linkUrl ??
            "";
    }


    if (
        announcementLinkLabelInput
    ) {

        announcementLinkLabelInput.value =
            announcement.linkLabel ??
            "";
    }


    if (
        announcementImageUrlInput
    ) {

        announcementImageUrlInput.value =
            announcement.imageUrl ??
            "";
    }


    if (
        announcementPublishedInput
    ) {

        announcementPublishedInput.checked =
            announcement.isPublished ===
            true;
    }


    if (
        announcementPinnedInput
    ) {

        announcementPinnedInput.checked =
            announcement.isPinned ===
            true;
    }


    if (
        announcementImportantInput
    ) {

        announcementImportantInput.checked =
            announcement.isImportant ===
            true;
    }


    if (
        announcementPublishedAtInput
    ) {

        announcementPublishedAtInput.value =
            formatAnnouncementDateTimeLocal(
                announcement.publishedAt
            );
    }


    if (
        announcementExpiresAtInput
    ) {

        announcementExpiresAtInput.value =
            formatAnnouncementDateTimeLocal(
                announcement.expiresAt
            );
    }


    if (
        announcementFormTitle
    ) {

        announcementFormTitle.textContent =
            "Modifier l'annonce";
    }


    if (
        announcementSubmitLabel
    ) {

        announcementSubmitLabel.textContent =
            "Enregistrer les modifications";
    }


    if (
        announcementCancelEditButton
    ) {

        announcementCancelEditButton.hidden =
            false;
    }


    updateAnnouncementImagePreview();


    setAnnouncementFormStatus(
        ""
    );


    announcementForm
        ?.scrollIntoView({
            behavior:
                "smooth",

            block:
                "start"
        });
}


/* =========================================================
   RENDER LISTE
========================================================= */

function renderAdminAnnouncements() {

    if (
        !announcementAdminList
    ) {

        return;
    }


    if (
        announcementAdminCount
    ) {

        announcementAdminCount.textContent =
            String(
                adminAnnouncements.length
            );
    }


    if (
        adminAnnouncements.length ===
        0
    ) {

        announcementAdminList.innerHTML = `
            <p class="announcement-admin-empty">
                Aucune annonce pour le moment.
            </p>
        `;


        return;
    }


    announcementAdminList.innerHTML =
        adminAnnouncements
            .map(
                announcement => {

                    const badges =
                        [];


                    if (
                        announcement.isPublished
                    ) {

                        badges.push(
                            "👁️ Publiée"
                        );

                    } else {

                        badges.push(
                            "🙈 Brouillon"
                        );
                    }


                    if (
                        announcement.isPinned
                    ) {

                        badges.push(
                            "📌 Épinglée"
                        );
                    }


                    if (
                        announcement.isImportant
                    ) {

                        badges.push(
                            "⚠️ Importante"
                        );
                    }


                    const dateText =
                        announcement.publishedAt
                            ? formatAnnouncementDisplayDate(
                                announcement.publishedAt
                            )
                            : "";


                    return `
                        <article
                            class="
                                announcement-admin-item
                                ${
                                    announcement.isPublished
                                        ? ""
                                        : "is-unpublished"
                                }
                                ${
                                    announcement.isImportant
                                        ? "is-important"
                                        : ""
                                }
                            "
                        >

                            <div class="announcement-admin-item-header">

                                <div>

                                    <span class="announcement-form-kicker">
                                        ${escapeAnnouncementHtml(
                                            getAnnouncementTypeLabel(
                                                announcement.type
                                            )
                                        )}
                                    </span>

                                    <h4 class="announcement-admin-item-title">
                                        ${escapeAnnouncementHtml(
                                            announcement.title
                                        )}
                                    </h4>

                                </div>

                                <span>
                                    ${escapeAnnouncementHtml(
                                        announcement.icon ??
                                        ""
                                    )}
                                </span>

                            </div>


                            ${
                                announcement.message
                                    ? `
                                        <p class="announcement-admin-item-message">
                                            ${escapeAnnouncementHtml(
                                                announcement.message
                                            )}
                                        </p>
                                    `
                                    : ""
                            }


                            ${
                                dateText
                                    ? `
                                        <p class="announcement-admin-item-message">
                                            🕒 ${escapeAnnouncementHtml(
                                                dateText
                                            )}
                                        </p>
                                    `
                                    : ""
                            }


                            <div class="announcement-admin-item-badges">

                                ${badges
                                    .map(
                                        badge => `
                                            <span class="announcement-admin-badge">
                                                ${escapeAnnouncementHtml(
                                                    badge
                                                )}
                                            </span>
                                        `
                                    )
                                    .join("")}

                            </div>


                            <div class="announcement-admin-item-actions">

                                <button
                                    class="announcement-admin-edit"
                                    type="button"
                                    data-announcement-edit="${escapeAnnouncementHtml(
                                        announcement.id
                                    )}"
                                >
                                    ✏️ Modifier
                                </button>


                                <button
                                    class="announcement-admin-delete"
                                    type="button"
                                    data-announcement-delete="${escapeAnnouncementHtml(
                                        announcement.id
                                    )}"
                                >
                                    🗑️ Supprimer
                                </button>

                            </div>

                        </article>
                    `;
                }
            )
            .join("");


    setupAnnouncementAdminButtons();
}


/* =========================================================
   BOUTONS LISTE
========================================================= */

function setupAnnouncementAdminButtons() {

    const editButtons =
        document.querySelectorAll(
            "[data-announcement-edit]"
        );


    editButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    editAnnouncement(
                        button.dataset
                            .announcementEdit
                    );
                }
            );
        }
    );


    const deleteButtons =
        document.querySelectorAll(
            "[data-announcement-delete]"
        );


    deleteButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                async () => {

                    const announcementId =
                        button.dataset
                            .announcementDelete;


                    if (
                        !announcementId
                    ) {

                        return;
                    }


                    const announcement =
                        adminAnnouncements.find(
                            item =>
                                String(
                                    item.id
                                ) ===
                                String(
                                    announcementId
                                )
                        );


                    const confirmed =
                        window.confirm(
                            announcement?.title
                                ? `Supprimer l'annonce "${announcement.title}" ?`
                                : "Supprimer cette annonce ?"
                        );


                    if (
                        !confirmed
                    ) {

                        return;
                    }


                    try {

                        button.disabled =
                            true;


                        await adminApiRequest(
                            `${ADMIN_ANNOUNCEMENTS_API}?id=${encodeURIComponent(
                                announcementId
                            )}`,
                            {
                                method:
                                    "DELETE"
                            }
                        );


                        if (
                            String(
                                announcementIdInput?.value
                            ) ===
                            String(
                                announcementId
                            )
                        ) {

                            resetAnnouncementForm();
                        }


                        await loadAdminAnnouncements();


                    } catch (
                        error
                    ) {

                        console.error(
                            "[Admin Announcements Delete]",
                            error
                        );


                        window.alert(
                            error?.message ||
                            "Impossible de supprimer l'annonce."
                        );


                    } finally {

                        button.disabled =
                            false;
                    }
                }
            );
        }
    );
}


/* =========================================================
   CHARGEMENT
========================================================= */

async function loadAdminAnnouncements() {

    if (
        !announcementAdminList
    ) {

        return;
    }


    announcementAdminList.innerHTML = `
        <p class="announcement-admin-empty">
            Chargement des annonces...
        </p>
    `;


    try {

        const data =
            await adminApiRequest(
                ADMIN_ANNOUNCEMENTS_API
            );


        adminAnnouncements =
            Array.isArray(
                data?.announcements
            )
                ? data.announcements
                : [];


        renderAdminAnnouncements();


    } catch (
        error
    ) {

        console.error(
            "[Admin Announcements Load]",
            error
        );


        adminAnnouncements =
            [];


        if (
            announcementAdminCount
        ) {

            announcementAdminCount.textContent =
                "0";
        }


        announcementAdminList.innerHTML = `
            <p class="announcement-admin-empty">
                Impossible de charger les annonces.
            </p>
        `;
    }
}


/* =========================================================
   ENREGISTREMENT
========================================================= */

async function submitAnnouncement(
    event
) {

    event.preventDefault();


    if (
        !announcementForm
    ) {

        return;
    }


    const id =
        announcementIdInput
            ?.value
            .trim() ||
        "";


    const payload = {

        type:
            announcementTypeInput
                ?.value ||
            "announcement",

        icon:
            announcementIconInput
                ?.value
                .trim() ||
            "",

        title:
            announcementTitleInput
                ?.value
                .trim() ||
            "",

        message:
            announcementMessageInput
                ?.value
                .trim() ||
            "",

        linkUrl:
            announcementLinkUrlInput
                ?.value
                .trim() ||
            "",

        linkLabel:
            announcementLinkLabelInput
                ?.value
                .trim() ||
            "",

        imageUrl:
            announcementImageUrlInput
                ?.value
                .trim() ||
            "",

        isPublished:
            announcementPublishedInput
                ?.checked ===
            true,

        isPinned:
            announcementPinnedInput
                ?.checked ===
            true,

        isImportant:
            announcementImportantInput
                ?.checked ===
            true,

        publishedAt:
            announcementPublishedAtInput
                ?.value ||
            null,

        expiresAt:
            announcementExpiresAtInput
                ?.value ||
            null

    };


    if (
        !payload.title
    ) {

        setAnnouncementFormStatus(
            "Le titre est obligatoire.",
            "error"
        );


        return;
    }


    try {

        if (
            announcementSubmitButton
        ) {

            announcementSubmitButton.disabled =
                true;
        }


        setAnnouncementFormStatus(
            id
                ? "Modification en cours..."
                : "Création en cours..."
        );


        if (
            id
        ) {

            await adminApiRequest(
                `${ADMIN_ANNOUNCEMENTS_API}?id=${encodeURIComponent(
                    id
                )}`,
                {
                    method:
                        "PUT",

                    body:
                        payload
                }
            );


            setAnnouncementFormStatus(
                "Annonce modifiée avec succès. 💜",
                "success"
            );


        } else {

            await adminApiRequest(
                ADMIN_ANNOUNCEMENTS_API,
                {
                    method:
                        "POST",

                    body:
                        payload
                }
            );


            setAnnouncementFormStatus(
                "Annonce créée avec succès. 💜",
                "success"
            );
        }


        await loadAdminAnnouncements();


        setTimeout(
            () => {

                resetAnnouncementForm();
            },
            900
        );


    } catch (
        error
    ) {

        console.error(
            "[Admin Announcements Submit]",
            error
        );


        setAnnouncementFormStatus(
            error?.message ||
            "Impossible d'enregistrer l'annonce.",
            "error"
        );


    } finally {

        if (
            announcementSubmitButton
        ) {

            announcementSubmitButton.disabled =
                false;
        }
    }
}


/* =========================================================
   ÉVÉNEMENTS
========================================================= */

announcementForm
    ?.addEventListener(
        "submit",
        submitAnnouncement
    );


announcementCancelEditButton
    ?.addEventListener(
        "click",
        resetAnnouncementForm
    );


announcementImageUrlInput
    ?.addEventListener(
        "input",
        updateAnnouncementImagePreview
    );


announcementImagePreviewImg
    ?.addEventListener(
        "error",
        () => {

            if (
                announcementImagePreview
            ) {

                announcementImagePreview.hidden =
                    true;
            }
        }
    );


announcementImagePreviewImg
    ?.addEventListener(
        "load",
        () => {

            if (
                announcementImagePreview &&
                announcementImagePreviewImg.src
            ) {

                announcementImagePreview.hidden =
                    false;
            }
        }
    );


/* =========================================================
   INITIALISATION ANNONCES
========================================================= */

loadAdminAnnouncements();