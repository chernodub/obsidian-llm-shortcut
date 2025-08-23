import { Notice, Platform, Plugin } from "obsidian";
import { PLUGIN_NAME } from "../utils/constants";
import { createLoadingStatusFragment } from "./loading-status/loading-status";

export interface LoaderStrategy {
  start(): void;
  stop(): void;
}

const LOADING_MESSAGE = `${PLUGIN_NAME}: Generating...`;

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
