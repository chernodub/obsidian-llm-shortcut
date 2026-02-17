import {
  App,
  Command,
  Editor,
  EditorPosition,
  EventRef,
  Plugin,
  PluginManifest,
  TAbstractFile,
  TFile,
  TFolder,
} from "obsidian";
import { mapLlmErrorToReadable } from "./llm/error-handler";
import { LLMClient } from "./llm/llm-client";
import { logger } from "./logger";
import { parsePromptOptionsFromFileProperties } from "./prompt/parse-prompt-options-from-file-properties/parse-prompt-options-from-file-properties";
import { mergePromptOptions } from "./prompt/prompt-option-registry";
import { UserContentSelection } from "./prompt/user-content-selection/user-content-selection";
import type { PromptOptions } from "./prompt/user-prompt-options";
import { DEFAULT_PROMPT_OPTIONS } from "./prompt/user-prompt-options";
import { UserPromptParams } from "./prompt/user-prompt-params";
import { SettingTab } from "./setting-tab";
import { InfoModal } from "./ui/info-modal/info-modal";
import { LoaderStrategy, LoaderStrategyFactory } from "./ui/loader-strategy";
import { CustomPromptModal } from "./ui/prompt-modal/prompt-modal";
import { showErrorNotification } from "./ui/user-notifications";
import { AbortError } from "./utils/abort-error";
import { assertExists } from "./utils/assertions/assert-exists";
import { PLUGIN_NAME } from "./utils/constants";
import { obsidianFetchAdapter } from "./utils/obsidian/obsidian-fetch-adapter";

interface PluginSettings {
  apiKey: string;
  providerUrl: string;
  model: string;
  promptLibraryDirectory: string;
  project: string;
  customPromptCommandLabel: string;
  globalPromptOptions: PromptOptions;
}

const DEFAULT_SETTINGS: PluginSettings = {
  apiKey: "",
  providerUrl: "",
  model: "",
  promptLibraryDirectory: "_prompts",
  project: "",
  customPromptCommandLabel: "Custom prompt",
  globalPromptOptions: DEFAULT_PROMPT_OPTIONS,
};

export default class LlmShortcutPlugin extends Plugin {
  public settings: PluginSettings = DEFAULT_SETTINGS;
  private llmClient?: LLMClient;
  private readonly loaderStrategy: LoaderStrategy;
  private commands: Command[] = [];
  private eventRefs: EventRef[] = [];
  private abortController: AbortController | undefined;

  constructor(app: App, manifest: PluginManifest) {
    super(app, manifest);
    this.loaderStrategy = LoaderStrategyFactory.createStrategy(this);
  }

  override async onload() {
    logger.debug("Loading plugin");
    await this.loadSettings();
    this.initSettingsTab();
    this.initCommands();
    this.initCustomPromptCommand();
    this.loadAiClient();
    this.listenToPromptLibraryDirectoryChanges();
  }

  private listenToPromptLibraryDirectoryChanges() {
    const isPromptLibraryDirectory = (file: TAbstractFile) =>
      file.path.startsWith(this.settings.promptLibraryDirectory);

    this.eventRefs = [
      this.app.metadataCache.on("changed", (file) => {
        if (!isPromptLibraryDirectory(file)) {
          return;
        }

        this.recurseOverAbstractFile(file, file.parent?.path.split("/") ?? []);
      }),
      this.app.vault.on("modify", (file) => {
        if (!isPromptLibraryDirectory(file)) {
          return;
        }

        this.recurseOverAbstractFile(file, file.parent?.path.split("/") ?? []);
      }),
      this.app.vault.on("create", (file) => {
        if (!isPromptLibraryDirectory(file)) {
          return;
        }

        this.recurseOverAbstractFile(file, file.parent?.path.split("/") ?? []);
      }),
      this.app.vault.on("delete", (file) => {
        if (!isPromptLibraryDirectory(file)) {
          return;
        }

        this.removeCommand(file.path);
      }),
      this.app.vault.on("rename", (file, oldPath) => {
        if (!isPromptLibraryDirectory(file)) {
          return;
        }

        this.removeCommand(oldPath);
        this.recurseOverAbstractFile(file, file.parent?.path.split("/") ?? []);
      }),
    ];
  }

  private initSettingsTab() {
    this.addSettingTab(new SettingTab(this.app, this));
  }

  private async initCommands() {
    logger.debug("Initializing commands");
    const file = this.app.vault.getAbstractFileByPath(
      this.settings.promptLibraryDirectory,
    );

    if (file == null) {
      return;
    }

    this.recurseOverAbstractFile(file, []);
  }

