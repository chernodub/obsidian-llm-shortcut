import { UserContentSelectionParams } from "../../../prompt/user-content-params";

export function trimSelection(
  text: string,
  { anchorIdx, headIdx }: UserContentSelectionParams,
): UserContentSelectionParams {
  let from = Math.min(anchorIdx, headIdx);
  let to = Math.max(anchorIdx, headIdx);
  const isSpace = (i: number) => /\s/.test(text[i]!);

  while (from < to && isSpace(from)) from++;
  while (from < to && isSpace(to - 1)) to--;

  const backward = anchorIdx > headIdx;
  return {
    anchorIdx: backward ? to : from,
    headIdx: backward ? from : to,
  };
}
