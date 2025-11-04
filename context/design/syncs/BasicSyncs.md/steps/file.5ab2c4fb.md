---
timestamp: 'Mon Nov 03 2025 17:44:32 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251103_174432.72e93588.md]]'
content_id: 5ab2c4fb35be52a9fdd8c946369270cfbbd5fd4376881b09058887da71154d9d
---

# file: src/syncs/api.sync.ts

```typescript
import { actions, Sync, Frames } from "@engine";
import {
  Notes,
  FlashCards,
  Following,
  UserAuth,
  Requesting,
} from "@concepts";

/*
 * =========================================
 * NOTES CONCEPT SYNCHRONIZATIONS
 * =========================================
 */

// -- Syncs for /api/Notes/addNotes --
export const AddNotesRequestAuth: Sync = (
  { request, user, token, name, content },
) => ({
  when: actions([
    Requesting.request,
    { path: "/Notes/addNotes", name, content, token },
    { request },
  ]),
  where: async (frames) => {
    // Authenticate the user via the provided token.
    // If the token is invalid, this query returns no frames, and the sync stops.
    return await frames.query(UserAuth._getAuthenticatedUser, { token }, {
      user,
    });
  },
  then: actions([Notes.addNotes, { user, name, content }]),
});

export const AddNotesResponse: Sync = ({ request, noteId }) => ({
  when: actions(
    [Requesting.request, { path: "/Notes/addNotes" }, { request }],
    [Notes.addNotes, {}, { noteId }],
  ),
  then: actions([Requesting.respond, { request, noteId }]),
});

export const AddNotesError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Notes/addNotes" }, { request }],
    [Notes.addNotes, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// -- Syncs for /api/Notes/removeNotes --
export const RemoveNotesRequestAuth: Sync = ({ request, user, token, noteId }) => ({
  when: actions([
    Requesting.request,
    { path: "/Notes/removeNotes", noteId, token },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(UserAuth._getAuthenticatedUser, { token }, { user });
  },
  // The user from the token is passed to check for ownership before deletion.
  then: actions([Notes.removeNotes, { noteId, user }]),
});

export const RemoveNotesResponse: Sync = ({ request, noteId }) => ({
  when: actions(
    [Requesting.request, { path: "/Notes/removeNotes" }, { request }],
    [Notes.removeNotes, {}, { noteId }],
  ),
  then: actions([Requesting.respond, { request, noteId }]),
});

export const RemoveNotesError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Notes/removeNotes" }, { request }],
    [Notes.removeNotes, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// -- Syncs for /api/Notes/notesToFlashCards --
export const NotesToFlashCardsRequestAuth: Sync = ({ request, user, token, noteSetId }) => ({
  when: actions([
    Requesting.request,
    { path: "/Notes/notesToFlashCards", noteSetId, token },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(UserAuth._getAuthenticatedUser, { token }, { user });
  },
  // Pass the user to ensure they own the note set being converted.
  then: actions([Notes.notesToFlashCards, { noteSetId, user }]),
});

export const NotesToFlashCardsResponse: Sync = ({ request, flashCardSetId }) => ({
  when: actions(
    [Requesting.request, { path: "/Notes/notesToFlashCards" }, { request }],
    [Notes.notesToFlashCards, {}, { flashCardSetId }],
  ),
  then: actions([Requesting.respond, { request, flashCardSetId }]),
});

export const NotesToFlashCardsError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Notes/notesToFlashCards" }, { request }],
    [Notes.notesToFlashCards, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});


/*
 * =========================================
 * FLASHCARDS CONCEPT SYNCHRONIZATIONS
 * =========================================
 */

// -- Syncs for /api/FlashCards/addFlashCards --
export const AddFlashCardsRequestAuth: Sync = ({ request, user, token, title }) => ({
  when: actions([
    Requesting.request,
    { path: "/FlashCards/addFlashCards", title, token },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(UserAuth._getAuthenticatedUser, { token }, { user });
  },
  // Assume the FlashCards concept needs an 'author' for the new set.
  then: actions([FlashCards.addFlashCards, { title, author: user }]),
});

export const AddFlashCardsResponse: Sync = ({ request, flashCardSetId }) => ({
  when: actions(
    [Requesting.request, { path: "/FlashCards/addFlashCards" }, { request }],
    [FlashCards.addFlashCards, {}, { flashCardSetId }],
  ),
  then: actions([Requesting.respond, { request, flashCardSetId }]),
});

export const AddFlashCardsError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/FlashCards/addFlashCards" }, { request }],
    [FlashCards.addFlashCards, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// -- Syncs for /api/FlashCards/removeFlashCards --
export const RemoveFlashCardsRequestAuth: Sync = ({ request, user, token, flashCardSetId }) => ({
  when: actions([
    Requesting.request,
    { path: "/FlashCards/removeFlashCards", flashCardSetId, token },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(UserAuth._getAuthenticatedUser, { token }, { user });
  },
  then: actions([FlashCards.removeFlashCards, { flashCardSetId, user }]),
});

export const RemoveFlashCardsResponse: Sync = ({ request, flashCardSetId }) => ({
  when: actions(
    [Requesting.request, { path: "/FlashCards/removeFlashCards" }, { request }],
    [FlashCards.removeFlashCards, {}, { flashCardSetId }],
  ),
  then: actions([Requesting.respond, { request, flashCardSetId }]),
});

export const RemoveFlashCardsError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/FlashCards/removeFlashCards" }, { request }],
    [FlashCards.removeFlashCards, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// -- Syncs for /api/FlashCards/addCard --
export const AddCardRequestAuth: Sync = ({ request, user, token, flashCardSetId, front, back }) => ({
  when: actions([
    Requesting.request,
    { path: "/FlashCards/addCard", flashCardSetId, front, back, token },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(UserAuth._getAuthenticatedUser, { token }, { user });
  },
  then: actions([FlashCards.addCard, { flashCardSetId, front, back, user }]),
});

export const AddCardResponse: Sync = ({ request, cardId }) => ({
  when: actions(
    [Requesting.request, { path: "/FlashCards/addCard" }, { request }],
    [FlashCards.addCard, {}, { cardId }],
  ),
  then: actions([Requesting.respond, { request, cardId }]),
});

export const AddCardError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/FlashCards/addCard" }, { request }],
    [FlashCards.addCard, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// -- Syncs for /api/FlashCards/removeCard --
export const RemoveCardRequestAuth: Sync = ({ request, user, token, cardId }) => ({
  when: actions([
    Requesting.request,
    { path: "/FlashCards/removeCard", cardId, token },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(UserAuth._getAuthenticatedUser, { token }, { user });
  },
  then: actions([FlashCards.removeCard, { cardId, user }]),
});

export const RemoveCardResponse: Sync = ({ request, cardId }) => ({
  when: actions(
    [Requesting.request, { path: "/FlashCards/removeCard" }, { request }],
    [FlashCards.removeCard, {}, { cardId }],
  ),
  then: actions([Requesting.respond, { request, cardId }]),
});

export const RemoveCardError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/FlashCards/removeCard" }, { request }],
    [FlashCards.removeCard, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

/*
 * =========================================
 * FOLLOWING CONCEPT SYNCHRONIZATIONS
 * =========================================
 */

// -- Syncs for /api/Following/follow --
export const FollowRequestAuth: Sync = ({ request, user, token, followed }) => ({
  when: actions([
    Requesting.request,
    { path: "/Following/follow", followed, token },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(UserAuth._getAuthenticatedUser, { token }, { user });
  },
  // The 'follower' is the authenticated user.
  then: actions([Following.follow, { follower: user, followed }]),
});

export const FollowResponse: Sync = ({ request, follower, followed }) => ({
  when: actions(
    [Requesting.request, { path: "/Following/follow" }, { request }],
    [Following.follow, {}, { follower, followed }],
  ),
  then: actions([Requesting.respond, { request, follower, followed }]),
});

export const FollowError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Following/follow" }, { request }],
    [Following.follow, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// -- Syncs for /api/Following/unfollow --
export const UnfollowRequestAuth: Sync = ({ request, user, token, followed }) => ({
  when: actions([
    Requesting.request,
    { path: "/Following/unfollow", followed, token },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(UserAuth._getAuthenticatedUser, { token }, { user });
  },
  // The 'follower' is the authenticated user.
  then: actions([Following.unfollow, { follower: user, followed }]),
});

export const UnfollowResponse: Sync = ({ request, follower, followed }) => ({
  when: actions(
    [Requesting.request, { path: "/Following/unfollow" }, { request }],
    [Following.unfollow, {}, { follower, followed }],
  ),
  then: actions([Requesting.respond, { request, follower, followed }]),
});

export const UnfollowError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Following/unfollow" }, { request }],
    [Following.unfollow, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// -- Sync for /api/Following/_getFollowedItems --
export const GetFollowedItemsRequestAuth: Sync = ({ request, user, token, item, results }) => ({
  when: actions([
    Requesting.request,
    { path: "/Following/_getFollowedItems", token },
    { request },
  ]),
  where: async (frames) => {
    const originalFrame = frames[0];
    
    // First, authenticate the user to get their ID.
    frames = await frames.query(UserAuth._getAuthenticatedUser, { token }, { user });
    
    // If auth fails, stop.
    if (frames.length === 0) {
      const responseFrame = { ...originalFrame, [results]: { error: "Authentication failed" } };
      return new Frames(responseFrame);
    }

    // Now, query for items followed by the authenticated user.
    frames = await frames.query(Following._getFollowedItems, { follower: user }, { item });

    if (frames.length === 0) {
      const responseFrame = { ...originalFrame, [results]: [] };
      return new Frames(responseFrame);
    }
    
    return frames.collectAs([item], results);
  },
  then: actions([
    Requesting.respond, 
    { request, results },
  ]),
});


/*
 * =========================================
 * USERAUTH CONCEPT SYNCHRONIZATIONS
 * =========================================
 */

// -- Sync for /api/UserAuth/_getPassword --
// WARNING: This remains a significant security risk. Authenticating the requester
// is only the first step. You must also implement AUTHORIZATION logic to ensure
// the authenticated user has permission to view the password of the target user.
export const GetPasswordRequestAuth: Sync = ({ request, user, token, targetUsername, password, error }) => ({
  when: actions([
    Requesting.request,
    { path: "/UserAuth/_getPassword", token, username: targetUsername },
    { request },
  ]),
  where: async (frames) => {
    const originalFrame = frames[0];
    
    // Step 1: Authenticate the user making the request.
    const authedFrames = await frames.query(UserAuth._getAuthenticatedUser, { token }, { user });
    if (authedFrames.length === 0) {
      return new Frames({ ...originalFrame, [error]: "Authentication failed" });
    }

    // Step 2: (CRITICAL - AUTHORIZATION) Check if authenticated user has rights.
    // This is a placeholder. A real implementation would check for admin roles, etc.
    // For now, we will just proceed, but this is NOT secure.
    // For example:
    // const authorizedFrames = await authedFrames.query(UserAuth._isAdmin, { user }, { isAdmin: true });
    // if (authorizedFrames.length === 0) {
    //   return new Frames({ ...originalFrame, [error]: "Unauthorized" });
    // }

    // Step 3: Query the password for the TARGET username.
    const resultFrames = await authedFrames.query(UserAuth._getPassword, { username: targetUsername }, { password });
    if (resultFrames.length === 0) {
      return new Frames({ ...originalFrame, [error]: "Target user not found" });
    }
    
    return resultFrames.slice(0, 1);
  },
  then: actions([
    Requesting.respond, 
    { request, password, error },
  ]),
});
```
