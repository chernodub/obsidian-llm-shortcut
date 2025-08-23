import clsx from "clsx";
import { createSpinnerElement } from "../spinner/spinner";
import styles from "./loading-status.module.css";

export function createLoadingStatusFragment(message: string): DocumentFragment {
  const fragment = document.createDocumentFragment();

  const container = document.createElement("div");
  container.classList.add(clsx(styles.container));
  container.setAttribute("role", "status");
  container.setAttribute("aria-live", "polite");

  const spinner = createSpinnerElement();

  const text = document.createElement("span");
  text.textContent = message;

  container.appendChild(spinner);
  container.appendChild(text);
  fragment.appendChild(container);

  return fragment;
}
