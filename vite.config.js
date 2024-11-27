var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import glsl from 'vite-plugin-glsl';
import { templateCompilerOptions } from '@tresjs/core';
import * as path from 'path';
export default defineConfig({
    base: '/stars1/', //追加
    plugins: [
        vue(__assign({}, templateCompilerOptions)),
        glsl(),
    ],
    define: { 'process.env': {} },
    build: {
        outDir: './docs',
        sourcemap: true,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    server: {
        host: true,
    },
});
