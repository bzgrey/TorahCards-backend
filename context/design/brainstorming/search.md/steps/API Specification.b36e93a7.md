---
timestamp: 'Mon Oct 20 2025 13:32:12 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251020_133212.d1814232.md]]'
content_id: b36e93a7b33269584bbf63ee318f59004d17f3f7bcb601aac5ad26b3afb9b251
---

# API Specification: Labeling Concept

**Purpose:** track the items that are associated with different labels

***

## API Endpoints

### POST /api/Labeling/createLabel

**Description:** Creates a new label with the specified name.

**Requirements:**

* Label does not already exist with the given name string

**Effects:**

* adds new label to set of Labels with the given name string and an empty set of items

**Request Body:**

```json
{
  "name": "String"
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Labeling/addLabel

**Description:** Associates a given item with an existing label.

**Requirements:**

* label exists in set of labels, and item doesn't already have given label

**Effects:**

* adds item to set of items if it doesn't exist, adds label to item's set of labels, adds item to label's set of items

**Request Body:**

```json
{
  "item": "Item",
  "labelName": "String"
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Labeling/deleteLabel

**Description:** Disassociates a specific item from a specific label.

**Requirements:**

* item exists with given label in its set of labels

**Effects:**

* removes label from item's set of labels, removes label from label's set of items

**Request Body:**

```json
{
  "item": "Item",
  "labelName": "String"
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Labeling/deleteItem

**Description:** Deletes an item and removes all its associated labels.

**Requirements:**

* item exists

**Effects:**

* removes item from set of items and from each of its corresponding labels' sets of items

**Request Body:**

```json
{
  "item": "Item"
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Labeling/\_getLabelItems

**Description:** Retrieves all items associated with a specific label.

**Requirements:**

* given label exists

**Effects:**

* returns set of items associated with given label

**Request Body:**

```json
{
  "labelName": "String"
}
```

**Success Response Body (Query):**

```json
[
  {
    "item": "Item"
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Labeling/\_getItemLabels

**Description:** Retrieves all labels associated with a specific item.

**Requirements:**

* given item exists

**Effects:**

* returns set of label name Strings associated with given item

**Request Body:**

```json
{
  "item": "Item"
}
```

**Success Response Body (Query):**

```json
[
  {
    "name": "String"
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***
