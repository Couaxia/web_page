"use strict";

/* =========================================================
   API ADMIN — SIGNATURE UPLOAD ILLUSTRATION
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
    50 * 1024 * 1024;


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
 * Retourne le body de la requête.
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
 * Retourne une extension à partir du MIME.
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
 * Ajoute une extension si nécessaire.
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
 * Retourne image ou video.
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
 * Formate une taille en octets.
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
       AUTH ADMIN
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


        const fileSize =
            Number(
                body.fileSize ??
                body.file_size ??
                0
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
           VALIDATION — NOM
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
           VALIDATION — TAILLE
        ================================================== */

        if (
            !Number.isFinite(
                fileSize
            ) ||
            fileSize <= 0
        ) {

            response
                .status(400)
                .json({

                    success:
                        false,

                    error:
                        "La taille du fichier est invalide."

                });


            return;
        }


        if (
            fileSize >
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
                        fileSize,

                    receivedSizeFormatted:
                        formatFileSize(
                            fileSize
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


        const storagePath =
            `${safeArtId}/${safeFilename}`;


        /* =================================================
           SIGNED UPLOAD URL
        ================================================== */

        const {
            data: signedData,
            error: signedError
        } =
            await supabaseAdmin
                .storage
                .from(
                    ARTWORKS_BUCKET
                )
                .createSignedUploadUrl(
                    storagePath,
                    {
                        upsert:
                            true
                    }
                );


        if (
            signedError
        ) {

            console.error(
                "[Gallery Upload] Signed URL :",
                signedError
            );


            response
                .status(500)
                .json({

                    success:
                        false,

                    error:
                        signedError?.message ||
                        "Impossible de préparer l'envoi du fichier."

                });


            return;
        }


        if (
            !signedData?.token
        ) {

            console.error(
                "[Gallery Upload] Token absent :",
                signedData
            );


            response
                .status(500)
                .json({

                    success:
                        false,

                    error:
                        "La signature d'upload n'a pas été retournée."

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
                    storagePath
                );


        const publicUrl =
            publicUrlData
                ?.publicUrl ||
            "";


        /* =================================================
           LOG
        ================================================== */

        console.info(
            "[Gallery Upload] Signature créée :",
            {
                artId,
                filename,
                storagePath,
                mimeType,
                mediaType:
                    getMediaType(
                        mimeType
                    ),
                fileSize,
                fileSizeFormatted:
                    formatFileSize(
                        fileSize
                    )
            }
        );


        /* =================================================
           RÉPONSE
        ================================================== */

        response
            .status(200)
            .json({

                success:
                    true,

                upload: {

                    bucket:
                        ARTWORKS_BUCKET,

                    path:
                        storagePath,

                    token:
                        signedData.token,

                    signedUrl:
                        signedData.signedUrl ??
                        null,

                    publicUrl,

                    filename:
                        safeFilename,

                    originalFilename:
                        filename,

                    mimeType,

                    mediaType:
                        getMediaType(
                            mimeType
                        ),

                    size:
                        fileSize,

                    sizeFormatted:
                        formatFileSize(
                            fileSize
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
                    "Erreur interne pendant la préparation de l'upload."

            });
    }
}