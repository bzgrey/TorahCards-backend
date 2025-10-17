import { assertEquals } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import LabelingConcept from "./LabelingConcept.ts";

Deno.test("Labeling Concept: Operational Principle Fulfillment", async (t) => {
  const [db, client] = await testDb();
  const labeling = new LabelingConcept(db);

  const itemA = "item:article_123" as ID;
  const itemB = "item:image_456" as ID;

  await t.step("Create 'Urgent' label", async () => {
    const createResult = await labeling.createLabel({ name: "Urgent" });
    assertEquals(createResult, {});
    const labelDoc = await labeling.labelsCollection.findOne({
      name: "Urgent",
    });
    assertEquals(!!labelDoc, true, "Urgent label should be created");
  });

  await t.step("Create 'Important' label", async () => {
    const createResult = await labeling.createLabel({ name: "Important" });
    assertEquals(createResult, {});
    const labelDoc = await labeling.labelsCollection.findOne({
      name: "Important",
    });
    assertEquals(!!labelDoc, true, "Important label should be created");
  });

  await t.step("Add itemA to 'Urgent' label", async () => {
    const addResult = await labeling.addLabel({
      item: itemA,
      labelName: "Urgent",
    });
    assertEquals(addResult, {});
    const items = await labeling._getLabelItems({ labelName: "Urgent" });
    assertEquals(items, [{ item: itemA }]);
    const labels = await labeling._getItemLabels({ item: itemA });
    assertEquals(labels, [{ label: "Urgent" }]);
  });

  await t.step("Add itemB to 'Urgent' label", async () => {
    const addResult = await labeling.addLabel({
      item: itemB,
      labelName: "Urgent",
    });
    assertEquals(addResult, {});
    const items = await labeling._getLabelItems({ labelName: "Urgent" });
    assertEquals(items, [{ item: itemA }, { item: itemB }]); // Order might not be guaranteed by $addToSet, but content should match
    const labels = await labeling._getItemLabels({ item: itemB });
    assertEquals(labels, [{ label: "Urgent" }]);
  });

  await t.step("Verify itemA labels and Urgent items", async () => {
    const itemALabels = await labeling._getItemLabels({ item: itemA });
    assertEquals(itemALabels, [{ label: "Urgent" }]);
    const urgentItems = await labeling._getLabelItems({ labelName: "Urgent" });
    // Compare by sorting the item IDs for reliable comparison
    const sortedItems = urgentItems.map((i) => i.item).sort();
    assertEquals(sortedItems, [itemA, itemB].sort());
  });

  await t.step("Remove itemA from 'Urgent' label", async () => {
    const deleteResult = await labeling.deleteLabel({
      item: itemA,
      labelName: "Urgent",
    });
    assertEquals(deleteResult, {});
    const items = await labeling._getLabelItems({ labelName: "Urgent" });
    assertEquals(items, [{ item: itemB }]);
    const labels = await labeling._getItemLabels({ item: itemA });
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
  assertEquals("error" in result, true); // Check that an error was returned
  await client.close();
});

Deno.test("Labeling Concept: Cannot add same label to an item twice", async () => {
  const [db, client] = await testDb();
  const labeling = new LabelingConcept(db);

  const itemC = "item:doc_789" as ID;
  await labeling.createLabel({ name: "Tag" });
  await labeling.addLabel({ item: itemC, labelName: "Tag" });

  const result = await labeling.addLabel({ item: itemC, labelName: "Tag" });
  assertEquals(typeof result, "object");
  assertEquals("error" in result, true); // Check that an error was returned
  await client.close();
});

Deno.test("Labeling Concept: Deleting an Item removes all its label associations", async (t) => {
  const [db, client] = await testDb();
  const labeling = new LabelingConcept(db);

  const itemD = "item:report_101" as ID;
  const itemE = "item:memo_202" as ID;

  await t.step("Setup: Create labels and add items", async () => {
    await labeling.createLabel({ name: "Review" });
    await labeling.createLabel({ name: "Approved" });

    await labeling.addLabel({ item: itemD, labelName: "Review" });
    await labeling.addLabel({ item: itemD, labelName: "Approved" });
    await labeling.addLabel({ item: itemE, labelName: "Review" });

    const itemDLabels = await labeling._getItemLabels({ item: itemD });
    const sortedDLabels = itemDLabels.map((l) => l.label).sort();
    assertEquals(sortedDLabels, ["Approved", "Review"].sort());
    const itemELabels = await labeling._getItemLabels({ item: itemE });
    const sortedELabels = itemELabels.map((l) => l.label).sort();
    assertEquals(sortedELabels, ["Review"].sort());

    const reviewItems = await labeling._getLabelItems({ labelName: "Review" });
    const sortedReviewItems = reviewItems.map((i) => i.item).sort();
    assertEquals(sortedReviewItems, [itemD, itemE].sort());
    const approvedItems = await labeling._getLabelItems({
      labelName: "Approved",
    });
    const sortedApprovedItems = approvedItems.map((i) => i.item).sort();
    assertEquals(sortedApprovedItems, [itemD].sort());
  });

  await t.step("Delete itemD", async () => {
    const deleteResult = await labeling.deleteItem({ item: itemD });
    assertEquals(deleteResult, {});
  });

  await t.step("Verify itemD is no longer found", async () => {
    const itemDLabels = await labeling._getItemLabels({ item: itemD });
    assertEquals(itemDLabels, []); // itemD should not exist anymore
  });

  await t.step("Verify labels no longer contain itemD", async () => {
    const reviewItemsAfterDelete = await labeling._getLabelItems({
      labelName: "Review",
    });
    assertEquals(reviewItemsAfterDelete, [{ item: itemE }]); // Only itemE should remain
    const approvedItemsAfterDelete = await labeling._getLabelItems({
      labelName: "Approved",
    });
    assertEquals(approvedItemsAfterDelete, []); // Should be empty
  });

  await client.close();
});

Deno.test("Labeling Concept: Cannot add a label to an item if the label name does not exist", async () => {
  const [db, client] = await testDb();
  const labeling = new LabelingConcept(db);

  const itemF = "item:task_333" as ID;
  const result = await labeling.addLabel({
    item: itemF,
    labelName: "NonExistentLabel",
  });
  assertEquals(typeof result, "object");
  assertEquals("error" in result, true); // Check that an error was returned
  await client.close();
});
