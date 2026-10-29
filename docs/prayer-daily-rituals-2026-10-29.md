# Still & Near: a daily embodied prayer practice and virtual prayer deck

**Created:** 29 October 2026  
**Project:** JoshHub, public-safe research and feature documentation. Personal prayers, names and lament drafts are not included in this repository.

## Aim

Enable a single, non-performative daily gratitude pause, a physical transition into/out of prayer, a repeatable prayer-card deck, intercessory “praying the room”, and honest personal lament. A six-card starter deck uses original art and written prayers. Personal cards and optional reflections are local-only and must be saved deliberately.

## Direct evidence from Christian practice

1. [Practicing the Way, official Prayer Practice](https://www.practicingtheway.org/prayer), Session 1: choose a daily time and place, and use a received prayer when words are hard. Session 2: try transitional aids, bodily posture, beginning/ending in gratitude, petition and intercession. Session 4: silence and breath prayer.
2. [Bridgetown/Practicing the Way 2017: Prayer Cards & Praying the Room](https://practicingthewayarchives.org/pray/week-three). The community practice explicitly makes prayer cards for people/circumstances, invites the Holy Spirit, settles into silence, prays through the cards, imagines a room with Jesus or the Father and invites a person/circumstance into view, then prays on their behalf. This is the most direct historical source for the virtual-deck feature.
3. [Bridgetown/Practicing the Way 2017: Unanswered Prayer & Lament Psalms](https://practicingthewayarchives.org/pray/week-four). Three exercises include praying lament psalms, writing and praying one's own lament psalm, and journaling unanswered prayers. Psalm 13, Psalm 79 and Psalm 88 are useful points of reference. This is not an instruction to force a cheerful conclusion.
4. [Bridgetown/Practicing the Way: Prayer of Examen](https://practicingthewayarchives.org/pray/week-two). The evening practice replays the day, names strong feelings, honestly speaks one of those feelings to Jesus, and gives thanks.
5. [Tyler Staton, *Praying Like Monks, Living Like Fools*, Australian publisher](https://www.hachette.com.au/tyler-staton/praying-like-monks-living-like-fools-an-invitation-to-the-wonder-and-mystery-of-prayer). Practicing the Way identifies it as its recommended prayer book; its chapters address prayer posture, intercession, petition, silence/persistence and unceasing prayer.
6. [St Andrews Encyclopaedia of Theology: Prayer](https://www.saet.ac.uk/Christianity/Prayer). Historic Christian prayer includes standing, kneeling, prostration, lifting hands and other embodied postures. No one posture is a requirement.
7. [Lally et al. (2010), habit formation in the real world](https://doi.org/10.1002/ejsp.674). Repetition in a consistent context builds automaticity, with very wide individual variation. Missing a single opportunity does not substantially undo habit formation.
8. [Gollwitzer and Sheeran implementation-intention meta-analysis (2024)](https://doi.org/10.1080/10463283.2024.2334563). “If X, then Y” planning supports action more reliably than vague intentions. These studies are of behaviour broadly, not a demonstration that any specific prayer habit causes a theological or spiritual outcome.

## A practical cue–ritual–prayer–return sequence

**Morning / entering:** After putting feet on the floor, pause, stand or sit with hands open. Say “Father, here I am. Holy Spirit, help me pray.” Open one prayer card. Pray without needing to finish the deck.

**Midday gratitude:** After lunch, notice one gift, and offer thanks for 20 seconds. Mark the pause in the deck if helpful; marking is not a score and need not include any written private detail.

**Evening / returning:** After the final ordinary task before bed, sit, stand or kneel comfortably. Notice one grace and one difficult emotion; tell God both. Pray a lament as necessary, then close and consider the Practice reflection. The reflection is not an examination of success.

**If distracted:** Place the card physically near a cue you already touch (bedside lamp, water glass, journal) and use a short received prayer. Doing less is often wiser than abandoning the practice. You can resume the next day without “catching up”.

## Bodily prayer menu

| Posture | Possible expression | Biblical reference | Modification |
|---|---|---|---|
| Standing | Attentive presence before God | Mark 11:25 | Lean against a wall |
| Open/lifted hands | Welcome, praise, releasing control | 1 Timothy 2:8; Psalm 134:2 | Palms up on knees |
| Kneeling | Humility and surrender | Ephesians 3:14; Luke 22:41 | Cushion, chair, or bow head |
| Sitting | Rest and attention | 2 Samuel 7:18 | Support back and feet |
| Walking | Accompany ordinary life with prayer | Luke 24:13–32 (walking with risen Christ; not a prescribed posture) | Walk only somewhere safe |

Postures are expressive aids, not spiritual prerequisites. Physical pain, dizziness, disability, pregnancy or injury are valid reasons to adapt. Avoid pressure to assume a pose which worsens symptoms.

## Praying the room (user-centred adaptation)

1. Sit comfortably; notice body and breath.
2. Invite the Holy Spirit: “Help me pray and love wisely.”
3. Imagine yourself before the Father or Jesus. Allow a person or circumstance to come to mind; you may also choose intentionally.
4. Ask for what is loving, truthful and good, without assuming an image or thought is a guaranteed revelation.
5. Pray in your own words, consider a respectful practical action, and end with gratitude.

The app does **not** identify people, infer private needs, or claim what God has said. No person's details are required.

## Writing your own lament

In the words of a prayer addressed to God, name: (a) what happened, (b) what you feel, (c) questions and protests, and (d) what you need (optional). A lament can have no resolution and may be spoken aloud, written down privately or simply held. For ideas use Psalm 13, Psalm 88, or the 2017 practice above. Users choose explicitly whether to save a composed lament to their private card deck; drafts never auto-save.

## Persistence, privacy and limits

- All starter cards are source-controlled, contain only general prayers and use self-authored art and language.
- Custom cards and practice reflections are stored in first-party localStorage only **when the user presses Save**; gratitude logs only the date the user explicitly marks it.
- The page has no analytics, third-party scripts, backend writes, cloud sync or prompt-based notification scheduling.
- Data is not encrypted at rest, may be visible to others in a shared browser profile, and may disappear after browser clearing. Do not describe local storage as a secure vault.
- App supports deletion of individual custom cards and clearing all prayer data.
- No streaks, gamified guilt, claims of healing, or guaranteed supernatural outcomes.
- The app's reflection prompt cannot independently send device push reminders. A separate scheduled ChatGPT reminder was attempted but reached the account limit of five active tasks; existing automations were not displaced.

## Verification checklist

- Open /prayer-deck.html as a first-party page and verify six distinct starter cards and scenic SVG artwork.
- Create, select and delete a custom card; reload and confirm persistence only after explicit save.
- Mark gratitude, refresh and confirm same-day status without any score.
- Compose a lament; verify draft does not persist on refresh; explicitly save it to the deck.
- Walk the praying-the-room stepper forward and back.
- Save and clear a practice reflection; verify only today's saved content is restored on refresh.
- Delete all local data after confirmation and verify it is not restored.
- Confirm links from JoshHub navigation, dashboard, faith Life page and global search.
- Check mobile layout, keyboard focus, accessible labels and no external script requests.
- Verify live deployment is from the intended Git repository and commit, not a different JoshHub fork.
