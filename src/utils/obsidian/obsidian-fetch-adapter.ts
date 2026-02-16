import { requestUrl } from "obsidian";
import { AbortError } from "../abort-error";

/**
 * Adapter for fetch that uses obsidian's requestUrl under the hood.
 * Plugin creators are supposed to use requestUrl to avoid CORS issues and things like that.
 */
export const obsidianFetchAdapter: typeof fetch = async (url, options) => {
  if (options?.signal?.aborted) {
    throw new AbortError();
  }

  const response = await requestWithAbort(
    requestUrl({
      url: url.toString(),
      method: options?.method ?? "GET",
      headers: mapHeaders(options?.headers),
      body: options?.body?.toString() ?? "",
      throw: false,
    }),
    options?.signal,
  );

  return new Response(response.text, {
    status: response.status,
    headers: response.headers,
  });
};

async function requestWithAbort<T>(
  request: Promise<T>,
  signal?: AbortSignal | null,
): Promise<T> {
  if (!signal) {
    return request;
  }

  if (signal.aborted) {
    throw new AbortError();
  }

  // requestUrl does not currently support aborting the in-flight request directly.
  // This allows upstream cancellation flow to stop awaiting the response immediately.
  let rejectOnAbort: (() => void) | undefined;
  const abortPromise = new Promise<never>((_, reject) => {
    rejectOnAbort = () => reject(new AbortError());
    signal.addEventListener("abort", rejectOnAbort);
  });

  try {
    return await Promise.race([request, abortPromise]);
  } finally {
    if (rejectOnAbort) {
      signal.removeEventListener("abort", rejectOnAbort);
    }
  }
}

function mapHeaders(headers: HeadersInit | undefined): Record<string, string> {
  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  } else if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }

  return {};
}
