const DICE_PATTERN = /^(\d+)d(\d+)([+-]\d+)?$/i;

export function rollDie(sides = 20) {
  if (!Number.isFinite(sides) || sides < 2) {
    throw new Error(`Invalid die: d${sides}`);
  }
  return Math.floor(Math.random() * sides) + 1;
}

export function rollExpr(expr) {
  if (typeof expr === "number") {
    return { total: expr, rolls: [expr], modifier: 0, expr: String(expr) };
  }

  const normalized = String(expr || "").trim();
  const match = normalized.match(DICE_PATTERN);

  if (!match) {
    const asNumber = Number(normalized);
    if (!Number.isNaN(asNumber)) {
      return { total: asNumber, rolls: [asNumber], modifier: 0, expr: String(asNumber) };
    }
    throw new Error(`Invalid dice expression: ${expr}`);
  }

  const count = Number(match[1]);
  const sides = Number(match[2]);
  const modifier = match[3] ? Number(match[3]) : 0;

  if (count < 1 || count > 30) {
    throw new Error(`Unsupported die count: ${count}`);
  }

  const rolls = [];
  for (let i = 0; i < count; i += 1) {
    rolls.push(rollDie(sides));
  }

  const total = rolls.reduce((sum, value) => sum + value, 0) + modifier;
  return { total, rolls, modifier, expr: normalized };
}
