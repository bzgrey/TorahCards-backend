---
timestamp: 'Fri Oct 17 2025 10:23:18 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251017_102318.9f741bbd.md]]'
content_id: 16e086e7a10006450bd8d8bdc6848e4eeaa0b622c7179f0d3b7b0f768c747abd
---

# concept: Labeling

* **concept** Labeling \[Item]
* **purpose** track the items that are associated with different labels
* **principle** When someone wants to know what items are related to certain topics or labels, they can create a new label and then add items that are associated to that label. They are also able to remove items or labels if they change their minds.
* **state**
  * a set Items with
    * a labels set of Labels
  * a set of Labels with
    * a name String
    * a set of Items
  * note: redundancy is for ease of access of items associated with labels and vice versa depending on usage
* **actions**
  * createLabel (name: String)
    * **requires**: Label does not already exist with the given name string
    * **effects**: adds new label to set of Labels with the given name string and an empty set of items
  * addLabel (item: Item, labelName: String)
    * **requires**: label exists in set of labels, and item doesn't already have given label
    * **effects**: adds item to set of items if it doesn't exist, adds label to item's set of labels, adds item to label's set of items
  * deleteLabel (item: Item, labelName: String)
    * **requires**: item exists with given label in its set of labels
    * **effects**: removes label from item's set of labels, removes label from label's set of items
  * deleteItem(item: Item)
    * **requires**:  item exists
    * **effects:** removes item from set of items and from each of its corresponding labels' sets of items
  * getLabelItems(labelName: String): set of Items
    * **requires**: given label exists
    * **effects**: returns set of items associated with given label
  * getItemLabels(item: Item): set of Labels
    * **requires**: given item exists
    * **effects**: returns set of Labels associated with given item
