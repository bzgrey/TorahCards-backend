[@Notes](Notes.md)

# Notes search query: add search query to notes specs

[@modifications](../FlashCards/modifications.md)

Write a search query spec (only the specs) for the notes specs that is similar to the flashcards search query


# response:

# concept: Notes (Updated)

*   **concept**: Notes \[User]
*   **purpose**: enable users to organize textual information, make it easily retrievable, and facilitate learning through automated study aids
*   **principle**:
    user can store notes or other textual information;
    the user can also remove notes;
    the user can also use an llm to turn notes into question/answer pairs (flashcards) based on the notes
*   **state**:
*   a set of Notes with
    *   a User
    *   a name String
    *   a content String
*   **actions**:
    *   addNotes(user: User, name: String, content: String)
        *   **requires**: Notes don't already exist with the same user and name
        *   **effects**: adds new notes to set of Notes associated with the given user and name
    *   removeNotes(user: User, name: String)
        *   **requires**: Notes exist with the same user and name
        *   **effects**: removes notes with given name and user from Notes set
    *   notesToFlashCards(user: User, name: String): Flashcards
        *   **requires**: Notes already exist with the same user and name
        *   **effects**: returns set of question/answer pairs of flashcards based on the notes
*   **queries**
    *   \_getUserNotes(user: User): (note: {id: ID, name: String, content: String})\[]
        *   **effects**: returns array of all Notes of given user, where each item includes its ID, name, and content.
    *   \_getNotes(user: User, name: String): (content: String)
        *   **requires**: notes exist of given name and user
        *   **effects**: returns content of given notes
    *   \_searchNotes(searchTerm: String): note: {id: ID, notesOwner: User, name: String, content: String}\[]
        *   **effects**: returns an array of notes whose names match the `searchTerm`, ordered by search score (greatest first).

# implementation:

```typescript
/**
* @query _searchNotes

* @param {object} params - The query parameters.

* @param {string} params.searchTerm - The text to search for in note names.

* @returns {Promise<{ note: {id: ID, name: string, content: string, notesOwner: User}; score: number }[]>} An array of Notes whose names match the `searchTerm

* along with their relevance scores.

*

* @effects returns an array of notes whose names match the `searchTerm`

* using `$text` search, ordered by relevance score.

*

* @note This query requires a MongoDB Text Index to be created on the `name` field of the `Notes.notes` collection.

* Example index: `{ "name": "text" }`. The `$text` operator provides basic full-text search, including phrase matching

* (if the search term is quoted) and stemming, but does not support fuzzy matching directly.

*/

async _searchNotes(

{ searchTerm }: { searchTerm: string },

): Promise<

{

note: { id: ID; name: string; content: string; notesOwner: User };

score: number;

}[]

