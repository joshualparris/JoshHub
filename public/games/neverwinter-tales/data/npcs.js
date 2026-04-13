window.NPCS = [
  {
    id: "madame-rosene",
    name: "Madame Rosene",
    role: "Fortune Teller",
    location: "beached-leviathan",
    description:
      "Wrapped in violet silks, Madame Rosene reads the future in a bowl of dark water. Her eyes never quite focus on you, yet she answers as if she already knows your questions.",
    stats: { hp: 18, ac: 12, attitude: "neutral" },
    loreSnippet:
      "The Beached Leviathan once hosted captains who claimed to have seen the ruins of ancient Neverwinter beneath the waves.",
    dialogueTree: {
      start: {
        text: "The cards whisper, traveler. Do you seek fate, or coin?",
        responses: [
          {
            text: "Read my fortune.",
            nextNode: "fortune",
          },
          {
            text: "I want rumors about the city.",
            nextNode: "rumors",
          },
          {
            text: "Can you help me?",
            nextNode: "persuasion",
            skill_check: { skill: "persuasion", dc: 13 },
            failNode: "cold",
          },
        ],
      },
      fortune: {
        text: "A blade in shadow, a coin on edge, a name whispered from stone. Beware the chasm and those who profit from it.",
        responses: [{ text: "Thank you.", nextNode: "end" }],
      },
      rumors: {
        text: "Neverember moves pieces across the city like a game board. Some say the board is cracking.",
        responses: [{ text: "Who opposes him?", nextNode: "opposition" }],
      },
      opposition: {
        text: "Old blood, old guilds, and the whisper of the Chasm. That's all I will say.",
        responses: [{ text: "Enough for now.", nextNode: "end" }],
      },
      persuasion: {
        text: "You have a silver tongue. Take this: a name, 'Rinna of the docks.'",
        responses: [{ text: "I will remember.", nextNode: "end" }],
      },
      cold: {
        text: "My price is steep and my time scarce. Come back with proof of courage.",
        responses: [{ text: "I understand.", nextNode: "end" }],
      },
      end: {
        text: "The cards close like a door. She turns away.",
        responses: [],
      },
    },
  },
  {
    id: "gundren-rockseeker",
    name: "Gundren Rockseeker",
    role: "Dwarf Prospector",
    location: "protectors-enclave",
    description:
      "Gundren's beard is braided with iron rings, his pack heavy with maps and stone dust. He speaks quickly, as if afraid someone might steal the words.",
    stats: { hp: 22, ac: 15, attitude: "friendly" },
    loreSnippet:
      "Prospectors often pass through the Enclave on their way to the Sword Mountains and the old dwarven trails.",
    dialogueTree: {
      start: {
        text: "Aye! You look capable. Ever heard of Wave Echo Cave?",
        responses: [
          { text: "Tell me about the cave.", nextNode: "cave" },
          { text: "I might help for the right price.", nextNode: "price" },
          { text: "Not interested.", nextNode: "end" },
        ],
      },
      cave: {
        text: "Old dwarven legends, lost forge, and riches for the taking. I've a lead but need a blade to back it.",
        responses: [
          { text: "I'm listening.", nextNode: "offer" },
          { text: "Sounds dangerous.", nextNode: "danger" },
        ],
      },
      offer: {
        text: "Escort my supply wagon east. We split profits and glory. Deal?",
        responses: [
          { text: "Deal.", nextNode: "deal" },
          { text: "I need time to think.", nextNode: "end" },
        ],
      },
      price: {
        text: "Ha! Sharp. I can pay in coin now, or double after the cave is found.",
        responses: [
          { text: "Double later.", nextNode: "deal" },
          { text: "Coin now.", nextNode: "deal" },
        ],
      },
      danger: {
        text: "Danger is where legends are made. Or graves. Either way, we walk it.",
        responses: [{ text: "All right.", nextNode: "deal" }],
      },
      deal: {
        text: "Then we ride at dawn. Meet me by the East Gate.",
        responses: [{ text: "I'll be there.", nextNode: "end" }],
      },
      end: {
        text: "Gundren shoulders his pack and scans the crowd for trouble.",
        responses: [],
      },
    },
  },
  {
    id: "dagult-neverember",
    name: "Dagult Neverember",
    role: "Open Lord",
    location: "castle-never",
    description:
      "Neverember stands with the weight of a city on his shoulders, cloak clasped by a silver gryphon. His gaze measures every word for its cost.",
    stats: { hp: 35, ac: 16, attitude: "neutral" },
    loreSnippet:
      "Dagult Neverember oversaw the rebuilding of Neverwinter after the Spellplague, earning both loyalty and enemies.",
    dialogueTree: {
      start: {
        text: "You stand before the Open Lord. Speak your intent.",
        responses: [
          { text: "I seek work for the city.", nextNode: "work" },
          {
            text: "Tell me about your rivals.",
            nextNode: "rivals",
            skill_check: { skill: "investigation", dc: 14 },
            failNode: "deflect",
          },
          { text: "I only wish to pay respects.", nextNode: "respect" },
        ],
      },
      work: {
        text: "Then prove your loyalty. Keep the peace in the Blacklake District. Return with names.",
        responses: [{ text: "As you command.", nextNode: "end" }],
      },
      rivals: {
        text: "The noble houses and the old guilds watch me. The Chasm is their favorite hiding place.",
        responses: [{ text: "I will look into it.", nextNode: "end" }],
      },
      deflect: {
        text: "Curiosity can be dangerous. Earn my trust before you pry further.",
        responses: [{ text: "Understood.", nextNode: "end" }],
      },
      respect: {
        text: "Respect is rare. If you value order, we will speak again.",
        responses: [{ text: "I will return.", nextNode: "end" }],
      },
      end: {
        text: "Neverember turns back to the council table, already planning his next move.",
        responses: [],
      },
    },
  },
];
