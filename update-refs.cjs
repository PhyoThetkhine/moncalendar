const fs = require('fs');

// Update vite.config.ts
let viteConfig = fs.readFileSync('vite.config.ts', 'utf-8');
viteConfig = viteConfig.replace(
  "includeAssets: ['image/image.png']",
  "includeAssets: ['icon-192.png', 'icon-512.png']"
);
viteConfig = viteConfig.replace(
  "src: '/image/image.png',\n          sizes: '192x192'",
  "src: '/icon-192.png',\n          sizes: '192x192'"
);
viteConfig = viteConfig.replace(
  "src: '/image/image.png',\n          sizes: '512x512'",
  "src: '/icon-512.png',\n          sizes: '512x512'"
);
viteConfig = viteConfig.replace(
  "src: '/image/image.png',\n          sizes: '512x512'",
  "src: '/icon-512.png',\n          sizes: '512x512'"
);
fs.writeFileSync('vite.config.ts', viteConfig, 'utf-8');

// Update index.html
let indexHtml = fs.readFileSync('client/index.html', 'utf-8');
indexHtml = indexHtml.replace(
  '<link rel="apple-touch-icon" href="/image/image.png" />',
  '<link rel="apple-touch-icon" href="/icon-192.png" />'
);
indexHtml = indexHtml.replace(
  '<link rel="icon" type="image/png" href="/image/image.png" />',
  '<link rel="icon" type="image/png" href="/icon-192.png" />'
);
fs.writeFileSync('client/index.html', indexHtml, 'utf-8');

console.log('Updated references successfully!');
