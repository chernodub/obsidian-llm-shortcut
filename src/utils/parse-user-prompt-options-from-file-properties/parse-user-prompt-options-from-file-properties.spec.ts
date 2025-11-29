import { FrontMatterCache } from "obsidian";
import { describe, expect, it } from "vitest";
import { DEFAULT_USER_PROMPT_OPTIONS } from "../constants.js";
import {
  CONTEXT_SIZE_AFTER_SELECTION_PROP_NAME,
  CONTEXT_SIZE_BEFORE_SELECTION_PROP_NAME,
  parseUserPromptOptionsFromFileProperties,
  SELECTION_MODE_PROP_NAME,
  SELECTION_ONLY_PROP_VALUE,
} from "./parse-user-prompt-options-from-file-properties";

describe("parseUserPromptOptionsFromFileProperties", () => {
  describe("default values", () => {
    it("should return default values when all properties are missing", () => {
      const fileProperties: FrontMatterCache = {};
      const result = parseUserPromptOptionsFromFileProperties(fileProperties);

      expect(result).toEqual(DEFAULT_USER_PROMPT_OPTIONS);
    });

    it("should return default selection mode when selection mode property is missing", () => {
      const fileProperties: FrontMatterCache = {
        [CONTEXT_SIZE_BEFORE_SELECTION_PROP_NAME]: "10",
        [CONTEXT_SIZE_AFTER_SELECTION_PROP_NAME]: "20",
      };
      const result = parseUserPromptOptionsFromFileProperties(fileProperties);

      expect(result.shouldHandleSelectionOnly).toBe(
        DEFAULT_USER_PROMPT_OPTIONS.shouldHandleSelectionOnly,
      );
    });
  });

  describe("selection mode", () => {
    it("should parse valid selection-only mode", () => {
      const fileProperties: FrontMatterCache = {
        [SELECTION_MODE_PROP_NAME]: SELECTION_ONLY_PROP_VALUE,
      };
      const result = parseUserPromptOptionsFromFileProperties(fileProperties);

      expect(result.shouldHandleSelectionOnly).toBe(true);
    });

    it("should throw error for invalid selection mode value", () => {
      const fileProperties: FrontMatterCache = {
        [SELECTION_MODE_PROP_NAME]: "invalid-value",
      };

      expect(() =>
        parseUserPromptOptionsFromFileProperties(fileProperties),
      ).toThrow(
        `Invalid prompt file property=[${SELECTION_MODE_PROP_NAME}] value should be [${SELECTION_ONLY_PROP_VALUE}], but got [invalid-value]`,
      );
    });

    it("should throw error when selection mode is not a string", () => {
      const fileProperties: FrontMatterCache = {
        [SELECTION_MODE_PROP_NAME]: 123,
      };

      expect(() =>
        parseUserPromptOptionsFromFileProperties(fileProperties),
      ).toThrow(
        `Invalid prompt file property=[${SELECTION_MODE_PROP_NAME}] value should be [${SELECTION_ONLY_PROP_VALUE}], but got [123]`,
      );
    });

    it("should throw error when selection mode is boolean", () => {
      const fileProperties: FrontMatterCache = {
        [SELECTION_MODE_PROP_NAME]: true,
      };

      expect(() =>
        parseUserPromptOptionsFromFileProperties(fileProperties),
      ).toThrow(
        `Invalid prompt file property=[${SELECTION_MODE_PROP_NAME}] value should be [${SELECTION_ONLY_PROP_VALUE}], but got [true]`,
      );
    });
  });

  describe("context size before selection", () => {
    it("should parse valid positive integer", () => {
      const fileProperties: FrontMatterCache = {
        [CONTEXT_SIZE_BEFORE_SELECTION_PROP_NAME]: "10",
      };
      const result = parseUserPromptOptionsFromFileProperties(fileProperties);

      expect(result.contextSizeBeforeSelection).toBe(10);
    });

    it("should parse zero as valid value", () => {
      const fileProperties: FrontMatterCache = {
        [CONTEXT_SIZE_BEFORE_SELECTION_PROP_NAME]: "0",
      };
      const result = parseUserPromptOptionsFromFileProperties(fileProperties);

      expect(result.contextSizeBeforeSelection).toBe(0);
    });

    it("should return undefined when property is missing", () => {
      const fileProperties: FrontMatterCache = {};
      const result = parseUserPromptOptionsFromFileProperties(fileProperties);

      expect(result.contextSizeBeforeSelection).toBeUndefined();
    });

    it("should throw error for negative number", () => {
      const fileProperties: FrontMatterCache = {
        [CONTEXT_SIZE_BEFORE_SELECTION_PROP_NAME]: "-5",
      };

      expect(() =>
        parseUserPromptOptionsFromFileProperties(fileProperties),
      ).toThrow(
        `Invalid prompt file property=[${CONTEXT_SIZE_BEFORE_SELECTION_PROP_NAME}] value should be positive, but got [-5]`,
      );
    });

    it("should throw error for non-integer string", () => {
      const fileProperties: FrontMatterCache = {
        [CONTEXT_SIZE_BEFORE_SELECTION_PROP_NAME]: "10.5",
      };

      expect(() =>
        parseUserPromptOptionsFromFileProperties(fileProperties),
      ).toThrow(
        `Invalid prompt file property=[${CONTEXT_SIZE_BEFORE_SELECTION_PROP_NAME}] value should be an integer, but got [10.5]`,
      );
    });

    it("should throw error for non-numeric string", () => {
      const fileProperties: FrontMatterCache = {
        [CONTEXT_SIZE_BEFORE_SELECTION_PROP_NAME]: "abc",
      };

      expect(() =>
        parseUserPromptOptionsFromFileProperties(fileProperties),
      ).toThrow(
        `Invalid prompt file property=[${CONTEXT_SIZE_BEFORE_SELECTION_PROP_NAME}] value should be an integer, but got [abc]`,
      );
    });

    it("should throw error when value is not a string", () => {
      const fileProperties: FrontMatterCache = {
        [CONTEXT_SIZE_BEFORE_SELECTION_PROP_NAME]: 123,
      };

      expect(() =>
        parseUserPromptOptionsFromFileProperties(fileProperties),
      ).toThrow(
        `Invalid prompt file property=[${CONTEXT_SIZE_BEFORE_SELECTION_PROP_NAME}] unknown value type [123]`,
      );
    });

    it("should throw error when value is boolean", () => {
      const fileProperties: FrontMatterCache = {
        [CONTEXT_SIZE_BEFORE_SELECTION_PROP_NAME]: true,
      };

      expect(() =>
        parseUserPromptOptionsFromFileProperties(fileProperties),
      ).toThrow(
        `Invalid prompt file property=[${CONTEXT_SIZE_BEFORE_SELECTION_PROP_NAME}] unknown value type [true]`,
      );
    });

    it("should throw error for empty string", () => {
      const fileProperties: FrontMatterCache = {
        [CONTEXT_SIZE_BEFORE_SELECTION_PROP_NAME]: "",
      };

      expect(() =>
        parseUserPromptOptionsFromFileProperties(fileProperties),
      ).toThrow(
        `Invalid prompt file property=[${CONTEXT_SIZE_BEFORE_SELECTION_PROP_NAME}] value should be an integer, but got []`,
      );
    });

    it("should throw error for string with leading zeros that parse differently", () => {
      const fileProperties: FrontMatterCache = {
        [CONTEXT_SIZE_BEFORE_SELECTION_PROP_NAME]: "010",
      };

      expect(() =>
        parseUserPromptOptionsFromFileProperties(fileProperties),
      ).toThrow(
        `Invalid prompt file property=[${CONTEXT_SIZE_BEFORE_SELECTION_PROP_NAME}] value should be an integer, but got [010]`,
      );
    });
  });

  describe("context size after selection", () => {
    it("should parse valid positive integer", () => {
      const fileProperties: FrontMatterCache = {
        [CONTEXT_SIZE_AFTER_SELECTION_PROP_NAME]: "15",
      };
      const result = parseUserPromptOptionsFromFileProperties(fileProperties);

      expect(result.contextSizeAfterSelection).toBe(15);
    });

    it("should parse zero as valid value", () => {
      const fileProperties: FrontMatterCache = {
        [CONTEXT_SIZE_AFTER_SELECTION_PROP_NAME]: "0",
      };
      const result = parseUserPromptOptionsFromFileProperties(fileProperties);

      expect(result.contextSizeAfterSelection).toBe(0);
    });

    it("should return undefined when property is missing", () => {
      const fileProperties: FrontMatterCache = {};
      const result = parseUserPromptOptionsFromFileProperties(fileProperties);

      expect(result.contextSizeAfterSelection).toBeUndefined();
    });

    it("should throw error for negative number", () => {
      const fileProperties: FrontMatterCache = {
        [CONTEXT_SIZE_AFTER_SELECTION_PROP_NAME]: "-3",
      };

      expect(() =>
        parseUserPromptOptionsFromFileProperties(fileProperties),
      ).toThrow(
        `Invalid prompt file property=[${CONTEXT_SIZE_AFTER_SELECTION_PROP_NAME}] value should be positive, but got [-3]`,
      );
    });

    it("should throw error for non-integer string", () => {
      const fileProperties: FrontMatterCache = {
        [CONTEXT_SIZE_AFTER_SELECTION_PROP_NAME]: "7.8",
      };

      expect(() =>
        parseUserPromptOptionsFromFileProperties(fileProperties),
      ).toThrow(
        `Invalid prompt file property=[${CONTEXT_SIZE_AFTER_SELECTION_PROP_NAME}] value should be an integer, but got [7.8]`,
      );
    });

    it("should throw error for non-numeric string", () => {
      const fileProperties: FrontMatterCache = {
        [CONTEXT_SIZE_AFTER_SELECTION_PROP_NAME]: "xyz",
      };

      expect(() =>
        parseUserPromptOptionsFromFileProperties(fileProperties),
      ).toThrow(
        `Invalid prompt file property=[${CONTEXT_SIZE_AFTER_SELECTION_PROP_NAME}] value should be an integer, but got [xyz]`,
      );
    });

    it("should throw error when value is not a string", () => {
      const fileProperties: FrontMatterCache = {
        [CONTEXT_SIZE_AFTER_SELECTION_PROP_NAME]: 456,
      };

      expect(() =>
        parseUserPromptOptionsFromFileProperties(fileProperties),
      ).toThrow(
        `Invalid prompt file property=[${CONTEXT_SIZE_AFTER_SELECTION_PROP_NAME}] unknown value type [456]`,
      );
    });
  });

  describe("combined properties", () => {
    it("should parse all valid properties together", () => {
      const fileProperties: FrontMatterCache = {
        [SELECTION_MODE_PROP_NAME]: SELECTION_ONLY_PROP_VALUE,
        [CONTEXT_SIZE_BEFORE_SELECTION_PROP_NAME]: "5",
        [CONTEXT_SIZE_AFTER_SELECTION_PROP_NAME]: "10",
      };
      const result = parseUserPromptOptionsFromFileProperties(fileProperties);

      expect(result).toEqual({
        shouldHandleSelectionOnly: true,
        contextSizeBeforeSelection: 5,
        contextSizeAfterSelection: 10,
      });
    });

    it("should parse selection mode with only one context size", () => {
      const fileProperties: FrontMatterCache = {
        [SELECTION_MODE_PROP_NAME]: SELECTION_ONLY_PROP_VALUE,
        [CONTEXT_SIZE_BEFORE_SELECTION_PROP_NAME]: "3",
      };
      const result = parseUserPromptOptionsFromFileProperties(fileProperties);

      expect(result).toEqual({
        shouldHandleSelectionOnly: true,
        contextSizeBeforeSelection: 3,
        contextSizeAfterSelection: undefined,
      });
    });

    it("should parse context sizes without selection mode", () => {
      const fileProperties: FrontMatterCache = {
        [CONTEXT_SIZE_BEFORE_SELECTION_PROP_NAME]: "7",
        [CONTEXT_SIZE_AFTER_SELECTION_PROP_NAME]: "14",
      };
      const result = parseUserPromptOptionsFromFileProperties(fileProperties);

      expect(result).toEqual({
        shouldHandleSelectionOnly: false,
        contextSizeBeforeSelection: 7,
        contextSizeAfterSelection: 14,
      });
    });

    it("should handle large numbers", () => {
      const fileProperties: FrontMatterCache = {
        [CONTEXT_SIZE_BEFORE_SELECTION_PROP_NAME]: "1000",
        [CONTEXT_SIZE_AFTER_SELECTION_PROP_NAME]: "2000",
      };
      const result = parseUserPromptOptionsFromFileProperties(fileProperties);

      expect(result.contextSizeBeforeSelection).toBe(1000);
      expect(result.contextSizeAfterSelection).toBe(2000);
    });
  });
});
