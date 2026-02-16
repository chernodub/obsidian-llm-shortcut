import {
  CARET_MACROS,
  SELECTION_END_MACROS,
  SELECTION_START_MACROS,
} from "../constants";
import { UserContentParams } from "../user-content-params";
import { UserPromptOptions } from "../user-prompt-options";

export type SelectionRange = {
  from: number;
  to: number;
};

export function getContextAroundSelection({
  fileContent,
  selectionRange: { from, to },
  userPromptOptions: { contextSizeBefore, contextSizeAfter },
}: {
  fileContent: string;
  selectionRange: SelectionRange;
  userPromptOptions: UserPromptOptions;
}): {
  contentBefore: string;
  contentAfter: string;
} {
  let ignoredSizeBeforeContext = 0;
  if (contextSizeBefore !== undefined) {
    if (from > contextSizeBefore) {
      ignoredSizeBeforeContext = from - contextSizeBefore;
    }
  }

  let ignoredSizeAfterContext = 0;
  if (contextSizeAfter !== undefined) {
    const contentLengthAfter = fileContent.length - to;
    if (contentLengthAfter > contextSizeAfter) {
      ignoredSizeAfterContext = contentLengthAfter - contextSizeAfter;
    }
  }

  const contentBefore = fileContent.slice(
    ignoredSizeBeforeContext,
    from,
  );
  const contentAfter = fileContent.slice(
    to,
    fileContent.length - ignoredSizeAfterContext,
  );

  return {
    contentBefore,
    contentAfter,
  };
}

export function getSelectedContentWithMacros({
  fileContent,
  selectionRange: { from, to },
}: {
  fileContent: string;
  selectionRange: SelectionRange;
}): string {
  return from === to
    ? CARET_MACROS
    : SELECTION_START_MACROS +
        fileContent.slice(from, to) +
        SELECTION_END_MACROS;
}

export function prepareUserContent({
  userContentParams,
  userPromptOptions,
}: {
  userContentParams: UserContentParams;
  userPromptOptions: UserPromptOptions;
}): string {
  const { anchorIdx, headIdx } = userContentParams.selection;
  const from = Math.min(anchorIdx, headIdx);
  const to = Math.max(anchorIdx, headIdx);
  const selectionRange = { from, to };

  const { contentBefore, contentAfter } = getContextAroundSelection({
    userPromptOptions,
    fileContent: userContentParams.fileContent,
    selectionRange,
  });

  const contentWithMacros = getSelectedContentWithMacros({
    fileContent: userContentParams.fileContent,
    selectionRange,
  });

  return contentBefore + contentWithMacros + contentAfter;
}
