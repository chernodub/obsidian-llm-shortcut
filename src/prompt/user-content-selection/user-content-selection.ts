import { EditorPosition } from "obsidian";
import { mapCursorPositionToIdx } from "../../utils/obsidian/map-cursor-position-to-idx/map-cursor-position-to-idx";
import { mapIdxToCursorPosition } from "../../utils/obsidian/map-idx-to-cursor-position/map-idx-to-cursor-position";
import { trimSelection } from "../../utils/obsidian/trim-selection/trim-selection";

export type TextSelection = {
  readonly anchor: EditorPosition;
  readonly head: EditorPosition;
};

export type TextSelectionIdxs = {
  readonly anchorIdx: number;
  readonly headIdx: number;
};

export type TextSelectionRange = {
  readonly from: number;
  readonly to: number;
};

export class UserContentSelection {
  constructor(
    private readonly text: string,
    private readonly selection: TextSelection,
  ) {}

  public getText(): string {
    return this.text;
  }

  public getSelection(): TextSelection {
    return this.selection;
  }

  public isEmpty(): boolean {
    const { anchor, head } = this.selection;

    return anchor.line === head.line && anchor.ch === head.ch;
  }

  public isBackward(): boolean {
    const { anchor, head } = this.selection;

    if (anchor.line < head.line) return false;
    if (anchor.line > head.line) return true;

    return anchor.ch > head.ch;
  }

  public getSelectionIdxs(): TextSelectionIdxs {
    const { anchor, head } = this.selection;

    return {
      anchorIdx: mapCursorPositionToIdx(this.text, anchor),
      headIdx: mapCursorPositionToIdx(this.text, head),
    };
  }

  public getRange(): TextSelectionRange {
    const { anchorIdx, headIdx } = this.getSelectionIdxs();

    return {
      from: Math.min(anchorIdx, headIdx),
      to: Math.max(anchorIdx, headIdx),
    };
  }

  /**
   * @returns a NEW UserContentSelection instance with the trimmed range
   */
  public trim(): UserContentSelection {
    const range = this.getRange();

    const { from, to } = trimSelection(this.text, range);

    const nextSelectionIdxs = this.isBackward()
      ? {
          anchorIdx: to,
          headIdx: from,
        }
      : {
          anchorIdx: from,
          headIdx: to,
        };

    return new UserContentSelection(this.text, {
      anchor: mapIdxToCursorPosition(this.text, nextSelectionIdxs.anchorIdx),
      head: mapIdxToCursorPosition(this.text, nextSelectionIdxs.headIdx),
    });
  }
}
