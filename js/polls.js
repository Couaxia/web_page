"use strict";

/* =========================================================
   POLLS.JS
   PAGE SONDAGES — COUAXIA
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {


        /* =====================================================
           CONFIGURATION API
        ====================================================== */

        const POLLS_API =
            "/api/polls";


        const POLL_SUGGESTIONS_API =
            "/api/poll-suggestions";


        const DEFAULT_LOGIN_URL =
            "/api/auth/public-login";

        /* =====================================================
           ÉLÉMENTS — STATISTIQUES
        ====================================================== */

        const statActive =
            document.getElementById(
                "polls-stat-active"
            );


        const statUpcoming =
            document.getElementById(
                "polls-stat-upcoming"
            );


        const statFinished =
            document.getElementById(
                "polls-stat-finished"
            );


        const statVotes =
            document.getElementById(
                "polls-stat-votes"
            );


        /* =====================================================
           ÉLÉMENTS — FILTRES
        ====================================================== */

        const searchInput =
            document.getElementById(
                "polls-search-input"
            );


        const statusFilter =
            document.getElementById(
                "polls-status-filter"
            );


        const categoryFilter =
            document.getElementById(
                "polls-category-filter"
            );


        const resultsText =
            document.getElementById(
                "polls-results"
            );


        /* =====================================================
           ÉLÉMENTS — SECTIONS
        ====================================================== */

        const activeSection =
            document.getElementById(
                "polls-active-section"
            );


        const upcomingSection =
            document.getElementById(
                "polls-upcoming-section"
            );


        const finishedSection =
            document.getElementById(
                "polls-finished-section"
            );


        const activeGrid =
            document.getElementById(
                "polls-active-grid"
            );


        const upcomingGrid =
            document.getElementById(
                "polls-upcoming-grid"
            );


        const finishedGrid =
            document.getElementById(
                "polls-finished-grid"
            );


        const activeCount =
            document.getElementById(
                "polls-active-count"
            );


        const upcomingCount =
            document.getElementById(
                "polls-upcoming-count"
            );


        const finishedCount =
            document.getElementById(
                "polls-finished-count"
            );


        const emptyState =
            document.getElementById(
                "polls-empty-state"
            );


        /* =====================================================
           ÉLÉMENTS — MODALE SONDAGE
        ====================================================== */

        const pollModal =
            document.getElementById(
                "polls-modal"
            );


        const dialogIcon =
            document.getElementById(
                "polls-dialog-icon"
            );


        const dialogCategory =
            document.getElementById(
                "polls-dialog-category"
            );


        const dialogTitle =
            document.getElementById(
                "polls-dialog-title"
            );


        const dialogDescription =
            document.getElementById(
                "polls-dialog-description"
            );


        const dialogOptions =
            document.getElementById(
                "polls-dialog-options"
            );


        const dialogMessage =
            document.getElementById(
                "polls-dialog-message"
            );


        const submitButton =
            document.getElementById(
                "polls-submit-button"
            );


        const authRequired =
            document.getElementById(
                "polls-auth-required"
            );


        const authLoginButton =
            document.getElementById(
                "polls-auth-login"
            );


        /* =====================================================
           ÉLÉMENTS — PROPOSITION
        ====================================================== */

        const suggestionOpenButton =
            document.getElementById(
                "polls-suggestion-open"
            );


        const suggestionModal =
            document.getElementById(
                "polls-suggestion-modal"
            );


        const suggestionForm =
            document.getElementById(
                "polls-suggestion-form"
            );


        const suggestionCategory =
            document.getElementById(
                "polls-suggestion-category"
            );


        const suggestionQuestion =
            document.getElementById(
                "polls-suggestion-question"
            );


        const suggestionDescription =
            document.getElementById(
                "polls-suggestion-description"
            );


        const suggestionMessage =
            document.getElementById(
                "polls-suggestion-message"
            );


        /* =====================================================
           ÉTAT
        ====================================================== */

        let polls =
            [];


        let currentPoll =
            null;


        let currentOptionId =
            "";


        let isSubmittingVote =
            false;


        let isSubmittingSuggestion =
            false;


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


        function normalizeBoolean(
            value
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


            return false;
        }


        /* =====================================================
           DATES
        ====================================================== */

        function normalizeDate(
            value
        ) {

            const text =
                normalizeText(
                    value
                );


            if (
                !text
            ) {

                return null;
            }


            const date =
                new Date(
                    text
                );


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {

                return null;
            }


            return date;
        }


        function formatDate(
            value
        ) {

            const date =
                normalizeDate(
                    value
                );


            if (
                !date
            ) {

                return "";
            }


            return new Intl
                .DateTimeFormat(
                    "fr-FR",
                    {
                        day:
                            "2-digit",

                        month:
                            "2-digit",

                        year:
                            "numeric",

                        hour:
                            "2-digit",

                        minute:
                            "2-digit"
                    }
                )
                .format(
                    date
                );
        }


        /* =====================================================
           CATÉGORIES
        ====================================================== */

        function getCategoryInfo(
            category
        ) {

            switch (
                normalizeText(
                    category
                )
                    .toLowerCase()
            ) {

                case "games":

                    return {
                        icon:
                            "🎮",

                        label:
                            "Jeux"
                    };


                case "community":

                    return {
                        icon:
                            "💜",

                        label:
                            "Communauté"
                    };


                case "vtuber":

                    return {
                        icon:
                            "🎨",

                        label:
                            "VTuber"
                    };


                case "content":

                    return {
                        icon:
                            "🎬",

                        label:
                            "Contenu"
                    };


                case "events":

                    return {
                        icon:
                            "🎉",

                        label:
                            "Événements"
                    };


                case "fun":

                    return {
                        icon:
                            "😂",

                        label:
                            "Fun"
                    };


                default:

                    return {
                        icon:
                            "🗳️",

                        label:
                            "Sondage"
                    };
            }
        }


        /* =====================================================
           STATUT
        ====================================================== */

        function getStatusInfo(
            status
        ) {

            switch (
                normalizeText(
                    status
                )
                    .toLowerCase()
            ) {

                case "active":

                    return {
                        label:
                            "En cours",

                        className:
                            "is-active",

                        icon:
                            "🔥"
                    };


                case "upcoming":

                    return {
                        label:
                            "À venir",

                        className:
                            "is-upcoming",

                        icon:
                            "📅"
                    };


                case "finished":

                    return {
                        label:
                            "Terminé",

                        className:
                            "is-finished",

                        icon:
                            "🏆"
                    };


                default:

                    return {
                        label:
                            "Sondage",

                        className:
                            "",

                        icon:
                            "🗳️"
                    };
            }
        }


        /* =====================================================
           NORMALISATION OPTION
        ====================================================== */

        function normalizeOption(
            option,
            index
        ) {

            if (
                typeof option ===
                "string"
            ) {

                return {

                    id:
                        String(
                            index
                        ),

                    label:
                        normalizeText(
                            option
                        ),

                    votes:
                        0,

                    percentage:
                        0,

                    imageUrl:
                        ""

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
                        option.option_id ??
                        index
                    ),

                label:
                    normalizeText(
                        option.label ??
                        option.name ??
                        option.title
                    ) ||
                    `Choix ${index + 1}`,

                votes:
                    normalizeNumber(
                        option.votes ??
                        option.voteCount ??
                        option.vote_count
                    ),

                percentage:
                    normalizeNumber(
                        option.percentage ??
                        option.percent
                    ),

                imageUrl:
                    normalizeText(
                        option.imageUrl ??
                        option.image_url ??
                        option.cover
                    )

            };
        }


        /* =====================================================
           NORMALISATION SONDAGE
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
                        normalizeOption
                    )
                    .filter(
                        Boolean
                    );


            const voteCountFromOptions =
                options.reduce(
                    (
                        total,
                        option
                    ) =>
                        total +
                        normalizeNumber(
                            option.votes
                        ),
                    0
                );


            return {

                id:
                    normalizeText(
                        poll.id
                    ),

                title:
                    normalizeText(
                        poll.title ??
                        poll.question
                    ) ||
                    "Sondage",

                description:
                    normalizeText(
                        poll.description
                    ),

                category:
                    normalizeText(
                        poll.category
                    )
                        .toLowerCase() ||
                    "community",

                status:
                    normalizeText(
                        poll.status
                    )
                        .toLowerCase() ||
                    "active",

                options,

                totalVotes:
                    normalizeNumber(
                        poll.totalVotes ??
                        poll.total_votes,
                        voteCountFromOptions
                    ),

                startsAt:
                    normalizeText(
                        poll.startsAt ??
                        poll.starts_at
                    ),

                endsAt:
                    normalizeText(
                        poll.endsAt ??
                        poll.ends_at
                    ),

                winner:
                    normalizeText(
                        poll.winner ??
                        poll.winnerLabel ??
                        poll.winner_label
                    ),

                hasVoted:
                    normalizeBoolean(
                        poll.hasVoted ??
                        poll.has_voted
                    ),

                selectedOptionId:
                    normalizeText(
                        poll.selectedOptionId ??
                        poll.selected_option_id
                    ),

                resultsVisible:
                    poll.resultsVisible ??
                    poll.results_visible ??
                    true,

                allowSuggestions:
                    normalizeBoolean(
                        poll.allowSuggestions ??
                        poll.allow_suggestions
                    )

            };
        }


        /* =====================================================
           API
        ====================================================== */

        async function apiRequest(
            url,
            options = {}
        ) {

            const response =
                await fetch(
                    url,
                    {
                        cache:
                            "no-store",

                        credentials:
                            "same-origin",

                        headers: {

                            Accept:
                                "application/json",

                            ...(
                                options.body
                                    ? {
                                        "Content-Type":
                                            "application/json"
                                    }
                                    : {}
                            ),

                            ...options.headers

                        },

                        ...options
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

                const error =
                    new Error(
                        data?.error ||
                        data?.message ||
                        `Erreur HTTP ${response.status}`
                    );


                error.status =
                    response.status;


                error.data =
                    data;


                throw error;
            }


            return data;
        }


        /* =====================================================
           FILTRAGE
        ====================================================== */

        function getFilteredPolls() {

            const search =
                normalizeText(
                    searchInput?.value
                )
                    .toLowerCase();


            const selectedStatus =
                normalizeText(
                    statusFilter?.value
                )
                    .toLowerCase() ||
                "all";


            const selectedCategory =
                normalizeText(
                    categoryFilter?.value
                )
                    .toLowerCase() ||
                "all";


            return polls.filter(
                poll => {

                    if (
                        selectedStatus !==
                            "all" &&
                        poll.status !==
                            selectedStatus
                    ) {

                        return false;
                    }


                    if (
                        selectedCategory !==
                            "all" &&
                        poll.category !==
                            selectedCategory
                    ) {

                        return false;
                    }


                    if (
                        search
                    ) {

                        const haystack =
                            [
                                poll.title,
                                poll.description,
                                poll.category,
                                ...poll.options
                                    .map(
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


                    return true;
                }
            );
        }


        /* =====================================================
           STATISTIQUES
        ====================================================== */

        function updateStats() {

            const active =
                polls.filter(
                    poll =>
                        poll.status ===
                        "active"
                ).length;


            const upcoming =
                polls.filter(
                    poll =>
                        poll.status ===
                        "upcoming"
                ).length;


            const finished =
                polls.filter(
                    poll =>
                        poll.status ===
                        "finished"
                ).length;


            const totalVotes =
                polls.reduce(
                    (
                        total,
                        poll
                    ) =>
                        total +
                        poll.totalVotes,
                    0
                );


            if (
                statActive
            ) {

                statActive.textContent =
                    active;
            }


            if (
                statUpcoming
            ) {

                statUpcoming.textContent =
                    upcoming;
            }


            if (
                statFinished
            ) {

                statFinished.textContent =
                    finished;
            }


            if (
                statVotes
            ) {

                statVotes.textContent =
                    totalVotes;
            }
        }


        /* =====================================================
           CARTE
        ====================================================== */

        function renderPollCard(
            poll
        ) {

            const category =
                getCategoryInfo(
                    poll.category
                );


            const status =
                getStatusInfo(
                    poll.status
                );


            const optionCount =
                poll.options.length;


            let dateLabel =
                "";


            if (
                poll.status ===
                    "active" &&
                poll.endsAt
            ) {

                dateLabel =
                    `⏳ Fin : ${
                        formatDate(
                            poll.endsAt
                        )
                    }`;
            }


            if (
                poll.status ===
                    "upcoming" &&
                poll.startsAt
            ) {

                dateLabel =
                    `📅 Début : ${
                        formatDate(
                            poll.startsAt
                        )
                    }`;
            }


            if (
                poll.status ===
                    "finished" &&
                poll.endsAt
            ) {

                dateLabel =
                    `📅 Terminé : ${
                        formatDate(
                            poll.endsAt
                        )
                    }`;
            }


            const winner =
                (
                    poll.status ===
                        "finished" &&
                    poll.winner
                )
                    ? `
                        <div class="poll-card-winner">
                            🏆 ${escapeHtml(
                                poll.winner
                            )}
                        </div>
                    `
                    : "";


            const actionLabel =
                poll.status ===
                    "finished"
                    ? "📊 Voir les résultats"
                    : poll.status ===
                        "upcoming"
                        ? "👀 Voir le sondage"
                        : "🗳️ Participer";


            return `
                <article
                    class="poll-card"
                    data-poll-id="${escapeHtml(
                        poll.id
                    )}"
                    data-status="${escapeHtml(
                        poll.status
                    )}"
                    data-category="${escapeHtml(
                        poll.category
                    )}"
                >

                    <div class="poll-card-header">

                        <span class="poll-card-category">
                            ${category.icon}
                            ${escapeHtml(
                                category.label
                            )}
                        </span>


                        <span
                            class="
                                poll-card-status
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


                    <h3 class="poll-card-title">
                        ${escapeHtml(
                            poll.title
                        )}
                    </h3>


                    ${
                        poll.description
                            ? `
                                <p class="poll-card-description">
                                    ${escapeHtml(
                                        poll.description
                                    )}
                                </p>
                            `
                            : ""
                    }


                    ${winner}


                    <div class="poll-card-meta">

                        <span>
                            🗳️ ${poll.totalVotes}
                            vote${
                                poll.totalVotes >
                                1
                                    ? "s"
                                    : ""
                            }
                        </span>

                        <span>
                            ☑️ ${optionCount}
                            choix
                        </span>

                        ${
                            dateLabel
                                ? `
                                    <span>
                                        ${escapeHtml(
                                            dateLabel
                                        )}
                                    </span>
                                `
                                : ""
                        }

                    </div>


                    <button
                        class="poll-card-button"
                        type="button"
                        data-open-poll="${escapeHtml(
                            poll.id
                        )}"
                    >
                        ${actionLabel}
                    </button>

                </article>
            `;
        }


        /* =====================================================
           RENDU DES SECTIONS
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


            if (
                activeGrid
            ) {

                activeGrid.innerHTML =
                    activePolls
                        .map(
                            renderPollCard
                        )
                        .join(
                            ""
                        );
            }


            if (
                upcomingGrid
            ) {

                upcomingGrid.innerHTML =
                    upcomingPolls
                        .map(
                            renderPollCard
                        )
                        .join(
                            ""
                        );
            }


            if (
                finishedGrid
            ) {

                finishedGrid.innerHTML =
                    finishedPolls
                        .map(
                            renderPollCard
                        )
                        .join(
                            ""
                        );
            }


            if (
                activeCount
            ) {

                activeCount.textContent =
                    activePolls.length;
            }


            if (
                upcomingCount
            ) {

                upcomingCount.textContent =
                    upcomingPolls.length;
            }


            if (
                finishedCount
            ) {

                finishedCount.textContent =
                    finishedPolls.length;
            }


            if (
                activeSection
            ) {

                activeSection.hidden =
                    activePolls.length ===
                    0;
            }


            if (
                upcomingSection
            ) {

                upcomingSection.hidden =
                    upcomingPolls.length ===
                    0;
            }


            if (
                finishedSection
            ) {

                finishedSection.hidden =
                    finishedPolls.length ===
                    0;
            }


            if (
                emptyState
            ) {

                emptyState.hidden =
                    filteredPolls.length !==
                    0;
            }


            if (
                resultsText
            ) {

                resultsText.textContent =
                    `${filteredPolls.length} sondage${
                        filteredPolls.length >
                        1
                            ? "s"
                            : ""
                    } affiché${
                        filteredPolls.length >
                        1
                            ? "s"
                            : ""
                    }.`;
            }
        }


        /* =====================================================
           POURCENTAGES
        ====================================================== */

        function getOptionPercentage(
            poll,
            option
        ) {

            if (
                Number.isFinite(
                    Number(
                        option.percentage
                    )
                ) &&
                Number(
                    option.percentage
                ) >
                0
            ) {

                return Math.min(
                    100,
                    Math.max(
                        0,
                        Number(
                            option.percentage
                        )
                    )
                );
            }


            if (
                poll.totalVotes <=
                0
            ) {

                return 0;
            }


            return (
                option.votes /
                poll.totalVotes
            ) * 100;
        }


        /* =====================================================
           OPTIONS DE VOTE
        ====================================================== */

        function renderVotingOptions(
            poll
        ) {

            return poll.options
                .map(
                    option => `

                        <label class="polls-option">

                            <input
                                type="radio"
                                name="poll-option"
                                value="${escapeHtml(
                                    option.id
                                )}"
                                ${
                                    option.id ===
                                    poll.selectedOptionId
                                        ? "checked"
                                        : ""
                                }
                            >

                            <span class="polls-option-control">

                                <span
                                    class="polls-option-radio"
                                    aria-hidden="true"
                                ></span>

                                <strong>
                                    ${escapeHtml(
                                        option.label
                                    )}
                                </strong>

                            </span>

                        </label>

                    `
                )
                .join(
                    ""
                );
        }


        /* =====================================================
           RÉSULTATS DANS LA MODALE
        ====================================================== */

        function renderResults(
            poll
        ) {

            return poll.options
                .map(
                    option => {

                        const percentage =
                            getOptionPercentage(
                                poll,
                                option
                            );


                        const selected =
                            option.id ===
                            poll.selectedOptionId;


                        return `

                            <div
                                class="
                                    poll-result
                                    ${
                                        selected
                                            ? "is-selected"
                                            : ""
                                    }
                                "
                            >

                                <div class="poll-result-header">

                                    <strong>
                                        ${
                                            selected
                                                ? "💜 "
                                                : ""
                                        }${escapeHtml(
                                            option.label
                                        )}
                                    </strong>

                                    <span>
                                        ${percentage.toFixed(
                                            1
                                        )} %
                                    </span>

                                </div>


                                <div class="poll-result-bar">

                                    <span
                                        style="
                                            width:
                                            ${percentage}%;
                                        "
                                    ></span>

                                </div>


                                <small>
                                    ${option.votes}
                                    vote${
                                        option.votes >
                                        1
                                            ? "s"
                                            : ""
                                    }
                                </small>

                            </div>

                        `;
                    }
                )
                .join(
                    ""
                );
        }


        /* =====================================================
           AUTH TWITCH
        ====================================================== */

        function hideTwitchAuthRequired() {

            if (
                authRequired
            ) {

                authRequired.hidden =
                    true;
            }


            if (
                authLoginButton
            ) {

                authLoginButton.href =
                    DEFAULT_LOGIN_URL;
            }
        }


        function showTwitchAuthRequired(
            loginUrl = DEFAULT_LOGIN_URL
        ) {

            if (
                authRequired
            ) {

                authRequired.hidden =
                    false;
            }


            if (
                authLoginButton
            ) {

                authLoginButton.href =
                    normalizeText(
                        loginUrl
                    ) ||
                    DEFAULT_LOGIN_URL;
            }


            if (
                submitButton
            ) {

                submitButton.hidden =
                    true;
            }
        }


        /* =====================================================
           OUVRIR LE SONDAGE
        ====================================================== */

        function openPoll(
            pollId
        ) {

            const poll =
                polls.find(
                    item =>
                        item.id ===
                        normalizeText(
                            pollId
                        )
                );


            if (
                !poll ||
                !pollModal
            ) {

                return;
            }


            currentPoll =
                poll;


            currentOptionId =
                poll.selectedOptionId ||
                "";


            hideTwitchAuthRequired();


            if (
                dialogIcon
            ) {

                dialogIcon.textContent =
                    getCategoryInfo(
                        poll.category
                    ).icon;
            }


            if (
                dialogCategory
            ) {

                dialogCategory.textContent =
                    getCategoryInfo(
                        poll.category
                    ).label;
            }


            if (
                dialogTitle
            ) {

                dialogTitle.textContent =
                    poll.title;
            }


            if (
                dialogDescription
            ) {

                dialogDescription.textContent =
                    poll.description ||
                    "";
            }


            if (
                dialogMessage
            ) {

                dialogMessage.textContent =
                    "";
            }


            /* =================================================
               SONDAGE TERMINÉ
            ================================================= */

            if (
                poll.status ===
                    "finished"
            ) {

                if (
                    dialogOptions
                ) {

                    dialogOptions.innerHTML =
                        renderResults(
                            poll
                        );
                }


                if (
                    submitButton
                ) {

                    submitButton.hidden =
                        true;
                }
            }


            /* =================================================
               SONDAGE À VENIR
            ================================================= */

            else if (
                poll.status ===
                    "upcoming"
            ) {

                if (
                    dialogOptions
                ) {

                    dialogOptions.innerHTML =
                        renderVotingOptions(
                            poll
                        );
                }


                dialogOptions
                    ?.querySelectorAll(
                        "input"
                    )
                    .forEach(
                        input => {

                            input.disabled =
                                true;
                        }
                    );


                if (
                    submitButton
                ) {

                    submitButton.hidden =
                        true;
                }


                if (
                    dialogMessage
                ) {

                    dialogMessage.textContent =
                        poll.startsAt
                            ? `Ce sondage ouvrira le ${
                                formatDate(
                                    poll.startsAt
                                )
                            }.`
                            : "Ce sondage n'est pas encore ouvert.";
                }
            }


            /* =================================================
               SONDAGE ACTIF
            ================================================= */

            else {

                if (
                    dialogOptions
                ) {

                    if (
                        poll.hasVoted
                    ) {

                        dialogOptions.innerHTML =
                            renderResults(
                                poll
                            );

                    } else {

                        dialogOptions.innerHTML =
                            renderVotingOptions(
                                poll
                            );
                    }
                }


                if (
                    submitButton
                ) {

                    submitButton.hidden =
                        poll.hasVoted;


                    submitButton.disabled =
                        !currentOptionId;
                }


                if (
                    poll.hasVoted &&
                    dialogMessage
                ) {

                    dialogMessage.textContent =
                        "💜 Ton vote a déjà été enregistré.";
                }
            }


            pollModal.hidden =
                false;


            document.body
                .classList
                .add(
                    "polls-modal-open"
                );
        }


        /* =====================================================
           FERMER MODALE SONDAGE
        ====================================================== */

        function closePollModal() {

            if (
                !pollModal
            ) {

                return;
            }


            pollModal.hidden =
                true;


            document.body
                .classList
                .remove(
                    "polls-modal-open"
                );


            currentPoll =
                null;


            currentOptionId =
                "";


            hideTwitchAuthRequired();
        }


        /* =====================================================
           SÉLECTION OPTION
        ====================================================== */

        dialogOptions
            ?.addEventListener(
                "change",
                event => {

                    const target =
                        event.target;


                    if (
                        !(
                            target instanceof
                            HTMLInputElement
                        ) ||
                        target.name !==
                            "poll-option"
                    ) {

                        return;
                    }


                    currentOptionId =
                        normalizeText(
                            target.value
                        );


                    if (
                        submitButton
                    ) {

                        submitButton.disabled =
                            !currentOptionId;
                    }
                }
            );


        /* =====================================================
           ENVOYER LE VOTE
        ====================================================== */

        async function submitVote() {

            if (
                isSubmittingVote ||
                !currentPoll
            ) {

                return;
            }


            if (
                !currentOptionId
            ) {

                if (
                    dialogMessage
                ) {

                    dialogMessage.textContent =
                        "Choisis une réponse avant de voter.";
                }


                return;
            }


            isSubmittingVote =
                true;


            if (
                submitButton
            ) {

                submitButton.disabled =
                    true;


                submitButton.textContent =
                    "Enregistrement...";
            }


            if (
                dialogMessage
            ) {

                dialogMessage.textContent =
                    "";
            }


            try {

                const data =
                    await apiRequest(
                        POLLS_API,
                        {
                            method:
                                "POST",

                            body:
                                JSON.stringify({

                                    pollId:
                                        currentPoll.id,

                                    optionId:
                                        currentOptionId

                                })
                        }
                    );


                const updatedPoll =
                    normalizePoll(
                        data?.poll ??
                        data
                    );


                if (
                    updatedPoll
                ) {

                    const index =
                        polls.findIndex(
                            poll =>
                                poll.id ===
                                updatedPoll.id
                        );


                    if (
                        index !==
                        -1
                    ) {

                        polls[index] =
                            updatedPoll;
                    }


                    currentPoll =
                        updatedPoll;


                    if (
                        dialogOptions
                    ) {

                        dialogOptions.innerHTML =
                            renderResults(
                                updatedPoll
                            );
                    }


                    if (
                        dialogMessage
                    ) {

                        dialogMessage.textContent =
                            "💜 Ton vote a bien été enregistré !";
                    }

                    /* =================================================
                    MASCOTTE — VOTE ENREGISTRÉ
                    ================================================= */

                    const votedOption =
                        updatedPoll.options
                            ?.find(
                                option =>
                                    String(
                                        option.id
                                    ) ===
                                    String(
                                        currentOptionId
                                    )
                            );


                    window.dispatchEvent(
                        new CustomEvent(
                            "couaxia:poll-voted",
                            {
                                detail: {

                                    pollId:
                                        updatedPoll.id,

                                    pollTitle:
                                        updatedPoll.title,

                                    optionId:
                                        currentOptionId,

                                    optionLabel:
                                        votedOption?.label ||
                                        ""

                                }
                            }
                        )
                    );

                    if (
                        submitButton
                    ) {

                        submitButton.hidden =
                            true;
                    }


                    updateStats();

                    renderPolls();
                }


            } catch (
                error
            ) {

                console.error(
                    "[Polls Vote]",
                    error
                );


                /* =============================================
                   CONNEXION TWITCH REQUISE
                ============================================= */

                if (
                    error?.status ===
                        401 ||
                    error?.data
                        ?.loginRequired ===
                        true
                ) {

                    const loginUrl =
                        normalizeText(
                            error?.data
                                ?.loginUrl
                        ) ||
                        DEFAULT_LOGIN_URL;


                    showTwitchAuthRequired(
                        loginUrl
                    );


                    if (
                        dialogMessage
                    ) {

                        dialogMessage.textContent =
                            "";
                    }


                    return;
                }


                /* =============================================
                   DÉJÀ VOTÉ
                ============================================= */

                if (
                    error?.status ===
                        409
                ) {

                    if (
                        dialogMessage
                    ) {

                        dialogMessage.textContent =
                            error?.message ||
                            "Tu as déjà participé à ce sondage.";
                    }


                    return;
                }


                if (
                    dialogMessage
                ) {

                    dialogMessage.textContent =
                        error?.message ||
                        "Impossible d'enregistrer le vote.";
                }


            } finally {

                isSubmittingVote =
                    false;


                if (
                    submitButton &&
                    !submitButton.hidden
                ) {

                    submitButton.textContent =
                        "🗳️ Voter";


                    submitButton.disabled =
                        !currentOptionId;
                }
            }
        }


        /* =====================================================
           CHARGER LES SONDAGES
        ====================================================== */

        async function loadPolls() {

            if (
                resultsText
            ) {

                resultsText.textContent =
                    "Chargement des sondages...";
            }


            try {

                const data =
                    await apiRequest(
                        POLLS_API,
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
                        : Array.isArray(
                            data?.polls
                        )
                            ? data.polls
                            : [];


                polls =
                    rawPolls
                        .map(
                            normalizePoll
                        )
                        .filter(
                            Boolean
                        );


                console.info(
                    `[Polls] ${polls.length} sondage(s) chargé(s).`
                );


                updateStats();

                renderPolls();


            } catch (
                error
            ) {

                console.error(
                    "[Polls]",
                    error
                );


                polls =
                    [];


                updateStats();

                renderPolls();


                if (
                    resultsText
                ) {

                    resultsText.textContent =
                        "Impossible de charger les sondages.";
                }
            }
        }


        /* =====================================================
           OUVRIR PROPOSITION
        ====================================================== */

        function openSuggestionModal() {

            if (
                !suggestionModal
            ) {

                return;
            }


            if (
                suggestionMessage
            ) {

                suggestionMessage.textContent =
                    "";
            }


            suggestionModal.hidden =
                false;


            document.body
                .classList
                .add(
                    "polls-modal-open"
                );


            window.setTimeout(
                () => {

                    suggestionCategory
                        ?.focus();

                },
                50
            );
        }


        /* =====================================================
           FERMER PROPOSITION
        ====================================================== */

        function closeSuggestionModal() {

            if (
                !suggestionModal
            ) {

                return;
            }


            suggestionModal.hidden =
                true;


            document.body
                .classList
                .remove(
                    "polls-modal-open"
                );
        }


        /* =====================================================
           ENVOYER UNE PROPOSITION
        ====================================================== */

        async function submitSuggestion(
            event
        ) {

            event.preventDefault();


            if (
                isSubmittingSuggestion
            ) {

                return;
            }


            const category =
                normalizeText(
                    suggestionCategory
                        ?.value
                );


            const question =
                normalizeText(
                    suggestionQuestion
                        ?.value
                );


            const description =
                normalizeText(
                    suggestionDescription
                        ?.value
                );


            if (
                !category ||
                !question
            ) {

                if (
                    suggestionMessage
                ) {

                    suggestionMessage.textContent =
                        "Choisis une catégorie et écris ton idée.";
                }


                return;
            }


            isSubmittingSuggestion =
                true;


            const submit =
                suggestionForm
                    ?.querySelector(
                        '.polls-submit-button[type="submit"]'
                    );


            if (
                submit
            ) {

                submit.disabled =
                    true;


                submit.textContent =
                    "Envoi...";
            }


            try {

                await apiRequest(
                    POLL_SUGGESTIONS_API,
                    {
                        method:
                            "POST",

                        body:
                            JSON.stringify({
                                category,
                                question,
                                description
                            })
                    }
                );


                if (
                    suggestionMessage
                ) {

                    suggestionMessage.textContent =
                        "💜 Merci ! Ta proposition a bien été envoyée.";
                }
                /* =================================================
                MASCOTTE — PROPOSITION ENVOYÉE
                ================================================= */

                window.dispatchEvent(
                    new CustomEvent(
                        "couaxia:poll-suggestion-sent",
                        {
                            detail: {
                                category,
                                question,
                                description
                            }
                        }
                    )
                );

                suggestionForm
                    ?.reset();


            } catch (
                error
            ) {

                console.error(
                    "[Poll Suggestion]",
                    error
                );


                /*
                 * Si plus tard tu souhaites également
                 * rendre Twitch obligatoire pour proposer
                 * une idée, l'API pourra répondre 401.
                 */
                if (
                    error?.status ===
                        401 &&
                    error?.data
                        ?.loginUrl
                ) {

                    if (
                        suggestionMessage
                    ) {

                        suggestionMessage.innerHTML =
                            `
                                Connexion Twitch nécessaire pour envoyer
                                cette proposition.
                                <a
                                    href="${escapeHtml(
                                        error.data.loginUrl
                                    )}"
                                >
                                    Se connecter avec Twitch
                                </a>
                            `;
                    }


                    return;
                }


                if (
                    suggestionMessage
                ) {

                    suggestionMessage.textContent =
                        error?.message ||
                        "Impossible d'envoyer la proposition.";
                }


            } finally {

                isSubmittingSuggestion =
                    false;


                if (
                    submit
                ) {

                    submit.disabled =
                        false;


                    submit.textContent =
                        "💜 Envoyer ma proposition";
                }
            }
        }


        /* =====================================================
           CLIC SUR UNE CARTE
        ====================================================== */

        document.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        "[data-open-poll]"
                    );


                if (
                    !button
                ) {

                    return;
                }


                openPoll(
                    button.getAttribute(
                        "data-open-poll"
                    )
                );
            }
        );


        /* =====================================================
           FERMETURE MODALE SONDAGE
        ====================================================== */

        pollModal
            ?.querySelectorAll(
                "[data-polls-close]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        closePollModal
                    );
                }
            );


        /* =====================================================
           FERMETURE MODALE PROPOSITION
        ====================================================== */

        suggestionModal
            ?.querySelectorAll(
                "[data-suggestion-close]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        closeSuggestionModal
                    );
                }
            );


        /* =====================================================
           ESCAPE
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
                    pollModal &&
                    !pollModal.hidden
                ) {

                    closePollModal();

                    return;
                }


                if (
                    suggestionModal &&
                    !suggestionModal.hidden
                ) {

                    closeSuggestionModal();
                }
            }
        );


        /* =====================================================
           BOUTON VOTER
        ====================================================== */

        submitButton
            ?.addEventListener(
                "click",
                submitVote
            );


        /* =====================================================
           PROPOSITION
        ====================================================== */

        suggestionOpenButton
            ?.addEventListener(
                "click",
                openSuggestionModal
            );


        suggestionForm
            ?.addEventListener(
                "submit",
                submitSuggestion
            );


        /* =====================================================
           FILTRES
        ====================================================== */

        searchInput
            ?.addEventListener(
                "input",
                renderPolls
            );


        statusFilter
            ?.addEventListener(
                "change",
                renderPolls
            );


        categoryFilter
            ?.addEventListener(
                "change",
                renderPolls
            );


        /* =====================================================
           API PUBLIQUE
        ====================================================== */

        window.CouaxiaPolls = {

            getPolls() {

                return [
                    ...polls
                ];
            },


            reload() {

                return loadPolls();
            },


            open(
                pollId
            ) {

                openPoll(
                    pollId
                );
            }

        };


        /* =====================================================
           INITIALISATION
        ====================================================== */

        loadPolls();

    }
);