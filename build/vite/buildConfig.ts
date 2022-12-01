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
