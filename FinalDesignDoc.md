- In general, my design didn't change that much from what I originally envisioned

# Major design changes

- I removed labels from being tracked inside the flashcards and notest concepts. Instead, they remained as their own concepts, with the ability to track them from the labeling concept with the generic Item concept which could represent Flashcards or Notes instances.
- I decided not to implement the labeling concept in the frontend because I felt that my webapp worked well without it, and given time constraints, it wasn't worth putting resources to it.
- I added search queries to the Notes and Flashcards concepts to enable a search page in the frontend.
- I created and implemented a new UserAuth authentication concept which was important for having different users.
- I added syncs to relevant actions to authenticate before their api calls work with a session token, to block people from making sensitive api calls without having authenticated.
- I added basic information queries, given id's for concepts

# Front end design changes
- In the flashcards page, there are two views:
	- an view mode that makes it easy to see all of the cards at once.
	- a testing mode for viewing a single card at a time.
