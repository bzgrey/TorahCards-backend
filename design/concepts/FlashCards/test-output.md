
# FlashCards testing output
```
FlashCards Concept - Operational Principle Trace ...
  1. User creates flashcards on a topic ... ok (264ms)
  2. User adds a new card to the flashcards ... ok (40ms)
  3. User removes a specific card from the flashcards ... ok (74ms)
FlashCards Concept - Operational Principle Trace ... ok (1s)
addCard: should allow different users to have flashcards with the same name ... ok (848ms)
FlashCards Concept - Basic addFlashcards and _getUserCards ...
  Add first flashcard set for user 1 ... ok (264ms)
  Add second flashcard set for user 1 ... ok (42ms)
  Retrieve all flashcard sets for user 1 ... ok (24ms)
  Add a flashcard set for user 2 ... ok (44ms)
  Verify user 1's cards are isolated from user 2's ... ok (39ms)
FlashCards Concept - Basic addFlashcards and _getUserCards ... ok (971ms)
FlashCards Concept - removeFlashCards ...
  Remove an existing flashcard set ... ok (39ms)
  Attempt to remove a non-existent flashcard set ... ok (19ms)
FlashCards Concept - removeFlashCards ... ok (981ms)

ok | 4 passed (10 steps) | 0 failed (3s)
```