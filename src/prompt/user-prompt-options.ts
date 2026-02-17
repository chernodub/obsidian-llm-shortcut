export const ALL_PROMPT_RESPONSE_PROCESSING_MODES = [
  /**
   * For selection mode - replace the selection with the LLM response
   * For cursor mode - insert the LLM response at the cursor position
   */
  "default",
  /**
   * Show LLM response in a popup modal
   */
  "info",
] as const;

export type PromptResponseProcessingMode =
  (typeof ALL_PROMPT_RESPONSE_PROCESSING_MODES)[number];

export interface PromptOptions {
  readonly shouldHandleSelectionOnly: true | undefined;
  readonly contextSizeBefore: number | undefined;
  readonly contextSizeAfter: number | undefined;
  readonly promptResponseProcessingMode:
    | PromptResponseProcessingMode
    | undefined;
}

export const DEFAULT_PROMPT_OPTIONS: PromptOptions = {
  shouldHandleSelectionOnly: undefined,
  contextSizeBefore: undefined,
  contextSizeAfter: undefined,
  promptResponseProcessingMode: undefined,
};
