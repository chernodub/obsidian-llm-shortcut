import { UserPromptOptions } from "../main";

export const NEWLINE_SYMBOL = "\n";
export const PLUGIN_NAME = "LLM Shortcut";

export const DEFAULT_USER_PROMPT_OPTIONS: UserPromptOptions = {
  shouldHandleSelectionOnly: false,
  contextSizeBeforeSelection: undefined,
  contextSizeAfterSelection: undefined,
};
