import type { Plugin, PluginBuild } from "esbuild";
import fs from "node:fs/promises";
import path from "path";

export class RenameFilePlugin implements Plugin {
  readonly name = "RenameFilePlugin";

  #fromName: string;
  #toName: string;

  constructor(params: { fromName: string; toName: string }) {
    this.#fromName = params.fromName;
    this.#toName = params.toName;

    // Needed because esbuild assigns the method as a standalone function internally
    this.setup = this.setup.bind(this);
  }

  async setup(build: PluginBuild) {
    build.onEnd(async (result) => {
      if (result.errors.length > 0) return;

      const from = path.join(this.#fromName);
      const to = path.join(this.#toName);

      // Remove target if it already exists to avoid rename errors
      await fs.rm(to, { force: true });
      await fs.rename(from, to);
    });
  }
}
