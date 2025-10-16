

[@implementation](implementation.md)

[@testing-concepts](../../background/testing-concepts.md)

# test: Following
# response:

Here's the test file for the `FollowingConcept`, structured according to the provided guidelines, including a trace that fulfills the concept's principle.

# file: src/Following/FollowingConcept.test.ts

```typescript
import { assertEquals, assertNotEquals, assertArrayIncludes } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID, Empty } from "@utils/types.ts";
import FollowingConcept from "./FollowingConcept.ts";

// Define some test IDs for users and items
const userAlice = "user:Alice" as ID;
const userBob = "user:Bob" as ID;
const itemPost1 = "item:Post1" as ID;
const itemPost2 = "item:Post2" as ID;
const itemPost3 = "item:Post3" as ID;
const nonExistentUser = "user:NonExistent" as ID;
const nonExistentItem = "item:NonExistent" as ID;

Deno.test("FollowingConcept: purpose - track items of interest", {
  // Setup before all tests in this file (handled by testDb)
  // Teardown after all tests in this file (handled by client.close() in individual tests)
}, async (t) => {
  const [db, client] = await testDb();
  const concept = new FollowingConcept(db);

  await t.step("follow: successfully follows an item for a new user", async () => {
    const result = await concept.follow({ user: userAlice, item: itemPost1 });
    assertEquals(result, {}); // Expect success
    const followedItems = await concept._getFollowedItems({ user: userAlice });
    assertArrayIncludes(followedItems, [itemPost1]);
  });

  await t.step("follow: successfully follows another item for an existing user", async () => {
    // userAlice already followed itemPost1 from previous test step
    const result = await concept.follow({ user: userAlice, item: itemPost2 });
    assertEquals(result, {}); // Expect success
    const followedItems = await concept._getFollowedItems({ user: userAlice });
    assertArrayIncludes(followedItems, [itemPost1, itemPost2]);
  });

  await t.step("follow: prevents a user from following an item they already follow (requires check)", async () => {
    // userAlice is already following itemPost1
    const result = await concept.follow({ user: userAlice, item: itemPost1 });
    assertNotEquals(result, {}, "Expected an error object");
    assertEquals((result as { error: string }).error, `User ${userAlice} is already following item ${itemPost1}`);
    const followedItems = await concept._getFollowedItems({ user: userAlice });
    assertEquals(followedItems.length, 2); // Count should not change
  });

  await t.step("follow: successfully follows an item for a different user", async () => {
    const result = await concept.follow({ user: userBob, item: itemPost1 });
    assertEquals(result, {}); // Expect success
    const followedItems = await concept._getFollowedItems({ user: userBob });
    assertArrayIncludes(followedItems, [itemPost1]);
  });

  await t.step("unfollow: successfully unfollows an item", async () => {
    // userAlice is following itemPost1 and itemPost2
    const result = await concept.unfollow({ user: userAlice, item: itemPost1 });
    assertEquals(result, {}); // Expect success
    const followedItems = await concept._getFollowedItems({ user: userAlice });
    assertEquals(followedItems.length, 1);
    assertArrayIncludes(followedItems, [itemPost2]);
    assertEquals(followedItems.includes(itemPost1), false);
  });

  await t.step("unfollow: prevents unfollowing an item not currently followed (requires check)", async () => {
    // userAlice is not following itemPost1 anymore
    const result = await concept.unfollow({ user: userAlice, item: itemPost1 });
    assertNotEquals(result, {}, "Expected an error object");
    assertEquals((result as { error: string }).error, `User ${userAlice} is not following item ${itemPost1}`);
    const followedItems = await concept._getFollowedItems({ user: userAlice });
    assertEquals(followedItems.length, 1); // Count should not change
  });

  await t.step("unfollow: prevents unfollowing for a non-existent user (requires check)", async () => {
    const result = await concept.unfollow({ user: nonExistentUser, item: itemPost1 });
    assertNotEquals(result, {}, "Expected an error object");
    assertEquals((result as { error: string }).error, `User ${nonExistentUser} is not following item ${itemPost1}`);
  });

  await t.step("_getFollowedItems: returns an empty array for a user who follows nothing", async () => {
    // Bob only followed itemPost1
    await concept.unfollow({ user: userBob, item: itemPost1 }); // Make Bob follow nothing
    const followedItems = await concept._getFollowedItems({ user: userBob });
    assertEquals(followedItems, []);
  });

  await t.step("_getFollowedItems: returns an empty array for a non-existent user", async () => {
    const followedItems = await concept._getFollowedItems({ user: nonExistentUser });
    assertEquals(followedItems, []);
  });

  await client.close(); // Close the database connection after all tests in this file
});

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
  console.log(`Trace: Follow action successful.`)

  // 2. The user (Alice) can access (via _getFollowedItems) the item.
  console.log(`Trace: User ${userAlice} checks their followed items.`);
  followedItems = await concept._getFollowedItems({ user: userAlice });
  assertArrayIncludes(followedItems, [itemPost3]);
  assertEquals(followedItems.length, 1);
  console.log(`Trace: Followed items: ${followedItems}`);

  // 3. The user (Alice) unfollows the item (Post3).
  console.log(`Trace: User ${userAlice} decides to unfollow item ${itemPost3}.`);
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
```

