"use strict";

/* =========================================================
   ANNONCES & NOUVEAUTÉS
   COUAXIA
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =====================================================
           CONFIGURATION
        ====================================================== */

        const ANNOUNCEMENTS_API =
            "/api/announcements";


        const STORAGE_KEY =
            "couaxia_read_announcements";


        const MAX_RENDERED_ANNOUNCEMENTS =
            20;


        /* =====================================================
           ÉLÉMENTS
        ====================================================== */

        const notifications =
            document.getElementById(
                "notifications"
            );


        const notificationButton =
            document.getElementById(
                "notification-button"
            );


        const notificationPlaceholder =
            document.getElementById(
                "notification-placeholder"
            );


        const notificationMascotte =
            document.getElementById(
                "notification-mascotte"
            );


        const notificationCount =
            document.getElementById(
                "notification-count"
            );


        const notificationPanel =
            document.getElementById(
                "notification-panel"
            );


        const notificationList =
            document.getElementById(
                "notification-list"
            );


        const notificationReadAll =
            document.getElementById(
                "notification-read-all"
            );


        const notificationStatus =
            document.getElementById(
                "notification-status"
            );


        /* =====================================================
           SÉCURITÉ
        ====================================================== */

        if (
            !notifications ||
            !notificationButton ||
            !notificationPanel ||
            !notificationList
        ) {

            return;
        }


        /* =====================================================
           ÉTAT
        ====================================================== */

        let announcements =
            [];


        let unreadAnnouncements =
            [];


        let panelOpen =
            false;


        /* =====================================================
           OUTILS
        ====================================================== */

        function normalizeText(
            value
        ) {

            return String(
                value ??
                ""
            ).trim();
        }


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


        function isInternalLink(
            url
        ) {

            const value =
                normalizeText(
                    url
                );


            if (
                !value
            ) {

                return false;
            }


            return (
                value.startsWith(
                    "/"
                ) ||
                value.startsWith(
                    "./"
                ) ||
                value.startsWith(
                    "../"
                )
            );
        }


        /* =====================================================
           DATES
        ====================================================== */

        function formatDate(
            value
        ) {

            const text =
                normalizeText(
                    value
                );


            if (
                !text
            ) {

                return "";
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


        function formatRelativeDate(
            value
        ) {

            const text =
                normalizeText(
                    value
                );


            if (
                !text
            ) {

                return "";
            }


            const date =
                new Date(
                    text
                );


            const timestamp =
                date.getTime();


            if (
                Number.isNaN(
                    timestamp
                )
            ) {

                return "";
            }


            const difference =
                Date.now() -
                timestamp;


            const absoluteDifference =
                Math.abs(
                    difference
                );


            const minute =
                60 * 1000;


            const hour =
                60 * minute;


            const day =
                24 * hour;


            if (
                absoluteDifference <
                minute
            ) {

                return "À l'instant";
            }


            if (
                absoluteDifference <
                hour
            ) {

                const minutes =
                    Math.max(
                        1,
                        Math.floor(
                            absoluteDifference /
                            minute
                        )
                    );


                return difference >= 0
                    ? `Il y a ${minutes} min`
                    : `Dans ${minutes} min`;
            }


            if (
                absoluteDifference <
                day
            ) {

                const hours =
                    Math.max(
                        1,
                        Math.floor(
                            absoluteDifference /
                            hour
                        )
                    );


                return difference >= 0
                    ? `Il y a ${hours} h`
                    : `Dans ${hours} h`;
            }


            const days =
                Math.max(
                    1,
                    Math.floor(
                        absoluteDifference /
                        day
                    )
                );


            if (
                days <=
                7
            ) {

                return difference >= 0
                    ? `Il y a ${days} jour${
                        days > 1
                            ? "s"
                            : ""
                    }`
                    : `Dans ${days} jour${
                        days > 1
                            ? "s"
                            : ""
                    }`;
            }


            return formatDate(
                value
            );
        }


        /* =====================================================
           LOCAL STORAGE
        ====================================================== */

        function getReadAnnouncementIds() {

            try {

                const stored =
                    localStorage.getItem(
                        STORAGE_KEY
                    );


                if (
                    !stored
                ) {

                    return [];
                }


                const parsed =
                    JSON.parse(
                        stored
                    );


                if (
                    !Array.isArray(
                        parsed
                    )
                ) {

                    return [];
                }


                return parsed
                    .map(
                        normalizeText
                    )
                    .filter(
                        Boolean
                    );


            } catch (
                error
            ) {

                console.warn(
                    "[Announcements] Impossible de lire le localStorage :",
                    error
                );


                return [];
            }
        }


        function saveReadAnnouncementIds(
            ids
        ) {

            try {

                const normalizedIds =
                    Array.from(
                        new Set(
                            ids
                                .map(
                                    normalizeText
                                )
                                .filter(
                                    Boolean
                                )
                        )
                    );


                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(
                        normalizedIds
                    )
                );


            } catch (
                error
            ) {

                console.warn(
                    "[Announcements] Impossible d'écrire dans le localStorage :",
                    error
                );
            }
        }


        function markAnnouncementAsRead(
            announcementId
        ) {

            const id =
                normalizeText(
                    announcementId
                );


            if (
                !id
            ) {

                return;
            }


            const readIds =
                getReadAnnouncementIds();


            if (
                !readIds.includes(
                    id
                )
            ) {

                readIds.push(
                    id
                );


                saveReadAnnouncementIds(
                    readIds
                );
            }


            updateUnreadAnnouncements();
        }


        function markAllAnnouncementsAsRead() {

            const ids =
                announcements
                    .map(
                        announcement =>
                            normalizeText(
                                announcement.id
                            )
                    )
                    .filter(
                        Boolean
                    );


            saveReadAnnouncementIds(
                ids
            );


            updateUnreadAnnouncements();


            renderAnnouncements();
        }


        /* =====================================================
           NON LUS
        ====================================================== */

        function updateUnreadAnnouncements() {

            const readIds =
                new Set(
                    getReadAnnouncementIds()
                );


            unreadAnnouncements =
                announcements.filter(
                    announcement =>
                        !readIds.has(
                            normalizeText(
                                announcement.id
                            )
                        )
                );


            updateNotificationBadge();

            updateNotificationVisualState();

            updateNotificationStatus();
        }


        /* =====================================================
           COMPTEUR
        ====================================================== */

        function updateNotificationBadge() {

            if (
                !notificationCount
            ) {

                return;
            }


            const count =
                unreadAnnouncements.length;


            if (
                count <=
                0
            ) {

                notificationCount.hidden =
                    true;


                notificationCount.textContent =
                    "0";


                notificationCount.setAttribute(
                    "aria-label",
                    "0 nouveauté"
                );


                return;
            }


            notificationCount.hidden =
                false;


            notificationCount.textContent =
                count >
                99
                    ? "99+"
                    : String(
                        count
                    );


            notificationCount.setAttribute(
                "aria-label",
                `${count} nouveauté${
                    count > 1
                        ? "s"
                        : ""
                }`
            );
        }


        /* =====================================================
           ÉTAT VISUEL DE LA CLOCHE
        ====================================================== */

        function updateNotificationVisualState() {

            const hasUnread =
                unreadAnnouncements.length >
                0;


            notificationButton.classList.toggle(
                "has-notifications",
                hasUnread
            );


            notifications.classList.toggle(
                "has-notifications",
                hasUnread
            );


            /*
             * Pour le moment :
             *
             * on garde la cloche emoji.
             *
             * Plus tard, lorsque l'illustration
             * de Couaxia sera prête, on pourra
             * remplacer automatiquement
             * l'image fixe / animée ici.
             */

            if (
                notificationPlaceholder
            ) {

                notificationPlaceholder.hidden =
                    false;
            }


            if (
                notificationMascotte
            ) {

                notificationMascotte.hidden =
                    true;
            }
        }


        /* =====================================================
           STATUT
        ====================================================== */

        function updateNotificationStatus() {

            if (
                !notificationStatus
            ) {

                return;
            }


            const unreadCount =
                unreadAnnouncements.length;


            if (
                announcements.length ===
                0
            ) {

                notificationStatus.textContent =
                    "Aucune nouveauté pour le moment.";


                return;
            }


            if (
                unreadCount ===
                0
            ) {

                notificationStatus.textContent =
                    "Tu es à jour ! 💜";


                return;
            }


            notificationStatus.textContent =
                `${unreadCount} nouveauté${
                    unreadCount > 1
                        ? "s"
                        : ""
                } non lue${
                    unreadCount > 1
                        ? "s"
                        : ""
                }.`;
        }


        /* =====================================================
           TYPE
        ====================================================== */

        function getAnnouncementTypeLabel(
            type
        ) {

            switch (
                normalizeText(
                    type
                )
                    .toLowerCase()
            ) {

                case "announcement":

                    return "Annonce";


                case "poll":

                    return "Sondage";


                case "game":

                    return "Jeu";


                case "artwork":

                    return "Artwork";


                case "lore":

                    return "Lore";


                case "event":

                    return "Événement";


                case "stream":

                    return "Stream";


                default:

                    return "Nouveauté";
            }
        }


        /* =====================================================
           CARTE
        ====================================================== */

        function renderAnnouncementCard(
            announcement
        ) {

            const id =
                normalizeText(
                    announcement?.id
                );


            const type =
                normalizeText(
                    announcement?.type
                ) ||
                "other";


            const title =
                normalizeText(
                    announcement?.title
                ) ||
                "Nouveauté";


            const message =
                normalizeText(
                    announcement?.message
                );


            const icon =
                normalizeText(
                    announcement?.icon
                ) ||
                "✨";


            const imageUrl =
                normalizeText(
                    announcement?.imageUrl
                );


            const linkUrl =
                normalizeText(
                    announcement?.linkUrl
                );


            const linkLabel =
                normalizeText(
                    announcement?.linkLabel
                ) ||
                "Voir";


            const publishedAt =
                normalizeText(
                    announcement?.publishedAt
                );


            const readIds =
                new Set(
                    getReadAnnouncementIds()
                );


            const isUnread =
                !readIds.has(
                    id
                );


            const isPinned =
                announcement?.isPinned ===
                true;


            const isImportant =
                announcement?.isImportant ===
                true;


            const image =
                imageUrl
                    ? `
                        <div class="notification-item-image">

                            <img
                                src="${escapeHtml(
                                    imageUrl
                                )}"
                                alt=""
                                loading="lazy"
                            >

                        </div>
                    `
                    : "";


            const messageHtml =
                message
                    ? `
                        <p class="notification-item-message">
                            ${escapeHtml(
                                message
                            )}
                        </p>
                    `
                    : "";


            const pinnedBadge =
                isPinned
                    ? `
                        <span
                            class="notification-item-badge notification-item-badge-pinned"
                            title="Annonce épinglée"
                        >
                            📌 Épinglée
                        </span>
                    `
                    : "";


            const importantBadge =
                isImportant
                    ? `
                        <span
                            class="notification-item-badge notification-item-badge-important"
                            title="Annonce importante"
                        >
                            ⚠️ Important
                        </span>
                    `
                    : "";


            const link =
                linkUrl
                    ? `
                        <a
                            class="notification-item-link"
                            href="${escapeHtml(
                                linkUrl
                            )}"
                            data-announcement-id="${escapeHtml(
                                id
                            )}"
                            ${
                                isInternalLink(
                                    linkUrl
                                )
                                    ? ""
                                    : `
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    `
                            }
                        >
                            ${escapeHtml(
                                linkLabel
                            )}

                            <span aria-hidden="true">
                                →
                            </span>
                        </a>
                    `
                    : "";


            return `
                <article
                    class="
                        notification-item
                        ${
                            isUnread
                                ? "is-unread"
                                : "is-read"
                        }
                        ${
                            isPinned
                                ? "is-pinned"
                                : ""
                        }
                        ${
                            isImportant
                                ? "is-important"
                                : ""
                        }
                    "
                    data-announcement-id="${escapeHtml(
                        id
                    )}"
                >

                    <div
                        class="notification-item-icon"
                        aria-hidden="true"
                    >
                        ${escapeHtml(
                            icon
                        )}
                    </div>


                    <div class="notification-item-content">

                        <div class="notification-item-top">

                            <div class="notification-item-meta">

                                <span
                                    class="
                                        notification-item-type
                                        notification-item-type-${escapeHtml(
                                            type
                                        )}
                                    "
                                >
                                    ${escapeHtml(
                                        getAnnouncementTypeLabel(
                                            type
                                        )
                                    )}
                                </span>


                                ${
                                    isUnread
                                        ? `
                                            <span
                                                class="notification-item-unread"
                                                aria-label="Non lu"
                                            >
                                                Nouveau
                                            </span>
                                        `
                                        : ""
                                }

                            </div>


                            <time
                                class="notification-item-date"
                                datetime="${escapeHtml(
                                    publishedAt
                                )}"
                            >
                                ${escapeHtml(
                                    formatRelativeDate(
                                        publishedAt
                                    )
                                )}
                            </time>

                        </div>


                        <h3 class="notification-item-title">
                            ${escapeHtml(
                                title
                            )}
                        </h3>


                        ${messageHtml}


                        ${image}


                        ${
                            pinnedBadge ||
                            importantBadge
                                ? `
                                    <div class="notification-item-badges">

                                        ${pinnedBadge}

                                        ${importantBadge}

                                    </div>
                                `
                                : ""
                        }


                        ${
                            link
                                ? `
                                    <div class="notification-item-actions">
                                        ${link}
                                    </div>
                                `
                                : ""
                        }

                    </div>

                </article>
            `;
        }


        /* =====================================================
           AFFICHAGE
        ====================================================== */

        function renderAnnouncements() {

            if (
                announcements.length ===
                0
            ) {

                notificationList.innerHTML = `
                    <p class="notification-empty">
                        Aucune nouveauté pour le moment. 💜
                    </p>
                `;


                if (
                    notificationReadAll
                ) {

                    notificationReadAll.hidden =
                        true;
                }


                return;
            }


            notificationList.innerHTML =
                announcements
                    .slice(
                        0,
                        MAX_RENDERED_ANNOUNCEMENTS
                    )
                    .map(
                        renderAnnouncementCard
                    )
                    .join(
                        ""
                    );


            if (
                notificationReadAll
            ) {

                notificationReadAll.hidden =
                    unreadAnnouncements.length ===
                    0;
            }


            setupAnnouncementItemEvents();
        }


        /* =====================================================
           ÉVÉNEMENTS DES CARTES
        ====================================================== */

        function setupAnnouncementItemEvents() {

            const items =
                notificationList
                    .querySelectorAll(
                        "[data-announcement-id]"
                    );


            items.forEach(
                item => {

                    if (
                        item.dataset
                            .notificationReady ===
                        "true"
                    ) {

                        return;
                    }


                    item.dataset
                        .notificationReady =
                        "true";


                    item.addEventListener(
                        "click",
                        event => {

                            const announcementId =
                                normalizeText(
                                    item.dataset
                                        .announcementId
                                );


                            if (
                                !announcementId
                            ) {

                                return;
                            }


                            markAnnouncementAsRead(
                                announcementId
                            );


                            item.classList.remove(
                                "is-unread"
                            );


                            item.classList.add(
                                "is-read"
                            );


                            const unreadLabel =
                                item.querySelector(
                                    ".notification-item-unread"
                                );


                            unreadLabel
                                ?.remove();


                            if (
                                event.target.closest(
                                    ".notification-item-link"
                                )
                            ) {

                                return;
                            }
                        }
                    );
                }
            );
        }


        /* =====================================================
           PANNEAU
        ====================================================== */

        function openPanel() {

            panelOpen =
                true;


            notificationPanel.hidden =
                false;


            notificationButton.setAttribute(
                "aria-expanded",
                "true"
            );


            notifications.classList.add(
                "is-open"
            );
        }


        function closePanel() {

            panelOpen =
                false;


            notificationPanel.hidden =
                true;


            notificationButton.setAttribute(
                "aria-expanded",
                "false"
            );


            notifications.classList.remove(
                "is-open"
            );
        }


        function togglePanel() {

            if (
                panelOpen
            ) {

                closePanel();

            } else {

                openPanel();
            }
        }


        /* =====================================================
           API
        ====================================================== */

        async function loadAnnouncements() {

            try {

                notificationButton.classList.add(
                    "is-loading"
                );


                const response =
                    await fetch(
                        `${ANNOUNCEMENTS_API}?limit=${MAX_RENDERED_ANNOUNCEMENTS}`,
                        {
                            method:
                                "GET",

                            cache:
                                "no-store",

                            credentials:
                                "same-origin",

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


                const rawAnnouncements =
                    Array.isArray(
                        data
                    )
                        ? data
                        : Array.isArray(
                            data?.announcements
                        )
                            ? data.announcements
                            : [];


                announcements =
                    rawAnnouncements
                        .filter(
                            announcement =>
                                announcement &&
                                normalizeText(
                                    announcement.id
                                )
                        );


                updateUnreadAnnouncements();

                renderAnnouncements();


                console.info(
                    `[Announcements] ${announcements.length} annonce(s) chargée(s).`
                );


            } catch (
                error
            ) {

                console.error(
                    "[Announcements] Erreur API :",
                    error
                );


                announcements =
                    [];


                unreadAnnouncements =
                    [];


                updateNotificationBadge();

                updateNotificationVisualState();


                notificationList.innerHTML = `
                    <p class="notification-empty notification-error">
                        Impossible de charger les nouveautés pour le moment.
                    </p>
                `;


                if (
                    notificationStatus
                ) {

                    notificationStatus.textContent =
                        "Erreur de chargement.";
                }


                if (
                    notificationReadAll
                ) {

                    notificationReadAll.hidden =
                        true;
                }


            } finally {

                notificationButton.classList.remove(
                    "is-loading"
                );
            }
        }


        /* =====================================================
           CLIC CLOCHE
        ====================================================== */

        notificationButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                togglePanel();
            }
        );


        /* =====================================================
           TOUT MARQUER COMME LU
        ====================================================== */

        notificationReadAll
            ?.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    markAllAnnouncementsAsRead();
                }
            );


        /* =====================================================
           CLIC EN DEHORS
        ====================================================== */

        document.addEventListener(
            "click",
            event => {

                if (
                    !panelOpen
                ) {

                    return;
                }


                if (
                    notifications.contains(
                        event.target
                    )
                ) {

                    return;
                }


                closePanel();
            }
        );


        /* =====================================================
           TOUCHE ÉCHAP
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
                    !panelOpen
                ) {

                    return;
                }


                closePanel();


                notificationButton.focus();
            }
        );


        /* =====================================================
           RECHARGEMENT PUBLIC
        ====================================================== */

        window.CouaxiaAnnouncements = {

            reload() {

                return loadAnnouncements();
            },


            getAnnouncements() {

                return [
                    ...announcements
                ];
            },


            getUnreadAnnouncements() {

                return [
                    ...unreadAnnouncements
                ];
            },


            markAllAsRead() {

                markAllAnnouncementsAsRead();
            }

        };


        /* =====================================================
           INITIALISATION
        ====================================================== */

        loadAnnouncements();

    }
);