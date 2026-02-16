import { describe, expect, it } from "vitest";
import { trimSelection } from "./trim-selection";

describe("trimSelection", () => {
  it("should trim whitespace from both start and end", () => {
    const text = "   hello world   ";
    const result = trimSelection(text, { anchorIdx: 0, headIdx: 17 });
    expect(result).toEqual({ anchorIdx: 3, headIdx: 14 });
  });

  it("should trim whitespace only from start", () => {
    const text = "   hello world";
    const result = trimSelection(text, { anchorIdx: 0, headIdx: 14 });
    expect(result).toEqual({ anchorIdx: 3, headIdx: 14 });
  });

  it("should trim whitespace only from end", () => {
    const text = "hello world   ";
    const result = trimSelection(text, { anchorIdx: 0, headIdx: 14 });
    expect(result).toEqual({ anchorIdx: 0, headIdx: 11 });
  });

  it("should not modify indices when there is no whitespace to trim", () => {
    const text = "hello world";
    const result = trimSelection(text, { anchorIdx: 0, headIdx: 11 });
    expect(result).toEqual({ anchorIdx: 0, headIdx: 11 });
  });

  it("should handle selection in the middle of text", () => {
    const text = "prefix   hello world   suffix";
    const result = trimSelection(text, { anchorIdx: 7, headIdx: 20 });
    expect(result).toEqual({ anchorIdx: 9, headIdx: 20 });
  });

  it("should handle all whitespace selection", () => {
    const text = "   \t\n   ";
    const result = trimSelection(text, { anchorIdx: 0, headIdx: 6 });
    expect(result).toEqual({ anchorIdx: 6, headIdx: 6 });
  });

  it("should handle empty selection (startIdx === endIdx)", () => {
    const text = "hello world";
    const result = trimSelection(text, { anchorIdx: 5, headIdx: 5 });
    expect(result).toEqual({ anchorIdx: 5, headIdx: 5 });
  });

  it("should handle empty selection with whitespace around", () => {
    const text = "   ";
    const result = trimSelection(text, { anchorIdx: 0, headIdx: 3 });
    expect(result).toEqual({ anchorIdx: 3, headIdx: 3 });
  });

  it("should trim different types of whitespace (spaces, tabs, newlines)", () => {
    const text = " \t\n hello \t\n world \t\n ";
    const result = trimSelection(text, { anchorIdx: 0, headIdx: 20 });
    expect(result).toEqual({ anchorIdx: 4, headIdx: 18 });
  });

  it("should handle selection that is entirely whitespace", () => {
    const text = "hello   \t\n   world";
    const result = trimSelection(text, { anchorIdx: 5, headIdx: 12 });
    expect(result).toEqual({ anchorIdx: 12, headIdx: 12 });
  });

  it("should handle single character selection", () => {
    const text = "hello world";
    const result = trimSelection(text, { anchorIdx: 2, headIdx: 3 });
    expect(result).toEqual({ anchorIdx: 2, headIdx: 3 });
  });

  it("should handle single whitespace character selection", () => {
    const text = "hello world";
    const result = trimSelection(text, { anchorIdx: 5, headIdx: 6 });
    expect(result).toEqual({ anchorIdx: 6, headIdx: 6 });
  });

  it("should preserve non-whitespace content in the middle", () => {
    const text = "   hello   world   ";
    const result = trimSelection(text, { anchorIdx: 0, headIdx: 19 });
    expect(result).toEqual({ anchorIdx: 3, headIdx: 16 });
  });

  it("should handle selection at the beginning of text", () => {
    const text = "   hello";
    const result = trimSelection(text, { anchorIdx: 0, headIdx: 3 });
    expect(result).toEqual({ anchorIdx: 3, headIdx: 3 });
  });

  it("should handle selection at the end of text", () => {
    const text = "hello   ";
    const result = trimSelection(text, { anchorIdx: 5, headIdx: 8 });
    expect(result).toEqual({ anchorIdx: 8, headIdx: 8 });
  });

  it("should handle multi-line text with whitespace", () => {
    const text = "  line1\n  line2  \n  line3  ";
    const result = trimSelection(text, { anchorIdx: 0, headIdx: 25 });
    expect(result).toEqual({ anchorIdx: 2, headIdx: 25 });
  });

  it("should handle selection that starts and ends at same non-whitespace character", () => {
    const text = "hello";
    const result = trimSelection(text, { anchorIdx: 2, headIdx: 3 });
    expect(result).toEqual({ anchorIdx: 2, headIdx: 3 });
  });

  describe("when headIdx < anchorIdx (backward selection)", () => {
    it("should trim whitespace from both start and end", () => {
      const text = "   hello world   ";
      const result = trimSelection(text, { anchorIdx: 17, headIdx: 0 });
      expect(result).toEqual({ anchorIdx: 14, headIdx: 3 });
    });

    it("should trim whitespace only from start", () => {
      const text = "   hello world";
      const result = trimSelection(text, { anchorIdx: 14, headIdx: 0 });
      expect(result).toEqual({ anchorIdx: 14, headIdx: 3 });
    });

    it("should trim whitespace only from end", () => {
      const text = "hello world   ";
      const result = trimSelection(text, { anchorIdx: 14, headIdx: 0 });
      expect(result).toEqual({ anchorIdx: 11, headIdx: 0 });
    });

    it("should not modify indices when there is no whitespace to trim", () => {
      const text = "hello world";
      const result = trimSelection(text, { anchorIdx: 11, headIdx: 0 });
      expect(result).toEqual({ anchorIdx: 11, headIdx: 0 });
    });

    it("should handle selection in the middle of text", () => {
      const text = "prefix   hello world   suffix";
      const result = trimSelection(text, { anchorIdx: 20, headIdx: 7 });
      expect(result).toEqual({ anchorIdx: 20, headIdx: 9 });
    });

    it("should handle all whitespace selection", () => {
      const text = "   \t\n   ";
      const result = trimSelection(text, { anchorIdx: 6, headIdx: 0 });
      expect(result).toEqual({ anchorIdx: 6, headIdx: 6 });
    });

    it("should handle empty selection (headIdx === anchorIdx)", () => {
      const text = "hello world";
      const result = trimSelection(text, { anchorIdx: 5, headIdx: 5 });
      expect(result).toEqual({ anchorIdx: 5, headIdx: 5 });
    });

    it("should handle single character selection", () => {
      const text = "hello world";
      const result = trimSelection(text, { anchorIdx: 3, headIdx: 2 });
      expect(result).toEqual({ anchorIdx: 3, headIdx: 2 });
    });

    it("should handle single whitespace character selection", () => {
      const text = "hello world";
      const result = trimSelection(text, { anchorIdx: 6, headIdx: 5 });
      expect(result).toEqual({ anchorIdx: 6, headIdx: 6 });
    });
  });
});
