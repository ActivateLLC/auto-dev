"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vite_1 = require("vite");
const plugin_react_swc_1 = require("@vitejs/plugin-react-swc");
const path_1 = require("path");
const lovable_tagger_1 = require("lovable-tagger");
// https://vitejs.dev/config/
exports.default = (0, vite_1.defineConfig)(({ mode }) => ({
    server: {
        host: "::",
        port: 8080,
    },
    plugins: [
        (0, plugin_react_swc_1.default)(),
        mode === 'development' && (0, lovable_tagger_1.componentTagger)(),
    ].filter(Boolean),
    resolve: {
        alias: {
            "@": path_1.default.resolve(__dirname, "./src"),
        },
    },
}));
//# sourceMappingURL=vite.config.js.map