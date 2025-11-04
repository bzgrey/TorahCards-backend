---
timestamp: 'Mon Nov 03 2025 17:43:46 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251103_174346.bffd4e1e.md]]'
content_id: 7793cf265a93243417bc619e26981363ada4aa41064dffb82b0b703d640e701b
---

# fix: authentication with token

Use the following example for how I wrote the request sync for addNotes with authentication using a token to d othe same thing for all of the other requests:

```typescript
export const AddNotesRequestAuth: Sync = (

{ request, user, token, name, content },

) => ({

when: actions([

Requesting.request,

{ path: "/Notes/addNotes", user, name, content, token },

{ request },

]),

where: async (frames) => {

console.log(frames);

frames = await frames.query(UserAuth._getAuthenticatedUser, { token }, {

user,

});

console.log(frames);

return frames;

},

then: actions([Notes.addNotes, { user, name, content }]),

});
```
