"use strict";

import * as followersModule from "./followers.js";
import * as videosModule from "./videos.js";
import * as clipsModule from "./clips.js";
import * as gameModule from "./game.js";

export function GET() {
    return Response.json({
        success: true,

        exportedNames: {
            followers:
                Object.keys(followersModule),

            videos:
                Object.keys(videosModule),

            clips:
                Object.keys(clipsModule),

            game:
                Object.keys(gameModule)
        }
    });
}