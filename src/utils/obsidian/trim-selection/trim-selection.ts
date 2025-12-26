import { UserContentSelectionParams } from "../../../prompt/user-content-params";

export function trimSelection(
  text: string,
  { startIdx, endIdx }: UserContentSelectionParams,
): UserContentSelectionParams {
  const isSpaceCharacter = (idx: number) => {
    return /\s/.test(text[idx]!);
  };

  while (startIdx < endIdx && isSpaceCharacter(startIdx)) {
    startIdx++;
  }

  while (startIdx < endIdx && isSpaceCharacter(endIdx - 1)) {
    endIdx--;
  }

  return {
    startIdx,
    endIdx,
  };
}
