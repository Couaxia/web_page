document.querySelectorAll(".artist-card").forEach(card => {

    const image = card.querySelector(".image-container");
    const content = card.querySelector(".artist-content");

    image.addEventListener("mouseenter", () => {
        content.style.opacity = "0";
        content.style.pointerEvents = "none";
    });

    image.addEventListener("mouseleave", () => {
        content.style.opacity = "1";
        content.style.pointerEvents = "auto";
    });

});

"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const filterSelect = document.querySelector(
        "#credits-category-filter"
    );

    const gallerySections = document.querySelectorAll(
        ".credits-gallery-section"
    );

    const cards = document.querySelectorAll(
        ".artist-card[data-tags]"
    );

    const resultsMessage = document.querySelector(
        "#credits-global-results"
    );

    if (!filterSelect || !cards.length) {
        return;
    }


    /**
     * Retourne toutes les étiquettes d’une carte.
     *
     * Exemple :
     * data-tags="stream overlay animation"
     *
     * devient :
     * ["stream", "overlay", "animation"]
     */
    function getCardTags(card) {
        return String(card.dataset.tags || "")
            .toLowerCase()
            .split(/\s+/)
            .map((tag) => tag.trim())
            .filter(Boolean);
    }


    /**
     * Vérifie si une carte doit être affichée.
     */
    function cardMatchesFilter(card, selectedFilter) {
        if (selectedFilter === "all") {
            return true;
        }

        const tags = getCardTags(card);

        return tags.includes(selectedFilter);
    }


    /**
     * Cache automatiquement les sections qui ne contiennent
     * plus aucune carte visible.
     */
    function updateSectionsVisibility() {
        gallerySections.forEach((section) => {
            const visibleCards = section.querySelectorAll(
                ".artist-card:not([hidden])"
            );

            section.hidden = visibleCards.length === 0;
        });
    }


    /**
     * Met à jour le texte sous la liste.
     */
    function updateResultsMessage(visibleCount, selectedFilter) {
        if (!resultsMessage) {
            return;
        }

        if (visibleCount === 0) {
            resultsMessage.textContent =
                "Aucune œuvre ne correspond à cette catégorie.";

            return;
        }

        if (selectedFilter === "all") {
            resultsMessage.textContent =
                `${visibleCount} œuvre${visibleCount > 1 ? "s" : ""} répartie${visibleCount > 1 ? "s" : ""} dans les différentes galeries.`;

            return;
        }

        const selectedOption =
            filterSelect.options[filterSelect.selectedIndex];

        const categoryName =
            selectedOption?.textContent?.trim() || "cette catégorie";

        resultsMessage.textContent =
            `${visibleCount} œuvre${visibleCount > 1 ? "s" : ""} affichée${visibleCount > 1 ? "s" : ""} pour « ${categoryName} ».`;
    }


    /**
     * Applique le filtre choisi.
     */
    function applyFilter() {
        const selectedFilter =
            String(filterSelect.value || "all").toLowerCase();

        let visibleCount = 0;

        cards.forEach((card) => {
            const shouldDisplay = cardMatchesFilter(
                card,
                selectedFilter
            );

            card.hidden = !shouldDisplay;

            card.classList.toggle(
                "is-filtered-out",
                !shouldDisplay
            );

            if (shouldDisplay) {
                visibleCount += 1;

                card.classList.remove("is-filtered-in");

                /*
                 * Relance l’animation d’apparition.
                 */
                void card.offsetWidth;

                card.classList.add("is-filtered-in");
            } else {
                card.classList.remove("is-filtered-in");
            }
        });

        updateSectionsVisibility();

        updateResultsMessage(
            visibleCount,
            selectedFilter
        );
    }


    filterSelect.addEventListener("change", applyFilter);


    /*
     * Au chargement :
     * affiche automatiquement toutes les œuvres,
     * rangées sous leurs différentes bannières.
     */
    filterSelect.value = "all";
    applyFilter();
});

"use strict";

