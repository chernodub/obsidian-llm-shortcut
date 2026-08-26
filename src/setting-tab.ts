import {
  App,
  DropdownComponent,
  PluginSettingTab,
  Setting,
} from "obsidian";
import {
  getModelReasoningSupport,
  type ModelReasoningSupport,
} from "./llm/get-model-reasoning-support";
import {
  isReasoningEffort,
  REASONING_EFFORTS,
} from "./llm/reasoning-effort";
import LlmShortcutPlugin from "./main";
import { PROMPT_OPTION_DEFINITIONS } from "./prompt/prompt-option-registry";
import { obsidianFetchAdapter } from "./utils/obsidian/obsidian-fetch-adapter";

export class SettingTab extends PluginSettingTab {
  private plugin: LlmShortcutPlugin;
  private reasoningSupportRefreshTimer: ReturnType<typeof setTimeout> | undefined;
  private reasoningSupportLookupId = 0;

  constructor(app: App, plugin: LlmShortcutPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  override display(): void {
    const { containerEl } = this;
    containerEl.empty();
    this.cancelReasoningSupportRefresh();

    const reasoningControl: {
      setting?: Setting;
      dropdown?: DropdownComponent;
    } = {};
    const refreshReasoningSupport = async () => {
      const { setting, dropdown } = reasoningControl;
      if (!setting || !dropdown) return;

      const currentLookupId = ++this.reasoningSupportLookupId;
      const lookupConfig = {
        apiKey: this.plugin.settings.apiKey,
        baseUrl: this.plugin.settings.providerUrl,
        model: this.plugin.settings.model,
      };
      this.showReasoningSupport(
        setting,
        dropdown,
        undefined,
      );
      const support = await getModelReasoningSupport({
        ...lookupConfig,
        fetch: obsidianFetchAdapter,
      });
      if (
        currentLookupId !== this.reasoningSupportLookupId ||
        lookupConfig.apiKey !== this.plugin.settings.apiKey ||
        lookupConfig.baseUrl !== this.plugin.settings.providerUrl ||
        lookupConfig.model !== this.plugin.settings.model
      ) {
        return;
      }

      const shouldClearEffort = this.showReasoningSupport(
        setting,
        dropdown,
        support,
      );
      if (shouldClearEffort) {
        this.plugin.settings.reasoningEffort = undefined;
        dropdown.setValue("");
        await this.plugin.saveSettings();
      }
    };

    const scheduleReasoningSupportRefresh = () => {
      this.reasoningSupportLookupId += 1;
      if (this.reasoningSupportRefreshTimer) {
        clearTimeout(this.reasoningSupportRefreshTimer);
      }
      this.reasoningSupportRefreshTimer = setTimeout(
        () => void refreshReasoningSupport(),
        500,
      );
    };

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
            scheduleReasoningSupportRefresh();
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
            scheduleReasoningSupportRefresh();
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
            scheduleReasoningSupportRefresh();
            await this.plugin.saveSettings();
          })
          .setPlaceholder("gpt-4 or your preferred model"),
      );

    reasoningControl.setting = new Setting(containerEl)
      .setName("🧠 Reasoning effort")
      .setDesc(
        "The thinking level for reasoning models. Use provider default for models or providers that do not support this option.",
      )
      .addDropdown((dropdown) => {
        reasoningControl.dropdown = dropdown;
        this.setReasoningOptions(dropdown, REASONING_EFFORTS);

        dropdown
          .setValue(this.plugin.settings.reasoningEffort ?? "")
          .onChange(async (value) => {
            this.plugin.settings.reasoningEffort =
              isReasoningEffort(value) ? value : undefined;
            await this.plugin.saveSettings();
          });
      })
      .addExtraButton((button) =>
        button
          .setIcon("refresh-cw")
          .setTooltip("Check model reasoning support")
          .onClick(refreshReasoningSupport),
      );

    void refreshReasoningSupport();

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

  override hide(): void {
    this.cancelReasoningSupportRefresh();
    super.hide();
  }

  private cancelReasoningSupportRefresh(): void {
    this.reasoningSupportLookupId += 1;
    if (this.reasoningSupportRefreshTimer) {
      clearTimeout(this.reasoningSupportRefreshTimer);
      this.reasoningSupportRefreshTimer = undefined;
    }
  }

  private showReasoningSupport(
    setting: Setting,
    dropdown: DropdownComponent,
    support: ModelReasoningSupport | undefined,
  ): boolean {
    setting.descEl.style.color = "";

    if (!support) {
      this.setReasoningOptions(dropdown, REASONING_EFFORTS);
      setting.setDesc("Checking model reasoning support...");
      dropdown.setDisabled(false);
      return false;
    }

    if (support.status === "supported") {
      const supportedEfforts = new Set<string>(support.efforts);
      this.setReasoningOptions(dropdown, support.efforts);
      setting.setDesc("This model supports reasoning effort.");
      setting.descEl.style.color = "var(--text-success)";
      dropdown.setDisabled(false);
      return (
        this.plugin.settings.reasoningEffort !== undefined &&
        !supportedEfforts.has(this.plugin.settings.reasoningEffort)
      );
    }

    if (support.status === "unsupported") {
      this.setReasoningOptions(dropdown, []);
      setting.setDesc(
        "This model does not advertise reasoning effort support. Provider default will be used.",
      );
      setting.descEl.style.color = "var(--text-warning)";
      dropdown.setDisabled(true);
      return this.plugin.settings.reasoningEffort !== undefined;
    }

    const description =
      support.reason === "invalid-config"
        ? "Enter a valid Base URL and model name to check reasoning support."
        : support.reason === "lookup-failed"
          ? "Could not check reasoning support. Verify the provider URL and API key, then retry."
          : "This provider does not advertise reasoning capabilities. Check its model documentation before selecting an effort.";
    this.setReasoningOptions(dropdown, REASONING_EFFORTS);
    setting.setDesc(description);
    setting.descEl.style.color = "var(--text-muted)";
    dropdown.setDisabled(false);
    return false;
  }

  private setReasoningOptions(
    dropdown: DropdownComponent,
    efforts: readonly string[],
  ): void {
    const selectedValue = this.plugin.settings.reasoningEffort ?? "";
    dropdown.selectEl.empty();
    dropdown.addOption("", "Provider default");
    for (const effort of efforts) {
      dropdown.addOption(effort, capitalize(effort));
    }
    dropdown.setValue(selectedValue);
  }
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
