import {
  CARET_MACROS,
  SELECTION_END_MACROS,
  SELECTION_START_MACROS,
} from "../../llm/const";
import { UserContentParams } from "../../llm/llm-client";
import { UserPromptOptions } from "../constants";

export type UserContent = {
  ignoredSizeBeforeContext: number;
  ignoredSizeAfterContext: number;
  userContentString: string;
};

export function prepareUserContent({
  userContentParams: { fileContent, selection },
  userPromptOptions: { contextSizeBeforeSelection, contextSizeAfterSelection },
}: {
  userContentParams: UserContentParams;
  userPromptOptions: UserPromptOptions;
}): UserContent {
  let ignoredSizeBeforeContext = 0;
  if (contextSizeBeforeSelection !== undefined) {
    if (selection.startIdx > contextSizeBeforeSelection) {
      ignoredSizeBeforeContext =
        selection.startIdx - contextSizeBeforeSelection;
    }
  }

  let ignoredSizeAfterContext = 0;
  if (contextSizeAfterSelection !== undefined) {
    const contentLengthAfterSelection = fileContent.length - selection.endIdx;
    if (contentLengthAfterSelection > contextSizeAfterSelection) {
      ignoredSizeAfterContext =
        contentLengthAfterSelection - contextSizeAfterSelection;
    }
  }

  const contentBeforeSelection = fileContent.slice(
    ignoredSizeBeforeContext,
    selection.startIdx,
  );
  const contentAfterSelection = fileContent.slice(
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
    userContentString:
      contentBeforeSelection + contentWithMacros + contentAfterSelection,
    ignoredSizeBeforeContext,
    ignoredSizeAfterContext,
  };
}
