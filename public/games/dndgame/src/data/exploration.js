export const SCENE_ART = {
  city: {
    image: "./assets/scenes/city-gates.svg",
    title: "City Stone and Oath-Bells",
    caption: "Banner-shadowed streets where duty and fear move side by side."
  },
  market: {
    image: "./assets/scenes/market-canopy.svg",
    title: "Lantern Canopies and Bargain Fires",
    caption: "Warm canvas glow, spice smoke, and a hundred voices trading half-truths."
  },
  docks: {
    image: "./assets/scenes/docks-tide.svg",
    title: "Salt Timber and Tidal Creak",
    caption: "Wet rope, dark water, and the feeling that someone is always listening."
  },
  ruins: {
    image: "./assets/scenes/ruins-moon.svg",
    title: "Broken Estates Under Moonlight",
    caption: "Cracked stone, ivy, and old wealth rotting into shadows."
  },
  graves: {
    image: "./assets/scenes/graveyard-fog.svg",
    title: "Fog Among the Dead",
    caption: "Cold markers, dim lanterns, and the hush before something stirs."
  },
  rift: {
    image: "./assets/scenes/hotenow-rift.svg",
    title: "Ashlight Over the Rift",
    caption: "Heat shimmer, molten seacare2, and a sky that looks ready to split."
  }
};

export const GLOBAL_AMBIENT_ACTIONS = [
  {
    id: "smell_around",
    label: "Smell Around",
    ability: "wis",
    dc: 10,
    success: ({ ambience }) => `You slow your breathing and separate the layers in the air: ${ambience.scent}.`,
    failure: ({ ambience }) => `The air is too muddled to read cleanly. All you catch is a blur of ${ambience.scent}.`
  },
  {
    id: "listen_closely",
    label: "Listen Closely",
    ability: "wis",
    dc: 11,
    success: ({ ambience }) => `When you hold still, the place resolves into sharper lines: ${ambience.sound}.`,
    failure: ({ ambience }) => `The noise never quite settles. You only catch flashes of ${ambience.sound}.`
  },
  {
    id: "perception_sweep",
    label: "Make A Perception Check",
    ability: "wis",
    dc: 12,
    success: ({ ambience }) => `Your eyes snag on what most people miss: ${ambience.detail}.`,
    failure: ({ ambience }) => `You scan the area carefully, but nothing separates itself from the ordinary press of ${ambience.atmosphere}.`
  },
  {
    id: "investigate_area",
    label: "Investigate The Area",
    ability: "int",
    dc: 12,
    success: ({ ambience }) => `You follow marks, disturbed dust, and little inconsistencies until the scene starts to speak: ${ambience.investigation}.`,
    failure: () => "You crouch, trace a few signs, and come away with fragments but no firm answer."
  },
  {
    id: "sit_and_watch",
    label: "Sit And Watch",
    daily: true,
    use: ({ ambience }) => ambience.rest,
    repeat: () => "You have already taken a quiet moment to steady yourself today."
  },
  {
    id: "drink_water",
    label: "Drink Some Water",
    daily: true,
    use: ({ ambience }) => ambience.water,
    repeat: () => "Your throat is already clear and your waterskin has had its share for the day."
  },
  {
    id: "write_journal",
    label: "Write In Journal",
    use: ({ ambience }) => ambience.journal
  },
  {
    id: "offer_prayer",
    label: "Offer A Quiet Prayer",
    daily: true,
    use: ({ ambience }) => ambience.prayer,
    repeat: () => "You have already spent time in quiet reflection today."
  }
];

