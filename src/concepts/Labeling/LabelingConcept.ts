import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

/**
 * @concept Labeling [Item]
 * @purpose track the items that are associated with different labels
 * @principle When someone wants to know what items are related to certain topics or labels,
 * they can create a new label and then add items that are associated to that label.
 * They are also able to remove items or labels if they change their minds.
 */

// Declare collection prefix, using the concept name for isolation
const PREFIX = "Labeling" + ".";

// Generic types for this concept, represented by branded IDs
type Item = ID;
type Label = ID; // Internal unique identifier for a label entity

/**
 * @state (partial)
 * a set of Items with
 *   a labels set of Labels
 *
 * Represents the association of an item with a set of labels.
 */
interface ItemDoc {
  _id: Item;
  labels: string[]; // Array of label names
}

/**
 * @state (partial)
 * a set of Labels with
 *   a name String
 *   a set of Items
 *
 * Represents a label entity, its user-facing name, and the items it's applied to.
 * Note: redundancy (items array) is for ease of access of items associated with labels
 * and vice versa depending on usage, as mentioned in the concept description.
 */
interface LabelDoc {
  _id: Label;
  name: string; // The user-facing name of the label (expected to be unique)
  items: Item[]; // Array of Item IDs associated with this label
}

interface ErrorResult {
  error: string;
}

/**
 * Implements the Labeling concept for managing associations between generic items and labels.
 */
export default class LabelingConcept {
  // MongoDB collections for the concept's state
  itemsCollection: Collection<ItemDoc>;
  labelsCollection: Collection<LabelDoc>;

  /**
   * Constructs a new LabelingConcept instance.
   * @param db The MongoDB database instance.
   */
  constructor(private readonly db: Db) {
    this.itemsCollection = this.db.collection(PREFIX + "items");
    this.labelsCollection = this.db.collection(PREFIX + "labels");
  }

  /**
   * @action createLabel
   * Creates a new label with the given name.
   *
   * @param {string} name - The user-facing name of the label.
   * @returns {Promise<Empty | ErrorResult>} An empty object on success, or an error object if the label already exists.
   *
   * @requires Label does not already exist with the given name string.
   * @effects adds new label to set of Labels with the given name string and an empty set of items.
   */
  async createLabel({ name }: { name: string }): Promise<Empty | ErrorResult> {
    const existingLabel = await this.labelsCollection.findOne({ name });
    if (existingLabel) {
      return { error: `Label '${name}' already exists.` };
    }

    const newLabelId = freshID() as Label; // Generate a new unique ID for the label
    await this.labelsCollection.insertOne({
      _id: newLabelId,
      name,
      items: [], // Initialize with an empty set of items
    });

    return {};
  }

  /**
   * @action addLabel
   * Associates an item with a specific label. If the item does not exist, it will be created.
   *
   * @param {Item} item - The ID of the item to label.
   * @param {string} labelName - The name of the label to apply.
   * @returns {Promise<Empty | ErrorResult>} An empty object on success, or an error object if the label doesn't exist or the item already has the label.
   *
   * @requires label exists in set of labels (by name), and item doesn't already have given label.
   * @effects adds item to set of items if it doesn't exist, adds label to item's set of labels, adds item to label's set of items.
   */
  async addLabel({
    item,
    labelName,
  }: {
    item: Item;
    labelName: string;
  }): Promise<Empty | ErrorResult> {
    const labelDoc = await this.labelsCollection.findOne({ name: labelName });
    if (!labelDoc) {
      return { error: `Label '${labelName}' not found.` };
    }

    const itemDoc = await this.itemsCollection.findOne({ _id: item });

    // Precondition check: item doesn't already have the given label
    if (itemDoc && itemDoc.labels.includes(labelName)) {
      return { error: `Item '${item}' already has label '${labelName}'.` };
    }

    // Effect: Update the item document
    if (!itemDoc) {
      // Item doesn't exist, create it with the new label
      await this.itemsCollection.insertOne({
        _id: item,
        labels: [labelName],
      });
    } else {
      // Item exists, add label to its labels array using $addToSet to avoid duplicates
      await this.itemsCollection.updateOne(
        { _id: item },
        { $addToSet: { labels: labelName } },
      );
    }

    // Effect: Update the label document (add item to its items array)
    await this.labelsCollection.updateOne(
      { _id: labelDoc._id },
      { $addToSet: { items: item } }, // Using $addToSet to avoid duplicates
    );

    return {};
  }

