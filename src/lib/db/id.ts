export function uuid() {
  if (typeof crypto !== "undefined") {
    if (crypto.randomUUID) return crypto.randomUUID();
    if (crypto.getRandomValues) {
      const buf = new Uint8Array(16);
      crypto.getRandomValues(buf);
      // Adapted UUID v4
      buf[6] = (buf[6] & 0x0f) | 0x40;
      buf[8] = (buf[8] & 0x3f) | 0x80;
      const toHex = (n: number) => n.toString(16).padStart(2, "0");
      const segments = [
        Array.from(buf.slice(0, 4)).map(toHex).join(""),
        Array.from(buf.slice(4, 6)).map(toHex).join(""),
        Array.from(buf.slice(6, 8)).map(toHex).join(""),
        Array.from(buf.slice(8, 10)).map(toHex).join(""),
        Array.from(buf.slice(10, 16)).map(toHex).join(""),
      ];
      return segments.join("-");
    }
  }
  // fallback (not cryptographically strong)
  return "xxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
