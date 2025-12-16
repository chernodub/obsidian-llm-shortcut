import { FrontMatterCache } from "obsidian";
import { describe, expect, it } from "vitest";
import { DEFAULT_USER_PROMPT_OPTIONS } from "../user-prompt-options.js";
import {
  CONTEXT_SIZE_AFTER_PROP_NAME,
  CONTEXT_SIZE_BEFORE_PROP_NAME,
  parseUserPromptOptionsFromFileProperties,
  PROMPT_RESPONSE_PROCESSING_MODE_PROP_NAME,
  SELECTION_MODE_PROP_NAME,
  SELECTION_ONLY_PROP_VALUE,
} from "./parse-user-prompt-options-from-file-properties.js";

describe("parseUserPromptOptionsFromFileProperties", () => {
  describe("default values", () => {
    it("should return default values when all properties are missing", () => {
      const fileProperties: FrontMatterCache = {};
      const result = parseUserPromptOptionsFromFileProperties(fileProperties);

      expect(result).toEqual(DEFAULT_USER_PROMPT_OPTIONS);
    });

    it("should return default selection mode when selection mode property is missing", () => {
      const fileProperties: FrontMatterCache = {
        [CONTEXT_SIZE_BEFORE_PROP_NAME]: "10",
        [CONTEXT_SIZE_AFTER_PROP_NAME]: "20",
      };
      const result = parseUserPromptOptionsFromFileProperties(fileProperties);

      expect(result.shouldHandleSelectionOnly).toBe(
        DEFAULT_USER_PROMPT_OPTIONS.shouldHandleSelectionOnly,
      );
    });

    it("should return default prompt response processing mode when property is missing", () => {
      const fileProperties: FrontMatterCache = {
        [CONTEXT_SIZE_BEFORE_PROP_NAME]: "10",
        [CONTEXT_SIZE_AFTER_PROP_NAME]: "20",
      };
      const result = parseUserPromptOptionsFromFileProperties(fileProperties);

      expect(result.promptResponseProcessingMethod).toBe(
        DEFAULT_USER_PROMPT_OPTIONS.promptResponseProcessingMethod,
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
        [CONTEXT_SIZE_BEFORE_PROP_NAME]: "10",
      };
      const result = parseUserPromptOptionsFromFileProperties(fileProperties);

      expect(result.contextSizeBefore).toBe(10);
    });

    it("should parse zero as valid value", () => {
      const fileProperties: FrontMatterCache = {
        [CONTEXT_SIZE_BEFORE_PROP_NAME]: "0",
      };
      const result = parseUserPromptOptionsFromFileProperties(fileProperties);

      expect(result.contextSizeBefore).toBe(0);
    });

    it("should return undefined when property is missing", () => {
      const fileProperties: FrontMatterCache = {};
      const result = parseUserPromptOptionsFromFileProperties(fileProperties);

      expect(result.contextSizeBefore).toBeUndefined();
    });

    it("should throw error for negative number", () => {
      const fileProperties: FrontMatterCache = {
        [CONTEXT_SIZE_BEFORE_PROP_NAME]: "-5",
      };

      expect(() =>
        parseUserPromptOptionsFromFileProperties(fileProperties),
      ).toThrow(
        `Invalid prompt file property=[${CONTEXT_SIZE_BEFORE_PROP_NAME}] value should be positive, but got [-5]`,
      );
    });

    it("should throw error for non-integer string", () => {
      const fileProperties: FrontMatterCache = {
        [CONTEXT_SIZE_BEFORE_PROP_NAME]: "10.5",
      };

      expect(() =>
        parseUserPromptOptionsFromFileProperties(fileProperties),
      ).toThrow(
        `Invalid prompt file property=[${CONTEXT_SIZE_BEFORE_PROP_NAME}] value should be an integer, but got [10.5]`,
      );
    });

    it("should throw error for non-numeric string", () => {
      const fileProperties: FrontMatterCache = {
        [CONTEXT_SIZE_BEFORE_PROP_NAME]: "abc",
      };

      expect(() =>
        parseUserPromptOptionsFromFileProperties(fileProperties),
      ).toThrow(
        `Invalid prompt file property=[${CONTEXT_SIZE_BEFORE_PROP_NAME}] value should be an integer, but got [abc]`,
      );
    });

    it("should throw error when value is not a string", () => {
      const fileProperties: FrontMatterCache = {
        [CONTEXT_SIZE_BEFORE_PROP_NAME]: 123,
      };

      expect(() =>
        parseUserPromptOptionsFromFileProperties(fileProperties),
      ).toThrow(
        `Invalid prompt file property=[${CONTEXT_SIZE_BEFORE_PROP_NAME}] unknown value type [123]`,
      );
    });

    it("should throw error when value is boolean", () => {
      const fileProperties: FrontMatterCache = {
        [CONTEXT_SIZE_BEFORE_PROP_NAME]: true,
      };

      expect(() =>
        parseUserPromptOptionsFromFileProperties(fileProperties),
      ).toThrow(
        `Invalid prompt file property=[${CONTEXT_SIZE_BEFORE_PROP_NAME}] unknown value type [true]`,
      );
    });

    it("should throw error for empty string", () => {
      const fileProperties: FrontMatterCache = {
        [CONTEXT_SIZE_BEFORE_PROP_NAME]: "",
      };

      expect(() =>
        parseUserPromptOptionsFromFileProperties(fileProperties),
      ).toThrow(
        `Invalid prompt file property=[${CONTEXT_SIZE_BEFORE_PROP_NAME}] value should be an integer, but got []`,
      );
    });

    it("should throw error for string with leading zeros that parse differently", () => {
      const fileProperties: FrontMatterCache = {
        [CONTEXT_SIZE_BEFORE_PROP_NAME]: "010",
      };

      expect(() =>
        parseUserPromptOptionsFromFileProperties(fileProperties),
      ).toThrow(
        `Invalid prompt file property=[${CONTEXT_SIZE_BEFORE_PROP_NAME}] value should be an integer, but got [010]`,
      );
    });
  });

  describe("prompt response processing mode", () => {
    it("should parse valid 'default' mode", () => {
      const fileProperties: FrontMatterCache = {
        [PROMPT_RESPONSE_PROCESSING_MODE_PROP_NAME]: "default",
      };
      const result = parseUserPromptOptionsFromFileProperties(fileProperties);

      expect(result.promptResponseProcessingMethod).toBe("default");
    });

    it("should parse valid 'info' mode", () => {
      const fileProperties: FrontMatterCache = {
        [PROMPT_RESPONSE_PROCESSING_MODE_PROP_NAME]: "info",
      };
      const result = parseUserPromptOptionsFromFileProperties(fileProperties);

      expect(result.promptResponseProcessingMethod).toBe("info");
    });

    it("should return undefined when property is missing", () => {
      const fileProperties: FrontMatterCache = {};
      const result = parseUserPromptOptionsFromFileProperties(fileProperties);

      expect(result.promptResponseProcessingMethod).toBeUndefined();
    });

    it("should throw error for invalid processing mode value", () => {
      const fileProperties: FrontMatterCache = {
        [PROMPT_RESPONSE_PROCESSING_MODE_PROP_NAME]: "invalid-mode",
      };

      expect(() =>
        parseUserPromptOptionsFromFileProperties(fileProperties),
      ).toThrow(
        `Invalid prompt file property=[${PROMPT_RESPONSE_PROCESSING_MODE_PROP_NAME}] value should be one of the values [default,info], but got [invalid-mode]`,
      );
    });

    it("should throw error when processing mode is not a string", () => {
      const fileProperties: FrontMatterCache = {
        [PROMPT_RESPONSE_PROCESSING_MODE_PROP_NAME]: 123,
      };

      expect(() =>
        parseUserPromptOptionsFromFileProperties(fileProperties),
      ).toThrow(
        `Invalid prompt file property=[${PROMPT_RESPONSE_PROCESSING_MODE_PROP_NAME}] value should be one of the values [default,info], but got [123]`,
      );
    });

    it("should throw error when processing mode is boolean", () => {
      const fileProperties: FrontMatterCache = {
        [PROMPT_RESPONSE_PROCESSING_MODE_PROP_NAME]: true,
      };

      expect(() =>
        parseUserPromptOptionsFromFileProperties(fileProperties),
      ).toThrow(
        `Invalid prompt file property=[${PROMPT_RESPONSE_PROCESSING_MODE_PROP_NAME}] value should be one of the values [default,info], but got [true]`,
      );
    });

    it("should throw error for empty string", () => {
      const fileProperties: FrontMatterCache = {
        [PROMPT_RESPONSE_PROCESSING_MODE_PROP_NAME]: "",
      };

      expect(() =>
        parseUserPromptOptionsFromFileProperties(fileProperties),
      ).toThrow(
        `Invalid prompt file property=[${PROMPT_RESPONSE_PROCESSING_MODE_PROP_NAME}] value should be one of the values [default,info], but got []`,
      );
    });
  });

  describe("context size after selection", () => {
    it("should parse valid positive integer", () => {
      const fileProperties: FrontMatterCache = {
        [CONTEXT_SIZE_AFTER_PROP_NAME]: "15",
      };
      const result = parseUserPromptOptionsFromFileProperties(fileProperties);

      expect(result.contextSizeAfter).toBe(15);
    });

    it("should parse zero as valid value", () => {
      const fileProperties: FrontMatterCache = {
        [CONTEXT_SIZE_AFTER_PROP_NAME]: "0",
      };
      const result = parseUserPromptOptionsFromFileProperties(fileProperties);

      expect(result.contextSizeAfter).toBe(0);
    });

    it("should return undefined when property is missing", () => {
      const fileProperties: FrontMatterCache = {};
      const result = parseUserPromptOptionsFromFileProperties(fileProperties);

      expect(result.contextSizeAfter).toBeUndefined();
    });

    it("should throw error for negative number", () => {
      const fileProperties: FrontMatterCache = {
        [CONTEXT_SIZE_AFTER_PROP_NAME]: "-3",
      };

      expect(() =>
        parseUserPromptOptionsFromFileProperties(fileProperties),
      ).toThrow(
        `Invalid prompt file property=[${CONTEXT_SIZE_AFTER_PROP_NAME}] value should be positive, but got [-3]`,
      );
    });

    it("should throw error for non-integer string", () => {
      const fileProperties: FrontMatterCache = {
        [CONTEXT_SIZE_AFTER_PROP_NAME]: "7.8",
      };

      expect(() =>
        parseUserPromptOptionsFromFileProperties(fileProperties),
      ).toThrow(
        `Invalid prompt file property=[${CONTEXT_SIZE_AFTER_PROP_NAME}] value should be an integer, but got [7.8]`,
      );
    });

    it("should throw error for non-numeric string", () => {
      const fileProperties: FrontMatterCache = {
        [CONTEXT_SIZE_AFTER_PROP_NAME]: "xyz",
      };

      expect(() =>
        parseUserPromptOptionsFromFileProperties(fileProperties),
      ).toThrow(
        `Invalid prompt file property=[${CONTEXT_SIZE_AFTER_PROP_NAME}] value should be an integer, but got [xyz]`,
      );
    });

    it("should throw error when value is not a string", () => {
      const fileProperties: FrontMatterCache = {
        [CONTEXT_SIZE_AFTER_PROP_NAME]: 456,
      };

      expect(() =>
        parseUserPromptOptionsFromFileProperties(fileProperties),
      ).toThrow(
        `Invalid prompt file property=[${CONTEXT_SIZE_AFTER_PROP_NAME}] unknown value type [456]`,
      );
    });
  });

  describe("combined properties", () => {
    it("should parse all valid properties together", () => {
      const fileProperties: FrontMatterCache = {
        [SELECTION_MODE_PROP_NAME]: SELECTION_ONLY_PROP_VALUE,
        [CONTEXT_SIZE_BEFORE_PROP_NAME]: "5",
        [CONTEXT_SIZE_AFTER_PROP_NAME]: "10",
        [PROMPT_RESPONSE_PROCESSING_MODE_PROP_NAME]: "info",
      };
      const result = parseUserPromptOptionsFromFileProperties(fileProperties);

      expect(result).toEqual({
        shouldHandleSelectionOnly: true,
        contextSizeBefore: 5,
        contextSizeAfter: 10,
        promptResponseProcessingMethod: "info",
      });
    });

    it("should parse selection mode with only one context size", () => {
      const fileProperties: FrontMatterCache = {
        [SELECTION_MODE_PROP_NAME]: SELECTION_ONLY_PROP_VALUE,
        [CONTEXT_SIZE_BEFORE_PROP_NAME]: "3",
      };
      const result = parseUserPromptOptionsFromFileProperties(fileProperties);

      expect(result).toEqual({
        shouldHandleSelectionOnly: true,
        contextSizeBefore: 3,
        contextSizeAfter: undefined,
        promptResponseProcessingMethod: undefined,
      });
    });

    it("should parse context sizes without selection mode", () => {
      const fileProperties: FrontMatterCache = {
        [CONTEXT_SIZE_BEFORE_PROP_NAME]: "7",
        [CONTEXT_SIZE_AFTER_PROP_NAME]: "14",
      };
      const result = parseUserPromptOptionsFromFileProperties(fileProperties);

      expect(result).toEqual({
        shouldHandleSelectionOnly: undefined,
        contextSizeBefore: 7,
        contextSizeAfter: 14,
        promptResponseProcessingMethod: undefined,
      });
    });

    it("should parse prompt response processing mode with other properties", () => {
      const fileProperties: FrontMatterCache = {
        [PROMPT_RESPONSE_PROCESSING_MODE_PROP_NAME]: "default",
        [CONTEXT_SIZE_BEFORE_PROP_NAME]: "5",
      };
      const result = parseUserPromptOptionsFromFileProperties(fileProperties);

      expect(result).toEqual({
        shouldHandleSelectionOnly: undefined,
        contextSizeBefore: 5,
        contextSizeAfter: undefined,
        promptResponseProcessingMethod: "default",
      });
    });

    it("should handle large numbers", () => {
      const fileProperties: FrontMatterCache = {
        [CONTEXT_SIZE_BEFORE_PROP_NAME]: "1000",
        [CONTEXT_SIZE_AFTER_PROP_NAME]: "2000",
      };
      const result = parseUserPromptOptionsFromFileProperties(fileProperties);

      expect(result.contextSizeBefore).toBe(1000);
      expect(result.contextSizeAfter).toBe(2000);
    });
  });
});
