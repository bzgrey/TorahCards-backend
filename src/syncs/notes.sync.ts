import { actions, Frames, Sync } from "@engine";
import { Requesting } from "@concepts";

import { Notes } from "@concepts";
import { FlashCards } from "@concepts";
import { Following } from "@concepts";
import { UserAuth } from "@concepts";

type Empty = Record<PropertyKey, never>;

// -- Syncs for /api/Notes/addNotes ---
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

export const AddNotesResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Notes/addNotes" }, { request }],
    [Notes.addNotes, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const AddNotesError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Notes/addNotes" }, { request }],
    [Notes.addNotes, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// -- Syncs for /api/Notes/removeNotes --
export const RemoveNotesRequestAuth: Sync = (
  { request, user, name, token },
) => ({
  when: actions([
    Requesting.request,
    { path: "/Notes/removeNotes", token, name, user },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(UserAuth._getAuthenticatedUser, { token }, {
      user,
    });
    return frames;
  },
  // The user from the token is passed to check for ownership before deletion.
  then: actions([Notes.removeNotes, { user, name }]),
});

export const RemoveNotesResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Notes/removeNotes" }, { request }],
    [Notes.removeNotes, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const RemoveNotesError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Notes/removeNotes" }, { request }],
    [Notes.removeNotes, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// -- Syncs for /api/Notes/notesToFlashCards --
export const NotesToFlashCardsRequestAuth: Sync = (
  { request, user, name, token },
) => ({
  when: actions([
    Requesting.request,
    { path: "/Notes/notesToFlashCards", token, user, name },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(UserAuth._getAuthenticatedUser, { token }, {
      user,
    });
    return frames;
  },
  // Pass the user to ensure they own the note set being converted.
  then: actions([Notes.notesToFlashCards, { user, name }]),
});

export const NotesToFlashCardsResponse: Sync = (
  { request, cards },
) => ({
  when: actions(
    [Requesting.request, { path: "/Notes/notesToFlashCards" }, { request }],
    [Notes.notesToFlashCards, {}, { cards }],
  ),
  then: actions([Requesting.respond, { request, cards }]),
});

export const NotesToFlashCardsError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Notes/notesToFlashCards" }, { request }],
    [Notes.notesToFlashCards, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
