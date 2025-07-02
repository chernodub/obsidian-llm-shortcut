import { Notice, Platform, Plugin } from "obsidian";
import { PLUGIN_NAME } from "../utils/constants";

export interface LoaderStrategy {
  start(): void;
  stop(): void;
}

const LOADING_MESSAGE = `${PLUGIN_NAME}: Thinking...`;

export class DesktopLoaderStrategy implements LoaderStrategy {
  private statusBarItem: HTMLElement | undefined;

  constructor(private readonly plugin: Plugin) {}

  start(): void {
    this.statusBarItem?.remove();
    this.statusBarItem = this.plugin.addStatusBarItem();
    if (this.statusBarItem) {
      this.statusBarItem.setText(LOADING_MESSAGE);
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
    // For mobile, use Obsidian's notice system which is more mobile-friendly
    this.notice = new Notice(LOADING_MESSAGE, 0); // 0 means persistent until manually dismissed
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
