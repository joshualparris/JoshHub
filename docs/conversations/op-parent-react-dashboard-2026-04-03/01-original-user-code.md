# Conversation archive: OP-PARENT React dashboard improvements

Date of original conversation: 2026-04-03  
Archived to GitHub: 2026-09-25  
Repository: `joshualparris/JoshHub`  
Purpose: preserve the OP-PARENT mobile React dashboard prototype, the code-review discussion, and the recommended next improvements so work can resume later without losing context.

## Privacy / safety note

This is a public-safe archive of the user-visible project conversation. The prototype content is generic parenting-dashboard UI data (feed, diaper, sleep, walk, weather, loadout) and contains no credentials, secrets, school/client data, addresses, or private API keys.

## High-level outcome

The OP-PARENT prototype evolved from a compact inline-style React dashboard into a cleaner, more maintainable version with:

- a fixed walk-start timestamp instead of recreating it every render;
- a reusable `useNow` timer;
- safer timeout cleanup in `useFlash`;
- data-driven event configuration for feed / diaper / sleep;
- derived latest-event state via `useMemo`;
- small accessibility improvements such as `type="button"` and `aria-label`;
- a clearer separation between reusable UI primitives and dashboard logic.

The next recommended improvements were:

1. Store timestamps as numbers (`Date.now()`) rather than `Date` objects.
2. Cap log growth so the in-memory event list cannot grow forever.
3. Optionally derive recent logs and latest-by-type in one pass.
4. Improve keyboard focus styling.
5. Respect `prefers-reduced-motion`.
6. Move static arrays such as loadout items outside the component.
7. Rename button prop `onPress` to web-native `onClick`.

---

## User - 2026-04-03T06:51:17Z

Can you improve this

~~~jsx
import { useState, useEffect, useRef } from "react";

const ORANGE = "#FF5F1F";
const DARK = "#121212";
const CARD = "#1E1E1E";
const BORDER = "#333333";
const GREY = "#2C2C2C";
const TEXT_DIM = "#888888";
const TEXT = "#E0E0E0";

function useFlash(duration = 300) {
  const [flashing, setFlashing] = useState(false);
  const trigger = () => {
    setFlashing(true);
    setTimeout(() => setFlashing(false), duration);
  };
  return [flashing, trigger];
}

function formatTime(date) {
  return date.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function timeSince(date) {
  const diff = Math.floor((Date.now() - date) / 1000);
  if (diff < 60) return `${diff}s ago`;
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return `${h}h ${rem}m ago`;
}

function BentoCard({ style, children, glow }) {
  return (
    <div style={{
      background: CARD,
      border: `1px solid ${BORDER}`,
      borderRadius: 12,
      padding: "14px 16px",
      boxShadow: glow ? `0 0 12px 2px ${ORANGE}44` : "none",
      transition: "box-shadow 0.3s ease",
      ...style
    }}>
      {children}
    </div>
  );
}

function Label({ children, style }) {
  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 10,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: TEXT_DIM,
      marginBottom: 4,
      ...style
    }}>
      {children}
    </div>
  );
}

function Mono({ children, size = 16, color = TEXT, style }) {
  return (
    <div style={{
      fontFamily: "'JetBrains Mono', 'Roboto Mono', monospace",
      fontSize: size,
      color,
      lineHeight: 1.3,
      ...style
    }}>
      {children}
    </div>
  );
}

function ActionButton({ label, color, onPress, flashing }) {
  const bg = flashing ? "#FFFFFF" : GREY;
  const textColor = flashing ? DARK : color;
  const shadow = flashing ? `0 0 20px 4px ${color}` : `0 0 0px 0px transparent`;

  return (
    <button
      onClick={onPress}
      style={{
        flex: 1,
        background: bg,
        border: `1px solid ${color}`,
        borderRadius: 10,
        padding: "16px 8px",
        cursor: "pointer",
        transition: "background 0.15s ease, box-shadow 0.15s ease, color 0.15s ease",
        boxShadow: shadow,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
        letterSpacing: "0.1em",
        color: textColor,
        fontWeight: 700,
        transition: "color 0.15s ease"
      }}>
        {label}
      </span>
    </button>
  );
}

function PulseDot({ active }) {
  return (
    <span style={{ position: "relative", display: "inline-block", width: 8, height: 8, marginRight: 6 }}>
      <span style={{
        display: "block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: active ? "#4ADE80" : TEXT_DIM,
        boxShadow: active ? "0 0 6px 2px #4ADE8066" : "none"
      }} />
    </span>
  );
}

