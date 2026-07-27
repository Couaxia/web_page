"use strict";

export function GET() {
    return Response.json({
        success: true,
        message: "La fonction test fonctionne."
    });
}