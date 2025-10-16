import {
  assertArrayIncludes,
  assertEquals,
  assertNotEquals,
} from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { Empty, ID } from "@utils/types.ts";
import FollowingConcept from "./FollowingConcept.ts";

// Define some test IDs for users and items
const userAlice = "user:Alice" as ID;
const userBob = "user:Bob" as ID;
const itemPost1 = "item:Post1" as ID;
const itemPost2 = "item:Post2" as ID;
const itemPost3 = "item:Post3" as ID;
const itemGhostPost = "item:GhostPost" as ID; // An item that might not 'exist' elsewhere
const nonExistentUser = "user:NonExistent" as ID;
const nonExistentItem = "item:NonExistent" as ID; // For unfollowing an item that was never followed by anyone

// --- Individual Tests for 'follow' action and 'requires' ---

Deno.test("FollowingConcept: follow - successfully follows an item for a new user", async () => {
  const [db, client] = await testDb();
  const concept = new FollowingConcept(db);

  const result = await concept.follow({ user: userAlice, item: itemPost1 });
  assertEquals(result, {}); // Expect success
  const followedItems = await concept._getFollowedItems({ user: userAlice });
  assertArrayIncludes(followedItems, [itemPost1]);

  await client.close();
});

Deno.test("FollowingConcept: follow - successfully follows another item for an existing user", async () => {
  const [db, client] = await testDb();
  const concept = new FollowingConcept(db);
  // Setup: Alice follows itemPost1 first
  await concept.follow({ user: userAlice, item: itemPost1 });

  const result = await concept.follow({ user: userAlice, item: itemPost2 });
  assertEquals(result, {}); // Expect success
  const followedItems = await concept._getFollowedItems({ user: userAlice });
  assertArrayIncludes(followedItems, [itemPost1, itemPost2]);

  await client.close();
});

Deno.test("FollowingConcept: follow - prevents a user from following an item they already follow (requires check)", async () => {
  const [db, client] = await testDb();
  const concept = new FollowingConcept(db);
  // Setup: Alice follows itemPost1
  await concept.follow({ user: userAlice, item: itemPost1 });

  const result = await concept.follow({ user: userAlice, item: itemPost1 });
  assertNotEquals(result, {}, "Expected an error object");
  assertEquals(
    (result as { error: string }).error,
    `User ${userAlice} is already following item ${itemPost1}`,
  );
  const followedItems = await concept._getFollowedItems({ user: userAlice });
  assertEquals(followedItems.length, 1); // Count should not change

  await client.close();
});

Deno.test("FollowingConcept: follow - successfully follows an item for a different user", async () => {
  const [db, client] = await testDb();
  const concept = new FollowingConcept(db);
  // Setup: Alice follows itemPost1 (to ensure isolation for Bob)
  await concept.follow({ user: userAlice, item: itemPost1 });

  const result = await concept.follow({ user: userBob, item: itemPost1 });
  assertEquals(result, {}); // Expect success
  const followedItems = await concept._getFollowedItems({ user: userBob });
  assertArrayIncludes(followedItems, [itemPost1]);

  await client.close();
});

// --- Individual Tests for 'unfollow' action and 'requires' ---

Deno.test("FollowingConcept: unfollow - successfully unfollows an item", async () => {
  const [db, client] = await testDb();
  const concept = new FollowingConcept(db);
  // Setup: Alice follows itemPost1 and itemPost2
  await concept.follow({ user: userAlice, item: itemPost1 });
  await concept.follow({ user: userAlice, item: itemPost2 });

  const result = await concept.unfollow({ user: userAlice, item: itemPost1 });
  assertEquals(result, {}); // Expect success
  const followedItems = await concept._getFollowedItems({ user: userAlice });
  assertEquals(followedItems.length, 1);
  assertArrayIncludes(followedItems, [itemPost2]);
  assertEquals(followedItems.includes(itemPost1), false);

  await client.close();
});

Deno.test("FollowingConcept: unfollow - prevents unfollowing an item not currently followed (requires check)", async () => {
  const [db, client] = await testDb();
  const concept = new FollowingConcept(db);
  // Setup: Alice only follows itemPost2
  await concept.follow({ user: userAlice, item: itemPost2 });

  const result = await concept.unfollow({ user: userAlice, item: itemPost1 }); // Alice is not following itemPost1
  assertNotEquals(result, {}, "Expected an error object");
  assertEquals(
    (result as { error: string }).error,
    `User ${userAlice} is not following item ${itemPost1}`,
  );
  const followedItems = await concept._getFollowedItems({ user: userAlice });
  assertEquals(followedItems.length, 1); // Count should not change

  await client.close();
});

