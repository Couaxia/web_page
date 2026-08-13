"use strict";

/* =========================================================
   API ADMIN — UPLOAD ILLUSTRATION
   COUAXIA
========================================================= */

import {
    requireAdmin
} from "../_lib/admin-auth.js";

import {
    supabaseAdmin
} from "../_lib/supabase.js";


/* =========================================================
   CONFIGURATION
========================================================= */

const ARTWORKS_BUCKET =
    "artworks";


const MAX_FILE_SIZE =
    10 * 1024 * 1024;


const ALLOWED_MIME_TYPES =
    new Set([
        "image/png",
        "image/jpeg",
        "image/webp",
        "image/gif"
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


/**
 * Nettoie un identifiant pour l'utiliser
 * dans un chemin Supabase Storage.
 */
function sanitizePathSegment(
    value
) {

    return normalizeText(
        value
    )
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace(
            /[^a-z0-9_-]+/g,
            "-"
        )
        .replace(
            /^-+|-+$/g,
            ""
        );
}


/**
 * Nettoie le nom du fichier.
 */
function sanitizeFilename(
    filename
) {

    const raw =
        normalizeText(
            filename
        );


    if (!raw) {
        return "artwork";
    }


    const dotIndex =
        raw.lastIndexOf(".");


    let base =
        dotIndex >= 0
            ? raw.slice(
                0,
                dotIndex
            )
            : raw;


    let extension =
        dotIndex >= 0
            ? raw.slice(
                dotIndex
            )
            : "";


    base =
        sanitizePathSegment(
            base
        ) ||
        "artwork";


    extension =
        extension
            .toLowerCase()
            .replace(
                /[^a-z0-9.]/g,
                ""
            );


    return (
        base +
        extension
    );
}


/* =========================================================
   LECTURE DU BODY
========================================================= */

/*
 * Cette version attend un fichier envoyé
 * en base64 depuis admin.js.
 *
 * Format attendu :
 *
 * {
 *   artId: "05",
 *   filename: "EilionFate_panels.png",
 *   mimeType: "image/png",
 *   fileBase64: "iVBORw0KGgo..."
 * }
 */


/* =========================================================
   HANDLER
========================================================= */

export default async function handler(
    request,
    response
) {

    /* =====================================================
       PROTECTION ADMIN
    ====================================================== */

    const admin =
        requireAdmin(
            request,
            response
        );


    if (!admin) {
        return;
    }


    /* =====================================================
       MÉTHODE
    ====================================================== */

    if (
        request.method !==
        "POST"
    ) {

        response.setHeader(
            "Allow",
            "POST"
        );


        response
            .status(405)
            .json({
                error:
                    "Méthode non autorisée."
            });


        return;
    }


    try {

        /* =================================================
           DONNÉES ENTRANTES
        ================================================== */

        const artId =
            normalizeText(
                request.body
                    ?.artId
            );


        const filename =
            normalizeText(
                request.body
                    ?.filename
            );


        const mimeType =
            normalizeText(
                request.body
                    ?.mimeType
            );


        const fileBase64 =
            normalizeText(
                request.body
                    ?.fileBase64
            );


        /* =================================================
           VALIDATION
        ================================================== */

        if (!artId) {

            response
                .status(400)
                .json({
                    error:
                        "L'ID de l'œuvre est obligatoire."
                });


            return;
        }


        if (!filename) {

            response
                .status(400)
                .json({
                    error:
                        "Le nom du fichier est obligatoire."
                });


            return;
        }


        if (!mimeType) {

            response
                .status(400)
                .json({
                    error:
                        "Le type du fichier est obligatoire."
                });


            return;
        }


        if (
            !ALLOWED_MIME_TYPES.has(
                mimeType
            )
        ) {

            response
                .status(400)
                .json({
                    error:
                        "Format non autorisé. Utilise PNG, JPG, WEBP ou GIF."
                });


            return;
        }


        if (!fileBase64) {

            response
                .status(400)
                .json({
                    error:
                        "Aucune image n'a été reçue."
                });


            return;
        }


        /* =================================================
           CONVERSION BASE64 -> BUFFER
        ================================================== */

        let fileBuffer;


        try {

            fileBuffer =
                Buffer.from(
                    fileBase64,
                    "base64"
                );

        } catch {

            response
                .status(400)
                .json({
                    error:
                        "Le fichier envoyé est invalide."
                });


            return;
        }


        if (
            fileBuffer.length ===
            0
        ) {

            response
                .status(400)
                .json({
                    error:
                        "Le fichier envoyé est vide."
                });


            return;
        }


        if (
            fileBuffer.length >
            MAX_FILE_SIZE
        ) {

            response
                .status(413)
                .json({
                    error:
                        "L'image dépasse la limite de 10 Mo."
                });


            return;
        }


        /* =================================================
           CHEMIN STORAGE
        ================================================== */

        const safeArtId =
            sanitizePathSegment(
                artId
            );


        const safeFilename =
            sanitizeFilename(
                filename
            );


        if (!safeArtId) {

            response
                .status(400)
                .json({
                    error:
                        "L'ID de l'œuvre est invalide."
                });


            return;
        }


        /*
         * Exemple :
         *
         * 05/eilionfate-panels.png
         */

        const storagePath =
            `${safeArtId}/${safeFilename}`;


        /* =================================================
           UPLOAD SUPABASE
        ================================================== */

        const {
            data:
                uploadData,
            error:
                uploadError
        } =
            await supabaseAdmin
                .storage
                .from(
                    ARTWORKS_BUCKET
                )
                .upload(
                    storagePath,
                    fileBuffer,
                    {
                        contentType:
                            mimeType,

                        cacheControl:
                            "3600",

                        upsert:
                            true
                    }
                );


        if (uploadError) {

            console.error(
                "[Gallery Upload] Supabase Storage :",
                uploadError
            );


            response
                .status(500)
                .json({
                    error:
                        "Impossible d'envoyer l'image dans Supabase Storage."
                });


            return;
        }


        /* =================================================
           URL PUBLIQUE
        ================================================== */

        const {
            data:
                publicUrlData
        } =
            supabaseAdmin
                .storage
                .from(
                    ARTWORKS_BUCKET
                )
                .getPublicUrl(
                    uploadData.path
                );


        const publicUrl =
            publicUrlData
                ?.publicUrl;


        if (!publicUrl) {

            console.error(
                "[Gallery Upload] URL publique introuvable.",
                {
                    uploadData
                }
            );


            response
                .status(500)
                .json({
                    error:
                        "L'image a été envoyée mais son URL publique est introuvable."
                });


            return;
        }


        /* =================================================
           RÉPONSE
        ================================================== */

        response
            .status(201)
            .json({
                success:
                    true,

                file: {
                    bucket:
                        ARTWORKS_BUCKET,

                    path:
                        uploadData.path,

                    url:
                        publicUrl,

                    filename:
                        safeFilename,

                    mimeType,

                    size:
                        fileBuffer.length
                }
            });

    } catch (error) {

        console.error(
            "[Gallery Upload] Erreur inattendue :",
            error
        );


        response
            .status(500)
            .json({
                error:
                    "Erreur interne pendant l'envoi de l'image."
            });
    }
}