"use strict";

/* =========================================================
   AUTHENTIFICATION ADMIN — COUAXIA
========================================================= */

import crypto from "node:crypto";


/* =========================================================
   CONFIGURATION
========================================================= */

const COOKIE_NAME =
    "couaxia_admin_session";


const SESSION_DURATION_SECONDS =
    60 * 60 * 8;


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
   SECRET DE SESSION
========================================================= */

function getSessionSecret() {

    const secret =
        process.env
            .ADMIN_SESSION_SECRET;


    if (!secret) {
        throw new Error(
            "ADMIN_SESSION_SECRET est manquant."
        );
    }


    return secret;
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
            getSessionSecret()
        )
        .update(
            value
        )
        .digest(
            "base64url"
        );
}


/* =========================================================
   CRÉATION DE SESSION
========================================================= */

/**
 * Crée une session admin signée.
 *
 * @param {object} user Utilisateur Twitch
 * @returns {string}
 */
export function createAdminSession(
    user
) {

    if (!user?.id) {
        throw new Error(
            "Impossible de créer la session admin : utilisateur Twitch invalide."
        );
    }


    const now =
        Math.floor(
            Date.now() /
            1000
        );


    const payload = {

        twitchUserId:
            String(
                user.id
            ),

        login:
            String(
                user.login ||
                ""
            ),

        displayName:
            String(
                user.display_name ||
                ""
            ),

        profileImageUrl:
            String(
                user.profile_image_url ||
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
   VÉRIFICATION DE SESSION
========================================================= */

/**
 * Vérifie qu'une session est valide.
 *
 * @param {string} token
 * @returns {object|null}
 */
export function verifyAdminSession(
    token
) {

    if (!token) {
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


    const receivedBuffer =
        Buffer.from(
            signature
        );


    const expectedBuffer =
        Buffer.from(
            expectedSignature
        );


    /*
     * timingSafeEqual exige des buffers
     * de même longueur.
     */
    if (
        receivedBuffer.length !==
        expectedBuffer.length
    ) {
        return null;
    }


    if (
        !crypto.timingSafeEqual(
            receivedBuffer,
            expectedBuffer
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


        /*
         * Sécurité supplémentaire :
         * la session doit toujours correspondre
         * à l'ID Twitch administrateur actuel.
         */
        const adminUserId =
            String(
                process.env
                    .TWITCH_ADMIN_USER_ID ||
                ""
            ).trim();


        if (
            !adminUserId ||
            String(
                payload.twitchUserId
            ) !==
            adminUserId
        ) {
            return null;
        }


        return payload;

    } catch {

        return null;
    }
}


/* =========================================================
   LECTURE DES COOKIES
========================================================= */

function parseCookies(
    request
) {

    const cookieHeader =
        request?.headers?.cookie ||
        "";


    const cookies = {};


    cookieHeader
        .split(";")
        .map(
            (cookie) =>
                cookie.trim()
        )
        .filter(Boolean)
        .forEach(
            (cookie) => {

                const separatorIndex =
                    cookie.indexOf("=");


                if (
                    separatorIndex <
                    0
                ) {
                    return;
                }


                const name =
                    cookie
                        .slice(
                            0,
                            separatorIndex
                        )
                        .trim();


                const rawValue =
                    cookie
                        .slice(
                            separatorIndex +
                            1
                        )
                        .trim();


                if (!name) {
                    return;
                }


                try {

                    cookies[
                        name
                    ] =
                        decodeURIComponent(
                            rawValue
                        );

                } catch {

                    cookies[
                        name
                    ] =
                        rawValue;

                }

            }
        );


    return cookies;
}


/* =========================================================
   RÉCUPÉRER LA SESSION ADMIN
========================================================= */

/**
 * Retourne la session admin depuis la requête.
 *
 * @param {object} request
 * @returns {object|null}
 */
export function getAdminSession(
    request
) {

    const cookies =
        parseCookies(
            request
        );


    const token =
        cookies[
            COOKIE_NAME
        ];


    return verifyAdminSession(
        token
    );
}


/* =========================================================
   COOKIE DE SESSION
========================================================= */

/**
 * Crée le cookie de connexion admin.
 *
 * @param {string} token
 * @returns {string}
 */
export function createSessionCookie(
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
   COOKIE DE DÉCONNEXION
========================================================= */

/**
 * Supprime le cookie admin.
 *
 * @returns {string}
 */
export function createLogoutCookie() {

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
   PROTECTION D'UNE ROUTE ADMIN
========================================================= */

/**
 * Vérifie qu'une requête provient d'un admin connecté.
 *
 * Si ce n'est pas le cas, la réponse 401 est envoyée.
 *
 * @param {object} request
 * @param {object} response
 * @returns {object|null}
 */
export function requireAdmin(
    request,
    response
) {

    let session;


    try {

        session =
            getAdminSession(
                request
            );

    } catch (error) {

        console.error(
            "[Admin Auth] Erreur de vérification de session :",
            error
        );


        response
            .status(500)
            .json({
                authenticated:
                    false,

                error:
                    "Erreur interne d'authentification."
            });


        return null;
    }


    if (!session) {

        response
            .status(401)
            .json({
                authenticated:
                    false,

                error:
                    "Authentification administrateur requise."
            });


        return null;
    }


    return session;
}


/* =========================================================
   INFORMATIONS PUBLIQUES DE L'ADMIN
========================================================= */

/**
 * Transforme une session en données sûres
 * à envoyer au navigateur.
 *
 * @param {object} session
 * @returns {object|null}
 */
export function getPublicAdminUser(
    session
) {

    if (!session) {
        return null;
    }


    return {

        id:
            session.twitchUserId,

        login:
            session.login,

        displayName:
            session.displayName,

        profileImageUrl:
            session.profileImageUrl

    };
}