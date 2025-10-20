[@api-extraction-from-spec](../../tools/api-extraction-from-spec.md)

[@Flashcards](Flashcards.md)


# api: Labeling concept

# response:

# API Specification: FlashCards Concept

**Purpose:** create easy way to review topic of choice with questions and answers

---

## API Endpoints

### POST /api/FlashCards/addFlashcards

**Description:** Adds a new set of flashcards for a specific user and topic, including an initial collection of cards.

**Requirements:**
- FlashCards don't already exist with the same user and name

**Effects:**
- adds new flashcards to set of FlashCards associated with the given user, name, and cards

**Request Body:**
```json
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

### POST /api/FlashCards/removeFlashCards

**Description:** Removes an entire set of flashcards for a specific user and topic.

**Requirements:**
- FlashCards exist with the same user and name

**Effects:**
- removes flashcards with given name and user from both FlashCards set and given user's set

**Request Body:**
```json
{
  "user": "User",
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

### POST /api/FlashCards/addCard

**Description:** Adds a single new card (question and answer) to an existing flashcards topic for a user.

**Requirements:**
- FlashCards already exist with the same user and name

**Effects:**
- adds new card to FlashCards of given name and user with given question and answer

**Request Body:**
```json
{
  "user": "User",
  "name": "string",
  "question": "string",
  "answer": "string"
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

### POST /api/FlashCards/removeCard

**Description:** Removes a specific card from an existing flashcards topic for a user.

**Requirements:**
- FlashCards already exist with the same user and name and the given card exists in those FlashCards

**Effects:**
- removes card from FlashCards of given name and user

**Request Body:**
```json
{
  "user": "User",
  "name": "string",
  "card": {
    "question": "string",
    "answer": "string"
  }
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

### POST /api/FlashCards/\_getUserCards

**Description:** Retrieves all flashcards, including their names and question/answer pairs, for a given user.

**Requirements:**
- No specific requirements stated, implicitly assumes the user exists.

**Effects:**
- returns array of all Flashcards of given user

**Request Body:**
```json
{
  "user": "User"
}
```

**Success Response Body (Query):**
```json
[
  {
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
---

### POST /api/FlashCards/\_getCards

**Description:** Retrieves the cards (questions and answers) for a specific flashcards topic belonging to a user.

**Requirements:**
- cards of given user and name exist

**Effects:**
- returns cards of given user and name

**Request Body:**
```json
{
  "user": "User",
  "name": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "question": "string",
    "answer": "string"
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

# API \_searchFlashcards: write api for this action
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