import { EditorPosition } from "obsidian";
import { NEWLINE_SYMBOL } from "../../constants";

export function mapCursorPositionToIdx(text: string, cursor: EditorPosition) {
  const lines = text.split(NEWLINE_SYMBOL);

  let idx = 0;
  for (let i = 0; i < cursor.line; i++) {
    idx += (lines[i]?.length ?? 0) + 1;
  }
  idx += cursor.ch;

  return idx;
}
