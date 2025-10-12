
[@implementation](implementation.md)

[@testing-concepts](../../background/testing-concepts.md)

# test: FlashCards 
- Only give a test for the operational principle and 3-5 additional tests for interesting scenarios. 
- Don't worry about testing for error messages
# response:

```typescript
// file: src/FlashCards/FlashCardsConcept.test.ts
import { Collection, Db } from "npm:mongodb";
import { ID } from "@utils/types.ts";
import { freshID, testDb } from "@utils/database.ts";
import { assertEquals, assertNotEquals, assertArrayIncludes, assert } from "jsr:@std/assert";
import FlashCardsConcept from "./FlashCardsConcept.ts";

// Define a test user ID
const testUser1: ID = "user:Alice" as ID;
const testUser2: ID = "user:Bob" as ID;

Deno.test("FlashCards Concept - Operational Principle Trace", async (t) => {
  const [db, client] = await testDb();
  const flashCardsConcept = new FlashCardsConcept(db);

  try {
    // # trace:
    // a user can create flashcards on different topics and can add or remove specific cards
    // with questions and answers on them for any flashcards topic

    const topicName = "Science Basics";
    const initialCards = [
      { question: "What is the chemical symbol for water?", answer: "H2O" },
      { question: "What is the capital of France?", answer: "Paris" }, // Intentionally wrong for now
    ];

    await t.step("1. User creates flashcards on a topic", async () => {
      const addResult = await flashCardsConcept.addFlashcards({
        user: testUser1,
        name: topicName,
        cards: initialCards,
      });
      assertEquals(addResult, {}); // Expect success
      const retrievedFlashcards = await flashCardsConcept._getCards({ user: testUser1, name: topicName });
      assert(retrievedFlashcards && !("error" in retrievedFlashcards));
      assertEquals(retrievedFlashcards.name, topicName);
      assertEquals(retrievedFlashcards.cards.length, 2);
      assertEquals(retrievedFlashcards.cards[0].question, initialCards[0].question);
    });

    await t.step("2. User adds a new card to the flashcards", async () => {
      const newQuestion = "What is the largest planet in our solar system?";
      const newAnswer = "Jupiter";
      const addCardResult = await flashCardsConcept.addCard({
        user: testUser1,
        name: topicName,
        question: newQuestion,
        answer: newAnswer,
      });
      assertEquals(addCardResult, {}); // Expect success

      const retrievedFlashcards = await flashCardsConcept._getCards({ user: testUser1, name: topicName });
      assert(retrievedFlashcards && !("error" in retrievedFlashcards));
      assertEquals(retrievedFlashcards.cards.length, 3);
      assertArrayIncludes(retrievedFlashcards.cards.map(c => c.question), [newQuestion]);
    });

    await t.step("3. User removes a specific card from the flashcards", async () => {
      const retrievedFlashcards = await flashCardsConcept._getCards({ user: testUser1, name: topicName });
      assert(retrievedFlashcards && !("error" in retrievedFlashcards));
      const cardToRemoveId = retrievedFlashcards.cards.find(c => c.question === initialCards[1].question)?._id;
      assert(cardToRemoveId, "Card to remove should exist.");

      const removeCardResult = await flashCardsConcept.removeCard({
        user: testUser1,
        name: topicName,
        cardId: cardToRemoveId,
      });
      assert(removeCardResult && !("error" in removeCardResult));
      assertEquals(removeCardResult.question, initialCards[1].question); // Verify the returned card

      const updatedFlashcards = await flashCardsConcept._getCards({ user: testUser1, name: topicName });
      assert(updatedFlashcards && !("error" in updatedFlashcards));
      assertEquals(updatedFlashcards.cards.length, 2);
      const remainingCardQuestions = updatedFlashcards.cards.map(c => c.question);
      assertNotEquals(remainingCardQuestions.includes(initialCards[1].question), true);
      assertArrayIncludes(remainingCardQuestions, [initialCards[0].question, "What is the largest planet in our solar system?"]);
    });
  } finally {
    await client.close();
  }
});

Deno.test("FlashCards Concept - Basic addFlashcards and _getUserCards", async (t) => {
  const [db, client] = await testDb();
  const flashCardsConcept = new FlashCardsConcept(db);

  try {
    const topic1 = "History Facts";
    const topic2 = "Math Formulas";

    await t.step("Add first flashcard set for user 1", async () => {
      const result = await flashCardsConcept.addFlashcards({
        user: testUser1,
        name: topic1,
        cards: [{ question: "WWI Start?", answer: "1914" }],
      });
      assertEquals(result, {});
    });

    await t.step("Add second flashcard set for user 1", async () => {
      const result = await flashCardsConcept.addFlashcards({
        user: testUser1,
        name: topic2,
        cards: [{ question: "Pythagorean theorem?", answer: "a^2 + b^2 = c^2" }],
      });
      assertEquals(result, {});
    });

    await t.step("Retrieve all flashcard sets for user 1", async () => {
      const userCards = await flashCardsConcept._getUserCards({ user: testUser1 });
      assertEquals(userCards.length, 2);
      const names = userCards.map(fcs => fcs.name);
      assertArrayIncludes(names, [topic1, topic2]);
    });

    await t.step("Add a flashcard set for user 2", async () => {
      const result = await flashCardsConcept.addFlashcards({
        user: testUser2,
        name: "User2 Topic",
        cards: [{ question: "User2 Q", answer: "User2 A" }],
      });
      assertEquals(result, {});
    });

    await t.step("Verify user 1's cards are isolated from user 2's", async () => {
      const user1Cards = await flashCardsConcept._getUserCards({ user: testUser1 });
      assertEquals(user1Cards.length, 2); // Should still be 2 for user 1
      const user2Cards = await flashCardsConcept._getUserCards({ user: testUser2 });
      assertEquals(user2Cards.length, 1); // Should be 1 for user 2
    });
  } finally {
    await client.close();
  }
});

Deno.test("FlashCards Concept - removeFlashCards", async (t) => {
  const [db, client] = await testDb();
  const flashCardsConcept = new FlashCardsConcept(db);

  try {
    const topicName = "Ephemeral Topic";
    await flashCardsConcept.addFlashcards({
      user: testUser1,
      name: topicName,
      cards: [{ question: "Q1", answer: "A1" }],
    });

    await t.step("Remove an existing flashcard set", async () => {
      const removeResult = await flashCardsConcept.removeFlashCards({ user: testUser1, name: topicName });
      assertEquals(removeResult, {}); // Expect success

      const retrievedFlashcards = await flashCardsConcept._getCards({ user: testUser1, name: topicName });
      assert(retrievedFlashcards && "error" in retrievedFlashcards); // Expect error as it's removed
    });

    await t.step("Attempt to remove a non-existent flashcard set", async () => {
      const removeResult = await flashCardsConcept.removeFlashCards({ user: testUser1, name: "NonExistent" });
      assert(removeResult && "error" in removeResult); // Expect error
    });
  } finally {
    await client.close();
  }
});

Deno.test("FlashCards Concept - addCard to existing set", async (t) => {
  const [db, client] = await testDb();
  const flashCardsConcept = new FlashCardsConcept(db);

  try {
    const topicName = "Growing Topic";
    await flashCardsConcept.addFlashcards({
      user: testUser1,
      name: topicName,
      cards: [{ question: "Initial Q", answer: "Initial A" }],
    });

    await t.step("Add a new card to the set", async () => {
      const addCardResult = await flashCardsConcept.addCard({
        user: testUser1,
        name: topicName,
        question: "New Q1",
        answer: "New A1",
      });
      assertEquals(addCardResult, {});

      const retrieved = await flashCardsConcept._getCards({ user: testUser1, name: topicName });
      assert(retrieved && !("error" in retrieved));
      assertEquals(retrieved.cards.length, 2);
      assertArrayIncludes(retrieved.cards.map(c => c.question), ["Initial Q", "New Q1"]);
    });

    await t.step("Add another card to the set", async () => {
      const addCardResult = await flashCardsConcept.addCard({
        user: testUser1,
        name: topicName,
        question: "New Q2",
        answer: "New A2",
      });
      assertEquals(addCardResult, {});

      const retrieved = await flashCardsConcept._getCards({ user: testUser1, name: topicName });
      assert(retrieved && !("error" in retrieved));
      assertEquals(retrieved.cards.length, 3);
      assertArrayIncludes(retrieved.cards.map(c => c.question), ["Initial Q", "New Q1", "New Q2"]);
    });

    await t.step("Attempt to add a card to a non-existent set", async () => {
      const addCardResult = await flashCardsConcept.addCard({
        user: testUser1,
        name: "NonExistentTopic",
        question: "Q?",
        answer: "A!",
      });
      assert(addCardResult && "error" in addCardResult); // Expect error
    });
  } finally {
    await client.close();
  }
});

Deno.test("FlashCards Concept - removeCard from a specific set", async (t) => {
  const [db, client] = await testDb();
  const flashCardsConcept = new FlashCardsConcept(db);

  try {
    const topicName = "Shrinking Topic";
    const cards = [
      { question: "Q_keep1", answer: "A_keep1" },
      { question: "Q_remove", answer: "A_remove" },
      { question: "Q_keep2", answer: "A_keep2" },
    ];
    await flashCardsConcept.addFlashcards({ user: testUser1, name: topicName, cards: cards });

    let retrievedFlashcards = await flashCardsConcept._getCards({ user: testUser1, name: topicName });
    assert(retrievedFlashcards && !("error" in retrievedFlashcards));
    assertEquals(retrievedFlashcards.cards.length, 3);

    const cardToRemove = retrievedFlashcards.cards.find(c => c.question === "Q_remove");
    assert(cardToRemove, "Card to remove must exist");
    const cardToRemoveId = cardToRemove._id;

    await t.step("Remove an existing card from the set", async () => {
      const removeCardResult = await flashCardsConcept.removeCard({
        user: testUser1,
        name: topicName,
        cardId: cardToRemoveId,
      });
      assert(removeCardResult && !("error" in removeCardResult));
      assertEquals(removeCardResult.question, "Q_remove");

      retrievedFlashcards = await flashCardsConcept._getCards({ user: testUser1, name: topicName });
      assert(retrievedFlashcards && !("error" in retrievedFlashcards));
      assertEquals(retrievedFlashcards.cards.length, 2);
      const remainingQuestions = retrievedFlashcards.cards.map(c => c.question);
      assertNotEquals(remainingQuestions.includes("Q_remove"), true);
      assertArrayIncludes(remainingQuestions, ["Q_keep1", "Q_keep2"]);
    });

    await t.step("Attempt to remove a non-existent card from the set", async () => {
      const nonExistentCardId = freshID();
      const removeCardResult = await flashCardsConcept.removeCard({
        user: testUser1,
        name: topicName,
        cardId: nonExistentCardId,
      });
      assert(removeCardResult && "error" in removeCardResult); // Expect error
    });

    await t.step("Attempt to remove a card from a non-existent flashcard set", async () => {
      const removeCardResult = await flashCardsConcept.removeCard({
        user: testUser1,
        name: "AnotherNonExistentTopic",
        cardId: cardToRemoveId, // Use the ID of a previously removed card
      });
      assert(removeCardResult && "error" in removeCardResult); // Expect error
    });
  } finally {
    await client.close();
  }
});
```