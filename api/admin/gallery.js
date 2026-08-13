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


/* =========================================================
   OUTILS
========================================================= */

/**
 * Transforme une valeur en texte propre.
 *
 * @param {unknown} value
 * @returns {string}
 */
function normalizeText(value) {

    return String(
        value ?? ""
    ).trim();
}


/**
 * Transforme une valeur en texte nullable.
 *
 * "" devient null.
 *
 * @param {unknown} value
 * @returns {string|null}
 */
function normalizeNullableText(value) {

    const text =
        normalizeText(value);

    return text || null;
}


/**
 * Transforme différentes formes de données
 * en tableau de chaînes.
 *
 * Accepte :
 *
 * ["couaxia", "stream"]
 *
 * "couaxia, stream"
 *
 * "couaxia|stream"
 *
 * @param {unknown} value
 * @returns {string[]}
 */
function normalizeArray(value) {

    if (Array.isArray(value)) {

        return [
            ...new Set(
                value
                    .map(
                        item =>
                            normalizeText(item)
                    )
                    .filter(Boolean)
            )
        ];
    }


    const text =
        normalizeText(value);


    if (!text) {
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
 * Les tags sont mis en minuscules pour éviter :
 *
 * Stream
 * stream
 * STREAM
 *
 * d'être considérés comme trois tags différents.
 *
 * @param {unknown} value
 * @returns {string[]}
 */
function normalizeTags(value) {

    return normalizeArray(value)
        .map(
            tag =>
                tag.toLowerCase()
        );
}


/**
 * Convertit proprement une valeur en booléen.
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


    if (typeof value === "boolean") {
        return value;
    }


    if (typeof value === "number") {
        return value !== 0;
    }


    const normalized =
        String(value)
            .trim()
            .toLowerCase();


    if (
        [
            "true",
            "1",
            "yes",
            "oui",
            "on"
        ].includes(normalized)
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
        ].includes(normalized)
    ) {
        return false;
    }


    return defaultValue;
}


/**
 * Convertit une valeur en entier.
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


    return Number.isFinite(number)
        ? number
        : defaultValue;
}


/**
 * Vérifie qu'une URL HTTP/HTTPS est valide.
 *
 * Les URLs null sont autorisées.
 *
 * @param {string|null} value
 * @returns {boolean}
 */
function isValidOptionalUrl(value) {

    if (!value) {
        return true;
    }


    try {

        const url =
            new URL(value);


        return (
            url.protocol === "http:" ||
            url.protocol === "https:"
        );

    } catch {

        return false;
    }
}


/* =========================================================
   FORMATAGE D'UNE ŒUVRE
========================================================= */

/**
 * Construit une œuvre à partir du body.
 *
 * @param {object} body
 * @returns {object}
 */
function buildArtwork(body = {}) {

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
 * Vérifie les données obligatoires.
 *
 * @param {object} artwork
 * @returns {string|null}
 */
function validateArtwork(artwork) {

    if (!artwork.art_id) {

        return (
            "L'ID de l'œuvre est obligatoire."
        );
    }


    if (!artwork.artist) {

        return (
            "Le nom de l'artiste est obligatoire."
        );
    }


    if (!artwork.image_url) {

        return (
            "Une image est obligatoire."
        );
    }


    if (
        ![
            "image",
            "gif",
            "video"
        ].includes(
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

/**
 * Transforme certaines erreurs Supabase/PostgreSQL
 * en messages plus compréhensibles.
 *
 * @param {object} error
 * @returns {string}
 */
function getSupabaseErrorMessage(error) {

    /*
     * PostgreSQL :
     * unique_violation
     */
    if (
        error?.code === "23505"
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
   SUPPRESSION DU FICHIER STORAGE
========================================================= */

/**
 * Essaie de retrouver le chemin Storage à partir
 * de l'URL publique Supabase.
 *
 * Exemple :
 *
 * https://xxx.supabase.co/storage/v1/object/public/
 * artworks/05/image.png
 *
 * devient :
 *
 * 05/image.png
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


    if (!url) {
        return null;
    }


    const marker =
        `/storage/v1/object/public/${STORAGE_BUCKET}/`;


    const markerIndex =
        url.indexOf(marker);


    if (
        markerIndex === -1
    ) {
        return null;
    }


    const encodedPath =
        url.slice(
            markerIndex +
            marker.length
        );


    if (!encodedPath) {
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
 * Supprime l'image associée à une œuvre.
 *
 * Une erreur Storage ne bloque pas la suppression
 * de l'enregistrement en base.
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


    if (!storagePath) {
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


    if (error) {

        console.error(
            "[Gallery] Impossible de supprimer l'image :",
            error
        );
    }
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
                TABLE_NAME
            )
            .select("*")
            .order(
                "sort_order",
                {
                    ascending: true
                }
            )
            .order(
                "created_at",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "[Gallery GET]",
            error
        );


        response
            .status(500)
            .json({
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
                data ?? []
        });
}


/* =========================================================
   POST
========================================================= */

async function handlePost(
    request,
    response
) {

    const artwork =
        buildArtwork(
            request.body
        );


    const validationError =
        validateArtwork(
            artwork
        );


    if (validationError) {

        response
            .status(400)
            .json({
                error:
                    validationError
            });


        return;
    }


    const payload = {

        ...artwork,

        created_at:
            new Date()
                .toISOString(),

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
            .insert(
                payload
            )
            .select()
            .single();


    if (error) {

        console.error(
            "[Gallery POST]",
            error
        );


        response
            .status(
                error.code === "23505"
                    ? 409
                    : 500
            )
            .json({
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

    const id =
        normalizeText(
            request.body?.id
        );


    if (!id) {

        response
            .status(400)
            .json({
                error:
                    "L'identifiant Supabase de l'œuvre est obligatoire."
            });


        return;
    }


    /*
     * On récupère d'abord l'ancienne œuvre.
     *
     * Cela permettra de supprimer l'ancienne image
     * si l'utilisateur en a envoyé une nouvelle.
     */

    const {
        data:
            previousArtwork,
        error:
            previousError
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


    if (previousError) {

        console.error(
            "[Gallery PUT - lecture]",
            previousError
        );


        response
            .status(500)
            .json({
                error:
                    getSupabaseErrorMessage(
                        previousError
                    )
            });


        return;
    }


    if (!previousArtwork) {

        response
            .status(404)
            .json({
                error:
                    "Cette œuvre n'existe pas."
            });


        return;
    }


    /*
     * On fusionne les anciennes données avec
     * celles envoyées par l'admin.
     */

    const artwork =
        buildArtwork({
            ...previousArtwork,
            ...request.body
        });


    const validationError =
        validateArtwork(
            artwork
        );


    if (validationError) {

        response
            .status(400)
            .json({
                error:
                    validationError
            });


        return;
    }


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
            .single();


    if (error) {

        console.error(
            "[Gallery PUT]",
            error
        );


        response
            .status(
                error.code === "23505"
                    ? 409
                    : 500
            )
            .json({
                error:
                    getSupabaseErrorMessage(
                        error
                    )
            });


        return;
    }


    /*
     * Si l'image a changé, on supprime
     * l'ancien fichier Storage.
     */

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

    const id =
        normalizeText(
            request.body?.id ??
            request.query?.id
        );


    if (!id) {

        response
            .status(400)
            .json({
                error:
                    "L'identifiant Supabase de l'œuvre est obligatoire."
            });


        return;
    }


    /*
     * On récupère l'œuvre avant suppression
     * pour connaître son image.
     */

    const {
        data:
            artwork,
        error:
            artworkError
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


    if (artworkError) {

        console.error(
            "[Gallery DELETE - lecture]",
            artworkError
        );


        response
            .status(500)
            .json({
                error:
                    getSupabaseErrorMessage(
                        artworkError
                    )
            });


        return;
    }


    if (!artwork) {

        response
            .status(404)
            .json({
                error:
                    "Cette œuvre n'existe pas."
            });


        return;
    }


    /*
     * Suppression de la ligne.
     */

    const {
        error:
            deleteError
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


    if (deleteError) {

        console.error(
            "[Gallery DELETE]",
            deleteError
        );


        response
            .status(500)
            .json({
                error:
                    getSupabaseErrorMessage(
                        deleteError
                    )
            });


        return;
    }


    /*
     * La ligne a bien été supprimée.
     * On peut maintenant retirer son fichier.
     */

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
       AUTHENTIFICATION ADMIN
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
       ROUTAGE
    ====================================================== */

    try {

        switch (
            request.method
        ) {

            case "GET":

                await handleGet(
                    request,
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
                    [
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE"
                    ]
                );


                response
                    .status(405)
                    .json({
                        error:
                            "Méthode non autorisée."
                    });

                return;
        }

    } catch (error) {

        console.error(
            "[Gallery API] Erreur inattendue :",
            error
        );


        response
            .status(500)
            .json({
                error:
                    "Erreur interne de l'API galerie."
            });
    }
}