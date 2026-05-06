import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

// Plugin: patch built index.html for PyWebView / WebKit2GTK compatibility
function fixIndexForDesktop() {
  return {
    name: 'fix-index-for-desktop',
    closeBundle() {
      const indexPath = resolve(__dirname, 'dist', 'index.html')
      try {
        let html = readFileSync(indexPath, 'utf-8')

        // 1. Remove crossorigin ONLY from <script> tags (not <link> stylesheet)
        //    WebKit2GTK blocks crossorigin on http:// script loads
        html = html.replace(/(<script[^>]*)\s+crossorigin([^>]*>)/g, '$1$2')

        // 2. type="module" → type="text/javascript" on script tags only
        html = html.replace(/(<script[^>]*)type="module"([^>]*>)/g, '$1type="text/javascript"$2')

        // 3 + 4. Move <script src> from head, add error catcher FIRST, then app bundle
        const scriptTags = []
        html = html.replace(/<script[^>]+src="[^"]*"[^>]*><\/script>/g, (match) => {
          // Strip any existing defer / crossorigin
          const clean = match.replace(/\s+defer/g, '').replace(/\s+crossorigin/g, '')
          scriptTags.push(clean)
          return ''   // remove from head
        })

        const errorScript = `<script>
      window.onerror = function(msg, src, line, col, err) {
        document.getElementById('root').innerHTML =
          '<div style="color:red;padding:20px;font-family:monospace;font-size:13px"><b>JS ERROR:</b><br>' + msg + '<br><br>at ' + src + ':' + line + '</div>';
        return false;
      };
      window.addEventListener('unhandledrejection', function(e) {
        var d = document.getElementById('root');
        if (d && !d.children.length)
          d.innerHTML = '<div style="color:orange;padding:20px;font-family:monospace;font-size:13px"><b>PROMISE ERROR:</b><br>' + e.reason + '</div>';
      });
    </script>`

        // Insert: error catcher FIRST, then app bundle
        // Also inject localStorage polyfill for WebKit2GTK (disables localStorage on http://)
        const localStoragePolyfill = `<script>
      // WebKit2GTK makes window.localStorage read-only and null on http://.
      // Force-override it using Object.defineProperty.
      (function() {
        function makeStore() {
          var s = {};
          return {
            getItem:    function(k)    { return s.hasOwnProperty(k) ? s[k] : null; },
            setItem:    function(k, v) { s[k] = String(v); },
            removeItem: function(k)    { delete s[k]; },
            clear:      function()     { s = {}; },
            key:        function(i)    { return Object.keys(s)[i] || null; },
            get length()               { return Object.keys(s).length; }
          };
        }
        try {
          if (!window.localStorage || window.localStorage === null) {
            throw new Error('null');
          }
          window.localStorage.setItem('__test__', '1');
          window.localStorage.removeItem('__test__');
        } catch(e) {
          // Force-override the read-only property
          try {
            Object.defineProperty(window, 'localStorage', {
              value: makeStore(), writable: true, configurable: true
            });
          } catch(e2) {}
          try {
            Object.defineProperty(window, 'sessionStorage', {
              value: makeStore(), writable: true, configurable: true
            });
          } catch(e3) {}
          console.log('[polyfill] localStorage/sessionStorage replaced with in-memory store');
        }
      })();
    </script>`

        // Insert: localStorage polyfill, then error catcher, then app bundle
        html = html.replace('</body>',
          '    ' + localStoragePolyfill + '\n    ' + errorScript + '\n    ' + scriptTags.join('\n    ') + '\n  </body>')



        writeFileSync(indexPath, html)
        console.log('[fix-index-for-desktop] Patched dist/index.html ✓')
        // Show the patched result so we can verify
        console.log('[fix-index-for-desktop] Result:\n' + html)
      } catch (e) {
        console.warn('[fix-index-for-desktop] Could not patch:', e.message)
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), fixIndexForDesktop()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        // IIFE = self-contained bundle, no ES import/export syntax
        // Required for PyWebView/WebKit2GTK which rejects type="module" on http://
        format: 'iife',
        inlineDynamicImports: true,
      },
    },
  },
  server: {
    // Dev mode: proxy /api → Django on 8000 (unchanged workflow)
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
