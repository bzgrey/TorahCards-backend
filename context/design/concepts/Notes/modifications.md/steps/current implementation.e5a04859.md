---
timestamp: 'Thu Oct 23 2025 11:29:39 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251023_112939.a197589b.md]]'
content_id: e5a04859f61ec543e8c5501f3a5b05b08e7136156f50fb6a0137bf85c276b82e
---

# current implementation:

```typescript
  

/**

* @query _searchFlashcards

* @param {object} params - The query parameters.

* @param {User} params.user - The ID of the user whose flashcards are to be searched.

* @param {string} params.searchTerm - The text to search for in flashcard set names.

* @returns {Promise<{ flashcardSet: {id: ID, name: string, cards: Card[], setCreator: User}; score: number }[]>} An array of matching FlashCardSet

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

setCreator: "$user",

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
