---
timestamp: 'Thu Oct 16 2025 14:30:59 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_143059.6a29e4df.md]]'
content_id: 868652f78626d608a4e1fa433d273f7c1479e31adff030c767ea0a55ea132592
---

# concept: Following

* **concept** Following\[User, Item]
* **purpose** track items of interest
* **principle** a User selects items to follow and then the user can access them and can also unfollow them
* **state**
  * a set of Users with
    * a set of followed Items
* **actions**:
  * follow(user: User, item: Item)
    * **requires**: user isn't already following the item
    * **effects**: Adds the item to the set of followed Items for the given user
  * unfollow(user: User, item: Item)
    * **requires**: User is currently following the item
    * **effects**: Removes the item from the set of followed Items for the given user
  * \_getFollowedItems(user: User): set of Items
    * **effects:** Returns the set of Items currently followed by the given user
