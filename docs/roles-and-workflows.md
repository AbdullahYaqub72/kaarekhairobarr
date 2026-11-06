# Roles, permissions & workflows

This is the source of truth for how KKB works inside the members app: who has which role, how people join, and how work moves from team leads to members. Any feature that touches sign-in, roles, approvals or tasks must follow it. If the real-world process changes, update this file first.

**Decisions so far**
- Members can belong to **more than one team**.
- Sign-in uses **Google or email/password** (Firebase Auth).
- Once approved, items are visible to **all active members** by default.
- **Phase 1** is users and teams only: joining, the NDA, approvals, roles and positions, and leaving. Items, including events and donation drives, come after that (see §6).
- **Members leave by request,** and an admin approves the request (see §3).
- **The NDA text** lives in [`docs/nda.md`](nda.md).

---

## 1. Roles

Permissions combine two independent things. A person has **one org role** plus a **position in each team** they belong to. That way someone can lead Tech and still be a regular member of Design.

### Org role (one per person)
| Role | Who | Can do |
|---|---|---|
| `admin` | The two founders | Everything: create invite codes, approve or reject members, appoint leads, approve items, suspend people, edit any data |
| `member` | Everyone else | Whatever their team positions allow |

### Team position (per team, per person)
| Position | Limit per team | Can do in that team |
|---|---|---|
| `lead` | 1 | Create and edit the team's items and submit them for approval; accept volunteers; mark items complete; see the team roster |
| `co-lead` | 1 | Same as the lead. The lead is the accountable owner |
| `member` | Unlimited | Belongs to the team roster |

- When we say **"lead"** we mean anyone who is a lead or co-lead of at least one team.
- **Only admins appoint or remove leads and co-leads.** Appointing a new lead moves the previous lead back to `member`.

---

## 2. Account status

Status is separate from role. It answers the question "can this person use the app yet?"

```
invited → registered → pending_approval → active
                                  ↘ rejected          active ⇄ suspended
                                                       active → (leave request approved) → alumni
```

| Status | Meaning | What they see |
|---|---|---|
| `registered` | Has an account but hasn't signed the NDA | Only the NDA screen |
| `pending_approval` | NDA signed, waiting for an admin | Only a "waiting for approval" screen |
| `active` | Approved | Everything their role and positions allow |
| `rejected` | An admin declined them, with a reason | The reason. They need a new invite code to try again |
| `suspended` | Access blocked temporarily by an admin | A "suspended" notice. An admin can restore them |
| `alumni` | Has left the organisation: their leave request was approved, or an admin removed them | No access. Their history is kept |

A pending leave request is not a status; the member stays `active` until an admin approves it (see §3).

---

## 3. Joining flow

1. **The admin creates an invite code.**
   - It's single-use and expires after 7 days.
   - It can be labelled with who it's for (name or phone) and with suggested teams.
   - The app shows a short code and a join link, ready to paste into WhatsApp.
2. **The person opens `/join`** and enters the code, or opens the link. The code is checked before anything else is shown.
3. **They sign up** with Google or email/password, then fill in a short profile:
   - Full name and WhatsApp number.
   - University, department and batch (optional).
   - The teams they'd like to join, and their skills.

   The code is now used up, and their status becomes `registered`.
4. **They sign the NDA** ([`docs/nda.md`](nda.md)).
   - They read the current NDA version and tick "I have read and agree".
   - They type their full name as their signature.
   - The app stores the NDA version, the typed name, the time and device info. Their status becomes `pending_approval`.
5. **An admin reviews them.**
   - **Approve:** the admin confirms or adjusts their teams, and the person becomes `active`.
   - **Reject:** the admin gives a reason.
6. **Later, an admin can appoint them lead or co-lead** of a team.

**NDA updates:** when a new NDA version is published, every active member has to sign it on their next login before they can continue. Anyone who doesn't agree can request to leave instead.

