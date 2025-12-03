export interface UserPromptOptions {
  readonly shouldHandleSelectionOnly: true | undefined;
  readonly contextSizeBefore: number | undefined;
  readonly contextSizeAfter: number | undefined;
}

export const DEFAULT_USER_PROMPT_OPTIONS: UserPromptOptions = {
  shouldHandleSelectionOnly: undefined,
  contextSizeBefore: undefined,
  contextSizeAfter: undefined,
};
