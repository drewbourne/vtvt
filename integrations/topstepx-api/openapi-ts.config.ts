import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig([
  {
    input: "./openapi/gateway-v1.0.0.json",
    output: { path: "src/gateway" },
    plugins: [
      {
        name: "@hey-api/client-fetch",
      },
      {
        name: "zod",
      },
      {
        name: "@hey-api/sdk",
        // validator: "zod",
      },
    ],
  },
  {
    input: "./openapi/user-v1.0.0.json",
    output: { path: "src/user" },
    plugins: [
      {
        name: "@hey-api/client-fetch",
      },
      {
        name: "zod",
      },
      {
        name: "@hey-api/sdk",
        // validator: "zod",
      },
    ],
  },
]);