export default function OpParent() {
  const [logs, setLogs] = useState([
    { type: "FEED", time: new Date(Date.now() - 1000 * 60 * 135) },
    { type: "DIAPER", time: new Date(Date.now() - 1000 * 60 * 47) },
    { type: "SLEEP", time: new Date(Date.now() - 1000 * 60 * 210) },
  ]);

  const [feedFlash, triggerFeed] = useFlash(280);
  const [diaperFlash, triggerDiaper] = useFlash(280);
  const [sleepFlash, triggerSleep] = useFlash(280);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const lastOf = (type) => logs.filter(l => l.type === type).at(-1);

  const logEvent = (type, trigger) => {
    trigger();
    setLogs(prev => [...prev, { type, time: new Date() }]);
  };

  const lastFeed = lastOf("FEED");
  const lastDiaper = lastOf("DIAPER");
  const lastSleep = lastOf("SLEEP");

  const recentLogs = [...logs].reverse().slice(0, 5);

  const walkStart = new Date(Date.now() - 1000 * 60 * 38);

  return (
    <div style={{
      minHeight: "100vh",
      background: DARK,
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      padding: "0",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Phone frame */}
      <div style={{
        width: "100%",
        maxWidth: 390,
        minHeight: "100vh",
        background: DARK,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}>

        {/* Status bar */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 20px 4px",
          fontSize: 11,
          color: TEXT_DIM,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          <span>OP-PARENT</span>
          <span style={{ color: ORANGE, fontWeight: 700 }}>■ ACTIVE</span>
          <span>{formatTime(new Date())}</span>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: BORDER, margin: "4px 0 12px" }} />

        {/* Bento Grid */}
        <div style={{ padding: "0 12px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Row 1: Loadout + Walk Timer */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 10 }}>
            <BentoCard glow>
              <Label>Active Loadout</Label>
              <Mono size={15} color={ORANGE}>Park Config</Mono>
              <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["Nappies", "Bottle", "Muslin", "Sunscreen"].map(item => (
                  <span key={item} style={{
                    fontSize: 9,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: TEXT_DIM,
                    border: `1px solid ${BORDER}`,
                    borderRadius: 4,
                    padding: "2px 6px",
                  }}>{item}</span>
                ))}
              </div>
            </BentoCard>

            <BentoCard>
              <Label>Walk Timer</Label>
              <div style={{ display: "flex", alignItems: "center" }}>
                <PulseDot active />
                <Mono size={22} color={TEXT}>38m</Mono>
              </div>
              <Mono size={10} color={TEXT_DIM} style={{ marginTop: 2 }}>2.1 km · started {formatTime(walkStart)}</Mono>
            </BentoCard>
          </div>

          {/* Row 2: Feed / Diaper / Sleep status */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[
              { label: "Last Feed", data: lastFeed, icon: "🍼" },
              { label: "Last Diaper", data: lastDiaper, icon: "🔄" },
              { label: "Last Sleep", data: lastSleep, icon: "💤" },
            ].map(({ label, data, icon }) => (
              <BentoCard key={label}>
                <Label>{label}</Label>
                <div style={{ fontSize: 16, marginBottom: 4 }}>{icon}</div>
                <Mono size={12} color={TEXT}>
                  {data ? timeSince(data.time) : "—"}
                </Mono>
              </BentoCard>
            ))}
          </div>

          {/* Row 3: Environment HUD */}
          <BentoCard>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <Label>Environment</Label>
                <Mono size={13} color={TEXT}>Partly Cloudy · 24°C</Mono>
                <Mono size={10} color={"#FACC15"} style={{ marginTop: 3 }}>⚠ UV Index 7 — apply sunscreen</Mono>
              </div>
              <div style={{ textAlign: "right" }}>
                <Label>Wind</Label>
                <Mono size={13} color={TEXT}>12 km/h</Mono>
                <Mono size={10} color={TEXT_DIM}>NW · Canopy OK</Mono>
              </div>
            </div>
          </BentoCard>

          {/* Row 4: Recent log */}
          <BentoCard>
            <Label>Mission Log</Label>
            <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 4 }}>
              {recentLogs.map((log, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
                  <Mono size={11} color={i === 0 ? ORANGE : TEXT_DIM}>{log.type}</Mono>
                  <Mono size={11} color={TEXT_DIM}>{formatTime(log.time)}</Mono>
                </div>
              ))}
            </div>
          </BentoCard>
        </div>

        {/* Spacer */}
        <div style={{ height: 16 }} />

        {/* Bottom Command Center — anchored to bottom 30% */}
        <div style={{
          padding: "12px 12px 28px",
          borderTop: `1px solid ${BORDER}`,
          background: `${DARK}EE`,
          backdropFilter: "blur(8px)",
        }}>
          <Label style={{ marginBottom: 8, textAlign: "center" }}>Command Center</Label>
          <div style={{ display: "flex", gap: 10 }}>
            <ActionButton label="FEED" color={ORANGE} onPress={() => logEvent("FEED", triggerFeed)} flashing={feedFlash} />
            <ActionButton label="DIAPER" color={"#60A5FA"} onPress={() => logEvent("DIAPER", triggerDiaper)} flashing={diaperFlash} />
            <ActionButton label="SLEEP" color={"#A78BFA"} onPress={() => logEvent("SLEEP", triggerSleep)} flashing={sleepFlash} />
          </div>
        </div>
      </div>
    </div>
  );
}
~~~

