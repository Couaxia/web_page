"use strict";

/* ==========================================
   Mode jour / nuit du site Couaxia
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    const themeButton = document.querySelector("#theme-toggle");
    const themeIcon = document.querySelector(".theme-icon");
    const themeText = document.querySelector(".theme-text");

    if (!themeButton || !themeIcon || !themeText) {
        console.warn("Le bouton de changement de thème est introuvable.");
        return;
    }

    const savedTheme = localStorage.getItem("couaxia-theme");

    const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
    ).matches;

    /*
     * Priorité :
     * 1. Choix déjà enregistré
     * 2. Thème de l'appareil
     */
    const initialTheme =
        savedTheme || (systemPrefersDark ? "dark" : "light");

    applyTheme(initialTheme);

    themeButton.addEventListener("click", () => {
        const currentTheme =
            document.documentElement.dataset.theme || "light";

        const newTheme =
            currentTheme === "dark" ? "light" : "dark";

        applyTheme(newTheme);

        localStorage.setItem("couaxia-theme", newTheme);
    });

    function applyTheme(theme) {
        document.documentElement.dataset.theme = theme;

        const isDark = theme === "dark";

        themeIcon.textContent = isDark ? "☀️" : "🌙";
        themeText.textContent = isDark ? "Mode jour" : "Mode nuit";

        themeButton.setAttribute(
            "aria-label",
            isDark
                ? "Activer le mode jour"
                : "Activer le mode nuit"
        );

        themeButton.setAttribute(
            "aria-pressed",
            String(isDark)
        );
    }
});