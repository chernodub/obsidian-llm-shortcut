import clsx from "clsx";
import { App, Component, MarkdownRenderer, Modal } from "obsidian";
import { createLoadingStatusFragment } from "../loading-status/loading-status";
import styles from "./info-modal.module.css";

export class InfoModal extends Modal {
  private markdownComponent: Component;

  constructor(app: App) {
    super(app);
    this.markdownComponent = new Component();
  }

  public async setInfo(str: string) {
    this.contentEl.empty();

    await MarkdownRenderer.render(
      this.app,
      str,
      this.contentEl,
      "",
      this.markdownComponent,
    );
  }

  override onOpen() {
    const { contentEl } = this;

    contentEl.empty();
    contentEl.addClass(clsx(styles.content));
    this.modalEl.addClass(clsx(styles.modalRoot));

    const loaderFragment = createLoadingStatusFragment("Loading...");
    contentEl.appendChild(loaderFragment);

    this.markdownComponent.load();
  }

  override onClose() {
    const { contentEl } = this;

    this.markdownComponent.unload();
    contentEl.empty();
    contentEl.removeClass(clsx(styles.content));
    this.modalEl.removeClass(clsx(styles.modalRoot));
  }
}
