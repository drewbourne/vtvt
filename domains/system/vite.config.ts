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
      entry: {
        index: resolve(import.meta.dirname, "src/index.ts"),
        models: resolve(import.meta.dirname, "src/models.ts"),
        // service: resolve(import.meta.dirname, "src/service.ts"),
        // worker: resolve(import.meta.dirname, "src/worker.ts"),
      },
      name: packageJson.name,
      fileName: (format, entry) => `${entry}.${format}`,
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
