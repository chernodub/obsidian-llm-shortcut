import clsx from "clsx";
import { App, Component, MarkdownRenderer, Modal } from "obsidian";
import styles from "./info-modal.module.css";

export class InfoModal extends Modal {
  private infoEl?: HTMLDivElement;
  private markdownComponent: Component;

  constructor(
    app: App,
    private readonly heading: string,
  ) {
    super(app);
    this.markdownComponent = new Component();
    this.setTitle(this.heading);
  }

  public async setInfo(str: string) {
    if (!this.infoEl) {
      return;
    }

    this.infoEl.empty();

    await MarkdownRenderer.render(
      this.app,
      str,
      this.infoEl,
      "",
      this.markdownComponent,
    );
  }

  override onOpen() {
    const { contentEl } = this;

    contentEl.empty();
    contentEl.addClass(clsx(styles.content));
    this.modalEl.addClass(clsx(styles.modalRoot));

    this.markdownComponent.load();
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
  }

  private createForm(contentEl: HTMLElement) {
    const formEl = contentEl.createDiv({
      cls: clsx(styles.form),
    });

    this.infoEl = formEl.createDiv();
    this.infoEl.addClass(clsx(styles.info));
  }

  override onClose() {
    const { contentEl } = this;

    this.markdownComponent.unload();
    contentEl.removeClass(clsx(styles.content));
    contentEl.empty();
    this.modalEl.removeClass(clsx(styles.modalRoot));
  }
}
