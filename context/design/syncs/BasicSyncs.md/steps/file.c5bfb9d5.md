---
timestamp: 'Mon Nov 03 2025 16:36:01 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251103_163601.35c76759.md]]'
content_id: c5bfb9d537b0f01cf7ff360f20d0100bca324d15946e87bf44e92148e0dea949
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
  // Sessioning // Likely needed for authorization
} from "@concepts";

/*
 * =========================================
 * NOTES CONCEPT SYNCHRONIZATIONS
 * =========================================
 */

// -- Syncs for /api/Notes/addNotes --
// Assumed action: Notes.addNotes({ noteSetId, content }): ({ noteId })

export const AddNotesRequest: Sync = ({ request, noteSetId, content }) => ({
  when: actions([
    Requesting.request,
    { path: "/Notes/addNotes", noteSetId, content },
    { request },
  ]),
  then: actions([Notes.addNotes, { noteSetId, content }]),
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
// Assumed action: Notes.removeNotes({ noteId }): ({ noteId })

export const RemoveNotesRequest: Sync = ({ request, noteId }) => ({
  when: actions([
    Requesting.request,
    { path: "/Notes/removeNotes", noteId },
    { request },
  ]),
  then: actions([Notes.removeNotes, { noteId }]),
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
// Assumed action: Notes.notesToFlashCards({ noteSetId }): ({ flashCardSetId })

export const NotesToFlashCardsRequest: Sync = ({ request, noteSetId }) => ({
  when: actions([
    Requesting.request,
    { path: "/Notes/notesToFlashCards", noteSetId },
    { request },
  ]),
  then: actions([Notes.notesToFlashCards, { noteSetId }]),
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
// Assumed action: FlashCards.addFlashCards({ title }): ({ flashCardSetId })

export const AddFlashCardsRequest: Sync = ({ request, title }) => ({
  when: actions([
    Requesting.request,
    { path: "/FlashCards/addFlashCards", title },
    { request },
  ]),
  then: actions([FlashCards.addFlashCards, { title }]),
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
// Assumed action: FlashCards.removeFlashCards({ flashCardSetId }): ({ flashCardSetId })

export const RemoveFlashCardsRequest: Sync = ({ request, flashCardSetId }) => ({
  when: actions([
    Requesting.request,
    { path: "/FlashCards/removeFlashCards", flashCardSetId },
    { request },
  ]),
  then: actions([FlashCards.removeFlashCards, { flashCardSetId }]),
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
// Assumed action: FlashCards.addCard({ flashCardSetId, front, back }): ({ cardId })

export const AddCardRequest: Sync = ({ request, flashCardSetId, front, back }) => ({
  when: actions([
    Requesting.request,
    { path: "/FlashCards/addCard", flashCardSetId, front, back },
    { request },
  ]),
  then: actions([FlashCards.addCard, { flashCardSetId, front, back }]),
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
// Assumed action: FlashCards.removeCard({ cardId }): ({ cardId })

export const RemoveCardRequest: Sync = ({ request, cardId }) => ({
  when: actions([
    Requesting.request,
    { path: "/FlashCards/removeCard", cardId },
    { request },
  ]),
  then: actions([FlashCards.removeCard, { cardId }]),
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
// Assumed action: Following.follow({ follower, followed }): ({ follower, followed })

export const FollowRequest: Sync = ({ request, follower, followed }) => ({
  when: actions([
    Requesting.request,
    { path: "/Following/follow", follower, followed },
    { request },
  ]),
  then: actions([Following.follow, { follower, followed }]),
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
// Assumed action: Following.unfollow({ follower, followed }): ({ follower, followed })

export const UnfollowRequest: Sync = ({ request, follower, followed }) => ({
  when: actions([
    Requesting.request,
    { path: "/Following/unfollow", follower, followed },
    { request },
  ]),
  then: actions([Following.unfollow, { follower, followed }]),
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
// Assumed query: Following._getFollowedItems({ follower }): ({ item })

export const GetFollowedItemsRequest: Sync = ({ request, follower, item, results }) => ({
  when: actions([
    Requesting.request,
    // The follower ID would likely come from the request body or a session lookup
    { path: "/Following/_getFollowedItems", follower },
    { request },
  ]),
  where: async (frames) => {
    // Save the original frame to respond to, especially for the zero-match case.
    const originalFrame = frames[0];
    
    // Query for all items followed by the 'follower'.
    // The query returns multiple frames, one for each followed item.
    frames = await frames.query(Following._getFollowedItems, { follower }, { item });

    // If the query returns no frames (user follows nothing),
    // we must manually construct a response with an empty array.
    if (frames.length === 0) {
      const responseFrame = { ...originalFrame, [results]: [] };
      return new Frames(responseFrame);
    }
    
    // If there are results, collect the 'item' from each frame into a single 'results' array.
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
// Assumed query: UserAuth._getPassword({ username }): ({ password })
// WARNING: Exposing a password query is a major security risk. 
// This template assumes strong authorization checks would be added in the 'where' clause.

export const GetPasswordRequestWithAuth: Sync = ({ request, session, targetUsername, password, error }) => ({
  when: actions([
    Requesting.request,
    { path: "/UserAuth/_getPassword", session, username: targetUsername },
    { request },
  ]),
  where: async (frames) => {
    const originalFrame = frames[0];
    
    // TODO: IMPLEMENT CRITICAL AUTHORIZATION LOGIC HERE.
    // This placeholder is NOT secure.
    // For example, check if the session is valid and the user has admin rights
    // let authorizedFrames = await frames.query(Sessioning._getUser, { session }, { user });
    // authorizedFrames = authorizedFrames.filter($ => $[user].isAdmin);
    // if (authorizedFrames.length === 0) {
    //   return new Frames({ ...originalFrame, [error]: "Unauthorized" });
    // }
    
    // If authorized, proceed to query the password.
    const resultFrames = await frames.query(UserAuth._getPassword, { username: targetUsername }, { password });

    if (resultFrames.length === 0) {
      // User not found
      return new Frames({ ...originalFrame, [error]: "User not found" });
    }
    
    // We expect only one user, so return the first result frame.
    return resultFrames.slice(0, 1);
  },
  then: actions([
    // This will respond with either the password or the error, 
    // because the 'where' clause ensures one of them is bound.
    Requesting.respond, 
    { request, password, error },
  ]),
});
```
