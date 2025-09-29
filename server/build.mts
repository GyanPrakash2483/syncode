// build.ts
import { build } from "esbuild";
import { glob } from "glob";

const entryFiles = glob.sync("src/**/*.ts");

build({
  entryPoints: entryFiles,
  bundle: true,
  outdir: "dist",
  platform: "node",
  target: ["node20"],
  sourcemap: true,
  loader: {
    ".ts": "ts"
  }
}).catch(() => process.exit(1));
