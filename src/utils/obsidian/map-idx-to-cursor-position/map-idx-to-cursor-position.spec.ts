import { describe, expect, it } from "vitest";
import { mapIdxToCursorPosition } from "./map-idx-to-cursor-position";

describe("mapIdxToCursorPosition", () => {
  it("should map index to cursor position for multi-line text", () => {
    const text = "Hello\nWorld";
    const position = mapIdxToCursorPosition(text, 6);
    expect(position).toEqual({ line: 1, ch: 0 });
  });

  it("should handle index at beginning of first line", () => {
    const text = "Hello\nWorld";
    const position = mapIdxToCursorPosition(text, 0);
    expect(position).toEqual({ line: 0, ch: 0 });
  });

  it("should handle index at end of first line", () => {
    const text = "Hello\nWorld";
    const position = mapIdxToCursorPosition(text, 5);
    expect(position).toEqual({ line: 0, ch: 5 });
  });

  it("should handle index at middle of second line", () => {
    const text = "Hello\nWorld";
    const position = mapIdxToCursorPosition(text, 8);
    expect(position).toEqual({ line: 1, ch: 2 });
  });

  it("should handle index at end of last line", () => {
    const text = "Hello\nWorld";
    const position = mapIdxToCursorPosition(text, 11);
    expect(position).toEqual({ line: 1, ch: 5 });
  });

  it("should handle single line text", () => {
    const text = "Hello World";
    const position = mapIdxToCursorPosition(text, 5);
    expect(position).toEqual({ line: 0, ch: 5 });
  });

  it("should handle empty text", () => {
    const text = "";
    const position = mapIdxToCursorPosition(text, 0);
    expect(position).toEqual({ line: 0, ch: 0 });
  });

  it("should handle text with multiple lines of varying lengths", () => {
    const text = "Short\nVery Long Line\nMedium";
    const position = mapIdxToCursorPosition(text, 10);
    expect(position).toEqual({ line: 1, ch: 4 });
  });

  it("should handle index at newline character position", () => {
    const text = "Hello\nWorld";
    const position = mapIdxToCursorPosition(text, 5);
    expect(position).toEqual({ line: 0, ch: 5 });
  });

  it("should handle text with consecutive newlines", () => {
    const text = "Line1\n\nLine3";
    const position = mapIdxToCursorPosition(text, 7);
    expect(position).toEqual({ line: 2, ch: 0 });
  });

  it("should handle index beyond text length", () => {
    const text = "Hello\nWorld";
    const position = mapIdxToCursorPosition(text, 100);
    expect(position).toEqual({ line: 1, ch: 5 });
  });

  it("should handle index exactly at end of text", () => {
    const text = "Hello\nWorld";
    const position = mapIdxToCursorPosition(text, 11);
    expect(position).toEqual({ line: 1, ch: 5 });
  });

  it("should handle index at start of second line after newline", () => {
    const text = "Line1\nLine2";
    const position = mapIdxToCursorPosition(text, 6);
    expect(position).toEqual({ line: 1, ch: 0 });
  });

  it("should handle text with only newlines", () => {
    const text = "\n\n";
    const position = mapIdxToCursorPosition(text, 1);
    expect(position).toEqual({ line: 1, ch: 0 });
  });

  it("should handle index at first character of first line", () => {
    const text = "Hello\nWorld";
    const position = mapIdxToCursorPosition(text, 1);
    expect(position).toEqual({ line: 0, ch: 1 });
  });
});