# problem: in addition to testing the principle, add 3-5 tests of interesting situations

# response:

Okay, here are 4 additional tests covering interesting situations for the `FollowingConcept`, integrated into the existing test file.

# file: src/Following/FollowingConcept.test.ts

```typescript
import { assertEquals, assertNotEquals, assertArrayIncludes } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID, Empty } from "@utils/types.ts";
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

Deno.test("FollowingConcept: purpose - track items of interest", {
  // Setup before all tests in this file (handled by testDb)
  // Teardown after all tests in this file (handled by client.close() in individual tests)
}, async (t) => {
  const [db, client] = await testDb();
  const concept = new FollowingConcept(db);

  await t.step("follow: successfully follows an item for a new user", async () => {
    const result = await concept.follow({ user: userAlice, item: itemPost1 });
    assertEquals(result, {}); // Expect success
    const followedItems = await concept._getFollowedItems({ user: userAlice });
    assertArrayIncludes(followedItems, [itemPost1]);
  });

  await t.step("follow: successfully follows another item for an existing user", async () => {
    // userAlice already followed itemPost1 from previous test step
    const result = await concept.follow({ user: userAlice, item: itemPost2 });
    assertEquals(result, {}); // Expect success
    const followedItems = await concept._getFollowedItems({ user: userAlice });
    assertArrayIncludes(followedItems, [itemPost1, itemPost2]);
  });

  await t.step("follow: prevents a user from following an item they already follow (requires check)", async () => {
    // userAlice is already following itemPost1
    const result = await concept.follow({ user: userAlice, item: itemPost1 });
    assertNotEquals(result, {}, "Expected an error object");
    assertEquals((result as { error: string }).error, `User ${userAlice} is already following item ${itemPost1}`);
    const followedItems = await concept._getFollowedItems({ user: userAlice });
    assertEquals(followedItems.length, 2); // Count should not change
  });

  await t.step("follow: successfully follows an item for a different user", async () => {
    const result = await concept.follow({ user: userBob, item: itemPost1 });
    assertEquals(result, {}); // Expect success
    const followedItems = await concept._getFollowedItems({ user: userBob });
    assertArrayIncludes(followedItems, [itemPost1]);
  });

  await t.step("unfollow: successfully unfollows an item", async () => {
    // userAlice is following itemPost1 and itemPost2
    const result = await concept.unfollow({ user: userAlice, item: itemPost1 });
    assertEquals(result, {}); // Expect success
    const followedItems = await concept._getFollowedItems({ user: userAlice });
    assertEquals(followedItems.length, 1);
    assertArrayIncludes(followedItems, [itemPost2]);
    assertEquals(followedItems.includes(itemPost1), false);
  });

  await t.step("unfollow: prevents unfollowing an item not currently followed (requires check)", async () => {
    // userAlice is not following itemPost1 anymore
    const result = await concept.unfollow({ user: userAlice, item: itemPost1 });
    assertNotEquals(result, {}, "Expected an error object");
    assertEquals((result as { error: string }).error, `User ${userAlice} is not following item ${itemPost1}`);
    const followedItems = await concept._getFollowedItems({ user: userAlice });
    assertEquals(followedItems.length, 1); // Count should not change
  });

  await t.step("unfollow: prevents unfollowing for a non-existent user (requires check)", async () => {
    const result = await concept.unfollow({ user: nonExistentUser, item: itemPost1 });
    assertNotEquals(result, {}, "Expected an error object");
    assertEquals((result as { error: string }).error, `User ${nonExistentUser} is not following item ${itemPost1}`);
  });

  await t.step("_getFollowedItems: returns an empty array for a user who follows nothing", async () => {
    // Bob only followed itemPost1
    await concept.unfollow({ user: userBob, item: itemPost1 }); // Make Bob follow nothing
    const followedItems = await concept._getFollowedItems({ user: userBob });
    assertEquals(followedItems, []);
  });

  await t.step("_getFollowedItems: returns an empty array for a non-existent user", async () => {
    const followedItems = await concept._getFollowedItems({ user: nonExistentUser });
    assertEquals(followedItems, []);
  });

  // --- New "interesting situation" tests ---

  await t.step("scenario: follow, unfollow, then follow the same item again", async () => {
    // User Alice is currently following itemPost2
    // Let's use itemPost3 for this sequence
    let result: Empty | { error: string };
    let followedItems: ID[];

    // 1. Alice follows itemPost3
    result = await concept.follow({ user: userAlice, item: itemPost3 });
    assertEquals(result, {});
    followedItems = await concept._getFollowedItems({ user: userAlice });
    assertArrayIncludes(followedItems, [itemPost2, itemPost3]);
    assertEquals(followedItems.length, 2);

    // 2. Alice unfollows itemPost3
    result = await concept.unfollow({ user: userAlice, item: itemPost3 });
    assertEquals(result, {});
    followedItems = await concept._getFollowedItems({ user: userAlice });
    assertArrayIncludes(followedItems, [itemPost2]);
    assertEquals(followedItems.includes(itemPost3), false);
    assertEquals(followedItems.length, 1);

    // 3. Alice follows itemPost3 again
    result = await concept.follow({ user: userAlice, item: itemPost3 });
    assertEquals(result, {});
    followedItems = await concept._getFollowedItems({ user: userAlice });
    assertArrayIncludes(followedItems, [itemPost2, itemPost3]);
    assertEquals(followedItems.length, 2); // Should be back to 2 items
  });

  await t.step("scenario: verify distinct user states when following the same item", async () => {
    // Alice is currently following itemPost2 and itemPost3
    // Bob is following nothing
    await concept.follow({ user: userBob, item: itemPost2 }); // Bob follows itemPost2 (that Alice also follows)
    
    // Verify both users are following itemPost2
    let aliceFollowed = await concept._getFollowedItems({ user: userAlice });
    assertArrayIncludes(aliceFollowed, [itemPost2]);
    let bobFollowed = await concept._getFollowedItems({ user: userBob });
    assertArrayIncludes(bobFollowed, [itemPost2]);
    assertEquals(aliceFollowed.length, 2); // Alice has Post2, Post3
    assertEquals(bobFollowed.length, 1);   // Bob has Post2

    // Alice unfollows itemPost2
    const result = await concept.unfollow({ user: userAlice, item: itemPost2 });
    assertEquals(result, {});

    // Verify Alice no longer follows itemPost2 but Bob still does
    aliceFollowed = await concept._getFollowedItems({ user: userAlice });
    assertEquals(aliceFollowed.includes(itemPost2), false);
    assertArrayIncludes(aliceFollowed, [itemPost3]);
    assertEquals(aliceFollowed.length, 1); // Alice now only follows Post3

    bobFollowed = await concept._getFollowedItems({ user: userBob });
    assertArrayIncludes(bobFollowed, [itemPost2]);
    assertEquals(bobFollowed.length, 1); // Bob still follows Post2
  });

  await t.step("scenario: unfollowing an item that was never followed by any user", async () => {
    // Ensure `nonExistentItem` is truly not followed by anyone
    const result = await concept.unfollow({ user: userAlice, item: nonExistentItem });
    assertNotEquals(result, {}); // Expected an error
    assertEquals((result as { error: string }).error, `User ${userAlice} is not following item ${nonExistentItem}`);

    // Verify Alice's followed items remain unchanged
    const aliceFollowed = await concept._getFollowedItems({ user: userAlice });
    assertArrayIncludes(aliceFollowed, [itemPost3]); // Should still only have Post3 from previous test
    assertEquals(aliceFollowed.length, 1);
  });

  await t.step("scenario: user follows an item that only exists as an ID (polymorphism)", async () => {
    // Alice is currently following itemPost3
    // Follow `itemGhostPost` which isn't defined as a "real" post in these tests
    let result = await concept.follow({ user: userAlice, item: itemGhostPost });
    assertEquals(result, {});

    let followedItems = await concept._getFollowedItems({ user: userAlice });
    assertArrayIncludes(followedItems, [itemPost3, itemGhostPost]);
    assertEquals(followedItems.length, 2);

    // Unfollow the 'ghost' item
    result = await concept.unfollow({ user: userAlice, item: itemGhostPost });
    assertEquals(result, {});

    followedItems = await concept._getFollowedItems({ user: userAlice });
    assertArrayIncludes(followedItems, [itemPost3]);
    assertEquals(followedItems.includes(itemGhostPost), false);
    assertEquals(followedItems.length, 1);
  });


  await client.close(); // Close the database connection after all tests in this file
});

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
  console.log(`Trace: Follow action successful.`)

  // 2. The user (Alice) can access (via _getFollowedItems) the item.
  console.log(`Trace: User ${userAlice} checks their followed items.`);
  followedItems = await concept._getFollowedItems({ user: userAlice });
  assertArrayIncludes(followedItems, [itemPost3]);
  assertEquals(followedItems.length, 1);
  console.log(`Trace: Followed items: ${followedItems}`);

  // 3. The user (Alice) unfollows the item (Post3).
  console.log(`Trace: User ${userAlice} decides to unfollow item ${itemPost3}.`);
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
```

