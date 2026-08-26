import { describe, expect, it } from "vitest";
import { isReasoningEffort } from "./reasoning-effort";

describe("isReasoningEffort", () => {
  it.each(["minimal", "low", "medium", "high"])(
    "accepts %s",
    (reasoningEffort) => {
      expect(isReasoningEffort(reasoningEffort)).toBe(true);
    },
  );

  it.each([undefined, "", "default", "extreme", 1])(
    "rejects %s",
    (reasoningEffort) => {
      expect(isReasoningEffort(reasoningEffort)).toBe(false);
    },
  );
});
