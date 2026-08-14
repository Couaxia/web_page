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

/*
 * Taille maximale autorisée :
 *
 * 50 Mo
 *
 * Attention :
 * la limite du bucket Supabase doit également
 * être configurée à au moins 50 Mo.
 */
const MAX_FILE_SIZE =
    50 * 1024 * 1024;


/*
 * Formats acceptés dans la galerie.
 *
 * Images :
 * - PNG
 * - JPG / JPEG
 * - WEBP
 * - GIF
 *
 * Vidéos :
 * - MP4
 * - WEBM
 */
const ALLOWED_MIME_TYPES =
    new Set([
        "image/png",
        "image/jpeg",
        "image/webp",
        "image/gif",
        "video/mp4",
        "video/webm"
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
            ".gif",

        "video/mp4":
            ".mp4",

        "video/webm":
            ".webm"

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
 * ou data:video/...;base64,...
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


/**
 * Retourne la catégorie du média.
 *
 * @param {string} mimeType
 * @returns {"image"|"video"}
 */
function getMediaType(
    mimeType
) {

    if (
        mimeType.startsWith(
            "video/"
        )
    ) {

        return "video";
    }


    return "image";
}


/**
 * Retourne une taille lisible.
 *
 * @param {number} bytes
 * @returns {string}
 */
function formatFileSize(
    bytes
) {

    if (
        !Number.isFinite(
            bytes
        ) ||
        bytes <= 0
    ) {

        return "0 octet";
    }


    if (
        bytes <
        1024
    ) {

        return `${bytes} octets`;
    }


    if (
        bytes <
        1024 * 1024
    ) {

        return `${
            (
                bytes /
                1024
            ).toFixed(
                1
            )
        } Ko`;
    }


    return `${
        (
            bytes /
            1024 /
            1024
        ).toFixed(
            1
        )
    } Mo`;
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
           VALIDATION — ID
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


        /* =================================================
           VALIDATION — NOM DU FICHIER
        ================================================== */

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


        /* =================================================
           VALIDATION — MIME
        ================================================== */

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
                        "Format non autorisé. Utilise PNG, JPG, WEBP, GIF, MP4 ou WEBM."

                });


            return;
        }


        /* =================================================
           VALIDATION — CONTENU
        ================================================== */

        if (
            !fileBase64
        ) {

            response
                .status(400)
                .json({

                    success:
                        false,

                    error:
                        "Aucun fichier n'a été reçu."

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


        /* =================================================
           FICHIER VIDE
        ================================================== */

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


        /* =================================================
           TAILLE MAXIMALE
        ================================================== */

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
                        "Le fichier dépasse la limite de 50 Mo.",

                    maximumSize:
                        MAX_FILE_SIZE,

                    maximumSizeFormatted:
                        formatFileSize(
                            MAX_FILE_SIZE
                        ),

                    receivedSize:
                        fileBuffer.length,

                    receivedSizeFormatted:
                        formatFileSize(
                            fileBuffer.length
                        )

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
         *
         * ou :
         *
         * 80/animated-couaxia.mp4
         */

        const storagePath =
            `${safeArtId}/${safeFilename}`;


        /* =================================================
           LOG UPLOAD
        ================================================== */

        console.info(
            "[Gallery Upload] Upload demandé :",
            {
                artId,
                filename,
                safeFilename,
                mimeType,
                mediaType:
                    getMediaType(
                        mimeType
                    ),
                size:
                    fileBuffer.length,
                sizeFormatted:
                    formatFileSize(
                        fileBuffer.length
                    ),
                storagePath
            }
        );


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

                        /*
                         * Si un fichier existe déjà au même
                         * emplacement, il sera remplacé.
                         */
                        upsert:
                            true

                    }
                );


        /* =================================================
           ERREUR STORAGE
        ================================================== */

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
                        "Impossible d'envoyer le fichier dans Supabase Storage."

                });


            return;
        }


        /* =================================================
           CHEMIN RETOURNÉ
        ================================================== */

        const uploadedPath =
            uploadData?.path ||
            storagePath;


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
                    uploadedPath
                );


        const publicUrl =
            publicUrlData
                ?.publicUrl;


        /* =================================================
           URL INTROUVABLE
        ================================================== */

        if (
            !publicUrl
        ) {

            console.error(
                "[Gallery Upload] URL publique introuvable.",
                {
                    uploadData,
                    uploadedPath
                }
            );


            response
                .status(500)
                .json({

                    success:
                        false,

                    error:
                        "Le fichier a été envoyé mais son URL publique est introuvable."

                });


            return;
        }


        /* =================================================
           TYPE DE MÉDIA
        ================================================== */

        const mediaType =
            getMediaType(
                mimeType
            );


        /* =================================================
           LOG SUCCÈS
        ================================================== */

        console.info(
            "[Gallery Upload] Upload réussi :",
            {
                artId,
                path:
                    uploadedPath,
                mimeType,
                mediaType,
                size:
                    fileBuffer.length
            }
        );


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
                        uploadedPath,

                    url:
                        publicUrl,

                    filename:
                        safeFilename,

                    originalFilename:
                        filename,

                    mimeType,

                    mediaType,

                    size:
                        fileBuffer.length,

                    sizeFormatted:
                        formatFileSize(
                            fileBuffer.length
                        )

                }

            });


    } catch (
        error
    ) {

        console.error(
            "[Gallery Upload] Erreur inattendue :",
            error
        );


        /*
         * Évite une seconde réponse Express.
         */
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
                    "Erreur interne pendant l'envoi du fichier."

            });
    }
}