import { describe, expect, it } from "vitest";
import {
  CARET_MACROS,
  SELECTION_END_MACROS,
  SELECTION_START_MACROS,
} from "../constants";
import { UserContentParams } from "../user-content-params";
import {
  DEFAULT_USER_PROMPT_OPTIONS,
  UserPromptOptions,
} from "../user-prompt-options";
import { prepareUserContent } from "./prepare-user-content";

describe("prepareUserContent", () => {
  describe("basic functionality", () => {
    it("should return full content with selection markers when no context sizes are provided", () => {
      const fileContent = "Hello world, this is a test";
      const selection: UserContentParams["selection"] = {
        anchorIdx: 6,
        headIdx: 11,
      };
      const userPromptOptions: UserPromptOptions = {
        ...DEFAULT_USER_PROMPT_OPTIONS,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result).toBe(
        "Hello " +
          SELECTION_START_MACROS +
          "world" +
          SELECTION_END_MACROS +
          ", this is a test",
      );
    });

    it("should use caret macro when startIdx equals endIdx", () => {
      const fileContent = "Hello world";
      const selection: UserContentParams["selection"] = {
        anchorIdx: 5,
        headIdx: 5,
      };
      const userPromptOptions: UserPromptOptions = {
        ...DEFAULT_USER_PROMPT_OPTIONS,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result).toBe("Hello" + CARET_MACROS + " world");
    });

    it("should handle empty file content", () => {
      const fileContent = "";
      const selection: UserContentParams["selection"] = {
        anchorIdx: 0,
        headIdx: 0,
      };
      const userPromptOptions: UserPromptOptions = {
        ...DEFAULT_USER_PROMPT_OPTIONS,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result).toBe(CARET_MACROS);
    });

    it("should handle selection at the start of file", () => {
      const fileContent = "Hello world";
      const selection: UserContentParams["selection"] = {
        anchorIdx: 0,
        headIdx: 5,
      };
      const userPromptOptions: UserPromptOptions = {
        ...DEFAULT_USER_PROMPT_OPTIONS,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result).toBe(
        SELECTION_START_MACROS + "Hello" + SELECTION_END_MACROS + " world",
      );
    });

    it("should handle selection at the end of file", () => {
      const fileContent = "Hello world";
      const selection: UserContentParams["selection"] = {
        anchorIdx: 6,
        headIdx: 11,
      };
      const userPromptOptions: UserPromptOptions = {
        ...DEFAULT_USER_PROMPT_OPTIONS,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result).toBe(
        "Hello " + SELECTION_START_MACROS + "world" + SELECTION_END_MACROS,
      );
    });

    it("should handle selection covering entire file", () => {
      const fileContent = "Hello";
      const selection: UserContentParams["selection"] = {
        anchorIdx: 0,
        headIdx: 5,
      };
      const userPromptOptions: UserPromptOptions = {
        ...DEFAULT_USER_PROMPT_OPTIONS,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result).toBe(
        SELECTION_START_MACROS + "Hello" + SELECTION_END_MACROS,
      );
    });
  });

  describe("context size before selection", () => {
    it("should include full context when context size is larger than available content", () => {
      const fileContent = "Hello world";
      const selection: UserContentParams["selection"] = {
        anchorIdx: 6,
        headIdx: 11,
      };
      const userPromptOptions: UserPromptOptions = {
        ...DEFAULT_USER_PROMPT_OPTIONS,
        contextSizeBefore: 100,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result).toBe(
        "Hello " + SELECTION_START_MACROS + "world" + SELECTION_END_MACROS,
      );
    });

    it("should limit context when context size is smaller than available content", () => {
      const fileContent = "This is a very long text with many words";
      const selection: UserContentParams["selection"] = {
        anchorIdx: 20,
        headIdx: 24,
      };
      const userPromptOptions: UserPromptOptions = {
        ...DEFAULT_USER_PROMPT_OPTIONS,
        contextSizeBefore: 5,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result).toBe(
        "long " +
          SELECTION_START_MACROS +
          "text" +
          SELECTION_END_MACROS +
          " with many words",
      );
    });

    it("should handle context size equal to available content before selection", () => {
      const fileContent = "Hello world";
      const selection: UserContentParams["selection"] = {
        anchorIdx: 6,
        headIdx: 11,
      };
      const userPromptOptions: UserPromptOptions = {
        ...DEFAULT_USER_PROMPT_OPTIONS,
        contextSizeBefore: 6,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result).toBe(
        "Hello " + SELECTION_START_MACROS + "world" + SELECTION_END_MACROS,
      );
    });

    it("should handle zero context size before selection", () => {
      const fileContent = "Hello world";
      const selection: UserContentParams["selection"] = {
        anchorIdx: 6,
        headIdx: 11,
      };
      const userPromptOptions: UserPromptOptions = {
        ...DEFAULT_USER_PROMPT_OPTIONS,
        contextSizeBefore: 0,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result).toBe(
        SELECTION_START_MACROS + "world" + SELECTION_END_MACROS,
      );
    });

    it("should handle selection at start with context size", () => {
      const fileContent = "Hello world";
      const selection: UserContentParams["selection"] = {
        anchorIdx: 0,
        headIdx: 5,
      };
      const userPromptOptions: UserPromptOptions = {
        ...DEFAULT_USER_PROMPT_OPTIONS,
        contextSizeBefore: 5,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result).toBe(
        SELECTION_START_MACROS + "Hello" + SELECTION_END_MACROS + " world",
      );
    });
  });

  describe("context size after selection", () => {
    it("should include full context when context size is larger than available content", () => {
      const fileContent = "Hello world";
      const selection: UserContentParams["selection"] = {
        anchorIdx: 0,
        headIdx: 5,
      };
      const userPromptOptions: UserPromptOptions = {
        ...DEFAULT_USER_PROMPT_OPTIONS,
        contextSizeAfter: 100,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result).toBe(
        SELECTION_START_MACROS + "Hello" + SELECTION_END_MACROS + " world",
      );
    });

    it("should limit context when context size is smaller than available content", () => {
      const fileContent = "This is a very long text with many words";
      const selection: UserContentParams["selection"] = {
        anchorIdx: 0,
        headIdx: 4,
      };
      const userPromptOptions: UserPromptOptions = {
        ...DEFAULT_USER_PROMPT_OPTIONS,
        contextSizeAfter: 5,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result).toBe(
        SELECTION_START_MACROS + "This" + SELECTION_END_MACROS + " is a",
      );
    });

    it("should handle context size equal to available content after selection", () => {
      const fileContent = "Hello world";
      const selection: UserContentParams["selection"] = {
        anchorIdx: 0,
        headIdx: 5,
      };
      const userPromptOptions: UserPromptOptions = {
        ...DEFAULT_USER_PROMPT_OPTIONS,
        contextSizeAfter: 6,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result).toBe(
        SELECTION_START_MACROS + "Hello" + SELECTION_END_MACROS + " world",
      );
    });

    it("should handle zero context size after selection", () => {
      const fileContent = "Hello world";
      const selection: UserContentParams["selection"] = {
        anchorIdx: 0,
        headIdx: 5,
      };
      const userPromptOptions: UserPromptOptions = {
        ...DEFAULT_USER_PROMPT_OPTIONS,
        contextSizeAfter: 0,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result).toBe(
        SELECTION_START_MACROS + "Hello" + SELECTION_END_MACROS,
      );
    });

    it("should handle selection at end with context size", () => {
      const fileContent = "Hello world";
      const selection: UserContentParams["selection"] = {
        anchorIdx: 6,
        headIdx: 11,
      };
      const userPromptOptions: UserPromptOptions = {
        ...DEFAULT_USER_PROMPT_OPTIONS,
        contextSizeAfter: 5,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result).toBe(
        "Hello " + SELECTION_START_MACROS + "world" + SELECTION_END_MACROS,
      );
    });
  });

  describe("combined context sizes", () => {
    it("should handle both context sizes together", () => {
      const fileContent = "This is a very long text with many words in it";
      const selection: UserContentParams["selection"] = {
        anchorIdx: 15,
        headIdx: 19,
      };
      const userPromptOptions: UserPromptOptions = {
        ...DEFAULT_USER_PROMPT_OPTIONS,
        contextSizeBefore: 5,
        contextSizeAfter: 5,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result).toBe(
        "very " +
          SELECTION_START_MACROS +
          "long" +
          SELECTION_END_MACROS +
          " text",
      );
    });

    it("should handle both context sizes when content is smaller than context sizes", () => {
      const fileContent = "Hello world";
      const selection: UserContentParams["selection"] = {
        anchorIdx: 6,
        headIdx: 11,
      };
      const userPromptOptions: UserPromptOptions = {
        ...DEFAULT_USER_PROMPT_OPTIONS,
        contextSizeBefore: 100,
        contextSizeAfter: 100,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result).toBe(
        "Hello " + SELECTION_START_MACROS + "world" + SELECTION_END_MACROS,
      );
    });

    it("should handle both context sizes with zero values", () => {
      const fileContent = "Hello world";
      const selection: UserContentParams["selection"] = {
        anchorIdx: 6,
        headIdx: 11,
      };
      const userPromptOptions: UserPromptOptions = {
        ...DEFAULT_USER_PROMPT_OPTIONS,
        contextSizeBefore: 0,
        contextSizeAfter: 0,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result).toBe(
        SELECTION_START_MACROS + "world" + SELECTION_END_MACROS,
      );
    });

    it("should handle caret with both context sizes", () => {
      const fileContent = "This is a test";
      const selection: UserContentParams["selection"] = {
        anchorIdx: 8,
        headIdx: 8,
      };
      const userPromptOptions: UserPromptOptions = {
        ...DEFAULT_USER_PROMPT_OPTIONS,
        contextSizeBefore: 3,
        contextSizeAfter: 3,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result).toBe("is " + CARET_MACROS + "a t");
    });
  });

  describe("edge cases", () => {
    it("should handle multiline content", () => {
      const fileContent = "Line 1\nLine 2\nLine 3";
      const selection: UserContentParams["selection"] = {
        anchorIdx: 7,
        headIdx: 13,
      };
      const userPromptOptions: UserPromptOptions = {
        ...DEFAULT_USER_PROMPT_OPTIONS,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result).toBe(
        "Line 1\n" +
          SELECTION_START_MACROS +
          "Line 2" +
          SELECTION_END_MACROS +
          "\nLine 3",
      );
    });

    it("should handle content with special characters", () => {
      const fileContent = "Hello $world$ {test} [example]";
      const selection: UserContentParams["selection"] = {
        anchorIdx: 6,
        headIdx: 13,
      };
      const userPromptOptions: UserPromptOptions = {
        ...DEFAULT_USER_PROMPT_OPTIONS,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result).toBe(
        "Hello " +
          SELECTION_START_MACROS +
          "$world$" +
          SELECTION_END_MACROS +
          " {test} [example]",
      );
    });

    it("should handle very large context sizes", () => {
      const fileContent = "Short";
      const selection: UserContentParams["selection"] = {
        anchorIdx: 2,
        headIdx: 3,
      };
      const userPromptOptions: UserPromptOptions = {
        ...DEFAULT_USER_PROMPT_OPTIONS,
        contextSizeBefore: 1000000,
        contextSizeAfter: 1000000,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result).toBe(
        "Sh" + SELECTION_START_MACROS + "o" + SELECTION_END_MACROS + "rt",
      );
    });
  });

  describe("when anchorIdx > headIdx (backward selection)", () => {
    it("should produce same result as forward selection (full content with markers)", () => {
      const fileContent = "Hello world, this is a test";
      const selection: UserContentParams["selection"] = {
        anchorIdx: 11,
        headIdx: 6,
      };
      const userPromptOptions: UserPromptOptions = {
        ...DEFAULT_USER_PROMPT_OPTIONS,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result).toBe(
        "Hello " +
          SELECTION_START_MACROS +
          "world" +
          SELECTION_END_MACROS +
          ", this is a test",
      );
    });

    it("should produce same result for selection at start of file", () => {
      const fileContent = "Hello world";
      const selection: UserContentParams["selection"] = {
        anchorIdx: 5,
        headIdx: 0,
      };
      const userPromptOptions: UserPromptOptions = {
        ...DEFAULT_USER_PROMPT_OPTIONS,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result).toBe(
        SELECTION_START_MACROS + "Hello" + SELECTION_END_MACROS + " world",
      );
    });

    it("should produce same result for selection at end of file", () => {
      const fileContent = "Hello world";
      const selection: UserContentParams["selection"] = {
        anchorIdx: 11,
        headIdx: 6,
      };
      const userPromptOptions: UserPromptOptions = {
        ...DEFAULT_USER_PROMPT_OPTIONS,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result).toBe(
        "Hello " + SELECTION_START_MACROS + "world" + SELECTION_END_MACROS,
      );
    });

    it("should produce same result with context size before selection", () => {
      const fileContent = "This is a very long text with many words";
      const selection: UserContentParams["selection"] = {
        anchorIdx: 24,
        headIdx: 20,
      };
      const userPromptOptions: UserPromptOptions = {
        ...DEFAULT_USER_PROMPT_OPTIONS,
        contextSizeBefore: 5,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result).toBe(
        "long " +
          SELECTION_START_MACROS +
          "text" +
          SELECTION_END_MACROS +
          " with many words",
      );
    });

    it("should produce same result with context size after selection", () => {
      const fileContent = "This is a very long text with many words";
      const selection: UserContentParams["selection"] = {
        anchorIdx: 4,
        headIdx: 0,
      };
      const userPromptOptions: UserPromptOptions = {
        ...DEFAULT_USER_PROMPT_OPTIONS,
        contextSizeAfter: 5,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result).toBe(
        SELECTION_START_MACROS + "This" + SELECTION_END_MACROS + " is a",
      );
    });

    it("should produce same result with combined context sizes", () => {
      const fileContent = "This is a very long text with many words in it";
      const selection: UserContentParams["selection"] = {
        anchorIdx: 19,
        headIdx: 15,
      };
      const userPromptOptions: UserPromptOptions = {
        ...DEFAULT_USER_PROMPT_OPTIONS,
        contextSizeBefore: 5,
        contextSizeAfter: 5,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result).toBe(
        "very " +
          SELECTION_START_MACROS +
          "long" +
          SELECTION_END_MACROS +
          " text",
      );
    });
  });
});
