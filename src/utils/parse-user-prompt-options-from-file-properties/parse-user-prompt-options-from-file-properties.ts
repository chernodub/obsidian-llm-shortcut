import { FrontMatterCache } from "obsidian";
import { DEFAULT_USER_PROMPT_OPTIONS, UserPromptOptions } from "../constants";

export const SELECTION_MODE_PROP_NAME = "llm-shortcut-selection-mode";
export const SELECTION_ONLY_PROP_VALUE = "selection-only";

export const CONTEXT_SIZE_BEFORE_SELECTION_PROP_NAME =
  "llm-shortcut-context-size-before-selection";
export const CONTEXT_SIZE_AFTER_SELECTION_PROP_NAME =
  "llm-shortcut-context-size-after-selection";

function parseNumericFileProperty(
  fileProperties: FrontMatterCache,
  propertyName: string,
): number | undefined {
  const value = fileProperties[propertyName];

  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new Error(
      `Invalid prompt file property=[${propertyName}] unknown value type [${value}]`,
    );
  }

  const int = parseInt(value, 10);
  if (int.toString(10) !== value) {
    throw new Error(
      `Invalid prompt file property=[${propertyName}] value should be an integer, but got [${value}]`,
    );
  }

  if (int < 0) {
    throw new Error(
      `Invalid prompt file property=[${propertyName}] value should be positive, but got [${value}]`,
    );
  }

  return int;
}

export function parseUserPromptOptionsFromFileProperties(
  fileProperties: FrontMatterCache,
): UserPromptOptions {
  let shouldHandleSelectionOnly: boolean;
  const shouldHandleSelectionOnlyValue =
    fileProperties[SELECTION_MODE_PROP_NAME];
  if (shouldHandleSelectionOnlyValue === undefined) {
    shouldHandleSelectionOnly =
      DEFAULT_USER_PROMPT_OPTIONS.shouldHandleSelectionOnly;
  } else if (shouldHandleSelectionOnlyValue === SELECTION_ONLY_PROP_VALUE) {
    shouldHandleSelectionOnly = true;
  } else {
    throw new Error(
      `Invalid prompt file property=[${SELECTION_MODE_PROP_NAME}] value should be [${SELECTION_ONLY_PROP_VALUE}], but got [${shouldHandleSelectionOnlyValue}]`,
    );
  }

  return {
    shouldHandleSelectionOnly,
    contextSizeBeforeSelection: parseNumericFileProperty(
      fileProperties,
      CONTEXT_SIZE_BEFORE_SELECTION_PROP_NAME,
    ),
    contextSizeAfterSelection: parseNumericFileProperty(
      fileProperties,
      CONTEXT_SIZE_AFTER_SELECTION_PROP_NAME,
    ),
  };
}
