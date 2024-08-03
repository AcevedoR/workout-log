import {configDefaults, defineConfig} from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        exclude:[
            ...configDefaults.exclude,
            'e2e'
        ]
    },
    resolve:{
        alias: [{ find: "@", replacement: resolve(__dirname, "./src") }]
    }
})