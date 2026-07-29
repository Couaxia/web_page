document.addEventListener("DOMContentLoaded", () => {
    const source = document.getElementById("credits-card-source");
    const generatedContainer = document.getElementById(
        "credits-generated-galleries"
    );
    const filter = document.getElementById("credits-category-filter");
    const results = document.getElementById("credits-global-results");

    if (!source || !generatedContainer || !filter) {
        console.error(
            "Impossible d'initialiser la galerie des crédits : élément manquant."
        );
        return;
    }

    const originalCards = Array.from(
        source.querySelectorAll(".artist-card[data-tags]")
    );

    const galleries = [
        {
            id: "couaxia",
            title: "🌌 Couaxia",
            description:
                "Les différentes formes et illustrations de Couaxia.",
            tag: "couaxia",
            subsections: [
                {
                    id: "forme-2",
                    title: "✨ Forme 2",
                    tag: "forme-2"
                },
                {
                    id: "forme-3",
                    title: "🌙 Forme 3",
                    tag: "forme-3"
                },
                {
                    id: "couaxia-other",
                    title: "💜 Autres illustrations",
                    excludeTags: ["forme-2", "forme-3"]
                }
            ]
        },
        {
            id: "compagnons",
            title: "🐉 Compagnons",
            description:
                "Natsu, Cit, Xaouc et les autres compagnons de Couaxia.",
            tag: "compagnons"
        },
        {
            id: "stream",
            title: "🎬 Stream",
            description:
                "Emotes, badges, panels, animations et créations du stream.",
            tag: "stream"
        },
        {
            id: "collab",
            title: "🤝 Collabs",
            description:
                "Les illustrations réalisées avec d'autres créateurs et VTubers.",
            tag: "collab"
        },
        {
            id: "couple",
            title: "💕 Couple",
            description:
                "Les illustrations de couple de Couaxia.",
            tag: "couple"
        },
        {
            id: "fanart",
            title: "🎨 Fan Arts",
            description:
                "Les magnifiques fan arts réalisés pour Couaxia.",
            tag: "fanart"
        }
    ];

    function getTags(card) {
        return card.dataset.tags
            .toLowerCase()
            .split(/\s+/)
            .filter(Boolean);
    }

    function cardHasTag(card, tag) {
        return getTags(card).includes(tag);
    }

    function cloneCard(card) {
        const clone = card.cloneNode(true);

        clone.removeAttribute("id");
        clone.removeAttribute("hidden");

        return clone;
    }

    function createBanner(gallery) {
        const header = document.createElement("header");

        header.className = "credits-banner";

        header.innerHTML = `
            <h2>${gallery.title}</h2>
            <p>${gallery.description}</p>
        `;

        return header;
    }

    function createGrid(cards) {
        const grid = document.createElement("div");

        grid.className = "credits-grid";

        cards.forEach((card) => {
            grid.appendChild(cloneCard(card));
        });

        return grid;
    }

    function createSubsection(title, cards, subsectionId) {
        if (cards.length === 0) {
            return null;
        }

        const subsection = document.createElement("section");

        subsection.className = "credits-subsection";
        subsection.dataset.subsection = subsectionId;

        const heading = document.createElement("h3");

        heading.className = "credits-subtitle";
        heading.textContent = title;

        subsection.appendChild(heading);
        subsection.appendChild(createGrid(cards));

        return subsection;
    }

    function createCouaxiaGallery(gallery, cards) {
        const section = document.createElement("section");

        section.className = "credits-gallery-section";
        section.dataset.gallery = gallery.id;

        section.appendChild(createBanner(gallery));

        gallery.subsections.forEach((subsectionData) => {
            let subsectionCards;

            if (subsectionData.tag) {
                subsectionCards = cards.filter((card) =>
                    cardHasTag(card, subsectionData.tag)
                );
            } else {
                subsectionCards = cards.filter((card) => {
                    const tags = getTags(card);

                    return !subsectionData.excludeTags.some((tag) =>
                        tags.includes(tag)
                    );
                });
            }

            const subsection = createSubsection(
                subsectionData.title,
                subsectionCards,
                subsectionData.id
            );

            if (subsection) {
                section.appendChild(subsection);
            }
        });

        return section;
    }

    function createStandardGallery(gallery, cards) {
        const section = document.createElement("section");

        section.className = "credits-gallery-section";
        section.dataset.gallery = gallery.id;

        section.appendChild(createBanner(gallery));
        section.appendChild(createGrid(cards));

        return section;
    }

    function filterCardForSelection(card, selectedFilter) {
        if (selectedFilter === "all") {
            return true;
        }

        return cardHasTag(card, selectedFilter);
    }

    function shouldDisplayGallery(gallery, selectedFilter) {
        if (selectedFilter === "all") {
            return true;
        }

        const couaxiaFilters = [
            "couaxia",
            "forme-2",
            "forme-3"
        ];

        const companionFilters = [
            "compagnons",
            "natsu",
            "cit",
            "xaouc"
        ];

        const streamFilters = [
            "stream",
            "decor",
            "overlay",
            "panel",
            "badge",
            "emote",
            "animation",
            "reactive-discord"
        ];

        if (
            gallery.id === "couaxia" &&
            couaxiaFilters.includes(selectedFilter)
        ) {
            return true;
        }

        if (
            gallery.id === "compagnons" &&
            companionFilters.includes(selectedFilter)
        ) {
            return true;
        }

        if (
            gallery.id === "stream" &&
            streamFilters.includes(selectedFilter)
        ) {
            return true;
        }

        return gallery.id === selectedFilter;
    }

    function renderGalleries(selectedFilter = "all") {
        generatedContainer.innerHTML = "";

        let displayedCardCount = 0;
        let displayedGalleryCount = 0;

        galleries.forEach((gallery) => {
            if (!shouldDisplayGallery(gallery, selectedFilter)) {
                return;
            }

            let galleryCards = originalCards.filter((card) =>
                cardHasTag(card, gallery.tag)
            );

            if (selectedFilter !== "all") {
                galleryCards = galleryCards.filter((card) =>
                    filterCardForSelection(card, selectedFilter)
                );
            }

            if (galleryCards.length === 0) {
                return;
            }

            let galleryElement;

            if (gallery.id === "couaxia") {
                galleryElement = createCouaxiaGallery(
                    gallery,
                    galleryCards
                );
            } else {
                galleryElement = createStandardGallery(
                    gallery,
                    galleryCards
                );
            }

            generatedContainer.appendChild(galleryElement);

            displayedCardCount += galleryCards.length;
            displayedGalleryCount += 1;
        });

        updateResults(
            displayedCardCount,
            displayedGalleryCount,
            selectedFilter
        );

        initializeGeneratedCards();
    }

    function updateResults(cardCount, galleryCount, selectedFilter) {
        if (!results) {
            return;
        }

        if (cardCount === 0) {
            results.textContent =
                "Aucune œuvre ne correspond à ce filtre.";
            return;
        }

        const cardWord = cardCount > 1 ? "œuvres affichées" : "œuvre affichée";
        const galleryWord =
            galleryCount > 1 ? "galeries" : "galerie";

        if (selectedFilter === "all") {
            results.textContent =
                `${cardCount} ${cardWord} dans ${galleryCount} ${galleryWord}.`;
        } else {
            results.textContent = `${cardCount} ${cardWord}.`;
        }
    }

    function initializeGeneratedCards() {
        /*
         * Ton fichier artist.js doit idéalement utiliser
         * la délégation d'événement.
         *
         * Si artist.js initialise les cartes une seule fois,
         * tu pourras appeler ici une fonction comme :
         *
         * initializeArtistCards();
         */
    }

    filter.addEventListener("change", () => {
        renderGalleries(filter.value);
    });

    renderGalleries();
});