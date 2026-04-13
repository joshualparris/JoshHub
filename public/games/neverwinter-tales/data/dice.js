// Dice and skill utilities.
(function () {
  function parse(spec) {
    spec = String(spec).replace(/\s+/g, "");
    var m = spec.match(/^(\d*)d(\d+)([+-]\d+)?$/i);
    if (!m) return null;
    return {
      count: m[1] === "" ? 1 : parseInt(m[1], 10),
      sides: parseInt(m[2], 10),
      mod: m[3] ? parseInt(m[3], 10) : 0,
    };
  }

  function rollOnce(sides) {
    return Math.floor(Math.random() * sides) + 1;
  }

  window.roll = function (spec) {
    if (typeof spec === "number") return { total: spec, rolls: [], mod: 0 };
    var p = parse(spec);
    if (!p) {
      var n = parseInt(spec, 10);
      return { total: isNaN(n) ? 0 : n, rolls: [], mod: 0 };
    }
    var rolls = [];
    var total = 0;
    for (var i = 0; i < p.count; i++) {
      var r = rollOnce(p.sides);
      rolls.push(r);
      total += r;
    }
    total += p.mod;
    return { total: total, rolls: rolls, mod: p.mod, spec: spec };
  };

  function abilityMod(score) {
    return Math.floor((score - 10) / 2);
  }

  function skillToAbility(skill) {
    var map = {
      athletics: "str",
      acrobatics: "dex",
      stealth: "dex",
      sleight_of_hand: "dex",
      investigation: "int",
      arcana: "int",
      history: "int",
      nature: "int",
      religion: "int",
      insight: "wis",
      perception: "wis",
      survival: "wis",
      persuasion: "cha",
      deception: "cha",
      intimidation: "cha",
      performance: "cha",
    };
    return map[String(skill || "").toLowerCase()] || "int";
  }

  window.skillCheck = function (skill, dc, player) {
    var ability = skillToAbility(skill);
    var score = player && player[ability] ? player[ability] : 10;
    var mod = abilityMod(score);
    var roll = window.roll("1d20");
    var total = roll.total + mod;
    var success = total >= dc;
    return {
      skill: skill,
      dc: dc,
      roll: roll.total,
      mod: mod,
      total: total,
      success: success,
    };
  };
})();
