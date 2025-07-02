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
import { showErrorNotification } from "./ui/user-notifications";
import { assertExists } from "./utils/assertions/assert-exists";
import { NEWLINE_SYMBOL } from "./utils/constants";
import { mapCursorPositionToIdx } from "./utils/obsidian/map-position-to-idx";
import { obsidianFetchAdapter } from "./utils/obsidian/obsidian-fetch-adapter";

interface PluginSettings {
  apiKey: string;
  providerUrl: string;
  model: string;
  promptLibraryDirectory: string;
  project: string;
}

const DEFAULT_SETTINGS: PluginSettings = {
  apiKey: "",
  providerUrl: "",
  model: "",
  promptLibraryDirectory: "_prompts",
  project: "",
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
    this.loadAiClient();
    this.listenToPromptLibraryDirectoryChanges();
  }

  private listenToPromptLibraryDirectoryChanges() {
    const isPromptLibraryDirectory = (file: TAbstractFile) =>
      file.path.startsWith(this.settings.promptLibraryDirectory);

    this.eventRefs = [
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

      this.addCommandBasedOnPrompt(
        readableCommandName,
        file.path,
        await file.vault.read(file),
      );
    } else if (file instanceof TFolder) {
      for (const child of file.children) {
        this.recurseOverAbstractFile(child, currentPath);
      }
    }
  }

  private addCommandBasedOnPrompt(name: string, path: string, prompt: string) {
    const command = {
      id: path,
      name,
      editorCallback: this.handleRespond.bind(this, prompt),
    };
    this.commands.push(command);
    this.addCommand(command);
  }

  private async handleRespond(systemPrompt: string, editor: Editor) {
    assertExists(this.llmClient, "LLM client is not initialized");

    this.loaderStrategy.start();
    try {
      const responseStream = this.llmClient.getResponse({
        userPrompt: {
          currentContent: editor.getValue(),
          cursorPositionIdx: mapCursorPositionToIdx(
            editor.getValue(),
            editor.getCursor(),
          ),
        },
        systemPrompt,
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
    let currentCursor = editor.getCursor();

    for await (const chunk of responseStream) {
      await nextFrame();
      editor.replaceRange(chunk, currentCursor);

      for (const char of chunk) {
        if (char === NEWLINE_SYMBOL) {
          currentCursor = incLine(currentCursor, 1);
        } else {
          currentCursor = incChar(currentCursor, 1);
        }
      }

      editor.setCursor(currentCursor);
    }
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
  }
}

function pathToReadableCommand(currentPath: string[]): string {
  const SEPARATOR_SYMBOL = "/";
  return currentPath
    .slice(1) // skip the prompts library folder
    .join(` ${SEPARATOR_SYMBOL} `)
    .replace(/\.md$/, "");
}

function incLine(cursor: EditorPosition, line: number) {
  return {
    line: cursor.line + line,
    ch: 0,
  };
}

function incChar(cursor: EditorPosition, char: number) {
  return {
    ...cursor,
    ch: cursor.ch + char,
  };
}
