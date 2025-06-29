import { EditorPosition } from "obsidian";
import { NEWLINE_SYMBOL } from "../constants";

export function mapCursorPositionToIdx(text: string, cursor: EditorPosition) {
  let idx = 0;
  for (let i = 0; i < cursor.line; i++) {
    idx += (text.split(NEWLINE_SYMBOL)[i]?.length ?? 0) + 1;
  }
  idx += cursor.ch;
  return idx;
}
