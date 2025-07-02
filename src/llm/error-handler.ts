import { ErrorNotificationOptions } from "../ui/user-notifications";

function handleAuthenticationError(): ErrorNotificationOptions {
  return {
    title: "🔑 Authentication Error",
    message: "Your API key is invalid or has expired.",
    suggestions: [
      "Check your API key in Settings → LLM Shortcut",
      "Generate a new API key from your provider",
      "Ensure the API key is copied correctly",
    ],
  };
}

function handleRateLimitError(): ErrorNotificationOptions {
  return {
    title: "⏱️ Rate Limit Exceeded",
    message:
      "You've exceeded the rate limit for your API plan. Please wait before trying again.",
    suggestions: [
      "Check your provider's rate limits",
      "Reduce the frequency of your requests",
    ],
  };
}

function handleModelNotFoundError(): ErrorNotificationOptions {
  return {
    title: "🤖 Not Found",
    suggestions: [
      "Check the model name in your settings",
      "Make sure you've used the correct Base URL",
    ],
  };
}

function handleInsufficientQuotaError(): ErrorNotificationOptions {
  return {
    title: "💰 Insufficient Quota",
    message: "You've exceeded your API usage quota or credit limit.",
    suggestions: ["Check your account balance with your provider"],
  };
}

function handleBadRequestError(): ErrorNotificationOptions {
  return {
    title: "❌ Bad Request",
    message: "The request was malformed or contains invalid parameters.",
    suggestions: ["Verify your API configuration in plugin settings"],
  };
}

function handlePermissionDeniedError(): ErrorNotificationOptions {
  return {
    title: "🚫 Permission Denied",
    message: "You don't have permission to use this model or feature.",
    suggestions: [
      "Check if your account has access to the requested model",
      "Contact your provider to enable the required features",
      "Try using a different model that's available to your account",
    ],
  };
}

const STATUS_CODE_HANDLERS: Record<number, () => ErrorNotificationOptions> = {
  401: handleAuthenticationError,
  429: handleRateLimitError,
  404: handleModelNotFoundError,
  402: handleInsufficientQuotaError,
  400: handleBadRequestError,
  403: handlePermissionDeniedError,
};

export function mapLlmErrorToReadable(
  error: unknown,
): ErrorNotificationOptions {
  if (isStatusCodeError(error)) {
    const status = error.status;
    if (status && STATUS_CODE_HANDLERS[status]) {
      return STATUS_CODE_HANDLERS[status]();
    }
  }

  return {
    title:
      "❌ Unexpected Error" +
      (error instanceof Error ? ": " + error.message : ""),
    suggestions: [
      "Check your plugin settings",
      "Restart the plugin",
      "Check your connection to the provider's endpoint",
    ],
  };
}

function isStatusCodeError(error: unknown): error is { status: number } {
  return (
    error != null &&
    typeof error === "object" &&
    "status" in error &&
    typeof error.status === "number"
  );
}
