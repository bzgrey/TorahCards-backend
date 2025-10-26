
[@concept-specifications](../../background/concept-specifications.md)

# UserAuth specs: create specs
create specs for a concept that allows logging in with a username and password, returns a token when logging in, and has queries for username and password of a given User ID
# response:

Here is the concept specification for `UserAuth`:

---

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
    **requires** username doesn't exist in the set of Users
    **effects**
        `new_user` is created and added to `Users`
        `username(new_user) := username`
        `password(new_user) := password`
        `new_token_value` is a unique String
        `new_token` is created and added to `Tokens`
        `value(new_token) := new_token_value`
        `user(new_token) := new_user`
        returns `(user: new_user, token: new_token_value)`

  login (username: String, password: String): (token: String)
    **requires** exists `u` in `Users` such that `username(u) == username` AND `password(u) == password`
    **effects**
        `matching_user` is the User `u`
        `new_token_value` is a unique String
        `new_token` is created and added to `Tokens`
        `value(new_token) := new_token_value`
        `user(new_token) := matching_user`
        returns `(token: new_token_value)`

  logout (token: String)
    **requires** exists `t` in `Tokens` such that `value(t) == token`
    **effects** the Token `t` is removed from `Tokens`

**queries**

  \_getUsername (users: User\[]) : (username: String)\[]
    **requires** `users` exists in set of `Users`
    **effects** returns array of `usernames` of `users`

  \_getPassword (user: User) : (password: String)\[]
    **requires** `user` exists in set of `Users`
    **effects** returns array of `password` of `user`

  \_getAuthenticatedUser (token: String) : (user: User)\[]
    **requires** exists `t` in `Tokens` such that `value(t) == token`
    **effects** returns array of `user(t)`
    