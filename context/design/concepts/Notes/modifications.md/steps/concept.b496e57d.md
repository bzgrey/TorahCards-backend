---
timestamp: 'Thu Oct 23 2025 14:49:35 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251023_144935.e48f6659.md]]'
content_id: b496e57d7f0f95e1e0ac5651ce2ecfb8befe40118bebb7cc44d2d8cd57328c5a
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
  * \_searchNotes(searchTerm: String): note: {id: ID, notesOwner: User, name: String, content: String}\[]
    * **effects**: returns an array of notes whose names match the `searchTerm`, ordered by search score (greatest first).
