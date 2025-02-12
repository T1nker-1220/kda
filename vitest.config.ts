/// <reference types="vitest" />
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    include: ['**/*.test.ts', '**/*.test.tsx'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'src/test/**',
      ],
    },
    env: {
      NEXT_PUBLIC_SUPABASE_URL: 'https://heylcozpqbrpyjxkfzzz.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhleWxjb3pwcWJycHlqeGtmenp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2NzA3MTAsImV4cCI6MjA1MDI0NjcxMH0.UdzW56lu_JxKZA7QGM9G3m4viVtGSKdYWXfyyObhaZs',
      NEXT_PUBLIC_SUPABASE_STORAGE_URL: 'https://heylcozpqbrpyjxkfzzz.supabase.co/storage/v1/object/public'
    }
  },
});
