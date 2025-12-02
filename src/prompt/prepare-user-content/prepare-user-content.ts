import {
  CARET_MACROS,
  SELECTION_END_MACROS,
  SELECTION_START_MACROS,
} from "../constants";
import { UserContentParams } from "../user-content-params";
import { UserPromptOptions } from "../user-prompt-options";

export function cropContextAroundSelection({
  userContentParams: { fileContent, selection },
  userPromptOptions: { contextSizeBefore, contextSizeAfter },
}: {
  userContentParams: UserContentParams;
  userPromptOptions: UserPromptOptions;
}): {
  contentBefore: string;
  contentAfter: string;
} {
  let ignoredSizeBeforeContext = 0;
  if (contextSizeBefore !== undefined) {
    if (selection.startIdx > contextSizeBefore) {
      ignoredSizeBeforeContext = selection.startIdx - contextSizeBefore;
    }
  }

  let ignoredSizeAfterContext = 0;
  if (contextSizeAfter !== undefined) {
    const contentLengthAfter = fileContent.length - selection.endIdx;
    if (contentLengthAfter > contextSizeAfter) {
      ignoredSizeAfterContext = contentLengthAfter - contextSizeAfter;
    }
  }

  const contentBefore = fileContent.slice(
    ignoredSizeBeforeContext,
    selection.startIdx,
  );
  const contentAfter = fileContent.slice(
    selection.endIdx,
    fileContent.length - ignoredSizeAfterContext,
  );

  return {
    contentBefore,
    contentAfter,
  };
}

export function getSelectedContentWithMacros({
  fileContent,
  selection,
}: UserContentParams) {
  return selection.startIdx === selection.endIdx
    ? CARET_MACROS
    : SELECTION_START_MACROS +
        fileContent.slice(selection.startIdx, selection.endIdx) +
        SELECTION_END_MACROS;
}

export function prepareUserContent({
  userContentParams,
  userPromptOptions,
}: {
  userContentParams: UserContentParams;
  userPromptOptions: UserPromptOptions;
}): string {
  const { contentBefore, contentAfter } = cropContextAroundSelection({
    userPromptOptions,
    userContentParams,
  });

  const contentWithMacros = getSelectedContentWithMacros(userContentParams);

  return contentBefore + contentWithMacros + contentAfter;
}
