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
  plugins: [reactRouter(), tsconfigPaths(),{
    name: "prisma:rebase",
    enforce: "pre",
    transform(code, id) {
      if (id.includes("@prisma/client")) {
        return code.replaceAll(
          /require\((['"])\.prisma\/client/g,
          "require($1../../.prisma/client",
        );
      }
    },
  },
  {
    name: "prisma:dirname",
    transform(code, id) {
      if (id.includes("@prisma/client") || id.includes(".prisma/client")) {
        return code.replaceAll("__dirname", "import.meta.dirname");
      }
    },
  },],
}));