  private destroyCommands() {
    logger.debug("Destroying commands", this.commands);
    for (const command of this.commands) {
      logger.debug("Destroying command", command.id);
      this.removeCommand(command.id);
    }
    this.commands = [];
  }

  private async recurseOverAbstractFile(
    file: TAbstractFile,
    prevPath: string[],
  ) {
    const currentPath = prevPath.concat(file.name);
    if (file instanceof TFile) {
      const readableCommandName = pathToReadableCommand(currentPath);

      logger.debug(`Added command ${readableCommandName}`);

      this.addCommandBasedOnFile({
        name: readableCommandName,
        promptFilePath: file.path,
      });
    } else if (file instanceof TFolder) {
      for (const child of file.children) {
        this.recurseOverAbstractFile(child, currentPath);
      }
    }
  }

  private async parseUserPromptFromFile(
    file: TFile,
  ): Promise<UserPromptParams> {
    const fileContent = await file.vault.read(file);
    // Danger! The cache could be stale (but we're listening to changes so this will be overriden next run)
    const metadata = this.app.metadataCache.getFileCache(file);

    const userPromptName = file.basename;

    const globalDefaults = this.settings.globalPromptOptions;

    // Use Obsidian's parsed frontmatter if available
    if (!metadata?.frontmatter || !metadata.frontmatterPosition) {
      logger.debug(`LLM Shortcut: No frontmatter found for file: ${file.path}`);
      return {
        userPromptName,
        userPromptString: fileContent,
        userPromptOptions: globalDefaults,
      };
    }

    const userPromptString = fileContent
      .slice(metadata.frontmatterPosition.end.offset)
      .trimStart();

    const fileOverrides = parsePromptOptionsFromFileProperties(
      metadata.frontmatter,
    );

    return {
      userPromptName,
      userPromptString,
      userPromptOptions: mergePromptOptions(globalDefaults, fileOverrides),
    };
  }

  private addCommandBasedOnFile({
    name,
    promptFilePath,
  }: {
    readonly name: string;
    readonly promptFilePath: string;
  }) {
    const command: Command = {
      id: promptFilePath,
      name,
      editorCallback: async (editor: Editor) => {
        try {
          await this.handleRespond(promptFilePath, editor);
        } catch (error) {
          const title = `Error while executing command based on file: ${promptFilePath}`;
          showErrorNotification({
            title,
            message: error instanceof Error ? error.message : "Unknown error",
          });
          logger.error(`LLM Shortcut: ${title}`, error);
        }
      },
    };
    this.commands.push(command);
    this.addCommand(command);
  }

  private applySelection(
    editor: Editor,
    userContentSelection: UserContentSelection,
  ) {
    const { anchor, head } = userContentSelection.getSelection();

    editor.setSelection(anchor, head);
  }

  private async handleRespond(promptFilePath: string, editor: Editor) {
    const file = this.app.vault.getFileByPath(promptFilePath);

    if (!file) {
      throw new Error(`LLM Shortcut: Prompt file not found: ${promptFilePath}`);
    }

    const userPromptParams = await this.parseUserPromptFromFile(file);

    await this.processLlmRequest({
      userPromptParams,
      editor,
    });
  }

  private async processLlmRequest({
    userPromptParams,
    editor,
  }: {
    readonly userPromptParams: UserPromptParams;
    readonly editor: Editor;
  }): Promise<void> {
    assertExists(this.llmClient, "LLM client is not initialized");

    if (this.abortController != null) {
      showErrorNotification({
        title:
          "A request is already in progress. Wait for it to finish or cancel it.",
      });
      return;
    }

    const { userPromptName, userPromptString, userPromptOptions } =
      userPromptParams;

    const text = editor.getValue();
    const rawSelection = new UserContentSelection(text, {
      anchor: editor.getCursor("anchor"),
      head: editor.getCursor("head"),
    });

    const userContentSelection = rawSelection.trim();
    this.applySelection(editor, userContentSelection);

    const emptySelection = userContentSelection.isEmpty();

    if (userPromptOptions.shouldHandleSelectionOnly && emptySelection) {
      showErrorNotification({
        title: "This command requires text to be selected",
      });
      return;
    }

    const abortController = new AbortController();
    this.abortController = abortController;

    this.loaderStrategy.start(() => abortController.abort());

    try {
      const responseStream = this.llmClient.getResponse({
        userContentSelection,
        userPromptString,
        userPromptOptions,
        signal: abortController.signal,
      });

      if (userPromptOptions.promptResponseProcessingMode === "info") {
        await this.showPopUpWithResponse({
          userPromptName,
          responseStream,
          onCancel: () => abortController.abort(),
        });
      } else {
        await this.updateEditorContentWithResponse({
          editor,
          responseStream,
        });
      }
    } catch (error) {
      if (error instanceof AbortError) {
        editor.setValue(text);
        this.applySelection(editor, rawSelection);
      } else {
        showErrorNotification(mapLlmErrorToReadable(error));
        logger.error("Error while updating editor content", error);
      }
    } finally {
      this.abortController = undefined;
      this.loaderStrategy.stop();
    }
  }

