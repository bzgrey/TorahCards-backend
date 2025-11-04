---
timestamp: 'Sun Nov 02 2025 09:55:49 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251102_095549.54c8194c.md]]'
content_id: 5809a4fd3558ec304da9fd8cbab23ed30b8ff340eebce997c4c70436143eab77
---

# response:

Here are the basic templates for synchronizations for the specified excluded actions. These templates follow the structure outlined in the documentation, including the request/response cycle for each API endpoint.

**Important Assumptions:**

* **Concept Existence**: It is assumed that `NotesConcept`, `FlashCardsConcept`, `FollowingConcept`, `UserAuthConcept`, and `SessioningConcept` exist and are accessible via `@concepts`.
* **Action Signatures**: The action and query signatures within these concepts are inferred based on the API path and common software patterns. You will need to verify and adjust these to match your actual concept specifications.
* **Error Handling**: Basic error handling is included where an error result from a concept action leads to a `Requesting.respond` with the error.
* **Authentication/Authorization**: Most `where` clauses include a step to retrieve the `user` from a `session` using `Sessioning._getUser`. For actions requiring specific ownership (e.g., removing notes, managing flashcard decks), additional `query` calls would be needed to verify ownership. These are marked with `// TODO: Ownership check`.
* **Sensitive Data**: The `_getPassword` route is inherently sensitive and requires careful consideration beyond these templates.

