import { reactRouter } from "@react-router/dev/vite";
import autoprefixer from "autoprefixer";
import path from "path";
import fs from "fs";
import tailwindcss from "tailwindcss";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { glob } from "glob";

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
      buildEnd() {
        const clientDir = path.resolve("node_modules/@prisma/client");
        const distDir = path.resolve("dist");

        const binaries = glob.sync("libquery_engine-*.node", {
          cwd: clientDir,
        });
        if (binaries.length === 0) {
          console.error(
            `No Prisma Query Engine binaries found in ${clientDir}`
          );
          return;
        }

        const binaryName = binaries[0];
        const sourcePath = path.join(clientDir, binaryName);
        const destinationPath = path.join(distDir, binaryName);

        fs.copyFileSync(sourcePath, destinationPath);
        console.log(`Copied Prisma Query Engine binary to ${destinationPath}`);
      },
    },
    reactRouter(),
    tsconfigPaths(),
  ],
}));
