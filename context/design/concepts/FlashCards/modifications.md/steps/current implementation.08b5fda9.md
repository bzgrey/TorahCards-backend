---
timestamp: 'Mon Oct 20 2025 14:24:51 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251020_142451.ea433b45.md]]'
content_id: 08b5fda9dccfd3854edebcc15c45e73cf27f3b11818d162f932b4025746dd97f
---

# current implementation:

```typescript
/**

* @query _searchFlashcards

* @param {object} params - The query parameters.

* @param {User} params.user - The ID of the user whose flashcards are to be searched.

* @param {string} params.searchTerm - The text to search for in flashcard set names.

* @returns {Promise<{ flashcardSet: {id: ID, name: string, cards: Card[]}; score: number }[]>} An array of matching FlashCardSet

* objects along with their relevance scores.

*

* @effects returns an array of flashcard sets belonging to the given user whose names match the `searchTerm`

* using `$text` search, ordered by relevance score.

*

* @note This query requires a MongoDB Text Index to be created on the `name` field of the `FlashCards.flashcards` collection.

* Example index: `{ "name": "text" }`. The `$text` operator provides basic full-text search, including phrase matching

* (if the search term is quoted) and stemming, but does not support fuzzy matching directly.

*/

async _searchFlashcards(

{ searchTerm }: { user: User; searchTerm: string },

): Promise<

{ flashcardSet: { id: ID; name: string; cards: Card[] }; score: number }[]

> {

// Use MongoDB aggregation pipeline with $text for full-text search

const results = await this.flashcards.aggregate<

{ flashcardSet: FlashCardSet; score: number }

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

flashcardSet: { // Nest the relevant fields under 'flashcardSet'

id: "$_id", // Map _id to id

name: "$name",

cards: "$cards",

setOwner: "$user",

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

flashcardSet: { id: ID; name: string; cards: Card[] };

score: number;

}[];

}
```
