import clsx from "clsx";
import { setIcon } from "obsidian";
import styles from "./spinner.module.css";

export function createSpinnerElement(): HTMLElement {
  const spinner = document.createElement("div");
  setIcon(spinner, "loader-2");
  spinner.setAttribute("aria-hidden", "true");
  spinner.classList.add(clsx(styles.spinner));

  return spinner;
}
