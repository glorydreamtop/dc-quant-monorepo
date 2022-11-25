import path from 'path';
import visualizer from 'rollup-plugin-visualizer';
import type { PluginOption } from 'vite';
import compressPlugin from 'vite-plugin-compression';
import { createHtmlPlugin } from 'vite-plugin-html';
import { VitePWA } from 'vite-plugin-pwa';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';

export function configCompressPlugin(
  { VITE_BUILD_COMPRESS, VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE }: ViteEnv,
  isBuild: boolean,
): PluginOption[] {
  const plugins: PluginOption[] = [];
  if (!isBuild) return plugins;
  const compressList = VITE_BUILD_COMPRESS.split(',');
  if (compressList.includes('gzip')) {
    plugins.push(
      compressPlugin({
        ext: '.gz',
        deleteOriginFile: VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE,
      }),
    );
  }

  if (compressList.includes('brotli')) {
    plugins.push(
      compressPlugin({
        ext: '.br',
        algorithm: 'brotliCompress',
        deleteOriginFile: VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE,
      }),
    );
  }
  return plugins;
}

export function configHtmlPlugin({ VITE_GLOB_APP_TITLE }: ViteEnv, isBuild: boolean) {
  const htmlPlugin: PluginOption[] = createHtmlPlugin({
    minify: isBuild,
    inject: {
      // Inject data into ejs template
      data: {
        title: VITE_GLOB_APP_TITLE,
      },
      // Embed the generated app.config.js file
      tags: isBuild
        ? [
            {
              tag: 'script',
              attrs: {
                src: 'https://cdn.bootcdn.net/ajax/libs/highlight.js/11.5.1/highlight.min.js',
              },
            },
            {
              tag: 'link',
              attrs: {
                href: 'https://cdn.bootcdn.net/ajax/libs/highlight.js/11.5.1/styles/lioshi.min.css',
                rel: 'stylesheet',
              },
            },
            {
              tag: 'script',
              attrs: {
                src: 'https://cdn.bootcdn.net/ajax/libs/highlight.js/11.5.1/languages/javascript.min.js',
              },
            },
            {
              tag: 'script',
              attrs: {
                src: 'https://cdn.bootcdn.net/ajax/libs/tinymce/5.10.3/tinymce.min.js',
              },
            },
          ]
        : [],
    },
  });
  return htmlPlugin;
}

export function configPwaPlugin(env: ViteEnv, isBuild: boolean) {
  const { VITE_USE_PWA, VITE_GLOB_APP_TITLE, VITE_GLOB_APP_SHORT_NAME } = env;

  if (VITE_USE_PWA && isBuild) {
    // vite-plugin-pwa
    const pwaPlugin = VitePWA({
      manifest: {
        name: VITE_GLOB_APP_TITLE,
        short_name: VITE_GLOB_APP_SHORT_NAME,
        icons: [
          {
            src: './resource/img/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: './resource/img/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    });
    return pwaPlugin;
  }
  return [];
}

export function configSvgIconsPlugin(isBuild: boolean) {
  const svgIconsPlugin = createSvgIconsPlugin({
    iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
    svgoOptions: isBuild,
    // default
    symbolId: 'icon-[dir]-[name]',
  });
  return svgIconsPlugin;
}

export function configVisualizerPlugin({ VITE_BUILD_VISUALIZER }: ViteEnv, isBuild: boolean) {
  if (isBuild && VITE_BUILD_VISUALIZER) {
    return visualizer({
      filename: './node_modules/.cache/visualizer/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }) as PluginOption;
  }
  return [];
}
