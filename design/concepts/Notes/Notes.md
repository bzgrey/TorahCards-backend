# concept: Notes

- **concept**: Notes \[User]
- **purpose**: enable users to organize textual information, make it easily retrievable, and facilitate learning through automated study aids
- **principle**: 
	user can store notes or other textual information; 
	the user can also remove notes;
    the user can also use an llm to turn notes into question/answer pairs (flashcards) based on the notes
- **state**:
 - a set of Notes with
	 - a User
	 - a name String
	 - a content String
- **actions**: 
	- addNotes(user: User, name: String, content: String)
		- **requires**: Notes don't already exist with the same user and name
		- **effects**: adds new notes to set of Notes associated with the given user and name
	- removeNotes(user: User, name: String)
		- **requires**: Notes exist with the same user and name
		- **effects**: removes notes with given name and user from Notes set
	- notesToFlashCards(user: User, name: String): Flashcards
		- **requires**: Notes already exist with the same user and name
		- **effects**: returns set of question/answer pairs of flashcards based on the notes
- **queries**
	- \_getUserNotes(user: User): set of notes content and names
		- **effects**: returns set of all Notes of given user
	- \_getNotes(user: User, name: String): String
		- **requires**: notes exist of given name and user
		- **effects**: returns content of given notes