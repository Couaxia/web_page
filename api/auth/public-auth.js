"use strict";

/* =========================================================
   AUTH PUBLIQUE — TWITCH
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const logoutButton =
            document.getElementById(
                "public-auth-logout"
            );


        if (
            !logoutButton
        ) {

            return;
        }


        /* =====================================================
           VÉRIFICATION DE SESSION
        ====================================================== */

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
                response.ok &&
                data?.authenticated
            ) {

                logoutButton.hidden =
                    false;

            } else {

                logoutButton.hidden =
                    true;
            }


        } catch (
            error
        ) {

            console.error(
                "[Public Auth] Vérification session :",
                error
            );


            logoutButton.hidden =
                true;
        }


        /* =====================================================
           DÉCONNEXION
        ====================================================== */

        logoutButton.addEventListener(
            "click",
            async () => {

                logoutButton.disabled =
                    true;


                try {

                    const response =
                        await fetch(
                            "/api/auth/logout",
                            {
                                method:
                                    "POST",

                                credentials:
                                    "same-origin",

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


                    /*
                     * Après déconnexion,
                     * on recharge la page.
                     */

                    window.location.href =
                        "/games.html?logout=success";


                } catch (
                    error
                ) {

                    console.error(
                        "[Public Auth Logout]",
                        error
                    );


                    logoutButton.disabled =
                        false;


                    alert(
                        error?.message ||
                        "Impossible de se déconnecter de Twitch."
                    );
                }
            }
        );
    }
);