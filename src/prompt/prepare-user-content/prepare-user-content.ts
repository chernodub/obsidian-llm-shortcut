import {
  CARET_MACROS,
  SELECTION_END_MACROS,
  SELECTION_START_MACROS,
} from "../constants";
import {
  TextSelectionRange,
  UserContentSelection,
} from "../user-content-selection/user-content-selection";
import { UserPromptOptions } from "../user-prompt-options";

function getContextAroundSelection({
  text,
  selectionRange: { from, to },
  userPromptOptions: { contextSizeBefore, contextSizeAfter },
}: {
  text: string;
  selectionRange: TextSelectionRange;
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
    const contentLengthAfter = text.length - to;
    if (contentLengthAfter > contextSizeAfter) {
      ignoredSizeAfterContext = contentLengthAfter - contextSizeAfter;
    }
  }

  const contentBefore = text.slice(ignoredSizeBeforeContext, from);
  const contentAfter = text.slice(to, text.length - ignoredSizeAfterContext);

  return {
    contentBefore,
    contentAfter,
  };
}

function getSelectedContentWithMacros({
  text,
  selectionRange: { from, to },
}: {
  text: string;
  selectionRange: TextSelectionRange;
}): string {
  return from === to
    ? CARET_MACROS
    : SELECTION_START_MACROS + text.slice(from, to) + SELECTION_END_MACROS;
}

export function prepareUserContent({
  userContentSelection,
  userPromptOptions,
}: {
  userContentSelection: UserContentSelection;
  userPromptOptions: UserPromptOptions;
}): string {
  const selectionRange = userContentSelection.getRange();
  const text = userContentSelection.getText();

  const { contentBefore, contentAfter } = getContextAroundSelection({
    text,
    selectionRange,
    userPromptOptions,
  });

  const contentWithMacros = getSelectedContentWithMacros({
    text,
    selectionRange,
  });

  return contentBefore + contentWithMacros + contentAfter;
}
