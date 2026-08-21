"use strict";

/* =========================================================
   NOTIFICATION LIVE TWITCH — COUAXIA
   Notification globale affichée lorsque Couaxia est en live
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =====================================================
           CONFIGURATION
        ====================================================== */

        const TWITCH_LIVE_API =
            "/api/twitch-live";


        /*
         * Vérification toutes les 60 secondes.
         */
        const REFRESH_DELAY =
            60_000;


        /*
         * Préfixe utilisé dans sessionStorage.
         *
         * La fermeture est mémorisée uniquement pour
         * le live actuellement diffusé.
         */
        const STORAGE_PREFIX =
            "couaxia:twitch-live-dismissed:";


        /* =====================================================
           ÉTAT
        ====================================================== */

        let notification =
            null;


        let currentLiveId =
            null;


        let isLoading =
            false;


        let refreshInterval =
            null;


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


        function toNumber(
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


        function formatNumber(
            value
        ) {

            return toNumber(
                value
            ).toLocaleString(
                "fr-FR"
            );
        }


        /* =====================================================
           SESSION STORAGE
        ====================================================== */

        function getDismissStorageKey(
            liveId
        ) {

            if (
                !liveId
            ) {

                return null;
            }


            return (
                STORAGE_PREFIX +
                liveId
            );
        }


        function wasDismissed(
            liveId
        ) {

            const key =
                getDismissStorageKey(
                    liveId
                );


            if (
                !key
            ) {

                return false;
            }


            try {

                return (
                    window.sessionStorage
                        .getItem(
                            key
                        ) ===
                    "true"
                );

            } catch (
                error
            ) {

                console.debug(
                    "[Twitch Live Notification] sessionStorage indisponible :",
                    error
                );


                return false;
            }
        }


        function saveDismissed(
            liveId
        ) {

            const key =
                getDismissStorageKey(
                    liveId
                );


            if (
                !key
            ) {

                return;
            }


            try {

                window.sessionStorage
                    .setItem(
                        key,
                        "true"
                    );

            } catch (
                error
            ) {

                console.debug(
                    "[Twitch Live Notification] Impossible d'enregistrer la fermeture :",
                    error
                );
            }
        }


        /* =====================================================
           CRÉATION DE LA NOTIFICATION
        ====================================================== */

        function createNotification() {

            if (
                notification
            ) {

                return notification;
            }


            const element =
                document.createElement(
                    "aside"
                );


            element.className =
                "twitch-live-notification";


            element.hidden =
                true;


            element.setAttribute(
                "role",
                "status"
            );


            element.setAttribute(
                "aria-live",
                "polite"
            );


            element.setAttribute(
                "aria-label",
                "Couaxia est actuellement en direct sur Twitch"
            );


            element.innerHTML = `

                <!-- =========================================
                     FERMETURE
                ========================================== -->

                <button
                    type="button"
                    class="twitch-live-notification-close"
                    aria-label="Fermer la notification du live"
                    title="Fermer"
                >
                    <span
                        aria-hidden="true"
                    >
                        ×
                    </span>
                </button>


                <!-- =========================================
                     MINIATURE
                ========================================== -->

                <a
                    class="twitch-live-notification-thumbnail-link"
                    href="https://www.twitch.tv/couaxia"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Regarder Couaxia sur Twitch"
                >
                    <div
                        class="twitch-live-notification-thumbnail-wrapper"
                    >
                        <img
                            class="twitch-live-notification-thumbnail"
                            src=""
                            alt=""
                            decoding="async"
                        >

                        <span
                            class="twitch-live-notification-live-badge"
                        >
                            LIVE
                        </span>
                    </div>
                </a>


                <!-- =========================================
                     CONTENU
                ========================================== -->

                <div
                    class="twitch-live-notification-content"
                >

                    <div
                        class="twitch-live-notification-heading"
                    >

                        <span
                            class="twitch-live-notification-dot"
                            aria-hidden="true"
                        ></span>

                        <strong
                            class="twitch-live-notification-title"
                        >
                            COUAXIA EST EN LIVE !
                        </strong>

                    </div>


                    <p
                        class="twitch-live-notification-game"
                        hidden
                    ></p>


                    <p
                        class="twitch-live-notification-stream-title"
                        hidden
                    ></p>


                    <p
                        class="twitch-live-notification-viewers"
                        hidden
                    ></p>


                    <a
                        class="twitch-live-notification-watch"
                        href="https://www.twitch.tv/couaxia"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <span
                            aria-hidden="true"
                        >
                            💜
                        </span>

                        Voir le live
                    </a>

                </div>
            `;


            document.body.appendChild(
                element
            );


            notification =
                element;


            /* =================================================
               BOUTON FERMER
            ================================================= */

            const closeButton =
                element.querySelector(
                    ".twitch-live-notification-close"
                );


            closeButton?.addEventListener(
                "click",
                () => {

                    dismissNotification();
                }
            );


            return element;
        }


        /* =====================================================
           ÉLÉMENTS DE LA NOTIFICATION
        ====================================================== */

        function getNotificationElements() {

            const element =
                createNotification();


            return {

                element,

                thumbnail:
                    element.querySelector(
                        ".twitch-live-notification-thumbnail"
                    ),

                thumbnailWrapper:
                    element.querySelector(
                        ".twitch-live-notification-thumbnail-wrapper"
                    ),

                thumbnailLink:
                    element.querySelector(
                        ".twitch-live-notification-thumbnail-link"
                    ),

                game:
                    element.querySelector(
                        ".twitch-live-notification-game"
                    ),

                streamTitle:
                    element.querySelector(
                        ".twitch-live-notification-stream-title"
                    ),

                viewers:
                    element.querySelector(
                        ".twitch-live-notification-viewers"
                    ),

                watchButton:
                    element.querySelector(
                        ".twitch-live-notification-watch"
                    )

            };
        }


        /* =====================================================
           FERMETURE
        ====================================================== */

        function dismissNotification() {

            if (
                !notification
            ) {

                return;
            }


            if (
                currentLiveId
            ) {

                saveDismissed(
                    currentLiveId
                );
            }


            notification.classList.remove(
                "is-visible"
            );


            notification.classList.add(
                "is-closing"
            );


            /*
             * Attend la fin de l'animation CSS.
             */
            window.setTimeout(
                () => {

                    if (
                        !notification
                    ) {

                        return;
                    }


                    notification.hidden =
                        true;


                    notification.classList.remove(
                        "is-closing"
                    );

                },
                350
            );
        }


        /* =====================================================
           MASQUER
        ====================================================== */

        function hideNotification() {

            if (
                !notification
            ) {

                return;
            }


            notification.classList.remove(
                "is-visible",
                "is-closing"
            );


            notification.hidden =
                true;
        }


        /* =====================================================
           AFFICHAGE
        ====================================================== */

        function showNotification(
            data
        ) {

            if (
                !data ||
                data.live !==
                    true ||
                !data.stream
            ) {

                hideNotification();

                currentLiveId =
                    null;

                return;
            }


            const stream =
                data.stream;


            /*
             * Twitch fournit normalement un ID unique
             * pour chaque diffusion.
             *
             * Le startedAt sert de secours.
             */
            const liveId =
                normalizeText(
                    stream.id
                ) ||
                normalizeText(
                    stream.startedAt
                );


            currentLiveId =
                liveId;


            /*
             * Le visiteur a déjà fermé CETTE diffusion.
             */
            if (
                liveId &&
                wasDismissed(
                    liveId
                )
            ) {

                hideNotification();

                return;
            }


            const {
                element,
                thumbnail,
                thumbnailWrapper,
                thumbnailLink,
                game,
                streamTitle,
                viewers,
                watchButton
            } =
                getNotificationElements();


            /* =================================================
               DONNÉES
            ================================================= */

            const twitchUrl =
                normalizeText(
                    stream.url ??
                    data?.channel?.url
                ) ||
                "https://www.twitch.tv/couaxia";


            const gameValue =
                normalizeText(
                    stream.game
                );


            const titleValue =
                normalizeText(
                    stream.title
                );


            const thumbnailValue =
                normalizeText(
                    stream.thumbnail
                );


            const viewerValue =
                toNumber(
                    stream.viewers
                );


            /* =================================================
               LIENS
            ================================================= */

            if (
                thumbnailLink
            ) {

                thumbnailLink.href =
                    twitchUrl;
            }


            if (
                watchButton
            ) {

                watchButton.href =
                    twitchUrl;
            }


            /* =================================================
               JEU
            ================================================= */

            if (
                game
            ) {

                if (
                    gameValue
                ) {

                    game.textContent =
                        `🎮 ${gameValue}`;

                    game.hidden =
                        false;

                } else {

                    game.textContent =
                        "";

                    game.hidden =
                        true;
                }
            }


            /* =================================================
               TITRE DU LIVE
            ================================================= */

            if (
                streamTitle
            ) {

                if (
                    titleValue
                ) {

                    streamTitle.textContent =
                        titleValue;

                    streamTitle.hidden =
                        false;

                } else {

                    streamTitle.textContent =
                        "";

                    streamTitle.hidden =
                        true;
                }
            }


            /* =================================================
               VIEWERS
            ================================================= */

            if (
                viewers
            ) {

                if (
                    viewerValue >
                    0
                ) {

                    viewers.textContent =
                        `👁 ${formatNumber(
                            viewerValue
                        )} spectateur${
                            viewerValue >
                            1
                                ? "s"
                                : ""
                        }`;

                    viewers.hidden =
                        false;

                } else {

                    viewers.textContent =
                        "";

                    viewers.hidden =
                        true;
                }
            }


            /* =================================================
               MINIATURE
            ================================================= */

            if (
                thumbnail &&
                thumbnailWrapper
            ) {

                if (
                    thumbnailValue
                ) {

                    /*
                     * Petit paramètre pour éviter que le
                     * navigateur conserve trop longtemps
                     * une ancienne miniature.
                     */
                    const separator =
                        thumbnailValue.includes(
                            "?"
                        )
                            ? "&"
                            : "?";


                    thumbnail.src =
                        `${thumbnailValue}${separator}t=${Date.now()}`;


                    thumbnail.alt =
                        titleValue
                            ? `Aperçu du live : ${titleValue}`
                            : "Aperçu du live Twitch de Couaxia";


                    thumbnail.hidden =
                        false;


                    thumbnailWrapper.classList.remove(
                        "has-no-thumbnail"
                    );

                } else {

                    thumbnail.removeAttribute(
                        "src"
                    );


                    thumbnail.alt =
                        "";


                    thumbnail.hidden =
                        true;


                    thumbnailWrapper.classList.add(
                        "has-no-thumbnail"
                    );
                }
            }


            /* =================================================
               AFFICHAGE
            ================================================= */

            element.hidden =
                false;


            element.classList.remove(
                "is-closing"
            );


            /*
             * requestAnimationFrame permet au navigateur
             * d'appliquer hidden=false avant l'animation.
             */
            window.requestAnimationFrame(
                () => {

                    window.requestAnimationFrame(
                        () => {

                            element.classList.add(
                                "is-visible"
                            );

                        }
                    );

                }
            );
        }


        /* =====================================================
           RÉPONSE API
        ====================================================== */

        function handleTwitchData(
            data
        ) {

            if (
                !data ||
                data.success ===
                    false
            ) {

                hideNotification();

                return;
            }


            if (
                data.live !==
                    true
            ) {

                /*
                 * La chaîne n'est plus en live.
                 */
                currentLiveId =
                    null;


                hideNotification();

                return;
            }


            showNotification(
                data
            );
        }


        /* =====================================================
           APPEL API
        ====================================================== */

        async function fetchLiveStatus() {

            if (
                isLoading
            ) {

                return;
            }


            isLoading =
                true;


            try {

                const response =
                    await fetch(
                        TWITCH_LIVE_API,
                        {
                            method:
                                "GET",

                            headers: {

                                Accept:
                                    "application/json"

                            },

                            cache:
                                "no-store"
                        }
                    );


                const contentType =
                    response.headers.get(
                        "content-type"
                    ) ??
                    "";


                if (
                    !contentType.includes(
                        "application/json"
                    )
                ) {

                    throw new Error(
                        "La route /api/twitch-live n'a pas renvoyé du JSON."
                    );
                }


                const data =
                    await response.json();


                if (
                    !response.ok
                ) {

                    throw new Error(
                        normalizeText(
                            data?.details ??
                            data?.error
                        ) ||
                        `Erreur HTTP ${response.status}`
                    );
                }


                handleTwitchData(
                    data
                );


            } catch (
                error
            ) {

                /*
                 * Une panne Twitch ne doit jamais afficher
                 * une fausse notification LIVE.
                 */
                console.error(
                    "[Twitch Live Notification] Impossible de vérifier le live :",
                    error
                );


                hideNotification();


            } finally {

                isLoading =
                    false;
            }
        }


        /* =====================================================
           COMPATIBILITÉ AVEC js/twitch-live.js
        ====================================================== */

        /*
         * Sur la page Twitch, ton twitch-live.js existant
         * émet déjà "couaxia:twitch-updated".
         *
         * On peut donc réagir immédiatement à cet événement.
         */
        document.addEventListener(
            "couaxia:twitch-updated",
            event => {

                const detail =
                    event?.detail;


                if (
                    !detail
                ) {

                    return;
                }


                /*
                 * L'ancien endpoint /api/twitch-status
                 * n'a pas forcément exactement le même format
                 * que /api/twitch-live.
                 *
                 * S'il indique seulement que la chaîne est
                 * hors ligne, on peut au moins masquer
                 * immédiatement la notification.
                 */
                if (
                    detail.live !==
                    true
                ) {

                    currentLiveId =
                        null;


                    hideNotification();

                    return;
                }


                /*
                 * Lorsqu'un live est détecté sur cette page,
                 * on interroge notre nouvelle API afin d'avoir
                 * le format normalisé utilisé par la notification.
                 */
                fetchLiveStatus();
            }
        );


        /* =====================================================
           API PUBLIQUE
        ====================================================== */

        window.CouaxiaTwitchLiveNotification = {

            /*
             * Force une vérification.
             */
            refresh() {

                return fetchLiveStatus();
            },


            /*
             * Ferme manuellement la notification.
             */
            dismiss() {

                dismissNotification();
            },


            /*
             * Retourne la route utilisée.
             */
            getApiUrl() {

                return TWITCH_LIVE_API;
            }

        };


        /* =====================================================
           PREMIÈRE VÉRIFICATION
        ====================================================== */

        fetchLiveStatus();


        /* =====================================================
           ACTUALISATION AUTOMATIQUE
        ====================================================== */

        refreshInterval =
            window.setInterval(
                () => {

                    /*
                     * Pas d'appel inutile lorsque
                     * l'onglet n'est pas visible.
                     */
                    if (
                        document.visibilityState ===
                        "visible"
                    ) {

                        fetchLiveStatus();
                    }

                },
                REFRESH_DELAY
            );


        /* =====================================================
           RETOUR SUR L'ONGLET
        ====================================================== */

        document.addEventListener(
            "visibilitychange",
            () => {

                if (
                    document.visibilityState ===
                    "visible"
                ) {

                    fetchLiveStatus();
                }
            }
        );


        /* =====================================================
           NETTOYAGE
        ====================================================== */

        window.addEventListener(
            "beforeunload",
            () => {

                if (
                    refreshInterval
                ) {

                    window.clearInterval(
                        refreshInterval
                    );
                }
            }
        );


        console.info(
            "[Twitch Live Notification] Module initialisé."
        );
    }
);