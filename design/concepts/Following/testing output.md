
```
FollowingConcept: purpose - track items of interest ...
  follow: successfully follows an item for a new user ... ok (84ms)
  follow: successfully follows another item for an existing user ... ok (68ms)
  follow: prevents a user from following an item they already follow (requires check) ... ok (39ms)
  follow: successfully follows an item for a different user ... ok (56ms)
  unfollow: successfully unfollows an item ... ok (56ms)
  unfollow: prevents unfollowing an item not currently followed (requires check) ... ok (35ms)
  unfollow: prevents unfollowing for a non-existent user (requires check) ... ok (17ms)
  _getFollowedItems: returns an empty array for a user who follows nothing ... ok (59ms)
  _getFollowedItems: returns an empty array for a non-existent user ... ok (17ms)
  scenario: follow, unfollow, then follow the same item again ... ok (172ms)
  scenario: verify distinct user states when following the same item ... ok (199ms)
  scenario: unfollowing an item that was never followed by any user ... ok (40ms)
  scenario: user follows an item that only exists as an ID (polymorphism) ... ok (128ms)
FollowingConcept: purpose - track items of interest ... ok (1s)
FollowingConcept: principle - a User selects items to follow and then the user can access them and can also unfollow them ...
------- output -------
Trace: User user:Alice starts to follow item item:Post3.
Trace: Follow action successful.
Trace: User user:Alice checks their followed items.
Trace: Followed items: item:Post3
Trace: User user:Alice decides to unfollow item item:Post3.
Trace: Unfollow action successful.
Trace: User user:Alice re-checks their followed items.
Trace: Followed items are now empty: 
----- output end -----
FollowingConcept: principle - a User selects items to follow and then the user can access them and can also unfollow them ... ok (644ms)

ok | 2 passed (13 steps) | 0 failed (2s)
```