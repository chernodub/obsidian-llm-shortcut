import { describe, expect, it } from "vitest";
import {
  createDefaultSettings,
  getCurrentPreset,
  migratePluginSettings,
} from "./settings";

describe("createDefaultSettings", () => {
  it("creates independent global prompt options", () => {
    expect(createDefaultSettings().globalPromptOptions).not.toBe(
      createDefaultSettings().globalPromptOptions,
    );
  });
});

describe("migratePluginSettings", () => {
  it("migrates legacy provider fields into the default preset", () => {
    const settings = migratePluginSettings({
      apiKey: "legacy-key",
      providerUrl: "https://provider.example/v1",
      model: "provider/model",
      reasoningEffort: "xhigh",
      project: "legacy-project",
      promptLibraryDirectory: "prompts",
      customPromptCommandLabel: "Ask model",
      globalPromptOptions: { contextSizeBefore: 100 },
    });

    expect(settings.currentPresetId).toBe("default");
    expect(getCurrentPreset(settings)).toEqual({
      id: "default",
      name: "Default",
      apiKey: "legacy-key",
      providerUrl: "https://provider.example/v1",
      model: "provider/model",
      reasoningEffort: "xhigh",
      project: "legacy-project",
    });
    expect(settings.promptLibraryDirectory).toBe("prompts");
    expect(settings.customPromptCommandLabel).toBe("Ask model");
    expect(settings.globalPromptOptions.contextSizeBefore).toBe(100);
  });

  it("preserves valid presets and the current selection", () => {
    const settings = migratePluginSettings({
      presets: [
        {
          id: "first",
          name: "First",
          apiKey: "key-1",
          providerUrl: "https://one.example/v1",
          model: "model-1",
          reasoningEffort: "low",
          project: "",
        },
        {
          id: "second",
          name: "Second",
          apiKey: "key-2",
          providerUrl: "https://two.example/v1",
          model: "model-2",
          reasoningEffort: "max",
          project: "project-2",
        },
      ],
      currentPresetId: "second",
    });

    expect(settings.presets).toHaveLength(2);
    expect(getCurrentPreset(settings).name).toBe("Second");
    expect(getCurrentPreset(settings).reasoningEffort).toBe("max");
  });

  it("falls back to the first preset when the selection is invalid", () => {
    const settings = migratePluginSettings({
      presets: [{ id: "available", name: "Available" }],
      currentPresetId: "missing",
    });

    expect(settings.currentPresetId).toBe("available");
    expect(getCurrentPreset(settings).reasoningEffort).toBeUndefined();
  });

  it("normalizes empty and duplicate preset IDs", () => {
    const settings = migratePluginSettings({
      presets: [
        { id: "duplicate", name: "First" },
        { id: "duplicate", name: "Second" },
        { id: "", name: "Third" },
      ],
      currentPresetId: "duplicate",
    });

    expect(settings.presets.map(({ id }) => id)).toEqual([
      "duplicate",
      "duplicate-2",
      "preset-3",
    ]);
    expect(getCurrentPreset(settings).name).toBe("First");
  });

  it("ignores invalid persisted global prompt options", () => {
    const settings = migratePluginSettings({
      globalPromptOptions: {
        shouldHandleSelectionOnly: "false",
        contextSizeBefore: -1,
        contextSizeAfter: 1.5,
        promptResponseProcessingMode: "invalid",
      },
    });

    expect(settings.globalPromptOptions).toEqual({
      shouldHandleSelectionOnly: undefined,
      contextSizeBefore: undefined,
      contextSizeAfter: undefined,
      promptResponseProcessingMode: undefined,
    });
  });

  it("preserves valid persisted global prompt options", () => {
    const settings = migratePluginSettings({
      globalPromptOptions: {
        shouldHandleSelectionOnly: true,
        contextSizeBefore: 0,
        contextSizeAfter: 100,
        promptResponseProcessingMode: "info",
      },
    });

    expect(settings.globalPromptOptions).toEqual({
      shouldHandleSelectionOnly: true,
      contextSizeBefore: 0,
      contextSizeAfter: 100,
      promptResponseProcessingMode: "info",
    });
  });
});
