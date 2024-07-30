import { join } from "path";
import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import path from "path";
import { loadEnvFile } from "process";

loadEnvFile(path.resolve(__dirname, "config/.env.test"));

export default defineConfig({
  test: {
    include: ["**/test/**/*.test.ts"],
    exclude: ["**/index.ts"],
    env: loadEnv("test", "config/.env.test", ""),
    environment: "node",
    coverage: {
      reportsDirectory: "./coverage/server",
      include: ["**/src/**"],
    },
    globals: true,
  },

  resolve: {
    alias: {
      "~/": join(__dirname, "./src/"),
    },
  },
});
