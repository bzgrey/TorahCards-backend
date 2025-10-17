---
timestamp: 'Fri Oct 17 2025 10:23:46 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251017_102346.29531796.md]]'
content_id: 4112fe1e38bf0a15ae5710e4242f74774cc483fe999e2991a6c1640713ffd6eb
---

# API Specification: Labeling Concept

**Purpose:** track the items that are associated with different labels

***

## API Endpoints

### POST /api/Labeling/createLabel

**Description:** Creates a new label with a specified name.

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

**Description:** Removes a specific label association from an item.

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

### POST /api/Labeling/getLabelItems

**Description:** Retrieves all items that have been associated with a specific label.

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

### POST /api/Labeling/getItemLabels

**Description:** Retrieves all labels that have been associated with a specific item.

**Requirements:**

* given item exists

**Effects:**

* returns set of Labels associated with given item

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
