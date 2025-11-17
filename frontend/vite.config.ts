import { defineConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import purgeCss from 'vite-plugin-purgecss';

export default defineConfig(({ mode }) => {
  const plugins: PluginOption[] = [react()];

  if (mode === 'production') {
    const purgePlugin = purgeCss({
        content: [
            './index.html',
            './src/**/*.{ts,tsx,js,jsx,scss}',
        ],
        safelist: {
            standard: [
                /^leaflet-/,

                /^status-circle$/,
                /^success-text$/,
                /^failure-text$/,


                /^btn$/,
                /^btn-/,

                /^navbar$/,
                /^navbar-/,
                /^nav$/,
                /^nav-/,

                /^toast$/,         
                /^toast-/,        
                /^toast-container$/,

                /^tooltip$/,
                /^tooltip-/,
                /^bs-tooltip/,
                /^popover$/,
                /^bs-popover/,

                /^show$/,          
                /^showing$/,      
                /^fade$/,           
                /^collapse$/,
                /^collapsing$/,

                /^position-/,
                /^top-/,
                /^bottom-/,
                /^start-/,
                /^end-/,

                /^bi$/,
                /^bi-/,
            ],
            },
    }) as unknown as PluginOption;

    plugins.push(purgePlugin);
  }

  return {
    plugins,
        css: {
        preprocessorOptions: {
            scss: {
            silenceDeprecations: [
                'import',
                'mixed-decls',
                'color-functions',
                'global-builtin',
            ],
            },
        },
    },
};
});
