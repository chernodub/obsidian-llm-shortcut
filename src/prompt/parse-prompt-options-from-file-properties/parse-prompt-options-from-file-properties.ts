import { FrontMatterCache } from "obsidian";
import {
  ALL_PROMPT_RESPONSE_PROCESSING_MODES,
  DEFAULT_PROMPT_OPTIONS,
  PromptResponseProcessingMode,
  PromptOptions,
} from "../user-prompt-options";

export const SELECTION_MODE_PROP_NAME = "llm-shortcut-selection-mode";
export const SELECTION_ONLY_PROP_VALUE = "selection-only";

export const CONTEXT_SIZE_BEFORE_PROP_NAME = "llm-shortcut-context-size-before";
export const CONTEXT_SIZE_AFTER_PROP_NAME = "llm-shortcut-context-size-after";

export const PROMPT_RESPONSE_PROCESSING_MODE_PROP_NAME =
  "llm-shortcut-prompt-response-processing-mode";

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

export function parsePromptOptionsFromFileProperties(
  fileProperties: FrontMatterCache,
): PromptOptions {
  let shouldHandleSelectionOnly: true | undefined;
  const shouldHandleSelectionOnlyValue =
    fileProperties[SELECTION_MODE_PROP_NAME];
  if (shouldHandleSelectionOnlyValue === undefined) {
    shouldHandleSelectionOnly =
      DEFAULT_PROMPT_OPTIONS.shouldHandleSelectionOnly;
  } else if (shouldHandleSelectionOnlyValue === SELECTION_ONLY_PROP_VALUE) {
    shouldHandleSelectionOnly = true;
  } else {
    throw new Error(
      `Invalid prompt file property=[${SELECTION_MODE_PROP_NAME}] value should be [${SELECTION_ONLY_PROP_VALUE}], but got [${shouldHandleSelectionOnlyValue}]`,
    );
  }

  let promptResponseProcessingMode: PromptResponseProcessingMode | undefined;
  const promptResponseProcessingModeValue =
    fileProperties[PROMPT_RESPONSE_PROCESSING_MODE_PROP_NAME];
  if (promptResponseProcessingModeValue === undefined) {
    promptResponseProcessingMode =
      DEFAULT_PROMPT_OPTIONS.promptResponseProcessingMode;
  } else if (
    ALL_PROMPT_RESPONSE_PROCESSING_MODES.includes(
      promptResponseProcessingModeValue,
    )
  ) {
    promptResponseProcessingMode = promptResponseProcessingModeValue;
  } else {
    throw new Error(
      `Invalid prompt file property=[${PROMPT_RESPONSE_PROCESSING_MODE_PROP_NAME}] value should be one of the values [${[...ALL_PROMPT_RESPONSE_PROCESSING_MODES.values()]}], but got [${promptResponseProcessingModeValue}]`,
    );
  }

  return {
    shouldHandleSelectionOnly,
    contextSizeBefore: parseNumericFileProperty(
      fileProperties,
      CONTEXT_SIZE_BEFORE_PROP_NAME,
    ),
    contextSizeAfter: parseNumericFileProperty(
      fileProperties,
      CONTEXT_SIZE_AFTER_PROP_NAME,
    ),
    promptResponseProcessingMode,
  };
}