# problem: these need to be separate deno tests.
use this fixed implementation: 
[@fix.9bcc5318](../../../context/design/concepts/Following/implementation.md/steps/fix.9bcc5318.md)


# response:

You're absolutely right! Each logical test scenario should ideally be its own `Deno.test` block for better isolation, clarity, and more granular reporting.

Here's the refactored test file where each step from the previous "purpose" test, and each of the new "interesting situations" are now individual `Deno.test` blocks. This ensures that the database is fresh for every single test case.

# file: src/Following/FollowingConcept.test.ts

```typescript
import { assertEquals, assertNotEquals, assertArrayIncludes } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID, Empty } from "@utils/types.ts";
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
  assertEquals((result as { error: string }).error, `User ${userAlice} is already following item ${itemPost1}`);
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
  assertEquals((result as { error: string }).error, `User ${userAlice} is not following item ${itemPost1}`);
  const followedItems = await concept._getFollowedItems({ user: userAlice });
  assertEquals(followedItems.length, 1); // Count should not change

  await client.close();
});

Deno.test("FollowingConcept: unfollow - prevents unfollowing for a non-existent user (requires check)", async () => {
  const [db, client] = await testDb();
  const concept = new FollowingConcept(db);

  const result = await concept.unfollow({ user: nonExistentUser, item: itemPost1 });
  assertNotEquals(result, {}, "Expected an error object");
  assertEquals((result as { error: string }).error, `User ${nonExistentUser} is not following item ${itemPost1}`);

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

  const followedItems = await concept._getFollowedItems({ user: nonExistentUser });
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
  const result = await concept.unfollow({ user: userAlice, item: nonExistentItem });
  assertNotEquals(result, {}); // Expected an error
  assertEquals((result as { error: string }).error, `User ${userAlice} is not following item ${nonExistentItem}`);

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
  console.log(`Trace: Follow action successful.`)

  // 2. The user (Alice) can access (via _getFollowedItems) the item.
  console.log(`Trace: User ${userAlice} checks their followed items.`);
  followedItems = await concept._getFollowedItems({ user: userAlice });
  assertArrayIncludes(followedItems, [itemPost3]);
  assertEquals(followedItems.length, 1);
  console.log(`Trace: Followed items: ${followedItems}`);

  // 3. The user (Alice) unfollows the item (Post3).
  console.log(`Trace: User ${userAlice} decides to unfollow item ${itemPost3}.`);
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
```