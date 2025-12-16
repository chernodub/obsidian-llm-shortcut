import clsx from "clsx";
import { App, Component, MarkdownRenderer, Modal } from "obsidian";
import styles from "./info-modal.module.css";

export class InfoModal extends Modal {
  private markdownComponent: Component;

  constructor(app: App) {
    super(app);
    this.markdownComponent = new Component();
  }

  public async setInfo(str: string) {
    const { contentEl } = this;

    contentEl.empty();

    await MarkdownRenderer.render(
      this.app,
      str,
      contentEl,
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
  }

  override onClose() {
    const { contentEl } = this;

    this.markdownComponent.unload();
    contentEl.removeClass(clsx(styles.content));
    contentEl.empty();
    this.modalEl.removeClass(clsx(styles.modalRoot));
  }
}
