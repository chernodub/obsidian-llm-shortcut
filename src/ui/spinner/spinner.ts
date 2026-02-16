import clsx from "clsx";
import { setIcon } from "obsidian";
import styles from "./spinner.module.css";

const SPINNER_ICON = "loader-2";
const CANCEL_ICON = "x-circle";
const SPINNER_QUERY_ATTR = "data-loader-spinner";

export function createSpinnerElement(): HTMLElement {
  const spinner = document.createElement("div");
  spinner.setAttribute(SPINNER_QUERY_ATTR, "true");
  renderSpinnerIcon(spinner);
  spinner.setAttribute("aria-hidden", "true");

  return spinner;
}

export function renderSpinnerIcon(element: HTMLElement): void {
  setIcon(element, SPINNER_ICON);
  element.classList.remove(clsx(styles.cancel));
  element.classList.add(clsx(styles.spinner));
}

export function renderCancelIcon(element: HTMLElement): void {
  setIcon(element, CANCEL_ICON);
  element.classList.add(clsx(styles.cancel));
}

const SPINNER_SELECTOR = `[${SPINNER_QUERY_ATTR}]`;

export function querySpinner(parent: HTMLElement): HTMLElement | undefined {
  const el = parent.querySelector(SPINNER_SELECTOR);
  return el ? (el as HTMLElement) : undefined;
}
