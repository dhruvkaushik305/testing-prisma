import { reactRouter } from "@react-router/dev/vite";
import autoprefixer from "autoprefixer";
import path from "path";
import fs from "fs";
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
      buildEnd() {
        // Define source and destination paths
        const queryEngineBinaryName =
          "libquery_engine-rhel-openssl-3.0.x.so.node";
        const sourcePath = path.resolve(
          "node_modules",
          "@prisma/client-generated",
          queryEngineBinaryName
        );
        const destinationPath = path.resolve("dist", queryEngineBinaryName);

        // Ensure the binary is copied to the output directory
        if (fs.existsSync(sourcePath)) {
          fs.copyFileSync(sourcePath, destinationPath);
          console.log(
            `Copied Prisma Query Engine binary to ${destinationPath}`
          );
        } else {
          console.error(
            `Prisma Query Engine binary not found at ${sourcePath}. Please ensure it's correctly generated.`
          );
        }
      },
    },
    reactRouter(),
    tsconfigPaths(),
  ],
}));
