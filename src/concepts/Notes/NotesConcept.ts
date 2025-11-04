import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

import { GeminiLLM } from "@utils/gemini-llm.ts";

/**
 * @concept Notes
 * @purpose enable users to organize textual information, make it easily retrievable, and facilitate learning through automated study aids
 */

// Declare collection prefix, use concept name
const PREFIX = "Notes" + ".";

// Generic types of this concept
type User = ID; // The external ID for a user

// Internal ID for a specific note document
type Note = ID;

/**
 * @state
 * a set of Notes with
 *   a User
 *   a name String
 *   a content String
 */
interface NoteDoc {
  _id: Note;
  user: User;
  name: string;
  content: string;
}

/**
 * Represents a single flashcard (question-answer pair).
 * This is the return type for the notesToFlashCards action.
 */
interface Flashcard {
  question: string;
  answer: string;
}

export default class NotesConcept {
  private notes: Collection<NoteDoc>;
  private indexInit?: Promise<void>;

  constructor(private readonly db: Db) {
    this.notes = this.db.collection(PREFIX + "notes");
    this.notes.createIndex({ user: 1, name: 1 }, { unique: true });
  }

  // Ensure indexes exist; cached to avoid repeated work / races
  private ensureIndexes(): Promise<void> {
    if (!this.indexInit) {
      this.indexInit = (async () => {
        await Promise.all([
          // Ensure uniqueness for (user, name) pair to prevent duplicate notes
          this.notes.createIndex({ user: 1, name: 1 }, { unique: true }),
          this.notes.createIndex({ name: "text" }),
        ]);
      })();
    }
    return this.indexInit;
  }

  /**
   * @action addNotes
   * @requires Notes don't already exist with the same user and name
   * @effects adds new notes to set of Notes associated with the given user and name.
   */
  public async addNotes(
    { user, name, content }: { user: User; name: string; content: string },
  ): Promise<Empty | { error: string }> {
    // Check if notes already exist with the same user and name
    // This is also enforced by the unique index, but checking beforehand allows for a specific error message.
    // initialize indexes
    await this.ensureIndexes();
    const existingNote = await this.notes.findOne({
      user: user,
      name: name,
    });
    if (existingNote) {
      return {
        error: `Note with name '${name}' already exists for user '${user}'.`,
      };
    }

    const newNote: NoteDoc = {
      _id: freshID(),
      user: user,
      name: name,
      content: content,
    };
    await this.notes.insertOne(newNote);
    return {};
  }

  /**
   * @action removeNotes
   * @requires Notes exist with the same user and name
   * @effects removes notes with given name and user from Notes set
   */
  public async removeNotes(
    { user, name }: { user: User; name: string },
  ): Promise<Empty | { error: string }> {
    // Check if notes exist with the same user and name
    const result = await this.notes.deleteOne({ user: user, name: name });

    if (result.deletedCount === 0) {
      return { error: `No note with name '${name}' found for user '${user}'.` };
    }
    return {};
  }

  /**
   * @action notesToFlashCards
   * @requires Notes already exist with the same user and name
   * @effects returns set of question/answer pairs of flashcards based on the notes content.
   */
  public async notesToFlashCards(
    { user, name }: { user: User; name: string },
  ): Promise<{ cards: Flashcard[] } | { error: string }> {
    // Requires: Notes already exist with the same user and the given noteId
    const note = await this.notes.findOne({ user: user, name: name });

    if (!note) {
      return { error: `No note with name '${name}' found for user '${user}'.` };
    }

    const llm = new GeminiLLM();
    const prompt = this.createLLMPrompt(note.content);
    let responseText: string;
    try {
      responseText = await llm.executeLLM(prompt);
    } catch (error) {
      return { error: `LLM processing failed: ${(error as Error).message}` };
    }

    let flashcards: Flashcard[];
    try {
      flashcards = this.parseLLMToFlashcards(responseText);
    } catch (error) {
      return {
        error: `Failed to parse LLM response: ${(error as Error).message}`,
      };
    }

    // Return only the flashcards array
    return { cards: flashcards };
  }

