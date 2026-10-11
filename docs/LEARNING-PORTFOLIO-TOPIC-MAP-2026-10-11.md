# JoshHub learning portfolio: shared topic map and duplicate-resolution plan
Audit date: 11 October 2026. Authoritative within *each* programme remains its current repository. This document assigns **editorial ownership**, not GitHub control or real-world staff permissions. No merges or deletions have been performed.

## Portfolio totals and what they do NOT mean

| System | Content type | Source-reviewed count |
|---|---|---:|
| [AssetFlow Academy](https://dubbo-ewaste-app.vercel.app/learn) | Curriculum courses | 46 |
| [DCSPD](https://dcspd.vercel.app/) | Training modules | 44 |
| [SupportOps Career Lab](https://github.com/Parris-Tech-Services/DCSProfessionalDevelopment) | Modules incl. 74 generated Core 2 topics | 128 |
| **Structured entries in these three catalogues** | **Overlapping course/module entries; NOT unique subject count** | **218** |
| [AvancePD](https://github.com/Parris-Tech-Services/AvancePD) | Learning activities; tracked skills | 60; 47 |
| [AvanceProfessionalDevelopment](https://github.com/Parris-Tech-Services/AvanceProfessionalDevelopment) | Near-duplicate of AvancePD: activities; skills | 60; 47 |
| [JoshHub](https://josh-hub-96no.vercel.app/learn) | Real structured simulations; seeded browser learning topics | 2; 15 |
| [Research Atlas](https://research-atlas-phi.vercel.app/) | Linked research documents, not courses | 91 |
| UpskillApp | Pathway/training option entries, not courses | 9 |

It is **not valid** to add every row as a separate taught subject. Subject labels differ, topic nesting varies, multiple repos clone identical arrays and some entries are only resource lists. A precise deduplicated skill-objective count needs manual alignment of actual objectives and case coverage, not keyword matching.

## Sixteen overlapping topic families

| Family | Recommended canonical teaching home | Overlap to reconcile | Editorial separation |
|---|---|---|---|
| Laptop hardware, RAM, SSD & cloning | AssetFlow (repair field school + RAM/Storage explorers + imaging lab) | DCSPD A+ Core 1; SupportOps A+ Core 1; Avance endpoint triage; JoshHub Dead Laptop Detective | Use AssetFlow for reuse/refurb operations; JoshHub for simulation; others for service-desk scenarios. |
| Electrical safety & lithium batteries | AssetFlow | DCSPD safety; SupportOps electrical/ESD; Repair Café volunteer courses | AssetFlow owns site-specific stop-work lessons. Safety sign-off only by appropriate competent supervisors. |
| Data erasure, device locks & chain of custody | AssetFlow | DCSPD data destruction; SupportOps storage/decommission; Repair Café intake | AssetFlow owns process and evidence, not live access grants. |
| Repair economics & pricing | AssetFlow Repair Service Pricing | Avance billable-time/MSP modules; DCSPD MSP foundations | AssetFlow owns consumer repair quotes, Avance owns MSP billing/ticket discipline; don't conflate with resale pricing. |
| Networking, DNS, DHCP, Wi-Fi, VLANs | DCSPD / SupportOps for L1-L2; Avance for MSP transfer | JoshHub diagnostic games; AssetFlow laptop diagnostics | SupportOps owns theory and expert prompts; DCSPD owns school-context cases; Avance owns client MSP scenarios. |
| Windows and operating systems | SupportOps Core 2 | DCSPD; Avance; AssetFlow refurbishment | SupportOps owns Core 2 reference reading; expand generic checks into topic-specific diagnostics. |
| M365, Outlook, Teams, OneDrive & Entra | AvancePD MSP lessons | DCSPD M365 and identity; SupportOps DCS workflow cases | Avance owns Microsoft vendor study references; DCS apps own school-specific approved scenarios. |
| IT support communication, tickets & escalation | AvancePD / SupportOps | DCSPD; JoshHub personal customer-care topics | Use scored tickets, roleplay, hidden constraints and review rather than obvious MCQ answers. |
| Cybersecurity, incidents & user privacy | SupportOps / Avance | DCSPD; AssetFlow consent/data handling | Keep technical security triage distinct from citizen-consent and ITAD privacy workflows. |
| Repair Café setup, safety, volunteers & events | AssetFlow Repair Café programme | Circular Economy Dubbo research; JoshHub Repair Café Simulator | AssetFlow owns actual volunteer learning; JoshHub owns fictional coordinator simulator. |
| Library of Things lending, kits and maintenance | AssetFlow Library of Things programme | Circular Economy Dubbo feasibility and guidance; Research Atlas external reports | One operational playbook with reviewed kit/safety scenarios and clear UK-vs-NSW law boundary. |
| E-waste sourcing, circular economy and sustainability | AssetFlow / Circular Economy Dubbo | Research Atlas; JoshHub | AssetFlow owns volunteer practices; Circular Economy owns Dubbo research evidence; Research Atlas links original documents. |
| Outdoor education, ecology and environmental interpretation | DCSPD outdoor education modules | Research Atlas; JoshHub | Keep these in their specialist subject track instead of merging into generic MSP coursework. |
| Theology, faith and Christian formation | DCSPD Genesis course | JoshHub personal faith tracker; Research Atlas source documents | Distinguish researched academic modules from unsupervised personal reading lists. |
| AI, programming, data and scripting | SupportOps career modules | Avance external courses; Research Atlas; JoshHub personal topics | Use meaningful tested coding tasks and code-review artefacts, not only explanation prompts. |
| Personal development and training pathways | JoshHub topic tracker / UpskillApp / Research Atlas | SupportOps career planning; Avance roadmap | These are tracking and research tools, not separately assessed courses. |

## Single-source principle, without destructive repo consolidation

1. Preserve the original app-specific curriculum, module IDs and learner progress. Cross-link using stable topic IDs and ownership tags rather than deleting or moving modules.
2. Reuse original material through a cited source map where licences/permissions allow. Synchronise review criteria, not multiple copied stale lessons.
3. Use deep course teaching only where a subject has reviewed distinct worked cases; use basic modules as quick checks and navigation paths.
4. All published 'mastery' badges or readiness must require a fresh observed task and a human review of work; completion percentage must be labelled only as learning progress.
5. Align old copies carefully: `joshualparris/JoshHub` is the source for `josh-hub-96no`; another Vercel JoshHub project comes from `joshuaparrisdadlan-stack/JoshHub` and should not silently override the current one.
6. The two Avance repositories contain similar but non-identical scenario sets. Pick the actual deployed branch before determining which is canonical; do not remove either until work is reconciled.
7. Verify each external URL for current page topic, public accessibility and claims. Automated HTTPS format checking is not enough.
8. Release in order: conceptual errors and unsafe advice, invalid answer cues, deeply solved practical tasks, multimedia and accessibility, then learner usability testing. No fabricated professional endorsements.

## Source-level learning-quality registers

- [AssetFlow: 46-course register](https://github.com/joshualparris/DubboEwaste/blob/main/docs/ASSETFLOW-LMS-QUALITY-REGISTER-2026-10-11.md)
- [DCSPD: 44-module register](https://github.com/Parris-Tech-Services/DCSPD/blob/main/docs/DCSPD-MODULE-QUALITY-REGISTER-2026-10-11.md)
- [SupportOps: 128-module register](https://github.com/Parris-Tech-Services/DCSProfessionalDevelopment/blob/main/docs/SUPPORTOPS-MODULE-QUALITY-REGISTER-2026-10-11.md)
- [AvancePD: activity, skill and scenario register](https://github.com/Parris-Tech-Services/AvancePD/blob/main/docs/AVANCE-MSP-LEARNING-QUALITY-REGISTER-2026-10-11.md)
- [AvanceProfessionalDevelopment: activity, skill and scenario register](https://github.com/Parris-Tech-Services/AvanceProfessionalDevelopment/blob/main/docs/AVANCE-MSP-LEARNING-QUALITY-REGISTER-2026-10-11.md)
- [JoshHub Learning Lab: seed topics and simulation register](https://github.com/joshualparris/JoshHub/blob/main/docs/JOSHHUB-LEARNING-QUALITY-REGISTER-2026-10-11.md)
- [Research Atlas: all 91 document-resource entries](https://github.com/Parris-Tech-Services/ResearchAtlas/blob/main/docs/RESEARCH-ATLAS-RESOURCE-QUALITY-REGISTER-2026-10-11.md)
- [UpskillApp: all 9 training-pathway options](https://github.com/Parris-Tech-Services/UpskillApp/blob/main/docs/UPSKILL-TRAINING-PATHWAY-REGISTER-2026-10-11.md)
- [Shared learning quality standard](LEARNING-QUALITY-STANDARD.md)

This is a **code audit**, not a reviewed student outcome study, screenshot/browser UI certification, individually verified 218-link run, or legal/occupational approval.
