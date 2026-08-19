"use strict";

/* =========================================================
   ADMIN — ANNONCES & NOUVEAUTÉS
   COUAXIA
========================================================= */

import {
    supabaseAdmin
} from "../_lib/supabase.js";

import {
    requireAdminSession
} from "../_lib/admin-auth.js";


/* =========================================================
   CONSTANTES
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


/* =========================================================
   OUTILS
========================================================= */

function normalizeText(
    value
) {

    return String(
        value ??
        ""
    ).trim();
}


function normalizeNullableText(
    value
) {

    const text =
        normalizeText(
            value
        );


    return text ||
        null;
}


function normalizeBoolean(
    value
) {

    return value === true;
}


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


    return "announcement";
}


function normalizeDateForDatabase(
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


function getRequestBody(
    request
) {

    if (
        request?.body &&
        typeof request.body ===
            "object"
    ) {

        return request.body;
    }


    return {};
}


/* =========================================================
   VALIDATION ID
========================================================= */

function getAnnouncementId(
    request
) {

    return normalizeText(
        request?.query?.id ??
        request?.body?.id
    );
}


/* =========================================================
   VALIDATION
========================================================= */

function validateAnnouncementPayload(
    payload
) {

    if (
        !payload.title
    ) {

        return "Le titre de l'annonce est obligatoire.";
    }


    if (
        !ANNOUNCEMENT_TYPES.has(
            payload.type
        )
    ) {

        return "Le type de l'annonce est invalide.";
    }


    if (
        payload.published_at &&
        payload.expires_at
    ) {

        const publishedAt =
            new Date(
                payload.published_at
            )
                .getTime();


        const expiresAt =
            new Date(
                payload.expires_at
            )
                .getTime();


        if (
            Number.isFinite(
                publishedAt
            ) &&
            Number.isFinite(
                expiresAt
            ) &&
            expiresAt <=
            publishedAt
        ) {

            return "La date d'expiration doit être postérieure à la date de publication.";
        }
    }


    return null;
}


/* =========================================================
   FORMAT BDD
========================================================= */

function buildAnnouncementPayload(
    body,
    {
        forUpdate = false
    } = {}
) {

    const payload = {};


    if (
        !forUpdate ||
        Object.prototype.hasOwnProperty.call(
            body,
            "type"
        )
    ) {

        payload.type =
            normalizeType(
                body.type
            );
    }


    if (
        !forUpdate ||
        Object.prototype.hasOwnProperty.call(
            body,
            "title"
        )
    ) {

        payload.title =
            normalizeText(
                body.title
            );
    }


    if (
        !forUpdate ||
        Object.prototype.hasOwnProperty.call(
            body,
            "message"
        )
    ) {

        payload.message =
            normalizeText(
                body.message
            );
    }


    if (
        !forUpdate ||
        Object.prototype.hasOwnProperty.call(
            body,
            "icon"
        )
    ) {

        payload.icon =
            normalizeNullableText(
                body.icon
            );
    }


    if (
        !forUpdate ||
        Object.prototype.hasOwnProperty.call(
            body,
            "imageUrl"
        ) ||
        Object.prototype.hasOwnProperty.call(
            body,
            "image_url"
        )
    ) {

        payload.image_url =
            normalizeNullableText(
                body.imageUrl ??
                body.image_url
            );
    }


    if (
        !forUpdate ||
        Object.prototype.hasOwnProperty.call(
            body,
            "linkUrl"
        ) ||
        Object.prototype.hasOwnProperty.call(
            body,
            "link_url"
        )
    ) {

        payload.link_url =
            normalizeNullableText(
                body.linkUrl ??
                body.link_url
            );
    }


    if (
        !forUpdate ||
        Object.prototype.hasOwnProperty.call(
            body,
            "linkLabel"
        ) ||
        Object.prototype.hasOwnProperty.call(
            body,
            "link_label"
        )
    ) {

        payload.link_label =
            normalizeNullableText(
                body.linkLabel ??
                body.link_label
            );
    }


    if (
        !forUpdate ||
        Object.prototype.hasOwnProperty.call(
            body,
            "isPublished"
        ) ||
        Object.prototype.hasOwnProperty.call(
            body,
            "is_published"
        )
    ) {

        payload.is_published =
            normalizeBoolean(
                body.isPublished ??
                body.is_published
            );
    }


    if (
        !forUpdate ||
        Object.prototype.hasOwnProperty.call(
            body,
            "isPinned"
        ) ||
        Object.prototype.hasOwnProperty.call(
            body,
            "is_pinned"
        )
    ) {

        payload.is_pinned =
            normalizeBoolean(
                body.isPinned ??
                body.is_pinned
            );
    }


    if (
        !forUpdate ||
        Object.prototype.hasOwnProperty.call(
            body,
            "isImportant"
        ) ||
        Object.prototype.hasOwnProperty.call(
            body,
            "is_important"
        )
    ) {

        payload.is_important =
            normalizeBoolean(
                body.isImportant ??
                body.is_important
            );
    }


    if (
        !forUpdate ||
        Object.prototype.hasOwnProperty.call(
            body,
            "publishedAt"
        ) ||
        Object.prototype.hasOwnProperty.call(
            body,
            "published_at"
        )
    ) {

        payload.published_at =
            normalizeDateForDatabase(
                body.publishedAt ??
                body.published_at
            );
    }


    if (
        !forUpdate ||
        Object.prototype.hasOwnProperty.call(
            body,
            "expiresAt"
        ) ||
        Object.prototype.hasOwnProperty.call(
            body,
            "expires_at"
        )
    ) {

        payload.expires_at =
            normalizeDateForDatabase(
                body.expiresAt ??
                body.expires_at
            );
    }


    if (
        !forUpdate ||
        Object.prototype.hasOwnProperty.call(
            body,
            "sourceType"
        ) ||
        Object.prototype.hasOwnProperty.call(
            body,
            "source_type"
        )
    ) {

        payload.source_type =
            normalizeNullableText(
                body.sourceType ??
                body.source_type
            );
    }


    if (
        !forUpdate ||
        Object.prototype.hasOwnProperty.call(
            body,
            "sourceId"
        ) ||
        Object.prototype.hasOwnProperty.call(
            body,
            "source_id"
        )
    ) {

        payload.source_id =
            normalizeNullableText(
                body.sourceId ??
                body.source_id
            );
    }


    return payload;
}


/* =========================================================
   FORMAT SORTIE
========================================================= */

function formatAnnouncement(
    announcement
) {

    if (
        !announcement
    ) {

        return null;
    }


    return {

        id:
            announcement.id,

        type:
            announcement.type,

        title:
            announcement.title,

        message:
            announcement.message,

        icon:
            announcement.icon,

        imageUrl:
            announcement.image_url,

        linkUrl:
            announcement.link_url,

        linkLabel:
            announcement.link_label,

        isPublished:
            announcement.is_published ===
            true,

        isPinned:
            announcement.is_pinned ===
            true,

        isImportant:
            announcement.is_important ===
            true,

        publishedAt:
            announcement.published_at,

        expiresAt:
            announcement.expires_at,

        sourceType:
            announcement.source_type,

        sourceId:
            announcement.source_id,

        createdAt:
            announcement.created_at,

        updatedAt:
            announcement.updated_at

    };
}


/* =========================================================
   GET
========================================================= */

async function handleGet(
    request,
    response
) {

    const {
        data,
        error
    } =
        await supabaseAdmin
            .from(
                "announcements"
            )
            .select(
                "*"
            )
            .order(
                "is_pinned",
                {
                    ascending:
                        false
                }
            )
            .order(
                "created_at",
                {
                    ascending:
                        false
                }
            );


    if (
        error
    ) {

        console.error(
            "[Admin Announcements GET]",
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


    const announcements =
        Array.isArray(
            data
        )
            ? data
                .map(
                    formatAnnouncement
                )
                .filter(
                    Boolean
                )
            : [];


    return response
        .status(
            200
        )
        .json({

            success:
                true,

            count:
                announcements.length,

            announcements

        });
}


/* =========================================================
   POST
========================================================= */

async function handlePost(
    request,
    response
) {

    const body =
        getRequestBody(
            request
        );


    const payload =
        buildAnnouncementPayload(
            body
        );


    /* =====================================================
       PUBLICATION IMMÉDIATE
    ====================================================== */

    if (
        payload.is_published ===
        true &&
        !payload.published_at
    ) {

        payload.published_at =
            new Date()
                .toISOString();
    }


    const validationError =
        validateAnnouncementPayload(
            payload
        );


    if (
        validationError
    ) {

        return response
            .status(
                400
            )
            .json({

                success:
                    false,

                error:
                    validationError

            });
    }


    const {
        data,
        error
    } =
        await supabaseAdmin
            .from(
                "announcements"
            )
            .insert(
                payload
            )
            .select(
                "*"
            )
            .single();


    if (
        error
    ) {

        console.error(
            "[Admin Announcements POST]",
            error
        );


        if (
            error.code ===
            "23505"
        ) {

            return response
                .status(
                    409
                )
                .json({

                    success:
                        false,

                    error:
                        "Une annonce liée à cette source existe déjà."

                });
        }


        return response
            .status(
                500
            )
            .json({

                success:
                    false,

                error:
                    "Impossible de créer l'annonce."

            });
    }


    return response
        .status(
            201
        )
        .json({

            success:
                true,

            announcement:
                formatAnnouncement(
                    data
                )

        });
}


/* =========================================================
   PUT
========================================================= */

async function handlePut(
    request,
    response
) {

    const announcementId =
        getAnnouncementId(
            request
        );


    if (
        !announcementId
    ) {

        return response
            .status(
                400
            )
            .json({

                success:
                    false,

                error:
                    "L'ID de l'annonce est obligatoire."

            });
    }


    const body =
        getRequestBody(
            request
        );


    const payload =
        buildAnnouncementPayload(
            body,
            {
                forUpdate:
                    true
            }
        );


    if (
        Object.keys(
            payload
        ).length ===
        0
    ) {

        return response
            .status(
                400
            )
            .json({

                success:
                    false,

                error:
                    "Aucune modification à enregistrer."

            });
    }


    /* =====================================================
       RÉCUPÉRER ANNONCE ACTUELLE
    ====================================================== */

    const {
        data: currentAnnouncement,
        error: currentError
    } =
        await supabaseAdmin
            .from(
                "announcements"
            )
            .select(
                "*"
            )
            .eq(
                "id",
                announcementId
            )
            .maybeSingle();


    if (
        currentError
    ) {

        console.error(
            "[Admin Announcements PUT Current]",
            currentError
        );


        return response
            .status(
                500
            )
            .json({

                success:
                    false,

                error:
                    "Impossible de récupérer l'annonce."

            });
    }


    if (
        !currentAnnouncement
    ) {

        return response
            .status(
                404
            )
            .json({

                success:
                    false,

                error:
                    "Annonce introuvable."

            });
    }


    /* =====================================================
       PUBLICATION IMMÉDIATE
    ====================================================== */

    if (
        payload.is_published ===
            true &&
        !payload.published_at &&
        !currentAnnouncement
            .published_at
    ) {

        payload.published_at =
            new Date()
                .toISOString();
    }


    /* =====================================================
       VALIDATION AVEC VALEURS FINALES
    ====================================================== */

    const finalPayload = {

        type:
            payload.type ??
            currentAnnouncement.type,

        title:
            Object.prototype
                .hasOwnProperty
                .call(
                    payload,
                    "title"
                )
                ? payload.title
                : currentAnnouncement.title,

        message:
            Object.prototype
                .hasOwnProperty
                .call(
                    payload,
                    "message"
                )
                ? payload.message
                : currentAnnouncement.message,

        published_at:
            Object.prototype
                .hasOwnProperty
                .call(
                    payload,
                    "published_at"
                )
                ? payload.published_at
                : currentAnnouncement
                    .published_at,

        expires_at:
            Object.prototype
                .hasOwnProperty
                .call(
                    payload,
                    "expires_at"
                )
                ? payload.expires_at
                : currentAnnouncement
                    .expires_at

    };


    const validationError =
        validateAnnouncementPayload(
            finalPayload
        );


    if (
        validationError
    ) {

        return response
            .status(
                400
            )
            .json({

                success:
                    false,

                error:
                    validationError

            });
    }


    /* =====================================================
       UPDATE
    ====================================================== */

    const {
        data,
        error
    } =
        await supabaseAdmin
            .from(
                "announcements"
            )
            .update(
                payload
            )
            .eq(
                "id",
                announcementId
            )
            .select(
                "*"
            )
            .single();


    if (
        error
    ) {

        console.error(
            "[Admin Announcements PUT]",
            error
        );


        if (
            error.code ===
            "23505"
        ) {

            return response
                .status(
                    409
                )
                .json({

                    success:
                        false,

                    error:
                        "Une annonce liée à cette source existe déjà."

                });
        }


        return response
            .status(
                500
            )
            .json({

                success:
                    false,

                error:
                    "Impossible de modifier l'annonce."

            });
    }


    return response
        .status(
            200
        )
        .json({

            success:
                true,

            announcement:
                formatAnnouncement(
                    data
                )

        });
}


/* =========================================================
   DELETE
========================================================= */

async function handleDelete(
    request,
    response
) {

    const announcementId =
        getAnnouncementId(
            request
        );


    if (
        !announcementId
    ) {

        return response
            .status(
                400
            )
            .json({

                success:
                    false,

                error:
                    "L'ID de l'annonce est obligatoire."

            });
    }


    const {
        data,
        error
    } =
        await supabaseAdmin
            .from(
                "announcements"
            )
            .delete()
            .eq(
                "id",
                announcementId
            )
            .select(
                "id"
            )
            .maybeSingle();


    if (
        error
    ) {

        console.error(
            "[Admin Announcements DELETE]",
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
                    "Impossible de supprimer l'annonce."

            });
    }


    if (
        !data
    ) {

        return response
            .status(
                404
            )
            .json({

                success:
                    false,

                error:
                    "Annonce introuvable."

            });
    }


    return response
        .status(
            200
        )
        .json({

            success:
                true,

            deletedId:
                announcementId

        });
}


/* =========================================================
   HANDLER PRINCIPAL
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
       SESSION ADMIN
    ====================================================== */

    try {

        const authenticated =
            await requireAdminSession(
                request,
                response
            );


        if (
            authenticated ===
            false ||
            response.headersSent
        ) {

            return;
        }


    } catch (
        error
    ) {

        console.error(
            "[Admin Announcements Auth]",
            error
        );


        if (
            response.headersSent
        ) {

            return;
        }


        return response
            .status(
                401
            )
            .json({

                success:
                    false,

                error:
                    "Session administrateur requise."

            });
    }


    /* =====================================================
       ROUTAGE
    ====================================================== */

    try {

        switch (
            request.method
        ) {

            case "GET":

                return await handleGet(
                    request,
                    response
                );


            case "POST":

                return await handlePost(
                    request,
                    response
                );


            case "PUT":

                return await handlePut(
                    request,
                    response
                );


            case "DELETE":

                return await handleDelete(
                    request,
                    response
                );


            default:

                response.setHeader(
                    "Allow",
                    "GET, POST, PUT, DELETE"
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


    } catch (
        error
    ) {

        console.error(
            "[Admin Announcements] Erreur inattendue :",
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
                    "Erreur interne dans la gestion des annonces."

            });
    }
}