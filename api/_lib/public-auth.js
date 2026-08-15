"use strict";

/* =========================================================
   AUTHENTIFICATION PUBLIQUE TWITCH
   COUAXIA
========================================================= */

import crypto
    from "crypto";


/* =========================================================
   CONFIGURATION
========================================================= */

const COOKIE_NAME =
    "couaxia_user_session";


const SESSION_DURATION_SECONDS =
    30 * 24 * 60 * 60;


/* =========================================================
   SECRET
========================================================= */

function getSecret() {

    const secret =
        String(
            process.env.PUBLIC_AUTH_SECRET ||
            process.env.SESSION_SECRET ||
            process.env.ADMIN_SESSION_SECRET ||
            ""
        ).trim();


    if (
        !secret
    ) {

        throw new Error(
            "PUBLIC_AUTH_SECRET est manquant."
        );
    }


    return secret;
}


/* =========================================================
   BASE64 URL
========================================================= */

function encodeBase64Url(
    value
) {

    return Buffer
        .from(
            value,
            "utf8"
        )
        .toString(
            "base64url"
        );
}


function decodeBase64Url(
    value
) {

    return Buffer
        .from(
            value,
            "base64url"
        )
        .toString(
            "utf8"
        );
}


/* =========================================================
   SIGNATURE
========================================================= */

function sign(
    value
) {

    return crypto
        .createHmac(
            "sha256",
            getSecret()
        )
        .update(
            value
        )
        .digest(
            "base64url"
        );
}


/* =========================================================
   COMPARAISON SÉCURISÉE
========================================================= */

function safeCompare(
    valueA,
    valueB
) {

    const bufferA =
        Buffer.from(
            String(
                valueA || ""
            )
        );


    const bufferB =
        Buffer.from(
            String(
                valueB || ""
            )
        );


    if (
        bufferA.length !==
        bufferB.length
    ) {

        return false;
    }


    return crypto.timingSafeEqual(
        bufferA,
        bufferB
    );
}


/* =========================================================
   COOKIES
========================================================= */

export function parseCookies(
    request
) {

    const cookieHeader =
        request?.headers?.cookie ||
        "";


    const cookies =
        {};


    cookieHeader
        .split(";")
        .map(
            item =>
                item.trim()
        )
        .filter(
            Boolean
        )
        .forEach(
            item => {

                const separator =
                    item.indexOf("=");


                if (
                    separator <
                    0
                ) {

                    return;
                }


                const name =
                    item
                        .slice(
                            0,
                            separator
                        )
                        .trim();


                const rawValue =
                    item
                        .slice(
                            separator + 1
                        )
                        .trim();


                if (
                    !name
                ) {

                    return;
                }


                try {

                    cookies[name] =
                        decodeURIComponent(
                            rawValue
                        );

                } catch {

                    cookies[name] =
                        rawValue;
                }
            }
        );


    return cookies;
}


export function getCookie(
    request,
    name
) {

    const cookies =
        parseCookies(
            request
        );


    return (
        cookies[name] ||
        ""
    );
}


/* =========================================================
   SESSION PUBLIQUE
========================================================= */

export function createPublicUserSession(
    user
) {

    const twitchUserId =
        String(
            user?.id ||
            ""
        ).trim();


    if (
        !twitchUserId
    ) {

        throw new Error(
            "ID Twitch utilisateur invalide."
        );
    }


    const now =
        Math.floor(
            Date.now() /
            1000
        );


    const payload = {

        twitchUserId,

        login:
            String(
                user?.login ||
                ""
            ),

        displayName:
            String(
                user?.display_name ||
                user?.displayName ||
                user?.login ||
                ""
            ),

        profileImageUrl:
            String(
                user?.profile_image_url ||
                user?.profileImageUrl ||
                ""
            ),

        createdAt:
            now,

        exp:
            now +
            SESSION_DURATION_SECONDS

    };


    const encodedPayload =
        encodeBase64Url(
            JSON.stringify(
                payload
            )
        );


    const signature =
        sign(
            encodedPayload
        );


    return (
        encodedPayload +
        "." +
        signature
    );
}


/* =========================================================
   VÉRIFICATION SESSION
========================================================= */

export function verifyPublicUserSession(
    token
) {

    if (
        !token
    ) {

        return null;
    }


    const parts =
        String(
            token
        ).split(".");


    if (
        parts.length !==
        2
    ) {

        return null;
    }


    const [
        encodedPayload,
        signature
    ] =
        parts;


    if (
        !encodedPayload ||
        !signature
    ) {

        return null;
    }


    const expectedSignature =
        sign(
            encodedPayload
        );


    if (
        !safeCompare(
            signature,
            expectedSignature
        )
    ) {

        return null;
    }


    try {

        const payload =
            JSON.parse(
                decodeBase64Url(
                    encodedPayload
                )
            );


        const now =
            Math.floor(
                Date.now() /
                1000
            );


        if (
            !payload?.exp ||
            payload.exp <=
            now
        ) {

            return null;
        }


        if (
            !payload?.twitchUserId
        ) {

            return null;
        }


        return payload;

    } catch {

        return null;
    }
}


/* =========================================================
   RÉCUPÉRER SESSION
========================================================= */

export function getPublicUserSession(
    request
) {

    const token =
        getCookie(
            request,
            COOKIE_NAME
        );


    return verifyPublicUserSession(
        token
    );
}


/* =========================================================
   COOKIE CONNEXION
========================================================= */

export function createPublicSessionCookie(
    token
) {

    return [
        `${COOKIE_NAME}=${encodeURIComponent(token)}`,
        "Path=/",
        "HttpOnly",
        "Secure",
        "SameSite=Lax",
        `Max-Age=${SESSION_DURATION_SECONDS}`
    ].join("; ");
}


/* =========================================================
   COOKIE DÉCONNEXION
========================================================= */

export function createPublicLogoutCookie() {

    return [
        `${COOKIE_NAME}=`,
        "Path=/",
        "HttpOnly",
        "Secure",
        "SameSite=Lax",
        "Max-Age=0"
    ].join("; ");
}


/* =========================================================
   UTILISATEUR PUBLIC
========================================================= */

export function getPublicUser(
    session
) {

    if (
        !session
    ) {

        return null;
    }


    return {

        id:
            String(
                session.twitchUserId
            ),

        login:
            String(
                session.login ||
                ""
            ),

        displayName:
            String(
                session.displayName ||
                session.login ||
                ""
            ),

        profileImageUrl:
            String(
                session.profileImageUrl ||
                ""
            )

    };
}