---
timestamp: 'Mon Oct 20 2025 14:00:42 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251020_140042.624eec5b.md]]'
content_id: 8f09bd9baeb060c25cc5fe18d72b6c1275064f140abc5f1ddb8f539f779de99c
---

# file: src/FlashCards/FlashCardsConcept.ts

```typescript
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
   * @returns {Promise<FlashCardSet[]>} An array of all FlashCardSet objects belonging to the given user.
   *
   * @effects returns array of all Flashcards of given user
   */
  async _getUserCards({ user }: { user: User }): Promise<FlashCardSet[]> {
    // Effects: returns all Flashcards of given user
    const userFlashcards = await this.flashcards.find({ user }).toArray();
    return userFlashcards;
  }

  /**
   * @query _getCards
   * @param {object} params - The query parameters.
   * @param {User} params.user - The ID of the user owning the flashcards.
   * @param {string} params.name - The name/topic of the flashcard set to retrieve cards from.
   * @returns {Promise<Card[] | { error: string }>} An array of Card objects within the specified FlashCardSet, or an error object if not found.
   *
   * @requires FlashCards exist with the same user and name
   * @effects returns array of cards object of given user and name
   */
  async _getCards(
    { user, name }: { user: User; name: string },
  ): Promise<Card[] | { error: string }> {
    // Check precondition: cards of given user and name exist
    const flashcardSet = await this.flashcards.findOne({ user, name });
    if (!flashcardSet) {
      return { error: `FlashCards set named '${name}' not found for user ${user}.` };
    }
    // Effect: returns array of Card objects
    return flashcardSet.cards;
  }

  /**
   * @query _searchFlashcards
   * @param {object} params - The query parameters.
   * @param {User} params.user - The ID of the user whose flashcards are to be searched.
   * @param {string} params.searchTerm - The text to search for in flashcard set names.
   * @returns {Promise<{ flashcardSet: FlashCardSet; score: number }[]>} An array of matching FlashCardSet objects along with their relevance scores.
   *
   * @effects returns an array of flashcard sets belonging to the given user whose names match the `searchTerm`
   *          using fuzzy and phrase matching, ordered by relevance score.
   *
   * @note This query assumes a MongoDB Atlas Search index named 'default' is configured on the 'name' field
   *       of the 'FlashCards.flashcards' collection, with text and fuzzy capabilities.
   */
  async _searchFlashcards(
    { user, searchTerm }: { user: User; searchTerm: string },
  ): Promise<{ flashcardSet: FlashCardSet; score: number }[]> {
    // Use MongoDB aggregation pipeline with $search for full-text search
    const results = await this.flashcards.aggregate<{ flashcardSet: FlashCardSet; score: number }>([
      {
        // Atlas Search stage - requires an Atlas Search index on 'name' field
        $search: {
          index: "default", // Assuming a default Atlas Search index
          compound: {
            must: [
              // Filter by user ID
              {
                equals: {
                  path: "user",
                  value: user,
                },
              },
            ],
            should: [
              {
                text: {
                  query: searchTerm,
                  path: "name",
                  fuzzy: {
                    maxEdits: 1, // Allow 1 edit for fuzzy matching
                    prefixLength: 2, // Minimum prefix length to not apply fuzzy search
                  },
                  // phrase: true // Text operator inherently handles phrases, but 'phrase' operator can be more strict if needed
                },
              },
              {
                phrase: { // Explicit phrase search for better relevance if exact phrase matches
                  query: searchTerm,
                  path: "name",
                },
              },
            ],
            minimumShouldMatch: 1 // At least one of the 'should' clauses must match
          },
          highlight: { // Optional: for highlighting matches in UI
            path: "name",
          },
          returnStoredSource: true, // Return the original document
        },
      },
      {
        // Project the original document and the search score
        $project: {
          _id: 0, // Exclude the original _id
          flashcardSet: "$$ROOT", // The original document is the flashcard set
          score: { $meta: "searchScore" }, // Include the search score
        },
      },
    ]).toArray();

    return results;
  }
}
```
