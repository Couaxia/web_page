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

/**
 * Transforme une valeur en texte propre.
 *
 * @param {unknown} value
 * @returns {string}
 */
function normalizeText(
    value
) {

    return String(
        value ?? ""
    ).trim();
}


/**
 * Retourne le body d'une requête.
 *
 * Compatible Express / serverless.
 *
 * @param {object} request
 * @returns {object}
 */
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


/**
 * Nettoie un segment de chemin Storage.
 *
 * @param {unknown} value
 * @returns {string}
 */
function sanitizePathSegment(
    value
) {

    return normalizeText(
        value
    )
        .toLowerCase()
        .normalize(
            "NFD"
        )
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
 *
 * @param {unknown} filename
 * @returns {string}
 */
function sanitizeFilename(
    filename
) {

    const raw =
        normalizeText(
            filename
        );


    if (
        !raw
    ) {

        return "artwork";
    }


    const dotIndex =
        raw.lastIndexOf(
            "."
        );


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


/**
 * Retourne une extension correspondant
 * au MIME si le fichier n'en contient pas.
 *
 * @param {string} mimeType
 * @returns {string}
 */
function getExtensionFromMimeType(
    mimeType
) {

    const extensions = {

        "image/png":
            ".png",

        "image/jpeg":
            ".jpg",

        "image/webp":
            ".webp",

        "image/gif":
            ".gif"

    };


    return (
        extensions[mimeType] ||
        ""
    );
}


/**
 * S'assure que le nom possède une extension.
 *
 * @param {string} filename
 * @param {string} mimeType
 * @returns {string}
 */
function ensureFileExtension(
    filename,
    mimeType
) {

    if (
        filename.includes(
            "."
        )
    ) {

        return filename;
    }


    return (
        filename +
        getExtensionFromMimeType(
            mimeType
        )
    );
}


/**
 * Nettoie éventuellement le préfixe
 * data:image/...;base64,...
 *
 * @param {string} value
 * @returns {string}
 */
function cleanBase64(
    value
) {

    const text =
        normalizeText(
            value
        );


    if (
        !text
    ) {

        return "";
    }


    const commaIndex =
        text.indexOf(
            ","
        );


    if (
        text.startsWith(
            "data:"
        ) &&
        commaIndex >= 0
    ) {

        return text.slice(
            commaIndex + 1
        );
    }


    return text;
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
        "no-store, max-age=0"
    );


    /* =====================================================
       PROTECTION ADMIN
    ====================================================== */

    const admin =
        requireAdmin(
            request,
            response
        );


    if (
        !admin
    ) {

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
                success:
                    false,

                error:
                    "Méthode non autorisée."
            });


        return;
    }


    try {

        /* =================================================
           BODY
        ================================================== */

        const body =
            getRequestBody(
                request
            );


        const artId =
            normalizeText(
                body.artId ??
                body.art_id
            );


        const filename =
            normalizeText(
                body.filename
            );


        const mimeType =
            normalizeText(
                body.mimeType ??
                body.mime_type
            )
                .toLowerCase();


        const fileBase64 =
            cleanBase64(
                body.fileBase64 ??
                body.file_base64
            );


        /* =================================================
           VALIDATION
        ================================================== */

        if (
            !artId
        ) {

            response
                .status(400)
                .json({
                    success:
                        false,

                    error:
                        "L'ID de l'œuvre est obligatoire."
                });


            return;
        }


        if (
            !filename
        ) {

            response
                .status(400)
                .json({
                    success:
                        false,

                    error:
                        "Le nom du fichier est obligatoire."
                });


            return;
        }


        if (
            !mimeType
        ) {

            response
                .status(400)
                .json({
                    success:
                        false,

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
                    success:
                        false,

                    error:
                        "Format non autorisé. Utilise PNG, JPG, WEBP ou GIF."
                });


            return;
        }


        if (
            !fileBase64
        ) {

            response
                .status(400)
                .json({
                    success:
                        false,

                    error:
                        "Aucune image n'a été reçue."
                });


            return;
        }


        /* =================================================
           BASE64 -> BUFFER
        ================================================== */

        let fileBuffer;


        try {

            fileBuffer =
                Buffer.from(
                    fileBase64,
                    "base64"
                );

        } catch (
            error
        ) {

            console.error(
                "[Gallery Upload] Base64 invalide :",
                error
            );


            response
                .status(400)
                .json({
                    success:
                        false,

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
                    success:
                        false,

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
                    success:
                        false,

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


        if (
            !safeArtId
        ) {

            response
                .status(400)
                .json({
                    success:
                        false,

                    error:
                        "L'ID de l'œuvre est invalide."
                });


            return;
        }


        let safeFilename =
            sanitizeFilename(
                filename
            );


        safeFilename =
            ensureFileExtension(
                safeFilename,
                mimeType
            );


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
            data: uploadData,
            error: uploadError
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


        if (
            uploadError
        ) {

            console.error(
                "[Gallery Upload] Supabase Storage :",
                uploadError
            );


            response
                .status(500)
                .json({
                    success:
                        false,

                    error:
                        uploadError?.message ||
                        "Impossible d'envoyer l'image dans Supabase Storage."
                });


            return;
        }


        /* =================================================
           URL PUBLIQUE
        ================================================== */

        const {
            data: publicUrlData
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


        if (
            !publicUrl
        ) {

            console.error(
                "[Gallery Upload] URL publique introuvable.",
                {
                    uploadData
                }
            );


            response
                .status(500)
                .json({
                    success:
                        false,

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


    } catch (
        error
    ) {

        console.error(
            "[Gallery Upload] Erreur inattendue :",
            error
        );


        if (
            response.headersSent
        ) {

            return;
        }


        response
            .status(500)
            .json({
                success:
                    false,

                error:
                    error?.message ||
                    "Erreur interne pendant l'envoi de l'image."
            });
    }
}