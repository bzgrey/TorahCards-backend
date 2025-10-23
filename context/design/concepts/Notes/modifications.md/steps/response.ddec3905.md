---
timestamp: 'Thu Oct 23 2025 11:29:39 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251023_112939.a197589b.md]]'
content_id: ddec3905e65c75a051299bc3e947c7aaf55db8c43d5ef601fde28712a89b3dd5
---

# response:

```typescript
// file: src/FlashCards/FlashCardsConcept.ts
import { Collection, Db } from "npm:mongodb";
import { ID, Empty } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Declare collection prefix, use concept name
const PREFIX = "FlashCards" + ".";

// Generic types of this concept
type User = ID;

/**
 * Represents an individual card within a flashcard set.
 * This is embedded within the FlashCardSet document.
 */
interface Card {
  _id: ID; // Unique identifier for the card
  question: string;
  answer: string;
}

/**
 * Represents a collection of flashcards on a specific topic.
 *
 * @state
 * a set of FlashCards with
 *   a User
 *   a name String
 *   a set of Cards with
 *     a question String
 *     an answer String
 */
interface FlashCardSet {
  _id: ID; // Unique ID for this flashcard set document
  user: User; // The owner of this flashcard set
  name: string; // The name/topic of this flashcard set
  cards: Card[]; // The array of cards within this set
}

/**
 * @concept FlashCards [User]
 * @purpose create easy way to review topic of choice with questions and answers
 * @principle a user can create flashcards on different topics and can add or remove specific cards with questions and answers on them for any flashcards topic
 */
export default class FlashCardsConcept {
  private flashcards: Collection<FlashCardSet>;

  constructor(private readonly db: Db) {
    this.flashcards = this.db.collection(PREFIX + "flashcards");
  }

  /**
   * @action addFlashcards
   * @param {object} params - The action parameters.
   * @param {User} params.user - The ID of the user creating the flashcards.
   * @param {string} params.name - The name/topic of the flashcard set.
   * @param {Omit<Card, "_id">[]} params.cards - An array of initial cards (questions and answers).
   * @returns {Promise<Empty | { error: string }>} An empty object on success, or an error object.
   *
   * @requires FlashCards don't already exist with the same user and name
   * @effects adds new flashcards to set of FlashCards associated with the given user, name, and cards
   */
  async addFlashcards(
    { user, name, cards }: { user: User; name: string; cards: Omit<Card, "_id">[] },
  ): Promise<Empty | { error: string }> {
    // Check precondition: FlashCards don't already exist with the same user and name
    const existingFlashcards = await this.flashcards.findOne({ user, name });
    if (existingFlashcards) {
      return { error: `FlashCards set named '${name}' already exists for user ${user}.` };
    }

    // Generate _id for each new card provided
    const newCardsWithIds: Card[] = cards.map(card => ({
      _id: freshID(),
      question: card.question,
      answer: card.answer,
    }));

    // Create the new flashcard set document
    const newFlashCardSet: FlashCardSet = {
      _id: freshID(), // Generate _id for the set document
      user,
      name,
      cards: newCardsWithIds,
    };

    // Effect: adds new flashcards to set
    await this.flashcards.insertOne(newFlashCardSet);
    return {};
  }

  /**
   * @action removeFlashCards
   * @param {object} params - The action parameters.
   * @param {User} params.user - The ID of the user whose flashcards are to be removed.
   * @param {string} params.name - The name/topic of the flashcard set to remove.
   * @returns {Promise<Empty | { error: string }>} An empty object on success, or an error object.
   *
   * @requires FlashCards exist with the same user and name
   * @effects removes flashcards with given name and user
   */
  async removeFlashCards(
    { user, name }: { user: User; name: string },
  ): Promise<Empty | { error: string }> {
    // Check precondition and effect: FlashCards exist and are removed
    const result = await this.flashcards.deleteOne({ user, name });
    if (result.deletedCount === 0) {
      return { error: `FlashCards set named '${name}' not found for user ${user}.` };
    }
    return {};
  }

  /**
   * @action addCard
   * @param {object} params - The action parameters.
   * @param {User} params.user - The ID of the user owning the flashcards.
   * @param {string} params.name - The name/topic of the flashcard set to add the card to.
   * @param {string} params.question - The question for the new card.
   * @param {string} params.answer - The answer for the new card.
   * @returns {Promise<Empty | { error: string }>} An empty object on success, or an error object.
   *
   * @requires FlashCards already exist with the same user and name
   * @effects adds new card to FlashCards of given name and user with given question and answer
   */
  async addCard(
    { user, name, question, answer }: { user: User; name: string; question: string; answer: string },
  ): Promise<Empty | { error: string }> {
    // Create new card with a fresh ID
    const newCard: Card = { _id: freshID(), question, answer };

    // Check precondition and effect: FlashCards exist and card is added
    const result = await this.flashcards.updateOne(
      { user, name },
      { $push: { cards: newCard } }, // Add the new card to the 'cards' array
    );

    if (result.matchedCount === 0) {
      return { error: `FlashCards set named '${name}' not found for user ${user}.` };
    }
    return {};
  }

  /**
   * @action removeCard
   * @param {object} params - The action parameters.
   * @param {User} params.user - The ID of the user owning the flashcards.
   * @param {string} params.name - The name/topic of the flashcard set to remove the card from.
   * @param {ID} params.cardId - The ID of the card to be removed. (Note: The spec uses 'card: Card', but practically an ID is used for removal.)
   * @returns {Promise<Card | { error: string }>} The removed card object on success, or an error object.
   *
   * @requires FlashCards already exist with the same user and name and the given card exists in those FlashCards
   * @effects removes card from FlashCards of given name and user
   */
  async removeCard(
    { user, name, cardId }: { user: User; name: string; cardId: ID },
  ): Promise<Card | { error: string }> {
    // First, find the flashcard set to verify preconditions and get the card to return
    const flashcardSet = await this.flashcards.findOne({ user, name });

    if (!flashcardSet) {
      return { error: `FlashCards set named '${name}' not found for user ${user}.` };
    }

    const cardToRemove = flashcardSet.cards.find(c => c._id === cardId);
    if (!cardToRemove) {
      return { error: `Card with ID '${cardId}' not found in FlashCards set '${name}'.` };
    }

    // Effect: removes card from FlashCards
    const result = await this.flashcards.updateOne(
      { _id: flashcardSet._id }, // Update by _id of the set
      { $pull: { cards: { _id: cardId } } }, // Pull the card from the 'cards' array
    );

    if (result.matchedCount === 0) {
      // This case should ideally not happen if flashcardSet was found, but good for robustness.
      return { error: "Failed to update FlashCards set to remove card." };
    }

    return cardToRemove; // Return the full removed card object as per spec
  }

  /**
   * @query _getUserCards
   * @param {object} params - The query parameters.
   * @param {User} params.user - The ID of the user whose flashcards are to be retrieved.
   * @returns {Promise<{flashcardSet: {id: ID, name: string, cards: Card[]}}[]>} An array of objects,
   *          each containing a 'flashcardSet' key with the ID, name, and cards of a flashcard set.
   *
   * @effects returns array of all Flashcards of given user, where each item includes its name and corresponding question/answer pairs.
   */
  async _getUserCards({ user }: { user: User }): Promise<{ flashcardSet: {id: ID, name: string, cards: Card[]} }[]> {
    const userFlashcards = await this.flashcards.find({ user }).project<{_id: ID, name: string, cards: Card[]}>({
      _id: 1, // Include _id
      name: 1, // Include name
      cards: 1, // Include cards
      user: 0 // Exclude user field from the projected inner object
    }).toArray();

    // Map _id to id and wrap each projected set in a 'flashcardSet' key
    return userFlashcards.map(set => ({
      flashcardSet: {
        id: set._id,
        name: set.name,
        cards: set.cards
      }
    }));
  }

  /**
   * @query _getCards
   * @param {object} params - The query parameters.
   * @param {User} params.user - The ID of the user owning the flashcards.
   * @param {string} params.name - The name/topic of the flashcard set to retrieve cards from.
   * @returns {Promise<{id: ID, question: string, answer: string}[] | { error: string }>} An array of Card objects
   *          (each with id, question, answer) within the specified FlashCardSet, or an error object if not found.
   *
   * @requires FlashCards exist with the same user and name
   * @effects returns array of Card objects (question/answer pairs) for the given user and flashcard name.
   */
  async _getCards(
    { user, name }: { user: User; name: string },
  ): Promise<{id: ID, question: string, answer: string}[] | { error: string }> {
    // Check precondition: FlashCards exist with the same user and name
    const flashcardSet = await this.flashcards.findOne({ user, name });
    if (!flashcardSet) {
      return { error: `FlashCards set named '${name}' not found for user ${user}.` };
    }
    // Effect: returns array of Card objects with _id mapped to id
    return flashcardSet.cards.map(card => ({
      id: card._id,
      question: card.question,
      answer: card.answer
    }));
  }

  /**
   * @query _searchFlashcards
   * @param {object} params - The query parameters.
   * @param {User} params.user - The ID of the user whose flashcards are to be searched.
   * @param {string} params.searchTerm - The text to search for in flashcard set names.
   * @returns {Promise<{ flashcardSet: {id: ID, name: string, cards: Card[]}; score: number }[]>} An array of matching FlashCardSet
   *          objects along with their relevance scores.
   *
   * @effects returns an array of flashcard sets belonging to the given user whose names match the `searchTerm`
   *          using `$text` search, ordered by relevance score.
   *
   * @note This query requires a MongoDB Text Index to be created on the `name` field of the `FlashCards.flashcards` collection.
   *       Example index: `{ "name": "text" }`. The `$text` operator provides basic full-text search, including phrase matching
   *       (if the search term is quoted) and stemming, but does not support fuzzy matching directly.
   */
  async _searchFlashcards(
    { user, searchTerm }: { user: User; searchTerm: string },
  ): Promise<{ flashcardSet: {id: ID, name: string, cards: Card[]}; score: number }[]> {
    // Use MongoDB aggregation pipeline with $text for full-text search
    const results = await this.flashcards.aggregate<{ flashcardSet: FlashCardSet; score: number }>([
      {
        // $match stage for filtering by user and applying $text search
        $match: {
          user: user,
          $text: {
            $search: searchTerm,
          },
        },
      },
      {
        // Project the original document and the text search score
        $project: {
          _id: 0, // Exclude the original _id from the root level of the result document
          flashcardSet: { // Nest the relevant fields under 'flashcardSet'
            id: "$_id", // Map _id to id
            name: "$name",
            cards: "$cards",
            // user: "$user" // Exclude user from this nested object as per _searchFlashcards spec implied structure
          },
          score: { $meta: "textScore" }, // Include the text search relevance score
        },
      },
      {
        // Sort by the text search score in descending order (greatest first)
        $sort: {
          score: { $meta: "textScore" },
        },
      },
    ]).toArray();

    // The aggregation pipeline already transforms the data to the desired shape
    // so we just return the results directly. The `score` field is already a number.
    return results as unknown as { flashcardSet: {id: ID, name: string, cards: Card[]}; score: number }[];
  }
}
```