### Leaving flow
1. **The member requests to leave** from their profile, with an optional reason. Only one request can be open at a time.
2. **They stay `active`** while the request is pending, and can cancel it any time before an admin acts.
3. **An admin reviews the request** in the approval queue.
   - **Approve:**
     - The member becomes `alumni`.
     - They're removed from all team positions. If they were a lead or co-lead, that slot is left empty, and the admin is prompted to appoint a replacement.
     - They're taken off any open volunteer slots.
   - **Decline:** for example, to talk to them first. The admin gives a note, and the member stays `active` and can request again later.
4. **Admins can also remove someone directly,** for example someone who has stopped responding. They mark the person `alumni`, with a reason, and the same clean-up happens.
5. **The NDA keeps applying after they leave** (NDA §4).

---

## 4. Teams and item types

### Teams are data, not code
- Teams live in Firestore, and admins can add, rename or archive them. A new tech-related team, for example, can be added later without code changes.
- **The starting teams are Design, Donations, Events and Tech.**
- The app never checks for a team by name; it always reads the team's settings.

### Each team has its own item types
- An **item** is any piece of work a team publishes: a task, a donation drive, an event, and so on.
- **A team's lead and co-lead can create only their own team's item types.**
- Each type has its own extra fields on top of the common ones in §5.
- Every type follows the same approval workflow (§5).
- Each type sets its own visibility: **all active members** (the default) or **team only**, for internal work.

### Starting item types
These are proposed now and will be refined as each one is built.

| Team | Type | Extra fields |
|---|---|---|
| Donations | `donation_drive` (fundraising campaign) | Cause or beneficiary, target amount (PKR), amount collected so far, deadline, how to donate |
| Events | `event` | Date and time, venue or online link, volunteers needed per role (e.g. 3 × setup, 2 × registration), RSVP |
| Any team | `task` | Common fields only |

---

## 5. Item workflow

**Fields every item has:** team, type, title, description, due date, people needed (slots), priority (low / normal / urgent), location or online, created by.

```
draft ──submit──▶ pending_approval ──approve──▶ open ──lead starts──▶ in_progress ──lead marks done──▶ completed
                        │
                        ├──request changes──▶ draft (with admin note)
                        └──reject──▶ rejected (with reason)

Any state ──lead or admin cancels (with reason)──▶ cancelled
```

1. **A lead or co-lead creates** an item for their team. It starts as a `draft`.
2. **They submit it for approval.** It appears in the admins' approval queue.
3. **An admin approves it, asks for changes, or rejects it.**
   - Items created by an admin skip approval and open straight away.
   - If an approved item's description, due date or slots are edited, it goes back for approval.
4. **Open:** the item is shown to everyone allowed to see its type (§4).
   - Any active member can **volunteer**, with an optional note. For events, they also pick a role.
   - They can withdraw any time before they're accepted.
5. **The lead accepts volunteers** up to the number of slots.
   - Accepted members see the item under "My tasks".
   - The lead moves the item to `in_progress` once work starts.
6. **Each assignee marks their part done,** with an optional note or link. The lead then marks the item `completed`.
7. **Cancelling:** the lead or an admin can cancel an item at any point, with a reason.

---

## 6. Build order

**Phase 1: Users and teams.** It covers:
- Sign-in, joining with invite codes, the NDA, and member approval (§2–3).
- Leave requests and their approval (§3).
- The four starting teams; appointing leads and co-leads; team rosters (§1, §4).
- The admin screens for all of the above.

**Phase 2: Items.** It covers the item workflow (§5), starting with Events and Donations (`event`, `donation_drive`). The fields in §4 are placeholders, and will be finalised when phase 2 starts.

**Later phases:** item types for Design and Tech, and any new teams.

---

## 7. Who can do what

