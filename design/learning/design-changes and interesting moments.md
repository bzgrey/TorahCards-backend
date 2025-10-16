# Major design change decisions and interesting moments
File purpose: a design file that explains changes that you made to the design of the application as a whole, and that includes 5-10 pointers to interesting moments (explained below) in your development, each with a couple of sentences explaining it.

## Changes:
- Labels should not specifically be used inside Notes and Flashcards concepts, rather all of that can be handled inside the label concept with generic items and then synchronizations for the queries 
- I added queries to the concepts which I didn't realize I would need as explicit actions

## Interesting Moments:
1. The llm helped me code indexing into the database so I wouldn't have redundant data even though I didn't explicitly ask it to do that, which was interesting and helpful, because I didn't know that it was possible. [file.b8c212b6](../../context/design/concepts/Notes/implementation.md/steps/file.b8c212b6.md)
2. At one point I realized that for the labeling, I would need redundant data for speed of different types of queries. [20251016_141821.f455447c](../../context/design/concepts/Labeling/Labeling.md/20251016_141821.f455447c.md)
3. For the test file for the Notes concept, the llm originally created all of the tests under one Deno.test as it methods, which I didn't want. So I asked it to change that. [file.f3ff82d7](../../context/design/concepts/Notes/testing.md/steps/file.f3ff82d7.md)
4. When writing tests for Following concept, it didn't originally create 3-5 extra interesting tests in addition to the principle, so I had to ask it to do that. [20251016_144513.8e81b348](../../context/design/concepts/Following/testing.md/20251016_144513.8e81b348.md)
5. The implementation produced by the llm for the Following concept originally had a bug in redundant mongo queries, which I fixed.  [fix.9bcc5318](../../context/design/concepts/Following/implementation.md/steps/fix.9bcc5318.md)