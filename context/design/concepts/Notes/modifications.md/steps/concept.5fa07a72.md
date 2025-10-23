---
timestamp: 'Thu Oct 23 2025 11:29:39 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251023_112939.a197589b.md]]'
content_id: 5fa07a723a985e71a2a28c84f5545e43bcb82dd926892c8d1e3d210bb1c78349
---

# concept: Flashcards (Updated)

* **concept** FlashCards\[User]
* **purpose** create easy way to review topic of choice with questions and answers
* **principle** a user can create flashcards on different topics and can add or remove specific cards with questions and answers on them for any flashcards topic
* **state**
  * a set of FlashCards with
    * a User
    * a name String
    * a set of Cards with
      * a question String
      * an answer String
* **actions**
  * addFlashcards(user: User, name: String, cards: Cards)
    * **requires**: FlashCards don't already exist with the same user and name
    * **effects**: adds new flashcards to set of FlashCards associated with the given user, name, and cards
  * removeFlashCards(user: User, name: String)
    * **requires**: FlashCards exist with the same user and name
    * **effects**: removes flashcards with given name and user from both FlashCards set and given user's set
  * addCard(user: User, name: String, question: String, answer: String)
    * **requires**: FlashCards already exist with the same user and name
    * **effects**: adds new card to FlashCards of given name and user with given question and answer
  * removeCard(user: User, name: String, card: Card)
    * **requires**: FlashCards already exist with the same user and name and the given card exists in those FlashCards
    * **effects:** removes card from FlashCards of given name and user
* **queries**
  * \_getUserCards(user: User): (flashcardSet: {id: ID, name: String, cards: Card\[]})\[]
    * **effects**: returns array of all Flashcards of given user, where each item includes its name and corresponding question/answer pairs.
  * \_getCards(user: User, name: String): (card: {id: ID, question: String, answer: String})\[]
    * **requires**: FlashCards exist with the same user and name
    * **effects**: returns array of Card objects (question/answer pairs) for the given user and flashcard name.
  * \_searchFlashcards(user: User, searchTerm: String): (flashcardSet: {id: ID, name: String, cards: Card\[]}, score: Number)\[]
    * **effects**: returns an array of flashcard sets belonging to the given user whose names match the `searchTerm` using fuzzy and phrase matching, ordered by relevance score.

***
