import { Notice, Platform, Plugin, setIcon } from "obsidian";
import { PLUGIN_NAME } from "../utils/constants";

export interface LoaderStrategy {
  start(): void;
  stop(): void;
}

const LOADING_MESSAGE = `${PLUGIN_NAME}: Generating...`;

function createLoadingStatusFragment(message: string): DocumentFragment {
  const fragment = document.createDocumentFragment();
  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.alignItems = "center";
  container.style.gap = "8px";
  container.setAttribute("role", "status");
  container.setAttribute("aria-live", "polite");

  const spinner = document.createElement("div");
  setIcon(spinner, "loader-2");
  spinner.setAttribute("aria-hidden", "true");
  spinner.style.width = "16px";
  spinner.style.height = "16px";
  spinner.style.display = "inline-flex";
  spinner.style.alignItems = "center";
  spinner.style.justifyContent = "center";

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    spinner.animate(
      [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }],
      { duration: 1000, iterations: Infinity, easing: "linear" },
    );
  }

  const text = document.createElement("span");
  text.textContent = message;

  container.appendChild(spinner);
  container.appendChild(text);
  fragment.appendChild(container);

  return fragment;
}

export class DesktopLoaderStrategy implements LoaderStrategy {
  private statusBarItem: HTMLElement | undefined;

  constructor(private readonly plugin: Plugin) {}

  start(): void {
    this.statusBarItem?.remove();
    this.statusBarItem = this.plugin.addStatusBarItem();
    if (this.statusBarItem) {
      const fragment = createLoadingStatusFragment(LOADING_MESSAGE);
      this.statusBarItem.appendChild(fragment);
    }
  }

  stop(): void {
    this.statusBarItem?.remove();
    this.statusBarItem = undefined;
  }
}

export class MobileLoaderStrategy implements LoaderStrategy {
  private notice: Notice | undefined;

  start(): void {
    // For mobile, use Obsidian's notice system which supports DocumentFragment content
    const fragment = createLoadingStatusFragment(LOADING_MESSAGE);
    this.notice = new Notice(fragment, 0); // 0 = persistent until manually dismissed
  }

  stop(): void {
    // Remove the persistent notice
    this.notice?.hide();
    this.notice = undefined;
  }
}

export class LoaderStrategyFactory {
  static createStrategy(plugin: Plugin): LoaderStrategy {
    if (Platform.isMobile) {
      return new MobileLoaderStrategy();
    } else {
      return new DesktopLoaderStrategy(plugin);
    }
  }
}
