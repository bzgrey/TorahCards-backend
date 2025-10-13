---
timestamp: 'Mon Oct 13 2025 11:12:01 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251013_111201.1fdd7845.md]]'
content_id: 457457bb090ddf9065101d5dc5ef2affea05265969eb30dcdc5f32708ad1095e
---

# response:

The error `Property 'sort' does not exist on type 'ErrorResult | ID[]'` occurs because the query methods (`_getLabelItems`, `_getItemLabels`) can return either an array of `ID`s (or `Label`s) on success, or an `ErrorResult` object if something goes wrong. The `.sort()` method is only available on arrays, not on the `ErrorResult` object.

To fix this, we need to add type guards before calling `.sort()` or making assertions that assume the result is an array. This ensures that TypeScript (and the runtime) knows we're dealing with an array when we attempt to sort it.

I've introduced a small helper function `isErrorResult` to clearly distinguish between a successful data return and an error object. Then, before any operation on the array (like `sort()` or direct `assertEquals` for array content), I've added an `assert` check using this helper to confirm that the result is *not* an error. If it is an unexpected error, the test will fail explicitly.

Here is the updated test file:
