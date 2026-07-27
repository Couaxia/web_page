"use strict";

import { getStreamStatus } from "./stream.js";
import { getTwitchUser } from "./user.js";
import { getFollowerCount } from "./followers.js";
import { getChannelVideos } from "./videos.js";
import { getChannelClips } from "./clips.js";
import { getGame } from "./game.js";

export default function handler(request, response) {
    response.status(200).json({
        success: true,
        imports: {
            getStreamStatus: typeof getStreamStatus,
            getTwitchUser: typeof getTwitchUser,
            getFollowerCount: typeof getFollowerCount,
            getChannelVideos: typeof getChannelVideos,
            getChannelClips: typeof getChannelClips,
            getGame: typeof getGame
        }
    });
}