import { OpenAI, ClientOptions as OpenAIOptions } from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { UserPromptOptions } from "../main";
import { prepareUserContent } from "../utils/prepareUserContent/prepareUserContent";
import { getInternalSystemPrompt } from "./getInternalSystemPrompt";

export const INTERNAL_SYSTEM_PROMPT_SECTION_TITLE = "INTERNAL SYSTEM PROMPT";
export const USER_PROMPT_SECTION_TITLE = "USER PROMPT";
export const USER_CONTENT_SECTION_TITLE = "USER CONTENT";

export type SelectionParams = {
  readonly startIdx: number;
  readonly endIdx: number;
};

export type UserContentParams = {
  readonly fileContent: string;
  readonly selection: SelectionParams;
};

type GetResponseParams = {
  readonly userPromptString: string;
  readonly userContentParams: UserContentParams;
  readonly userPromptOptions: UserPromptOptions;
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
    userContentParams,
    userPromptString,
    userPromptOptions,
  }: GetResponseParams) {
    const { selection } = userContentParams;
    const { userContentString } = prepareUserContent({
      userContentParams,
      userPromptOptions,
    });

    const internalSystemPrompt = getInternalSystemPrompt({
      selection,
    });

    const internalSystemPromptSection =
      `# ${INTERNAL_SYSTEM_PROMPT_SECTION_TITLE}:\n\n` + internalSystemPrompt;
    const userPromptSection =
      `# ${USER_PROMPT_SECTION_TITLE}:\n\n` + userPromptString;
    const userContentSection =
      `# ${USER_CONTENT_SECTION_TITLE}:\n\n` + userContentString;

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: internalSystemPromptSection,
      },
      {
        role: "system",
        content: userPromptSection,
      },
      {
        role: "user",
        content: userContentSection,
      },
    ];

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages,
      stream: true,
    });

    for await (const chunk of response) {
      if (chunk.choices[0]?.delta.content) {
        yield chunk.choices[0]?.delta.content;
      }
    }
  }
}
