# Engineering Principles — evolution and rollout record

This document preserves the reasoning that produced `codingprinciples.md` v5.1. It is history and evidence, not a competing source of truth. The canonical current standard is the root `codingprinciples.md`.

## Version rankings

These scores are editorial assessments of the documents on paper. A standard cannot honestly earn a perfect score until it has been exercised against real repositories and real coding agents.

| Version | Score | Why |
|---|---:|---|
| Original 26-point list | 74/100 | Strong real-world instincts from actual incidents, but duplicated rules, project-specific items mixed with universal principles, no precedence order, and no guidance for conflicts. |
| v2 | 84/100 | Better structure, evidence rules and right-sizing, but damaging absolutes such as “delete more than you add” / blanket test requirements and stack-specific leakage. |
| v3 | 90/100 | Added genuinely missing ideas: recovery rather than backup, contract testing, concurrency/time/randomness, CI gates, dependency cost, derived-state nuance and decision records. |
| v4 | 93/100 | Best wording discipline and tiering at that point, but introduced new absolutes and some incorrect universal assumptions. |
| v5 | 95/100 | Strongest complete version before the final patch: MUST/SHOULD/MAY, truthful CI language, performance measurement, safer logging guidance and stack-agnostic conventions. |
| **v5.1** | **97/100 on paper** | Resolves the remaining structural gaps: tier composition, explicit agent blocker behaviour, canonical-repository ownership and stronger SHOULD semantics. The remaining points must be earned through real use. |

## Important corrections made along the way

### v2 problems fixed later
- “Delete more than you add” was too literal. The actual goal is lower conceptual load without destroying useful structure.
- “Full test coverage, no exceptions” was too blunt. Test effort should follow consequence and risk.
- Zod, React and Dexie are useful stack choices, not universal engineering laws.
- Backup creation and recovery are different: a backup that has never restored representative data is unverified.

### v3 additions retained
- conflict priority order
- canonical vs derived state
- recovery rather than “backup exists”
- CI as a gate
- dependency cost
- time/randomness/concurrency as dependencies
- contract testing
- decision records

### v4 problems fixed in v5
- “If a rule has no named exception, it has no exception” was replaced with MUST / SHOULD / MAY.
- “Green CI is the shared definition of it works” contradicted runtime-verification rules. Green CI is necessary evidence where required, not proof of runtime behaviour.
- blanket ceilings on every loop/recursion were narrowed to work that can grow unpredictably.
- blanket bans on logging identifiers were narrowed: secrets/sensitive payloads stay out; necessary diagnostic identifiers should be minimised/scoped/pseudonymised.
- “phone held one-handed” moved out of the universal law and into repository-specific supported-environment requirements.
- “React + Vercel → next build” was removed as a universal assumption. The standard names the principle; each repository names its actual tool.
- explicit “measure before optimising” was added.
- version governance was added so individual repos do not silently fork the standard.

## v5.1 patch — why it exists

Three gaps remained after v5.

### 1. Assurance tiers and MUST/SHOULD/MAY had to compose

v5 defined MUST as “required for the repository's assurance tier” but did not map which sections were required at each tier. v5.1 adds a universal safety floor, Tier 1/2/3 applicability, and an LLM/agent overlay.

### 2. Agents needed a defined blocker protocol

When an agent cannot satisfy a MUST, does not understand the affected system, cannot establish a recovery path, cannot determine the canonical repo, or sees conflicting authoritative instructions, it must not guess. It stops the affected action, explains the blocker, preserves safe work, and continues only independent reversible work.

### 3. Every project needed one canonical repository

Parallel copies across GitHub accounts create a systemic source-of-truth problem. v5.1 requires one canonical repository per actively maintained project. Mirrors, backups, archives and deliberate forks need explicit roles. Deployments must be traceable back to the canonical repo and commit.

## JoshHub classification

As of 15 September 2026:

- **Canonical repository:** `joshualparris/JoshHub`
- **Assurance tier:** **Tier 2 — durable personal software**
- **Why:** JoshHub is actively used and stores persistent personal data in IndexedDB/Dexie. It is not merely a throwaway prototype.
- **Current universal standard:** `codingprinciples.md` v5.1
- **Repository-specific audit:** `docs/code-audit/` remains useful as JoshHub-specific conformance evidence. Its 18 numbered audit principles pre-date v5.1 and should be treated as a repository-specific mapping/checklist, not as a newer universal standard.

## Historical cross-repository rollout snapshot

On 12 September 2026, an attempted portfolio-wide rollout discovered **114 repositories reporting push/write access** across owned and collaborator accounts.

The session successfully committed `codingprinciples.md` to the first **34 owned repositories** before tool/runtime limits ended the pass. No attempted write in that completed subset was rejected. Empty repos and repos whose default branch was not `main` were also writable.

That figure is a **historical snapshot, not a current portfolio-compliance claim**. The remaining repositories were not verified in that session, and some early copies may contain slightly different v5.1 wording. A future portfolio audit should determine current coverage from GitHub rather than assuming `34/114` is still the present state.

## How future revisions earn a new version

Do not produce v6 because the wording can be polished again. Record actual failures such as:

> Agent X misunderstood rule Y in repository Z, resulting in behaviour Q.

Use those observed failures to justify changes. The standard should now evolve primarily from operational evidence rather than theoretical editing.
