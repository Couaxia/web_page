"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const scrollTopButton =
        document.getElementById("scrollTopButton");

    const scrollBottomButton =
        document.getElementById("scrollBottomButton");

    if (!scrollTopButton || !scrollBottomButton) {
        return;
    }

    const getMaximumScroll = () => {
        return Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight
        ) - window.innerHeight;
    };

    const updateScrollButtons = () => {
        const currentScroll = window.scrollY;
        const maximumScroll = getMaximumScroll();

        const isNearTop = currentScroll < 250;
        const isNearBottom =
            currentScroll >= maximumScroll - 250;

        /*
         * En haut :
         * le bouton bas apparaît.
         *
         * Au milieu :
         * les deux boutons apparaissent.
         *
         * En bas :
         * le bouton haut apparaît.
         */

        scrollTopButton.classList.toggle(
            "is-visible",
            !isNearTop
        );

        scrollBottomButton.classList.toggle(
            "is-visible",
            !isNearBottom && maximumScroll > 250
        );
    };

    scrollTopButton.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    scrollBottomButton.addEventListener("click", () => {
        window.scrollTo({
            top: getMaximumScroll(),
            behavior: "smooth"
        });
    });

    window.addEventListener(
        "scroll",
        updateScrollButtons,
        { passive: true }
    );

    window.addEventListener(
        "resize",
        updateScrollButtons
    );

    updateScrollButtons();
});