---
timestamp: 'Thu Oct 23 2025 14:49:35 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251023_144935.e48f6659.md]]'
content_id: caaf28f2a5fa5356dacd0c9c32514670d978e898fb22b10e901818931e165ed1
---

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
