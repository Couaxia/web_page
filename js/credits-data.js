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

        if (!source) {

            console.error(
                "[Credits Data] #credits-card-source est introuvable."
            );

            return;
        }


        /* =====================================================
           SÉCURITÉ HTML
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

                return value
                    .map(
                        item =>
                            String(
                                item ?? ""
                            ).trim()
                    )
                    .filter(Boolean);
            }


            if (
                value === undefined ||
                value === null
            ) {

                return [];
            }


            return String(
                value
            )
                .split(/[|,]/)
                .map(
                    item =>
                        item.trim()
                )
                .filter(Boolean);
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
                .join("|");
        }


        /* =====================================================
           FORMAT DES DONNÉES
        ====================================================== */

        function normalizeArtwork(
            artwork
        ) {

            return {

                id:
                    artwork?.id || "",

                artId:
                    String(
                        artwork?.art_id ??
                        artwork?.artId ??
                        ""
                    ).trim(),

                artist:
                    String(
                        artwork?.artist ??
                        ""
                    ).trim(),

                artistRole:
                    String(
                        artwork?.artist_role ??
                        artwork?.artistRole ??
                        ""
                    ).trim(),

                description:
                    String(
                        artwork?.description ??
                        ""
                    ).trim(),

                imageUrl:
                    String(
                        artwork?.image_url ??
                        artwork?.imageUrl ??
                        ""
                    ).trim(),

                imageAlt:
                    String(
                        artwork?.image_alt ??
                        artwork?.imageAlt ??
                        artwork?.artist ??
                        ""
                    ).trim(),

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
                    ).trim(),

                buttonText:
                    String(
                        artwork?.button_text ??
                        artwork?.buttonText ??
                        "Voir son profil"
                    ).trim(),

                buttonMessages:
                    normalizeMessages(
                        artwork?.button_messages ??
                        artwork?.buttonMessages
                    ),

                sensitive:
                    Boolean(
                        artwork?.sensitive
                    ),

                favoriteEnabled:
                    artwork?.favorite_enabled !==
                    false,

                visible:
                    artwork?.visible !==
                    false,

                sortOrder:
                    Number(
                        artwork?.sort_order ??
                        artwork?.sortOrder ??
                        0
                    )
            };
        }


        /* =====================================================
           MÉDIA
        ====================================================== */

        function createImageMedia(
            artwork
        ) {

            const img =
                document.createElement(
                    "img"
                );

            img.src =
                artwork.imageUrl;

            img.alt =
                artwork.imageAlt ||
                artwork.artist ||
                "Illustration";

            img.loading =
                "lazy";

            img.decoding =
                "async";

            img.setAttribute(
                "draggable",
                "false"
            );


            return img;
        }


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

            video.setAttribute(
                "draggable",
                "false"
            );


            const source =
                document.createElement(
                    "source"
                );

            source.src =
                artwork.imageUrl;


            /*
             * Le MIME exact peut varier.
             * Pour l'instant on laisse le navigateur
             * déterminer le média à partir de l'URL.
             */

            video.appendChild(
                source
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


            /*
             * Les GIF fonctionnent
             * naturellement avec <img>.
             */

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


            if (messages) {

                container.dataset.messages =
                    messages;
            }


            const media =
                createMedia(
                    artwork
                );


            container.appendChild(
                media
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


            article.dataset.artId =
                artwork.artId;


            /* =============================================
               TAGS
            ============================================== */

            if (
                artwork.tags.length >
                0
            ) {

                article.dataset.tags =
                    artwork.tags.join(
                        " "
                    );

            } else {

                article.dataset.tags =
                    "";
            }


            /* =============================================
               SENSIBLE
            ============================================== */

            if (
                artwork.sensitive
            ) {

                article.dataset.sensitive =
                    "true";
            }


            /* =============================================
               FAVORIS
            ============================================== */

            if (
                !artwork.favoriteEnabled
            ) {

                article.dataset.favoriteEnabled =
                    "false";

            } else {

                article.dataset.favoriteEnabled =
                    "true";
            }


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
           ÉTAT CHARGEMENT
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
           ÉVÉNEMENT GALERIE CHARGÉE
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
           CHARGEMENT API
        ====================================================== */

        async function loadCredits() {

            showLoading();


            source.innerHTML =
                "";


            try {

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


                const artworks =
                    Array.isArray(
                        data?.artworks
                    )
                        ? data.artworks
                        : [];


                /* =============================================
                   TRI
                ============================================== */

                artworks.sort(
                    (
                        a,
                        b
                    ) => {

                        const orderA =
                            Number(
                                a?.sort_order ??
                                a?.sortOrder ??
                                0
                            );

                        const orderB =
                            Number(
                                b?.sort_order ??
                                b?.sortOrder ??
                                0
                            );


                        if (
                            orderA !==
                            orderB
                        ) {

                            return (
                                orderA -
                                orderB
                            );
                        }


                        return String(
                            a?.art_id ??
                            a?.artId ??
                            ""
                        )
                            .localeCompare(
                                String(
                                    b?.art_id ??
                                    b?.artId ??
                                    ""
                                ),
                                "fr",
                                {
                                    numeric:
                                        true
                                }
                            );
                    }
                );


                /* =============================================
                   CRÉATION DES CARTES
                ============================================== */

                const fragment =
                    document
                        .createDocumentFragment();


                const loadedArtworks =
                    [];


                artworks.forEach(
                    rawArtwork => {

                        const artwork =
                            normalizeArtwork(
                                rawArtwork
                            );


                        /*
                         * Sécurité supplémentaire :
                         * même si /api/gallery filtre déjà,
                         * on n'affiche jamais visible=false.
                         */

                        if (
                            !artwork.visible
                        ) {
                            return;
                        }


                        const card =
                            createArtworkCard(
                                rawArtwork
                            );


                        if (!card) {
                            return;
                        }


                        fragment.appendChild(
                            card
                        );


                        loadedArtworks.push(
                            artwork
                        );
                    }
                );


                source.appendChild(
                    fragment
                );


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


            } catch (error) {

                console.error(
                    "[Credits Data] Chargement impossible :",
                    error
                );


                source.innerHTML =
                    "";


                showError(
                    error?.message ||
                    "Impossible de charger les illustrations."
                );


                /*
                 * On déclenche quand même
                 * l'événement pour que les autres
                 * scripts sachent que le chargement
                 * s'est terminé.
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
           API PUBLIQUE OPTIONNELLE
        ====================================================== */

        /*
         * Pratique si un autre script veut
         * forcer le rechargement de la galerie.
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