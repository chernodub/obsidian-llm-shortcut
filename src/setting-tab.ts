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

    // Add helpful information about LLM providers
    const providerInfo = containerEl.createEl("div", {
      cls: "setting-item-description",
    });
    providerInfo.innerHTML = `
      <p>This plugin works with any OpenAI-compatible API provider. Configure your preferred LLM service below.</p>
      <details>
        <summary>📋 Google Gemini API Setup Example</summary>
        <div style="background: var(--background-secondary); padding: 12px; border-radius: 6px; margin: 8px 0;">
          <ol>
            <li>Get your API key from <a href="https://makersuite.google.com/app/apikey" target="_blank">Google AI Studio</a></li>
            <li>Check the <a href="https://ai.google.dev/gemini-api/docs/openai" target="_blank">OpenAI Compatibility Guide</a> for the latest endpoints and models</li>
            <li>Configure the settings below:</li>
          </ol>
          <div style="background: var(--background-primary); padding: 8px; border-radius: 4px; font-family: monospace; font-size: 0.9em;">
            <strong>🔑 API Key:</strong> AIzaSyC... (your Google API key)<br>
            <strong>🌐 Base URL:</strong> https://generativelanguage.googleapis.com/v1beta<br>
            <strong>🤖 Model Name:</strong> gemini-flash<br>
            <strong>📁 Project ID:</strong> (leave empty for Gemini)
          </div>
          <br>
          <div>
            <strong>💡 Note:</strong> These values are examples and may be outdated. Always verify the current endpoints, models, and configuration requirements in the official provider docs and your project settings.
          </div>
        </div>
      </details>
      <br>
      <div>
        <strong>🔒 Privacy:</strong> Your API keys and configuration are never logged or stored anywhere outside your private Obsidian plugin settings.
      </div>
    `;

    containerEl.createEl("h3", { text: "LLM Provider Settings" });

    new Setting(containerEl)
      .setName("🔑 API Key")
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
      .setName("🤖 Model Name")
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
      .setName("📁 Project ID (Optional)")
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

    containerEl.createEl("h3", { text: "Plugin Settings" });

    new Setting(containerEl)
      .setName("📚 Prompt Library Folder")
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
