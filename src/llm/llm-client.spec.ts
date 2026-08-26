import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_PROMPT_OPTIONS } from "../prompt/user-prompt-options";
import { UserContentSelection } from "../prompt/user-content-selection/user-content-selection";
import { LLMClient } from "./llm-client";

const { createChatCompletion } = vi.hoisted(() => ({
  createChatCompletion: vi.fn(),
}));

vi.mock("openai", () => ({
  APIUserAbortError: class extends Error {},
  OpenAI: class {
    chat = {
      completions: {
        create: createChatCompletion,
      },
    };
  },
}));

const userContentSelection = new UserContentSelection("Content", {
  anchor: { line: 0, ch: 0 },
  head: { line: 0, ch: 0 },
});

async function requestResponse(client: LLMClient) {
  const response = client.getResponse({
    userPromptString: "Prompt",
    userContentSelection,
    userPromptOptions: DEFAULT_PROMPT_OPTIONS,
  });

  await response.next();
}

describe("LLMClient reasoning effort", () => {
  beforeEach(() => {
    createChatCompletion.mockReset();
    createChatCompletion.mockResolvedValue(
      (async function* () {
        yield { choices: [{ delta: { content: "Response" } }] };
      })(),
    );
  });

  it("sends the selected reasoning effort", async () => {
    const client = new LLMClient({ apiKey: "key" }, "model", "xhigh");

    await requestResponse(client);

    expect(createChatCompletion).toHaveBeenCalledWith(
      expect.objectContaining({ reasoning_effort: "xhigh" }),
      { signal: undefined },
    );
  });

  it("omits reasoning effort when using the provider default", async () => {
    const client = new LLMClient({ apiKey: "key" }, "model");

    await requestResponse(client);

    const request = createChatCompletion.mock.calls[0]?.[0];
    expect(request).not.toHaveProperty("reasoning_effort");
  });

  it("tests the configured model and reasoning effort", async () => {
    const client = new LLMClient({ apiKey: "key" }, "model", "max");
    const abortController = new AbortController();

    await client.testConnection(abortController.signal);

    expect(createChatCompletion).toHaveBeenCalledWith(
      {
        model: "model",
        messages: [{ role: "user", content: "Reply only with OK." }],
        stream: true,
        reasoning_effort: "max",
      },
      { signal: abortController.signal },
    );
  });
});
