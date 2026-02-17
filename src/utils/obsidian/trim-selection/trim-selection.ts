import { TextSelectionRange } from "../../../prompt/user-content-selection/user-content-selection";

export function trimSelection(
  text: string,
  { from, to }: TextSelectionRange,
): TextSelectionRange {
  const isSpace = (i: number) => /\s/.test(text[i]!);

  while (from < to && isSpace(from)) from++;
  while (from < to && isSpace(to - 1)) to--;

  return {
    from,
    to,
  };
}
