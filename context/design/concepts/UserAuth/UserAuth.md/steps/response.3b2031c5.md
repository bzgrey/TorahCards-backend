---
timestamp: 'Mon Oct 20 2025 16:59:20 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251020_165920.7f848d3f.md]]'
content_id: 3b2031c5286ae960efe592b232a0d39587b15a2f9c6eff38f5d9e4c60e5090c0
---

# response:

Here is the concept specification for `UserAuth`:

***

**concept** UserAuth \[User]

**purpose** Authenticate users using a username and password, issuing a session token for subsequent access.

**principle** If a user registers with a username and password, then subsequently logs in with those same credentials, they will receive a unique session token which can be used to prove their authenticated status.

**state**
  a set of Users with
    a username String
    a password String
  a set of Tokens with
    a value String
    a user User

**actions**

  register (username: String, password: String): (user: User, token: String)
    **requires** for all `u` in `Users`, `username(u) != username`
    **effects**
        `new_user` is created and added to `Users`
        `username(new_user) := username`
        `password(new_user) := password`
        `new_token_value` is a unique String
        `new_token` is created and added to `Tokens`
        `value(new_token) := new_token_value`
        `user(new_token) := new_user`
        returns `(user: new_user, token: new_token_value)`

  register (username: String, password: String): (error: String)
    **requires** exists `u` in `Users` such that `username(u) == username`
    **effects** returns `(error: "Username already taken")`

  login (username: String, password: String): (token: String)
    **requires** exists `u` in `Users` such that `username(u) == username` AND `password(u) == password`
    **effects**
        `matching_user` is the User `u`
        `new_token_value` is a unique String
        `new_token` is created and added to `Tokens`
        `value(new_token) := new_token_value`
        `user(new_token) := matching_user`
        returns `(token: new_token_value)`

  login (username: String, password: String): (error: String)
    **requires** NOT (exists `u` in `Users` such that `username(u) == username` AND `password(u) == password`)
    **effects** returns `(error: "Invalid credentials")`

  logout (token: String)
    **requires** exists `t` in `Tokens` such that `value(t) == token`
    **effects** the Token `t` is removed from `Tokens`

  logout (token: String): (error: String)
    **requires** NOT (exists `t` in `Tokens` such that `value(t) == token`)
    **effects** returns `(error: "Invalid token")`

**queries**

  \_getUsername (user: User) : (username: String)
    **requires** `user` exists in `Users`
    **effects** returns `username` of `user`

  \_getUsername (user: User) : (error: String)
    **requires** `user` does not exist in `Users`
    **effects** returns `(error: "User not found")`

  \_getPassword (user: User) : (password: String)
    **requires** `user` exists in `Users`
    **effects** returns `password` of `user`

  \_getPassword (user: User) : (error: String)
    **requires** `user` does not exist in `Users`
    **effects** returns `(error: "User not found")`

  \_getAuthenticatedUser (token: String) : (user: User)
    **requires** exists `t` in `Tokens` such that `value(t) == token`
    **effects** returns `user(t)`

  \_getAuthenticatedUser (token: String) : (error: String)
    **requires** NOT (exists `t` in `Tokens` such that `value(t) == token`)
    **effects** returns `(error: "Invalid or expired token")`
