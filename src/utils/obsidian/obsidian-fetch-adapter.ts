import { requestUrl } from "obsidian";

/**
 * Adapter for fetch that uses obsidian's requestUrl under the hood.
 * Plugin creators are supposed to use requestUrl to avoid CORS issues and things like that.
 */
export const obsidianFetchAdapter: typeof fetch = async (url, options) => {
  const response = await requestUrl({
    url: url.toString(),
    method: options?.method ?? "GET",
    headers: mapHeaders(options?.headers),
    body: options?.body?.toString() ?? "",
    throw: false,
  });

  return new Response(response.text, {
    status: response.status,
    headers: response.headers,
  });
};

function mapHeaders(headers: HeadersInit | undefined): Record<string, string> {
  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  } else if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }

  return {};
}
