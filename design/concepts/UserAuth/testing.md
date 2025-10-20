[@implementation](implementation.md)

[@testing-concepts](../../background/testing-concepts.md)

# test: UserAuth
- Only give a test for the operational principle and 3-5 additional tests for interesting scenarios. 
- Don't worry about testing for error messages


# response:

```typescript
// file: src/UserAuth/UserAuthConcept.test.ts
import { assertEquals } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import UserAuthConcept from "./UserAuthConcept.ts";
import { ID } from "@utils/types.ts";

Deno.test("UserAuth Concept Tests", async (test) => {
  const [db, client] = await testDb();
  const userAuth = new UserAuthConcept(db);

  await test.step("testPrinciple: User registration, login, and authentication", async () => {
    console.log("--- Trace: Operational Principle ---");

    // Action 1: Register Alice
    console.log("Attempting to register user 'alice'...");
    const registerResult = await userAuth.register({
      username: "alice",
      password: "password123",
    });

    // Verify registration was successful and returned user ID and token
    assertEquals(typeof registerResult, "object");
    assertEquals("user" in registerResult, true);
    assertEquals("token" in registerResult, true);
    const aliceId = (registerResult as { user: ID; token: string }).user;
    const aliceRegisterToken = (registerResult as { user: ID; token: string }).token;
    console.log(`User 'alice' registered successfully with ID: ${aliceId}, token: ${aliceRegisterToken}`);

    // Action 2: Login Alice
    console.log("Attempting to log in user 'alice'...");
    const loginResult = await userAuth.login({
      username: "alice",
      password: "password123",
    });

    // Verify login was successful and returned a new token
    assertEquals(typeof loginResult, "object");
    assertEquals("token" in loginResult, true);
    const aliceLoginToken = (loginResult as { token: string }).token;
    console.log(`User 'alice' logged in successfully with new token: ${aliceLoginToken}`);
    assertEquals(aliceRegisterToken !== aliceLoginToken, true, "New token should be issued on login");


    // Query 1: Authenticate user with the new login token
    console.log("Attempting to get authenticated user for the new login token...");
    const authenticatedUserResult = await userAuth._getAuthenticatedUser({ token: aliceLoginToken });

    // Verify the authenticated user matches Alice's ID
    assertEquals(typeof authenticatedUserResult, "object");
    assertEquals(Array.isArray(authenticatedUserResult), true);
    assertEquals((authenticatedUserResult as { user: ID }[]).length, 1);
    assertEquals((authenticatedUserResult as { user: ID }[])[0].user, aliceId);
    console.log(`Authenticated user for token '${aliceLoginToken}' is: ${authenticatedUserResult[0].user}`);

    console.log("Operational principle successfully demonstrated: Register -> Login -> Authenticate with new token.");
    console.log("--- End of Trace ---");
  });

  await test.step("Scenario 1: register - Username uniqueness", async () => {
    console.log("--- Trace: Registering with existing username ---");

    // Register Bob for the first time
    console.log("Registering user 'bob' for the first time...");
    const bobRegisterResult1 = await userAuth.register({ username: "bob", password: "bob_pass" });
    assertEquals("user" in bobRegisterResult1, true);
    console.log(`User 'bob' registered successfully.`);

    // Attempt to register Bob again with the same username
    console.log("Attempting to register user 'bob' again with the same username...");
    const bobRegisterResult2 = await userAuth.register({ username: "bob", password: "another_pass" });

    // Expect an error because the username already exists
    assertEquals("error" in bobRegisterResult2, true);
    console.log(`Attempt to register 'bob' again failed as expected: ${(bobRegisterResult2 as { error: string }).error}`);

    console.log("--- End of Trace ---");
  });

  await test.step("Scenario 2: login - Invalid credentials", async () => {
    console.log("--- Trace: Login with invalid credentials ---");

    // Register Carol
    console.log("Registering user 'carol'...");
    await userAuth.register({ username: "carol", password: "carol_pass" });
    console.log("User 'carol' registered.");

    // Attempt to login Carol with wrong password
    console.log("Attempting to log in 'carol' with wrong password...");
    const carolLoginWrongPass = await userAuth.login({ username: "carol", password: "wrong_pass" });
    assertEquals("error" in carolLoginWrongPass, true);
    console.log(`Login attempt for 'carol' with wrong password failed as expected: ${(carolLoginWrongPass as { error: string }).error}`);

    // Attempt to login a non-existent user
    console.log("Attempting to log in non-existent user 'dave'...");
    const daveLoginResult = await userAuth.login({ username: "dave", password: "dave_pass" });
    assertEquals("error" in daveLoginResult, true);
    console.log(`Login attempt for 'dave' failed as expected: ${(daveLoginResult as { error: string }).error}`);

    console.log("--- End of Trace ---");
  });

  await test.step("Scenario 3: logout - Token invalidation", async () => {
    console.log("--- Trace: Logout and token invalidation ---");

    // Register Eve and get a token
    console.log("Registering user 'eve'...");
    const eveRegisterResult = await userAuth.register({ username: "eve", password: "eve_pass" });
    const eveToken = (eveRegisterResult as { user: ID; token: string }).token;
    console.log(`User 'eve' registered with token: ${eveToken}`);

    // Logout using Eve's token
    console.log(`Attempting to log out user 'eve' with token: ${eveToken}`);
    const logoutResult = await userAuth.logout({ token: eveToken });
    assertEquals("success" in logoutResult, true);
    assertEquals((logoutResult as { success: boolean }).success, true);
    console.log(`Logout successful for token: ${eveToken}`);

    // Attempt to authenticate using the invalidated token
    console.log(`Attempting to authenticate with invalidated token: ${eveToken}`);
    const authWithInvalidToken = await userAuth._getAuthenticatedUser({ token: eveToken });
    assertEquals("error" in authWithInvalidToken, true);
    console.log(`Authentication with invalidated token failed as expected: ${(authWithInvalidToken as { error: string }).error}`);

    console.log("--- End of Trace ---");
  });

  await test.step("Scenario 4: Query _getUsername and _getPassword", async () => {
    console.log("--- Trace: Querying user details ---");

    // Register Frank and Grace
    console.log("Registering user 'frank'...");
    const frankRegisterResult = await userAuth.register({ username: "frank", password: "frank_pass" });
    const frankId = (frankRegisterResult as { user: ID; token: string }).user;
    console.log(`User 'frank' registered with ID: ${frankId}`);

    console.log("Registering user 'grace'...");
    const graceRegisterResult = await userAuth.register({ username: "grace", password: "grace_pass" });
    const graceId = (graceRegisterResult as { user: ID; token: string }).user;
    console.log(`User 'grace' registered with ID: ${graceId}`);

    // Query Frank's username
    console.log(`Querying username for user ID: ${frankId}`);
    const frankUsernameResult = await userAuth._getUsername({ users: [frankId] });
    assertEquals(Array.isArray(frankUsernameResult), true);
    assertEquals((frankUsernameResult as { username: string }[]).length, 1);
    assertEquals((frankUsernameResult as { username: string }[])[0].username, "frank");
    console.log(`Frank's username: ${frankUsernameResult[0].username}`);

    // Query Frank's password
    console.log(`Querying password for user ID: ${frankId}`);
    const frankPasswordResult = await userAuth._getPassword({ user: frankId });
    assertEquals(Array.isArray(frankPasswordResult), true);
    assertEquals((frankPasswordResult as { password: string }[]).length, 1);
    assertEquals((frankPasswordResult as { password: string }[])[0].password, "frank_pass");
    console.log(`Frank's password: ${frankPasswordResult[0].password}`);

    // Query multiple usernames
    console.log(`Querying usernames for user IDs: ${frankId}, ${graceId}`);
    const multipleUsernamesResult = await userAuth._getUsername({ users: [frankId, graceId] });
    assertEquals(Array.isArray(multipleUsernamesResult), true);
    assertEquals((multipleUsernamesResult as { username: string }[]).length, 2);
    // Sort results to ensure consistent order for assertion
    const sortedUsernames = (multipleUsernamesResult as { username: string }[]).sort((a, b) =>
      a.username.localeCompare(b.username)
    );
    assertEquals(sortedUsernames[0].username, "frank");
    assertEquals(sortedUsernames[1].username, "grace");
    console.log(`Usernames found: ${sortedUsernames.map(u => u.username).join(", ")}`);

    // Query non-existent user's username
    const nonExistentId = "nonExistent" as ID;
    console.log(`Querying username for non-existent user ID: ${nonExistentId}`);
    const nonExistentUsernameResult = await userAuth._getUsername({ users: [nonExistentId] });
    assertEquals("error" in nonExistentUsernameResult, true);
    console.log(`Query for non-existent user failed as expected: ${(nonExistentUsernameResult as { error: string }).error}`);

    console.log("--- End of Trace ---");
  });

  await client.close();
});
```