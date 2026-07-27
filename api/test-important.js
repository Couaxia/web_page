import { getTwitchAccessToken } from "./auth.js";

export function GET() {
    return Response.json({
        success: true,
        message: "Le fichier auth.js a été importé.",
        getTwitchAccessToken:
            typeof getTwitchAccessToken
    });
}