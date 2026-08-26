import { Notice, Platform, Plugin } from "obsidian";
import {
  createLoadingStatusFragment,
  makeLoadingStatusCancellable,
} from "./loading-status/loading-status";
import { getPresetLoadingMessage } from "./loading-status/get-preset-loading-message";

export interface LoaderStrategy {
  start(presetName: string, onCancel: () => void): void;
  stop(): void;
}

abstract class BaseLoaderStrategy implements LoaderStrategy {
  protected cleanup: (() => void) | undefined;

  constructor() {
    this.cleanup = undefined;
  }

  start(presetName: string, onCancel: () => void): void {
    this.stop();
    const fragment = createLoadingStatusFragment(
      getPresetLoadingMessage(presetName),
    );
    const container = this.mount(fragment);
    if (container) {
      this.cleanup = makeLoadingStatusCancellable(container, onCancel);
    }
  }

  stop(): void {
    this.cleanup?.();
    this.cleanup = undefined;
    this.unmount();
  }

  /** Mount fragment and return the element that should be cancellable, or null. */
  protected abstract mount(fragment: DocumentFragment): HTMLElement;
  protected abstract unmount(): void;
}

export class DesktopLoaderStrategy extends BaseLoaderStrategy {
  private statusBarItem: HTMLElement | undefined;

  constructor(private readonly plugin: Plugin) {
    super();
    this.statusBarItem = undefined;
  }

  protected mount(fragment: DocumentFragment): HTMLElement {
    this.statusBarItem = this.plugin.addStatusBarItem()!;
    this.statusBarItem.appendChild(fragment);
    return this.statusBarItem;
  }

  protected unmount(): void {
    this.statusBarItem?.remove();
    this.statusBarItem = undefined;
  }
}

export class MobileLoaderStrategy extends BaseLoaderStrategy {
  private notice: Notice | undefined;

  constructor() {
    super();
    this.notice = undefined;
  }

  protected mount(fragment: DocumentFragment): HTMLElement {
    this.notice = new Notice(fragment, 0);
    return this.notice.messageEl;
  }

  protected unmount(): void {
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
