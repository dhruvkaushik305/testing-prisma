import { reactRouter } from "@react-router/dev/vite";
import autoprefixer from "autoprefixer";
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
    },
    reactRouter(),
    tsconfigPaths(),
  ],
}));
