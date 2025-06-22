import { context } from "esbuild";

const isDev = process.env["NODE_ENV"] === "development";
const isWatch = process.env["ESBUILD_WATCH"] === "true";

const ctx = await context({
  entryPoints: ["src/main.ts"],
  outfile: "main.js", // This path is enforced by obsidian
  bundle: true,
  external: ["obsidian"],
  sourcemap: isDev ? "inline" : false,
  minify: !isDev,
  treeShaking: true,
  logLevel: "info",
  target: "es2018",
  format: "cjs",
});

if (isWatch) {
  await ctx.watch();
} else {
  await ctx.rebuild();
  process.exit(0);
}
