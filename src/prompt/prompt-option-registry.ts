import { Setting } from "obsidian";
import {
  ALL_PROMPT_RESPONSE_PROCESSING_MODES,
  PromptOptions,
} from "./user-prompt-options";

interface PromptOptionDefinition<K extends keyof PromptOptions> {
  readonly key: K;
  readonly settingName: string;
  readonly settingDesc: string;
  readonly renderSetting: (
    setting: Setting,
    currentValue: PromptOptions[K],
    onChange: (value: PromptOptions[K]) => void,
  ) => void;
  readonly renderForSettings: (
    setting: Setting,
    getOptions: () => PromptOptions,
    setOptions: (options: PromptOptions) => void,
  ) => void;
}

function renderNumericOption(
  setting: Setting,
  currentValue: number | undefined,
  onChange: (value: number | undefined) => void,
) {
  setting.addText((text) =>
    text
      .setValue(currentValue !== undefined ? String(currentValue) : "")
      .setPlaceholder("Unlimited")
      .onChange((value) => {
        const trimmed = value.trim();
        if (trimmed === "") {
          onChange(undefined);
        } else {
          const num = parseInt(trimmed, 10);
          if (!isNaN(num) && num >= 0) {
            onChange(num);
          }
        }
      }),
  );
}

function defineOption<K extends keyof PromptOptions>(
  def: Omit<PromptOptionDefinition<K>, "renderForSettings">,
): PromptOptionDefinition<K> {
  return {
    ...def,
    renderForSettings(setting, getOptions, setOptions) {
      def.renderSetting(
        setting,
        getOptions()[def.key],
        (value) => setOptions({ ...getOptions(), [def.key]: value }),
      );
    },
  };
}

export const PROMPT_OPTION_DEFINITIONS = [
  defineOption({
    key: "shouldHandleSelectionOnly",
    settingName: "Selection mode",
    settingDesc:
      "Whether prompts require text to be selected. Can be overridden per-prompt via the llm-shortcut-selection-mode file property.",
    renderSetting(setting, currentValue, onChange) {
      setting.addDropdown((dropdown) =>
        dropdown
          .addOptions({
            "false": "Default (allow both)",
            "true": "Selection only",
          })
          .setValue(String(!!currentValue))
          .onChange((value) =>
            onChange(value === "true" ? true : undefined),
          ),
      );
    },
  }),
  defineOption({
    key: "contextSizeBefore",
    settingName: "Context size before selection",
    settingDesc:
      "Number of characters to include before the selection. Leave empty for unlimited. Can be overridden per-prompt via the llm-shortcut-context-size-before file property.",
    renderSetting: renderNumericOption,
  }),
  defineOption({
    key: "contextSizeAfter",
    settingName: "Context size after selection",
    settingDesc:
      "Number of characters to include after the selection. Leave empty for unlimited. Can be overridden per-prompt via the llm-shortcut-context-size-after file property.",
    renderSetting: renderNumericOption,
  }),
  defineOption({
    key: "promptResponseProcessingMode",
    settingName: "Response processing mode",
    settingDesc:
      "How to handle the LLM response. Can be overridden per-prompt via the llm-shortcut-prompt-response-processing-mode file property.",
    renderSetting(setting, currentValue, onChange) {
      const options: Record<string, string> = {};
      for (const mode of ALL_PROMPT_RESPONSE_PROCESSING_MODES) {
        options[mode] =
          mode === "default" ? "Default (replace/insert)" : "Info (popup)";
      }
      setting.addDropdown((dropdown) =>
        dropdown
          .addOptions(options)
          .setValue(currentValue ?? "default")
          .onChange((value) =>
            onChange(
              value === "default"
                ? undefined
                : (value as (typeof ALL_PROMPT_RESPONSE_PROCESSING_MODES)[number]),
            ),
          ),
      );
    },
  }),
] as const;

export function mergePromptOptions(
  globalDefaults: PromptOptions,
  fileOverrides: PromptOptions,
): PromptOptions {
  // Using ?? (nullish coalescing) is safe here because:
  // - shouldHandleSelectionOnly is typed as `true | undefined` (never `false`)
  // - numeric fields use 0 as a valid value, which ?? correctly preserves
  return {
    shouldHandleSelectionOnly:
      fileOverrides.shouldHandleSelectionOnly ??
      globalDefaults.shouldHandleSelectionOnly,
    contextSizeBefore:
      fileOverrides.contextSizeBefore ?? globalDefaults.contextSizeBefore,
    contextSizeAfter:
      fileOverrides.contextSizeAfter ?? globalDefaults.contextSizeAfter,
    promptResponseProcessingMode:
      fileOverrides.promptResponseProcessingMode ??
      globalDefaults.promptResponseProcessingMode,
  };
}
