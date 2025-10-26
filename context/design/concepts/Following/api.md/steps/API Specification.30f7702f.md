---
timestamp: 'Fri Oct 24 2025 13:20:25 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251024_132025.d680ad78.md]]'
content_id: 30f7702f53fbe734a92f9ddc997451f20bdff53a0b741b3e2a46fc5795aa5189
---

# API Specification: Following Concept

**Purpose:** track items of interest

***

## API Endpoints

### POST /api/Following/follow

**Description:** Adds the item to the set of followed Items for the given user.

**Requirements:**

* user isn't already following the item

**Effects:**

* Adds the item to the set of followed Items for the given user

**Request Body:**

```json
{
  "user": "User",
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

### POST /api/Following/unfollow

**Description:** Removes the item from the set of followed Items for the given user.

**Requirements:**

* User is currently following the item

**Effects:**

* Removes the item from the set of followed Items for the given user

**Request Body:**

```json
{
  "user": "User",
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

### POST /api/Following/\_getFollowedItems

**Description:** Returns an array of Items currently followed by the given user.

**Requirements:**

* true (implicitly, as no specific requirements are listed)

**Effects:**

* Returns an array of Items currently followed by the given user

**Request Body:**

```json
{
  "user": "User"
}
```

**Success Response Body (Query):**

```json
[
  "Item"
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```
