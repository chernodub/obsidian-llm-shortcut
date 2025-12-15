import { getObjectKeys } from "../utils/object/get-object-keys";

const PromptModeDict = {
  /**
   * For selection mode - replace the selection with the LLM response
   * For cursor mode - insert the LLM response at the cursor position
   */
  default: undefined,
  /**
   * Show LLM response in a popup window
   */
  info: undefined,
} as const;

export const ALL_PROMPT_MODES = new Set<PromptMode>(
  getObjectKeys(PromptModeDict),
);

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
