import { BuildOptions } from 'vite';
import autoExternal from 'rollup-plugin-auto-external';
import { resolve } from 'path';

interface BUildParams {
  name: string;
  entry: string;
}

export function buildConfig({ name, entry }: BUildParams): BuildOptions {
  return {
    lib: {
      entry,
      name,
      fileName: (format) => `${name}.${format}.ts`,
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'echarts/core',
        '@formkit/auto-animate',
        'echarts/renderers',
        'echarts/components',
        'echarts/charts',
        '@dq-next/utils',
        '@dq-next/http-apis',
        '@dq-next/icon',
        'crypto-js/aes',
        'crypto-js/enc-utf8',
        'crypto-js/pad-pkcs7',
        'crypto-js/mode-ecb',
        'crypto-js/md5',
        'crypto-js/enc-utf8',
        'crypto-js/enc-base64',
      ],
      plugins: [
        autoExternal({
          builtins: false,
          dependencies: true,
          packagePath: resolve(`../../package.json`),
        }),
      ],
    },
  };
}
