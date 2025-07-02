import { Notice } from "obsidian";
import { NEWLINE_SYMBOL, PLUGIN_NAME } from "../utils/constants";

export interface ErrorNotificationOptions {
  readonly title: string;
  readonly message?: string;
  readonly suggestions?: string[];
}

const TWO_LINE_SEP = NEWLINE_SYMBOL + NEWLINE_SYMBOL;

export function showErrorNotification(
  options: ErrorNotificationOptions,
  timeout: number = 10000,
): void {
  const suggestionsText = options.suggestions
    ?.map((suggestion) => withSeparator(`• ${suggestion}`, NEWLINE_SYMBOL))
    .join("");

  let message = withSeparator(`🤖 ${PLUGIN_NAME} Error:`, TWO_LINE_SEP);
  message += withSeparator(options.title, TWO_LINE_SEP);
  message += withSeparator(options.message, TWO_LINE_SEP);
  message += withSeparator("💡 Suggestions:", TWO_LINE_SEP);
  message += suggestionsText;

  new Notice(message, timeout);
}

function withSeparator(text: string | undefined, separator: string): string {
  return text ? `${text}${separator}` : "";
}
