"use strict";

/* =========================================================
   AUTH TWITCH PUBLIQUE
   COUAXIA
========================================================= */


/* =========================================================
   ÉLÉMENTS
========================================================= */

const authContainer =
    document.getElementById(
        "public-twitch-auth"
    );


const authLoading =
    document.getElementById(
        "public-twitch-auth-loading"
    );


const authGuest =
    document.getElementById(
        "public-twitch-auth-guest"
    );


const authUser =
    document.getElementById(
        "public-twitch-auth-user"
    );


const authAvatar =
    document.getElementById(
        "public-twitch-auth-avatar"
    );


const authName =
    document.getElementById(
        "public-twitch-auth-name"
    );


const logoutButton =
    document.getElementById(
        "public-twitch-auth-logout"
    );


/* =========================================================
   ÉTAT
========================================================= */

let currentPublicUser =
    null;


/* =========================================================
   AFFICHAGE — CHARGEMENT
========================================================= */

function showLoading() {

    if (
        authLoading
    ) {

        authLoading.hidden =
            false;
    }


    if (
        authGuest
    ) {

        authGuest.hidden =
            true;
    }


    if (
        authUser
    ) {

        authUser.hidden =
            true;
    }
}


/* =========================================================
   AFFICHAGE — NON CONNECTÉ
========================================================= */

function showGuest() {

    currentPublicUser =
        null;


    if (
        authLoading
    ) {

        authLoading.hidden =
            true;
    }


    if (
        authGuest
    ) {

        authGuest.hidden =
            false;
    }


    if (
        authUser
    ) {

        authUser.hidden =
            true;
    }


    if (
        authContainer
    ) {

        authContainer.classList.remove(
            "is-connected"
        );
    }
}


/* =========================================================
   AFFICHAGE — CONNECTÉ
========================================================= */

function showUser(
    user
) {

    currentPublicUser =
        user;


    if (
        authLoading
    ) {

        authLoading.hidden =
            true;
    }


    if (
        authGuest
    ) {

        authGuest.hidden =
            true;
    }


    if (
        authUser
    ) {

        authUser.hidden =
            false;
    }


    if (
        authContainer
    ) {

        authContainer.classList.add(
            "is-connected"
        );
    }


    /* =====================================================
       NOM
    ====================================================== */

    const displayName =
        String(
            user?.displayName ||
            user?.display_name ||
            user?.login ||
            "Twitch"
        );


    if (
        authName
    ) {

        authName.textContent =
            displayName;
    }


    /* =====================================================
       AVATAR
    ====================================================== */

    const avatarUrl =
        String(
            user?.profileImageUrl ||
            user?.profile_image_url ||
            user?.avatar ||
            ""
        );


    if (
        authAvatar
    ) {

        if (
            avatarUrl
        ) {

            authAvatar.src =
                avatarUrl;


            authAvatar.alt =
                `Avatar Twitch de ${displayName}`;


            authAvatar.hidden =
                false;

        } else {

            authAvatar.removeAttribute(
                "src"
            );


            authAvatar.alt =
                "";


            authAvatar.hidden =
                true;
        }
    }
}


/* =========================================================
   CHARGEMENT SESSION
========================================================= */

async function loadPublicAuth() {

    if (
        !authContainer
    ) {

        return;
    }


    showLoading();


    try {

        const response =
            await fetch(
                "/api/auth/me",
                {

                    method:
                        "GET",

                    credentials:
                        "same-origin",

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
                "Impossible de vérifier la connexion Twitch."
            );
        }


        /* =================================================
           CONNECTÉ
        ================================================== */

        if (
            data?.authenticated === true &&
            data?.user
        ) {

            showUser(
                data.user
            );


            return;
        }


        /* =================================================
           NON CONNECTÉ
        ================================================== */

        showGuest();


    } catch (
        error
    ) {

        console.error(
            "[Public Auth] Vérification :",
            error
        );


        /*
         * En cas de problème réseau,
         * on affiche simplement la connexion.
         */

        showGuest();
    }
}


/* =========================================================
   DÉCONNEXION
========================================================= */

async function logoutPublicUser() {

    if (
        !logoutButton
    ) {

        return;
    }


    const originalText =
        logoutButton.textContent;


    logoutButton.disabled =
        true;


    logoutButton.textContent =
        "Déconnexion...";


    try {

        const response =
            await fetch(
                "/api/auth/logout",
                {

                    method:
                        "POST",

                    credentials:
                        "same-origin",

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
                "Impossible de se déconnecter."
            );
        }


        currentPublicUser =
            null;


        showGuest();


        /*
         * On avertit les autres scripts de la page,
         * notamment games-poll.js.
         */

        window.dispatchEvent(
            new CustomEvent(
                "couaxia:public-auth-changed",
                {

                    detail: {

                        authenticated:
                            false,

                        user:
                            null

                    }

                }
            )
        );


    } catch (
        error
    ) {

        console.error(
            "[Public Auth Logout]",
            error
        );


        window.alert(
            error?.message ||
            "Impossible de se déconnecter de Twitch."
        );


    } finally {

        logoutButton.disabled =
            false;


        logoutButton.textContent =
            originalText;
    }
}


/* =========================================================
   ÉVÉNEMENTS
========================================================= */

if (
    logoutButton
) {

    logoutButton.addEventListener(
        "click",
        logoutPublicUser
    );
}


/* =========================================================
   INITIALISATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    loadPublicAuth
);