export function uuid() {
  if (typeof crypto !== "undefined") {
    if (crypto.randomUUID) return crypto.randomUUID();
    if (crypto.getRandomValues) {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const toHex = (value: number) => value.toString(16).padStart(2, "0");
      const segments = [
        Array.from(bytes.slice(0, 4)).map(toHex).join(""),
        Array.from(bytes.slice(4, 6)).map(toHex).join(""),
        Array.from(bytes.slice(6, 8)).map(toHex).join(""),
        Array.from(bytes.slice(8, 10)).map(toHex).join(""),
        Array.from(bytes.slice(10, 16)).map(toHex).join(""),
      ];
      return segments.join("-");
    }
  }

  // These values identify local records; they are never security tokens. The fallback keeps
  // older/non-WebCrypto browsers usable while making its weaker randomness explicit here.
  return "xxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (placeholder) => {
    const randomNibble = (Math.random() * 16) | 0;
    const uuidNibble = placeholder === "x" ? randomNibble : (randomNibble & 0x3) | 0x8;
    return uuidNibble.toString(16);
  });
}
