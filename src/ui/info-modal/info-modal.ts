import clsx from "clsx";
import { App, Modal } from "obsidian";
import styles from "./info-modal.module.css";

export class InfoModal extends Modal {
  private infoEl: HTMLParagraphElement | null = null;

  constructor(
    app: App,
    private readonly heading: string,
  ) {
    super(app);
    this.setTitle(this.heading);
  }

  public setInfo(info: string) {
    this.infoEl?.setText(info);
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
  }

  private createForm(contentEl: HTMLElement) {
    const formEl = contentEl.createDiv({
      cls: clsx(styles.form),
    });

    this.infoEl = formEl.createEl("p");
    this.infoEl.addClass(clsx(styles.info));
  }

  override onClose() {
    const { contentEl } = this;

    contentEl.removeClass(clsx(styles.content));
    contentEl.empty();
    this.modalEl.removeClass(clsx(styles.modalRoot));
    this.infoEl = null;
  }
}
