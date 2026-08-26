import {
  isReasoningEffort,
  REASONING_EFFORTS,
  type ReasoningEffort,
} from "./reasoning-effort";

export type ModelReasoningSupport =
  | {
      readonly status: "supported";
      readonly efforts: readonly ReasoningEffort[];
    }
  | { readonly status: "unsupported" }
  | {
      readonly status: "unknown";
      readonly reason: "invalid-config" | "lookup-failed" | "not-advertised";
    };

type GetModelReasoningSupportParams = {
  readonly baseUrl: string;
  readonly apiKey: string;
  readonly model: string;
  readonly fetch: typeof globalThis.fetch;
};

export async function getModelReasoningSupport({
  baseUrl,
  apiKey,
  model,
  fetch,
}: GetModelReasoningSupportParams): Promise<ModelReasoningSupport> {
  if (!baseUrl || !model) {
    return { status: "unknown", reason: "invalid-config" };
  }

  let modelsUrl: URL;
  try {
    modelsUrl = new URL(`${baseUrl.replace(/\/$/, "")}/models`);
  } catch {
    return { status: "unknown", reason: "invalid-config" };
  }

  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), 10_000);
  try {
    const response = await fetch(modelsUrl, {
      ...(apiKey
        ? { headers: new Headers({ Authorization: `Bearer ${apiKey}` }) }
        : {}),
      signal: abortController.signal,
    });
    if (!response.ok) {
      return { status: "unknown", reason: "lookup-failed" };
    }

    return parseModelReasoningSupport(await response.json(), model);
  } catch {
    return { status: "unknown", reason: "lookup-failed" };
  } finally {
    clearTimeout(timeout);
  }
}

export function parseModelReasoningSupport(
  response: unknown,
  modelId: string,
): ModelReasoningSupport {
  if (!isRecord(response) || !Array.isArray(response.data)) {
    return { status: "unknown", reason: "not-advertised" };
  }

  const models = response.data.filter(isRecord);
  const model = models.find((candidate) => candidate.id === modelId);
  if (!model) {
    return { status: "unknown", reason: "not-advertised" };
  }

  if (isRecord(model.reasoning)) {
    const supportedEfforts = model.reasoning.supported_efforts;
    if (supportedEfforts === null) {
      return { status: "supported", efforts: REASONING_EFFORTS };
    }
    if (Array.isArray(supportedEfforts)) {
      const efforts = supportedEfforts.filter(isReasoningEffort);
      if (efforts.length > 0) {
        return { status: "supported", efforts };
      }
      return supportedEfforts.length === 0
        ? { status: "unsupported" }
        : { status: "unknown", reason: "not-advertised" };
    }
    return { status: "unknown", reason: "not-advertised" };
  }

  if (Array.isArray(model.supported_parameters)) {
    if (!model.supported_parameters.every((value) => typeof value === "string")) {
      return { status: "unknown", reason: "not-advertised" };
    }
    return model.supported_parameters.includes("reasoning_effort") ||
      model.supported_parameters.includes("reasoning")
      ? { status: "unknown", reason: "not-advertised" }
      : { status: "unsupported" };
  }

  return { status: "unknown", reason: "not-advertised" };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
