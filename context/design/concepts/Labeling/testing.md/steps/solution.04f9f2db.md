---
timestamp: 'Sun Oct 12 2025 21:07:52 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251012_210752.ac2e4e66.md]]'
content_id: 04f9f2db492d94a46bf2cc81ac1c2e53471d155ec44092e88aa951146b54030c
---

# solution:

The modifications introduced are inconsistent with the underlying data model and the original intent. The `ItemDoc.labels` array should store the unique internal IDs of the labels (`Label` type), not their user-facing names (`string`). This ensures data integrity and allows for efficient lookups. The previous version correctly aligned the interface with the stored data and logic.

The corrected `LabelingConcept.ts` is provided below. This version addresses all inconsistencies, ensuring that:

1. `ItemDoc.labels` correctly stores `Label[]` (internal IDs).
2. Preconditions in `addLabel` and `deleteLabel` accurately check for `Label` IDs.
3. `deleteItem` correctly removes items from associated labels using `Label` IDs.
4. `_getItemLabels` correctly returns `Label[]` (internal IDs) as per the updated type definition.

***
