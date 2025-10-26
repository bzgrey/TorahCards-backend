---
timestamp: 'Sun Oct 26 2025 10:51:21 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251026_105121.7a8eb1a5.md]]'
content_id: dab31541a0554af8b97f4c53c86a9389866c82200c725f523bc087fafb7e480c
---

# response:

***

### POST /api/FlashCards/\_getFlashcardInfo

**Description:** Retrieves a Flashcards object corresponding to a given Flashcards ID.

**Requirements:**

* flashcards id exists

**Effects:**

* returns array contain a Flashcards object corresponding to given id

**Request Body:**

```json
{
  "id": "ID"
}
```

**Success Response Body (Query):**

```json
[
  {
    "user": "User",
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
