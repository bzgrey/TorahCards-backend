# concept: Flashcards

- **concept** FlashCards\[User]
- **purpose** create easy way to review topic of choice with questions and answers
- **principle** a user can create flashcards on different topics and can add or remove specific cards with questions and answers on them for any flashcards topic
- **state**
	- a set of FlashCards with
		- a User
		- a name String
		- a set of Cards with
			- a question String
			- an answer String
- **actions**
	- addFlashcards(user: User, name: String, cards: Cards)
		- **requires**: FlashCards don't already exist with the same user and name
		- **effects**: adds new flashcards to set of FlashCards associated with the given user, name, and cards
	- removeFlashCards(user: User, name: String)
		- **requires**: FlashCards exist with the same user and name
		- **effects**: removes flashcards with given name and user from both FlashCards set and given user's set
	- addCard(user: User, name: String, question: String, answer: String)
		- **requires**: FlashCards already exist with the same user and name
		- **effects**: adds new card to FlashCards of given name and user with given question and answer
	- removeCard(user: User, name: String, card: Card)
		- **requires**:  FlashCards already exist with the same user and name and the given card exists in those FlashCards  
		- **effects:** removes card from FlashCards of given name and user
- **queries**
	- \_getUserCards(user: User): Set of flashcard names and corresponding question/answer pairs
		- **effects**: returns array of all Flashcards of given user
	- \_getCards(user: User, name: String): Flashcards\[]
		- **requires**: cards of given user and name exist
		- **effects**: returns array of cards object of given user and name
	- \_searchFlashcards(searchTerm: String): flashcardSet: {id: ID, setOwner: User, name: String, cards: Card\[]}\[]
        *   **effects**: returns an array of flashcard sets whose names match the `searchTerm`, ordered by search score (greatest first).
    * \_getFlashcardInfo(flashcards: Flashcards (id)): Flashcards \[]
	    * **effects** returns array of Flashcards objects corresponding to given ids if they exist