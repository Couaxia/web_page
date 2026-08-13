"use strict";

/* =========================================================
   API ADMIN — GALERIE / ARTWORKS
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

const TABLE_NAME =
    "artworks";

const STORAGE_BUCKET =
    "artworks";

const ALLOWED_MEDIA_TYPES =
    new Set([
        "image",
        "gif",
        "video"
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
 * Retourne null pour un texte vide.
 *
 * @param {unknown} value
 * @returns {string|null}
 */
function normalizeNullableText(
    value
) {

    const text =
        normalizeText(
            value
        );

    return (
        text ||
        null
    );
}


/**
 * Retourne le body de la requête.
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
 * Transforme une valeur en tableau.
 *
 * Accepte :
 *
 * ["couaxia", "stream"]
 * "couaxia, stream"
 * "couaxia|stream"
 *
 * @param {unknown} value
 * @returns {string[]}
 */
function normalizeArray(
    value
) {

    if (
        Array.isArray(
            value
        )
    ) {

        return [
            ...new Set(
                value
                    .map(
                        item =>
                            normalizeText(
                                item
                            )
                    )
                    .filter(Boolean)
            )
        ];
    }


    const text =
        normalizeText(
            value
        );


    if (
        !text
    ) {

        return [];
    }


    return [
        ...new Set(
            text
                .split(/[|,]/)
                .map(
                    item =>
                        item.trim()
                )
                .filter(Boolean)
        )
    ];
}


/**
 * Normalise les tags.
 *
 * @param {unknown} value
 * @returns {string[]}
 */
function normalizeTags(
    value
) {

    return normalizeArray(
        value
    )
        .map(
            tag =>
                tag.toLowerCase()
        );
}


/**
 * Convertit en booléen.
 *
 * @param {unknown} value
 * @param {boolean} defaultValue
 * @returns {boolean}
 */
function normalizeBoolean(
    value,
    defaultValue = false
) {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {

        return defaultValue;
    }


    if (
        typeof value ===
        "boolean"
    ) {

        return value;
    }


    if (
        typeof value ===
        "number"
    ) {

        return (
            value !==
            0
        );
    }


    const normalized =
        String(
            value
        )
            .trim()
            .toLowerCase();


    if (
        [
            "true",
            "1",
            "yes",
            "oui",
            "on"
        ].includes(
            normalized
        )
    ) {

        return true;
    }


    if (
        [
            "false",
            "0",
            "no",
            "non",
            "off"
        ].includes(
            normalized
        )
    ) {

        return false;
    }


    return defaultValue;
}


/**
 * Convertit en entier.
 *
 * @param {unknown} value
 * @param {number} defaultValue
 * @returns {number}
 */
function normalizeInteger(
    value,
    defaultValue = 0
) {

    const number =
        Number.parseInt(
            String(
                value ?? ""
            ),
            10
        );


    return Number.isFinite(
        number
    )
        ? number
        : defaultValue;
}


/**
 * Vérifie une URL HTTP/HTTPS facultative.
 *
 * @param {string|null} value
 * @returns {boolean}
 */
function isValidOptionalUrl(
    value
) {

    if (
        !value
    ) {

        return true;
    }


    try {

        const url =
            new URL(
                value
            );


        return (
            url.protocol ===
                "http:" ||
            url.protocol ===
                "https:"
        );

    } catch {

        return false;
    }
}


/* =========================================================
   FORMATAGE ARTWORK
========================================================= */

/**
 * Construit une œuvre au format Supabase.
 *
 * @param {object} body
 * @returns {object}
 */
