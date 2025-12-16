import { getObjectKeys } from "../utils/object/get-object-keys";

/**
 * LLM response processing method
 */
const PromptResponseProcessingMode = {
  /**
   * For selection mode - replace the selection with the LLM response
   * For cursor mode - insert the LLM response at the cursor position
   */
  default: undefined,
  /**
   * Show LLM response in a popup modal
   */
  info: undefined,
} as const;

export const ALL_PROMPT_RESPONSE_PROCESSING_MODES =
  new Set<PromptResponseProcessingMode>(
    getObjectKeys(PromptResponseProcessingMode),
  );

export type PromptResponseProcessingMode =
  keyof typeof PromptResponseProcessingMode;

export interface UserPromptOptions {
  readonly shouldHandleSelectionOnly: true | undefined;
  readonly contextSizeBefore: number | undefined;
  readonly contextSizeAfter: number | undefined;
  readonly promptResponseProcessingMode:
    | PromptResponseProcessingMode
    | undefined;
}

export const DEFAULT_USER_PROMPT_OPTIONS: UserPromptOptions = {
  shouldHandleSelectionOnly: undefined,
  contextSizeBefore: undefined,
  contextSizeAfter: undefined,
  promptResponseProcessingMode: undefined,
};
