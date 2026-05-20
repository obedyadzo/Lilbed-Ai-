# Lilbed AI Security Specification

## 1. Data Invariants
- **Scope Isolation**: A user must never be able to read or write research projects belonging to another user.
- **Strict Relationship Integrity**: Every research project document MUST contain a `userId` field matching the `uid` of the authenticated creator.
- **PII Isolation**: The `users` collection contains private emails and data. No blanket `isSignedIn()` read is allowed; users can read and write only their own user document.
- **Immutability Protection**: Once a research project is initiated, its `userId` and `id` must be immutable.
- **Resource Poisoning Prevention**: Document ID path parameters and fields must be size-constrained, with strict types.

## 2. The "Dirty Dozen" Malicious Payloads
Here are 12 malicious payload profiles designed to break validation, leak data, or escalate privileges:

| Target Collection | Operation | Malicious Action / Payload | Expected Security Result |
|---|---|---|---|
| `users` | `get` (Adversary) | Requesting `/users/other-user-uid` as a standard user | `PERMISSION_DENIED` |
| `projects` | `get` (Adversary) | Requesting `/projects/other-user-project-id` as a standard user | `PERMISSION_DENIED` |
| `projects` | `list` (Adversary)| Querying `/projects` without filter (`where("userId", "==", myUid)`) | `PERMISSION_DENIED` |
| `users` | `create` (Identity)| Creating user profile with a different UID: `{ uid: "different-uid", email: "attack@victim.com" }` | `PERMISSION_DENIED` |
| `projects` | `create` (Hijack)| Submitting project owned by alternate user: `{ userId: "victim-uid", topic: "Stolen Info" }` | `PERMISSION_DENIED` |
| `projects` | `update` (Hijack) | Altering the `userId` owner of an existing project in updates | `PERMISSION_DENIED` |
| `projects` | `create` (Poison) | Injecting 5MB string topic field into a project to exploit storage quotas | `PERMISSION_DENIED` |
| `projects` | `create` (Malformation)| Submitting unsupported depth options: `{ depth: "ultra-quantum-extreme" }` | `PERMISSION_DENIED` |
| `projects` | `update` (Field Inject)| Injecting unauthorized helper fields: `{ isVerifiedByPlatform: true, pointsCount: 99999 }` | `PERMISSION_DENIED` |
| `users` | `update` (Email Spoof)| Standard user attempting to modify another user's email payload | `PERMISSION_DENIED` |
| `projects` | `delete` (Wipe) | Deleting another user's research project | `PERMISSION_DENIED` |
| `/` | `write` (Catch-All) | Attempting to write a root configurations file or sub collection index | `PERMISSION_DENIED` |

## 3. Secure Firestore Rules Architecture (`firestore.rules`)
The Firebase Ruleset must enforce:
1. Master Gate Auth mapping
2. Identity constraints on key owners
3. Type validation using robust validation functions
4. Size validations against Denial of Wallet attacks