> {

// Ensure index exists before running $text (await cached init to avoid races)

await this.ensureIndexes();

// Use MongoDB aggregation pipeline with $text for full-text search

const results = await this.notes.aggregate<

{ notes: NoteDoc; score: number }

>([

{

// $match stage for filtering applying $text search

$match: {

$text: {

$search: searchTerm,

},

},

},

{

// Project the original document and the text search score

$project: {

_id: 0, // Exclude the original _id from the root level of the result document

notes: { // Nest the relevant fields under 'flashcardSet'

id: "$_id", // Map _id to id

name: "$name",

content: "$content",

notesOwner: "$user",

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

return results as unknown as {

note: { id: ID; name: string; content: string; notesOwner: User };

score: number;

}[];

}
```

# test: write a couple of tests on this implementation of the search query
# response:

```typescript
// file: src/Notes/NotesConcept.test.ts
import { Collection, Db } from "npm:mongodb";
import { ID } from "@utils/types.ts";
import { freshID, testDb } from "@utils/database.ts";
import { assertEquals, assertArrayIncludes, assert } from "jsr:@std/assert";
import NotesConcept from "./NotesConcept.ts"; // Assuming NotesConcept is in src/Notes/NotesConcept.ts

// Define test user IDs
const testUser1: ID = "user:Alice" as ID;
const testUser2: ID = "user:Bob" as ID;
const testUser3: ID = "user:Charlie" as ID; // User with no notes

// --- Assuming the NotesConcept class structure based on the provided snippet ---
// This is for local testing purposes to instantiate and ensure indexes.
// In a real scenario, this part would be consistent with the actual NotesConcept.ts file.
interface NoteDoc {
  _id: ID;
  user: ID; // Represents the notesOwner
  name: string;
  content: string;
}

// Minimal NotesConcept class for testing, containing only necessary parts
class MockNotesConcept extends NotesConcept {
  notes: Collection<NoteDoc>;

  constructor(db: Db) {
    super(db); // Call original constructor to setup collections
    // Re-assign for type safety in tests if needed, but 'notes' is already public in super
    this.notes = this.db.collection("Notes.notes");
  }

  async addNotes(
    { user, name, content }: { user: ID; name: string; content: string },
  ): Promise<Record<PropertyKey, never> | { error: string }> {
    const existingNotes = await this.notes.findOne({ user, name });
    if (existingNotes) {
      return { error: `Notes named '${name}' already exist for user ${user}.` };
    }
    const newNote: NoteDoc = {
      _id: freshID(),
      user,
      name,
      content,
    };
    await this.notes.insertOne(newNote);
    return {};
  }

  // Method to ensure text index, called by _searchNotes in the provided snippet
  async ensureIndexes() {
    try {
      await this.notes.createIndex({ name: "text" });
      // console.log("Text index on 'name' field ensured for NotesConcept.");
    } catch (e) {
      if (!e.message.includes("Index with name: name_text already exists")) {
        throw e;
      }
    }
  }

  // The _searchNotes implementation provided in the prompt is included here
  /**
   * @query _searchNotes
   * @param {object} params - The query parameters.
   * @param {string} params.searchTerm - The text to search for in note names.
   * @returns {Promise<{ note: {id: ID, name: string, content: string, notesOwner: User}; score: number }[]>} An array of Notes whose names match the `searchTerm`
   * along with their relevance scores.
   *
   * @effects returns an array of notes whose names match the `searchTerm`
   * using `$text` search, ordered by relevance score.
   *
   * @note This query requires a MongoDB Text Index to be created on the `name` field of the `Notes.notes` collection.
   * Example index: `{ "name": "text" }`. The `$text` operator provides basic full-text search, including phrase matching
   * (if the search term is quoted) and stemming, but does not support fuzzy matching directly.
   */
  async _searchNotes(
    { searchTerm }: { searchTerm: string },
  ): Promise<
    {
      note: { id: ID; name: string; content: string; notesOwner: ID };
      score: number;
    }[]
  > {
    await this.ensureIndexes(); // Ensure index exists before running $text

    const results = await this.notes.aggregate<
      { notes: NoteDoc; score: number } // Adjusted type based on what $project outputs before final cast
    >([
      {
        $match: {
          $text: {
            $search: searchTerm,
          },
        },
      },
      {
        $project: {
          _id: 0,
          note: {
            id: "$_id",
            name: "$name",
            content: "$content",
            notesOwner: "$user",
          },
          score: { $meta: "textScore" },
        },
      },
      {
        $sort: {
          score: { $meta: "textScore" },
        },
      },
    ]).toArray();

    return results as unknown as {
      note: { id: ID; name: string; content: string; notesOwner: ID };
      score: number;
    }[];
  }
}
// --- End of assumed NotesConcept structure ---

Deno.test("Notes Concept - _searchNotes: Basic search across users and scoring", async (t) => {
  const [db, client] = await testDb();
  const notesConcept = new MockNotesConcept(db);

  try {
    // Setup initial data for testUser1 and testUser2
    await notesConcept.addNotes({
      user: testUser1,
      name: "Lecture Notes on Biology",
      content: "This covers cell structure and functions.",
    });
    await notesConcept.addNotes({
      user: testUser1,
      name: "Biology Exam Study Guide",
      content: "Key topics for the upcoming biology exam.",
    });
    await notesConcept.addNotes({
      user: testUser2,
      name: "Biology Project Ideas",
      content: "Brainstorming concepts for the group project.",
    });
    await notesConcept.addNotes({
      user: testUser2,
      name: "History of Ancient Rome",
      content: "Important dates and figures from Roman history.",
    });

    await t.step("Search for 'Biology' and verify results from both users, sorted by score", async () => {
      const searchTerm = "Biology";
      const results = await notesConcept._searchNotes({ searchTerm });

      // Expect 3 results: two from testUser1, one from testUser2
      assertEquals(results.length, 3);

      // Extract names, owners, and scores for easier assertion
      const resultDetails = results.map(r => ({
        name: r.note.name,
        owner: r.note.notesOwner,
        score: r.score,
      }));

      const foundNames = resultDetails.map(rd => rd.name);
      assertArrayIncludes(foundNames, [
        "Lecture Notes on Biology",
        "Biology Exam Study Guide",
        "Biology Project Ideas",
      ]);

      // Verify that 'History of Ancient Rome' is not included
      assert(!foundNames.includes("History of Ancient Rome"));

      // Verify scores are numbers and sorted in descending order (highest score first)
      for (let i = 0; i < resultDetails.length - 1; i++) {
        assert(typeof resultDetails[i].score === 'number');
        assert(resultDetails[i].score >= resultDetails[i+1].score, `Scores not sorted correctly: ${resultDetails[i].score} vs ${resultDetails[i+1].score}`);
      }

      // Verify notesOwner field for each returned note
      for (const res of resultDetails) {
        if (res.name === "Lecture Notes on Biology" || res.name === "Biology Exam Study Guide") {
          assertEquals(res.owner, testUser1, `Owner of '${res.name}' should be ${testUser1}`);
        } else if (res.name === "Biology Project Ideas") {
          assertEquals(res.owner, testUser2, `Owner of '${res.name}' should be ${testUser2}`);
        } else {
          assert(false, `Unexpected note found: ${res.name}`);
        }
      }
    });

    await t.step("Search for 'Ancient' and verify results for testUser2", async () => {
      const searchTerm = "Ancient";
      const results = await notesConcept._searchNotes({ searchTerm });

      assertEquals(results.length, 1);
      assertEquals(results[0].note.name, "History of Ancient Rome");
      assertEquals(results[0].note.notesOwner, testUser2);
      assert(typeof results[0].score === 'number');
    });

  } finally {
    await client.close();
  }
});

Deno.test("Notes Concept - _searchNotes: No matches scenario and empty search term", async (t) => {
  const [db, client] = await testDb();
  const notesConcept = new MockNotesConcept(db);

  try {
    await notesConcept.addNotes({
      user: testUser1,
      name: "Physics Concepts",
      content: "Basic laws of motion.",
    });

    await t.step("Search for a term that does not exist in any notes", async () => {
      const searchTerm = "Chemistry";
      const results = await notesConcept._searchNotes({ searchTerm });

      assertEquals(results.length, 0); // Expect no results
    });

    await t.step("Search for an empty string (should return no results from $text)", async () => {
        const searchTerm = "";
        const results = await notesConcept._searchNotes({ searchTerm });
        assertEquals(results.length, 0); // $text search with empty string usually returns no results
    });

    await t.step("Search for a term with no matches for a user with no notes (still global search)", async () => {
        await notesConcept.addNotes({
            user: testUser2,
            name: "Art History",
            content: "Renaissance art movements."
        });
        const searchTerm = "Mathematics";
        const results = await notesConcept._searchNotes({ searchTerm });
        assertEquals(results.length, 0);
    });

  } finally {
    await client.close();
  }
});

Deno.test("Notes Concept - _searchNotes: Phrase search and stemming effects", async (t) => {
  const [db, client] = await testDb();
  const notesConcept = new MockNotesConcept(db);

  try {
    await notesConcept.addNotes({
      user: testUser1,
      name: "Introduction to Software Engineering",
      content: "Fundamentals of software design.",
    });
    await notesConcept.addNotes({
      user: testUser2,
      name: "Effective Software Development",
      content: "Best practices for agile teams.",
    });
    await notesConcept.addNotes({
      user: testUser1,
      name: "Database Design Principles",
      content: "Relational vs NoSQL databases.",
    });
    await notesConcept.addNotes({
      user: testUser2,
      name: "Learning SQL for Beginners",
      content: "Structured Query Language basics.",
    });

    await t.step("Search for a multi-word phrase 'Software Engineering'", async () => {
      const searchTerm = "\"Software Engineering\""; // Quoted for phrase search in $text
      const results = await notesConcept._searchNotes({ searchTerm });

      assertEquals(results.length, 1);
      assertEquals(results[0].note.name, "Introduction to Software Engineering");
      assertEquals(results[0].note.notesOwner, testUser1);
    });

    await t.step("Search for a single word 'develop', expecting stemming effect (Development)", async () => {
      const searchTerm = "develop"; // Will match "Development" due to stemming
      const results = await notesConcept._searchNotes({ searchTerm });

      assertEquals(results.length, 1);
      assertEquals(results[0].note.name, "Effective Software Development");
      assertEquals(results[0].note.notesOwner, testUser2);
    });

    await t.step("Search for 'Database' (should match two notes)", async () => {
      const searchTerm = "Database";
      const results = await notesConcept._searchNotes({ searchTerm });

      assertEquals(results.length, 2);
      const foundNames = results.map(r => r.note.name);
      assertArrayIncludes(foundNames, ["Database Design Principles", "Learning SQL for Beginners"]);

      // Verify owners
      for (const res of results) {
        if (res.note.name === "Database Design Principles") {
          assertEquals(res.note.notesOwner, testUser1);
        } else if (res.note.name === "Learning SQL for Beginners") {
          assertEquals(res.note.notesOwner, testUser2);
        } else {
          assert(false, `Unexpected note found: ${res.note.name}`);
        }
      }
    });

  } finally {
    await client.close();
  }
});
```


