import {configDefaults, defineConfig} from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        // Run tests in forked child processes rather than worker threads. Vitest's default thread
        // pool hits a libuv fd-close assertion crash on Node 20+ in CI (Vercel runs `nx test` on
        // Node 24), aborting the whole run even though every test passes. Forks avoid it.
        pool: 'forks',
        exclude:[
            ...configDefaults.exclude,
            'e2e'
        ]
    },
    resolve:{
        alias: [{ find: "@", replacement: resolve(__dirname, "./src") }]
    }
})