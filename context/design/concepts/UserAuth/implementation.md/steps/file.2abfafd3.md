---
timestamp: 'Mon Oct 20 2025 17:08:46 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251020_170846.7c257666.md]]'
content_id: 2abfafd396ccbad10d78ae8a477f70af2e11c7be32249d723590a3a38c036cd3
---

# file: deno.json

```json
{
    "imports": {
        "@concepts/": "./src/concepts/",
        "@google/generative-ai": "npm:@google/generative-ai@^0.24.1",
        "@utils/": "./src/utils/"
        
    },
    "tasks": {
        "concepts": "deno run --allow-net --allow-read --allow-sys --allow-env src/concept_server.ts --port 8000 --baseUrl /api"
    }
}
```
