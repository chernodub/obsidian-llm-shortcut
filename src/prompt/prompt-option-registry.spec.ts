import { describe, expect, it } from "vitest";
import { mergePromptOptions } from "./prompt-option-registry.js";
import {
  DEFAULT_PROMPT_OPTIONS,
  PromptOptions,
} from "./user-prompt-options.js";

describe("mergePromptOptions", () => {
  describe("when file has no overrides (all undefined)", () => {
    it("should use global defaults when all file properties are undefined", () => {
      const globalDefaults: PromptOptions = {
        shouldHandleSelectionOnly: true,
        contextSizeBefore: 100,
        contextSizeAfter: 200,
        promptResponseProcessingMode: "info",
      };

      const result = mergePromptOptions(
        globalDefaults,
        DEFAULT_PROMPT_OPTIONS,
      );

      expect(result).toEqual({
        shouldHandleSelectionOnly: true,
        contextSizeBefore: 100,
        contextSizeAfter: 200,
        promptResponseProcessingMode: "info",
      });
    });

    it("should return all undefined when global defaults are also all undefined", () => {
      const result = mergePromptOptions(
        DEFAULT_PROMPT_OPTIONS,
        DEFAULT_PROMPT_OPTIONS,
      );

      expect(result).toEqual(DEFAULT_PROMPT_OPTIONS);
    });
  });

  describe("when file overrides are present", () => {
    it("should use file value for shouldHandleSelectionOnly over global default", () => {
      const globalDefaults: PromptOptions = {
        ...DEFAULT_PROMPT_OPTIONS,
      };

      const fileOverrides: PromptOptions = {
        ...DEFAULT_PROMPT_OPTIONS,
        shouldHandleSelectionOnly: true,
      };

      const result = mergePromptOptions(globalDefaults, fileOverrides);

      expect(result.shouldHandleSelectionOnly).toBe(true);
    });

    it("should use file value for contextSizeBefore over global default", () => {
      const globalDefaults: PromptOptions = {
        ...DEFAULT_PROMPT_OPTIONS,
        contextSizeBefore: 100,
      };

      const fileOverrides: PromptOptions = {
        ...DEFAULT_PROMPT_OPTIONS,
        contextSizeBefore: 50,
      };

      const result = mergePromptOptions(globalDefaults, fileOverrides);

      expect(result.contextSizeBefore).toBe(50);
    });

    it("should use file value for contextSizeAfter over global default", () => {
      const globalDefaults: PromptOptions = {
        ...DEFAULT_PROMPT_OPTIONS,
        contextSizeAfter: 200,
      };

      const fileOverrides: PromptOptions = {
        ...DEFAULT_PROMPT_OPTIONS,
        contextSizeAfter: 75,
      };

      const result = mergePromptOptions(globalDefaults, fileOverrides);

      expect(result.contextSizeAfter).toBe(75);
    });

    it("should use file value for promptResponseProcessingMode over global default", () => {
      const globalDefaults: PromptOptions = {
        ...DEFAULT_PROMPT_OPTIONS,
        promptResponseProcessingMode: "default",
      };

      const fileOverrides: PromptOptions = {
        ...DEFAULT_PROMPT_OPTIONS,
        promptResponseProcessingMode: "info",
      };

      const result = mergePromptOptions(globalDefaults, fileOverrides);

      expect(result.promptResponseProcessingMode).toBe("info");
    });

    it("should use file value of 0 for contextSizeBefore over global default", () => {
      const globalDefaults: PromptOptions = {
        ...DEFAULT_PROMPT_OPTIONS,
        contextSizeBefore: 100,
      };

      const fileOverrides: PromptOptions = {
        ...DEFAULT_PROMPT_OPTIONS,
        contextSizeBefore: 0,
      };

      const result = mergePromptOptions(globalDefaults, fileOverrides);

      expect(result.contextSizeBefore).toBe(0);
    });

    it("should use file value of 0 for contextSizeAfter over global default", () => {
      const globalDefaults: PromptOptions = {
        ...DEFAULT_PROMPT_OPTIONS,
        contextSizeAfter: 200,
      };

      const fileOverrides: PromptOptions = {
        ...DEFAULT_PROMPT_OPTIONS,
        contextSizeAfter: 0,
      };

      const result = mergePromptOptions(globalDefaults, fileOverrides);

      expect(result.contextSizeAfter).toBe(0);
    });
  });

  describe("partial file overrides", () => {
    it("should mix file overrides with global defaults", () => {
      const globalDefaults: PromptOptions = {
        shouldHandleSelectionOnly: true,
        contextSizeBefore: 100,
        contextSizeAfter: 200,
        promptResponseProcessingMode: "info",
      };

      const fileOverrides: PromptOptions = {
        shouldHandleSelectionOnly: undefined,
        contextSizeBefore: 50,
        contextSizeAfter: undefined,
        promptResponseProcessingMode: undefined,
      };

      const result = mergePromptOptions(globalDefaults, fileOverrides);

      expect(result).toEqual({
        shouldHandleSelectionOnly: true,
        contextSizeBefore: 50,
        contextSizeAfter: 200,
        promptResponseProcessingMode: "info",
      });
    });
  });

  describe("both undefined falls through", () => {
    it("should return undefined when both global and file are undefined", () => {
      const result = mergePromptOptions(
        DEFAULT_PROMPT_OPTIONS,
        DEFAULT_PROMPT_OPTIONS,
      );

      expect(result.shouldHandleSelectionOnly).toBeUndefined();
      expect(result.contextSizeBefore).toBeUndefined();
      expect(result.contextSizeAfter).toBeUndefined();
      expect(result.promptResponseProcessingMode).toBeUndefined();
    });
  });
});