  /**
   * @action deleteLabel
   * Removes a specific label from an item.
   *
   * @param {Item} item - The ID of the item.
   * @param {string} labelName - The name of the label to remove.
   * @returns {Promise<Empty | ErrorResult>} An empty object on success, or an error object if the item or label is not found, or the item doesn't have the label.
   *
   * @requires item exists with given label in its set of labels (by name).
   * @effects removes label from item's set of labels, removes item from label's set of items.
   */
  async deleteLabel({
    item,
    labelName,
  }: {
    item: Item;
    labelName: string;
  }): Promise<Empty | ErrorResult> {
    const labelDoc = await this.labelsCollection.findOne({ name: labelName });
    if (!labelDoc) {
      return { error: `Label '${labelName}' not found.` };
    }

    const itemDoc = await this.itemsCollection.findOne({ _id: item });
    if (!itemDoc) {
      return { error: `Item '${item}' not found.` };
    }

    // Precondition check: item actually has this label
    if (!itemDoc.labels.includes(labelName)) {
      return { error: `Item '${item}' does not have label '${labelName}'.` };
    }

    // Effect: Remove label from item's labels array
    await this.itemsCollection.updateOne(
      { _id: item },
      { $pull: { labels: labelName } },
    );

    // Effect: Remove item from label's items array
    await this.labelsCollection.updateOne(
      { _id: labelDoc._id },
      { $pull: { items: item } },
    );

    return {};
  }

  /**
   * @action deleteItem
   * Removes an item from the system and all associations with labels.
   *
   * @param {Item} item - The ID of the item to delete.
   * @returns {Promise<Empty | ErrorResult>} An empty object on success, or an error object if the item is not found.
   *
   * @requires item exists.
   * @effects removes item from set of items and from each of its corresponding labels' sets of items.
   */
  async deleteItem({ item }: { item: Item }): Promise<Empty | ErrorResult> {
    const itemDoc = await this.itemsCollection.findOne({ _id: item });
    if (!itemDoc) {
      return { error: `Item '${item}' not found.` };
    }

    // Effect: Remove item from all labels it's associated with
    // Only proceed if the item actually has labels
    if (itemDoc.labels && itemDoc.labels.length > 0) {
      // Find all labels by their names and remove the item from their items array
      await this.labelsCollection.updateMany(
        { name: { $in: itemDoc.labels } }, // Find all labels by their names
        { $pull: { items: item } }, // Remove the item ID from their 'items' array
      );
    }

    // Effect: Delete the item document itself
    await this.itemsCollection.deleteOne({ _id: item });

    return {};
  }

  /**
   * @query _getLabelItems
   * Retrieves the set of items associated with a given label.
   *
   * @param {string} labelName - The name of the label.
   * @returns {Promise<Array<{item: Item}>>} An array of objects mapping "item" to Item IDs.
   *
   * @requires given label exists (by name).
   * @effects returns set of items associated with given label.
   */
  async _getLabelItems({
    labelName,
  }: {
    labelName: string;
  }): Promise<Array<{ item: Item }>> {
    const labelDoc = await this.labelsCollection.findOne({ name: labelName });
    if (!labelDoc) {
      return []; // Return empty array if label not found, as per concept description
    }
    return (labelDoc.items || []).map((item) => ({ item }));
  }

  /**
   * @query _getItemLabels
   * Retrieves the set of labels (label names) associated with a given item.
   *
   * @param {Item} item - The ID of the item.
   * @returns {Promise<Array<{label: string}>>} Array of objects mapping "label" to label names.
   *
   * @requires given item exists.
   * @effects returns array of label names associated with given item.
   */
  async _getItemLabels({
    item,
  }: {
    item: Item;
  }): Promise<Array<{ label: string }>> {
    const itemDoc = await this.itemsCollection.findOne({ _id: item });
    if (!itemDoc) {
      return []; // Return empty array if item not found, as per concept description
    }
    return (itemDoc.labels || []).map((label) => ({ label }));
  }
}
