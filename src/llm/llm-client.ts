import { OpenAI, ClientOptions as OpenAIOptions } from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { UserPromptOptions } from "../main";
import { prepareUserContent } from "../utils/prepareUserContent/prepareUserContent";
import { getInternalSystemPrompt } from "./getInternalSystemPrompt";

const USER_PROMPT_PREFIX = `# USER PROMPT: \n\n`;
const USER_CONTENT_PREFIX = `# USER CONTENT: \n\n`;

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
    const userContent = prepareUserContent({
      userContentParams,
      userPromptOptions,
    });

    console.log(userContent);

    const { userContentString } = userContent;

    const internalSystemPrompt = getInternalSystemPrompt({ selection });

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: internalSystemPrompt,
      },
      {
        role: "system",
        content: USER_PROMPT_PREFIX + userPromptString,
      },
      {
        role: "user",
        content: USER_CONTENT_PREFIX + userContentString,
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
