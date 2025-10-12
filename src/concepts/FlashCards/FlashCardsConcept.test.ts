import { Collection, Db } from "npm:mongodb";
import { ID } from "@utils/types.ts";
import { freshID, testDb } from "@utils/database.ts";
import {
  assert,
  assertArrayIncludes,
  assertEquals,
  assertNotEquals,
} from "jsr:@std/assert";
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
      const retrievedFlashcards = await flashCardsConcept._getCards({
        user: testUser1,
        name: topicName,
      });
      assert(retrievedFlashcards && !("error" in retrievedFlashcards));
      assertEquals(retrievedFlashcards.name, topicName);
      assertEquals(retrievedFlashcards.cards.length, 2);
      assertEquals(
        retrievedFlashcards.cards[0].question,
        initialCards[0].question,
      );
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

      const retrievedFlashcards = await flashCardsConcept._getCards({
        user: testUser1,
        name: topicName,
      });
      assert(retrievedFlashcards && !("error" in retrievedFlashcards));
      assertEquals(retrievedFlashcards.cards.length, 3);
      assertArrayIncludes(retrievedFlashcards.cards.map((c) => c.question), [
        newQuestion,
      ]);
    });

    await t.step(
      "3. User removes a specific card from the flashcards",
      async () => {
        const retrievedFlashcards = await flashCardsConcept._getCards({
          user: testUser1,
          name: topicName,
        });
        assert(retrievedFlashcards && !("error" in retrievedFlashcards));
        const cardToRemoveId = retrievedFlashcards.cards.find((c) =>
          c.question === initialCards[1].question
        )?._id;
        assert(cardToRemoveId, "Card to remove should exist.");

        const removeCardResult = await flashCardsConcept.removeCard({
          user: testUser1,
          name: topicName,
          cardId: cardToRemoveId,
        });
        assert(removeCardResult && !("error" in removeCardResult));
        assertEquals(removeCardResult.question, initialCards[1].question); // Verify the returned card

        const updatedFlashcards = await flashCardsConcept._getCards({
          user: testUser1,
          name: topicName,
        });
        assert(updatedFlashcards && !("error" in updatedFlashcards));
        assertEquals(updatedFlashcards.cards.length, 2);
        const remainingCardQuestions = updatedFlashcards.cards.map((c) =>
          c.question
        );
        assertNotEquals(
          remainingCardQuestions.includes(initialCards[1].question),
          true,
        );
        assertArrayIncludes(remainingCardQuestions, [
          initialCards[0].question,
          "What is the largest planet in our solar system?",
        ]);
      },
    );
  } finally {
    await client.close();
  }
});

Deno.test("addCard: should allow different users to have flashcards with the same name", async () => {
  const [db, client] = await testDb();
  const flashCardsConcept = new FlashCardsConcept(db);
  try {
    const topicName = "Common Topic";
    const user1Card = {
      question: "User1 Question?",
      answer: "User1 Answer.",
    };
    const user2Card = {
      question: "User2 Question?",
      answer: "User2 Answer.",
    };

    // User 1 adds a card
    const addResult1 = await flashCardsConcept.addFlashcards({
      user: testUser1,
      name: topicName,
      cards: [{ 
      question: user1Card.question,
      answer: user1Card.answer,
      }]
    });
    assertEquals(addResult1, {});

    // User 2 adds a card with the same topic name
    const addResult2 = await flashCardsConcept.addFlashcards({
      user: testUser2,
      name: topicName,
      cards: [{
        question: user2Card.question,
        answer: user2Card.answer,
      }]
    });
    assertEquals(addResult2, {});

    // Retrieve and verify User 1's flashcards
    const user1Flashcards = await flashCardsConcept._getCards({
      user: testUser1,
      name: topicName,