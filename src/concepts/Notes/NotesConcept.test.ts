import { assertEquals } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import NotesConcept from "./NotesConcept.ts";

// --- Test Data ---
const USER_ALICE = "user:Alice" as ID;
const USER_BOB = "user:Bob" as ID;
const NOTE_NAME_TORAH = "Torah Study" as string;
const NOTE_CONTENT_TORAH =
  "The Torah is the central concept in the Jewish tradition. It refers to the Pentateuch, the first five books of the Hebrew Bible, which contains the divine laws and commandments given by God to Moses on Mount Sinai. It also encompasses the entire body of Jewish teaching, law, and custom. The Torah is considered the foundation of Jewish religious observance and moral guidance." as string;

const NOTE_NAME_TALMUD = "Talmud Basics" as string;
const NOTE_CONTENT_TALMUD =
  "The Talmud is a central text of Rabbinic Judaism. It is composed of two main parts: the Mishnah, which is a collection of oral traditions and legal rulings compiled in the 2nd century CE, and the Gemara, which is a commentary and analysis of the Mishnah, developed between the 3rd and 5th centuries CE. The Talmud serves as the primary source of Jewish religious law (Halakha) and theology, featuring extensive debates among rabbis." as string;

Deno.test("Principle: User can store notes, generate flashcards, and remove notes", async () => {
  const [db, client] = await testDb();
  const notesConcept = new NotesConcept(db);
  try {
    // Principle: "user can store notes or other textual information;
    // the user can also remove notes;
    // the user can also use an llm to turn notes into question/answer pairs (flashcards) based on the notes"

    // 1. User stores notes (addNotes)
    const addResult = await notesConcept.addNotes({
      user: USER_ALICE,
      name: NOTE_NAME_TALMUD,
      content: NOTE_CONTENT_TALMUD,
    });
    assertEquals(
      "error" in addResult,
      false,
      "Principle step 1: Adding notes should succeed.",
    );

    const aliceNotesAfterAdd = await notesConcept._getUserNotes({
      user: USER_ALICE,
    });
    assertEquals(
      aliceNotesAfterAdd,
      [{ name: NOTE_NAME_TALMUD, content: NOTE_CONTENT_TALMUD }],
      "Principle step 1: Notes should be present for the user.",
    );

    // 2  . User uses an LLM to turn notes into question/answer pairs (notesToFlashCards)
    const flashcardsResult = await notesConcept.notesToFlashCards({
      user: USER_ALICE,
      name: NOTE_NAME_TALMUD,
    });
    assertEquals(
      "error" in flashcardsResult,
      false,
      "Principle step 2: Flashcards property should exist in the result. Instead got error: " +
        ("error" in flashcardsResult ? flashcardsResult.error : "no error"),
    );
    console.log("Flashcards generated successfully:");
    if ("cards" in flashcardsResult) {
      assertEquals(
        flashcardsResult.cards.length > 0,
        true,
        "Principle step 2: Flashcards array should not be empty.",
      );
      let currentId = 1;
      for (const card of flashcardsResult.cards) {
        console.log(`Card ${currentId}:
        Q: ${card.question}
        A: ${card.answer}`);
        currentId++;
      }
    }

    // 3. User can also remove notes (removeNotes)
    const removeResult = await notesConcept.removeNotes({
      user: USER_ALICE,
      name: NOTE_NAME_TALMUD,
    });
    assertEquals(
      removeResult,
      {},
      "Principle step 3: Removing notes should succeed.",
    );

    const aliceNotesAfterRemove = await notesConcept._getUserNotes({
      user: USER_ALICE,
    });
    assertEquals(
      aliceNotesAfterRemove,
      [],
      "Principle step 3: Notes should be removed from the user's collection.",
    );
  } finally {
    await client.close();
  }
});

Deno.test("_getNotes: should retrieve the content of an existing note", async () => {
  const [db, client] = await testDb();
  const notesConcept = new NotesConcept(db);
  try {
    // Add the note
    await notesConcept.addNotes({
      user: USER_ALICE,
      name: NOTE_NAME_TORAH,
      content: NOTE_CONTENT_TORAH,
    });

    const result = await notesConcept._getNotes({
      user: USER_ALICE,
      name: NOTE_NAME_TORAH,
    });
    assertEquals(
      result,
      [{ content: NOTE_CONTENT_TORAH }],
      "Should retrieve the correct content for an existing note",
    );
  } finally {
    await client.close();
  }
});

Deno.test("addNotes: should allow different users to have notes with the same name", async () => {
  const [db, client] = await testDb();
  const notesConcept = new NotesConcept(db);
  try {
    // Add note for Alice
    await notesConcept.addNotes({
      user: USER_ALICE,
      name: NOTE_NAME_TORAH,
      content: NOTE_CONTENT_TORAH,
    });

    // Add note for Bob with the same name
    const result = await notesConcept.addNotes({
      user: USER_BOB,
      name: NOTE_NAME_TORAH, // Same name, different user
      content: NOTE_CONTENT_TORAH,
    });
    assertEquals(
      result,
      {},
      "Different user adding a note with same name should succeed",
    );

    const bobNote = await notesConcept._getNotes({
      user: USER_BOB,
      name: NOTE_NAME_TORAH,
    });
    assertEquals(
      bobNote,
      [{ content: NOTE_CONTENT_TORAH }],
      "Bob's note content should match",
    );
  } finally {
    await client.close();
  }
});

Deno.test("notesToFlashcards: handling of empty notes input. Should return zero cards, empty json card list", async () => {
  const [db, client] = await testDb();
  const notesConcept = new NotesConcept(db);
  try {
    // Add empty note for Alice
    await notesConcept.addNotes({
      user: USER_ALICE,
      name: NOTE_NAME_TORAH,
      content: "", // Empty content
    });

    const flashcardsResult = await notesConcept.notesToFlashCards({
      user: USER_ALICE,
      name: NOTE_NAME_TORAH,
    });
    assertEquals(
      flashcardsResult,
      { "cards": [] },
      "Flashcards generation from empty notes should return empty cards array",
    );
  } finally {
    await client.close();
  }
});
