"use strict";

/* =========================================================
   AUTHENTIFICATION TWITCH
========================================================= */

export {
    clearTwitchAccessToken,
    getTwitchAccessToken,
    getTwitchApiHeaders,
    getTwitchClientId
} from "./twitch/auth.js";


/* =========================================================
   INFORMATIONS DU LIVE
========================================================= */

export {
    getStreamStatus,
    isChannelLive
} from "./stream.js";


/* =========================================================
   INFORMATIONS DE LA CHAÎNE
========================================================= */

export {
    getTwitchUser,
    getTwitchUserId,
    twitchUserExists
} from "./user.js";


/* =========================================================
   INFORMATIONS DES JEUX / CATÉGORIES
========================================================= */

export {
    getGame
} from "./twitch/game.js";

/* =========================================================
   FOLLOWERS
========================================================= */

export {
    checkUserFollowsChannel,
    getChannelFollowers,
    getFollowerCount
} from "./twitch/followers.js";

/* =========================================================
   VIDÉOS ET REDIFFUSIONS
========================================================= */

export {
    getChannelVideos,
    getLatestArchives,
    getLatestHighlights,
    getLatestUploads,
    getLatestVideo
} from "./videos.js";

/* =========================================================
   CLIPS
========================================================= */

export {
    getChannelClips,
    getClipById,
    getClipsByIds,
    getFeaturedClips,
    getGameClips,
    getMonthlyClips,
    getTopWeeklyClip,
    getWeeklyClips
} from "./twitch/clips.js";