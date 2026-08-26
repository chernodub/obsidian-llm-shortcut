import { isReasoningEffort, type ReasoningEffort } from "./llm/reasoning-effort";
import {
  ALL_PROMPT_RESPONSE_PROCESSING_MODES,
  DEFAULT_PROMPT_OPTIONS,
  type PromptOptions,
} from "./prompt/user-prompt-options";

export interface ProviderPreset {
  id: string;
  name: string;
  apiKey: string;
  providerUrl: string;
  model: string;
  reasoningEffort: ReasoningEffort | undefined;
  project: string;
}

export interface PluginSettings {
  presets: ProviderPreset[];
  currentPresetId: string;
  promptLibraryDirectory: string;
  customPromptCommandLabel: string;
  globalPromptOptions: PromptOptions;
}

export function createProviderPreset(
  name: string,
  id: string = createPresetId(),
): ProviderPreset {
  return {
    id,
    name,
    apiKey: "",
    providerUrl: "",
    model: "",
    reasoningEffort: undefined,
    project: "",
  };
}

export function createDefaultSettings(): PluginSettings {
  const preset = createProviderPreset("Default", "default");
  return {
    presets: [preset],
    currentPresetId: preset.id,
    promptLibraryDirectory: "_prompts",
    customPromptCommandLabel: "Custom prompt",
    globalPromptOptions: { ...DEFAULT_PROMPT_OPTIONS },
  };
}

export function getCurrentPreset(settings: PluginSettings): ProviderPreset {
  return (
    settings.presets.find(({ id }) => id === settings.currentPresetId) ??
    settings.presets[0]!
  );
}

export function clonePluginSettings(settings: PluginSettings): PluginSettings {
  return {
    ...settings,
    presets: settings.presets.map((preset) => ({ ...preset })),
    globalPromptOptions: { ...settings.globalPromptOptions },
  };
}

export function migratePluginSettings(data: unknown): PluginSettings {
  const defaults = createDefaultSettings();
  if (!isRecord(data)) return defaults;

  const presets = parsePresets(data.presets) ?? [migrateLegacyPreset(data)];
  const currentPresetId =
    typeof data.currentPresetId === "string" &&
    presets.some(({ id }) => id === data.currentPresetId)
      ? data.currentPresetId
      : presets[0]!.id;

  return {
    presets,
    currentPresetId,
    promptLibraryDirectory: getString(
      data.promptLibraryDirectory,
      defaults.promptLibraryDirectory,
    ),
    customPromptCommandLabel: getString(
      data.customPromptCommandLabel,
      defaults.customPromptCommandLabel,
    ),
    globalPromptOptions: parsePromptOptions(data.globalPromptOptions),
  };
}

function parsePresets(value: unknown): ProviderPreset[] | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined;

  const usedIds = new Set<string>();
  return value.map((preset, index) => {
    const data = isRecord(preset) ? preset : {};
    const requestedId = getString(data.id);
    let id = requestedId || `preset-${index + 1}`;
    for (let suffix = 2; usedIds.has(id); suffix += 1) {
      id = `${requestedId || `preset-${index + 1}`}-${suffix}`;
    }
    usedIds.add(id);
    return {
      id,
      name: getString(data.name, `Preset ${index + 1}`),
      apiKey: getString(data.apiKey),
      providerUrl: getString(data.providerUrl),
      model: getString(data.model),
      reasoningEffort: isReasoningEffort(data.reasoningEffort)
        ? data.reasoningEffort
        : undefined,
      project: getString(data.project),
    };
  });
}

function migrateLegacyPreset(data: Record<string, unknown>): ProviderPreset {
  return {
    id: "default",
    name: "Default",
    apiKey: getString(data.apiKey),
    providerUrl: getString(data.providerUrl),
    model: getString(data.model),
    reasoningEffort: isReasoningEffort(data.reasoningEffort)
      ? data.reasoningEffort
      : undefined,
    project: getString(data.project),
  };
}

function parsePromptOptions(value: unknown): PromptOptions {
  const data = isRecord(value) ? value : {};
  return {
    shouldHandleSelectionOnly:
      data.shouldHandleSelectionOnly === true ? true : undefined,
    contextSizeBefore: parseContextSize(data.contextSizeBefore),
    contextSizeAfter: parseContextSize(data.contextSizeAfter),
    promptResponseProcessingMode:
      typeof data.promptResponseProcessingMode === "string" &&
      ALL_PROMPT_RESPONSE_PROCESSING_MODES.includes(
        data.promptResponseProcessingMode as (typeof ALL_PROMPT_RESPONSE_PROCESSING_MODES)[number],
      )
        ? (data.promptResponseProcessingMode as (typeof ALL_PROMPT_RESPONSE_PROCESSING_MODES)[number])
        : undefined,
  };
}

function parseContextSize(value: unknown): number | undefined {
  return typeof value === "number" && Number.isInteger(value) && value >= 0
    ? value
    : undefined;
}

function getString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function createPresetId(): string {
  return `preset-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
