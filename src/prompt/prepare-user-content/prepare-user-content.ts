import {
  CARET_MACROS,
  SELECTION_END_MACROS,
  SELECTION_START_MACROS,
} from "../../llm/constants";
import { UserContentParams } from "../user-content-params";
import { UserPromptOptions } from "../user-prompt-options";

export type UserContent = {
  ignoredSizeBeforeContext: number;
  ignoredSizeAfterContext: number;
  userContentString: string;
};

export function prepareUserContent({
  userContentParams: { fileContent, selection },
  userPromptOptions: { contextSizeBefore, contextSizeAfter },
}: {
  userContentParams: UserContentParams;
  userPromptOptions: UserPromptOptions;
}): UserContent {
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

  const contentWithMacros =
    selection.startIdx === selection.endIdx
      ? CARET_MACROS
      : SELECTION_START_MACROS +
        fileContent.slice(selection.startIdx, selection.endIdx) +
        SELECTION_END_MACROS;

  return {
    userContentString: contentBefore + contentWithMacros + contentAfter,
    ignoredSizeBeforeContext,
    ignoredSizeAfterContext,
  };
}
