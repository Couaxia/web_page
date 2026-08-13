"use strict";

/* =========================================================
   ŒUVRE ALÉATOIRE — GALERIE COUAXIA
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =====================================================
           ÉLÉMENTS
        ====================================================== */

        const randomButton =
            document.getElementById(
                "credits-random-art"
            );


        if (!randomButton) {

            console.warn(
                "[Œuvre aléatoire] Bouton introuvable."
            );

            return;
        }


        /* =====================================================
           ÉTAT
        ====================================================== */

        let lastRandomArtId =
            null;


        /* =====================================================
           OUTILS
        ====================================================== */

        /**
         * Retourne l'identifiant d'une œuvre.
         */
        function getArtId(card) {

            return String(
                card?.dataset?.artId ??
                ""
            )
                .trim();
        }


        /**
         * Retourne le nom de l'artiste.
         */
        function getArtistName(card) {

            const dataArtist =
                card?.dataset?.artist
                    ?.trim();


            if (dataArtist) {

                return dataArtist;
            }


            const heading =
                card?.querySelector(
                    ".artist-content h3"
                );


            return (
                heading
                    ?.textContent
                    ?.trim() ||
                "Artiste"
            );
        }


        /**
         * Vérifie si l'œuvre est sensible.
         */
        function isSensitive(card) {

            return (
                String(
                    card?.dataset?.sensitive ??
                    ""
                )
                    .trim()
                    .toLowerCase() ===
                "true"
            );
        }


        /**
         * Vérifie si les favoris sont
         * autorisés pour cette œuvre.
         */
        function isFavoriteEnabled(card) {

            const value =
                card?.dataset
                    ?.favoriteEnabled;


            /*
             * Compatibilité avec les anciennes cartes.
             */

            if (
                value === undefined
            ) {

                return true;
            }


            return (
                String(value)
                    .trim()
                    .toLowerCase() !==
                "false"
            );
        }


        /* =====================================================
           CARTES SOURCES
        ====================================================== */

        /**
         * Retourne les cartes originales créées
         * depuis les données Supabase.
         *
         * On utilise #credits-card-source afin
         * d'éviter les clones créés dans les
         * différentes galeries.
         */
        function getOriginalCards() {

            const source =
                document.getElementById(
                    "credits-card-source"
                );


            if (!source) {

                console.warn(
                    "[Œuvre aléatoire] #credits-card-source introuvable."
                );

                return [];
            }


            const cards =
                Array.from(
                    source.querySelectorAll(
                        ".artist-card[data-art-id]"
                    )
                );


            /*
             * Sécurité supplémentaire :
             *
             * une seule carte par art_id.
             */

            const uniqueCards =
                new Map();


            cards.forEach(
                card => {

                    const artId =
                        getArtId(card);


                    if (
                        !artId ||
                        uniqueCards.has(
                            artId
                        )
                    ) {

                        return;
                    }


                    uniqueCards.set(
                        artId,
                        card
                    );
                }
            );


            return Array.from(
                uniqueCards.values()
            );
        }


        /**
         * Choisit une œuvre aléatoire.
         *
         * Lorsque plusieurs œuvres existent,
         * on évite de ressortir immédiatement
         * la même.
         */
        function getRandomCard(cards) {

            if (
                !Array.isArray(cards) ||
                cards.length === 0
            ) {

                return null;
            }


            if (
                cards.length === 1
            ) {

                return cards[0];
            }


            let availableCards =
                cards;


            if (lastRandomArtId) {

                const filteredCards =
                    cards.filter(
                        card =>
                            getArtId(card) !==
                            lastRandomArtId
                    );


                if (
                    filteredCards.length >
                    0
                ) {

                    availableCards =
                        filteredCards;
                }
            }


            const randomIndex =
                Math.floor(
                    Math.random() *
                    availableCards.length
                );


            return (
                availableCards[
                    randomIndex
                ] ||
                null
            );
        }


        /* =====================================================
           MÉDIA
        ====================================================== */

        /**
         * Recherche le média principal
         * sans récupérer les logos/watermarks.
         */
        function getArtwork(card) {

            const imageContainer =
                card.querySelector(
                    ".image-container"
                );


            if (!imageContainer) {

                return null;
            }


            /* =============================================
               VIDÉO
            ============================================== */

            const video =
                imageContainer.querySelector(
                    ":scope > video"
                );


            if (video) {

                return video;
            }


            /* =============================================
               IMAGE
            ============================================== */

            const images =
                Array.from(
                    imageContainer.children
                )
                    .filter(
                        element =>
                            element instanceof
                            HTMLImageElement
                    );


            return (
                images.find(
                    image =>
                        !image.classList.contains(
                            "image-watermark-logo"
                        ) &&
                        !image.classList.contains(
                            "watermark-logo"
                        ) &&
                        !image.classList.contains(
                            "image-zoom-watermark"
                        ) &&
                        !image.classList.contains(
                            "random-art-copyright-logo"
                        ) &&
                        !image.classList.contains(
                            "random-art-sensitive-logo"
                        )
                ) ||
                null
            );
        }


        /**
         * Crée une copie du média.
         */
        function createArtworkClone(
            artwork
        ) {

            /* =============================================
               IMAGE
            ============================================== */

            if (
                artwork instanceof
                HTMLImageElement
            ) {

                const image =
                    document.createElement(
                        "img"
                    );


                image.src =
                    artwork.getAttribute(
                        "src"
                    ) ||
                    artwork.src;


                const srcset =
                    artwork.getAttribute(
                        "srcset"
                    );


                const sizes =
                    artwork.getAttribute(
                        "sizes"
                    );


                if (srcset) {

                    image.setAttribute(
                        "srcset",
                        srcset
                    );
                }


                if (sizes) {

                    image.setAttribute(
                        "sizes",
                        sizes
                    );
                }


                image.alt =
                    artwork.alt ||
                    "Illustration";


                image.className =
                    "random-artwork";


                image.draggable =
                    false;


                image.decoding =
                    "async";


                return image;
            }


            /* =============================================
               VIDÉO
            ============================================== */

            if (
                artwork instanceof
                HTMLVideoElement
            ) {

                const video =
                    document.createElement(
                        "video"
                    );


                const directSource =
                    artwork.getAttribute(
                        "src"
                    );


                if (directSource) {

                    video.src =
                        directSource;

                } else {

                    artwork
                        .querySelectorAll(
                            "source"
                        )
                        .forEach(
                            originalSource => {

                                const source =
                                    document.createElement(
                                        "source"
                                    );


                                source.src =
                                    originalSource.src;


                                if (
                                    originalSource.type
                                ) {

                                    source.type =
                                        originalSource.type;
                                }


                                video.appendChild(
                                    source
                                );
                            }
                        );
                }


                video.className =
                    "random-artwork";


                video.controls =
                    true;


                video.autoplay =
                    false;


                video.loop =
                    true;


                video.playsInline =
                    true;


                return video;
            }


            return null;
        }


        /* =====================================================
           FAVORIS
        ====================================================== */

        function isFavorite(artId) {

            if (!artId) {

                return false;
            }


            if (
                window
                    .CouaxiaGalleryFavorites &&
                typeof window
                    .CouaxiaGalleryFavorites
                    .isFavorite ===
                "function"
            ) {

                return Boolean(
                    window
                        .CouaxiaGalleryFavorites
                        .isFavorite(
                            artId
                        )
                );
            }


            return false;
        }


        /**
         * Met à jour le cœur du modal.
         */
        function updateFavoriteButton(
            button,
            artId
        ) {

            if (
                !button ||
                !artId
            ) {

                return;
            }


            const favorite =
                isFavorite(
                    artId
                );


            const icon =
                button.querySelector(
                    ".random-art-favorite-icon"
                );


            button.dataset.artId =
                artId;


            button.classList.toggle(
                "is-favorite",
                favorite
            );


            button.setAttribute(
                "aria-pressed",
                String(
                    favorite
                )
            );


            button.setAttribute(
                "aria-label",
                favorite
                    ? "Retirer cette œuvre des favoris"
                    : "Ajouter cette œuvre aux favoris"
            );


            button.title =
                favorite
                    ? "Retirer des favoris"
                    : "Ajouter aux favoris";


            if (icon) {

                icon.textContent =
                    favorite
                        ? "♥"
                        : "♡";
            }
        }


        /**
         * Active ou masque le cœur
         * selon favorite_enabled.
         */
        function configureFavoriteButton(
            button,
            card
        ) {

            if (!button) {

                return;
            }


            const artId =
                getArtId(card);


            const enabled =
                isFavoriteEnabled(
                    card
                );


            button.hidden =
                !enabled;


            button.disabled =
                !enabled;


            if (
                !enabled ||
                !artId
            ) {

                button.dataset.artId =
                    "";

                button.classList.remove(
                    "is-favorite"
                );

                return;
            }


            updateFavoriteButton(
                button,
                artId
            );
        }


        /**
         * Ajoute ou retire le favori.
         */
        function toggleRandomFavorite(
            button
        ) {

            if (
                button.hidden ||
                button.disabled
            ) {

                return;
            }


            const artId =
                String(
                    button.dataset.artId ??
                    ""
                )
                    .trim();


            if (!artId) {

                return;
            }


            if (
                !window
                    .CouaxiaGalleryFavorites ||
                typeof window
                    .CouaxiaGalleryFavorites
                    .toggle !==
                "function"
            ) {

                console.warn(
                    "[Œuvre aléatoire] gallery-favorites.js n'est pas disponible."
                );

                return;
            }


            window
                .CouaxiaGalleryFavorites
                .toggle(
                    artId
                );


            updateFavoriteButton(
                button,
                artId
            );
        }


        /* =====================================================
           MODAL
        ====================================================== */

        function createRandomModal() {

            const overlay =
                document.createElement(
                    "div"
                );


            overlay.className =
                "random-art-modal";


            overlay.innerHTML = `
                <div
                    class="random-art-dialog"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Œuvre aléatoire"
                >

                    <!-- FAVORI -->

                    <button
                        type="button"
                        class="random-art-favorite"
                        aria-label="Ajouter cette œuvre aux favoris"
                        aria-pressed="false"
                        title="Ajouter aux favoris"
                    >
                        <span
                            class="random-art-favorite-icon"
                            aria-hidden="true"
                        >
                            ♡
                        </span>
                    </button>


                    <!-- FERMETURE -->

                    <button
                        type="button"
                        class="random-art-close"
                        aria-label="Fermer"
                        title="Fermer"
                    >
                        ✕
                    </button>


                    <!-- ŒUVRE -->

                    <div
                        class="random-art-stage"
                    >

                        <div
                            class="random-art-media"
                        ></div>


                        <!-- +18 -->

                        <div
                            class="random-art-sensitive-warning"
                            hidden
                        >

                            <button
                                type="button"
                                class="random-art-sensitive-reveal"
                                aria-label="Révéler l’illustration réservée aux adultes"
                                title="Révéler l’illustration"
                            >

                                <img
                                    src="./images/logo/Logo_Glow.png"
                                    class="random-art-sensitive-logo"
                                    alt=""
                                    aria-hidden="true"
                                    draggable="false"
                                >

                            </button>

                        </div>


                        <!-- COPYRIGHT -->

                        <img
                            src="./images/logo/Logo_Glow.png"
                            class="random-art-copyright-logo"
                            alt=""
                            aria-hidden="true"
                            draggable="false"
                        >


                        <!-- CRÉDIT -->

                        <div
                            class="random-art-credit"
                        >

                            <span
                                class="random-art-credit-artist"
                            ></span>

                            <span
                                class="random-art-credit-owner"
                            >
                                © Couaxia
                            </span>

                        </div>

                    </div>


                    <!-- ACTIONS -->

                    <div
                        class="random-art-actions"
                    >

                        <button
                            type="button"
                            class="random-art-again"
                        >
                            🎲 Une autre œuvre
                        </button>

                    </div>

                </div>
            `;


            document.body.appendChild(
                overlay
            );


            return overlay;
        }


        /* =====================================================
           AFFICHAGE
        ====================================================== */

        function displayArtworkInModal(
            modal,
            card
        ) {

            const mediaContainer =
                modal.querySelector(
                    ".random-art-media"
                );


            const artistElement =
                modal.querySelector(
                    ".random-art-credit-artist"
                );


            const favoriteButton =
                modal.querySelector(
                    ".random-art-favorite"
                );


            const warning =
                modal.querySelector(
                    ".random-art-sensitive-warning"
                );


            const revealButton =
                modal.querySelector(
                    ".random-art-sensitive-reveal"
                );


            if (
                !mediaContainer ||
                !artistElement
            ) {

                console.error(
                    "[Œuvre aléatoire] Structure du modal incomplète."
                );

                return;
            }


            /* =============================================
               MÉDIA
            ============================================== */

            const artwork =
                getArtwork(
                    card
                );


            mediaContainer.innerHTML =
                "";


            mediaContainer.classList.remove(
                "is-sensitive"
            );


            if (!artwork) {

                console.warn(
                    "[Œuvre aléatoire] Aucun média trouvé pour :",
                    getArtId(card)
                );


                mediaContainer.innerHTML = `
                    <p class="random-art-error">
                        Impossible d'afficher cette œuvre.
                    </p>
                `;


                return;
            }


            const clone =
                createArtworkClone(
                    artwork
                );


            if (!clone) {

                console.warn(
                    "[Œuvre aléatoire] Type de média non compatible."
                );

                return;
            }


            mediaContainer.appendChild(
                clone
            );


            /* =============================================
               ERREUR IMAGE
            ============================================== */

            if (
                clone instanceof
                HTMLImageElement
            ) {

                clone.addEventListener(
                    "error",
                    () => {

                        console.error(
                            "[Œuvre aléatoire] Impossible de charger l'image :",
                            clone.src
                        );
                    },
                    {
                        once:
                            true
                    }
                );
            }


            /* =============================================
               ARTISTE
            ============================================== */

            const artistName =
                getArtistName(
                    card
                );


            artistElement.textContent =
                `🎨 ${artistName}`;


            /* =============================================
               FAVORI
            ============================================== */

            configureFavoriteButton(
                favoriteButton,
                card
            );


            /* =============================================
               +18
            ============================================== */

            const sensitive =
                isSensitive(
                    card
                );


            mediaContainer.classList.toggle(
                "is-sensitive",
                sensitive
            );


            if (warning) {

                warning.hidden =
                    !sensitive;
            }


            if (revealButton) {

                revealButton.onclick =
                    () => {

                        mediaContainer.classList.remove(
                            "is-sensitive"
                        );


                        if (warning) {

                            warning.hidden =
                                true;
                        }


                        if (
                            typeof window
                                .showMascotteMessage ===
                            "function"
                        ) {

                            window.showMascotteMessage(
                                "Oh, tu ne pouvais vraiment pas t'empêcher de regarder 😏",
                                3500
                            );
                        }
                    };
            }


            /* =============================================
               VIDÉO
            ============================================== */

            if (
                clone instanceof
                HTMLVideoElement
            ) {

                clone.load();
            }
        }


        /* =====================================================
           MASCOTTE
        ====================================================== */

        function showRandomMascotteMessage() {

            if (
                typeof window
                    .showMascotteMessage !==
                "function"
            ) {

                return;
            }


            const messages = [

                "Le hasard a choisi celle-ci ! 🎲",

                "Ooooh, regarde cette œuvre ! 💜",

                "Tadaaam ! ✨",

                "Une œuvre sauvage apparaît ! 🎨",

                "Voyons voir ce que le destin a choisi ! 👀"

            ];


            const message =
                messages[
                    Math.floor(
                        Math.random() *
                        messages.length
                    )
                ];


            window.showMascotteMessage(
                message,
                3500
            );
        }


        /* =====================================================
           OUVERTURE
        ====================================================== */

        function openRandomArtwork() {

            const cards =
                getOriginalCards();


            if (
                cards.length ===
                0
            ) {

                console.warn(
                    "[Œuvre aléatoire] Aucune œuvre chargée."
                );


                if (
                    typeof window
                        .showMascotteMessage ===
                    "function"
                ) {

                    window.showMascotteMessage(
                        "La galerie n'est pas encore chargée 👀",
                        3000
                    );
                }


                return;
            }


            const randomCard =
                getRandomCard(
                    cards
                );


            if (!randomCard) {

                return;
            }


            lastRandomArtId =
                getArtId(
                    randomCard
                );


            console.info(
                "[Œuvre aléatoire] Œuvre choisie :",
                lastRandomArtId
            );


            let modal =
                document.querySelector(
                    ".random-art-modal"
                );


            if (!modal) {

                modal =
                    createRandomModal();
            }


            displayArtworkInModal(
                modal,
                randomCard
            );


            modal.classList.add(
                "is-open"
            );


            document.body.classList.add(
                "random-art-open"
            );


            modal
                .querySelector(
                    ".random-art-close"
                )
                ?.focus();


            showRandomMascotteMessage();
        }


        /* =====================================================
           FERMETURE
        ====================================================== */

        function closeRandomModal(
            modal
        ) {

            if (!modal) {

                return;
            }


            modal.classList.remove(
                "is-open"
            );


            document.body.classList.remove(
                "random-art-open"
            );


            modal
                .querySelectorAll(
                    "video"
                )
                .forEach(
                    video => {

                        video.pause();
                    }
                );
        }


        /* =====================================================
           BOUTON PRINCIPAL
        ====================================================== */

        randomButton.addEventListener(
            "click",
            openRandomArtwork
        );


        /* =====================================================
           CLICS DU MODAL
        ====================================================== */

        document.addEventListener(
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


                const modal =
                    event.target.closest(
                        ".random-art-modal"
                    );


                if (!modal) {

                    return;
                }


                /* =========================================
                   FERMER
                ========================================== */

                if (
                    event.target.closest(
                        ".random-art-close"
                    )
                ) {

                    closeRandomModal(
                        modal
                    );

                    return;
                }


                /* =========================================
                   FAVORI
                ========================================== */

                const favoriteButton =
                    event.target.closest(
                        ".random-art-favorite"
                    );


                if (favoriteButton) {

                    toggleRandomFavorite(
                        favoriteButton
                    );

                    return;
                }


                /* =========================================
                   AUTRE ŒUVRE
                ========================================== */

                if (
                    event.target.closest(
                        ".random-art-again"
                    )
                ) {

                    openRandomArtwork();

                    return;
                }


                /* =========================================
                   EXTÉRIEUR
                ========================================== */

                if (
                    event.target ===
                    modal
                ) {

                    closeRandomModal(
                        modal
                    );
                }
            }
        );


        /* =====================================================
           SYNCHRONISATION FAVORIS
        ====================================================== */

        document.addEventListener(
            "couaxia:gallery-favorites-changed",
            () => {

                const modal =
                    document.querySelector(
                        ".random-art-modal.is-open"
                    );


                if (!modal) {

                    return;
                }


                const favoriteButton =
                    modal.querySelector(
                        ".random-art-favorite"
                    );


                if (
                    !favoriteButton ||
                    favoriteButton.hidden
                ) {

                    return;
                }


                const artId =
                    String(
                        favoriteButton.dataset
                            .artId ??
                        ""
                    )
                        .trim();


                if (!artId) {

                    return;
                }


                updateFavoriteButton(
                    favoriteButton,
                    artId
                );
            }
        );


        /* =====================================================
           CHARGEMENT SUPABASE
        ====================================================== */

        document.addEventListener(
            "couaxia:credits-loaded",
            () => {

                const cards =
                    getOriginalCards();


                console.info(
                    `[Œuvre aléatoire] ${cards.length} œuvre(s) disponible(s).`
                );
            }
        );


        /* =====================================================
           RENDU GALERIE
        ====================================================== */

        document.addEventListener(
            "couaxia:credits-rendered",
            () => {

                /*
                 * Rien à reconstruire ici :
                 *
                 * le random utilise directement
                 * #credits-card-source.
                 *
                 * Cet événement confirme simplement
                 * que la galerie dynamique est prête.
                 */

                console.info(
                    "[Œuvre aléatoire] Galerie synchronisée."
                );
            }
        );


        /* =====================================================
           ÉCHAP
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


                const modal =
                    document.querySelector(
                        ".random-art-modal.is-open"
                    );


                if (!modal) {

                    return;
                }


                closeRandomModal(
                    modal
                );
            }
        );


        /* =====================================================
           API PUBLIQUE
        ====================================================== */

        window.CouaxiaGalleryRandom = {

            open() {

                openRandomArtwork();
            },


            close() {

                const modal =
                    document.querySelector(
                        ".random-art-modal.is-open"
                    );


                closeRandomModal(
                    modal
                );
            },


            getAvailableCount() {

                return getOriginalCards()
                    .length;
            }

        };


        console.info(
            "[Œuvre aléatoire] Module initialisé."
        );
    }
);