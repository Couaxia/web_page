"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const scrollTopButton =
        document.getElementById("scrollTopButton");

    const scrollBottomButton =
        document.getElementById("scrollBottomButton");

    if (!scrollTopButton || !scrollBottomButton) {
        return;
    }

    /*
     * Petite marge afin d’éviter les changements
     * incessants liés aux arrondis du navigateur.
     */
    const edgeTolerance = 6;


    function getMaximumScroll() {
        const documentElement =
            document.documentElement;

        const body =
            document.body;

        const fullPageHeight = Math.max(
            documentElement.scrollHeight,
            documentElement.offsetHeight,
            documentElement.clientHeight,
            body ? body.scrollHeight : 0,
            body ? body.offsetHeight : 0
        );

        return Math.max(
            0,
            fullPageHeight - window.innerHeight
        );
    }


    function updateScrollButtons() {
        const currentScroll =
            Math.max(
                0,
                window.scrollY ||
                document.documentElement.scrollTop
            );

        const maximumScroll =
            getMaximumScroll();


        /*
         * Si la page n’est pas assez longue pour défiler,
         * les deux boutons sont cachés.
         */
        if (maximumScroll <= edgeTolerance) {
            scrollTopButton.classList.add("is-hidden");
            scrollBottomButton.classList.add("is-hidden");
            return;
        }


        /*
         * En haut de la page :
         * on cache uniquement la flèche vers le haut.
         */
        const isAtTop =
            currentScroll <= edgeTolerance;


        /*
         * En bas de la page :
         * on cache uniquement la flèche vers le bas.
         */
        const isAtBottom =
            currentScroll >=
            maximumScroll - edgeTolerance;


        scrollTopButton.classList.toggle(
            "is-hidden",
            isAtTop
        );

        scrollBottomButton.classList.toggle(
            "is-hidden",
            isAtBottom
        );
    }


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


    /*
     * Mise à jour pendant le défilement.
     */

    window.addEventListener(
        "scroll",
        updateScrollButtons,
        {
            passive: true
        }
    );


    /*
     * Mise à jour si la fenêtre change de taille.
     */

    window.addEventListener(
        "resize",
        updateScrollButtons
    );


    /*
     * Mise à jour après le chargement complet des images.
     * Cela évite une mauvaise hauteur si les images
     * modifient la longueur de la page.
     */

    window.addEventListener(
        "load",
        updateScrollButtons
    );


    /*
     * Premier contrôle dès que le HTML est disponible.
     */

    updateScrollButtons();
});