import { App, PluginSettingTab, Setting } from "obsidian";
import {
  isReasoningEffort,
  REASONING_EFFORTS,
} from "./llm/reasoning-effort";
import LlmShortcutPlugin from "./main";
import { PROMPT_OPTION_DEFINITIONS } from "./prompt/prompt-option-registry";

export class SettingTab extends PluginSettingTab {
  private plugin: LlmShortcutPlugin;

  constructor(app: App, plugin: LlmShortcutPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  override display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl).setName("LLM provider").setHeading();

    new Setting(containerEl)
      .setName("🔑 API key")
      .setDesc(
        "Your authentication key from the LLM provider. This is required for all API calls.",
      )
      .addText((text) => {
        text
          .setValue(this.plugin.settings?.apiKey || "")
          .onChange(async (value) => {
            this.plugin.settings.apiKey = value;
            await this.plugin.saveSettings();
          });
        text.inputEl.type = "password";
        text.inputEl.placeholder = "sk-... or your provider's API key format";
      });

    new Setting(containerEl)
      .setName("🌐 Base URL")
      .setDesc(
        "The API endpoint URL for your LLM provider. This tells the plugin where to send requests.",
      )
      .addText((text) =>
        text
          .setValue(this.plugin.settings?.providerUrl || "")
          .onChange(async (value) => {
            this.plugin.settings.providerUrl = value;
            await this.plugin.saveSettings();
          })
          .setPlaceholder("https://api.openai.com/v1"),
      );

    new Setting(containerEl)
      .setName("🤖 Model name")
      .setDesc(
        "The specific AI model to use (e.g., gpt-4, claude-3-sonnet, gemini-pro). Check your provider's model list.",
      )
      .addText((text) =>
        text
          .setValue(this.plugin.settings?.model || "")
          .onChange(async (value) => {
            this.plugin.settings.model = value;
            await this.plugin.saveSettings();
          })
          .setPlaceholder("gpt-4 or your preferred model"),
      );

    new Setting(containerEl)
      .setName("🧠 Reasoning effort")
      .setDesc(
        "The thinking level for reasoning models. Use provider default for models or providers that do not support this option.",
      )
      .addDropdown((dropdown) => {
        dropdown.addOption("", "Provider default");
        for (const effort of REASONING_EFFORTS) {
          dropdown.addOption(
            effort,
            effort.charAt(0).toUpperCase() + effort.slice(1),
          );
        }

        dropdown
          .setValue(this.plugin.settings.reasoningEffort ?? "")
          .onChange(async (value) => {
            this.plugin.settings.reasoningEffort =
              isReasoningEffort(value) ? value : undefined;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("📁 Project ID (optional)")
      .setDesc(
        "Some providers require a project identifier for billing or organization purposes. Leave empty if not required.",
      )
      .addText((text) =>
        text
          .setValue(this.plugin.settings?.project || "")
          .onChange(async (value) => {
            this.plugin.settings.project = value;
            await this.plugin.saveSettings();
          })
          .setPlaceholder("project-id or leave empty"),
      );

    new Setting(containerEl).setName("Prompt library").setHeading();

    new Setting(containerEl)
      .setName("📚 Prompt library folder")
      .setDesc(
        "The folder in your vault where prompt files are stored. Commands will be automatically generated from this directory structure.",
      )
      .addText((text) =>
        text
          .setValue(this.plugin.settings?.promptLibraryDirectory || "")
          .onChange(async (value) => {
            this.plugin.settings.promptLibraryDirectory = value;
            await this.plugin.saveSettings();
          })
          .setPlaceholder("_prompts"),
      );

    new Setting(containerEl)
      .setName("📝 Command label")
      .setDesc(
        "The label used for the custom prompt command in the command palette and modal header.",
      )
      .addText((text) =>
        text
          .setValue(
            this.plugin.settings?.customPromptCommandLabel || "Custom prompt",
          )
          .onChange(async (value) => {
            this.plugin.settings.customPromptCommandLabel = value;
            await this.plugin.saveSettings();
          })
          .setPlaceholder("Custom prompt"),
      );

    new Setting(containerEl)
      .setName("Global prompt options (advanced)")
      .setHeading();

    containerEl.createEl("p", {
      text: "These defaults apply to all prompts. To override a specific prompt, add the corresponding file property to its frontmatter (e.g. llm-shortcut-selection-mode: selection-only).",
      cls: "setting-item-description",
    });

    for (const definition of PROMPT_OPTION_DEFINITIONS) {
      const setting = new Setting(containerEl)
        .setName(definition.settingName)
        .setDesc(definition.settingDesc);

      definition.renderForSettings(
        setting,
        () => this.plugin.settings.globalPromptOptions,
        async (options) => {
          this.plugin.settings.globalPromptOptions = options;
          await this.plugin.saveSettings();
        },
      );
    }
  }
}
