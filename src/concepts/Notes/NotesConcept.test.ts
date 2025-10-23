import { assert, assertArrayIncludes, assertEquals } from "jsr:@std/assert";
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

Deno.test("Notes Concept - _searchNotes: Basic search across users and scoring", async (t) => {
  const [db, client] = await testDb();
  const notesConcept = new NotesConcept(db);

  try {
    // Setup initial data for USER_ALICE and USER_BOB
    await notesConcept.addNotes({
      user: USER_ALICE,
      name: "Lecture Notes on Biology",
      content: "This covers cell structure and functions.",
    });
    await notesConcept.addNotes({
      user: USER_ALICE,
      name: "Biology Exam Study Guide",
      content: "Key topics for the upcoming biology exam.",
    });
    await notesConcept.addNotes({
      user: USER_BOB,
      name: "Biology Project Ideas",
      content: "Brainstorming concepts for the group project.",
    });
    await notesConcept.addNotes({
      user: USER_BOB,
      name: "History of Ancient Rome",
      content: "Important dates and figures from Roman history.",
    });

    await t.step(
      "Search for 'Biology' and verify results from both users, sorted by score",
      async () => {
        const searchTerm = "Biology";
        const results = await notesConcept._searchNotes({ searchTerm });
        console.log("Search results for 'Biology':", results);
        // Expect 3 results: two from USER_ALICE, one from USER_BOB
        assertEquals(results.length, 3);

        // Extract names, owners, and scores for easier assertion
        const resultDetails = results.map((r) => ({
          name: r.note.name,
          owner: r.note.notesOwner,
          score: r.score,
        }));

        const foundNames = resultDetails.map((rd) => rd.name);
        assertArrayIncludes(foundNames, [
          "Lecture Notes on Biology",
          "Biology Exam Study Guide",
          "Biology Project Ideas",
        ]);

        // Verify that 'History of Ancient Rome' is not included
        assert(!foundNames.includes("History of Ancient Rome"));

        // Verify scores are numbers and sorted in descending order (highest score first)
        for (let i = 0; i < resultDetails.length - 1; i++) {
          assert(typeof resultDetails[i].score === "number");
          assert(
            resultDetails[i].score >= resultDetails[i + 1].score,
            `Scores not sorted correctly: ${resultDetails[i].score} vs ${
              resultDetails[i + 1].score
            }`,
          );
        }

        // Verify notesOwner field for each returned note
        for (const res of resultDetails) {
          if (
            res.name === "Lecture Notes on Biology" ||
            res.name === "Biology Exam Study Guide"
          ) {
            assertEquals(
              res.owner,
              USER_ALICE,
              `Owner of '${res.name}' should be ${USER_ALICE}`,
            );
          } else if (res.name === "Biology Project Ideas") {
            assertEquals(
              res.owner,
              USER_BOB,
              `Owner of '${res.name}' should be ${USER_BOB}`,
            );
          } else {
            assert(false, `Unexpected note found: ${res.name}`);
          }
        }
      },
    );

    await t.step(
      "Search for 'Ancient' and verify results for USER_BOB",
      async () => {
        const searchTerm = "Ancient";
        const results = await notesConcept._searchNotes({ searchTerm });

        assertEquals(results.length, 1);
        assertEquals(results[0].note.name, "History of Ancient Rome");
        assertEquals(results[0].note.notesOwner, USER_BOB);
        assert(typeof results[0].score === "number");
      },
    );
  } finally {
    await client.close();
  }
});

Deno.test("Notes Concept - _searchNotes: No matches scenario and empty search term", async (t) => {
  const [db, client] = await testDb();
  const notesConcept = new NotesConcept(db);

  try {
    await notesConcept.addNotes({
      user: USER_ALICE,
      name: "Physics Concepts",
      content: "Basic laws of motion.",
    });

    await t.step(
      "Search for a term that does not exist in any notes",
      async () => {
        const searchTerm = "Chemistry";
        const results = await notesConcept._searchNotes({ searchTerm });

        assertEquals(results.length, 0); // Expect no results
      },
    );

    await t.step(
      "Search for an empty string (should return no results from $text)",
      async () => {
        const searchTerm = "";
        const results = await notesConcept._searchNotes({ searchTerm });
        assertEquals(results.length, 0); // $text search with empty string usually returns no results
      },
    );

    await t.step(
      "Search for a term with no matches for a user with no notes (still global search)",
      async () => {
        await notesConcept.addNotes({
          user: USER_BOB,
          name: "Art History",
          content: "Renaissance art movements.",
        });
        const searchTerm = "Mathematics";
        const results = await notesConcept._searchNotes({ searchTerm });
        assertEquals(results.length, 0);
      },
    );
  } finally {
    await client.close();
  }
});

Deno.test("Notes Concept - _searchNotes: Phrase search and stemming effects", async (t) => {
  const [db, client] = await testDb();
  const notesConcept = new NotesConcept(db);

  try {
    await notesConcept.addNotes({
      user: USER_ALICE,
      name: "Introduction to Software Engineering",
      content: "Fundamentals of software design.",
    });
    await notesConcept.addNotes({
      user: USER_BOB,
      name: "Effective Software Development",
      content: "Best practices for agile teams.",
    });
    await notesConcept.addNotes({
      user: USER_ALICE,
      name: "Database Design Principles",
      content: "Relational vs NoSQL databases.",
    });
    await notesConcept.addNotes({
      user: USER_BOB,
      name: "Learning SQL for Beginners",
      content: "Structured Query Language basics.",
    });

    await t.step(
      "Search for a multi-word phrase 'Software Engineering'",
      async () => {
        const searchTerm = '"Software Engineering"'; // Quoted for phrase search in $text
        const results = await notesConcept._searchNotes({ searchTerm });

        assertEquals(results.length, 1);
        assertEquals(
          results[0].note.name,
          "Introduction to Software Engineering",
        );
        assertEquals(results[0].note.notesOwner, USER_ALICE);
      },
    );

    await t.step(
      "Search for a single word 'develop', expecting stemming effect (Development)",
      async () => {
        const searchTerm = "develop"; // Will match "Development" due to stemming
        const results = await notesConcept._searchNotes({ searchTerm });

        assertEquals(results.length, 1);
        assertEquals(results[0].note.name, "Effective Software Development");
        assertEquals(results[0].note.notesOwner, USER_BOB);
      },
    );

    await t.step("Search for 'Database' (should match two notes)", async () => {
      const searchTerm = "Database";
      const results = await notesConcept._searchNotes({ searchTerm });

      assertEquals(results.length, 2);
      const foundNames = results.map((r) => r.note.name);
      assertArrayIncludes(foundNames, [
        "Database Design Principles",
        "Learning SQL for Beginners",
      ]);

      // Verify owners
      for (const res of results) {
        if (res.note.name === "Database Design Principles") {
          assertEquals(res.note.notesOwner, USER_ALICE);
        } else if (res.note.name === "Learning SQL for Beginners") {
          assertEquals(res.note.notesOwner, USER_BOB);
        } else {
          assert(false, `Unexpected note found: ${res.note.name}`);
        }
      }
    });
  } finally {
    await client.close();
  }
});