```typescript
// src/syncs/api_templates.sync.ts

import { actions, Frames, Sync } from "@engine";
import { Requesting, Sessioning } from "@concepts";

// Assuming these concepts are defined and exported from their respective files
// e.g., import { Notes } from "@concepts/Notes/NotesConcept.ts";
// You may need to run `deno run build` to generate the @concepts import correctly.
import { Notes } from "@concepts/Notes/NotesConcept.ts";
import { FlashCards } from "@concepts/FlashCards/FlashCardsConcept.ts";
import { Following } from "@concepts/Following/FollowingConcept.ts";
import { UserAuth } from "@concepts/UserAuth/UserAuthConcept.ts";

type Empty = Record<PropertyKey, never>;

// --- /api/Notes/addNotes ---
export const AddNotesRequest: Sync = ({ request, session, target, text, notesId }) => ({
  when: actions([
    Requesting.request,
    { path: "/Notes/addNotes", session, target, text, notesId },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user: 'user' }); // 'user' is the variable name
    return frames;
  },
  then: actions([Notes.addNotes, { user: 'user', target, text, notesId }]),
});

export const AddNotesResponse: Sync = ({ request, notesId }) => ({
  when: actions(
    [Requesting.request, { path: "/Notes/addNotes" }, { request }],
    [Notes.addNotes, {}, { notesId }],
  ),
  then: actions([Requesting.respond, { request, notesId }]),
});

export const AddNotesResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Notes/addNotes" }, { request }],
    [Notes.addNotes, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- /api/Notes/removeNotes ---
export const RemoveNotesRequest: Sync = ({ request, session, notesId }) => ({
  when: actions([
    Requesting.request,
    { path: "/Notes/removeNotes", session, notesId },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user: 'user' });
    // TODO: Ownership check: Query Notes concept to ensure 'user' owns 'notesId'
    return frames;
  },
  then: actions([Notes.removeNotes, { notesId }]),
});

export const RemoveNotesResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Notes/removeNotes" }, { request }],
    [Notes.removeNotes, {}, {}], // Empty result for success
  ),
  then: actions([Requesting.respond, { request }]),
});

export const RemoveNotesResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Notes/removeNotes" }, { request }],
    [Notes.removeNotes, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- /api/Notes/notesToFlashCards ---
export const NotesToFlashCardsRequest: Sync = ({ request, session, notesId, deckId }) => ({
  when: actions([
    Requesting.request,
    { path: "/Notes/notesToFlashCards", session, notesId, deckId },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user: 'user' });
    // TODO: Ownership check: Query Notes and FlashCards concepts to ensure 'user' owns 'notesId' and 'deckId' (if provided)
    return frames;
  },
  then: actions([Notes.notesToFlashCards, { notesId, deckId }]),
});

export const NotesToFlashCardsResponse: Sync = ({ request, cardIds }) => ({
  when: actions(
    [Requesting.request, { path: "/Notes/notesToFlashCards" }, { request }],
    [Notes.notesToFlashCards, {}, { cardIds }],
  ),
  then: actions([Requesting.respond, { request, cardIds }]),
});

export const NotesToFlashCardsResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Notes/notesToFlashCards" }, { request }],
    [Notes.notesToFlashCards, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- /api/FlashCards/addFlashCards ---
export const AddFlashCardsRequest: Sync = ({ request, session, deckId, cards }) => ({
  when: actions([
    Requesting.request,
    { path: "/FlashCards/addFlashCards", session, deckId, cards },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user: 'user' });
    // TODO: Ownership check: Query FlashCards concept to ensure 'user' owns 'deckId'
    return frames;
  },
  then: actions([FlashCards.addFlashCards, { deckId, cards }]),
});

export const AddFlashCardsResponse: Sync = ({ request, cardIds }) => ({
  when: actions(
    [Requesting.request, { path: "/FlashCards/addFlashCards" }, { request }],
    [FlashCards.addFlashCards, {}, { cardIds }],
  ),
  then: actions([Requesting.respond, { request, cardIds }]),
});

export const AddFlashCardsResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/FlashCards/addFlashCards" }, { request }],
    [FlashCards.addFlashCards, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- /api/FlashCards/removeFlashCards ---
export const RemoveFlashCardsRequest: Sync = ({ request, session, deckId, cardIds }) => ({
  when: actions([
    Requesting.request,
    { path: "/FlashCards/removeFlashCards", session, deckId, cardIds },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user: 'user' });
    // TODO: Ownership check: Query FlashCards concept to ensure 'user' owns 'deckId' AND all 'cardIds'
    return frames;
  },
  then: actions([FlashCards.removeFlashCards, { deckId, cardIds }]),
});

export const RemoveFlashCardsResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/FlashCards/removeFlashCards" }, { request }],
    [FlashCards.removeFlashCards, {}, {}], // Empty result for success
  ),
  then: actions([Requesting.respond, { request }]),
});

export const RemoveFlashCardsResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/FlashCards/removeFlashCards" }, { request }],
    [FlashCards.removeFlashCards, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- /api/FlashCards/addCard ---
export const AddCardRequest: Sync = ({ request, session, deckId, front, back }) => ({
  when: actions([
    Requesting.request,
    { path: "/FlashCards/addCard", session, deckId, front, back },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user: 'user' });
    // TODO: Ownership check: Query FlashCards concept to ensure 'user' owns 'deckId'
    return frames;
  },
  then: actions([FlashCards.addCard, { deckId, front, back }]),
});

export const AddCardResponse: Sync = ({ request, cardId }) => ({
  when: actions(
    [Requesting.request, { path: "/FlashCards/addCard" }, { request }],
    [FlashCards.addCard, {}, { cardId }],
  ),
  then: actions([Requesting.respond, { request, cardId }]),
});

export const AddCardResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/FlashCards/addCard" }, { request }],
    [FlashCards.addCard, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- /api/FlashCards/removeCard ---
export const RemoveCardRequest: Sync = ({ request, session, cardId }) => ({
  when: actions([
    Requesting.request,
    { path: "/FlashCards/removeCard", session, cardId },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user: 'user' });
    // TODO: Ownership check: Query FlashCards concept to ensure 'user' owns 'cardId'
    return frames;
  },
  then: actions([FlashCards.removeCard, { cardId }]),
});

export const RemoveCardResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/FlashCards/removeCard" }, { request }],
    [FlashCards.removeCard, {}, {}], // Empty result for success
  ),
  then: actions([Requesting.respond, { request }]),
});

export const RemoveCardResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/FlashCards/removeCard" }, { request }],
    [FlashCards.removeCard, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- /api/Following/follow ---
export const FollowRequest: Sync = ({ request, session, targetId }) => ({
  when: actions([
    Requesting.request,
    { path: "/Following/follow", session, targetId },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user: 'user' });
    return frames;
  },
  then: actions([Following.follow, { follower: 'user', target: targetId }]),
});

export const FollowResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Following/follow" }, { request }],
    [Following.follow, {}, {}], // Empty result for success
  ),
  then: actions([Requesting.respond, { request }]),
});

export const FollowResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Following/follow" }, { request }],
    [Following.follow, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- /api/Following/unfollow ---
export const UnfollowRequest: Sync = ({ request, session, targetId }) => ({
  when: actions([
    Requesting.request,
    { path: "/Following/unfollow", session, targetId },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user: 'user' });
    return frames;
  },
  then: actions([Following.unfollow, { follower: 'user', target: targetId }]),
});

export const UnfollowResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Following/unfollow" }, { request }],
    [Following.unfollow, {}, {}], // Empty result for success
  ),
  then: actions([Requesting.respond, { request }]),
});

export const UnfollowResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Following/unfollow" }, { request }],
    [Following.unfollow, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- /api/Following/_getFollowedItems ---
export const GetFollowedItemsRequest: Sync = ({ request, session, results }) => ({
  when: actions([
    Requesting.request,
    { path: "/Following/_getFollowedItems", session },
    { request },
  ]),
  where: async (frames) => {
    // Preserve original frame for responding even if no items found
    const originalFrame = frames[0];
    frames = await frames.query(Sessioning._getUser, { session }, { user: 'user' });
    frames = await frames.query(Following._getFollowedItems, { follower: 'user' }, { item: 'item' });

    if (frames.length === 0) {
      return new Frames({ ...originalFrame, [results]: [] });
    }
    return frames.collectAs(['item'], results);
  },
  then: actions([Requesting.respond, { request, results }]),
});

export const GetFollowedItemsResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Following/_getFollowedItems" }, { request }],
    [Following._getFollowedItems, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});


// --- /api/UserAuth/_getPassword ---
// WARNING: Exposing _getPassword via an API route is highly sensitive and generally NOT recommended.
// This example assumes a highly privileged admin context for demonstration purposes only.
export const GetPasswordRequest: Sync = ({ request, session, userId, password }) => ({
  when: actions([
    Requesting.request,
    { path: "/UserAuth/_getPassword", session, userId },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { adminUser: 'user' }); // Assuming session is for an admin
    // TODO: Admin authorization check: Ensure 'adminUser' has privileges to view 'userId's password
    // Or, if user is querying their own password: frames.filter(($) => $[adminUser] === $[userId]);
    frames = await frames.query(UserAuth._getPassword, { user: userId }, { password });
    return frames;
  },
  then: actions([Requesting.respond, { request, password }]),
});

export const GetPasswordResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuth/_getPassword" }, { request }],
    [UserAuth._getPassword, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
```
