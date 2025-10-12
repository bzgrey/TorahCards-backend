---
timestamp: 'Sat Oct 11 2025 21:13:16 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251011_211316.948558f0.md]]'
content_id: 89b8746d58b9b062b292ed7b304526d512d78974d9686235db0129b278c3e535
---

# concept: Notes

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
* a set of Users with
  * a set of notes name Strings (stores names of all notes for given user)
* **actions**:
  * addNotes(user: User, name: String, content: String)
    * **requires**: Notes don't already exist with the same user and name
    * **effects**: adds new notes to set of Notes associated with the given user and name. Also adds new Notes to set of Users
  * removeNotes(user: User, name: String)
    * **requires**: Notes exist with the same user and name
    * **effects**: removes notes with given name and user from both Notes set and given user's set (name removed)
  * notesToFlashCards(user: User, notes: Notes): Flashcards
    * **requires**: Notes already exist with the same user
    * **effects**: returns set of question/answer pairs of flashcards based on the notes
  * getNotes
