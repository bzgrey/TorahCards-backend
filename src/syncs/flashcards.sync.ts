import { actions, Sync } from "@engine";
import { Requesting } from "@concepts";

import { FlashCards } from "@concepts";
import { UserAuth } from "@concepts";

/*
 * =========================================
 * FLASHCARDS CONCEPT SYNCHRONIZATIONS
 * =========================================
 */

// -- Syncs for /api/FlashCards/addFlashCards --
export const AddFlashCardsRequestAuth: Sync = (
  { request, user, token, name, cards },
) => ({
  when: actions([
    Requesting.request,
    { path: "/FlashCards/addFlashCards", user, name, token, cards },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(UserAuth._getAuthenticatedUser, { token }, {
      user,
    });
  },
  // Assume the FlashCards concept needs an 'author' for the new set.
  then: actions([FlashCards.addFlashCards, { name, user, cards }]),
});

export const AddFlashCardsResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/FlashCards/addFlashCards" }, { request }],
    [FlashCards.addFlashCards, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const AddFlashCardsError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/FlashCards/addFlashCards" }, { request }],
    [FlashCards.addFlashCards, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// -- Syncs for /api/FlashCards/removeFlashCards --
export const RemoveFlashCardsRequestAuth: Sync = (
  { request, user, token, name },
) => ({
  when: actions([
    Requesting.request,
    { path: "/FlashCards/removeFlashCards", name, user, token },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(UserAuth._getAuthenticatedUser, { token }, {
      user,
    });
  },
  then: actions([FlashCards.removeFlashCards, { user, name }]),
});

export const RemoveFlashCardsResponse: Sync = (
  { request },
) => ({
  when: actions(
    [Requesting.request, { path: "/FlashCards/removeFlashCards" }, { request }],
    [FlashCards.removeFlashCards, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const RemoveFlashCardsError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/FlashCards/removeFlashCards" }, { request }],
    [FlashCards.removeFlashCards, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// -- Syncs for /api/FlashCards/addCard --
export const AddCardRequestAuth: Sync = (
  { request, user, token, question, answer, name },
) => ({
  when: actions([
    Requesting.request,
    { path: "/FlashCards/addCard", question, answer, token, name, user },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(UserAuth._getAuthenticatedUser, { token }, {
      user,
    });
  },
  then: actions([FlashCards.addCard, { question, answer, user, name }]),
});

export const AddCardResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/FlashCards/addCard" }, { request }],
    [FlashCards.addCard, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const AddCardError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/FlashCards/addCard" }, { request }],
    [FlashCards.addCard, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// -- Syncs for /api/FlashCards/removeCard --
export const RemoveCardRequestAuth: Sync = (
  { request, user, name, token, card },
) => ({
  when: actions([
    Requesting.request,
    { path: "/FlashCards/removeCard", card, token, name, user },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(UserAuth._getAuthenticatedUser, { token }, {
      user,
    });
  },
  then: actions([FlashCards.removeCard, { card, user, name }]),
});

export const RemoveCardResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/FlashCards/removeCard" }, { request }],
    [FlashCards.removeCard, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const RemoveCardError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/FlashCards/removeCard" }, { request }],
    [FlashCards.removeCard, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
