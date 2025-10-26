---
timestamp: 'Fri Oct 24 2025 13:19:58 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251024_131958.df8f0068.md]]'
content_id: 3012dc876cdd050c09cfd768816c56ccf47792a26b14dc20103a4e13c11fee63
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
  * \_getFollowedItems(user: User): Item\[]
    * **effects:** Returns an array of Items currently followed by the given user