  private createLLMPrompt(notes: string): string {
    return `
      You are a focused flashcard generator for Torah study.
      Input: a block of notes about any Torah topic.
      Output: valid JSON only — no commentary, no markdown, no extra text.

      CRITICAL REQUIREMENTS:
      1. Parse the notes and generate concise question/answer flashcards covering key rulings, definitions, reasons, stories, contrasts, disagreements(machlokes), ideas.
      2. Produce up to 25 cards depending on input length; if the notes are short, don't make up information not present in the notes to create more cards.
      3. IMPORTANT: If nothing is provided in the notes, do not create any cards.
      4. IMPORTANT: If insuffiecient information is provided, do not use any outside knowledge to create cards.
      5. Each card must have: id (integer starting at 1), question (string), answer (string).
      6. The top-level JSON must include only one key: "cards" (array).
      7. Do not include tags, timestamps, language markers, titles, or any other metadata.
      8. If an item in the notes is ambiguous or missing a clear answer, set the answer to "Ambiguous / not stated".
      9. Do not invent sources or facts not present in the notes.
      10. If the notes do not relate to Torah, return zero cards.
      11. Return parsable JSON only. Do not include any other text.

      Output format example (valid JSON only):
      { 
          "cards": [ 
              {
                  "id": <number starting at 1>, 
                  "question": <string Question text>, 
                  "answer": <string Answer text>
              }
              ... up to 25 cards ...
          ] 
      }

      Now process the input notes below and return ONLY the JSON object, no additional text.
      
      "
      ${notes}
      "
      `.trim();
  }

  private parseLLMToFlashcards(responseText: string): Flashcard[] {
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      const response = JSON.parse(jsonMatch[0]);
      if (!response.cards || !Array.isArray(response.cards)) {
        throw new Error("Invalid JSON structure: missing cards array");
      }

      // Validator 1: Ensure each card has required fields
      for (const card of response.cards) {
        if (
          typeof card.id !== "number" || typeof card.question !== "string" ||
          typeof card.answer !== "string"
        ) {
          throw new Error(
            "Invalid card format: question and answer must be strings, id must be a number",
          );
        }
      }

      // Validator 2: Enforce max 25 cards limit in order to ensure max token limit is not exceeded
      if (response.cards.length > 25) {
        throw new Error("Too many cards generated, exceeds limit of 25");
      }

      // Validator 3: Ensure each that question/answer is non-empty (after trimming) and reasonably sized.
      for (const card of response.cards) {
        const q = card.question?.trim();
        const a = card.answer?.trim();
        if (!q || !a) {
          throw new Error(
            "Invalid card: question and answer must be non-empty",
          );
        }
        const MAX_LEN = 2000;
        if (q.length > MAX_LEN || a.length > MAX_LEN) {
          throw new Error(
            `Invalid card: question/answer exceed maximum length of ${MAX_LEN}`,
          );
        }
      }

      // Map to Flashcard interface
      const cards: Flashcard[] = response.cards.map((card: Flashcard) => ({
        question: card.question,
        answer: card.answer,
      }));

      return cards;
    } catch (error) {
      throw new Error(
        "Failed to parse LLM response: " + (error as Error).message,
      );
    }
  }

  /**
   * @query getUserNotes
   * @effects returns array of all Notes of given user (content and names).
   */
  async _getUserNotes(
    { user }: { user: User },
  ): Promise<{ name: string; content: string }[] | { error: string }> {
    const userNotes = await this.notes.find({
      user: user,
    })
      .project({ name: 1, content: 1, _id: 0 })
      .toArray() as { name: string; content: string }[];
    return userNotes;
  }

  /**
   * @query getNotes
   * @requires notes exist of given name and user
   * @effects returns content of given notes.
   */
  async _getNotes(
    { user, name }: { user: User; name: string },
  ): Promise<Array<{ content: string }> | { error: string }> {
    const note = await this.notes.findOne({ user: user, name: name });

    if (!note) {
      return { error: `No note with name '${name}' found for user '${user}'.` };
    }

    return [{ content: note.content }];
  }

  /**
   * @query _searchNotes
   * @param {object} params - The query parameters.
   * @param {string} params.searchTerm - The text to search for in note names.
   * @returns {Promise<{ note: {id: ID, name: string, content: string, notesOwner: User}; score: number }[]>} An array of Notes whose names match the `searchTerm
   *          along with their relevance scores.
   *
   * @effects returns an array of notes whose names match the `searchTerm`
   *          using `$text` search, ordered by relevance score.
   *
   * @note This query requires a MongoDB Text Index to be created on the `name` field of the `Notes.notes` collection.
   *       Example index: `{ "name": "text" }`. The `$text` operator provides basic full-text search, including phrase matching
   *       (if the search term is quoted) and stemming, but does not support fuzzy matching directly.
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
          note: { // Nest the relevant fields under 'note'
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

  /**
   * @query _getNotesInfo
   * @param {object} params - The query parameters.
   * @param {ID[]} params.noteIDs - An array of note IDs to retrieve.
   * @returns {Promise<NoteDoc[]>} An array of Notes objects corresponding to the given IDs that exist. Ones that don't exist won't return anything.
   *
   * @effects returns array of Notes objects corresponding to the given ids that exist. Ones that don't exist won't return anything
   */
  public async _getNotesInfo(
    { noteIDs }: { noteIDs: ID[] },
  ): Promise<NoteDoc[]> {
    // Query for all notes whose _id is in the provided array
    const noteDocs = await this.notes.find({
      _id: { $in: noteIDs },
    }).toArray();

    return noteDocs;
  }
}