Deno.test("FollowingConcept: unfollow - prevents unfollowing for a non-existent user (requires check)", async () => {
  const [db, client] = await testDb();
  const concept = new FollowingConcept(db);

  const result = await concept.unfollow({
    user: nonExistentUser,
    item: itemPost1,
  });
  assertNotEquals(result, {}, "Expected an error object");
  assertEquals(
    (result as { error: string }).error,
    `User ${nonExistentUser} is not following item ${itemPost1}`,
  );

  await client.close();
});

// --- Individual Tests for '_getFollowedItems' query ---

Deno.test("FollowingConcept: _getFollowedItems - returns an empty array for a user who follows nothing", async () => {
  const [db, client] = await testDb();
  const concept = new FollowingConcept(db);
  // Setup: Bob follows itemPost1, then unfollows it
  await concept.follow({ user: userBob, item: itemPost1 });
  await concept.unfollow({ user: userBob, item: itemPost1 });

  const followedItems = await concept._getFollowedItems({ user: userBob });
  assertEquals(followedItems, []);

  await client.close();
});

Deno.test("FollowingConcept: _getFollowedItems - returns an empty array for a non-existent user", async () => {
  const [db, client] = await testDb();
  const concept = new FollowingConcept(db);

  const followedItems = await concept._getFollowedItems({
    user: nonExistentUser,
  });
  assertEquals(followedItems, []);

  await client.close();
});

// --- New "interesting situation" tests (each as a separate Deno.test) ---

Deno.test("FollowingConcept: scenario - follow, unfollow, then follow the same item again", async () => {
  const [db, client] = await testDb();
  const concept = new FollowingConcept(db);
  let result: Empty | { error: string };
  let followedItems: ID[];

  // 1. Alice follows itemPost3
  result = await concept.follow({ user: userAlice, item: itemPost3 });
  assertEquals(result, {});
  followedItems = await concept._getFollowedItems({ user: userAlice });
  assertArrayIncludes(followedItems, [itemPost3]);
  assertEquals(followedItems.length, 1);

  // 2. Alice unfollows itemPost3
  result = await concept.unfollow({ user: userAlice, item: itemPost3 });
  assertEquals(result, {});
  followedItems = await concept._getFollowedItems({ user: userAlice });
  assertEquals(followedItems.includes(itemPost3), false);
  assertEquals(followedItems.length, 0);

  // 3. Alice follows itemPost3 again
  result = await concept.follow({ user: userAlice, item: itemPost3 });
  assertEquals(result, {});
  followedItems = await concept._getFollowedItems({ user: userAlice });
  assertArrayIncludes(followedItems, [itemPost3]);
  assertEquals(followedItems.length, 1); // Should be back to 1 item

  await client.close();
});

Deno.test("FollowingConcept: scenario - verify distinct user states when following the same item", async () => {
  const [db, client] = await testDb();
  const concept = new FollowingConcept(db);
  let result: Empty | { error: string };
  let aliceFollowed: ID[];
  let bobFollowed: ID[];

  // Setup: Alice follows Post2 and Post3
  await concept.follow({ user: userAlice, item: itemPost2 });
  await concept.follow({ user: userAlice, item: itemPost3 });

  // Bob follows Post2 (that Alice also follows)
  await concept.follow({ user: userBob, item: itemPost2 });

  // Verify initial states
  aliceFollowed = await concept._getFollowedItems({ user: userAlice });
  assertArrayIncludes(aliceFollowed, [itemPost2, itemPost3]);
  assertEquals(aliceFollowed.length, 2);

  bobFollowed = await concept._getFollowedItems({ user: userBob });
  assertArrayIncludes(bobFollowed, [itemPost2]);
  assertEquals(bobFollowed.length, 1);

  // Alice unfollows itemPost2
  result = await concept.unfollow({ user: userAlice, item: itemPost2 });
  assertEquals(result, {});

  // Verify Alice no longer follows itemPost2 but Bob still does
  aliceFollowed = await concept._getFollowedItems({ user: userAlice });
  assertEquals(aliceFollowed.includes(itemPost2), false);
  assertArrayIncludes(aliceFollowed, [itemPost3]);
  assertEquals(aliceFollowed.length, 1); // Alice now only follows Post3

  bobFollowed = await concept._getFollowedItems({ user: userBob });
  assertArrayIncludes(bobFollowed, [itemPost2]);
  assertEquals(bobFollowed.length, 1); // Bob still follows Post2

  await client.close();
});