| Action | Admin | Lead / co-lead (own team) | Member | Registered / pending |
|---|---|---|---|---|
| Create invite codes | ✓ | – | – | – |
| Approve or reject members; suspend; mark as alumni | ✓ | – | – | – |
| Request to leave; cancel own request | – | ✓ | ✓ | – |
| Approve or decline leave requests | ✓ | – | – | – |
| Appoint or remove leads and co-leads | ✓ | – | – | – |
| Add, rename or archive teams and item types | ✓ | – | – | – |
| Create and edit items | ✓ (any team) | ✓ | – | – |
| Approve items | ✓ | – | – | – |
| See open items and volunteer | ✓ | ✓ | ✓ | – |
| Accept volunteers; mark items complete | ✓ | ✓ | – | – |
| See team roster | ✓ (all teams) | ✓ (own teams) | ✓ (own teams, names only) | – |
| See members' contact details | ✓ | ✓ (own teams) | – | – |
| Sign the NDA; see own status | ✓ | ✓ | ✓ | ✓ |

---

## 8. Screens

The public and member screens are mobile-first, following `CLAUDE.md`. The admin area is built for tablets and laptops.

- **Everyone:** join (`/join`), sign in, profile (including "Request to leave"), NDA, "waiting for approval".
- **Member:**
  - Home: my tasks, plus new open items.
  - Open items list → item detail → Volunteer.
  - My teams.
- **Lead:** everything a member sees, plus a team section:
  - The team's items, grouped by draft, pending, open and in progress.
  - Create an item.
  - Volunteers waiting to be accepted.
  - The team roster.
- **Admin:**
  - Approval queues for new members, leave requests and items.
  - Invite codes.
  - People: roles, positions and status.
  - Teams and their item types.
  - NDA versions.
- **Notifications:** in-app badges only, for approval queues and item updates. WhatsApp stays the chat channel. Email or push notifications can come later.

---

## 9. Data model (Firestore)

| Collection | Holds |
|---|---|
| `users/{uid}` | name, email, phone, `orgRole`, `status`, `teams` (e.g. `{ donations: 'lead', events: 'member' }`), skills, `ndaVersionSigned`, timestamps |
| `inviteCodes/{code}` | createdBy, label, suggestedTeams, expiresAt, usedBy, usedAt |
| `ndaSignatures/{uid}_v{version}` | typedName, signedAt, userAgent. The agreement text is versioned in code (`src/config/nda.ts`), not in Firestore |
| `leaveRequests/{id}` | uid, reason, status (`pending` / `approved` / `declined` / `cancelled`), reviewedBy, reviewNote, createdAt, reviewedAt |
| `teams/{teamId}` | name, active, leadUid, coLeadUid, `itemTypes` (allowed types and each type's visibility) |
| `items/{id}` | teamId, type, the common fields (§5), `details` (the type-specific fields from §4), status, reviewNote, assignees |
| `items/{id}/volunteers/{uid}` | note, role (for events), status (`pending` / `accepted` / `withdrawn`) |
| `auditLog/{id}` | Who did what and when: approvals, rejections, role and status changes |

---

## 10. Security

- **Sign-in is required everywhere** except the welcome screen, `/sign-in` and `/join`.
- **All data goes through the server.** The browser uses Firebase only to sign in. Every read and write goes through Next.js API routes, which:
  - verify the Firebase ID token;
  - load the caller's profile;
  - check status, role and team position against §7;
  - use the Firebase Admin SDK.
  The service-account key is a server-only environment variable. This avoids Cloud Functions and Firebase's paid plan.
- **Firestore security rules deny all browser access.** Since the browser never touches Firestore directly, this is the strongest possible rule, and permissions are enforced in exactly one place (`src/server/auth.ts` and each route).
- **Admins** have `orgRole: 'admin'` on their user record, which is what the server checks. A matching custom claim is also set. Both are granted by `scripts/bootstrap.mjs --admin <email>`.
- **State changes are atomic.** Approvals, team changes, appointing leads and leave approvals run in Firestore transactions and are written to `auditLog`.
- **Invite codes** are 8 characters from a 31-character alphabet (no 0/O, 1/I/L), single-use and expiring. Guessing one is impractical.

---

## 11. Open questions (not blocking)

- **NDA review:** the v1 draft in [`docs/nda.md`](nda.md) is a reasonable starting point. Have a lawyer review the wording before relying on it.
- **Event and donation drive fields:** to be finalised at the start of phase 2.
- **Public website:** what does it show (landing page, donation info, events)? It's separate from the members' app.
