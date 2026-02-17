import { describe, expect, it } from "vitest";
import {
  TextSelection,
  UserContentSelection,
} from "./user-content-selection";

describe("UserContentSelection", () => {
  describe("getText", () => {
    it("returns the stored text", () => {
      const text = "Hello world";
      const range: TextSelection = {
        anchor: { line: 0, ch: 0 },
        head: { line: 0, ch: 5 },
      };
      const selection = new UserContentSelection(text, range);
      expect(selection.getText()).toBe(text);
    });

    it("returns multi-line text", () => {
      const text = "Line one\nLine two";
      const range: TextSelection = {
        anchor: { line: 0, ch: 0 },
        head: { line: 1, ch: 0 },
      };
      const selection = new UserContentSelection(text, range);
      expect(selection.getText()).toBe(text);
    });
  });

  describe("getSelection", () => {
    it("returns anchor and head positions", () => {
      const text = "Hello world";
      const range: TextSelection = {
        anchor: { line: 0, ch: 6 },
        head: { line: 0, ch: 11 },
      };
      const selection = new UserContentSelection(text, range);
      const result = selection.getSelection();
      expect(result.anchor).toEqual({ line: 0, ch: 6 });
      expect(result.head).toEqual({ line: 0, ch: 11 });
    });
  });

  describe("isEmpty", () => {
    it("returns true when anchor and head are the same position", () => {
      const text = "Hello world";
      const range: TextSelection = {
        anchor: { line: 0, ch: 5 },
        head: { line: 0, ch: 5 },
      };
      const selection = new UserContentSelection(text, range);
      expect(selection.isEmpty()).toBe(true);
    });

    it("returns true for cursor at start of empty text", () => {
      const text = "";
      const range: TextSelection = {
        anchor: { line: 0, ch: 0 },
        head: { line: 0, ch: 0 },
      };
      const selection = new UserContentSelection(text, range);
      expect(selection.isEmpty()).toBe(true);
    });

    it("returns false when anchor and head differ by column", () => {
      const text = "Hello world";
      const range: TextSelection = {
        anchor: { line: 0, ch: 0 },
        head: { line: 0, ch: 5 },
      };
      const selection = new UserContentSelection(text, range);
      expect(selection.isEmpty()).toBe(false);
    });

    it("returns false when anchor and head differ by line", () => {
      const text = "Hello\nWorld";
      const range: TextSelection = {
        anchor: { line: 0, ch: 0 },
        head: { line: 1, ch: 0 },
      };
      const selection = new UserContentSelection(text, range);
      expect(selection.isEmpty()).toBe(false);
    });
  });

  describe("getSelectionIdxs", () => {
    it("maps anchor and head positions to character indices on a single line", () => {
      const text = "Hello world";
      const range: TextSelection = {
        anchor: { line: 0, ch: 6 },
        head: { line: 0, ch: 11 },
      };
      const selection = new UserContentSelection(text, range);
      const result = selection.getSelectionIdxs();
      expect(result.anchorIdx).toBe(6);
      expect(result.headIdx).toBe(11);
    });

    it("maps positions correctly when head is before anchor (reverse selection)", () => {
      const text = "Hello world";
      const range: TextSelection = {
        anchor: { line: 0, ch: 11 },
        head: { line: 0, ch: 6 },
      };
      const selection = new UserContentSelection(text, range);
      const result = selection.getSelectionIdxs();
      expect(result.anchorIdx).toBe(11);
      expect(result.headIdx).toBe(6);
    });

    it("maps positions correctly for multi-line text", () => {
      const text = "Hello\nWorld";
      const range: TextSelection = {
        anchor: { line: 0, ch: 0 },
        head: { line: 1, ch: 5 },
      };
      const selection = new UserContentSelection(text, range);
      const result = selection.getSelectionIdxs();
      expect(result.anchorIdx).toBe(0);
      expect(result.headIdx).toBe(11);
    });

    it("returns same index for both when selection is empty", () => {
      const text = "Hello world";
      const range: TextSelection = {
        anchor: { line: 0, ch: 5 },
        head: { line: 0, ch: 5 },
      };
      const selection = new UserContentSelection(text, range);
      const result = selection.getSelectionIdxs();
      expect(result.anchorIdx).toBe(5);
      expect(result.headIdx).toBe(5);
    });
  });

  describe("getRange", () => {
    it("returns from and to as min and max of anchor and head indices", () => {
      const text = "Hello world";
      const range: TextSelection = {
        anchor: { line: 0, ch: 6 },
        head: { line: 0, ch: 11 },
      };
      const selection = new UserContentSelection(text, range);
      const result = selection.getRange();
      expect(result.from).toBe(6);
      expect(result.to).toBe(11);
    });

    it("normalizes range when head is before anchor", () => {
      const text = "Hello world";
      const range: TextSelection = {
        anchor: { line: 0, ch: 11 },
        head: { line: 0, ch: 6 },
      };
      const selection = new UserContentSelection(text, range);
      const result = selection.getRange();
      expect(result.from).toBe(6);
      expect(result.to).toBe(11);
    });

    it("returns same from and to for empty selection", () => {
      const text = "Hello world";
      const range: TextSelection = {
        anchor: { line: 0, ch: 5 },
        head: { line: 0, ch: 5 },
      };
      const selection = new UserContentSelection(text, range);
      const result = selection.getRange();
      expect(result.from).toBe(5);
      expect(result.to).toBe(5);
    });
  });

  describe("trim", () => {
    it("returns a new UserContentSelection instance", () => {
      const text = "Hello world";
      const range: TextSelection = {
        anchor: { line: 0, ch: 6 },
        head: { line: 0, ch: 11 },
      };
      const selection = new UserContentSelection(text, range);
      const trimmed = selection.trim();
      expect(trimmed).not.toBe(selection);
      expect(trimmed).toBeInstanceOf(UserContentSelection);
    });

    it("preserves text", () => {
      const text = "Hello world";
      const range: TextSelection = {
        anchor: { line: 0, ch: 6 },
        head: { line: 0, ch: 11 },
      };
      const selection = new UserContentSelection(text, range);
      const trimmed = selection.trim();
      expect(trimmed.getText()).toBe(text);
    });

    it("preserves the same range (from/to)", () => {
      const text = "Hello\nWorld";
      const range: TextSelection = {
        anchor: { line: 0, ch: 2 },
        head: { line: 1, ch: 3 },
      };
      const selection = new UserContentSelection(text, range);
      const trimmed = selection.trim();
      expect(trimmed.getRange()).toEqual(selection.getRange());
    });

    it("preserves empty selection", () => {
      const text = "Hello world";
      const range: TextSelection = {
        anchor: { line: 0, ch: 5 },
        head: { line: 0, ch: 5 },
      };
      const selection = new UserContentSelection(text, range);
      const trimmed = selection.trim();
      expect(trimmed.isEmpty()).toBe(true);
      expect(trimmed.getRange()).toEqual(selection.getRange());
    });
  });
});
