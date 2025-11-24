import { OpenAI, ClientOptions as OpenAIOptions } from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import {
  CARET_MACROS,
  SELECTION_END_MACROS,
  SELECTION_START_MACROS,
} from "./MACROS";
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
  }: GetResponseParams) {
    const userContent = this.insertSelectionMacros(userContentParams);

    const internalSystemPrompt = getInternalSystemPrompt({ userContentParams });

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
        content: userContent,
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

  private insertSelectionMacros({
    fileContent,
    selection,
  }: UserContentParams): string {
    return (
      USER_CONTENT_PREFIX +
      (fileContent.slice(0, selection.startIdx) +
        this.insertSelectionMacroses(fileContent, selection) +
        fileContent.slice(selection.endIdx))
    );
  }

  private insertSelectionMacroses(
    currentContent: string,
    selection: SelectionParams,
  ) {
    if (selection.startIdx === selection.endIdx) {
      return CARET_MACROS;
    }

    return (
      SELECTION_START_MACROS +
      currentContent.slice(selection.startIdx, selection.endIdx) +
      SELECTION_END_MACROS
    );
  }
}
