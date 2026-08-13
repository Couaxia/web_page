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

        /**
         * Transforme une valeur en tableau.
         *
         * Accepte :
         *
         * ["couaxia", "fanart"]
         *
         * "couaxia, fanart"
         *
         * "couaxia|fanart"
         *
         * @param {unknown} value
         * @returns {string[]}
         */
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


        /**
         * Normalise les tags.
         *
         * @param {unknown} value
         * @returns {string[]}
         */
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


        /**
         * Normalise les messages mascotte.
         *
         * @param {unknown} value
         * @returns {string[]}
         */
        function normalizeMessages(
            value
        ) {

            return normalizeArray(
                value
            );
        }


        /**
         * Transforme une liste de messages
         * en attribut data-messages.
         *
         * @param {unknown} messages
         * @returns {string}
         */
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


        /**
         * Normalise un booléen.
         *
         * @param {unknown} value
         * @param {boolean} defaultValue
         * @returns {boolean}
         */
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

        /**
         * Transforme une ligne Supabase
         * en objet utilisable par le frontend.
         *
         * @param {object} artwork
         * @returns {object}
         */
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

        /**
         * Crée une balise image.
         *
         * @param {object} artwork
         * @returns {HTMLImageElement}
         */
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


        /**
         * Crée une vidéo.
         *
         * @param {object} artwork
         * @returns {HTMLVideoElement}
         */
        function createVideoMedia(
            artwork
        ) {

            const video =
                document.createElement(
                    "video"
                );


            video.autoplay =
                true;

            video.muted =
                true;

            video.loop =
                true;

            video.playsInline =
                true;

            video.preload =
                "metadata";


            video.setAttribute(
                "draggable",
                "false"
            );


            const videoSource =
                document.createElement(
                    "source"
                );


            videoSource.src =
                artwork.imageUrl;


            video.appendChild(
                videoSource
            );


            return video;
        }


        /**
         * Choisit le média adapté.
         *
         * GIF utilise naturellement <img>.
         *
         * @param {object} artwork
         * @returns {HTMLElement}
         */
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

        /**
         * Crée une .artist-card identique
         * à celles que tu avais autrefois
         * directement dans credits.html.
         *
         * @param {object} rawArtwork
         * @returns {HTMLElement|null}
         */
        function createArtworkCard(
            rawArtwork
        ) {

            const artwork =
                normalizeArtwork(
                    rawArtwork
                );


            /*
             * Une œuvre incomplète n'est pas affichée.
             */

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

        /**
         * Informe les autres scripts que
         * les cartes existent maintenant dans le DOM.
         *
         * Très important puisque les œuvres
         * viennent désormais de Supabase.
         *
         * @param {object[]} artworks
         */
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
                     *
                     * même si /api/gallery filtre déjà
                     * visible=true, on refait la vérification
                     * côté navigateur.
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


                /*
                 * IMPORTANT :
                 *
                 * les autres scripts peuvent maintenant
                 * distribuer / filtrer / animer les cartes.
                 */

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


                /*
                 * On informe quand même les autres scripts
                 * que le chargement est terminé.
                 */

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

        /*
         * Un autre script peut utiliser :
         *
         * window.CouaxiaCreditsData.reload();
         */

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