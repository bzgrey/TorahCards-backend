import { Collection, Db } from "npm:mongodb";
import { ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Declare collection prefix, use concept name
const PREFIX = "UserAuth" + ".";

// Generic type parameter
type User = ID;
// The 'Token' in the state refers to the value of the token, which itself serves as an ID.
type Token = ID;

/**
 * Interface representing a User document in the 'users' collection.
 * Corresponds to 'a set of Users with a username String, a password String' in the concept state.
 */
interface UserDoc {
  _id: User; // The unique identifier for the user
  username: string; // The user's chosen username
  password: string; // The user's password (in a real app, this would be hashed)
}

/**
 * Interface representing a Token document in the 'tokens' collection.
 * Corresponds to 'a set of Tokens with a value String, a user User' in the concept state.
 */
interface TokenDoc {
  _id: Token; // The unique token value, also serving as its primary key
  value: string; // The token string itself (redundant with _id but explicit)
  user: User; // The ID of the user associated with this token
}

/**
 * Implementation of the UserAuth concept.
 * Provides functionality for user registration, login, logout,
 * and queries for user authentication details.
 */
export default class UserAuthConcept {
  // MongoDB collection for user credentials
  private users: Collection<UserDoc>;
  // MongoDB collection for active session tokens
  private tokens: Collection<TokenDoc>;

  /**
   * Constructs a new UserAuthConcept instance.
   * Initializes connections to the 'users' and 'tokens' MongoDB collections.
   * @param db The MongoDB database instance to use.
   */
  constructor(private readonly db: Db) {
    this.users = this.db.collection(PREFIX + "users");
    this.tokens = this.db.collection(PREFIX + "tokens");
  }

  /**
   * register (username: String, password: String): (user: User, token: String)
   *
   * **requires** no Label with the given `name` already exists
   *
   * **effects**
   *   `new_user` is created and added to `Users`
   *   `username(new_user) := username`
   *   `password(new_user) := password`
   *   `new_token_value` is a unique String
   *   `new_token` is created and added to `Tokens`
   *   `value(new_token) := new_token_value`
   *   `user(new_token) := new_user`
   *   returns `(user: new_user, token: new_token_value)`
   *
   * Creates a new user account with the given username and password,
   * and issues an initial session token.
   * Returns the new user's ID and the issued token, or an error if the username exists.
   */
  async register(
    { username, password }: { username: string; password: string },
  ): Promise<{ user: User; token: string } | { error: string }> {
    // Check precondition: username doesn't exist
    const existingUser = await this.users.findOne({ username });
    if (existingUser) {
      return { error: "Username already exists" };
    }

    // Effect: Create new user
    const newUser: User = freshID(); // Generate a fresh ID for the new user
    const newUserDoc: UserDoc = {
      _id: newUser,
      username,
      password, // IMPORTANT: In a production application, passwords MUST be hashed.
    };
    await this.users.insertOne(newUserDoc);

    // Effect: Create new token for the registered user
    const newTokenValue: Token = freshID(); // Generate a fresh ID for the new token
    const newTokenDoc: TokenDoc = {
      _id: newTokenValue, // Token value serves as the document ID
      value: newTokenValue,
      user: newUser,
    };
    await this.tokens.insertOne(newTokenDoc);

    // Return results
    return { user: newUser, token: newTokenValue };
  }

  /**
   * login (username: String, password: String): (token: String)
   *
   * **requires** exists `u` in `Users` such that `username(u) == username` AND `password(u) == password`
   *
   * **effects**
   *   `matching_user` is the User `u`
   *   `new_token_value` is a unique String
   *   `new_token` is created and added to `Tokens`
   *   `value(new_token) := new_token_value`
   *   `user(new_token) := matching_user`
   *   returns `(token: new_token_value)`
   *
   * Authenticates a user with the provided username and password,
   * and issues a new session token upon successful login.
   * Returns the new token, or an error if credentials are invalid.
   */
  async login(
    { username, password }: { username: string; password: string },
  ): Promise<{ token: string } | { error: string }> {
    // Check precondition: username and password match an existing user
    const matchingUserDoc = await this.users.findOne({ username, password });
    if (!matchingUserDoc) {
      return { error: "Invalid username or password" };
    }

    const matchingUser: User = matchingUserDoc._id;

    // Effect: Create new token for the logged-in user
    const newTokenValue: Token = freshID();
    const newTokenDoc: TokenDoc = {
      _id: newTokenValue,
      value: newTokenValue,
      user: matchingUser,
    };
    await this.tokens.insertOne(newTokenDoc);

    // Return results
    return { token: newTokenValue };
  }

  /**
   * logout (token: Token): (success: Boolean)
   *
   * **requires** exists `t` in `Tokens` such that `value(t) == token`
   *
   * **effects** the Token `t` is removed from `Tokens`
   *
   * Invalidates and removes an existing session token.
   * Returns a success indicator, or an error if the token is not found.
   */
  async logout(
    { token }: { token: Token },
  ): Promise<{ success: boolean } | { error: string }> {
    // Check precondition and effect: remove the token
    const result = await this.tokens.deleteOne({ _id: token }); // Tokens are identified by their value (_id)
    if (result.deletedCount === 0) {
      return { error: "Token not found or already invalidated" };
    }
    // Return a non-empty dictionary for success as per guidelines
    return { success: true };
  }

  /**
   * _getUsername (users: User[]): (username: String)[]
   *
   * **requires** each `User` in `users` exists in the set of `Users`
   *
   * **effects** returns an array of dictionaries, each containing the `username` of the corresponding `User`
   *
   * Retrieves the usernames for a given array of user IDs.
   * Returns an array of username dictionaries, or an error if any user ID is not found.
   */
  async _getUsername(
    { users: userIds }: { users: User[] },
  ): Promise<{ username: string }[] | { error: string }> {
    // Find all users corresponding to the provided IDs
    const foundUsers = await this.users.find({ _id: { $in: userIds } })
      .toArray();

    // Check if all requested user IDs were found
    if (foundUsers.length !== userIds.length) {
      const foundIds = new Set(foundUsers.map((u) => u._id));
      const missingIds = userIds.filter((id) => !foundIds.has(id));
      return { error: `One or more users not found: ${missingIds.join(", ")}` };
    }

    // Return an array of dictionaries, each with a username
    return foundUsers.map((userDoc) => ({ username: userDoc.username }));
  }

  /**
   * _getPassword (user: User) : (password: String)[]
   *
   * **requires** `user` exists in set of `Users`
   *
   * **effects** returns an array of dictionaries, each containing the `password` of the `user`
   *
   * Retrieves the password for a specific user ID.
   * Returns an array with a single password dictionary, or an error if the user is not found.
   */
  async _getPassword(
    { user: userId }: { user: User },
  ): Promise<{ password: string }[] | { error: string }> {
    const userDoc = await this.users.findOne({ _id: userId });
    if (!userDoc) {
      return { error: "User not found" };
    }
    // Return an array with a single dictionary, as per query guidelines
    return [{ password: userDoc.password }];
  }

  /**
   * _getAuthenticatedUser (token: Token) : (user: User)[]
   *
   * **requires** exists `t` in `Tokens` such that `value(t) == token`
   *
   * **effects** returns an array of dictionaries, each containing the `user` ID associated with the token
   *
   * Retrieves the user ID associated with a given session token.
   * Returns an array with a single user ID dictionary.
   */
  async _getAuthenticatedUser(
    { token }: { token: Token },
  ): Promise<{ user: User }[]> {
    // Find the token document using its value (which is also its _id)
    const tokenDoc = await this.tokens.findOne({ _id: token });
    if (!tokenDoc) {
      return []; // Return an empty array if token not found, as per guidelines
    }
    // Return an array with a single dictionary, as per query guidelines
    return [{ user: tokenDoc.user }];
  }
}
