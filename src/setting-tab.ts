import { App, PluginSettingTab, Setting } from "obsidian";
import LlmShortcutPlugin from "./main";

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
  }
}
