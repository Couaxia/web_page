"use strict";

/* =========================================================
   SONDAGE PUBLIC — PAGE JEUX
   COUAXIA
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =====================================================
           CONFIGURATION
        ====================================================== */

        const POLL_API =
            "/api/poll";


        const STORAGE_PREFIX =
            "couaxia_poll_vote_";


        /* =====================================================
           ÉLÉMENTS HTML
        ====================================================== */

        const voteButton =
            document.getElementById(
                "games-vote-button"
            );


        const pollSummary =
            document.getElementById(
                "games-poll-summary"
            );


        const pollSummaryText =
            document.getElementById(
                "games-poll-summary-text"
            );


        const pollSummaryButton =
            document.getElementById(
                "games-poll-summary-button"
            );


        /* =====================================================
           ÉTAT
        ====================================================== */

        let currentPoll =
            null;


        let selectedOptionId =
            null;


        let pollModal =
            null;


        /*
         * Vote enregistré côté serveur pour
         * le compte Twitch actuellement connecté.
         */
        let serverVote =
            null;


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


        function normalizePoll(
            value
        ) {

            if (
                !value ||
                typeof value !==
                    "object"
            ) {

                return null;
            }


            const options =
                Array.isArray(
                    value.options
                )
                    ? value.options
                        .map(
                            (
                                option,
                                index
                            ) => {

                                const label =
                                    normalizeText(
                                        option?.label ??
                                        option?.name ??
                                        option?.text
                                    );


                                if (
                                    !label
                                ) {

                                    return null;
                                }


                                return {

                                    id:
                                        normalizeText(
                                            option?.id
                                        ) ||
                                        String(
                                            index + 1
                                        ),

                                    label,

                                    votes:
                                        Math.max(
                                            0,
                                            Number(
                                                option?.votes ||
                                                0
                                            )
                                        )

                                };
                            }
                        )
                        .filter(
                            Boolean
                        )
                    : [];


            return {

                id:
                    normalizeText(
                        value.id
                    ),

                question:
                    normalizeText(
                        value.question
                    ),

                status:
                    normalizeText(
                        value.status
                    )
                        .toLowerCase() ||
                    "closed",

                options,

                createdAt:
                    value.createdAt ??
                    value.created_at ??
                    null,

                updatedAt:
                    value.updatedAt ??
                    value.updated_at ??
                    null,

                /*
                 * Vote du compte Twitch connecté.
                 */
                myVote:
                    normalizeText(
                        value.myVote ??
                        value.userVote ??
                        value.vote
                    ) ||
                    null

            };
        }


        function isPollOpen(
            poll
        ) {

            return Boolean(
                poll &&
                poll.status ===
                    "open" &&
                poll.question &&
                Array.isArray(
                    poll.options
                ) &&
                poll.options.length >=
                    2
            );
        }


        function getTotalVotes(
            poll
        ) {

            if (
                !poll ||
                !Array.isArray(
                    poll.options
                )
            ) {

                return 0;
            }


            return poll.options.reduce(
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
        }


        /* =====================================================
           STOCKAGE LOCAL DU VOTE
        ====================================================== */

        function getPollStorageKey(
            poll
        ) {

            const pollIdentifier =
                normalizeText(
                    poll?.id
                ) ||
                normalizeText(
                    poll?.updatedAt
                ) ||
                "main";


            return (
                STORAGE_PREFIX +
                pollIdentifier
            );
        }


        function getStoredVote(
            poll
        ) {

            if (
                !poll
            ) {

                return null;
            }


            try {

                return localStorage.getItem(
                    getPollStorageKey(
                        poll
                    )
                );

            } catch {

                return null;
            }
        }


        function getCurrentUserVote(
            poll
        ) {

            /*
             * Le vote serveur est prioritaire.
             *
             * localStorage sert uniquement de
             * mémoire d'affichage.
             *
             * La vraie sécurité se trouve côté serveur.
             */
            return (
                serverVote ||
                getStoredVote(
                    poll
                ) ||
                null
            );
        }


        function saveStoredVote(
            poll,
            optionId
        ) {

            if (
                !poll ||
                !optionId
            ) {

                return;
            }


            try {

                localStorage.setItem(
                    getPollStorageKey(
                        poll
                    ),
                    optionId
                );

            } catch {

                /*
                 * localStorage indisponible.
                 *
                 * Ce n'est pas bloquant puisque
                 * le vote est conservé côté serveur.
                 */
            }
        }


        /* =====================================================
           API
        ====================================================== */

        async function pollApiRequest(
            options = {}
        ) {

            const method =
                options.method ||
                "GET";


            const fetchOptions = {

                method,

                cache:
                    "no-store",

                credentials:
                    "include",

                headers: {

                    Accept:
                        "application/json"

                }

            };


            if (
                options.body !==
                    undefined
            ) {

                fetchOptions.headers[
                    "Content-Type"
                ] =
                    "application/json";


                fetchOptions.body =
                    JSON.stringify(
                        options.body
                    );
            }


            let response;


            try {

                response =
                    await fetch(
                        POLL_API,
                        fetchOptions
                    );

            } catch (
                error
            ) {

                console.error(
                    "[Games Poll API]",
                    error
                );


                throw new Error(
                    "Impossible de contacter le serveur du sondage."
                );
            }


            const data =
                await response
                    .json()
                    .catch(
                        () => ({})
                    );


            /*
             * On conserve le statut HTTP et les
             * données renvoyées par l'API.
             *
             * Cela permet notamment de reconnaître :
             *
             * 401 → connexion Twitch nécessaire
             * 409 → utilisateur ayant déjà voté
             */
            if (
                !response.ok
            ) {

                const error =
                    new Error(
                        data?.error ||
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
           AFFICHAGE GLOBAL
        ====================================================== */

        function hidePollInterface() {

            if (
                voteButton
            ) {

                voteButton.hidden =
                    true;
            }


            if (
                pollSummary
            ) {

                pollSummary.hidden =
                    true;
            }
        }


        function showPollInterface() {

            if (
                !isPollOpen(
                    currentPoll
                )
            ) {

                hidePollInterface();

                return;
            }


            if (
                voteButton
            ) {

                voteButton.hidden =
                    false;
            }


            if (
                pollSummary
            ) {

                pollSummary.hidden =
                    false;
            }


            const totalVotes =
                getTotalVotes(
                    currentPoll
                );


            if (
                pollSummaryText
            ) {

                pollSummaryText.textContent =
                    totalVotes > 0
                        ? `${currentPoll.question} — ${totalVotes} vote${totalVotes > 1 ? "s" : ""} pour le moment.`
                        : currentPoll.question;
            }


            const storedVote =
                getCurrentUserVote(
                    currentPoll
                );


            if (
                pollSummaryButton
            ) {

                pollSummaryButton.textContent =
                    storedVote
                        ? "Voir les résultats"
                        : "Voter";
            }


            if (
                voteButton
            ) {

                const label =
                    voteButton.querySelector(
                        "span:last-child"
                    );


                if (
                    label
                ) {

                    label.textContent =
                        storedVote
                            ? "Voir le sondage"
                            : "Vote pour le prochain jeu";
                }
            }
        }


        /* =====================================================
           CHARGEMENT
        ====================================================== */

        async function loadPoll() {

            try {

                const data =
                    await pollApiRequest({

                        method:
                            "GET"

                    });


                currentPoll =
                    normalizePoll(
                        data?.poll ??
                        data
                    );


                /*
                 * Le backend peut envoyer :
                 *
                 * {
                 *     poll: {...},
                 *     myVote: "2"
                 * }
                 *
                 * ou poll.myVote.
                 */
                serverVote =
                    normalizeText(
                        data?.myVote ??
                        currentPoll?.myVote
                    ) ||
                    null;


                if (
                    !isPollOpen(
                        currentPoll
                    )
                ) {

                    currentPoll =
                        null;


                    serverVote =
                        null;


                    hidePollInterface();


                    return;
                }


                showPollInterface();


            } catch (
                error
            ) {

                console.error(
                    "[Games Poll Load]",
                    error
                );


                currentPoll =
                    null;


                serverVote =
                    null;


                hidePollInterface();
            }
        }


        /* =====================================================
           MODALE — CRÉATION
        ====================================================== */

        function ensurePollModal() {

            if (
                pollModal
            ) {

                return pollModal;
            }


            pollModal =
                document.createElement(
                    "div"
                );


            pollModal.className =
                "games-poll-modal";


            pollModal.hidden =
                true;


            pollModal.innerHTML = `

                <div
                    class="games-poll-modal-backdrop"
                    data-poll-close
                ></div>


                <section
                    class="games-poll-dialog"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="games-poll-dialog-title"
                >

                    <button
                        type="button"
                        class="games-poll-modal-close"
                        data-poll-close
                        aria-label="Fermer le sondage"
                    >
                        ✕
                    </button>


                    <div class="games-poll-dialog-header">

                        <span
                            class="games-poll-dialog-icon"
                            aria-hidden="true"
                        >
                            🗳️
                        </span>


                        <div>

                            <span
                                class="games-poll-dialog-eyebrow"
                            >
                                Communauté
                            </span>


                            <h2
                                id="games-poll-dialog-title"
                                class="games-poll-dialog-title"
                            >
                                Sondage
                            </h2>

                        </div>

                    </div>


                    <p
                        id="games-poll-dialog-question"
                        class="games-poll-dialog-question"
                    ></p>


                    <div
                        id="games-poll-options"
                        class="games-poll-options"
                    ></div>


                    <p
                        id="games-poll-message"
                        class="games-poll-message"
                        aria-live="polite"
                    ></p>


                    <div
                        class="games-poll-dialog-actions"
                    >

                        <button
                            type="button"
                            class="games-poll-cancel-button"
                            data-poll-close
                        >
                            Fermer
                        </button>


                        <button
                            type="button"
                            id="games-poll-submit"
                            class="games-poll-submit-button"
                        >
                            🗳️ Voter
                        </button>

                    </div>

                </section>
            `;


            document.body.appendChild(
                pollModal
            );


            /* =================================================
               FERMETURE
            ================================================= */

            pollModal
                .querySelectorAll(
                    "[data-poll-close]"
                )
                .forEach(
                    button => {

                        button.addEventListener(
                            "click",
                            closePollModal
                        );

                    }
                );


            /* =================================================
               VOTE
            ================================================= */

            const submitButton =
                pollModal.querySelector(
                    "#games-poll-submit"
                );


            submitButton
                ?.addEventListener(
                    "click",
                    submitVote
                );


            return pollModal;
        }


        /* =====================================================
           MODALE — OUVERTURE
        ====================================================== */

        function openPollModal() {

            if (
                !isPollOpen(
                    currentPoll
                )
            ) {

                return;
            }


            selectedOptionId =
                null;


            const modal =
                ensurePollModal();


            renderPollModal();


            modal.hidden =
                false;


            document.body.classList.add(
                "games-poll-open"
            );


            const closeButton =
                modal.querySelector(
                    ".games-poll-modal-close"
                );


            closeButton?.focus();
        }


        /* =====================================================
           MODALE — FERMETURE
        ====================================================== */

        function closePollModal() {

            if (
                !pollModal
            ) {

                return;
            }


            pollModal.hidden =
                true;


            document.body.classList.remove(
                "games-poll-open"
            );


            selectedOptionId =
                null;
        }


        /* =====================================================
           AFFICHAGE MODALE
        ====================================================== */

        function renderPollModal() {

            if (
                !pollModal ||
                !currentPoll
            ) {

                return;
            }


            const questionElement =
                pollModal.querySelector(
                    "#games-poll-dialog-question"
                );


            const optionsElement =
                pollModal.querySelector(
                    "#games-poll-options"
                );


            const messageElement =
                pollModal.querySelector(
                    "#games-poll-message"
                );


            const submitButton =
                pollModal.querySelector(
                    "#games-poll-submit"
                );


            if (
                questionElement
            ) {

                questionElement.textContent =
                    currentPoll.question;
            }


            if (
                messageElement
            ) {

                messageElement.textContent =
                    "";
            }


            if (
                !optionsElement
            ) {

                return;
            }


            const storedVote =
                getCurrentUserVote(
                    currentPoll
                );


            /* =================================================
               DÉJÀ VOTÉ → RÉSULTATS
            ================================================= */

            if (
                storedVote
            ) {

                renderPollResults(
                    optionsElement,
                    storedVote
                );


                if (
                    submitButton
                ) {

                    submitButton.hidden =
                        true;
                }


                if (
                    messageElement
                ) {

                    messageElement.textContent =
                        "Ton vote a déjà été enregistré. 💜";
                }


                return;
            }


            /* =================================================
               CHOIX DU VOTE
            ================================================= */

            if (
                submitButton
            ) {

                submitButton.hidden =
                    false;


                submitButton.disabled =
                    true;


                submitButton.textContent =
                    "🗳️ Voter";
            }


            optionsElement.innerHTML =
                currentPoll.options
                    .map(
                        option => `

                            <label
                                class="games-poll-option"
                                data-option-id="${escapeHtml(
                                    option.id
                                )}"
                            >

                                <input
                                    type="radio"
                                    name="games-poll-option"
                                    value="${escapeHtml(
                                        option.id
                                    )}"
                                >


                                <span
                                    class="games-poll-option-control"
                                >

                                    <span
                                        class="games-poll-radio"
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


            optionsElement
                .querySelectorAll(
                    'input[name="games-poll-option"]'
                )
                .forEach(
                    input => {

                        input.addEventListener(
                            "change",
                            () => {

                                selectedOptionId =
                                    normalizeText(
                                        input.value
                                    );


                                if (
                                    submitButton
                                ) {

                                    submitButton.disabled =
                                        !selectedOptionId;
                                }

                            }
                        );

                    }
                );
        }


        /* =====================================================
           RÉSULTATS
        ====================================================== */

        function renderPollResults(
            container,
            votedOptionId = null
        ) {

            if (
                !currentPoll ||
                !container
            ) {

                return;
            }


            const totalVotes =
                getTotalVotes(
                    currentPoll
                );


            container.innerHTML =
                currentPoll.options
                    .map(
                        option => {

                            const votes =
                                Number(
                                    option.votes ||
                                    0
                                );


                            const percentage =
                                totalVotes > 0
                                    ? Math.round(
                                        (
                                            votes /
                                            totalVotes
                                        ) *
                                        100
                                    )
                                    : 0;


                            const isVoted =
                                String(
                                    option.id
                                ) ===
                                String(
                                    votedOptionId
                                );


                            return `

                                <article
                                    class="games-poll-result${
                                        isVoted
                                            ? " is-selected"
                                            : ""
                                    }"
                                >

                                    <div
                                        class="games-poll-result-header"
                                    >

                                        <span>
                                            ${
                                                isVoted
                                                    ? "💜 "
                                                    : ""
                                            }${escapeHtml(
                                                option.label
                                            )}
                                        </span>


                                        <strong>
                                            ${percentage} %
                                        </strong>

                                    </div>


                                    <div
                                        class="games-poll-result-bar"
                                        aria-hidden="true"
                                    >

                                        <span
                                            style="width:${percentage}%"
                                        ></span>

                                    </div>


                                    <small>

                                        ${votes} vote${
                                            votes > 1
                                                ? "s"
                                                : ""
                                        }

                                    </small>

                                </article>
                            `;
                        }
                    )
                    .join(
                        ""
                    );
        }


        /* =====================================================
           ENVOI DU VOTE
        ====================================================== */

        async function submitVote() {

            if (
                !currentPoll ||
                !selectedOptionId
            ) {

                return;
            }


            /*
             * Protection visuelle.
             *
             * La vraie protection 1 compte = 1 vote
             * est effectuée dans Supabase / api/poll.js.
             */
            if (
                getCurrentUserVote(
                    currentPoll
                )
            ) {

                renderPollModal();

                return;
            }


            const submitButton =
                pollModal?.querySelector(
                    "#games-poll-submit"
                );


            const messageElement =
                pollModal?.querySelector(
                    "#games-poll-message"
                );


            if (
                submitButton
            ) {

                submitButton.disabled =
                    true;


                submitButton.textContent =
                    "Vote en cours...";
            }


            if (
                messageElement
            ) {

                messageElement.textContent =
                    "";
            }


            try {

                const data =
                    await pollApiRequest({

                        method:
                            "POST",

                        body: {

                            pollId:
                                currentPoll.id,

                            optionId:
                                selectedOptionId

                        }

                    });


                /* =================================================
                   SONDAGE ACTUALISÉ
                ================================================= */

                const updatedPoll =
                    normalizePoll(
                        data?.poll
                    );


                if (
                    updatedPoll
                ) {

                    currentPoll =
                        updatedPoll;
                }


                /* =================================================
                   VOTE UTILISATEUR
                ================================================= */

                serverVote =
                    normalizeText(
                        data?.myVote ??
                        currentPoll?.myVote ??
                        selectedOptionId
                    ) ||
                    selectedOptionId;


                /*
                 * localStorage sert uniquement à
                 * améliorer l'affichage immédiat.
                 */
                saveStoredVote(
                    currentPoll,
                    serverVote
                );


                /* =================================================
                   OPTION CHOISIE
                ================================================= */

                const selectedOption =
                    currentPoll.options.find(
                        option =>
                            String(
                                option.id
                            ) ===
                            String(
                                serverVote
                            )
                    );


                if (
                    messageElement
                ) {

                    messageElement.textContent =
                        selectedOption
                            ? `Ton vote pour "${selectedOption.label}" a bien été enregistré ! 💜`
                            : "Ton vote a bien été enregistré ! 💜";
                }


                /* =================================================
                   RÉSULTATS
                ================================================= */

                const optionsElement =
                    pollModal?.querySelector(
                        "#games-poll-options"
                    );


                if (
                    optionsElement
                ) {

                    renderPollResults(
                        optionsElement,
                        serverVote
                    );
                }


                if (
                    submitButton
                ) {

                    submitButton.hidden =
                        true;
                }


                showPollInterface();


            } catch (
                error
            ) {

                console.error(
                    "[Games Poll Vote]",
                    error
                );


                /* =================================================
                   CONNEXION TWITCH REQUISE
                ================================================= */

                /*
                 * api/poll.js renvoie :
                 *
                 * 401
                 *
                 * {
                 *     loginRequired: true,
                 *     loginUrl: "/api/auth/login"
                 * }
                 *
                 * si le viewer n'est pas connecté.
                 */
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
                        "/api/auth/login";


                    if (
                        messageElement
                    ) {

                        messageElement.textContent =
                            "Connexion à Twitch nécessaire...";
                    }


                    /*
                     * Twitch prend ensuite le relais.
                     *
                     * Après connexion, server.js redirige
                     * l'utilisateur vers games.html.
                     */
                    window.location.href =
                        loginUrl;


                    return;
                }


                /* =================================================
                   DÉJÀ VOTÉ
                ================================================= */

                /*
                 * Le serveur peut répondre 409 lorsque
                 * ce compte Twitch possède déjà un vote.
                 *
                 * On utilise alors directement les données
                 * serveur au lieu de permettre un autre vote.
                 */
                if (
                    error?.status ===
                        409 &&
                    (
                        error?.data
                            ?.alreadyVoted ===
                            true ||
                        error?.message
                            ?.toLowerCase()
                            .includes(
                                "déjà voté"
                            )
                    )
                ) {

                    serverVote =
                        normalizeText(
                            error?.data
                                ?.myVote
                        ) ||
                        serverVote;


                    /*
                     * Si l'API nous donne déjà le sondage
                     * actualisé, inutile de refaire un GET.
                     */
                    if (
                        error?.data
                            ?.poll
                    ) {

                        const refreshedPoll =
                            normalizePoll(
                                error.data.poll
                            );


                        if (
                            refreshedPoll
                        ) {

                            currentPoll =
                                refreshedPoll;
                        }

                    } else {

                        /*
                         * Sinon, on récupère la dernière
                         * version depuis le serveur.
                         */
                        await loadPoll();
                    }


                    if (
                        serverVote
                    ) {

                        saveStoredVote(
                            currentPoll,
                            serverVote
                        );
                    }


                    renderPollModal();


                    showPollInterface();


                    return;
                }


                /* =================================================
                   AUTRE ERREUR
                ================================================= */

                if (
                    messageElement
                ) {

                    messageElement.textContent =
                        error?.message ||
                        "Impossible d'enregistrer ton vote.";
                }


                if (
                    submitButton
                ) {

                    submitButton.disabled =
                        false;


                    submitButton.textContent =
                        "🗳️ Voter";
                }
            }
        }


        /* =====================================================
           BOUTONS
        ====================================================== */

        if (
            voteButton
        ) {

            voteButton.addEventListener(
                "click",
                openPollModal
            );
        }


        if (
            pollSummaryButton
        ) {

            pollSummaryButton.addEventListener(
                "click",
                openPollModal
            );
        }


        /* =====================================================
           CLAVIER
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
                }

            }
        );


        /* =====================================================
           RAFRAÎCHISSEMENT ONGLET
        ====================================================== */

        document.addEventListener(
            "visibilitychange",
            () => {

                if (
                    document.visibilityState ===
                    "visible"
                ) {

                    loadPoll();
                }

            }
        );


        /* =====================================================
           RETOUR APRÈS CONNEXION TWITCH
        ====================================================== */

        /*
         * Après OAuth Twitch :
         *
         * /games.html?login=success
         *
         * On retire simplement le paramètre de l'URL
         * puis on recharge les informations du sondage.
         */
        const url =
            new URL(
                window.location.href
            );


        const loginStatus =
            normalizeText(
                url.searchParams.get(
                    "login"
                )
            );


        if (
            loginStatus
        ) {

            /*
             * On nettoie l'URL afin d'éviter :
             *
             * games.html?login=success
             *
             * pendant toute la navigation.
             */
            url.searchParams.delete(
                "login"
            );


            window.history.replaceState(
                {},
                document.title,
                url.pathname +
                url.search +
                url.hash
            );


            if (
                loginStatus ===
                "success"
            ) {

                console.info(
                    "[Games Poll] Connexion Twitch réussie."
                );
            }


            if (
                loginStatus ===
                "refused"
            ) {

                console.info(
                    "[Games Poll] Connexion Twitch refusée."
                );
            }


            if (
                loginStatus ===
                "error"
            ) {

                console.error(
                    "[Games Poll] Erreur de connexion Twitch."
                );
            }
        }


        /* =====================================================
           INITIALISATION
        ====================================================== */

        hidePollInterface();


        loadPoll()
            .catch(
                error => {

                    console.error(
                        "[Games Poll Init]",
                        error
                    );

                }
            );


        console.info(
            "[Games Poll] Script chargé."
        );

    }
);