export const LOCATION_AMBIENCE = {
  protector_enclave: {
    sceneId: "city",
    atmosphere: "order held together by tired discipline",
    scent: "cold iron, lamp oil, fresh-cut parchment, and fountain spray",
    sound: "measured boots, clipped commands, and distant bronze bells",
    detail: "chalk marks near a watch post and a courier route scratched into damp stone",
    investigation: "a fresh civic seal that references ashfall patrols and rationed temple supplies",
    tags: ["watchful steel", "marble fountain", "sealed orders"],
    rest: "You sit on the lip of a marble fountain and let the square move around you until your pulse eases.",
    water: "You drink from the lion-headed fountain. The water is cold enough to bite and clears your head immediately.",
    journal: "You write that Protector's Enclave looks calm from a distance, but every guard rotation says otherwise.",
    prayer: "Under the high banners, you lower your head for a quiet moment and let the noise thin out behind your thoughts.",
    perceptionReward: {
      gold: 4,
      text: "Tucked beside the fountain base, you spot a dropped civic voucher worth 4 gold."
    },
    investigationReward: {
      itemId: "moonleaf",
      qty: 1,
      text: "Inside a cracked courier tube, you find a wrapped pinch of moonleaf that never reached its healer."
    },
    specialActions: [
      {
        id: "read_proclamations",
        label: "Read The Proclamations",
        ability: "int",
        dc: 11,
        success: () => "Layered beneath the tax notices is a new decree about strange ash settling east of the city.",
        failure: () => "Rain and wax have turned the proclamations into a patchwork of smudged names and half-lines."
      },
      {
        id: "watch_guard_rotation",
        label: "Watch The Guard Rotation",
        ability: "wis",
        dc: 12,
        success: () => "One watch captain passes a coded token to another. Serra is not the only one expecting trouble.",
        failure: () => "The handoff looks routine until it is over, and by then the moment is gone."
      }
    ]
  },
  market_square: {
    sceneId: "market",
    atmosphere: "warm commerce stretched over hard scarcity",
    scent: "pepper broth, soot, wet wool, and sharp green herbs",
    sound: "hawkers calling prices, pans hissing, and wagons rattling over stone",
    detail: "a stall with false-bottom drawers and a scrap of shipping wax impressed with a broken sigil",
    investigation: "a trade ledger with several entries quietly redirected toward Dockward after sundown",
    tags: ["spice smoke", "canvas glow", "hidden ledgers"],
    rest: "You claim a stool near a cooking fire and watch the market's rhythm settle into something almost comforting.",
    water: "You rinse road dust away with cool water from a clay pitcher beside a smith's stall.",
    journal: "You note how the market sounds cheerful until you listen to what people stop saying when guards pass.",
    prayer: "You close your eyes amid the market clatter and offer a quiet word for steady hands and clear judgment.",
    perceptionReward: {
      gold: 5,
      text: "A purse slipped beneath a spice rack does not belong to anyone nearby. Inside are 5 gold pieces."
    },
    investigationReward: {
      itemId: "iron_ore",
      qty: 1,
      text: "Under a stack of broken pans, you uncover a clean piece of trade-grade iron ore."
    },
    specialActions: [
      {
        id: "haggle_for_rumors",
        label: "Haggle For Rumors",
        ability: "cha",
        dc: 12,
        success: () => "A cloth merchant mutters that smugglers have been paying double for night deliveries near the tide line.",
        failure: () => "The merchants enjoy the performance but keep their real gossip tucked behind polite smiles."
      },
      {
        id: "sample_street_broth",
        label: "Sample Street Broth",
        daily: true,
        use: () => "A paper cup of pepper broth warcare2 your chest and takes the edge off the road.",
        repeat: () => "You are still carrying the comfort of that broth and do not need another cup right now."
      }
    ]
  },
  hall_of_justice: {
    sceneId: "city",
    atmosphere: "sacred calm threaded through military urgency",
    scent: "incense ash, polished stone, old wax, and clean linen",
    sound: "murmured prayer, echoing sandals, and low cathedral bells",
    detail: "fresh candle drips near a side shrine and a healer's satchel left ready beside a bench",
    investigation: "a prayer board crowded with petitions about missing caravans, fever, and ash-darkened skies",
    tags: ["candle smoke", "echoed vows", "marble hush"],
    rest: "You sit beneath a carved relief of old heroes and let the hall's quiet weight settle your nerves.",
    water: "Temple acolytes leave a basin of clean water near the entry. You drink deeply and feel the tension loosen.",
    journal: "You write that the Hall of Justice feels less like safety and more like people working very hard to preserve it.",
    prayer: "Before the candlelight, your thoughts finally line up into something clean and usable.",
    perceptionReward: {
      gold: 3,
      text: "You notice a donation tray knocked behind a bench. After returning most of it, the priests insist you keep 3 gold."
    },
    investigationReward: {
      itemId: "healing_potion",
      qty: 1,
      text: "A healer thanks you for finding a misplaced satchel and presses a healing potion into your hand."
    },
    specialActions: [
      {
        id: "light_a_candle",
        label: "Light A Candle",
        daily: true,
        use: () => "The tiny flame steadies you more than you expected.",
        repeat: () => "You have already stood quietly with the candlelight today."
      },
      {
        id: "study_reliefs",
        label: "Study The Stone Reliefs",
        ability: "int",
        dc: 11,
        success: () => "The reliefs repeat one lesson over and over: walls matter, but people matter more.",
        failure: () => "You admire the stonework, but the symbolism remains frustratingly broad."
      }
    ]
  },
  dockward: {
    sceneId: "docks",
    atmosphere: "salt-slick nerves hidden under tavern noise",
    scent: "brine, tar, fish scales, and cheap lamp smoke",
    sound: "rope creak, gulls, muttered wagers, and waves thudding into pilings",
    detail: "fresh scrape marks on a crate that was recently re-nailed shut",
    investigation: "a chain of tide-stained bootprints leading from public cargo to a private warehouse door",
    tags: ["black tide", "rope creak", "salt fog"],
    rest: "You sit on a coiled rope and watch the harbor traffic argue with the tide.",
    water: "You wash salt from your lips with a long drink from your waterskin and breathe a little easier.",
    journal: "You write that Dockward wears its danger openly; the trick is learning which danger is for sale and which is hunting.",
    prayer: "With the tide moving under the boards, your quiet prayer feels less like certainty and more like balance.",
    perceptionReward: {
      gold: 4,
      text: "Wedged beneath a bollard, you find a loose payment chit worth 4 gold."
    },
    investigationReward: {
      itemId: "moonleaf",
      qty: 1,
      text: "Inside a torn smuggler wrap, you find a bundle of drying moonleaf."
    },
    specialActions: [
      {
        id: "listen_to_sailors",
        label: "Listen To Sailors",
        ability: "cha",
        dc: 11,
        success: () => "Between boasts and curses, you hear that someone has been paying extra for ash-proof cargo wrappings.",
        failure: () => "The sailors close ranks fast. You get noise, but not truth."
      },
      {
        id: "watch_the_tide",
        label: "Watch The Tide",
        ability: "wis",
        dc: 10,
        success: () => "The tide reveals which piers were used recently; the deeper wake points toward Sunken Pier.",
        failure: () => "The chop is too messy to read clearly, and every broken piling starts to look the same."
      }
    ]
  },
  blacklake: {
    sceneId: "ruins",
    atmosphere: "noble ruin hiding old grudges in ivy and ash",
    scent: "wet stone, torn ivy, soot, and stagnant garden water",
    sound: "loose shutters, distant crows, and the whisper of branches against masonry",
    detail: "a half-hidden family crest carved into a gatepost and boot prints where no path should be",
    investigation: "signs that someone has been moving through the old estates with purpose rather than scavenging",
    tags: ["ivy walls", "moonlit glass", "old money"],
    rest: "You sit on a broken balustrade and watch moonlight catch on shattered windows.",
    water: "You take a careful sip, then another, washing ash grit from your mouth while the district watches in silence.",
    journal: "You write that Blacklake feels like a place still pretending the catastrophe was temporary.",
    prayer: "In the hush between ruined walls, even a quiet prayer sounds as though it belongs to someone else.",
    perceptionReward: {
      itemId: "moonleaf",
      qty: 1,
      text: "You spot moonleaf climbing where a garden once stood and gather a usable sprig."
    },
    investigationReward: {
      gold: 6,
      text: "Behind a fallen stone panel, you uncover an old household coin box with 6 gold still inside."
    },
    specialActions: [
      {
        id: "inspect_manor_gate",
        label: "Inspect The Manor Gate",
        ability: "int",
        dc: 12,
        success: () => "The ash scoring on the ironwork is recent. Somebody has been testing magical heat here.",
        failure: () => "The gate yields only rust, ivy, and the feeling that it once mattered to somebody important."
      },
      {
        id: "trace_house_crests",
        label: "Trace The House Crests",
        ability: "dex",
        dc: 11,
        success: () => "Following carved crests from wall to wall shows you a clean route through the district's blind corners.",
        failure: () => "The crests break off into too many shattered branches to give you anything useful."
      }
    ]
  },
  crafting_hall: {
    sceneId: "market",
    atmosphere: "ordered workshop focus brightened by heat and metal song",
    scent: "coal heat, ground herbs, machine oil, and hammered steel",
    sound: "bellows breath, careful filing, and the ring of light strikes on the anvil",
    detail: "filings sorted by color and a rune diagram weighted under a blackened wrench",
    investigation: "a workbench sequence showing how the three sigils can be fixed into one stable ward",
    tags: ["forge light", "herb racks", "rune dust"],
    rest: "You lean against a warm stone wall and let the measured work sounds settle you.",
    water: "Cool water from a copper jug cuts through the forge heat and wakes you back up.",
    journal: "You write that the Crafting Hall is the one place in Neverwinter where chaos turns back into useful shape.",
    prayer: "Even here, amid sparks and hammer-song, a quiet prayer feels like another kind of craft.",
    perceptionReward: {
      itemId: "iron_ore",
      qty: 1,
      text: "You notice a clean lump of iron tucked beneath the slag tray and set it aside."
    },
    investigationReward: {
      itemId: "ember_shard",
      qty: 1,
      text: "Working through the bench scraps, you recover a viable ember shard from a cracked crucible."
    },
    specialActions: [
      {
        id: "sort_ingredients",
        label: "Sort The Ingredients",
        ability: "int",
        dc: 11,
        success: () => "Once sorted, the room's clutter reveals an elegant logic: every material here wants to become something greater.",
        failure: () => "You tidy a few trays, then realize you have only moved the clutter into better-looking piles."
      },
      {
        id: "sketch_rune_pattern",
        label: "Sketch A Rune Pattern",
        ability: "wis",
        dc: 12,
        success: () => "Your sketch catches the rhythm of the sigils well enough that the final key no longer feels theoretical.",
        failure: () => "The rune lines drift apart on the page before they resolve into anything stable."
      }
    ]
  },
  graveyard_road: {
    sceneId: "graves",
    atmosphere: "cold vigilance stretched over old dead and newer fear",
    scent: "wet earth, old stone dust, candle smoke, and cut yew",
    sound: "wind through iron fencing, wingbeats, and your own steps sounding too loud",
    detail: "new scratches on one mausoleum door and prayer strips tied where none should be",
    investigation: "a patrol route interrupted by something that came and went through the graves without using the road",
    tags: ["wet granite", "iron fence", "thin fog"],
    rest: "You sit against a weathered angel statue and force your breathing back into a calm rhythm.",
    water: "The water tastes flat in the cold air, but it clears the dryness fear leaves behind.",
    journal: "You write that Neverdeath is not loud about danger. It simply lets you notice it a little too late.",
    prayer: "You whisper a brief prayer for the living and the dead and feel your shoulders come down a fraction.",
    perceptionReward: {
      gold: 4,
      text: "At the base of a cracked marker, you spot a coin-offering missed by the crows. It amounts to 4 gold."
    },
    investigationReward: {
      itemId: "healing_potion",
      qty: 1,
      text: "A sealed flask lies hidden in a caretaker niche. The cork is intact: a healing potion."
    },
    specialActions: [
      {
        id: "read_epitaphs",
        label: "Read The Epitaphs",
        ability: "wis",
        dc: 10,
        success: () => "The repeated names and dates anchor you. Fear loses some of its teeth when you let the dead be people again.",
        failure: () => "The words blur into stone, and the cold keeps leaning against the back of your neck."
      },
      {
        id: "steady_your_nerves",
        label: "Steady Your Nerves",
        daily: true,
        use: () => "You plant your feet, count your breaths, and refuse to let the grave road rush you.",
        repeat: () => "You have already forced yourself back to calm once today."
      }
    ]
  },
  sunken_pier: {
    sceneId: "docks",
    atmosphere: "splintered structure and hidden movement under a skin of rot",
    scent: "salt rot, wet rope, kelp, and old lamp fuel",
    sound: "water slapping broken timber, chain taps, and the creak of boards deciding whether to hold",
    detail: "a section of planks kept cleaner than the rest and tar rubbed fresh across a crate seam",
    investigation: "a concealed stash point where smugglers swapped small valuable cargo rather than bulky freight",
    tags: ["broken pilings", "slick planks", "contraband wakes"],
    rest: "You take a careful seat on a dry crate and watch the water move beneath the broken boards.",
    water: "You rinse the dock stink from your mouth with a long swallow and decide not to think about the water below you.",
    journal: "You write that Sunken Pier feels one kick away from collapse, which makes it perfect for people who plan to leave in a hurry.",
    prayer: "Your quiet prayer is half gratitude, half warning to yourself not to trust any plank you did not test.",
    perceptionReward: {
      gold: 5,
      text: "Caught in a knot of rope, you find a smuggler's waterproof purse with 5 gold inside."
    },
    investigationReward: {
      itemId: "healing_potion",
      qty: 1,
      text: "Inside a tarred cache hidden under the boards, you recover a sealed healing potion."
    },
    specialActions: [
      {
        id: "probe_waterline",
        label: "Probe The Waterline",
        ability: "int",
        dc: 11,
        success: () => "Marks on the pilings show where small boats were tied off for quick midnight transfers.",
        failure: () => "The tide has blurred too much of the evidence into slime and guesswork."
      },
      {
        id: "test_the_planks",
        label: "Test The Planks",
        ability: "dex",
        dc: 10,
        success: () => "You find the safe path across the broken decking without a single bad step.",
        failure: () => "One rotten plank gives way under your boot, and only a fast shift keeps you dry."
      }
    ]
  },
  mount_hotenow: {
    sceneId: "rift",
    atmosphere: "heat-struck dread under a sky smeared with ember ash",
    scent: "sulfur, hot stone, scorched cloth, and bitter mineral dust",
    sound: "subterranean rumble, hissing vents, and sparks skittering in the wind",
    detail: "runic scorch marks and a path where ash has fused into glass under repeated heat",
    investigation: "ritual geometry carved into the stone around the rift, all of it designed to force the mountain to answer",
    tags: ["sulfur wind", "glass-black ash", "ritual heat"],
    rest: "You crouch behind a basalt shelf and wait until the shaking in your hands feels like readiness instead of fear.",
    water: "The water in your skin tastes almost sweet after the ash. Even one swallow helps.",
    journal: "You write that Mount Hotenow is less a place than an argument between stone and fire, and both sides are winning.",
    prayer: "You speak a brief prayer into the hot wind and decide that courage does not need to be comfortable to count.",
    perceptionReward: {
      itemId: "ember_shard",
      qty: 1,
      text: "In a crack beside the path, you spot an ember shard still stable enough to pocket."
    },
    investigationReward: {
      gold: 8,
      text: "You pry a heat-blackened coffer from a ritual niche and recover 8 gold fused inside."
    },
    specialActions: [
      {
        id: "taste_the_ash",
        label: "Taste The Ash In The Air",
        ability: "con",
        dc: 11,
        success: () => "The ash is fresh, metallic, and directional. Something large moved through here only moments ago.",
        failure: () => "The ash gets in your throat before it gives you anything useful."
      },
      {
        id: "read_the_rift",
        label: "Read The Rift Lines",
        ability: "int",
        dc: 13,
        success: () => "The carved channels make the truth plain: Vexira is not summoning chaos, she is disciplining it toward a single blow.",
        failure: () => "The pattern writhes at the edge of comprehension, but never resolves before the heat drives you back."
      }
    ]
  }
};