  private async updateEditorContentWithResponse({
    editor,
    responseStream,
  }: {
    editor: Editor;
    responseStream: AsyncGenerator<string, void, unknown>;
  }) {
    const fromCursor = editor.getCursor("from");

    let text = "";
    for await (const chunk of responseStream) {
      text += chunk;

      this.updateSelectedText(editor, text, fromCursor);

      // To trigger the UI update
      await nextFrame();

      // This is a workaround to prevent the diff from being added to the undo history,
      // so we're not polluting the history with every single chunk.
      editor.undo();
    }

    this.updateSelectedText(editor, text, fromCursor);

    editor.setSelection(fromCursor, incChar(fromCursor, text.length));
  }

  private async showPopUpWithResponse({
    userPromptName,
    responseStream,
    onCancel,
  }: {
    userPromptName: string;
    responseStream: AsyncGenerator<string, void, unknown>;
    onCancel: () => void;
  }) {
    const infoModal = new InfoModal(this.app, onCancel);
    infoModal.setTitle(userPromptName);
    infoModal.open();

    try {
      let text = "";
      for await (const chunk of responseStream) {
        text += chunk;

        await infoModal.setInfo(text);

        await nextFrame();
      }
    } catch (error) {
      infoModal.close();
      throw error;
    }
  }

  private updateSelectedText(
    editor: Editor,
    text: string,
    currentCursor: EditorPosition,
  ) {
    editor.transaction(
      {
        replaceSelection: text,
        selection: {
          from: currentCursor,
          to: incChar(currentCursor, text.length),
        },
      },
      PLUGIN_NAME,
    );
  }

  private loadAiClient() {
    this.llmClient = new LLMClient(
      {
        apiKey: this.settings.apiKey,
        baseURL: this.settings.providerUrl,
        fetch: obsidianFetchAdapter,
        project: this.settings.project,
      },
      this.settings.model,
    );
  }

  override onunload() {
    this.abortController?.abort();
    this.loaderStrategy.stop();
    this.eventRefs.forEach((eventRef) => this.app.vault.offref(eventRef));
    this.destroyCommands();
  }

  async loadSettings() {
    const data = await this.loadData();
    this.settings = {
      ...DEFAULT_SETTINGS,
      ...data,
      globalPromptOptions: {
        ...DEFAULT_SETTINGS.globalPromptOptions,
        ...data?.globalPromptOptions,
      },
    };
  }

  async saveSettings() {
    await this.saveData(this.settings);
    await this.loadSettings();

    this.loadAiClient();
    await this.reinitializeCommands();
  }

  private async reinitializeCommands() {
    logger.debug("Reinitializing commands");
    this.destroyCommands();
    await this.initCommands();
    this.initCustomPromptCommand();
  }

  private initCustomPromptCommand() {
    const userPromptName = this.settings.customPromptCommandLabel;

    const command = {
      id: "llm-shortcut-custom-prompt",
      name: userPromptName,
      editorCallback: (editor: Editor) => {
        new CustomPromptModal(
          this.app,
          (userPromptString) =>
            this.handleCustomPrompt({
              userPromptName,
              userPromptString,
              editor,
            }),
          userPromptName,
        ).open();
      },
    };
    this.commands.push(command);

    this.addCommand(command);
  }

  async handleCustomPrompt({
    userPromptName,
    userPromptString,
    editor,
  }: {
    userPromptName: string;
    userPromptString: string;
    editor: Editor;
  }) {
    await this.processLlmRequest({
      userPromptParams: {
        userPromptName,
        userPromptString,
        userPromptOptions: this.settings.globalPromptOptions,
      },
      editor,
    });
  }
}

function pathToReadableCommand(currentPath: string[]): string {
  const SEPARATOR_SYMBOL = "/";
  return currentPath
    .slice(1) // skip the prompts library folder
    .join(` ${SEPARATOR_SYMBOL} `)
    .replace(/\.md$/, "");
}

function incChar(cursor: EditorPosition, char: number) {
  return {
    ...cursor,
    ch: cursor.ch + char,
  };
}