Deno.test("FollowingConcept: scenario - unfollowing an item that was never followed by any user", async () => {
  const [db, client] = await testDb();
  const concept = new FollowingConcept(db);
  // Setup: Alice follows Post3 to have some base state
  await concept.follow({ user: userAlice, item: itemPost3 });

  // Try to unfollow `nonExistentItem` which is not followed by anyone, including Alice
  const result = await concept.unfollow({
    user: userAlice,
    item: nonExistentItem,
  });
  assertNotEquals(result, {}); // Expected an error
  assertEquals(
    (result as { error: string }).error,
    `User ${userAlice} is not following item ${nonExistentItem}`,
  );

  // Verify Alice's followed items remain unchanged
  const aliceFollowed = await concept._getFollowedItems({ user: userAlice });
  assertArrayIncludes(aliceFollowed, [itemPost3]); // Should still only have Post3
  assertEquals(aliceFollowed.length, 1);

  await client.close();
});

Deno.test("FollowingConcept: scenario - user follows an item that only exists as an ID (polymorphism)", async () => {
  const [db, client] = await testDb();
  const concept = new FollowingConcept(db);
  let result: Empty | { error: string };
  let followedItems: ID[];

  // Setup: Alice follows Post3
  await concept.follow({ user: userAlice, item: itemPost3 });

  // Follow `itemGhostPost` which isn't defined as a "real" post in these tests
  result = await concept.follow({ user: userAlice, item: itemGhostPost });
  assertEquals(result, {});

  followedItems = await concept._getFollowedItems({ user: userAlice });
  assertArrayIncludes(followedItems, [itemPost3, itemGhostPost]);
  assertEquals(followedItems.length, 2);

  // Unfollow the 'ghost' item
  result = await concept.unfollow({ user: userAlice, item: itemGhostPost });
  assertEquals(result, {});

  followedItems = await concept._getFollowedItems({ user: userAlice });
  assertArrayIncludes(followedItems, [itemPost3]);
  assertEquals(followedItems.includes(itemGhostPost), false);
  assertEquals(followedItems.length, 1);

  await client.close();
});

// --- Principle Trace Test ---

Deno.test("FollowingConcept: principle - a User selects items to follow and then the user can access them and can also unfollow them", async () => {
  const [db, client] = await testDb();
  const concept = new FollowingConcept(db);

  // # trace:
  // 1. A user (Alice) follows an item (Post3).
  let result: Empty | { error: string };
  let followedItems: ID[];

  console.log(`Trace: User ${userAlice} starts to follow item ${itemPost3}.`);
  result = await concept.follow({ user: userAlice, item: itemPost3 });
  assertEquals(result, {});
  console.log(`Trace: Follow action successful.`);

  // 2. The user (Alice) can access (via _getFollowedItems) the item.
  console.log(`Trace: User ${userAlice} checks their followed items.`);
  followedItems = await concept._getFollowedItems({ user: userAlice });
  assertArrayIncludes(followedItems, [itemPost3]);
  assertEquals(followedItems.length, 1);
  console.log(`Trace: Followed items: ${followedItems}`);

  // 3. The user (Alice) unfollows the item (Post3).
  console.log(
    `Trace: User ${userAlice} decides to unfollow item ${itemPost3}.`,
  );
  result = await concept.unfollow({ user: userAlice, item: itemPost3 });
  assertEquals(result, {});
  console.log(`Trace: Unfollow action successful.`);

  // 4. The user (Alice) can no longer access the item.
  console.log(`Trace: User ${userAlice} re-checks their followed items.`);
  followedItems = await concept._getFollowedItems({ user: userAlice });
  assertEquals(followedItems, []);
  console.log(`Trace: Followed items are now empty: ${followedItems}`);

  await client.close();
});
