export const NEWLINE_SYMBOL = "\n";
export const PLUGIN_NAME = "LLM Shortcut";

export interface UserPromptOptions {
  readonly shouldHandleSelectionOnly: boolean;
  readonly contextSizeBeforeSelection: number | undefined;
  readonly contextSizeAfterSelection: number | undefined;
}

export const DEFAULT_USER_PROMPT_OPTIONS: UserPromptOptions = {
  shouldHandleSelectionOnly: false,
  contextSizeBeforeSelection: undefined,
  contextSizeAfterSelection: undefined,
};
