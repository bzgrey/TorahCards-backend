/**
 * The Requesting concept exposes passthrough routes by default,
 * which allow POSTs to the route:
 *
 * /{REQUESTING_BASE_URL}/{Concept name}/{action or query}
 *
 * to passthrough directly to the concept action or query.
 * This is a convenient and natural way to expose concepts to
 * the world, but should only be done intentionally for public
 * actions and queries.
 *
 * This file allows you to explicitly set inclusions and exclusions
 * for passthrough routes:
 * - inclusions: those that you can justify their inclusion
 * - exclusions: those to exclude, using Requesting routes instead
 */

/**
 * INCLUSIONS
 *
 * Each inclusion must include a justification for why you think
 * the passthrough is appropriate (e.g. public query).
 *
 * inclusions = {"route": "justification"}
 */

export const inclusions: Record<string, string> = {
  // Feel free to delete these example inclusions
  "/api/FlashCards/_getUserCards": "flashcards are public",
  "/api/Notes/_getUserNotes": "notes are public",
  "/api/FlashCards/_getCards": "flashcards are public",
  "/api/Notes/_getNotes": "notes are public",
  "/api/FlashCards/_searchFlashcards": "flashcards are public",
  "/api/Notes/_searchNotes": "notes are public",
  "/api/FlashCards/_getFlashcardInfo": "flashcards are public",
  "/api/Notes/_getNotesInfo": "notes are public",

  "/api/UserAuth/register": "user registration is public",
  "/api/UserAuth/login": "user login is public",
  "/api/UserAuth/logout": "logout takes token as input",
  "/api/UserAuth/_getUsername": "usernames are public",
  "/api/UserAuth/_getAuthenticatedUser": "takes token as input",
};

/**
 * EXCLUSIONS
 *
 * Excluded routes fall back to the Requesting concept, and will
 * instead trigger the normal Requesting.request action. As this
 * is the intended behavior, no justification is necessary.
 *
 * exclusions = ["route"]
 */

export const exclusions: Array<string> = [
  // Feel free to delete these example exclusions
  "/api/FlashCards/ensureIndexes",
  "/api/Notes/ensureIndexes",
  "/api/Notes/addNotes",
  "/api/Notes/removeNotes",
  // "/api/Notes/notesToFlashCards",
  // "/api/FlashCards/addFlashCards",
  // "/api/FlashCards/removeFlashCards",
  // "/api/FlashCards/addCard",
  // "/api/FlashCards/removeCard",
  // "/api/Notes/parseLLMToFlashcards",
  // "/api/Notes/createLLMPrompt",
  // "/api/Following/follow",
  // "/api/Following/unfollow",
  // "/api/Following/_getFollowedItems",
  // "/api/Labeling/createLabel",
  // "/api/Labeling/deleteLabel",
  // "/api/Labeling/addLabel",
  // "/api/Labeling/deleteItem",
  // "/api/Labeling/_getLabelItems",
  // "/api/Labeling/_getItemLabels",
  // "/api/UserAuth/_getPassword",
];
