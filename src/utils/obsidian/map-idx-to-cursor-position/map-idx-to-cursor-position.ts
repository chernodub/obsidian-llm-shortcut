import { EditorPosition } from "obsidian";
import { NEWLINE_SYMBOL } from "../../constants";

export function mapIdxToCursorPosition(
  text: string,
  idx: number,
): EditorPosition {
  const lines = text.split(NEWLINE_SYMBOL);

  let accumulatedLength = 0;
  for (let i = 0; i < lines.length; i++) {
    const lineLength = lines[i]?.length ?? 0;
    const lineWithNewline = lineLength + 1;

    if (accumulatedLength + lineLength >= idx) {
      return {
        line: i,
        ch: idx - accumulatedLength,
      };
    }

    accumulatedLength += lineWithNewline;
  }

  // If index is beyond the text, return the last position
  const lastLine = lines.length - 1;
  return {
    line: lastLine,
    ch: lines[lastLine]?.length ?? 0,
  };
}
