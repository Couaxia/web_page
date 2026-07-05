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