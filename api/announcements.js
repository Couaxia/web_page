"use strict";

/* =========================================================
   API PUBLIQUE — ANNONCES & NOUVEAUTÉS
   COUAXIA
========================================================= */

import {
    supabaseAdmin
} from "./_lib/supabase.js";


/* =========================================================
   OUTILS
========================================================= */

/**
 * Normalise une valeur texte.
 *
 * @param {*} value
 * @returns {string}
 */
function normalizeText(
    value
) {

    return String(
        value ??
        ""
    ).trim();
}


/**
 * Convertit une valeur en booléen.
 *
 * @param {*} value
 * @returns {boolean}
 */
function normalizeBoolean(
    value
) {

    return value ===
        true;
}


/**
 * Retourne une date ISO valide
 * ou null.
 *
 * @param {*} value
 * @returns {string|null}
 */
function normalizeDate(
    value
) {

    const text =
        normalizeText(
            value
        );


    if (
        !text
    ) {

        return null;
    }


    const date =
        new Date(
            text
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return null;
    }


    return date
        .toISOString();
}


/* =========================================================
   TYPES
========================================================= */

const ANNOUNCEMENT_TYPES =
    new Set([
        "announcement",
        "poll",
        "game",
        "artwork",
        "lore",
        "event",
        "stream",
        "other"
    ]);


/**
 * Normalise le type d'annonce.
 *
 * @param {*} value
 * @returns {string}
 */
function normalizeType(
    value
) {

    const type =
        normalizeText(
            value
        )
            .toLowerCase();


    if (
        ANNOUNCEMENT_TYPES.has(
            type
        )
    ) {

        return type;
    }


    return "other";
}


/* =========================================================
   ICÔNES PAR DÉFAUT
========================================================= */

function getDefaultIcon(
    type
) {

    switch (
        type
    ) {

        case "announcement":

            return "📢";


        case "poll":

            return "🗳️";


        case "game":

            return "🎮";


        case "artwork":

            return "🎨";


        case "lore":

            return "📖";


        case "event":

            return "📅";


        case "stream":

            return "🔴";


        default:

            return "✨";
    }
}


/* =========================================================
   FORMATAGE
========================================================= */

function formatAnnouncement(
    announcement
) {

    const type =
        normalizeType(
            announcement?.type
        );


    return {

        id:
            normalizeText(
                announcement?.id
            ),


        type,


        title:
            normalizeText(
                announcement?.title
            ),


        message:
            normalizeText(
                announcement?.message
            ),


        icon:
            normalizeText(
                announcement?.icon
            ) ||
            getDefaultIcon(
                type
            ),


        imageUrl:
            normalizeText(
                announcement?.image_url
            ) ||
            null,


        linkUrl:
            normalizeText(
                announcement?.link_url
            ) ||
            null,


        linkLabel:
            normalizeText(
                announcement?.link_label
            ) ||
            null,


        isPublished:
            normalizeBoolean(
                announcement?.is_published
            ),


        isPinned:
            normalizeBoolean(
                announcement?.is_pinned
            ),


        isImportant:
            normalizeBoolean(
                announcement?.is_important
            ),


        publishedAt:
            normalizeDate(
                announcement?.published_at
            ),


        expiresAt:
            normalizeDate(
                announcement?.expires_at
            ),


        createdAt:
            normalizeDate(
                announcement?.created_at
            ),


        updatedAt:
            normalizeDate(
                announcement?.updated_at
            )

    };
}


/* =========================================================
   PUBLICATION ACTIVE
========================================================= */

/**
 * Vérifie qu'une annonce est actuellement visible.
 *
 * @param {object} announcement
 * @returns {boolean}
 */
function isAnnouncementVisible(
    announcement
) {

    if (
        !announcement
    ) {

        return false;
    }


    if (
        announcement.isPublished !==
        true
    ) {

        return false;
    }


    const now =
        Date.now();


    /* =====================================================
       PAS ENCORE PUBLIÉE
    ====================================================== */

    if (
        announcement.publishedAt
    ) {

        const publishedAt =
            new Date(
                announcement.publishedAt
            )
                .getTime();


        if (
            Number.isFinite(
                publishedAt
            ) &&
            publishedAt >
            now
        ) {

            return false;
        }
    }


    /* =====================================================
       EXPIRÉE
    ====================================================== */

    if (
        announcement.expiresAt
    ) {

        const expiresAt =
            new Date(
                announcement.expiresAt
            )
                .getTime();


        if (
            Number.isFinite(
                expiresAt
            ) &&
            expiresAt <=
            now
        ) {

            return false;
        }
    }


    return true;
}


