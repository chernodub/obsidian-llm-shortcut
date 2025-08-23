import { context } from "esbuild";
import { RenameFilePlugin } from "./config/rename-file-esbuild-plugin.ts";

const isDev = process.env["NODE_ENV"] === "development";
const isWatch = process.env["ESBUILD_WATCH"] === "true";

const MAIN_MODULE_NAME = "main";

const ctx = await context({
  // Output convention enforced by obsidian
  entryPoints: [
    {
      in: "src/main.ts",
      out: MAIN_MODULE_NAME,
    },
  ],
  outdir: ".",
  bundle: true,
  external: ["obsidian"],
  sourcemap: isDev ? "inline" : false,
  minify: !isDev,
  treeShaking: true,
  logLevel: "info",
  target: "es2018",
  format: "cjs",
  plugins: [
    new RenameFilePlugin({
      // The main entry point also outputs the css imported by the files under the same name,
      // so we'll apply the RenameFilePlugin to follow obsidian's output convention
      fromName: `./${MAIN_MODULE_NAME}.css`,
      toName: "./styles.css",
    }),
  ],
});

if (isWatch) {
  await ctx.watch();
} else {
  await ctx.rebuild();
  process.exit(0);
}
