export interface UserPromptOptions {
  readonly shouldHandleSelectionOnly: true | undefined;
  readonly contextSizeBeforeSelection: number | undefined;
  readonly contextSizeAfterSelection: number | undefined;
}

export const DEFAULT_USER_PROMPT_OPTIONS: UserPromptOptions = {
  shouldHandleSelectionOnly: undefined,
  contextSizeBeforeSelection: undefined,
  contextSizeAfterSelection: undefined,
};
