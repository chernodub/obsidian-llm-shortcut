import clsx from "clsx";
import {
  createSpinnerElement,
  querySpinner,
  renderCancelIcon,
  renderSpinnerIcon,
} from "../spinner/spinner";
import styles from "./loading-status.module.css";

const CANCEL_HINT = "Cancel generation";

export function createLoadingStatusFragment(message: string): DocumentFragment {
  const fragment = document.createDocumentFragment();

  const container = document.createElement("div");
  container.classList.add(clsx(styles.container));
  container.setAttribute("role", "status");
  container.setAttribute("aria-live", "polite");

  const spinner = createSpinnerElement();
  container.appendChild(spinner);

  const text = document.createElement("span");
  text.textContent = message;

  container.appendChild(text);
  fragment.appendChild(container);

  return fragment;
}

export function makeLoadingStatusCancellable(
  target: HTMLElement,
  onCancel: () => void,
): () => void {
  const spinner = querySpinner(target);

  target.classList.add(clsx(styles.cancellable));
  target.setAttribute("role", "button");
  target.setAttribute("title", CANCEL_HINT);

  if (!spinner) {
    target.addEventListener("click", onCancel);
    return () => {
      target.classList.remove(clsx(styles.cancellable));
      target.removeEventListener("click", onCancel);
    };
  }

  const eventListenersController = new AbortController();
  const { signal } = eventListenersController;

  const showCancelIcon = () => renderCancelIcon(spinner);
  const showSpinnerIcon = () => renderSpinnerIcon(spinner);

  target.addEventListener("mouseenter", showCancelIcon, { signal });
  target.addEventListener("mouseleave", showSpinnerIcon, { signal });
  target.addEventListener("focus", showCancelIcon, { signal });
  target.addEventListener("blur", showSpinnerIcon, { signal });
  target.addEventListener("click", onCancel, { signal });

  return () => {
    eventListenersController.abort();
    target.classList.remove(clsx(styles.cancellable));
    renderSpinnerIcon(spinner);
  };
}
