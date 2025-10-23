---
timestamp: 'Thu Oct 23 2025 11:29:47 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251023_112947.5d2e9e4b.md]]'
content_id: 5b0621f51d86f79327646c018c77872beb08c827ce21ff70b8a627bc77a1fc71
---

# concept: Notes (Updated)

* **concept**: Notes \[User]
* **purpose**: enable users to organize textual information, make it easily retrievable, and facilitate learning through automated study aids
* **principle**:
  user can store notes or other textual information;
  the user can also remove notes;
  the user can also use an llm to turn notes into question/answer pairs (flashcards) based on the notes
* **state**:
* a set of Notes with
  * a User
  * a name String
  * a content String
* **actions**:
  * addNotes(user: User, name: String, content: String)
    * **requires**: Notes don't already exist with the same user and name
    * **effects**: adds new notes to set of Notes associated with the given user and name
  * removeNotes(user: User, name: String)
    * **requires**: Notes exist with the same user and name
    * **effects**: removes notes with given name and user from Notes set
  * notesToFlashCards(user: User, name: String): Flashcards
    * **requires**: Notes already exist with the same user and name
    * **effects**: returns set of question/answer pairs of flashcards based on the notes
* **queries**
  * \_getUserNotes(user: User): (note: {id: ID, name: String, content: String})\[]
    * **effects**: returns array of all Notes of given user, where each item includes its ID, name, and content.
  * \_getNotes(user: User, name: String): (content: String)
    * **requires**: notes exist of given name and user
    * **effects**: returns content of given notes
  * \_searchNotes(user: User, searchTerm: String): (note: {id: ID, name: String, content: String}, score: Number)\[]
    * **effects**: returns an array of note objects belonging to the given user whose `name` or `content` matches the `searchTerm` using fuzzy and phrase matching, ordered by relevance score.
