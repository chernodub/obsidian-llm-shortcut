import { App, Modal, Platform } from "obsidian";
import { logger } from "../../logger";
import "./prompt-modal.css";

const MODAL_CLASS = "llm-shortcut-prompt-modal";

export class CustomPromptModal extends Modal {
  private textareaEl: HTMLTextAreaElement | null = null;
  private submitButton: HTMLButtonElement | null = null;

  constructor(
    app: App,
    private readonly handler: (text: string) => Promise<void>,
    private readonly heading: string = "LLM Shortcut",
  ) {
    super(app);
    this.setTitle(this.heading);
  }

  override onOpen() {
    const { contentEl } = this;

    contentEl.empty();
    this.modalEl.addClass(MODAL_CLASS);

    this.createForm(contentEl);
    this.createFooter(contentEl);
  }

  private createFooter(contentEl: HTMLElement) {
    const buttonContainer = contentEl.createDiv({
      cls: "modal-button-container",
    });

    const cancelButton = buttonContainer.createEl("button", {
      text: "Cancel",
      attr: { type: "button" },
    });
    cancelButton.addEventListener("click", () => {
      this.close();
    });

    this.submitButton = buttonContainer.createEl("button", {
      text: "Submit",
      cls: "mod-cta",
      attr: { type: "button" },
    });
    if (!Platform.isMobile) {
      this.submitButton.createEl("span", {
        cls: "llm-shortcut-submit-shortcut",
        text: Platform.isMacOS ? "⌘ Enter" : "Ctrl+Enter",
        attr: { "aria-hidden": "true" },
      });
      this.submitButton.setAttribute(
        "aria-label",
        `Submit (${Platform.isMacOS ? "Command" : "Control"}+Enter)`,
      );
    }
    this.submitButton.addEventListener("click", () => {
      this.handleSubmit();
    });
  }

  private createForm(contentEl: HTMLElement) {
    this.textareaEl = contentEl.createEl("textarea", {
      attr: {
        "aria-label": this.heading,
        placeholder: "Enter your prompt here...",
        rows: 8,
      },
    });
    this.textareaEl.addEventListener("keydown", this.handleTextareaKeydown);
    this.textareaEl.focus();
  }

  override onClose() {
    const { contentEl } = this;

    if (this.textareaEl) {
      this.textareaEl.removeEventListener(
        "keydown",
        this.handleTextareaKeydown,
      );
    }

    contentEl.empty();
    this.modalEl.removeClass(MODAL_CLASS);
    this.textareaEl = null;
    this.submitButton = null;
  }

  private handleTextareaKeydown = (evt: KeyboardEvent) => {
    if (evt.key === "Enter" && (evt.ctrlKey || evt.metaKey)) {
      evt.preventDefault();
      this.handleSubmit();
    } else if (evt.key === "Escape") {
      evt.preventDefault();
      this.close();
    }
  };

  private async handleSubmit() {
    const userPrompt = this.textareaEl?.value.trim();

    if (!userPrompt || this.submitButton?.disabled) {
      return;
    }

    if (this.submitButton) {
      this.submitButton.disabled = true;
    }

    this.close();

    try {
      await this.handler(userPrompt);
    } catch (error) {
      logger.error("Unexpected error in custom prompt modal:", error);
    }
  }
}
