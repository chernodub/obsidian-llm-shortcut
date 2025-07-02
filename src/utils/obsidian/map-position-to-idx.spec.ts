import { describe, expect, it } from "vitest";
import { mapCursorPositionToIdx } from "./map-position-to-idx.js";

describe("mapCursorPositionToIdx", () => {
  it("should map cursor position to index for multi-line text", () => {
    const text = "Hello\nWorld";
    const cursor = { line: 1, ch: 0 };
    const idx = mapCursorPositionToIdx(text, cursor);
    expect(idx).toBe(6);
  });

  it("should handle cursor at beginning of first line", () => {
    const text = "Hello\nWorld";
    const cursor = { line: 0, ch: 0 };
    const idx = mapCursorPositionToIdx(text, cursor);
    expect(idx).toBe(0);
  });

  it("should handle cursor at end of first line", () => {
    const text = "Hello\nWorld";
    const cursor = { line: 0, ch: 5 };
    const idx = mapCursorPositionToIdx(text, cursor);
    expect(idx).toBe(5);
  });

  it("should handle cursor at middle of second line", () => {
    const text = "Hello\nWorld";
    const cursor = { line: 1, ch: 2 };
    const idx = mapCursorPositionToIdx(text, cursor);
    expect(idx).toBe(8);
  });

  it("should handle cursor at end of last line", () => {
    const text = "Hello\nWorld";
    const cursor = { line: 1, ch: 5 };
    const idx = mapCursorPositionToIdx(text, cursor);
    expect(idx).toBe(11);
  });

  it("should handle single line text", () => {
    const text = "Hello World";
    const cursor = { line: 0, ch: 5 };
    const idx = mapCursorPositionToIdx(text, cursor);
    expect(idx).toBe(5);
  });

  it("should handle empty text", () => {
    const text = "";
    const cursor = { line: 0, ch: 0 };
    const idx = mapCursorPositionToIdx(text, cursor);
    expect(idx).toBe(0);
  });

  it("should handle text with multiple lines of varying lengths", () => {
    const text = "Short\nVery Long Line\nMedium";
    const cursor = { line: 1, ch: 4 };
    const idx = mapCursorPositionToIdx(text, cursor);
    expect(idx).toBe(10);
  });

  it("should handle cursor at newline character", () => {
    const text = "Hello\nWorld";
    const cursor = { line: 0, ch: 5 };
    const idx = mapCursorPositionToIdx(text, cursor);
    expect(idx).toBe(5);
  });

  it("should handle text with consecutive newlines", () => {
    const text = "Line1\n\nLine3";
    const cursor = { line: 2, ch: 0 };
    const idx = mapCursorPositionToIdx(text, cursor);
    expect(idx).toBe(7);
  });
});
