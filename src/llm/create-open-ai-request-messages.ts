import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { getObjectEntries } from "../utils/object/get-object-entries";

export const INTERNAL_SYSTEM_PROMPT_SECTION_TITLE = "INTERNAL SYSTEM PROMPT";
export const USER_PROMPT_SECTION_TITLE = "USER PROMPT";
export const USER_CONTENT_SECTION_TITLE = "USER CONTENT";

export const OPEN_AI_REQUEST_SECTIONS = {
  internalSystemPrompt: {
    role: "system",
    title: INTERNAL_SYSTEM_PROMPT_SECTION_TITLE,
  },
  userPrompt: {
    role: "system",
    title: USER_PROMPT_SECTION_TITLE,
  },
  userContent: {
    role: "user",
    title: USER_CONTENT_SECTION_TITLE,
  },
} satisfies Record<
  string,
  {
    role: "system" | "user";
    title: string;
  }
>;

export type OpenAiRequestSection = keyof typeof OPEN_AI_REQUEST_SECTIONS;

export function createOpenAiRequestMessages(
  sectionsContent: Record<OpenAiRequestSection, string>,
): ChatCompletionMessageParam[] {
  return getObjectEntries(OPEN_AI_REQUEST_SECTIONS).map(
    ([section, { role, title }]) => ({
      role,
      content: `# ${title}:\n\n` + sectionsContent[section],
    }),
  );
}
