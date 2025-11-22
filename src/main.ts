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
import { SettingTab } from "./setting-tab";
import { LoaderStrategy, LoaderStrategyFactory } from "./ui/loader-strategy";
import { CustomPromptModal } from "./ui/prompt-modal/prompt-modal";
import { showErrorNotification } from "./ui/user-notifications";
import { assertExists } from "./utils/assertions/assert-exists";
import { PLUGIN_NAME } from "./utils/constants";
import { mapCursorPositionToIdx } from "./utils/obsidian/map-position-to-idx";
import { obsidianFetchAdapter } from "./utils/obsidian/obsidian-fetch-adapter";

const SELECTION_MODE_TAG = "llm-shortcut-selection-mode";
const SELECTION_ONLY_VALUE = "selection-only";

interface CommandOptions {
  readonly shouldHandleSelectionOnly?: boolean;
}

export interface ParsedCommandPrompt {
  readonly prompt: string;
  readonly options?: CommandOptions;
}

interface PluginSettings {
  apiKey: string;
  providerUrl: string;
  model: string;
  promptLibraryDirectory: string;
  project: string;
  customPromptCommandLabel: string;
}

const DEFAULT_SETTINGS: PluginSettings = {
  apiKey: "",
  providerUrl: "",
  model: "",
  promptLibraryDirectory: "_prompts",
  project: "",
  customPromptCommandLabel: "Custom prompt",
};

export default class LlmShortcutPlugin extends Plugin {
  public settings: PluginSettings = DEFAULT_SETTINGS;
  private llmClient?: LLMClient;
  private readonly loaderStrategy: LoaderStrategy;
  private commands: Command[] = [];
  private eventRefs: EventRef[] = [];

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

  private async parseCommandPromptFromFile(
    file: TFile,
  ): Promise<ParsedCommandPrompt> {
    const fileContent = await file.vault.read(file);
    // Danger! The cache could be stale (but we're listening to changes so this will be overriden next run)
    const metadata = this.app.metadataCache.getFileCache(file);

    // Use Obsidian's parsed frontmatter if available
    if (!metadata?.frontmatter || !metadata.frontmatterPosition) {
      logger.debug(`LLM Shortcut: No frontmatter found for file: ${file.path}`);
      return { prompt: fileContent };
    }
    const shouldHandleSelectionOnly =
      metadata.frontmatter[SELECTION_MODE_TAG] === SELECTION_ONLY_VALUE;

    const prompt = fileContent
      .slice(metadata.frontmatterPosition.end.offset)
      .trimStart();

    return {
      prompt,
      options: {
        shouldHandleSelectionOnly,
      },
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
      editorCallback: this.handleRespond.bind(this, promptFilePath),
    };
    this.commands.push(command);
    this.addCommand(command);
  }

  private async handleRespond(promptFilePath: string, editor: Editor) {
    const startIdx = mapCursorPositionToIdx(
      editor.getValue(),
      editor.getCursor("from"),
    );
    const endIdx = mapCursorPositionToIdx(
      editor.getValue(),
      editor.getCursor("to"),
    );

    const file = this.app.vault.getFileByPath(promptFilePath);

    if (!file) {
      throw new Error(`LLM Shortcut: Prompt file not found: ${promptFilePath}`);
    }

    const { prompt, options } = await this.parseCommandPromptFromFile(file);

    if (options?.shouldHandleSelectionOnly) {
      if (startIdx === endIdx) {
        showErrorNotification({
          title: "This command requires text to be selected",
        });
        return;
      }
    }

    await this.processLlmRequest(prompt, editor, startIdx, endIdx);
  }

  private async processLlmRequest(
    prompt: string,
    editor: Editor,
    startIdx: number,
    endIdx: number,
  ) {
    assertExists(this.llmClient, "LLM client is not initialized");

    this.loaderStrategy.start();
    try {
      const responseStream = this.llmClient.getResponse({
        userPrompt: {
          currentContent: editor.getValue(),
          selection: {
            startIdx,
            endIdx,
          },
        },
        systemPrompt: prompt,
      });

      await this.updateEditorContentWithResponse(editor, responseStream);
    } catch (error) {
      showErrorNotification(mapLlmErrorToReadable(error));
      logger.error("Error while updating editor content", error);
    } finally {
      this.loaderStrategy.stop();
    }
  }

  private async updateEditorContentWithResponse(
    editor: Editor,
    responseStream: AsyncGenerator<string, void, unknown>,
  ) {
    const currentCursor = editor.getCursor("from");

    let text = "";
    for await (const chunk of responseStream) {
      text += chunk;

      this.updateSelectedText(editor, text, currentCursor);

      // To trigger the UI update
      await nextFrame();

      // This is a workaround to prevent the diff from being added to the undo history,
      // so we're not polluting the history with every single chunk.
      editor.undo();
    }

    this.updateSelectedText(editor, text, currentCursor);

    editor.setSelection(incChar(currentCursor, text.length));
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
    this.eventRefs.forEach((eventRef) => this.app.vault.offref(eventRef));
    this.destroyCommands();
  }

  async loadSettings() {
    this.settings = { ...DEFAULT_SETTINGS, ...(await this.loadData()) };
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
    const label = this.settings.customPromptCommandLabel;
    const command = {
      id: "llm-shortcut-custom-prompt",
      name: label,
      editorCallback: (editor: Editor) => {
        new CustomPromptModal(
          this.app,
          (prompt) => this.handleCustomPrompt(prompt, editor),
          label,
        ).open();
      },
    };
    this.commands.push(command);

    this.addCommand(command);
  }

  async handleCustomPrompt(userPrompt: string, editor: Editor) {
    const startIdx = mapCursorPositionToIdx(
      editor.getValue(),
      editor.getCursor("from"),
    );
    const endIdx = mapCursorPositionToIdx(
      editor.getValue(),
      editor.getCursor("to"),
    );

    await this.processLlmRequest(userPrompt, editor, startIdx, endIdx);
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
