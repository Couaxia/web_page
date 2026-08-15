"use strict";

/* =========================================================
   CRÉDITS — DONNÉES SUPABASE
   COUAXIA
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =====================================================
           CONFIGURATION
        ====================================================== */

        const GALLERY_API =
            "/api/gallery";


        /* =====================================================
           ÉLÉMENTS
        ====================================================== */

        const source =
            document.getElementById(
                "credits-card-source"
            );

        const loading =
            document.getElementById(
                "credits-loading"
            );

        const errorBox =
            document.getElementById(
                "credits-error"
            );

        const errorMessage =
            document.getElementById(
                "credits-error-message"
            );

        const retryButton =
            document.getElementById(
                "credits-retry"
            );


        /* =====================================================
           VÉRIFICATION
        ====================================================== */

        if (
            !source
        ) {

            console.error(
                "[Credits Data] #credits-card-source est introuvable."
            );

            return;
        }


        /* =====================================================
           NORMALISATION
        ====================================================== */

        function normalizeArray(
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
                                item =>
                                    String(
                                        item ??
                                        ""
                                    )
                                        .trim()
                            )
                            .filter(
                                Boolean
                            )
                    )
                ];
            }


            if (
                value ===
                    undefined ||
                value ===
                    null
            ) {

                return [];
            }


            const text =
                String(
                    value
                )
                    .trim();


            if (
                !text
            ) {

                return [];
            }


            return [
                ...new Set(
                    text
                        .split(
                            /[|,]/
                        )
                        .map(
                            item =>
                                item.trim()
                        )
                        .filter(
                            Boolean
                        )
                )
            ];
        }


        function normalizeTags(
            value
        ) {

            return normalizeArray(
                value
            )
                .map(
                    tag =>
                        tag.toLowerCase()
                );
        }


        function normalizeMessages(
            value
        ) {

            return normalizeArray(
                value
            );
        }


        function messagesToDataset(
            messages
        ) {

            return normalizeMessages(
                messages
            )
                .join(
                    "|"
                );
        }


        function normalizeBoolean(
            value,
            defaultValue = false
        ) {

            if (
                value === undefined ||
                value === null ||
                value === ""
            ) {

                return defaultValue;
            }


            if (
                typeof value ===
                "boolean"
            ) {

                return value;
            }


            const normalized =
                String(
                    value
                )
                    .trim()
                    .toLowerCase();


            if (
                [
                    "true",
                    "1",
                    "yes",
                    "oui",
                    "on"
                ].includes(
                    normalized
                )
            ) {

                return true;
            }


            if (
                [
                    "false",
                    "0",
                    "no",
                    "non",
                    "off"
                ].includes(
                    normalized
                )
            ) {

                return false;
            }


            return defaultValue;
        }


        /* =====================================================
           FORMAT DES DONNÉES
        ====================================================== */

        function normalizeArtwork(
            artwork
        ) {

            return {

                id:
                    artwork?.id ??
                    "",

                artId:
                    String(
                        artwork?.art_id ??
                        artwork?.artId ??
                        ""
                    )
                        .trim(),

                artist:
                    String(
                        artwork?.artist ??
                        ""
                    )
                        .trim(),

                artistRole:
                    String(
                        artwork?.artist_role ??
                        artwork?.artistRole ??
                        ""
                    )
                        .trim(),

                description:
                    String(
                        artwork?.description ??
                        ""
                    )
                        .trim(),

                imageUrl:
                    String(
                        artwork?.image_url ??
                        artwork?.imageUrl ??
                        ""
                    )
                        .trim(),

                imageAlt:
                    String(
                        artwork?.image_alt ??
                        artwork?.imageAlt ??
                        artwork?.artist ??
                        ""
                    )
                        .trim(),

                mediaType:
                    String(
                        artwork?.media_type ??
                        artwork?.mediaType ??
                        "image"
                    )
                        .trim()
                        .toLowerCase(),

                tags:
                    normalizeTags(
                        artwork?.tags
                    ),

                imageMessages:
                    normalizeMessages(
                        artwork?.image_messages ??
                        artwork?.imageMessages
                    ),

                artistUrl:
                    String(
                        artwork?.artist_url ??
                        artwork?.artistUrl ??
                        ""
                    )
                        .trim(),

                buttonText:
                    String(
                        artwork?.button_text ??
                        artwork?.buttonText ??
                        "Voir son profil"
                    )
                        .trim() ||
                    "Voir son profil",

                buttonMessages:
                    normalizeMessages(
                        artwork?.button_messages ??
                        artwork?.buttonMessages
                    ),

                sensitive:
                    normalizeBoolean(
                        artwork?.sensitive,
                        false
                    ),

                favoriteEnabled:
                    normalizeBoolean(
                        artwork?.favorite_enabled ??
                        artwork?.favoriteEnabled,
                        true
                    ),

                visible:
                    normalizeBoolean(
                        artwork?.visible,
                        true
                    ),

                sortOrder:
                    Number(
                        artwork?.sort_order ??
                        artwork?.sortOrder ??
                        0
                    ) ||
                    0

            };
        }


        /* =====================================================
           MÉDIA
        ====================================================== */

        function createImageMedia(
            artwork
        ) {

            const image =
                document.createElement(
                    "img"
                );


            image.src =
                artwork.imageUrl;


            image.alt =
                artwork.imageAlt ||
                artwork.artist ||
                "Illustration";


            image.loading =
                "lazy";


            image.decoding =
                "async";


            image.setAttribute(
                "draggable",
                "false"
            );


            return image;
        }


        function createVideoMedia(
            artwork
        ) {

            const video =
                document.createElement(
                    "video"
                );


            /* =============================================
               AUTOPLAY EN SILENCIEUX
            ============================================== */

            video.muted =
                true;

            video.defaultMuted =
                true;

            video.autoplay =
                true;

            video.loop =
                true;

            video.playsInline =
                true;

            video.controls =
                true;

            video.preload =
                "metadata";


            /*
             * Attributs HTML explicites.
             * Certains navigateurs sont plus fiables
             * lorsque les attributs existent également
             * dans le DOM.
             */

            video.setAttribute(
                "muted",
                ""
            );

            video.setAttribute(
                "autoplay",
                ""
            );

            video.setAttribute(
                "loop",
                ""
            );

            video.setAttribute(
                "playsinline",
                ""
            );

            video.setAttribute(
                "controls",
                ""
            );

            video.setAttribute(
                "draggable",
                "false"
            );


            /* =============================================
               SOURCE
            ============================================== */

            const videoSource =
                document.createElement(
                    "source"
                );


            videoSource.src =
                artwork.imageUrl;


            const normalizedUrl =
                String(
                    artwork.imageUrl ||
                    ""
                )
                    .toLowerCase();


            if (
                normalizedUrl.includes(
                    ".webm"
                )
            ) {

                videoSource.type =
                    "video/webm";

            } else if (
                normalizedUrl.includes(
                    ".mp4"
                )
            ) {

                videoSource.type =
                    "video/mp4";

            } else if (
                normalizedUrl.includes(
                    ".ogg"
                ) ||
                normalizedUrl.includes(
                    ".ogv"
                )
            ) {

                videoSource.type =
                    "video/ogg";
            }


            video.appendChild(
                videoSource
            );


            /* =============================================
               SÉCURITÉ SON AU DÉMARRAGE
            ============================================== */

            /*
             * La vidéo peut être en autoplay,
             * mais elle reste forcément muette
             * lors de son premier lancement.
             */

            video.dataset.userUnmuted =
                "false";


            video.addEventListener(
                "play",
                () => {

                    if (
                        video.dataset.userUnmuted !==
                        "true"
                    ) {

                        video.muted =
                            true;
                    }
                }
            );


            /* =============================================
               DÉTECTION D'UNE ACTION UTILISATEUR
            ============================================== */

            /*
             * Si la personne utilise les contrôles
             * et active volontairement le son,
             * on ne le recoupe plus ensuite.
             */

            video.addEventListener(
                "volumechange",
                () => {

                    if (
                        !video.muted &&
                        video.volume >
                            0
                    ) {

                        video.dataset.userUnmuted =
                            "true";
                    }
                }
            );


            /* =============================================
               TENTATIVE AUTOPLAY
            ============================================== */

            /*
             * Normalement muted + autoplay est accepté
             * par les navigateurs modernes.
             *
             * En cas de refus, la vidéo reste simplement
             * disponible avec ses contrôles.
             */

            video.addEventListener(
                "loadedmetadata",
                () => {

                    video
                        .play()
                        .catch(
                            () => {

                                /*
                                 * Autoplay refusé :
                                 * les contrôles restent disponibles.
                                 */
                            }
                        );
                },
                {
                    once:
                        true
                }
            );


            return video;
        }


        function createMedia(
            artwork
        ) {

            if (
                artwork.mediaType ===
                "video"
            ) {

                return createVideoMedia(
                    artwork
                );
            }


            return createImageMedia(
                artwork
            );
        }


        /* =====================================================
           IMAGE CONTAINER
        ====================================================== */

        function createImageContainer(
            artwork
        ) {

            const container =
                document.createElement(
                    "div"
                );


            container.className =
                "image-container";


            const messages =
                messagesToDataset(
                    artwork.imageMessages
                );


            if (
                messages
            ) {

                container.dataset.messages =
                    messages;
            }


            container.appendChild(
                createMedia(
                    artwork
                )
            );


            return container;
        }


        /* =====================================================
           CONTENU ARTISTE
        ====================================================== */

        function createArtistContent(
            artwork
        ) {

            const content =
                document.createElement(
                    "div"
                );


            content.className =
                "artist-content";


            /* =============================================
               NOM
            ============================================== */

            const title =
                document.createElement(
                    "h3"
                );


            title.textContent =
                artwork.artist ||
                "Artiste inconnu";


            content.appendChild(
                title
            );


            /* =============================================
               RÔLE
            ============================================== */

            if (
                artwork.artistRole
            ) {

                const role =
                    document.createElement(
                        "p"
                    );


                role.className =
                    "artist-role";


                role.textContent =
                    artwork.artistRole;


                content.appendChild(
                    role
                );
            }


            /* =============================================
               DESCRIPTION
            ============================================== */

            if (
                artwork.description
            ) {

                const description =
                    document.createElement(
                        "p"
                    );


                description.className =
                    "artist-description";


                description.textContent =
                    artwork.description;


                content.appendChild(
                    description
                );
            }


            /* =============================================
               BOUTON ARTISTE
            ============================================== */

            if (
                artwork.artistUrl
            ) {

                const link =
                    document.createElement(
                        "a"
                    );


                link.href =
                    artwork.artistUrl;


                link.target =
                    "_blank";


                link.rel =
                    "noopener noreferrer";


                link.className =
                    "artist-btn";


                link.textContent =
                    artwork.buttonText ||
                    "Voir son profil";


                const buttonMessages =
                    messagesToDataset(
                        artwork.buttonMessages
                    );


                if (
                    buttonMessages
                ) {

                    link.dataset.messages =
                        buttonMessages;
                }


                content.appendChild(
                    link
                );
            }


            return content;
        }


        /* =====================================================
           CARTE
        ====================================================== */

        function createArtworkCard(
            rawArtwork
        ) {

            const artwork =
                normalizeArtwork(
                    rawArtwork
                );


            if (
                !artwork.artId ||
                !artwork.artist ||
                !artwork.imageUrl
            ) {

                console.warn(
                    "[Credits Data] Œuvre ignorée car incomplète :",
                    rawArtwork
                );


                return null;
            }


            const article =
                document.createElement(
                    "article"
                );


            article.className =
                "artist-card";


            /* =============================================
               ID ART
            ============================================== */

            article.dataset.artId =
                artwork.artId;


            /* =============================================
               TAGS
            ============================================== */

            article.dataset.tags =
                artwork.tags.join(
                    " "
                );


            /* =============================================
               SENSIBLE
            ============================================== */

            article.dataset.sensitive =
                artwork.sensitive
                    ? "true"
                    : "false";


            /* =============================================
               FAVORIS
            ============================================== */

            article.dataset.favoriteEnabled =
                artwork.favoriteEnabled
                    ? "true"
                    : "false";


            /* =============================================
               ORDRE
            ============================================== */

            article.dataset.sortOrder =
                String(
                    artwork.sortOrder
                );


            /* =============================================
               ID SUPABASE
            ============================================== */

            if (
                artwork.id
            ) {

                article.dataset.databaseId =
                    String(
                        artwork.id
                    );
            }


            /* =============================================
               CONTENU
            ============================================== */

            article.appendChild(
                createImageContainer(
                    artwork
                )
            );


            article.appendChild(
                createArtistContent(
                    artwork
                )
            );


            return article;
        }


        /* =====================================================
           ÉTAT — CHARGEMENT
        ====================================================== */

        function showLoading() {

            if (
                loading
            ) {

                loading.hidden =
                    false;
            }


            if (
                errorBox
            ) {

                errorBox.hidden =
                    true;
            }
        }


        function hideLoading() {

            if (
                loading
            ) {

                loading.hidden =
                    true;
            }
        }


        function showError(
            message
        ) {

            hideLoading();


            if (
                errorMessage
            ) {

                errorMessage.textContent =
                    message;
            }


            if (
                errorBox
            ) {

                errorBox.hidden =
                    false;
            }
        }


        /* =====================================================
           ÉVÉNEMENT — GALERIE CHARGÉE
        ====================================================== */

        function dispatchCreditsLoaded(
            artworks
        ) {

            document.dispatchEvent(
                new CustomEvent(
                    "couaxia:credits-loaded",
                    {
                        detail: {

                            count:
                                artworks.length,

                            artworks

                        }
                    }
                )
            );
        }


        /* =====================================================
           TRI
        ====================================================== */

        function sortArtworks(
            artworks
        ) {

            return artworks.sort(
                (
                    firstArtwork,
                    secondArtwork
                ) => {

                    const firstOrder =
                        Number(
                            firstArtwork?.sort_order ??
                            firstArtwork?.sortOrder ??
                            0
                        ) ||
                        0;


                    const secondOrder =
                        Number(
                            secondArtwork?.sort_order ??
                            secondArtwork?.sortOrder ??
                            0
                        ) ||
                        0;


                    if (
                        firstOrder !==
                        secondOrder
                    ) {

                        return (
                            firstOrder -
                            secondOrder
                        );
                    }


                    const firstArtId =
                        String(
                            firstArtwork?.art_id ??
                            firstArtwork?.artId ??
                            ""
                        );


                    const secondArtId =
                        String(
                            secondArtwork?.art_id ??
                            secondArtwork?.artId ??
                            ""
                        );


                    return firstArtId.localeCompare(
                        secondArtId,
                        "fr",
                        {
                            numeric:
                                true,

                            sensitivity:
                                "base"
                        }
                    );
                }
            );
        }


        /* =====================================================
           CHARGEMENT API
        ====================================================== */

        async function loadCredits() {

            showLoading();


            /*
             * Évite les doublons lors d'un rechargement.
             */

            source.replaceChildren();


            try {

                /* =============================================
                   API
                ============================================== */

                const response =
                    await fetch(
                        GALLERY_API,
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


                /* =============================================
                   JSON
                ============================================== */

                const data =
                    await response
                        .json()
                        .catch(
                            () => ({})
                        );


                /* =============================================
                   ERREUR HTTP
                ============================================== */

                if (
                    !response.ok
                ) {

                    throw new Error(
                        data?.error ||
                        `Erreur HTTP ${response.status}`
                    );
                }


                /* =============================================
                   DONNÉES
                ============================================== */

                const artworks =
                    Array.isArray(
                        data?.artworks
                    )
                        ? [
                            ...data.artworks
                        ]
                        : [];


                /* =============================================
                   TRI
                ============================================== */

                sortArtworks(
                    artworks
                );


                /* =============================================
                   CRÉATION DES CARTES
                ============================================== */

                const fragment =
                    document
                        .createDocumentFragment();


                const loadedArtworks =
                    [];


                for (
                    const rawArtwork of
                    artworks
                ) {

                    const artwork =
                        normalizeArtwork(
                            rawArtwork
                        );


                    /*
                     * Sécurité supplémentaire :
                     * invisible = pas affiché.
                     */

                    if (
                        !artwork.visible
                    ) {

                        continue;
                    }


                    const card =
                        createArtworkCard(
                            rawArtwork
                        );


                    if (
                        !card
                    ) {

                        continue;
                    }


                    fragment.appendChild(
                        card
                    );


                    loadedArtworks.push(
                        artwork
                    );
                }


                /* =============================================
                   INSERTION
                ============================================== */

                source.appendChild(
                    fragment
                );


                /* =============================================
                   FIN CHARGEMENT
                ============================================== */

                hideLoading();


                if (
                    errorBox
                ) {

                    errorBox.hidden =
                        true;
                }


                console.info(
                    `[Credits Data] ${loadedArtworks.length} œuvre(s) chargée(s).`
                );


                dispatchCreditsLoaded(
                    loadedArtworks
                );


            } catch (
                error
            ) {

                console.error(
                    "[Credits Data] Chargement impossible :",
                    error
                );


                source.replaceChildren();


                showError(
                    error?.message ||
                    "Impossible de charger les illustrations."
                );


                dispatchCreditsLoaded(
                    []
                );
            }
        }


        /* =====================================================
           RETRY
        ====================================================== */

        retryButton
            ?.addEventListener(
                "click",
                () => {

                    loadCredits();
                }
            );


        /* =====================================================
           API PUBLIQUE JS
        ====================================================== */

        window.CouaxiaCreditsData = {

            reload:
                loadCredits

        };


        /* =====================================================
           INITIALISATION
        ====================================================== */

        loadCredits();
    }
);