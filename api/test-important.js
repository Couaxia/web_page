"use strict";

import {
    getTwitchAccessToken
} from "./auth.js";

import {
    getStreamStatus
} from "./stream.js";

import {
    getTwitchUser
} from "./user.js";

import {
    getFollowerCount
} from "./followers.js";


export function GET() {
    return Response.json({
        success: true,

        imports: {
            getTwitchAccessToken:
                typeof getTwitchAccessToken,

            getStreamStatus:
                typeof getStreamStatus,

            getTwitchUser:
                typeof getTwitchUser,

            getFollowerCount:
                typeof getFollowerCount,

            getChannelVideos:
                typeof getChannelVideos,

            getChannelClips:
                typeof getChannelClips,

            getGame:
                typeof getGame
        }
    });
}