import { actions, Frames, Sync } from "@engine";
import { Requesting } from "@concepts";

import { Following } from "@concepts";
import { UserAuth } from "@concepts";

/*
 * =========================================
 * FOLLOWING CONCEPT SYNCHRONIZATIONS
 * =========================================
 */

// -- Syncs for /api/Following/follow --
export const FollowRequestAuth: Sync = (
  { request, user, item, token },
) => ({
  when: actions([
    Requesting.request,
    { path: "/Following/follow", user, item, token },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(UserAuth._getAuthenticatedUser, { token }, {
      user,
    });
  },
  then: actions([Following.follow, { user, item }]),
});

export const FollowResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Following/follow" }, { request }],
    [Following.follow, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const FollowError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Following/follow" }, { request }],
    [Following.follow, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// -- Syncs for /api/Following/unfollow --
export const UnfollowRequestAuth: Sync = (
  { request, user, token, item },
) => ({
  when: actions([
    Requesting.request,
    { path: "/Following/unfollow", user, item, token },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(UserAuth._getAuthenticatedUser, { token }, {
      user,
    });
  },
  // The 'follower' is the authenticated user.
  then: actions([Following.unfollow, { user, item }]),
});

export const UnfollowResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Following/unfollow" }, { request }],
    [Following.unfollow, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const UnfollowError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Following/unfollow" }, { request }],
    [Following.unfollow, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// -- Sync for /api/Following/_getFollowedItems --
export const GetFollowedItemsRequestAuth: Sync = (
  { request, user, token, item, results },
) => ({
  when: actions([
    Requesting.request,
    { path: "/Following/_getFollowedItems", token, user },
    { request },
  ]),
  where: async (frames) => {
    const originalFrame = frames[0];
    // First, authenticate the user to get their ID.
    frames = await frames.query(UserAuth._getAuthenticatedUser, { token }, {
      user,
    });

    // Now, query for items followed by the authenticated user.
    frames = await frames.query(
      Following._getFollowedItems,
      { user },
      { item },
    );

    if (frames.length === 0) {
      const response = { ...originalFrame, [results]: [] };
      // Note the additional import `Frames` available from @engine
      return new Frames(response);
    }

    return frames.collectAs([item], results);
  },
  then: actions([
    Requesting.respond,
    { request, results },
  ]),
});