function buildArtwork(
    body = {}
) {

    return {

        art_id:
            normalizeText(
                body.art_id ??
                body.artId
            ),

        artist:
            normalizeText(
                body.artist
            ),

        artist_role:
            normalizeNullableText(
                body.artist_role ??
                body.artistRole
            ),

        description:
            normalizeNullableText(
                body.description
            ),

        image_url:
            normalizeText(
                body.image_url ??
                body.imageUrl
            ),

        image_alt:
            normalizeNullableText(
                body.image_alt ??
                body.imageAlt
            ),

        media_type:
            normalizeText(
                body.media_type ??
                body.mediaType ??
                "image"
            )
                .toLowerCase(),

        tags:
            normalizeTags(
                body.tags
            ),

        image_messages:
            normalizeArray(
                body.image_messages ??
                body.imageMessages
            ),

        artist_url:
            normalizeNullableText(
                body.artist_url ??
                body.artistUrl
            ),

        button_text:
            normalizeText(
                body.button_text ??
                body.buttonText ??
                "Voir son profil"
            ) ||
            "Voir son profil",

        button_messages:
            normalizeArray(
                body.button_messages ??
                body.buttonMessages
            ),

        sensitive:
            normalizeBoolean(
                body.sensitive,
                false
            ),

        favorite_enabled:
            normalizeBoolean(
                body.favorite_enabled ??
                body.favoriteEnabled,
                true
            ),

        visible:
            normalizeBoolean(
                body.visible,
                true
            ),

        sort_order:
            normalizeInteger(
                body.sort_order ??
                body.sortOrder,
                0
            )

    };
}


/* =========================================================
   VALIDATION
========================================================= */

/**
 * Valide une œuvre.
 *
 * @param {object} artwork
 * @returns {string|null}
 */
function validateArtwork(
    artwork
) {

    if (
        !artwork.art_id
    ) {

        return (
            "L'ID de l'œuvre est obligatoire."
        );
    }


    if (
        !artwork.artist
    ) {

        return (
            "Le nom de l'artiste est obligatoire."
        );
    }


    if (
        !artwork.image_url
    ) {

        return (
            "Une image est obligatoire."
        );
    }


    if (
        !ALLOWED_MEDIA_TYPES.has(
            artwork.media_type
        )
    ) {

        return (
            "Le type de média est invalide."
        );
    }


    if (
        !isValidOptionalUrl(
            artwork.artist_url
        )
    ) {

        return (
            "Le lien de l'artiste est invalide."
        );
    }


    return null;
}


/* =========================================================
   ERREURS SUPABASE
========================================================= */

function getSupabaseErrorMessage(
    error
) {

    if (
        error?.code ===
        "23505"
    ) {

        return (
            "Une œuvre utilise déjà cet ID."
        );
    }


    return (
        error?.message ||
        "Une erreur Supabase est survenue."
    );
}


/* =========================================================
   STORAGE
========================================================= */

/**
 * Retourne le chemin interne du bucket
 * à partir d'une URL publique Supabase.
 *
 * @param {string|null} imageUrl
 * @returns {string|null}
 */
function getStoragePathFromPublicUrl(
    imageUrl
) {

    const url =
        normalizeText(
            imageUrl
        );


    if (
        !url
    ) {

        return null;
    }


    const marker =
        `/storage/v1/object/public/${STORAGE_BUCKET}/`;


    const markerIndex =
        url.indexOf(
            marker
        );


    if (
        markerIndex ===
        -1
    ) {

        return null;
    }


    const encodedPath =
        url.slice(
            markerIndex +
            marker.length
        );


    if (
        !encodedPath
    ) {

        return null;
    }


    try {

        return decodeURIComponent(
            encodedPath
        );

    } catch {

        return encodedPath;
    }
}


/**
 * Supprime un fichier Storage.
 *
 * Une erreur Storage ne bloque pas
 * la suppression de la ligne Supabase.
 *
 * @param {string|null} imageUrl
 */
async function removeArtworkFile(
    imageUrl
) {

    const storagePath =
        getStoragePathFromPublicUrl(
            imageUrl
        );


    if (
        !storagePath
    ) {

        return;
    }


    const {
        error
    } =
        await supabaseAdmin
            .storage
            .from(
                STORAGE_BUCKET
            )
            .remove([
                storagePath
            ]);


    if (
        error
    ) {

        console.error(
            "[Admin Gallery Storage] Suppression impossible :",
            error
        );
    }
}


/* =========================================================
   GET
========================================================= */

