import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Enable source maps for production debugging
    sourcemap: mode === 'production' ? 'hidden' : true,
    
    // Optimize bundle splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom'],
          
          // Router and state management
          'router': ['react-router-dom'],
          'tanstack': ['@tanstack/react-query'],
          
          // UI libraries
          'ui-vendor': ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          
          // PDF and file processing (large libraries)
          'pdf-vendor': ['@react-pdf/renderer'],
          'file-vendor': ['jszip'],
          
          // Supabase
          'supabase': ['@supabase/supabase-js'],
          
          // Charts and visualization
          'charts': ['recharts'],
        },
        
        // Optimize chunk naming for caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? path.basename(chunkInfo.facadeModuleId, '.tsx').replace('.', '-') : 'unknown';
          return `assets/[name]-[hash].js`;
        },
      },
    },
    
    // Warn about chunks larger than 1MB (1000kb) to prevent bundle bloat and slow loading
    chunkSizeWarningLimit: 1000,
    
    // Enable minification only for production
    minify: mode === 'production' ? 'esbuild' : false,
  },
  
  // Enable build analysis
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __BUNDLE_ANALYZER__: JSON.stringify(process.env.ANALYZE === 'true'),
  },
}));
