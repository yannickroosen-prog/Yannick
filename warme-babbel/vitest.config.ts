import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["tests/unit/**/*.test.ts"],
          environment: "node",
        },
      },
      {
        extends: true,
        test: {
          name: "rls",
          include: ["supabase/tests/**/*.test.ts"],
          environment: "node",
          testTimeout: 30000,
          hookTimeout: 60000,
          // RLS-tests delen één database; sequentieel uitvoeren.
          fileParallelism: false,
        },
      },
    ],
  },
});
