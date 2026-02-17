import { describe, expect, it } from "vitest";
import { trimSelection } from "./trim-selection";

describe("trimSelection", () => {
  it("should trim whitespace from both start and end", () => {
    const text = "   hello world   ";
    const result = trimSelection(text, { from: 0, to: 17 });
    expect(result).toEqual({ from: 3, to: 14 });
  });

  it("should trim whitespace only from start", () => {
    const text = "   hello world";
    const result = trimSelection(text, { from: 0, to: 14 });
    expect(result).toEqual({ from: 3, to: 14 });
  });

  it("should trim whitespace only from end", () => {
    const text = "hello world   ";
    const result = trimSelection(text, { from: 0, to: 14 });
    expect(result).toEqual({ from: 0, to: 11 });
  });

  it("should not modify indices when there is no whitespace to trim", () => {
    const text = "hello world";
    const result = trimSelection(text, { from: 0, to: 11 });
    expect(result).toEqual({ from: 0, to: 11 });
  });

  it("should handle selection in the middle of text", () => {
    const text = "prefix   hello world   suffix";
    const result = trimSelection(text, { from: 7, to: 20 });
    expect(result).toEqual({ from: 9, to: 20 });
  });

  it("should handle all whitespace selection", () => {
    const text = "   \t\n   ";
    const result = trimSelection(text, { from: 0, to: 6 });
    expect(result).toEqual({ from: 6, to: 6 });
  });

  it("should handle empty selection (startIdx === endIdx)", () => {
    const text = "hello world";
    const result = trimSelection(text, { from: 5, to: 5 });
    expect(result).toEqual({ from: 5, to: 5 });
  });

  it("should handle empty selection with whitespace around", () => {
    const text = "   ";
    const result = trimSelection(text, { from: 0, to: 3 });
    expect(result).toEqual({ from: 3, to: 3 });
  });

  it("should trim different types of whitespace (spaces, tabs, newlines)", () => {
    const text = " \t\n hello \t\n world \t\n ";
    const result = trimSelection(text, { from: 0, to: 20 });
    expect(result).toEqual({ from: 4, to: 18 });
  });

  it("should handle selection that is entirely whitespace", () => {
    const text = "hello   \t\n   world";
    const result = trimSelection(text, { from: 5, to: 12 });
    expect(result).toEqual({ from: 12, to: 12 });
  });

  it("should handle single character selection", () => {
    const text = "hello world";
    const result = trimSelection(text, { from: 2, to: 3 });
    expect(result).toEqual({ from: 2, to: 3 });
  });

  it("should handle single whitespace character selection", () => {
    const text = "hello world";
    const result = trimSelection(text, { from: 5, to: 6 });
    expect(result).toEqual({ from: 6, to: 6 });
  });

  it("should preserve non-whitespace content in the middle", () => {
    const text = "   hello   world   ";
    const result = trimSelection(text, { from: 0, to: 19 });
    expect(result).toEqual({ from: 3, to: 16 });
  });

  it("should handle selection at the beginning of text", () => {
    const text = "   hello";
    const result = trimSelection(text, { from: 0, to: 3 });
    expect(result).toEqual({ from: 3, to: 3 });
  });

  it("should handle selection at the end of text", () => {
    const text = "hello   ";
    const result = trimSelection(text, { from: 5, to: 8 });
    expect(result).toEqual({ from: 8, to: 8 });
  });

  it("should handle multi-line text with whitespace", () => {
    const text = "  line1\n  line2  \n  line3  ";
    const result = trimSelection(text, { from: 0, to: 25 });
    expect(result).toEqual({ from: 2, to: 25 });
  });

  it("should handle selection that starts and ends at same non-whitespace character", () => {
    const text = "hello";
    const result = trimSelection(text, { from: 2, to: 3 });
    expect(result).toEqual({ from: 2, to: 3 });
  });
});
