---
timestamp: 'Mon Oct 13 2025 11:12:01 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251013_111201.1fdd7845.md]]'
content_id: 9d0019f67b97121653c8b09a1e9370df6bbdf935805f1aef53509f42a98f019f
---

# file: src/concepts/Labeling/LabelingConcept.test.ts

```typescript
import { assertEquals, assert } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import LabelingConcept from "./LabelingConcept.ts";

// Define ErrorResult interface locally for the type guard
interface ErrorResult {
  error: string;
}

// Helper function for type guarding query results
function isErrorResult<T>(result: T | ErrorResult): result is ErrorResult {
  return typeof result === 'object' && result !== null && 'error' in result;
}

Deno.test("Labeling Concept: Operational Principle Fulfillment", async (t) => {
  const [db, client] = await testDb();
  const labeling = new LabelingConcept(db);

  const itemA = "item:article_123" as ID;
  const itemB = "item:image_456" as ID;

  // Simulate internal label IDs, as the _getItemLabels returns these
  let urgentLabelId: ID | undefined;
  let importantLabelId: ID | undefined;

  await t.step("Create 'Urgent' label", async () => {
    const createResult = await labeling.createLabel({ name: "Urgent" });
    assertEquals(createResult, {});
    const labelDoc = await labeling.labelsCollection.findOne({ name: "Urgent" });
    urgentLabelId = labelDoc?._id; // Store the internal ID for verification
    assert(!!urgentLabelId, "Urgent label ID should be set");
  });

  await t.step("Create 'Important' label", async () => {
    const createResult = await labeling.createLabel({ name: "Important" });
    assertEquals(createResult, {});
    const labelDoc = await labeling.labelsCollection.findOne({ name: "Important" });
    importantLabelId = labelDoc?._id;
    assert(!!importantLabelId, "Important label ID should be set");
  });

  await t.step("Add itemA to 'Urgent' label", async () => {
    const addResult = await labeling.addLabel({ item: itemA, labelName: "Urgent" });
    assertEquals(addResult, {});

    const items = await labeling._getLabelItems({ labelName: "Urgent" });
    assert(!isErrorResult(items), `Expected items but got error: ${items && typeof items === 'object' ? items.error : 'Unknown'}`);
    assertEquals(items, [itemA]);

    const labels = await labeling._getItemLabels({ item: itemA });
    assert(!isErrorResult(labels), `Expected labels but got error: ${labels && typeof labels === 'object' ? labels.error : 'Unknown'}`);
    assertEquals(labels, [urgentLabelId]);
  });

  await t.step("Add itemB to 'Urgent' label", async () => {
    const addResult = await labeling.addLabel({ item: itemB, labelName: "Urgent" });
    assertEquals(addResult, {});

    const items = await labeling._getLabelItems({ labelName: "Urgent" });
    assert(!isErrorResult(items), `Expected items but got error: ${items && typeof items === 'object' ? items.error : 'Unknown'}`);
    assertEquals(items.sort(), [itemA, itemB].sort()); // .sort() is now safe

    const labels = await labeling._getItemLabels({ item: itemB });
    assert(!isErrorResult(labels), `Expected labels but got error: ${labels && typeof labels === 'object' ? labels.error : 'Unknown'}`);
    assertEquals(labels, [urgentLabelId]);
  });

  await t.step("Verify itemA labels and Urgent items", async () => {
    const itemALabels = await labeling._getItemLabels({ item: itemA });
    assert(!isErrorResult(itemALabels), `Expected labels but got error: ${itemALabels && typeof itemALabels === 'object' ? itemALabels.error : 'Unknown'}`);
    assertEquals(itemALabels, [urgentLabelId]);

    const urgentItems = await labeling._getLabelItems({ labelName: "Urgent" });
    assert(!isErrorResult(urgentItems), `Expected items but got error: ${urgentItems && typeof urgentItems === 'object' ? urgentItems.error : 'Unknown'}`);
    assertEquals(urgentItems.sort(), [itemA, itemB].sort()); // .sort() is now safe
  });

  await t.step("Remove itemA from 'Urgent' label", async () => {
    const deleteResult = await labeling.deleteLabel({ item: itemA, labelName: "Urgent" });
    assertEquals(deleteResult, {});

    const items = await labeling._getLabelItems({ labelName: "Urgent" });
    assert(!isErrorResult(items), `Expected items but got error: ${items && typeof items === 'object' ? items.error : 'Unknown'}`);
    assertEquals(items, [itemB]);

    const labels = await labeling._getItemLabels({ item: itemA });
    assert(!isErrorResult(labels), `Expected labels but got error: ${labels && typeof labels === 'object' ? labels.error : 'Unknown'}`);
    assertEquals(labels, []);
  });

  await client.close();
});

Deno.test("Labeling Concept: Cannot create duplicate labels", async () => {
  const [db, client] = await testDb();
  const labeling = new LabelingConcept(db);

  await labeling.createLabel({ name: "Important" });
  const result = await labeling.createLabel({ name: "Important" });
  assertEquals(typeof result, "object");
  assert("error" in result, "Expected an error result when creating duplicate label");
  await client.close();
});

Deno.test("Labeling Concept: Cannot add same label to an item twice", async () => {
  const [db, client] = await testDb();
  const labeling = new LabelingConcept(db);

  const itemC = "item:doc_789" as ID;
  await labeling.createLabel({ name: "Tag" });
  const addResult1 = await labeling.addLabel({ item: itemC, labelName: "Tag" });
  assertEquals(addResult1, {});

  const result = await labeling.addLabel({ item: itemC, labelName: "Tag" });
  assertEquals(typeof result, "object");
  assert("error" in result, "Expected an error result when adding duplicate label to item");
  await client.close();
});

Deno.test("Labeling Concept: Deleting an Item removes all its label associations", async (t) => {
  const [db, client] = await testDb();
  const labeling = new LabelingConcept(db);

  const itemD = "item:report_101" as ID;
  const itemE = "item:memo_202" as ID;
  let reviewLabelId: ID | undefined;
  let approvedLabelId: ID | undefined;

  await t.step("Setup: Create labels and add items", async () => {
    await labeling.createLabel({ name: "Review" });
    await labeling.createLabel({ name: "Approved" });

    const reviewDoc = await labeling.labelsCollection.findOne({ name: "Review" });
    reviewLabelId = reviewDoc?._id;
    const approvedDoc = await labeling.labelsCollection.findOne({ name: "Approved" });
    approvedLabelId = approvedDoc?._id;
    assert(!!reviewLabelId, "Review label ID should be set");
    assert(!!approvedLabelId, "Approved label ID should be set");

    await labeling.addLabel({ item: itemD, labelName: "Review" });
    await labeling.addLabel({ item: itemD, labelName: "Approved" });
    await labeling.addLabel({ item: itemE, labelName: "Review" });

    const itemDLabels = await labeling._getItemLabels({ item: itemD });
    assert(!isErrorResult(itemDLabels), `Expected labels for itemD but got error: ${itemDLabels && typeof itemDLabels === 'object' ? itemDLabels.error : 'Unknown'}`);
    assertEquals(itemDLabels.sort(), [reviewLabelId, approvedLabelId].sort()); // .sort() is now safe

    const itemELabels = await labeling._getItemLabels({ item: itemE });
    assert(!isErrorResult(itemELabels), `Expected labels for itemE but got error: ${itemELabels && typeof itemELabels === 'object' ? itemELabels.error : 'Unknown'}`);
    assertEquals(itemELabels.sort(), [reviewLabelId].sort()); // .sort() is now safe

    const reviewItems = await labeling._getLabelItems({ labelName: "Review" });
    assert(!isErrorResult(reviewItems), `Expected items for 'Review' but got error: ${reviewItems && typeof reviewItems === 'object' ? reviewItems.error : 'Unknown'}`);
    assertEquals(reviewItems.sort(), [itemD, itemE].sort()); // .sort() is now safe

    const approvedItems = await labeling._getLabelItems({ labelName: "Approved" });
    assert(!isErrorResult(approvedItems), `Expected items for 'Approved' but got error: ${approvedItems && typeof approvedItems === 'object' ? approvedItems.error : 'Unknown'}`);
    assertEquals(approvedItems.sort(), [itemD].sort()); // .sort() is now safe
  });

  await t.step("Delete itemD", async () => {
    const deleteResult = await labeling.deleteItem({ item: itemD });
    assertEquals(deleteResult, {});
  });

  await t.step("Verify itemD is no longer found", async () => {
    const itemDLabels = await labeling._getItemLabels({ item: itemD });
    assertEquals(typeof itemDLabels, "object");
    assert("error" in itemDLabels, "Expected an error result for non-existent itemD");
  });

  await t.step("Verify labels no longer contain itemD", async () => {
    const reviewItemsAfterDelete = await labeling._getLabelItems({
      labelName: "Review",
    });
    assert(!isErrorResult(reviewItemsAfterDelete), `Expected items for 'Review' after delete but got error: ${reviewItemsAfterDelete && typeof reviewItemsAfterDelete === 'object' ? reviewItemsAfterDelete.error : 'Unknown'}`);
    assertEquals(reviewItemsAfterDelete, [itemE]);

    const approvedItemsAfterDelete = await labeling._getLabelItems({
      labelName: "Approved",
    });
    assert(!isErrorResult(approvedItemsAfterDelete), `Expected items for 'Approved' after delete but got error: ${approvedItemsAfterDelete && typeof approvedItemsAfterDelete === 'object' ? approvedItemsAfterDelete.error : 'Unknown'}`);
    assertEquals(approvedItemsAfterDelete, []);
  });

  await client.close();
});

Deno.test("Labeling Concept: Cannot add a label to an item if the label name does not exist", async () => {
  const [db, client] = await testDb();
  const labeling = new LabelingConcept(db);

  const itemF = "item:task_333" as ID;
  const result = await labeling.addLabel({ item: itemF, labelName: "NonExistentLabel" });
  assertEquals(typeof result, "object");
  assert("error" in result, "Expected an error result when adding non-existent label");
  await client.close();
});
```