/* ==========================================
   Filtrage animé de la galerie des crédits
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    const filterSelect = document.querySelector(
        "#credits-category-filter"
    );

    const gallerySections = Array.from(
        document.querySelectorAll(
            ".credits-gallery-section"
        )
    );

    const resultsMessage = document.querySelector(
        "#credits-global-results"
    );

    if (!filterSelect || gallerySections.length === 0) {
        console.warn(
            "Le filtre ou les galeries des crédits sont introuvables."
        );

        return;
    }

    const animationDuration = 550;

    /*
     * Transforme :
     * data-tags="couaxia myo collab couple"
     *
     * en :
     * ["couaxia", "myo", "collab", "couple"]
     */
    function getCardTags(card) {
        return String(card.dataset.tags || "")
            .toLowerCase()
            .trim()
            .split(/\s+/)
            .filter(Boolean);
    }

    /*
     * Vérifie si une carte correspond au filtre.
     */
    function cardMatchesFilter(card, selectedFilter) {
        if (selectedFilter === "all") {
            return true;
        }

        const tags = getCardTags(card);

        return tags.includes(selectedFilter);
    }

    /*
     * Calcule et enregistre la hauteur naturelle
     * d’une galerie.
     */
    function setSectionExpandedHeight(section) {
        section.style.maxHeight = "none";

        const naturalHeight = section.scrollHeight;

        section.style.maxHeight = `${naturalHeight}px`;
    }

    /*
     * Déplie une galerie.
     */
    function expandSection(section) {
        section.classList.remove("is-collapsed");

        /*
         * On repart de zéro pour déclencher
         * correctement l’animation.
         */
        section.style.maxHeight = "0px";

        requestAnimationFrame(() => {
            const naturalHeight = section.scrollHeight;

            section.style.maxHeight = `${naturalHeight}px`;
        });

        /*
         * Après l’animation, on recalcule la hauteur
         * afin d’éviter qu’un contenu soit coupé.
         */
        window.setTimeout(() => {
            if (!section.classList.contains("is-collapsed")) {
                setSectionExpandedHeight(section);
            }
        }, animationDuration);
    }

    /*
     * Replie une galerie.
     */
    function collapseSection(section) {
        const currentHeight = section.scrollHeight;

        section.style.maxHeight = `${currentHeight}px`;

        /*
         * Force le navigateur à enregistrer
         * la hauteur de départ.
         */
        void section.offsetHeight;

        section.classList.add("is-collapsed");
        section.style.maxHeight = "0px";
    }

    /*
     * Masque une carte.
     */
    function hideCard(card) {
        card.classList.remove("is-visible-card");
        card.classList.add("is-hidden-card");
    }

    /*
     * Affiche une carte avec une animation.
     */
    function showCard(card, delay = 0) {
        card.classList.remove("is-hidden-card");
        card.classList.remove("is-visible-card");

        card.style.animationDelay = `${delay}ms`;

        /*
         * Relance l’animation même si la carte
         * avait déjà été affichée auparavant.
         */
        void card.offsetWidth;

        card.classList.add("is-visible-card");
    }

    /*
     * Met à jour le texte indiquant le nombre
     * d’œuvres visibles.
     */
    function updateResultsMessage(
        visibleCardsCount,
        visibleSectionsCount,
        selectedFilter
    ) {
        if (!resultsMessage) {
            return;
        }

        if (visibleCardsCount === 0) {
            resultsMessage.textContent =
                "Aucune œuvre ne correspond à cette catégorie.";

            return;
        }

        const artworkWord =
            visibleCardsCount > 1 ? "œuvres" : "œuvre";

        const displayedWord =
            visibleCardsCount > 1 ? "affichées" : "affichée";

        if (selectedFilter === "all") {
            const galleryWord =
                visibleSectionsCount > 1
                    ? "galeries"
                    : "galerie";

            resultsMessage.textContent =
                `${visibleCardsCount} ${artworkWord} réparties dans ` +
                `${visibleSectionsCount} ${galleryWord}.`;

            return;
        }

        const selectedOption =
            filterSelect.options[
                filterSelect.selectedIndex
            ];

        const selectedLabel =
            selectedOption?.textContent?.trim() ||
            "cette catégorie";

        resultsMessage.textContent =
            `${visibleCardsCount} ${artworkWord} ${displayedWord} ` +
            `pour « ${selectedLabel} ».`;
    }

    /*
     * Applique le filtre sélectionné.
     */
    function applyGalleryFilter() {
        const selectedFilter = String(
            filterSelect.value || "all"
        ).toLowerCase();

        let totalVisibleCards = 0;
        let totalVisibleSections = 0;

        gallerySections.forEach((section) => {
            const cards = Array.from(
                section.querySelectorAll(
                    ".artist-card[data-tags]"
                )
            );

            let sectionVisibleCards = 0;

            cards.forEach((card, cardIndex) => {
                const shouldBeVisible =
                    cardMatchesFilter(
                        card,
                        selectedFilter
                    );

                if (shouldBeVisible) {
                    /*
                     * Petit décalage pour que les cartes
                     * apparaissent progressivement.
                     */
                    const delay = Math.min(
                        cardIndex * 55,
                        330
                    );

                    showCard(card, delay);

                    sectionVisibleCards += 1;
                    totalVisibleCards += 1;
                } else {
                    hideCard(card);
                }
            });

            if (sectionVisibleCards > 0) {
                totalVisibleSections += 1;
                expandSection(section);
            } else {
                collapseSection(section);
            }
        });

        updateResultsMessage(
            totalVisibleCards,
            totalVisibleSections,
            selectedFilter
        );
    }

    /*
     * Recalcule les hauteurs si la taille
     * de la fenêtre change.
     */
    let resizeTimer;

    window.addEventListener("resize", () => {
        window.clearTimeout(resizeTimer);

        resizeTimer = window.setTimeout(() => {
            gallerySections.forEach((section) => {
                if (
                    !section.classList.contains(
                        "is-collapsed"
                    )
                ) {
                    setSectionExpandedHeight(section);
                }
            });
        }, 150);
    });

    /*
     * Recalcule les hauteurs après le chargement
     * des images.
     */
    const galleryImages = document.querySelectorAll(
        ".credits-gallery-section img"
    );

    galleryImages.forEach((image) => {
        if (image.complete) {
            return;
        }

        image.addEventListener("load", () => {
            const section = image.closest(
                ".credits-gallery-section"
            );

            if (
                section &&
                !section.classList.contains(
                    "is-collapsed"
                )
            ) {
                setSectionExpandedHeight(section);
            }
        });
    });

    filterSelect.addEventListener(
        "change",
        applyGalleryFilter
    );

    /*
     * Affichage initial :
     * toutes les œuvres et toutes les galeries.
     */
    filterSelect.value = "all";

    gallerySections.forEach((section) => {
        setSectionExpandedHeight(section);
    });

    applyGalleryFilter();
});