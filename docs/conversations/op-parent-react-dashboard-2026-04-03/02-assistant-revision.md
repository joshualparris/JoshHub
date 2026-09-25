## Assistant

I spotted one real bug straight away: `walkStart` gets recreated on every render, so the walk never truly "started" at a fixed time. I cleaned that up and tightened the component so it is easier to maintain.

The revised version kept the same look and made these changes:

- fixed the `walkStart` bug;
- cleaned up timers properly;
- made event cards/buttons data-driven;
- improved readability and reuse;
- added accessibility polish.

~~~jsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const COLORS = {
  orange: "#FF5F1F",
  dark: "#121212",
  card: "#1E1E1E",
  border: "#333333",
  grey: "#2C2C2C",
  textDim: "#888888",
  text: "#E0E0E0",
  green: "#4ADE80",
  blue: "#60A5FA",
  purple: "#A78BFA",
  yellow: "#FACC15",
  white: "#FFFFFF",
};

const EVENT_CONFIG = {
  FEED: { label: "Last Feed", buttonLabel: "FEED", icon: "🍼", color: COLORS.orange },
  DIAPER: { label: "Last Diaper", buttonLabel: "DIAPER", icon: "🔄", color: COLORS.blue },
  SLEEP: { label: "Last Sleep", buttonLabel: "SLEEP", icon: "💤", color: COLORS.purple },
};

