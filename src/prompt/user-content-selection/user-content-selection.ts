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
    private readonly range: TextSelection,
  ) {}

  public getText(): string {
    return this.text;
  }

  public getSelection(): TextSelection {
    return {
      anchor: this.range.anchor,
      head: this.range.head,
    };
  }

  public isEmpty(): boolean {
    const { anchor, head } = this.range;

    return anchor.line === head.line && anchor.ch === head.ch;
  }

  public isBackward(): boolean {
    const { anchor, head } = this.range;

    if (anchor.line < head.line) return false;
    if (anchor.line > head.line) return true;

    return anchor.ch > head.ch;
  }

  public getSelectionIdxs(): TextSelectionIdxs {
    const { anchor, head } = this.range;
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

  public trim(): UserContentSelection {
    const range = this.getRange();

    const nextRange = trimSelection(this.text, range);

    const nextSelectionIdxs = this.isBackward()
      ? {
          anchorIdx: nextRange.to,
          headIdx: nextRange.from,
        }
      : {
          anchorIdx: nextRange.from,
          headIdx: nextRange.to,
        };

    return new UserContentSelection(this.text, {
      anchor: mapIdxToCursorPosition(this.text, nextSelectionIdxs.anchorIdx),
      head: mapIdxToCursorPosition(this.text, nextSelectionIdxs.headIdx),
    });
  }
}
