import { describe, expect, it } from "vitest";
import {
  CARET_MACROS,
  SELECTION_END_MACROS,
  SELECTION_START_MACROS,
} from "../../llm/const";
import { UserContentParams } from "../../llm/llm-client";
import { UserPromptOptions } from "../../llm/user-prompt-params/user-prompt-options";
import { prepareUserContent } from "./prepare-user-content";

describe("prepareUserContent", () => {
  describe("basic functionality", () => {
    it("should return full content with selection markers when no context sizes are provided", () => {
      const fileContent = "Hello world, this is a test";
      const selection: UserContentParams["selection"] = {
        startIdx: 6,
        endIdx: 11,
      };
      const userPromptOptions: UserPromptOptions = {
        shouldHandleSelectionOnly: undefined,
        contextSizeBeforeSelection: undefined,
        contextSizeAfterSelection: undefined,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result.userContentString).toBe(
        "Hello " +
          SELECTION_START_MACROS +
          "world" +
          SELECTION_END_MACROS +
          ", this is a test",
      );
      expect(result.ignoredSizeBeforeContext).toBe(0);
      expect(result.ignoredSizeAfterContext).toBe(0);
    });

    it("should use caret macro when startIdx equals endIdx", () => {
      const fileContent = "Hello world";
      const selection: UserContentParams["selection"] = {
        startIdx: 5,
        endIdx: 5,
      };
      const userPromptOptions: UserPromptOptions = {
        shouldHandleSelectionOnly: undefined,
        contextSizeBeforeSelection: undefined,
        contextSizeAfterSelection: undefined,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result.userContentString).toBe("Hello" + CARET_MACROS + " world");
      expect(result.ignoredSizeBeforeContext).toBe(0);
      expect(result.ignoredSizeAfterContext).toBe(0);
    });

    it("should handle empty file content", () => {
      const fileContent = "";
      const selection: UserContentParams["selection"] = {
        startIdx: 0,
        endIdx: 0,
      };
      const userPromptOptions: UserPromptOptions = {
        shouldHandleSelectionOnly: undefined,
        contextSizeBeforeSelection: undefined,
        contextSizeAfterSelection: undefined,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result.userContentString).toBe(CARET_MACROS);
      expect(result.ignoredSizeBeforeContext).toBe(0);
      expect(result.ignoredSizeAfterContext).toBe(0);
    });

    it("should handle selection at the start of file", () => {
      const fileContent = "Hello world";
      const selection: UserContentParams["selection"] = {
        startIdx: 0,
        endIdx: 5,
      };
      const userPromptOptions: UserPromptOptions = {
        shouldHandleSelectionOnly: undefined,
        contextSizeBeforeSelection: undefined,
        contextSizeAfterSelection: undefined,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result.userContentString).toBe(
        SELECTION_START_MACROS + "Hello" + SELECTION_END_MACROS + " world",
      );
      expect(result.ignoredSizeBeforeContext).toBe(0);
      expect(result.ignoredSizeAfterContext).toBe(0);
    });

    it("should handle selection at the end of file", () => {
      const fileContent = "Hello world";
      const selection: UserContentParams["selection"] = {
        startIdx: 6,
        endIdx: 11,
      };
      const userPromptOptions: UserPromptOptions = {
        shouldHandleSelectionOnly: undefined,
        contextSizeBeforeSelection: undefined,
        contextSizeAfterSelection: undefined,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result.userContentString).toBe(
        "Hello " + SELECTION_START_MACROS + "world" + SELECTION_END_MACROS,
      );
      expect(result.ignoredSizeBeforeContext).toBe(0);
      expect(result.ignoredSizeAfterContext).toBe(0);
    });

    it("should handle selection covering entire file", () => {
      const fileContent = "Hello";
      const selection: UserContentParams["selection"] = {
        startIdx: 0,
        endIdx: 5,
      };
      const userPromptOptions: UserPromptOptions = {
        shouldHandleSelectionOnly: undefined,
        contextSizeBeforeSelection: undefined,
        contextSizeAfterSelection: undefined,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result.userContentString).toBe(
        SELECTION_START_MACROS + "Hello" + SELECTION_END_MACROS,
      );
      expect(result.ignoredSizeBeforeContext).toBe(0);
      expect(result.ignoredSizeAfterContext).toBe(0);
    });
  });

  describe("context size before selection", () => {
    it("should include full context when context size is larger than available content", () => {
      const fileContent = "Hello world";
      const selection: UserContentParams["selection"] = {
        startIdx: 6,
        endIdx: 11,
      };
      const userPromptOptions: UserPromptOptions = {
        shouldHandleSelectionOnly: undefined,
        contextSizeBeforeSelection: 100,
        contextSizeAfterSelection: undefined,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result.userContentString).toBe(
        "Hello " + SELECTION_START_MACROS + "world" + SELECTION_END_MACROS,
      );
      expect(result.ignoredSizeBeforeContext).toBe(0);
      expect(result.ignoredSizeAfterContext).toBe(0);
    });

    it("should limit context when context size is smaller than available content", () => {
      const fileContent = "This is a very long text with many words";
      const selection: UserContentParams["selection"] = {
        startIdx: 20,
        endIdx: 24,
      };
      const userPromptOptions: UserPromptOptions = {
        shouldHandleSelectionOnly: undefined,
        contextSizeBeforeSelection: 5,
        contextSizeAfterSelection: undefined,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result.userContentString).toBe(
        "long " +
          SELECTION_START_MACROS +
          "text" +
          SELECTION_END_MACROS +
          " with many words",
      );
      expect(result.ignoredSizeBeforeContext).toBe(15); // 20 - 5
      expect(result.ignoredSizeAfterContext).toBe(0);
    });

    it("should handle context size equal to available content before selection", () => {
      const fileContent = "Hello world";
      const selection: UserContentParams["selection"] = {
        startIdx: 6,
        endIdx: 11,
      };
      const userPromptOptions: UserPromptOptions = {
        shouldHandleSelectionOnly: undefined,
        contextSizeBeforeSelection: 6,
        contextSizeAfterSelection: undefined,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result.userContentString).toBe(
        "Hello " + SELECTION_START_MACROS + "world" + SELECTION_END_MACROS,
      );
      expect(result.ignoredSizeBeforeContext).toBe(0);
      expect(result.ignoredSizeAfterContext).toBe(0);
    });

    it("should handle zero context size before selection", () => {
      const fileContent = "Hello world";
      const selection: UserContentParams["selection"] = {
        startIdx: 6,
        endIdx: 11,
      };
      const userPromptOptions: UserPromptOptions = {
        shouldHandleSelectionOnly: undefined,
        contextSizeBeforeSelection: 0,
        contextSizeAfterSelection: undefined,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result.userContentString).toBe(
        SELECTION_START_MACROS + "world" + SELECTION_END_MACROS,
      );
      expect(result.ignoredSizeBeforeContext).toBe(6); // 6 - 0
      expect(result.ignoredSizeAfterContext).toBe(0);
    });

    it("should handle selection at start with context size", () => {
      const fileContent = "Hello world";
      const selection: UserContentParams["selection"] = {
        startIdx: 0,
        endIdx: 5,
      };
      const userPromptOptions: UserPromptOptions = {
        shouldHandleSelectionOnly: undefined,
        contextSizeBeforeSelection: 5,
        contextSizeAfterSelection: undefined,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result.userContentString).toBe(
        SELECTION_START_MACROS + "Hello" + SELECTION_END_MACROS + " world",
      );
      expect(result.ignoredSizeBeforeContext).toBe(0);
      expect(result.ignoredSizeAfterContext).toBe(0);
    });
  });

  describe("context size after selection", () => {
    it("should include full context when context size is larger than available content", () => {
      const fileContent = "Hello world";
      const selection: UserContentParams["selection"] = {
        startIdx: 0,
        endIdx: 5,
      };
      const userPromptOptions: UserPromptOptions = {
        shouldHandleSelectionOnly: undefined,
        contextSizeBeforeSelection: undefined,
        contextSizeAfterSelection: 100,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result.userContentString).toBe(
        SELECTION_START_MACROS + "Hello" + SELECTION_END_MACROS + " world",
      );
      expect(result.ignoredSizeBeforeContext).toBe(0);
      expect(result.ignoredSizeAfterContext).toBe(0);
    });

    it("should limit context when context size is smaller than available content", () => {
      const fileContent = "This is a very long text with many words";
      const selection: UserContentParams["selection"] = {
        startIdx: 0,
        endIdx: 4,
      };
      const userPromptOptions: UserPromptOptions = {
        shouldHandleSelectionOnly: undefined,
        contextSizeBeforeSelection: undefined,
        contextSizeAfterSelection: 5,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result.userContentString).toBe(
        SELECTION_START_MACROS + "This" + SELECTION_END_MACROS + " is a",
      );
      expect(result.ignoredSizeBeforeContext).toBe(0);
      expect(result.ignoredSizeAfterContext).toBe(31);
    });

    it("should handle context size equal to available content after selection", () => {
      const fileContent = "Hello world";
      const selection: UserContentParams["selection"] = {
        startIdx: 0,
        endIdx: 5,
      };
      const userPromptOptions: UserPromptOptions = {
        shouldHandleSelectionOnly: undefined,
        contextSizeBeforeSelection: undefined,
        contextSizeAfterSelection: 6,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result.userContentString).toBe(
        SELECTION_START_MACROS + "Hello" + SELECTION_END_MACROS + " world",
      );
      expect(result.ignoredSizeBeforeContext).toBe(0);
      expect(result.ignoredSizeAfterContext).toBe(0);
    });

    it("should handle zero context size after selection", () => {
      const fileContent = "Hello world";
      const selection: UserContentParams["selection"] = {
        startIdx: 0,
        endIdx: 5,
      };
      const userPromptOptions: UserPromptOptions = {
        shouldHandleSelectionOnly: undefined,
        contextSizeBeforeSelection: undefined,
        contextSizeAfterSelection: 0,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result.userContentString).toBe(
        SELECTION_START_MACROS + "Hello" + SELECTION_END_MACROS,
      );
      expect(result.ignoredSizeBeforeContext).toBe(0);
      expect(result.ignoredSizeAfterContext).toBe(6); // 6 - 0
    });

    it("should handle selection at end with context size", () => {
      const fileContent = "Hello world";
      const selection: UserContentParams["selection"] = {
        startIdx: 6,
        endIdx: 11,
      };
      const userPromptOptions: UserPromptOptions = {
        shouldHandleSelectionOnly: undefined,
        contextSizeBeforeSelection: undefined,
        contextSizeAfterSelection: 5,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result.userContentString).toBe(
        "Hello " + SELECTION_START_MACROS + "world" + SELECTION_END_MACROS,
      );
      expect(result.ignoredSizeBeforeContext).toBe(0);
      expect(result.ignoredSizeAfterContext).toBe(0);
    });
  });

  describe("combined context sizes", () => {
    it("should handle both context sizes together", () => {
      const fileContent = "This is a very long text with many words in it";
      const selection: UserContentParams["selection"] = {
        startIdx: 15,
        endIdx: 19,
      };
      const userPromptOptions: UserPromptOptions = {
        shouldHandleSelectionOnly: undefined,
        contextSizeBeforeSelection: 5,
        contextSizeAfterSelection: 5,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result.userContentString).toBe(
        "very " +
          SELECTION_START_MACROS +
          "long" +
          SELECTION_END_MACROS +
          " text",
      );
      expect(result.ignoredSizeBeforeContext).toBe(10); // 15 - 5
      expect(result.ignoredSizeAfterContext).toBe(22); // 29 - 5
    });

    it("should handle both context sizes when content is smaller than context sizes", () => {
      const fileContent = "Hello world";
      const selection: UserContentParams["selection"] = {
        startIdx: 6,
        endIdx: 11,
      };
      const userPromptOptions: UserPromptOptions = {
        shouldHandleSelectionOnly: undefined,
        contextSizeBeforeSelection: 100,
        contextSizeAfterSelection: 100,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result.userContentString).toBe(
        "Hello " + SELECTION_START_MACROS + "world" + SELECTION_END_MACROS,
      );
      expect(result.ignoredSizeBeforeContext).toBe(0);
      expect(result.ignoredSizeAfterContext).toBe(0);
    });

    it("should handle both context sizes with zero values", () => {
      const fileContent = "Hello world";
      const selection: UserContentParams["selection"] = {
        startIdx: 6,
        endIdx: 11,
      };
      const userPromptOptions: UserPromptOptions = {
        shouldHandleSelectionOnly: undefined,
        contextSizeBeforeSelection: 0,
        contextSizeAfterSelection: 0,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result.userContentString).toBe(
        SELECTION_START_MACROS + "world" + SELECTION_END_MACROS,
      );
      expect(result.ignoredSizeBeforeContext).toBe(6);
      expect(result.ignoredSizeAfterContext).toBe(0);
    });

    it("should handle caret with both context sizes", () => {
      const fileContent = "This is a test";
      const selection: UserContentParams["selection"] = {
        startIdx: 8,
        endIdx: 8,
      };
      const userPromptOptions: UserPromptOptions = {
        shouldHandleSelectionOnly: undefined,
        contextSizeBeforeSelection: 3,
        contextSizeAfterSelection: 3,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result.userContentString).toBe("is " + CARET_MACROS + "a t");
      expect(result.ignoredSizeBeforeContext).toBe(5); // 8 - 3
      expect(result.ignoredSizeAfterContext).toBe(3); // 6 - 3
    });
  });

  describe("edge cases", () => {
    it("should handle multiline content", () => {
      const fileContent = "Line 1\nLine 2\nLine 3";
      const selection: UserContentParams["selection"] = {
        startIdx: 7,
        endIdx: 13,
      };
      const userPromptOptions: UserPromptOptions = {
        shouldHandleSelectionOnly: undefined,
        contextSizeBeforeSelection: undefined,
        contextSizeAfterSelection: undefined,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result.userContentString).toBe(
        "Line 1\n" +
          SELECTION_START_MACROS +
          "Line 2" +
          SELECTION_END_MACROS +
          "\nLine 3",
      );
      expect(result.ignoredSizeBeforeContext).toBe(0);
      expect(result.ignoredSizeAfterContext).toBe(0);
    });

    it("should handle content with special characters", () => {
      const fileContent = "Hello $world$ {test} [example]";
      const selection: UserContentParams["selection"] = {
        startIdx: 6,
        endIdx: 13,
      };
      const userPromptOptions: UserPromptOptions = {
        shouldHandleSelectionOnly: undefined,
        contextSizeBeforeSelection: undefined,
        contextSizeAfterSelection: undefined,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result.userContentString).toBe(
        "Hello " +
          SELECTION_START_MACROS +
          "$world$" +
          SELECTION_END_MACROS +
          " {test} [example]",
      );
      expect(result.ignoredSizeBeforeContext).toBe(0);
      expect(result.ignoredSizeAfterContext).toBe(0);
    });

    it("should handle very large context sizes", () => {
      const fileContent = "Short";
      const selection: UserContentParams["selection"] = {
        startIdx: 2,
        endIdx: 3,
      };
      const userPromptOptions: UserPromptOptions = {
        shouldHandleSelectionOnly: undefined,
        contextSizeBeforeSelection: 1000000,
        contextSizeAfterSelection: 1000000,
      };

      const result = prepareUserContent({
        userContentParams: { fileContent, selection },
        userPromptOptions,
      });

      expect(result.userContentString).toBe(
        "Sh" + SELECTION_START_MACROS + "o" + SELECTION_END_MACROS + "rt",
      );
      expect(result.ignoredSizeBeforeContext).toBe(0);
      expect(result.ignoredSizeAfterContext).toBe(0);
    });
  });
});
