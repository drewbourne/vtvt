import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import packageJson from "./package.json" with { type: "json" };

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [dts()],
  build: {
    lib: {
      entry: {
        gateway: resolve(__dirname, "src/gateway/index.ts"),
        "gateway-client": resolve(__dirname, "src/gateway/client.gen.ts"),
        user: resolve(__dirname, "src/user/index.ts"),
        "user-client": resolve(__dirname, "src/user/client.gen.ts"),
      },
      formats: ["es"],
    },
    ssr: true,
    minify: false,
    rollupOptions: {
      external: Array.from(
        new Set(
          ...Object.keys(packageJson.dependencies),
          ...Object.keys(packageJson.devDependencies),
        ),
      ),
    },
  },
});
