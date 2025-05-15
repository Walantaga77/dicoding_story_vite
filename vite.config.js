// vite.config.js
import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
    root: '.', // Root folder (karena index.html ada di root)
    publicDir: 'public', // Folder static assets
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    },
    server: {
        port: 5173,
        https: true,         //Aktifkan HTTPS (diperlukan agar cocok dengan CORS policy Dicoding)
        open: true,
    },
    plugins: [mkcert()]     //Plugin mkcert untuk generate sertifikat lokal
});