/* =========================================================
   TRI
========================================================= */

/**
 * Trie :
 *
 * 1. épinglées
 * 2. importantes
 * 3. plus récentes
 */
function sortAnnouncements(
    announcements
) {

    return [
        ...announcements
    ]
        .sort(
            (
                a,
                b
            ) => {

                if (
                    a.isPinned !==
                    b.isPinned
                ) {

                    return a.isPinned
                        ? -1
                        : 1;
                }


                if (
                    a.isImportant !==
                    b.isImportant
                ) {

                    return a.isImportant
                        ? -1
                        : 1;
                }


                const dateA =
                    new Date(
                        a.publishedAt ??
                        a.createdAt ??
                        0
                    )
                        .getTime();


                const dateB =
                    new Date(
                        b.publishedAt ??
                        b.createdAt ??
                        0
                    )
                        .getTime();


                return (
                    dateB -
                    dateA
                );
            }
        );
}


/* =========================================================
   PARAMÈTRES
========================================================= */

function getLimit(
    request
) {

    const rawLimit =
        Number(
            request?.query
                ?.limit
        );


    if (
        !Number.isFinite(
            rawLimit
        )
    ) {

        return 30;
    }


    return Math.min(
        Math.max(
            Math.trunc(
                rawLimit
            ),
            1
        ),
        100
    );
}


/* =========================================================
   HANDLER
========================================================= */

export default async function handler(
    request,
    response
) {

    /* =====================================================
       CACHE
    ====================================================== */

    response.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, max-age=0"
    );


    response.setHeader(
        "Pragma",
        "no-cache"
    );


    response.setHeader(
        "Expires",
        "0"
    );


    /* =====================================================
       MÉTHODE
    ====================================================== */

    if (
        request.method !==
        "GET"
    ) {

        response.setHeader(
            "Allow",
            "GET"
        );


        return response
            .status(
                405
            )
            .json({

                success:
                    false,

                error:
                    "Méthode non autorisée."

            });
    }


    /* =====================================================
       LIMIT
    ====================================================== */

    const limit =
        getLimit(
            request
        );


    /* =====================================================
       CHARGEMENT SUPABASE
    ====================================================== */

    try {

        const {
            data,
            error
        } =
            await supabaseAdmin
                .from(
                    "announcements"
                )
                .select(
                    `
                        id,
                        type,
                        title,
                        message,
                        icon,
                        image_url,
                        link_url,
                        link_label,
                        is_published,
                        is_pinned,
                        is_important,
                        published_at,
                        expires_at,
                        created_at,
                        updated_at
                    `
                )
                .eq(
                    "is_published",
                    true
                )
                .order(
                    "is_pinned",
                    {
                        ascending:
                            false
                    }
                )
                .order(
                    "published_at",
                    {
                        ascending:
                            false,

                        nullsFirst:
                            false
                    }
                )
                .limit(
                    100
                );


        /* =================================================
           ERREUR SUPABASE
        ================================================= */

        if (
            error
        ) {

            console.error(
                "[Public Announcements] Erreur Supabase :",
                error
            );


            return response
                .status(
                    500
                )
                .json({

                    success:
                        false,

                    error:
                        "Impossible de récupérer les annonces."

                });
        }


        /* =================================================
           NORMALISATION
        ================================================= */

        const rawAnnouncements =
            Array.isArray(
                data
            )
                ? data
                : [];


        const announcements =
            sortAnnouncements(
                rawAnnouncements
                    .map(
                        formatAnnouncement
                    )
                    .filter(
                        announcement =>
                            announcement.id &&
                            announcement.title &&
                            isAnnouncementVisible(
                                announcement
                            )
                    )
            )
                .slice(
                    0,
                    limit
                );


        /* =================================================
           IMPORTANTES
        ================================================= */

        const importantAnnouncements =
            announcements
                .filter(
                    announcement =>
                        announcement.isImportant
                );


        /* =================================================
           RÉPONSE
        ================================================= */

        return response
            .status(
                200
            )
            .json({

                success:
                    true,

                count:
                    announcements.length,

                importantCount:
                    importantAnnouncements.length,

                announcements

            });


    } catch (
        error
    ) {

        console.error(
            "[Public Announcements] Erreur inattendue :",
            error
        );


        if (
            response.headersSent
        ) {

            return;
        }


        return response
            .status(
                500
            )
            .json({

                success:
                    false,

                error:
                    "Erreur interne lors du chargement des annonces."

            });
    }
}