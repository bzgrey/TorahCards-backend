
```
Labeling Concept: Operational Principle Fulfillment ...
  Create 'Urgent' label ... ok (102ms)
  Create 'Important' label ... ok (122ms)
  Add itemA to 'Urgent' label ... ok (166ms)
  Add itemB to 'Urgent' label ... ok (128ms)
  Verify itemA labels and Urgent items ... ok (44ms)
  Remove itemA from 'Urgent' label ... ok (148ms)
Labeling Concept: Operational Principle Fulfillment ... ok (1s)
Labeling Concept: Cannot create duplicate labels ... ok (802ms)
Labeling Concept: Cannot add same label to an item twice ... ok (857ms)
Labeling Concept: Deleting an Item removes all its label associations ...
  Setup: Create labels and add items ... ok (608ms)
  Delete itemD ... ok (83ms)
  Verify itemD is no longer found ... ok (22ms)
  Verify labels no longer contain itemD ... ok (41ms)
Labeling Concept: Deleting an Item removes all its label associations ... ok (1s)
Labeling Concept: Cannot add a label to an item if the label name does not exist ... ok (719ms)

ok | 5 passed (10 steps) | 0 failed (5s)
```