import { UserPromptOptions } from "./user-prompt-options";

export interface UserPromptParams {
  readonly userPromptName: string;
  readonly userPromptString: string;
  readonly userPromptOptions: UserPromptOptions;
}
