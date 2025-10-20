---
timestamp: 'Mon Oct 20 2025 16:52:24 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251020_165224.76cbf7a9.md]]'
content_id: 612d1e3b7266499f0624c9c767665673714a5fa1648c21dd0d265225e25137f4
---

# response:

***

### POST /api/FlashCards/\_searchFlashcards

**Description:** Searches for flashcard sets whose names match a given search term, returning them ordered by relevance.

**Requirements:**

* No specific requirements stated.

**Effects:**

* returns an array of flashcard sets whose names match the `searchTerm`, ordered by search score (greatest first).

**Request Body:**

```json
{
  "searchTerm": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "id": "ID",
    "setOwner": "User",
    "name": "string",
    "cards": [
      {
        "question": "string",
        "answer": "string"
      }
    ]
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```
