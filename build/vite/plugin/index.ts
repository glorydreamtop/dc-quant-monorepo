import { PluginOption } from 'vite';
import path from 'path';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import purgeIcons from 'vite-plugin-purge-icons';
import windiCSS from 'vite-plugin-windicss';
import vueI18n from '@intlify/vite-plugin-vue-i18n';
import vueSetupExtend from 'vite-plugin-vue-setup-extend';
import {
  configCompressPlugin,
  configHtmlPlugin,
  configPwaPlugin,
  configVisualizerPlugin,
  configSvgIconsPlugin,
} from './plugins';
import mkcert from 'vite-plugin-mkcert';

export function createVitePlugins(viteEnv: ViteEnv, isBuild: boolean, lib = false) {
  const vitePlugins: (PluginOption | PluginOption[])[] = [
    vue(),
    vueJsx(),
    vueSetupExtend(),
    vueI18n({
      include: path.resolve(__dirname, './app/locales/**'),
    }),
    windiCSS(),
    !lib && configHtmlPlugin(viteEnv, isBuild),
    !lib && configSvgIconsPlugin(isBuild),
    !lib && purgeIcons(),
    !lib && configCompressPlugin(viteEnv, isBuild),
    !lib && configVisualizerPlugin(viteEnv, isBuild),
    !lib && configPwaPlugin(viteEnv, isBuild),
  ];
  if (!isBuild) {
    vitePlugins.push(mkcert() as PluginOption);
  }
  return vitePlugins;
}

export function createVitePluginsLib(plugins: PluginOption[] = []) {
  return [
    vue(),
    vueJsx(),
    vueSetupExtend(),
    vueI18n({
      include: path.resolve(__dirname, './app/locales/**'),
    }),
    windiCSS(),
    ...plugins,
  ];
}
