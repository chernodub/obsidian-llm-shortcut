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

  describe("isBackward", () => {
    it("returns false when anchor is before head on the same line", () => {
      const text = "Hello world";
      const range: TextSelection = {
        anchor: { line: 0, ch: 0 },
        head: { line: 0, ch: 5 },
      };
      const selection = new UserContentSelection(text, range);
      expect(selection.isBackward()).toBe(false);
    });

    it("returns true when anchor is after head on the same line", () => {
      const text = "Hello world";
      const range: TextSelection = {
        anchor: { line: 0, ch: 11 },
        head: { line: 0, ch: 6 },
      };
      const selection = new UserContentSelection(text, range);
      expect(selection.isBackward()).toBe(true);
    });

    it("returns false when anchor and head are the same position (empty selection)", () => {
      const text = "Hello world";
      const range: TextSelection = {
        anchor: { line: 0, ch: 5 },
        head: { line: 0, ch: 5 },
      };
      const selection = new UserContentSelection(text, range);
      expect(selection.isBackward()).toBe(false);
    });

    it("returns false when anchor is on an earlier line than head", () => {
      const text = "Line one\nLine two\nLine three";
      const range: TextSelection = {
        anchor: { line: 0, ch: 2 },
        head: { line: 1, ch: 3 },
      };
      const selection = new UserContentSelection(text, range);
      expect(selection.isBackward()).toBe(false);
    });

    it("returns true when anchor is on a later line than head", () => {
      const text = "Line one\nLine two\nLine three";
      const range: TextSelection = {
        anchor: { line: 2, ch: 2 },
        head: { line: 0, ch: 2 },
      };
      const selection = new UserContentSelection(text, range);
      expect(selection.isBackward()).toBe(true);
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

    it("trims leading and trailing whitespace from forward selection", () => {
      const text = "   hello world   ";
      const range: TextSelection = {
        anchor: { line: 0, ch: 0 },
        head: { line: 0, ch: 17 },
      };
      const selection = new UserContentSelection(text, range);
      const trimmed = selection.trim();
      expect(trimmed.getRange()).toEqual({ from: 3, to: 14 });
      expect(trimmed.isBackward()).toBe(false);
      expect(trimmed.getSelectionIdxs()).toEqual({
        anchorIdx: 3,
        headIdx: 14,
      });
    });

    it("preserves backward direction when head is before anchor (no whitespace)", () => {
      const text = "Hello world";
      const range: TextSelection = {
        anchor: { line: 0, ch: 11 },
        head: { line: 0, ch: 6 },
      };
      const selection = new UserContentSelection(text, range);
      expect(selection.isBackward()).toBe(true);
      const trimmed = selection.trim();
      expect(trimmed.isBackward()).toBe(true);
      expect(trimmed.getRange()).toEqual({ from: 6, to: 11 });
      expect(trimmed.getSelectionIdxs()).toEqual({
        anchorIdx: 11,
        headIdx: 6,
      });
    });

    it("preserves backward direction when head is before anchor and trims whitespace", () => {
      const text = "   hello world   ";
      const range: TextSelection = {
        anchor: { line: 0, ch: 17 },
        head: { line: 0, ch: 0 },
      };
      const selection = new UserContentSelection(text, range);
      expect(selection.isBackward()).toBe(true);
      const trimmed = selection.trim();
      expect(trimmed.isBackward()).toBe(true);
      expect(trimmed.getRange()).toEqual({ from: 3, to: 14 });
      expect(trimmed.getSelectionIdxs()).toEqual({
        anchorIdx: 14,
        headIdx: 3,
      });
    });

    it("preserves backward direction across lines after trim", () => {
      const text = "Line one\nLine two";
      const range: TextSelection = {
        anchor: { line: 1, ch: 8 },
        head: { line: 0, ch: 0 },
      };
      const selection = new UserContentSelection(text, range);
      expect(selection.isBackward()).toBe(true);
      const trimmed = selection.trim();
      expect(trimmed.isBackward()).toBe(true);
      expect(trimmed.getRange()).toEqual({ from: 0, to: 17 });
    });

    it("trims only leading whitespace in forward selection", () => {
      const text = "   hello world";
      const range: TextSelection = {
        anchor: { line: 0, ch: 0 },
        head: { line: 0, ch: 14 },
      };
      const selection = new UserContentSelection(text, range);
      const trimmed = selection.trim();
      expect(trimmed.getRange()).toEqual({ from: 3, to: 14 });
      expect(trimmed.isBackward()).toBe(false);
    });

    it("trims only trailing whitespace in backward selection", () => {
      const text = "hello world   ";
      const range: TextSelection = {
        anchor: { line: 0, ch: 14 },
        head: { line: 0, ch: 0 },
      };
      const selection = new UserContentSelection(text, range);
      const trimmed = selection.trim();
      expect(trimmed.getRange()).toEqual({ from: 0, to: 11 });
      expect(trimmed.isBackward()).toBe(true);
      expect(trimmed.getSelectionIdxs()).toEqual({
        anchorIdx: 11,
        headIdx: 0,
      });
    });
  });
});