const timeFormatter = new Intl.DateTimeFormat("en-AU", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

function formatTime(date) {
  return timeFormatter.format(date);
}

function formatElapsed(from, now) {
  const diffSeconds = Math.max(0, Math.floor((now - from) / 1000));

  if (diffSeconds < 60) return `${diffSeconds}s ago`;

  const minutes = Math.floor(diffSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  const remainderMinutes = minutes % 60;
  return `${hours}h ${remainderMinutes}m ago`;
}

function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}

function useFlash(duration = 300) {
  const [flashing, setFlashing] = useState(false);
  const timeoutRef = useRef(null);

  const trigger = useCallback(() => {
    setFlashing(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setFlashing(false);
      timeoutRef.current = null;
    }, duration);
  }, [duration]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return [flashing, trigger];
}

function BentoCard({ children, glow = false, style = {} }) {
  return (
    <div
      style={{
        background: COLORS.card,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        padding: "14px 16px",
        boxShadow: glow ? `0 0 12px 2px ${COLORS.orange}44` : "none",
        transition: "box-shadow 0.3s ease",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Label({ children, style = {} }) {
  return (
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 10,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: COLORS.textDim,
        marginBottom: 4,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Mono({ children, size = 16, color = COLORS.text, style = {} }) {
  return (
    <div
      style={{
        fontFamily: "'JetBrains Mono', 'Roboto Mono', monospace",
        fontSize: size,
        color,
        lineHeight: 1.3,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function PulseDot({ active }) {
  return (
    <span
      aria-hidden="true"
      style={{
        position: "relative",
        display: "inline-block",
        width: 8,
        height: 8,
        marginRight: 6,
      }}
    >
      <span
        style={{
          display: "block",
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: active ? COLORS.green : COLORS.textDim,
          boxShadow: active ? `0 0 6px 2px ${COLORS.green}66` : "none",
        }}
      />
    </span>
  );
}

function ActionButton({ label, color, onPress, flashing }) {
  const background = flashing ? COLORS.white : COLORS.grey;
  const textColor = flashing ? COLORS.dark : color;
  const boxShadow = flashing ? `0 0 20px 4px ${color}` : "none";

  return (
    <button
      type="button"
      onClick={onPress}
      aria-label={`Log ${label.toLowerCase()}`}
      style={{
        flex: 1,
        background,
        border: `1px solid ${color}`,
        borderRadius: 10,
        padding: "16px 8px",
        cursor: "pointer",
        transition: "background 0.15s ease, box-shadow 0.15s ease, color 0.15s ease",
        boxShadow,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          letterSpacing: "0.1em",
          color: textColor,
          fontWeight: 700,
          transition: "color 0.15s ease",
        }}
      >
        {label}
      </span>
    </button>
  );
}

function StatusCard({ title, icon, time }) {
  return (
    <BentoCard>
      <Label>{title}</Label>
      <div style={{ fontSize: 16, marginBottom: 4 }}>{icon}</div>
      <Mono size={12}>{time ?? "—"}</Mono>
    </BentoCard>
  );
}

export default function OpParent() {
  const now = useNow(30000);

  const [logs, setLogs] = useState(() => [
    { type: "FEED", time: new Date(Date.now() - 1000 * 60 * 135) },
    { type: "DIAPER", time: new Date(Date.now() - 1000 * 60 * 47) },
    { type: "SLEEP", time: new Date(Date.now() - 1000 * 60 * 210) },
  ]);

  const [walkStart] = useState(() => new Date(Date.now() - 1000 * 60 * 38));

  const [feedFlash, triggerFeed] = useFlash(280);
  const [diaperFlash, triggerDiaper] = useFlash(280);
  const [sleepFlash, triggerSleep] = useFlash(280);

  const flashMap = {
    FEED: { flashing: feedFlash, trigger: triggerFeed },
    DIAPER: { flashing: diaperFlash, trigger: triggerDiaper },
    SLEEP: { flashing: sleepFlash, trigger: triggerSleep },
  };

  const logEvent = useCallback((type) => {
    flashMap[type].trigger();
    setLogs((prev) => [...prev, { type, time: new Date() }]);
  }, [flashMap]);

  const lastByType = useMemo(() => {
    const latest = { FEED: null, DIAPER: null, SLEEP: null };

    for (let i = logs.length - 1; i >= 0; i--) {
      const log = logs[i];
      if (!latest[log.type]) latest[log.type] = log;
      if (latest.FEED && latest.DIAPER && latest.SLEEP) break;
    }

    return latest;
  }, [logs]);

  const recentLogs = useMemo(() => {
    return [...logs].reverse().slice(0, 5);
  }, [logs]);

  const walkMinutes = Math.floor((now - walkStart.getTime()) / 60000);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.dark,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: 0,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 390,
          minHeight: "100vh",
          background: COLORS.dark,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 20px 4px",
            fontSize: 11,
            color: COLORS.textDim,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <span>OP-PARENT</span>
          <span style={{ color: COLORS.orange, fontWeight: 700 }}>■ ACTIVE</span>
          <span>{formatTime(new Date(now))}</span>
        </div>

        <div style={{ height: 1, background: COLORS.border, margin: "4px 0 12px" }} />

        <div
          style={{
            padding: "0 12px",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 10 }}>
            <BentoCard glow>
              <Label>Active Loadout</Label>
              <Mono size={15} color={COLORS.orange}>Park Config</Mono>
              <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["Nappies", "Bottle", "Muslin", "Sunscreen"].map((item) => (
                  <span
                    key={item}
                    style={{
                      fontSize: 9,
                      fontFamily: "'JetBrains Mono', monospace",
                      color: COLORS.textDim,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: 4,
                      padding: "2px 6px",
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </BentoCard>

            <BentoCard>
              <Label>Walk Timer</Label>
              <div style={{ display: "flex", alignItems: "center" }}>
                <PulseDot active />
                <Mono size={22}>{walkMinutes}m</Mono>
              </div>
              <Mono size={10} color={COLORS.textDim} style={{ marginTop: 2 }}>
                2.1 km · started {formatTime(walkStart)}
              </Mono>
            </BentoCard>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {Object.entries(EVENT_CONFIG).map(([type, config]) => (
              <StatusCard
                key={type}
                title={config.label}
                icon={config.icon}
                time={lastByType[type] ? formatElapsed(lastByType[type].time, now) : null}
              />
            ))}
          </div>

          <BentoCard>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <Label>Environment</Label>
                <Mono size={13}>Partly Cloudy · 24°C</Mono>
                <Mono size={10} color={COLORS.yellow} style={{ marginTop: 3 }}>
                  ⚠ UV Index 7 — apply sunscreen
                </Mono>
              </div>
              <div style={{ textAlign: "right" }}>
                <Label>Wind</Label>
                <Mono size={13}>12 km/h</Mono>
                <Mono size={10} color={COLORS.textDim}>NW · Canopy OK</Mono>
              </div>
            </div>
          </BentoCard>

          <BentoCard>
            <Label>Mission Log</Label>
            <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 4 }}>
              {recentLogs.map((log, index) => (
                <div
                  key={`${log.type}-${log.time.getTime()}-${index}`}
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Mono size={11} color={index === 0 ? COLORS.orange : COLORS.textDim}>
                    {log.type}
                  </Mono>
                  <Mono size={11} color={COLORS.textDim}>
                    {formatTime(log.time)}
                  </Mono>
                </div>
              ))}
            </div>
          </BentoCard>
        </div>

        <div style={{ height: 16 }} />

        <div
          style={{
            padding: "12px 12px 28px",
            borderTop: `1px solid ${COLORS.border}`,
            background: `${COLORS.dark}EE`,
            backdropFilter: "blur(8px)",
          }}
        >
          <Label style={{ marginBottom: 8, textAlign: "center" }}>Command Center</Label>
          <div style={{ display: "flex", gap: 10 }}>
            {Object.entries(EVENT_CONFIG).map(([type, config]) => (
              <ActionButton
                key={type}
                label={config.buttonLabel}
                color={config.color}
                flashing={flashMap[type].flashing}
                onPress={() => logEvent(type)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
~~~

Main changes explained:

1. **Fixed the walk timer bug**  
   The original `walkStart` was recreated every render, so it always looked like the walk started "38 mins ago". The revised version keeps it fixed.

2. **Fixed timer cleanup in `useFlash`**  
   The old version could leave timeouts hanging around. The revised hook clears them properly.

3. **Made the UI data-driven**  
   Feed, diaper, and sleep now come from one config object instead of repeated markup.

4. **Improved performance slightly**  
   `recentLogs` and `lastByType` are memoised, and the current-time update is handled in one place.

5. **Polished buttons/accessibility**  
   Added `type="button"` and `aria-label`.

A possible future direction was a polished preview-ready React/Tailwind version with cleaner visuals and less inline styling.

---

