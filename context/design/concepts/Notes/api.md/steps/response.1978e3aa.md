---
timestamp: 'Thu Oct 23 2025 15:08:50 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251023_150850.f0b9519f.md]]'
content_id: 1978e3aab2189030bc30986ac5615259ed3e9e85d71a37cdd9f528e2ed8a9bf5
---

# response:

***

### POST /api/Notes/\_searchNotes

**Description:** Searches for notes based on a provided term, returning an array of matching notes ordered by search score.

**Requirements:**

* (None explicitly specified)

**Effects:**

* returns an array of notes whose names match the `searchTerm`, ordered by search score (greatest first).

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
    "note": {
      "id": "string",
      "notesOwner": "string",
      "name": "string",
      "content": "string"
    },
    "score": "number"
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```
