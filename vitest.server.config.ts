import { join } from "path";
import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import path from "path";
import { loadEnvFile } from "process";

loadEnvFile(path.resolve(__dirname, "config/.env.test"));

export default defineConfig({
  test: {
    include: ["**/test/**/*.test.ts"],
    exclude: [],
    env: loadEnv("test", "config/.env.test", ""),
    environment: "node",
    coverage: {
      reportsDirectory: "./coverage/server",
      include: ["**/src/**"],
      exclude: [
        "**/src/cron.ts",
        "**/src/start.ts",
        "**/src/**/*-interface.ts",
        "**/src/**/**.config.ts",
        "**/src/controllers/gold-price-period-graph.ts",
      ],
    },
    globals: true,
  },

  resolve: {
    alias: {
      "~/": join(__dirname, "./src/"),
    },
  },
});
