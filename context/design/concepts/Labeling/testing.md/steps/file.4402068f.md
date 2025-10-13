---
timestamp: 'Sun Oct 12 2025 20:48:38 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251012_204838.d05b4944.md]]'
content_id: 4402068f7951d6871fff6a23a6e2eb7e957382bf0f4d2114eb0ece970791d545
---

# file:`src/Notes/NotesConcept.test.ts`

```typescript
import { assertEquals, assertExists, assertNotEquals } from "jsr:@std/assert";
import { testDb, freshID } from "@utils/database.ts";
import { ID, Empty } from "@utils/types.ts";
import NotesConcept from "./NotesConcept.ts";

// --- Mocking GeminiLLM for Testing ---
// We need to mock the GeminiLLM dependency to ensure our tests are fast,
// predictable, and don't rely on external API calls.
// This approach temporarily replaces the prototype method for the duration of a test.

import { GeminiLLM } from "@utils/gemini-llm.ts"; // Import the actual LLM

// Store the original method to restore it after mocking
const originalGeminiExecuteLLM = GeminiLLM.prototype.executeLLM;

// Variable to hold the response our mock will return
let mockLLMResponse: string;

/**
 * Mocks the `executeLLM` method of `GeminiLLM` to return a predefined response.
 * @param response The string response the mock LLM should return.
 */
function mockGeminiLLM(response: string) {
  mockLLMResponse = response;
  GeminiLLM.prototype.executeLLM = async (_prompt: string) => {
    return Promise.resolve(mockLLMResponse);
  };
}

/**
 * Restores the original `executeLLM` method of `GeminiLLM`.
 */
function restoreGeminiLLM() {
  GeminiLLM.prototype.executeLLM = originalGeminiExecuteLLM;
}

// --- Test Data ---
const TEST_USER_ALICE = "user:Alice" as ID;
const TEST_USER_BOB = "user:Bob" as ID;

const NOTE_NAME_MATH = "Math Facts";
const NOTE_CONTENT_MATH = "1 + 1 = 2; 2 * 2 = 4.";

const NOTE_NAME_PHYSICS = "Physics Concepts";
const NOTE_CONTENT_PHYSICS = "Newton's First Law: An object at rest stays at rest.";

const NOTE_NAME_EMPTY_LLM = "Empty LLM Content";
const NOTE_CONTENT_EMPTY_LLM = "This note has no useful information for flashcards.";

const FLASHCARD_RESPONSE_MATH = JSON.stringify({
  cards: [
    { id: 1, question: "What is 1 + 1?", answer: "2" },
    { id: 2, question: "What is 2 * 2?", answer: "4" },
  ],
});

const FLASHCARD_RESPONSE_EMPTY = JSON.stringify({
  cards: [],
});

// --- Deno Tests ---

Deno.test("NotesConcept: Principle - Add, generate flashcards, remove notes", async () => {
  const [db, client] = await testDb();
  const notesConcept = new NotesConcept(db);

  try {
    // 1. User Alice adds a note "Math Facts"
    const addMathResult = await notesConcept.addNotes({
      user: TEST_USER_ALICE,
      name: NOTE_NAME_MATH,
      content: NOTE_CONTENT_MATH,
    });
    assertEquals(addMathResult, {}); // Should succeed

    // Verify it exists
    const retrievedMathNote = await notesConcept._getNotes({
      user: TEST_USER_ALICE,
      name: NOTE_NAME_MATH,
    });
    assertEquals(retrievedMathNote, [NOTE_CONTENT_MATH]);

    // 2. User Alice adds another note "Physics Concepts"
    const addPhysicsResult = await notesConcept.addNotes({
      user: TEST_USER_ALICE,
      name: NOTE_NAME_PHYSICS,
      content: NOTE_CONTENT_PHYSICS,
    });
    assertEquals(addPhysicsResult, {}); // Should succeed

    // Verify it exists
    const retrievedPhysicsNote = await notesConcept._getNotes({
      user: TEST_USER_ALICE,
      name: NOTE_NAME_PHYSICS,
    });
    assertEquals(retrievedPhysicsNote, [NOTE_CONTENT_PHYSICS]);

    // 3. User Alice attempts to generate flashcards from "Math Facts"
    mockGeminiLLM(FLASHCARD_RESPONSE_MATH); // Mock LLM to return valid flashcards
    const flashcardResult = await notesConcept.notesToFlashCards({
      user: TEST_USER_ALICE,
      name: NOTE_NAME_MATH,
    });
    assertExists((flashcardResult as { cards: unknown }).cards);
    assertEquals((flashcardResult as { cards: unknown[] }).cards.length, 2);
    assertEquals(
      (flashcardResult as { cards: { question: string }[] }).cards[0].question,
      "What is 1 + 1?",
    );

    // 4. User Alice removes "Physics Concepts"
    const removePhysicsResult = await notesConcept.removeNotes({
      user: TEST_USER_ALICE,
      name: NOTE_NAME_PHYSICS,
    });
    assertEquals(removePhysicsResult, {}); // Should succeed

    // 5. Verify "Physics Concepts" is no longer present
    const absentPhysicsNote = await notesConcept._getNotes({
      user: TEST_USER_ALICE,
      name: NOTE_NAME_PHYSICS,
    });
    assertNotEquals(absentPhysicsNote, [NOTE_CONTENT_PHYSICS]); // Should not return the content
    assertExists((absentPhysicsNote as { error: string }).error); // Should indicate an error (not found)
  } finally {
    await client.close();
    restoreGeminiLLM(); // Restore LLM after the test
  }
});

Deno.test("NotesConcept: Cannot add duplicate notes for the same user", async () => {
  const [db, client] = await testDb();
  const notesConcept = new NotesConcept(db);

  try {
    const addResult1 = await notesConcept.addNotes({
      user: TEST_USER_BOB,
      name: NOTE_NAME_MATH,
      content: NOTE_CONTENT_MATH,
    });
    assertEquals(addResult1, {});

    // Attempt to add the same note again for Bob
    const addResult2 = await notesConcept.addNotes({
      user: TEST_USER_BOB,
      name: NOTE_NAME_MATH,
      content: "Updated content.",
    });
    assertExists((addResult2 as { error: string }).error); // Expect an error
  } finally {
    await client.close();
  }
});

Deno.test("NotesConcept: Retrieve all notes for a user", async () => {
  const [db, client] = await testDb();
  const notesConcept = new NotesConcept(db);

  try {
    await notesConcept.addNotes({
      user: TEST_USER_ALICE,
      name: NOTE_NAME_MATH,
      content: NOTE_CONTENT_MATH,
    });
    await notesConcept.addNotes({
      user: TEST_USER_ALICE,
      name: NOTE_NAME_PHYSICS,
      content: NOTE_CONTENT_PHYSICS,
    });

    const userNotes = await notesConcept._getUserNotes({ user: TEST_USER_ALICE });
    assertEquals(userNotes.length, 2);
    assertEquals(
      (userNotes as { name: string }[])
        .some((note) => note.name === NOTE_NAME_MATH && note.content === NOTE_CONTENT_MATH),
      true,
    );
    assertEquals(
      (userNotes as { name: string }[])
        .some((note) => note.name === NOTE_NAME_PHYSICS && note.content === NOTE_CONTENT_PHYSICS),
      true,
    );
  } finally {
    await client.close();
  }
});

Deno.test("NotesConcept: Retrieve content of a specific note", async () => {
  const [db, client] = await testDb();
  const notesConcept = new NotesConcept(db);

  try {
    await notesConcept.addNotes({
      user: TEST_USER_ALICE,
      name: NOTE_NAME_MATH,
      content: NOTE_CONTENT_MATH,
    });

    const retrievedContent = await notesConcept._getNotes({
      user: TEST_USER_ALICE,
      name: NOTE_NAME_MATH,
    });
    assertEquals(retrievedContent, [NOTE_CONTENT_MATH]);
  } finally {
    await client.close();
  }
});

Deno.test("NotesConcept: Attempt to remove a non-existent note", async () => {
  const [db, client] = await testDb();
  const notesConcept = new NotesConcept(db);

  try {
    const removeResult = await notesConcept.removeNotes({
      user: TEST_USER_BOB,
      name: "NonExistentNote",
    });
    assertExists((removeResult as { error: string }).error); // Expect an error
  } finally {
    await client.close();
  }
});

Deno.test("NotesConcept: notesToFlashCards returns empty if LLM generates no cards", async () => {
  const [db, client] = await testDb();
  const notesConcept = new NotesConcept(db);

  try {
    await notesConcept.addNotes({
      user: TEST_USER_ALICE,
      name: NOTE_NAME_EMPTY_LLM,
      content: NOTE_CONTENT_EMPTY_LLM,
    });

    mockGeminiLLM(FLASHCARD_RESPONSE_EMPTY); // Mock LLM to return no flashcards
    const flashcardResult = await notesConcept.notesToFlashCards({
      user: TEST_USER_ALICE,
      name: NOTE_NAME_EMPTY_LLM,
    });

    assertExists((flashcardResult as { cards: unknown }).cards);
    assertEquals((flashcardResult as { cards: unknown[] }).cards.length, 0);
  } finally {
    await client.close();
    restoreGeminiLLM(); // Restore LLM after the test
  }
});

```
