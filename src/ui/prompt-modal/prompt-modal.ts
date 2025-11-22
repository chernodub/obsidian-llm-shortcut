import clsx from "clsx";
import { App, Modal } from "obsidian";
import { logger } from "../../logger";
import styles from "./prompt-modal.module.css";

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
    contentEl.addClass(clsx(styles.content));
    this.modalEl.addClass(clsx(styles.modalRoot));

    this.createForm(contentEl);
    this.createFooter(contentEl);
  }

  private createFooter(contentEl: HTMLElement) {
    const footerEl = contentEl.createDiv({
      cls: clsx(styles.footer),
    });

    const buttonContainer = footerEl.createDiv({
      cls: clsx(styles.actions),
    });

    const cancelButton = buttonContainer.createEl("button", {
      text: "Cancel",
      attr: { type: "button" },
    });
    cancelButton.addClass(clsx(styles.button));
    cancelButton.addEventListener("click", () => {
      this.close();
    });

    this.submitButton = buttonContainer.createEl("button", {
      text: "Submit",
      attr: { type: "button", class: "mod-cta" },
    });
    this.submitButton.addClass(clsx(styles.button));
    this.submitButton.addEventListener("click", () => {
      this.handleSubmit();
    });
  }

  private createForm(contentEl: HTMLElement) {
    const formEl = contentEl.createDiv({
      cls: clsx(styles.form),
    });

    this.textareaEl = formEl.createEl("textarea", {
      attr: {
        placeholder: "Enter your prompt here...",
        rows: 8,
      },
    });
    this.textareaEl.addClass(clsx(styles.textarea));
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

    contentEl.removeClass(clsx(styles.content));
    contentEl.empty();
    this.modalEl.removeClass(clsx(styles.modalRoot));
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
