window.LOCATIONS = [
  {
    id: "beached-leviathan",
    name: "The Beached Leviathan",
    description:
      "A massive ship, long grounded, now serves as tavern and refuge. Lantern light gleams off salt-stained timber while sea wind slithers through warped planks. The scent of spice, tar, and ale mingles in the air as sailors trade stories.",
    ambience: "Creaking wood, brine-soaked air, low laughter, clinking mugs.",
    npcs: ["madame-rosene"],
    exits: ["protectors-enclave", "blacklake"],
  },
  {
    id: "protectors-enclave",
    name: "Protector's Enclave",
    description:
      "Banners ripple above marble steps and crowded market stalls. Priests and merchants weave through the square while guards keep a steady line. The city feels most alive here, and most watched.",
    ambience: "Temple bells, market chatter, the scrape of boots on stone.",
    npcs: ["gundren-rockseeker"],
    exits: ["beached-leviathan", "blacklake", "castle-never", "the-chasm"],
  },
  {
    id: "blacklake",
    name: "Blacklake District",
    description:
      "Noble manors rise around a misty lake, lanterns casting long reflections across the water. House guards watch from shadowed balconies while whispers travel faster than footsteps. The air tastes of damp stone and expensive perfume.",
    ambience: "Soft lapping water, distant violin, murmured gossip.",
    npcs: [],
    exits: ["protectors-enclave", "beached-leviathan", "the-chasm"],
  },
  {
    id: "the-chasm",
    name: "The Chasm",
    description:
      "A jagged wound splits the city, still raw from ancient disaster. Sickly blue light seeps from below, and bridges cross only where the Watch dares patrol. Those who linger feel the stones listening.",
    ambience: "Echoing drip, faint arcane hum, distant wind howling up from the rift.",
    npcs: [],
    exits: ["protectors-enclave", "blacklake"],
  },
  {
    id: "castle-never",
    name: "Castle Never",
    description:
      "The fortress looms over the city, half restored, half scarred. Banners of the Open Lord snap in the wind, and armored patrols move with disciplined rhythm. Politics are thicker than fog inside these walls.",
    ambience: "Steel on stone, muffled orders, the scent of oil and old parchment.",
    npcs: ["dagult-neverember"],
    exits: ["protectors-enclave"],
  },
];
