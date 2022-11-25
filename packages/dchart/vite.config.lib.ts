import type { UserConfig, ConfigEnv } from 'vite';
import { loadEnv } from 'vite';
import autoprefixer from 'autoprefixer';
import { resolve } from 'path';
import { buildConfig } from '../../build/vite/buildConfig';
import { wrapperEnv } from '../../build/utils';
import { createVitePlugins } from '../../build/vite/plugin';
import { generateModifyVars } from '../../build/vite/theme';

function pathResolve(dir: string) {
  return resolve(process.cwd(), '.', dir);
}

export default ({ command, mode }: ConfigEnv): UserConfig => {
  const root = process.cwd();

  const env = loadEnv(mode, resolve('../env'));

  // The boolean type read by loadEnv is a string. This function can be converted to boolean type
  const viteEnv = wrapperEnv(env);

  const isBuild = command === 'build';

  return {
    root,
    resolve: {
      alias: [
        {
          find: 'vue-i18n',
          replacement: 'vue-i18n/dist/vue-i18n.esm-bundler.js',
        },
        // /@/xxxx => src/xxxx
        {
          find: /\/@\//,
          replacement: pathResolve('../../app') + '/',
        },
        // /#/xxxx => types/xxxx
        {
          find: /\/#\//,
          replacement: pathResolve('types') + '/',
        },
      ],
    },
    esbuild: {
      pure: ['console.log', 'debugger'],
    },
    build: buildConfig({
      name: 'dchart',
      entry: './index.ts',
    }),
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          modifyVars: generateModifyVars(),
        },
      },
      postcss: {
        plugins: [autoprefixer()],
      },
    },

    // The vite plugin used by the project. The quantity is large, so it is separately extracted and managed
    plugins: createVitePlugins(viteEnv, isBuild, true),

    optimizeDeps: {
      // @iconify/iconify: The dependency is dynamically and virtually loaded by @purge-icons/generated, so it needs to be specified explicitly
      include: [
        '@vue/runtime-core',
        '@vue/shared',
        '@iconify/iconify',
        'ant-design-vue/es/locale/zh_CN',
        'ant-design-vue/es/locale/en_US',
      ],
      // exclude: ['vue-demi'],
    },
  };
};
