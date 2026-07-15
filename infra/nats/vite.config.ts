import { resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import packageJson from "./package.json" with { type: "json" };

const externals = [...Object.keys(packageJson.dependencies)];

export default defineConfig({
  plugins: [dts()],
  build: {
    target: "esnext",
    lib: {
      entry: resolve(import.meta.dirname, "src/index.ts"),
      name: packageJson.name,
      fileName: "index",
      formats: ["es"],
    },
    outDir: "dist",
    rolldownOptions: {
      external: externals,
    },
    minify: false,
    ssr: true,
  },
});
