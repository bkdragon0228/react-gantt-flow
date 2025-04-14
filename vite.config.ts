import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

import dts from "vite-plugin-dts";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        dts({ rollupTypes: true, exclude: ["**/*.stories.tsx", "**/*.stories.ts"] }),
        cssInjectedByJsPlugin(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    css: {
        // postcss: {
        //     plugins: [tailwindcss],
        // },
        // modules: {
        //     generateScopedName: "gantt-[name]__[local]___[hash:base64:5]",
        // },
    },
    build: {
        lib: {
            entry: path.resolve(__dirname, "src/index.ts"),
            name: "index",
            fileName: "index",
        },
        rollupOptions: {
            external: ["react", "react-dom"],
            output: {
                globals: {
                    react: "React",
                    "react-dom": "ReactDOM",
                },
            },
        },
        commonjsOptions: {
            esmExternals: ["react"],
        },
    },
});
