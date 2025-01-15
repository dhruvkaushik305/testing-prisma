import { reactRouter } from "@react-router/dev/vite";
import autoprefixer from "autoprefixer";
import { copyFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import tailwindcss from "tailwindcss";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ isSsrBuild, command }) => ({
  build: {
    rollupOptions: isSsrBuild
      ? {
          input: "./server/app.ts",
        }
      : undefined,
  },
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  ssr: {
    noExternal: command === "build" ? true : undefined,
  },
  plugins: [
    {
      name: "prisma:build",
      apply: "build",
      config() {
        return {
          define: {
            __dirname: "import.meta.dirname",
            __filename: "import.meta.filename",
          },
        };
      },
      transform(code, id) {
        if (id.includes("@prisma/client-generated")) {
          return code.replace('eval("__dirname")', "import.meta.dirname");
        }
      },
      closeBundle() {
        // Target directory is now based on the Vercel functions path
        const targetDir = join(
          process.cwd(),
          ".vercel/output/functions/index.func"
        );
        if (!existsSync(targetDir)) {
          mkdirSync(targetDir, { recursive: true });
        }

        try {
          const enginePath = join(
            process.cwd(),
            "node_modules/@prisma/client-generated/libquery_engine-rhel-openssl-3.0.x.so.node"
          );
          const targetPath = join(
            targetDir,
            "libquery_engine-rhel-openssl-3.0.x.so.node"
          );

          if (existsSync(enginePath)) {
            copyFileSync(enginePath, targetPath);
            console.log(
              "✓ Successfully copied Prisma query engine to .vercel/output/functions/index.func"
            );
          } else {
            console.warn(
              "⚠️ Could not find Prisma query engine at expected path:",
              enginePath
            );
          }
        } catch (error) {
          console.error("Error copying Prisma query engine:", error);
        }
      },
    },
    reactRouter(),
    tsconfigPaths(),
  ],
}));
