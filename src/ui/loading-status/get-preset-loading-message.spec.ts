import { describe, expect, it } from "vitest";
import { getPresetLoadingMessage } from "./get-preset-loading-message";

describe("getPresetLoadingMessage", () => {
  it("uses the preset name", () => {
    expect(getPresetLoadingMessage("GPT")).toBe("GPT thinking...");
  });

  it("trims the preset name", () => {
    expect(getPresetLoadingMessage("  Default  ")).toBe(
      "Default thinking...",
    );
  });

  it("falls back to LLM for an empty name", () => {
    expect(getPresetLoadingMessage("  ")).toBe("LLM thinking...");
  });
});
