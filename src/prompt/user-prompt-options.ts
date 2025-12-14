export const PromptModeDict = {
  /**
   * (Default)
   * Replace the selection with the LLM response
   * If there is no selection, insert the LLM response at the cursor position (replace nothing)
   */
  replace: undefined,
  /**
   * Show LLM response in a popup window
   */
  info: undefined,
} as const;

export type PromptMode = keyof typeof PromptModeDict;

export interface UserPromptOptions {
  readonly shouldHandleSelectionOnly: true | undefined;
  readonly contextSizeBefore: number | undefined;
  readonly contextSizeAfter: number | undefined;
  readonly promptMode: PromptMode | undefined;
}

export const DEFAULT_USER_PROMPT_OPTIONS: UserPromptOptions = {
  shouldHandleSelectionOnly: undefined,
  contextSizeBefore: undefined,
  contextSizeAfter: undefined,
  promptMode: undefined,
};
