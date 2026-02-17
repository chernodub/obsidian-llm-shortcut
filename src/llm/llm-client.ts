import {
  APIUserAbortError,
  OpenAI,
  ClientOptions as OpenAIOptions,
} from "openai";
import { getInternalSystemPrompt } from "../prompt/get-internal-system-prompt";
import { prepareUserContent } from "../prompt/prepare-user-content/prepare-user-content";
import { UserContentSelection } from "../prompt/user-content-selection/user-content-selection";
import type { PromptOptions } from "../prompt/user-prompt-options";
import { AbortError } from "../utils/abort-error";
import { createOpenAiRequestMessages } from "./create-open-ai-request-messages";

type GetResponseParams = {
  readonly userPromptString: string;
  readonly userContentSelection: UserContentSelection;
  readonly userPromptOptions: PromptOptions;
  readonly signal?: AbortSignal;
};

export class LLMClient {
  private readonly client: OpenAI;

  constructor(
    options: Pick<OpenAIOptions, "apiKey" | "baseURL" | "fetch" | "project">,
    private readonly model: string,
  ) {
    this.client = new OpenAI({
      ...options,
      // So that it would work in the obsidian client
      dangerouslyAllowBrowser: true,
    });
  }

  async *getResponse({
    userContentSelection,
    userPromptString,
    userPromptOptions,
    signal,
  }: GetResponseParams) {
    const userContentString = prepareUserContent({
      userContentSelection,
      userPromptOptions,
    });

    const internalSystemPrompt = getInternalSystemPrompt({
      userContentSelection,
    });

    const messages = createOpenAiRequestMessages({
      internalSystemPrompt: internalSystemPrompt,
      userPrompt: userPromptString,
      userContent: userContentString,
    });

    try {
      const response = await this.client.chat.completions.create(
        {
          model: this.model,
          messages,
          stream: true,
        },
        {
          signal,
        },
      );

      for await (const chunk of response) {
        if (signal?.aborted) {
          throw new AbortError();
        }
        if (chunk.choices[0]?.delta.content) {
          yield chunk.choices[0]?.delta.content;
        }
      }
    } catch (error: unknown) {
      if (error instanceof APIUserAbortError) {
        throw new AbortError();
      }
      throw error;
    }
  }
}
