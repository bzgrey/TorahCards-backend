
[@api-extraction-from-spec](../../tools/api-extraction-from-spec.md)

[@UserAuth](UserAuth.md)

# api: UserAuth

# response:

# API Specification: UserAuth Concept

**Purpose:** Authenticate users using a username and password, issuing a session token for subsequent access.

---

## API Endpoints

### POST /api/UserAuth/register

**Description:** Registers a new user with a unique username and password, then issues a session token for that new user.

**Requirements:**
- username doesn't exist in the set of Users

**Effects:**
- `new_user` is created and added to `Users`
- `username(new_user) := username`
- `password(new_user) := password`
- `new_token_value` is a unique String
- `new_token` is created and added to `Tokens`
- `value(new_token) := new_token_value`
- `user(new_token) := new_user`
- returns `(user: new_user, token: new_token_value)`

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response Body (Action):**
```json
{
  "user": "string",
  "token": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/UserAuth/login

**Description:** Authenticates an existing user with their username and password, then issues a new session token.

**Requirements:**
- exists `u` in `Users` such that `username(u) == username` AND `password(u) == password`

**Effects:**
- `matching_user` is the User `u`
- `new_token_value` is a unique String
- `new_token` is created and added to `Tokens`
- `value(new_token) := new_token_value`
- `user(new_token) := matching_user`
- returns `(token: new_token_value)`

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response Body (Action):**
```json
{
  "token": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/UserAuth/logout

**Description:** Invalidates an active session token, effectively logging the associated user out.

**Requirements:**
- exists `t` in `Tokens` such that `value(t) == token`

**Effects:**
- the Token `t` is removed from `Tokens`

**Request Body:**
```json
{
  "token": "string"
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
---

### POST /api/UserAuth/_getUsername

**Description:** Retrieves the usernames for a given array of User IDs.

**Requirements:**
- `users` exists in set of `Users`

**Effects:**
- returns array of `usernames` of `users`

**Request Body:**
```json
{
  "users": ["string"]
}
```

**Success Response Body (Query):**
```json
[
  {
    "username": "string"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/UserAuth/_getPassword

**Description:** Retrieves the password for a given User ID.

**Requirements:**
- `user` exists in set of `Users`

**Effects:**
- returns array of `password` of `user`

**Request Body:**
```json
{
  "user": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "password": "string"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/UserAuth/\_getAuthenticatedUser

**Description:** Retrieves the User ID associated with a valid session token.

**Requirements:**
- exists `t` in `Tokens` such that `value(t) == token`

**Effects:**
- returns array of `user(t)`

**Request Body:**
```json
{
  "token": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "user": "string"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---