import { describe, expect, it } from "vitest";
import { trimSelection } from "./trim-selection";

describe("trimSelection", () => {
  it("should trim whitespace from both start and end", () => {
    const text = "   hello world   ";
    const result = trimSelection(text, { startIdx: 0, endIdx: 17 });
    expect(result).toEqual({ startIdx: 3, endIdx: 14 });
  });

  it("should trim whitespace only from start", () => {
    const text = "   hello world";
    const result = trimSelection(text, { startIdx: 0, endIdx: 14 });
    expect(result).toEqual({ startIdx: 3, endIdx: 14 });
  });

  it("should trim whitespace only from end", () => {
    const text = "hello world   ";
    const result = trimSelection(text, { startIdx: 0, endIdx: 14 });
    expect(result).toEqual({ startIdx: 0, endIdx: 11 });
  });

  it("should not modify indices when there is no whitespace to trim", () => {
    const text = "hello world";
    const result = trimSelection(text, { startIdx: 0, endIdx: 11 });
    expect(result).toEqual({ startIdx: 0, endIdx: 11 });
  });

  it("should handle selection in the middle of text", () => {
    const text = "prefix   hello world   suffix";
    const result = trimSelection(text, { startIdx: 7, endIdx: 20 });
    expect(result).toEqual({ startIdx: 9, endIdx: 20 });
  });

  it("should handle all whitespace selection", () => {
    const text = "   \t\n   ";
    const result = trimSelection(text, { startIdx: 0, endIdx: 6 });
    expect(result).toEqual({ startIdx: 6, endIdx: 6 });
  });

  it("should handle empty selection (startIdx === endIdx)", () => {
    const text = "hello world";
    const result = trimSelection(text, { startIdx: 5, endIdx: 5 });
    expect(result).toEqual({ startIdx: 5, endIdx: 5 });
  });

  it("should handle empty selection with whitespace around", () => {
    const text = "   ";
    const result = trimSelection(text, { startIdx: 0, endIdx: 3 });
    expect(result).toEqual({ startIdx: 3, endIdx: 3 });
  });

  it("should trim different types of whitespace (spaces, tabs, newlines)", () => {
    const text = " \t\n hello \t\n world \t\n ";
    const result = trimSelection(text, { startIdx: 0, endIdx: 20 });
    expect(result).toEqual({ startIdx: 4, endIdx: 18 });
  });

  it("should handle selection that is entirely whitespace", () => {
    const text = "hello   \t\n   world";
    const result = trimSelection(text, { startIdx: 5, endIdx: 12 });
    expect(result).toEqual({ startIdx: 12, endIdx: 12 });
  });

  it("should handle single character selection", () => {
    const text = "hello world";
    const result = trimSelection(text, { startIdx: 2, endIdx: 3 });
    expect(result).toEqual({ startIdx: 2, endIdx: 3 });
  });

  it("should handle single whitespace character selection", () => {
    const text = "hello world";
    const result = trimSelection(text, { startIdx: 5, endIdx: 6 });
    expect(result).toEqual({ startIdx: 6, endIdx: 6 });
  });

  it("should preserve non-whitespace content in the middle", () => {
    const text = "   hello   world   ";
    const result = trimSelection(text, { startIdx: 0, endIdx: 19 });
    expect(result).toEqual({ startIdx: 3, endIdx: 16 });
  });

  it("should handle selection at the beginning of text", () => {
    const text = "   hello";
    const result = trimSelection(text, { startIdx: 0, endIdx: 3 });
    expect(result).toEqual({ startIdx: 3, endIdx: 3 });
  });

  it("should handle selection at the end of text", () => {
    const text = "hello   ";
    const result = trimSelection(text, { startIdx: 5, endIdx: 8 });
    expect(result).toEqual({ startIdx: 8, endIdx: 8 });
  });

  it("should handle multi-line text with whitespace", () => {
    const text = "  line1\n  line2  \n  line3  ";
    const result = trimSelection(text, { startIdx: 0, endIdx: 25 });
    expect(result).toEqual({ startIdx: 2, endIdx: 25 });
  });

  it("should handle selection that starts and ends at same non-whitespace character", () => {
    const text = "hello";
    const result = trimSelection(text, { startIdx: 2, endIdx: 3 });
    expect(result).toEqual({ startIdx: 2, endIdx: 3 });
  });
});
