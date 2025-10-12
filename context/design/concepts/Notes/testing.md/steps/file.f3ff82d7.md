---
timestamp: 'Sat Oct 11 2025 23:15:39 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251011_231539.11c5687f.md]]'
content_id: f3ff82d78030941ab488e1fd643ffe884a3a561f3941ee608ecdc6b4fa498d03
---

# file: src/Notes/NotesConcept.test.ts

```typescript
import { assertEquals } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import NotesConcept from "./NotesConcept.ts";

// Import GeminiLLM to be able to monkey-patch its prototype for testing
import { GeminiLLM } from "@utils/gemini-llm.ts";

// --- Test Data ---
const USER_ALICE = "user:Alice" as ID;
const USER_BOB = "user:Bob" as ID;
const NOTE_NAME_TORAH = "Torah Study" as string;
const NOTE_CONTENT_TORAH = "The Torah is the central concept in the Jewish tradition. It refers to the Pentateuch, the first five books of the Hebrew Bible, which contains the divine laws and commandments given by God to Moses on Mount Sinai. It also encompasses the entire body of Jewish teaching, law, and custom. The Torah is considered the foundation of Jewish religious observance and moral guidance." as string;

const NOTE_NAME_TALMUD = "Talmud Basics" as string;
const NOTE_CONTENT_TALMUD = "The Talmud is a central text of Rabbinic Judaism. It is composed of two main parts: the Mishnah, which is a collection of oral traditions and legal rulings compiled in the 2nd century CE, and the Gemara, which is a commentary and analysis of the Mishnah, developed between the 3rd and 5th centuries CE. The Talmud serves as the primary source of Jewish religious law (Halakha) and theology, featuring extensive debates among rabbis." as string;


// --- Mock LLM Responses for testing parsing logic ---
const MOCK_LLM_FLASHCARD_RESPONSE_VALID = JSON.stringify({
  cards: [
    { id: 1, question: "What is Torah?", answer: "Divine instruction and law, the Pentateuch, entire Jewish teaching." },
    { id: 2, question: "Who received the Torah?", answer: "Moses at Mount Sinai." },
    { id: 3, question: "What are the components of the Torah?", answer: "Pentateuch (first five books)." },
    { id: 4, question: "What does Torah provide?", answer: "Divine laws, commandments, foundation for observance and guidance." },
  ],
});

const MOCK_LLM_FLASHCARD_RESPONSE_INVALID_JSON = "This is not JSON.";
const MOCK_LLM_FLASHCARD_RESPONSE_INVALID_STRUCTURE = JSON.stringify({ data: [{ id: 1, q: "Q", a: "A" }] });
const MOCK_LLM_FLASHCARD_RESPONSE_INVALID_CARD_TYPE = JSON.stringify({ cards: [{ id: 1, question: "Q", answer: 123 }] });
const MOCK_LLM_FLASHCARD_RESPONSE_EMPTY_Q_A = JSON.stringify({ cards: [{ id: 1, question: "", answer: "A" }] });
const MOCK_LLM_FLASHCARD_RESPONSE_TOO_MANY_CARDS = JSON.stringify({
  cards: Array.from({ length: 26 }, (_, i) => ({ id: i + 1, question: `Q${i + 1}`, answer: `A${i + 1}` })),
});


// Helper to temporary override GeminiLLM.prototype.executeLLM for tests
// This allows testing LLM integration points without making actual LLM calls
const mockGeminiLLMExecuteLLM = (mockResponse: string | Promise<string>, throwError = false) => {
  const originalExecuteLLM = GeminiLLM.prototype.executeLLM;
  GeminiLLM.prototype.executeLLM = async (_prompt: string) => {
    if (throwError) {
      throw new Error("Mock LLM execution error");
    }
    return Promise.resolve(mockResponse);
  };
  return () => {
    GeminiLLM.prototype.executeLLM = originalExecuteLLM; // Restore original after the test
  };
};

Deno.test("Notes Concept Operations", async (t) => {
  const [db, client] = await testDb();
  const notesConcept = new NotesConcept(db);

  // Close the database client after all tests in this file are done
  t.afterAll(async () => {
    await client.close();
  });

  await t.step("addNotes: should successfully add a new note", async () => {
    const result = await notesConcept.addNotes({
      user: USER_ALICE,
      name: NOTE_NAME_TORAH,
      content: NOTE_CONTENT_TORAH,
    });
    assertEquals(result, {}, "Adding a new note should return an empty object on success");

    const addedNote = await notesConcept.notes.findOne({
      user: USER_ALICE,
      name: NOTE_NAME_TORAH,
    });
    assertEquals(addedNote?.content, NOTE_CONTENT_TORAH, "The content of the added note should match");
  });

  await t.step("addNotes: should fail to add a note if user and name already exist (requires condition)", async () => {
    // Attempt to add the same note again
    const result = await notesConcept.addNotes({
      user: USER_ALICE,
      name: NOTE_NAME_TORAH,
      content: "Updated content that should not be saved",
    });
    assertEquals(
      result,
      {
        error: `Note with name '${NOTE_NAME_TORAH}' already exists for user '${USER_ALICE}'.`,
      },
      "Adding a duplicate note should return an error",
    );
  });

  await t.step("addNotes: should allow different users to have notes with the same name", async () => {
    const result = await notesConcept.addNotes({
      user: USER_BOB,
      name: NOTE_NAME_TORAH, // Same name, different user
      content: NOTE_CONTENT_TORAH,
    });
    assertEquals(result, {}, "Different user adding a note with same name should succeed");

    const bobNote = await notesConcept.notes.findOne({
      user: USER_BOB,
      name: NOTE_NAME_TORAH,
    });
    assertEquals(bobNote?.content, NOTE_CONTENT_TORAH, "Bob's note content should match");
  });

  await t.step("removeNotes: should successfully remove an existing note", async () => {
    // Add another note to remove for Alice
    await notesConcept.addNotes({
      user: USER_ALICE,
      name: NOTE_NAME_TALMUD,
      content: NOTE_CONTENT_TALMUD,
    });

    const removeResult = await notesConcept.removeNotes({
      user: USER_ALICE,
      name: NOTE_NAME_TALMUD,
    });
    assertEquals(removeResult, {}, "Removing an existing note should succeed");

    const removedNote = await notesConcept.notes.findOne({
      user: USER_ALICE,
      name: NOTE_NAME_TALMUD,
    });
    assertEquals(removedNote, null, "The note should no longer exist after removal");
  });

  await t.step("removeNotes: should fail to remove a non-existent note (requires condition)", async () => {
    const removeResult = await notesConcept.removeNotes({
      user: USER_ALICE,
      name: "NonExistentNote",
    });
    assertEquals(
      removeResult,
      { error: `No note with name 'NonExistentNote' found for user '${USER_ALICE}'.` },
      "Removing a non-existent note should return an error",
    );
  });

  await t.step("_getNotes: should retrieve the content of an existing note", async () => {
    const result = await notesConcept._getNotes({
      user: USER_ALICE,
      name: NOTE_NAME_TORAH,
    });
    assertEquals(result, [NOTE_CONTENT_TORAH], "Should retrieve the correct content for an existing note");
  });

  await t.step("_getNotes: should fail to retrieve a non-existent note (requires condition)", async () => {
    const result = await notesConcept._getNotes({
      user: USER_ALICE,
      name: "NonExistentNote",
    });
    assertEquals(
      result,
      { error: `No note with name 'NonExistentNote' found for user '${USER_ALICE}'.` },
      "Retrieving a non-existent note should return an error",
    );
  });

  await t.step("_getUserNotes: should retrieve all notes for a specific user", async () => {
    // Alice has one note remaining: NOTE_NAME_TORAH
    const aliceNotes = await notesConcept._getUserNotes({ user: USER_ALICE });
    assertEquals(aliceNotes, [{ name: NOTE_NAME_TORAH, content: NOTE_CONTENT_TORAH }], "Should return all notes for Alice");

    // Bob has one note: NOTE_NAME_TORAH
    const bobNotes = await notesConcept._getUserNotes({ user: USER_BOB });
    assertEquals(bobNotes, [{ name: NOTE_NAME_TORAH, content: NOTE_CONTENT_TORAH }], "Should return all notes for Bob");
  });

  await t.step("_getUserNotes: should return empty array if user has no notes", async () => {
    const userCharlie = "user:Charlie" as ID;
    const charlieNotes = await notesConcept._getUserNotes({ user: userCharlie });
    assertEquals(charlieNotes, [], "Should return an empty array for a user with no notes");
  });

  await t.step("notesToFlashCards: should successfully generate flashcards for an existing note", async () => {
    // Mock the LLM to return valid flashcard JSON
    const restoreLLMMock = mockGeminiLLMExecuteLLM(MOCK_LLM_FLASHCARD_RESPONSE_VALID);
    try {
      const result = await notesConcept.notesToFlashCards({
        user: USER_ALICE,
        name: NOTE_NAME_TORAH,
      });
      assertEquals(result, {
        cards: [
          { question: "What is Torah?", answer: "Divine instruction and law, the Pentateuch, entire Jewish teaching." },
          { question: "Who received the Torah?", answer: "Moses at Mount Sinai." },
          { question: "What are the components of the Torah?", answer: "Pentateuch (first five books)." },
          { question: "What does Torah provide?", answer: "Divine laws, commandments, foundation for observance and guidance." },
        ],
      }, "Should return correctly parsed flashcards");
    } finally {
      restoreLLMMock(); // Ensure mock is restored
    }
  });

  await t.step("notesToFlashCards: should fail if the note does not exist (requires condition)", async () => {
    // LLM mock will be in place, but the precondition should prevent the LLM call
    const restoreLLMMock = mockGeminiLLMExecuteLLM(MOCK_LLM_FLASHCARD_RESPONSE_VALID);
    try {
      const result = await notesConcept.notesToFlashCards({
        user: USER_ALICE,
        name: "NonExistentNote",
      });
      assertEquals(
        result,
        { error: `No note with name 'NonExistentNote' found for user '${USER_ALICE}'.` },
        "Should return an error if the note does not exist",
      );
    } finally {
      restoreLLMMock();
    }
  });

  await t.step("notesToFlashCards: should handle LLM execution errors", async () => {
    // Force the mock LLM to throw an error
    const restoreLLMMock = mockGeminiLLMExecuteLLM("Any string", true);
    try {
      const result = await notesConcept.notesToFlashCards({
        user: USER_ALICE,
        name: NOTE_NAME_TORAH,
      });
      assertEquals(result.error?.startsWith("LLM processing failed:"), true, "Should return an error on LLM execution failure");
    } finally {
      restoreLLMMock();
    }
  });

  await t.step("notesToFlashCards: should handle invalid JSON response from LLM", async () => {
    const restoreLLMMock = mockGeminiLLMExecuteLLM(MOCK_LLM_FLASHCARD_RESPONSE_INVALID_JSON);
    try {
      const result = await notesConcept.notesToFlashCards({
        user: USER_ALICE,
        name: NOTE_NAME_TORAH,
      });
      assertEquals(result.error?.startsWith("Failed to parse LLM response: No JSON found in response"), true, "Should error on non-JSON response");
    } finally {
      restoreLLMMock();
    }
  });

  await t.step("notesToFlashCards: should handle invalid JSON structure from LLM (missing cards array)", async () => {
    const restoreLLMMock = mockGeminiLLMExecuteLLM(MOCK_LLM_FLASHCARD_RESPONSE_INVALID_STRUCTURE);
    try {
      const result = await notesConcept.notesToFlashCards({
        user: USER_ALICE,
        name: NOTE_NAME_TORAH,
      });
      assertEquals(result.error?.startsWith("Failed to parse LLM response: Invalid JSON structure: missing cards array"), true, "Should error on missing 'cards' array");
    } finally {
      restoreLLMMock();
    }
  });

  await t.step("notesToFlashCards: should handle invalid card type in LLM response", async () => {
    const restoreLLMMock = mockGeminiLLMExecuteLLM(MOCK_LLM_FLASHCARD_RESPONSE_INVALID_CARD_TYPE);
    try {
      const result = await notesConcept.notesToFlashCards({
        user: USER_ALICE,
        name: NOTE_NAME_TORAH,
      });
      assertEquals(result.error?.startsWith("Failed to parse LLM response: Invalid card format: question and answer must be strings, id must be a number"), true, "Should error on incorrect card data types");
    } finally {
      restoreLLMMock();
    }
  });

  await t.step("notesToFlashCards: should handle LLM response with too many cards (exceeds limit)", async () => {
    const restoreLLMMock = mockGeminiLLMExecuteLLM(MOCK_LLM_FLASHCARD_RESPONSE_TOO_MANY_CARDS);
    try {
      const result = await notesConcept.notesToFlashCards({
        user: USER_ALICE,
        name: NOTE_NAME_TORAH,
      });
      assertEquals(result.error?.startsWith("Failed to parse LLM response: Too many cards generated, exceeds limit of 25"), true, "Should error if LLM generates too many cards");
    } finally {
      restoreLLMMock();
    }
  });

  await t.step("notesToFlashCards: should handle LLM response with empty question/answer", async () => {
    const restoreLLMMock = mockGeminiLLMExecuteLLM(MOCK_LLM_FLASHCARD_RESPONSE_EMPTY_Q_A);
    try {
      const result = await notesConcept.notesToFlashCards({
        user: USER_ALICE,
        name: NOTE_NAME_TORAH,
      });
      assertEquals(result.error?.startsWith("Failed to parse LLM response: Invalid card: question and answer must be non-empty"), true, "Should error if LLM generates empty Q/A");
    } finally {
      restoreLLMMock();
    }
  });


  // --- Principle Trace Test ---
  await t.step("Principle: User can store notes, generate flashcards, and remove notes", async () => {
    // Principle: "user can store notes or other textual information;
    // the user can also remove notes;
    // the user can also use an llm to turn notes into question/answer pairs (flashcards) based on the notes"

    // 1. User stores notes (addNotes)
    const addResult = await notesConcept.addNotes({ user: USER_ALICE, name: NOTE_NAME_TALMUD, content: NOTE_CONTENT_TALMUD });
    assertEquals(addResult, {}, "Principle step 1: Adding notes should succeed.");

    let aliceNotes = await notesConcept._getUserNotes({ user: USER_ALICE });
    // Filter out the "Torah Study" note which was added in a previous test step
    const currentAliceNotes = (aliceNotes as Array<{ name: string; content: string }>).filter(n => n.name === NOTE_NAME_TALMUD);
    assertEquals(currentAliceNotes.length, 1, "Principle step 1: Notes should be present for the user.");
    assertEquals(currentAliceNotes[0].content, NOTE_CONTENT_TALMUD, "Principle step 1: Note content should be correct.");

    // 2. User uses an LLM to turn notes into question/answer pairs (notesToFlashCards)
    const restoreLLMMock = mockGeminiLLMExecuteLLM(MOCK_LLM_FLASHCARD_RESPONSE_VALID);
    try {
      const flashcardsResult = await notesConcept.notesToFlashCards({ user: USER_ALICE, name: NOTE_NAME_TALMUD });
      assertEquals(flashcardsResult.hasOwnProperty("cards"), true, "Principle step 2: Flashcards property should exist in the result.");
      assertEquals((flashcardsResult as { cards: unknown[] }).cards.length > 0, true, "Principle step 2: Flashcards array should not be empty.");
      assertEquals((flashcardsResult as { cards: {question: string}[] }).cards[0].question, "What is Torah?", "Principle step 2: Flashcards content should be as expected from the mock.");
    } finally {
      restoreLLMMock();
    }

    // 3. User can also remove notes (removeNotes)
    const removeResult = await notesConcept.removeNotes({ user: USER_ALICE, name: NOTE_NAME_TALMUD });
    assertEquals(removeResult, {}, "Principle step 3: Removing notes should succeed.");

    aliceNotes = await notesConcept._getUserNotes({ user: USER_ALICE });
    const remainingAliceNotes = (aliceNotes as Array<{ name: string; content: string }>).filter(n => n.name === NOTE_NAME_TALMUD);
    assertEquals(
      remainingAliceNotes.length,
      0,
      "Principle step 3: Notes should be removed from the user's collection.",
    );
  });
});
```
