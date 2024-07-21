import {configDefaults, defineConfig} from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        exclude:[
            ...configDefaults.exclude,
            'src/e2e-tests'
        ]
    },
    resolve:{
        alias: [{ find: "@", replacement: resolve(__dirname, "./src") }]
    }
})