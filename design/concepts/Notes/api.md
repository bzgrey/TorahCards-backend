
[@api-extraction-from-spec](../../tools/api-extraction-from-spec.md)

[@Notes](Notes.md)

# api: Notes concept
# response:

# API Specification: Notes Concept

**Purpose:** enable users to organize textual information, make it easily retrievable, and facilitate learning through automated study aids

---

## API Endpoints

### POST /api/Notes/addNotes

**Description:** Adds new textual notes associated with a specific user and a given name.

**Requirements:**
- Notes don't already exist with the same user and name

**Effects:**
- adds new notes to set of Notes associated with the given user and name

**Request Body:**
```json
{
  "user": "string",
  "name": "string",
  "content": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Notes/removeNotes

**Description:** Removes existing notes identified by a user and name.

**Requirements:**
- Notes exist with the same user and name

**Effects:**
- removes notes with given name and user from Notes set

**Request Body:**
```json
{
  "user": "string",
  "name": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Notes/notesToFlashCards

**Description:** Generates a set of question/answer flashcards based on the content of specified notes using an LLM.

**Requirements:**
- Notes already exist with the same user and name

**Effects:**
- returns set of question/answer pairs of flashcards based on the notes

**Request Body:**
```json
{
  "user": "string",
  "name": "string"
}
```

**Success Response Body (Action):**
```json
{
  "flashcards": [
    {
      "question": "string",
      "answer": "string"
    }
  ]
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Notes/\_getUserNotes

**Description:** Retrieves all notes (content and names) associated with a particular user.

**Requirements:**
- (Implicit: User must exist)

**Effects:**
- returns set of all Notes of given user

**Request Body:**
```json
{
  "user": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "name": "string",
    "content": "string"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Notes/\_getNotes

**Description:** Retrieves the content of a specific note for a given user and note name.

**Requirements:**
- notes exist of given name and user

**Effects:**
- returns content of given notes

**Request Body:**
```json
{
  "user": "string",
  "name": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "content": "string"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---
# search query: write an api for the new search query
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