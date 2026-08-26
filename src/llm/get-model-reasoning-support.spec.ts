import { describe, expect, it, vi } from "vitest";
import {
  getModelReasoningSupport,
  parseModelReasoningSupport,
} from "./get-model-reasoning-support";

describe("getModelReasoningSupport", () => {
  it("requests the provider models endpoint with authentication", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [
            {
              id: "provider/model",
              reasoning: { supported_efforts: ["high"] },
            },
          ],
        }),
      ),
    );

    await expect(
      getModelReasoningSupport({
        baseUrl: "https://provider.example/v1/",
        apiKey: "secret",
        model: "provider/model",
        fetch,
      }),
    ).resolves.toEqual({ status: "supported", efforts: ["high"] });

    expect(fetch).toHaveBeenCalledWith(
      new URL("https://provider.example/v1/models"),
      expect.objectContaining({
        headers: expect.any(Headers),
        signal: expect.any(AbortSignal),
      }),
    );
    const headers = fetch.mock.calls[0]?.[1]?.headers;
    expect(headers instanceof Headers ? headers.get("Authorization") : null).toBe(
      "Bearer secret",
    );
  });
});

describe("parseModelReasoningSupport", () => {
  it("parses all efforts advertised for GPT-5.6 Sol", () => {
    expect(
      parseModelReasoningSupport(
        {
          data: [
            {
              id: "openai/gpt-5.6-sol",
              reasoning: {
                mandatory: false,
                default_enabled: true,
                supported_efforts: [
                  "max",
                  "xhigh",
                  "high",
                  "medium",
                  "low",
                  "none",
                ],
                default_effort: "medium",
              },
            },
          ],
        },
        "openai/gpt-5.6-sol",
      ),
    ).toEqual({
      status: "supported",
      efforts: ["max", "xhigh", "high", "medium", "low", "none"],
    });
  });

  it("returns the reasoning efforts advertised for a model", () => {
    expect(
      parseModelReasoningSupport(
        {
          data: [
            {
              id: "provider/model",
              reasoning: {
                supported_efforts: [
                  "max",
                  "xhigh",
                  "high",
                  "low",
                  "none",
                  "unsupported-value",
                ],
              },
            },
          ],
        },
        "provider/model",
      ),
    ).toEqual({
      status: "supported",
      efforts: ["max", "xhigh", "high", "low", "none"],
    });
  });

  it("supports all efforts when the provider returns null", () => {
    expect(
      parseModelReasoningSupport(
        {
          data: [
            {
              id: "provider/model",
              reasoning: { supported_efforts: null },
            },
          ],
        },
        "provider/model",
      ),
    ).toEqual({
      status: "supported",
      efforts: ["none", "minimal", "low", "medium", "high", "xhigh", "max"],
    });
  });

  it("does not guess levels from a reasoning parameter", () => {
    expect(
      parseModelReasoningSupport(
        {
          data: [
            {
              id: "provider/model",
              supported_parameters: ["temperature", "reasoning"],
            },
          ],
        },
        "provider/model",
      ),
    ).toEqual({ status: "unknown", reason: "not-advertised" });
  });

  it("returns unsupported when provider metadata excludes reasoning", () => {
    expect(
      parseModelReasoningSupport(
        {
          data: [
            { id: "provider/model", supported_parameters: ["temperature"] },
          ],
        },
        "provider/model",
      ),
    ).toEqual({ status: "unsupported" });
  });

  it("does not guess when a provider does not advertise capabilities", () => {
    expect(
      parseModelReasoningSupport(
        { data: [{ id: "provider/model", object: "model" }] },
        "provider/model",
      ),
    ).toEqual({ status: "unknown", reason: "not-advertised" });
  });

  it("does not treat unknown future efforts as unsupported", () => {
    expect(
      parseModelReasoningSupport(
        {
          data: [
            {
              id: "provider/model",
              reasoning: { supported_efforts: ["future-level"] },
            },
          ],
        },
        "provider/model",
      ),
    ).toEqual({ status: "unknown", reason: "not-advertised" });
  });
});
