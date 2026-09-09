import { describe, expect, it } from "vitest";

import { isHttpUrl } from "./url";

describe("isHttpUrl", () => {
  it("accepts HTTP and HTTPS URLs", () => {
    expect(isHttpUrl("https://example.com/path?q=1")).toBe(true);
    expect(isHttpUrl(" http://example.com ")).toBe(true);
  });

  it("rejects incomplete or non-web URLs", () => {
    expect(isHttpUrl("https://")).toBe(false);
    expect(isHttpUrl("example.com")).toBe(false);
    expect(isHttpUrl("javascript:alert(1)")).toBe(false);
  });
});
