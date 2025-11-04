[@sync-background](../tools/sync-background.md)

# sync: excluded actions

Create basic templates for syncs according to the above specs so I can fill in the details for each of the following excluded actions: 
"/api/Notes/addNotes",

"/api/Notes/removeNotes",

"/api/Notes/notesToFlashCards",

"/api/FlashCards/addFlashCards",

"/api/FlashCards/removeFlashCards",

"/api/FlashCards/addCard",

"/api/FlashCards/removeCard",

"/api/Following/follow",

"/api/Following/unfollow",

"/api/Following/\_getFollowedItems",

"/api/UserAuth/\_getPassword",

# response:

Of course. Here are the synchronization templates for the specified excluded actions, structured according to the concept design architecture. These templates assume the existence of `Notes`, `FlashCards`, `Following`, and `UserAuth` concepts with actions and queries matching the routes.

You can place this code in a new file, for example, `src/syncs/api.sync.ts`.

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


# fix: authentication with token
Use the following example for how I wrote the request sync for addNotes with authentication using a token to d othe same thing for all of the other requests:
```typescript
export const AddNotesRequestAuth: Sync = (

{ request, user, token, name, content },

) => ({

when: actions([

Requesting.request,

{ path: "/Notes/addNotes", user, name, content, token },

{ request },

]),

where: async (frames) => {

console.log(frames);

frames = await frames.query(UserAuth._getAuthenticatedUser, { token }, {

user,

});

console.log(frames);

return frames;

},

then: actions([Notes.addNotes, { user, name, content }]),

});
```
# response:

Of course. I will apply the token-based authentication pattern from your `AddNotesRequestAuth` example to all the other request synchronizations.

The core pattern involves:
1.  Renaming the request sync to `...RequestAuth`.
2.  Expecting a `token` in the request body within the `when` clause.
3.  Adding a `where` clause to call `UserAuth._getAuthenticatedUser` with the token, which validates the request and provides the authenticated `user` ID.
4.  Passing the validated `user` ID to the target concept's action in the `then` clause, often for ownership or permission checks.

Here is the updated `api.sync.ts` file with these changes. The corresponding `...Response` and `...Error` syncs remain unchanged as they correctly react to the outcome of the now-authenticated business logic action.

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