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
      }],
    });
    assertEquals(addResult1, {});

    // User 2 adds a card with the same topic name
    const addResult2 = await flashCardsConcept.addFlashcards({
      user: testUser2,
      name: topicName,
      cards: [{
        question: user2Card.question,
        answer: user2Card.answer,
      }],
    });
    assertEquals(addResult2, {});

    // Retrieve and verify User 1's flashcards
    const user1Flashcards = await flashCardsConcept._getCards({
      user: testUser1,
      name: topicName,
    });
    assert(user1Flashcards && !("error" in user1Flashcards));
    assertEquals(user1Flashcards.cards.length, 1);
    assertEquals(user1Flashcards.cards[0].question, user1Card.question);

    // Retrieve and verify User 2's flashcards
    const user2Flashcards = await flashCardsConcept._getCards({
      user: testUser2,
      name: topicName,
    });
    assert(user2Flashcards && !("error" in user2Flashcards));
    assertEquals(user2Flashcards.cards.length, 1);
    assertEquals(user2Flashcards.cards[0].question, user2Card.question);
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
        cards: [{
          question: "Pythagorean theorem?",
          answer: "a^2 + b^2 = c^2",
        }],
      });
      assertEquals(result, {});
    });

    await t.step("Retrieve all flashcard sets for user 1", async () => {
      const userCards = await flashCardsConcept._getUserCards({
        user: testUser1,
      });
      assertEquals(userCards.length, 2);
      const names = userCards.map((fcs) => fcs.name);
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

    await t.step(
      "Verify user 1's cards are isolated from user 2's",
      async () => {
        const user1Cards = await flashCardsConcept._getUserCards({
          user: testUser1,
        });
        assertEquals(user1Cards.length, 2); // Should still be 2 for user 1
        const user2Cards = await flashCardsConcept._getUserCards({
          user: testUser2,
        });
        assertEquals(user2Cards.length, 1); // Should be 1 for user 2
      },
    );
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
      const removeResult = await flashCardsConcept.removeFlashCards({
        user: testUser1,
        name: topicName,
      });
      assertEquals(removeResult, {}); // Expect success

      const retrievedFlashcards = await flashCardsConcept._getCards({
        user: testUser1,
        name: topicName,
      });
      assert(retrievedFlashcards && "error" in retrievedFlashcards); // Expect error as it's removed
    });

    await t.step("Attempt to remove a non-existent flashcard set", async () => {
      const removeResult = await flashCardsConcept.removeFlashCards({
        user: testUser1,
        name: "NonExistent",
      });
      assert(removeResult && "error" in removeResult); // Expect error
    });
  } finally {
    await client.close();
  }
});
