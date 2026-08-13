"use strict";

/* =========================================================
   SUPABASE — SERVEUR
========================================================= */

import {
    createClient
} from "@supabase/supabase-js";


/* =========================================================
   CONFIGURATION
========================================================= */

function getSupabaseUrl() {

    const url =
        process.env
            .SUPABASE_URL
            ?.trim();


    if (!url) {

        throw new Error(
            "SUPABASE_URL est absent des variables d'environnement."
        );

    }


    return url;
}


function getSupabaseSecretKey() {

    const secretKey =
        process.env
            .SUPABASE_SECRET_KEY
            ?.trim();


    if (!secretKey) {

        throw new Error(
            "SUPABASE_SECRET_KEY est absent des variables d'environnement."
        );

    }


    return secretKey;
}


/* =========================================================
   CLIENT ADMIN SERVEUR
========================================================= */

export const supabaseAdmin =
    createClient(
        getSupabaseUrl(),
        getSupabaseSecretKey(),
        {
            auth: {

                persistSession:
                    false,

                autoRefreshToken:
                    false,

                detectSessionInUrl:
                    false

            }
        }
    );