async function handleGet(
    response
) {

    const {
        data,
        error
    } =
        await supabaseAdmin
            .from(
                TABLE_NAME
            )
            .select("*")
            .order(
                "sort_order",
                {
                    ascending:
                        true
                }
            )
            .order(
                "created_at",
                {
                    ascending:
                        true
                }
            );


    if (
        error
    ) {

        console.error(
            "[Admin Gallery GET] Supabase :",
            error
        );


        response
            .status(500)
            .json({
                success:
                    false,

                error:
                    getSupabaseErrorMessage(
                        error
                    )
            });


        return;
    }


    response
        .status(200)
        .json({

            success:
                true,

            artworks:
                Array.isArray(
                    data
                )
                    ? data
                    : []

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


    const artwork =
        buildArtwork(
            body
        );


    const validationError =
        validateArtwork(
            artwork
        );


    if (
        validationError
    ) {

        response
            .status(400)
            .json({
                success:
                    false,

                error:
                    validationError
            });


        return;
    }


    /* =====================================================
       VÉRIFIER SI art_id EXISTE DÉJÀ
    ====================================================== */

    const {
        data: existingArtwork,
        error: existingError
    } =
        await supabaseAdmin
            .from(
                TABLE_NAME
            )
            .select(
                "id"
            )
            .eq(
                "art_id",
                artwork.art_id
            )
            .maybeSingle();


    if (
        existingError
    ) {

        console.error(
            "[Admin Gallery POST] Vérification doublon :",
            existingError
        );


        response
            .status(500)
            .json({
                success:
                    false,

                error:
                    "Impossible de vérifier si cette œuvre existe déjà."
            });


        return;
    }


    if (
        existingArtwork
    ) {

        response
            .status(409)
            .json({
                success:
                    false,

                error:
                    "Une œuvre utilise déjà cet ID."
            });


        return;
    }


    /* =====================================================
       INSERT
    ====================================================== */

    const now =
        new Date()
            .toISOString();


    const payload = {

        ...artwork,

        created_at:
            now,

        updated_at:
            now

    };


    const {
        data,
        error
    } =
        await supabaseAdmin
            .from(
                TABLE_NAME
            )
            .insert(
                payload
            )
            .select()
            .single();


    if (
        error
    ) {

        console.error(
            "[Admin Gallery POST] Supabase :",
            error
        );


        response
            .status(
                error.code ===
                    "23505"
                    ? 409
                    : 500
            )
            .json({
                success:
                    false,

                error:
                    getSupabaseErrorMessage(
                        error
                    )
            });


        return;
    }


    response
        .status(201)
        .json({

            success:
                true,

            artwork:
                data

        });
}


/* =========================================================
   PUT
========================================================= */

async function handlePut(
    request,
    response
) {

    const body =
        getRequestBody(
            request
        );


    const id =
        normalizeText(
            body.id
        );


    if (
        !id
    ) {

        response
            .status(400)
            .json({
                success:
                    false,

                error:
                    "L'identifiant Supabase de l'œuvre est obligatoire."
            });


        return;
    }


    /* =====================================================
       ANCIENNE ŒUVRE
    ====================================================== */

    const {
        data: previousArtwork,
        error: previousError
    } =
        await supabaseAdmin
            .from(
                TABLE_NAME
            )
            .select("*")
            .eq(
                "id",
                id
            )
            .maybeSingle();


    if (
        previousError
    ) {

        console.error(
            "[Admin Gallery PUT] Lecture ancienne œuvre :",
            previousError
        );


        response
            .status(500)
            .json({
                success:
                    false,

                error:
                    getSupabaseErrorMessage(
                        previousError
                    )
            });


        return;
    }


    if (
        !previousArtwork
    ) {

        response
            .status(404)
            .json({
                success:
                    false,

                error:
                    "Cette œuvre n'existe pas."
            });


        return;
    }


    /* =====================================================
       FUSION
    ====================================================== */

    const artwork =
        buildArtwork({
            ...previousArtwork,
            ...body
        });


    const validationError =
        validateArtwork(
            artwork
        );


    if (
        validationError
    ) {

        response
            .status(400)
            .json({
                success:
                    false,

                error:
                    validationError
            });


        return;
    }


    /* =====================================================
       VÉRIFIER art_id SUR UNE AUTRE ŒUVRE
    ====================================================== */

    const {
        data: duplicateArtwork,
        error: duplicateError
    } =
        await supabaseAdmin
            .from(
                TABLE_NAME
            )
            .select(
                "id"
            )
            .eq(
                "art_id",
                artwork.art_id
            )
            .neq(
                "id",
                id
            )
            .maybeSingle();


    if (
        duplicateError
    ) {

        console.error(
            "[Admin Gallery PUT] Vérification art_id :",
            duplicateError
        );


        response
            .status(500)
            .json({
                success:
                    false,

                error:
                    "Impossible de vérifier l'ID de l'œuvre."
            });


        return;
    }


    if (
        duplicateArtwork
    ) {

        response
            .status(409)
            .json({
                success:
                    false,

                error:
                    "Une œuvre utilise déjà cet ID."
            });


        return;
    }


    /* =====================================================
       UPDATE
    ====================================================== */

    const payload = {

        ...artwork,

        updated_at:
            new Date()
                .toISOString()

    };


    const {
        data,
        error
    } =
        await supabaseAdmin
            .from(
                TABLE_NAME
            )
            .update(
                payload
            )
            .eq(
                "id",
                id
            )
            .select()
            .maybeSingle();


    if (
        error
    ) {

        console.error(
            "[Admin Gallery PUT] Supabase :",
            error
        );


        response
            .status(
                error.code ===
                    "23505"
                    ? 409
                    : 500
            )
            .json({
                success:
                    false,

                error:
                    getSupabaseErrorMessage(
                        error
                    )
            });


        return;
    }


    if (
        !data
    ) {

        response
            .status(404)
            .json({
                success:
                    false,

                error:
                    "Cette œuvre n'existe plus."
            });


        return;
    }


    /* =====================================================
       SUPPRESSION ANCIENNE IMAGE
    ====================================================== */

    if (
        previousArtwork.image_url &&
        previousArtwork.image_url !==
            data.image_url
    ) {

        await removeArtworkFile(
            previousArtwork.image_url
        );
    }


    response
        .status(200)
        .json({

            success:
                true,

            artwork:
                data

        });
}


/* =========================================================
   DELETE
========================================================= */

async function handleDelete(
    request,
    response
) {

    const body =
        getRequestBody(
            request
        );


    const id =
        normalizeText(
            body.id ??
            request.query?.id
        );


    if (
        !id
    ) {

        response
            .status(400)
            .json({
                success:
                    false,

                error:
                    "L'identifiant Supabase de l'œuvre est obligatoire."
            });


        return;
    }


    /* =====================================================
       RÉCUPÉRER ŒUVRE
    ====================================================== */

    const {
        data: artwork,
        error: artworkError
    } =
        await supabaseAdmin
            .from(
                TABLE_NAME
            )
            .select(
                "id,image_url"
            )
            .eq(
                "id",
                id
            )
            .maybeSingle();


    if (
        artworkError
    ) {

        console.error(
            "[Admin Gallery DELETE] Lecture :",
            artworkError
        );


        response
            .status(500)
            .json({
                success:
                    false,

                error:
                    getSupabaseErrorMessage(
                        artworkError
                    )
            });


        return;
    }


    if (
        !artwork
    ) {

        response
            .status(404)
            .json({
                success:
                    false,

                error:
                    "Cette œuvre n'existe pas."
            });


        return;
    }


    /* =====================================================
       SUPPRIMER LIGNE
    ====================================================== */

    const {
        error: deleteError
    } =
        await supabaseAdmin
            .from(
                TABLE_NAME
            )
            .delete()
            .eq(
                "id",
                id
            );


    if (
        deleteError
    ) {

        console.error(
            "[Admin Gallery DELETE] Supabase :",
            deleteError
        );


        response
            .status(500)
            .json({
                success:
                    false,

                error:
                    getSupabaseErrorMessage(
                        deleteError
                    )
            });


        return;
    }


    /* =====================================================
       SUPPRIMER IMAGE STORAGE
    ====================================================== */

    await removeArtworkFile(
        artwork.image_url
    );


    response
        .status(200)
        .json({

            success:
                true,

            deletedId:
                id

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
        "no-store, max-age=0"
    );


    /* =====================================================
       AUTHENTIFICATION
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
       ROUTAGE
    ====================================================== */

    try {

        switch (
            request.method
        ) {

            case "GET":

                await handleGet(
                    response
                );

                return;


            case "POST":

                await handlePost(
                    request,
                    response
                );

                return;


            case "PUT":

                await handlePut(
                    request,
                    response
                );

                return;


            case "DELETE":

                await handleDelete(
                    request,
                    response
                );

                return;


            default:

                response.setHeader(
                    "Allow",
                    "GET, POST, PUT, DELETE"
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


    } catch (
        error
    ) {

        console.error(
            "[Admin Gallery API] Erreur inattendue :",
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
                    "Erreur interne de l'API galerie."
            });
    }
}