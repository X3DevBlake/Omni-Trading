import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

const pagesDir = resolve(__dirname, 'pages');
const pages = fs.readdirSync(pagesDir).filter(file => file.endsWith('.html'));

const inputMap = {
  main: resolve(__dirname, 'index.html')
};

pages.forEach(file => {
   const name = file.split('.')[0];
   inputMap[name] = resolve(pagesDir, file);
});
inputMap['explorer'] = resolve(pagesDir, 'explorer.html');
inputMap['dao'] = resolve(pagesDir, 'dao.html');
inputMap['bridge'] = resolve(pagesDir, 'bridge.html');
inputMap['ecosystem'] = resolve(pagesDir, 'ecosystem.html');

export default defineConfig({
  clearScreen: false,
  server: {
    watch: {
      ignored: ['**/android/**', '**/node_modules/**']
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: inputMap
    }
  }
});
