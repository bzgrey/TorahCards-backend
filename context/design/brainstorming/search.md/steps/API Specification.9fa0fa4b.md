---
timestamp: 'Mon Oct 20 2025 13:32:12 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251020_133212.d1814232.md]]'
content_id: 9fa0fa4baa25803bca0edbaff7bf381254036cbfadad401da1b7d16fe0369bec
---

# API Specification: Notes Concept

**Purpose:** enable users to organize textual information, make it easily retrievable, and facilitate learning through automated study aids

***

## API Endpoints

### POST /api/Notes/addNotes

**Description:** Adds new textual notes associated with a specific user and a given name.

**Requirements:**

* Notes don't already exist with the same user and name

**Effects:**

* adds new notes to set of Notes associated with the given user and name

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

***

### POST /api/Notes/removeNotes

**Description:** Removes existing notes identified by a user and name.

**Requirements:**

* Notes exist with the same user and name

**Effects:**

* removes notes with given name and user from Notes set

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

***

### POST /api/Notes/notesToFlashCards

**Description:** Generates a set of question/answer flashcards based on the content of specified notes using an LLM.

**Requirements:**

* Notes already exist with the same user and name

**Effects:**

* returns set of question/answer pairs of flashcards based on the notes

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

***

### POST /api/Notes/\_getUserNotes

**Description:** Retrieves all notes (content and names) associated with a particular user.

**Requirements:**

* (Implicit: User must exist)

**Effects:**

* returns set of all Notes of given user

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

***

### POST /api/Notes/\_getNotes

**Description:** Retrieves the content of a specific note for a given user and note name.

**Requirements:**

* notes exist of given name and user

**Effects:**

* returns content of given notes

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

***
