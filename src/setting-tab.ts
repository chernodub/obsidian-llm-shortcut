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

    containerEl.createEl("h2", { text: "LLM Shortcut" });

    containerEl.createEl("h3", { text: "LLM Provider Options" });

    new Setting(containerEl)
      .setName("LLM model")
      .setDesc("The model id you can find in the provider's docs")
      .addText((text) =>
        text
          .setValue(this.plugin.settings?.model || "")
          .onChange(async (value) => {
            this.plugin.settings.model = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("API key")
      .setDesc("The API key for the LLM provider")
      .addText((text) => {
        text
          .setValue(this.plugin.settings?.apiKey || "")
          .onChange(async (value) => {
            this.plugin.settings.apiKey = value;
            await this.plugin.saveSettings();
          });
        text.inputEl.type = "password";
      });

    new Setting(containerEl)
      .setName("Provider URL")
      .setDesc("The URL for the LLM provider")
      .addText((text) =>
        text
          .setValue(this.plugin.settings?.providerUrl || "")
          .onChange(async (value) => {
            this.plugin.settings.providerUrl = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Project")
      .setDesc(
        "Project identifier for the LLM provider (optional for some providers)",
      )
      .addText((text) =>
        text
          .setValue(this.plugin.settings?.project || "")
          .onChange(async (value) => {
            this.plugin.settings.project = value;
            await this.plugin.saveSettings();
          }),
      );

    containerEl.createEl("h3", { text: "Plugin Options" });

    new Setting(containerEl)
      .setName("Prompt library directory")
      .setDesc("The directory where the prompt library is stored")
      .addText((text) =>
        text
          .setValue(this.plugin.settings?.promptLibraryDirectory || "")
          .onChange(async (value) => {
            this.plugin.settings.promptLibraryDirectory = value;
            await this.plugin.saveSettings();
          }),
      );
  }
}
