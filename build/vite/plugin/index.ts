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
      // if you want to use Vue I18n Legacy API, you need to set `compositionOnly: false`
      // compositionOnly: false,
      // you need to set i18n resource including paths !
      include: path.resolve(__dirname, './src/locales/**'),
    }),
    windiCSS(),
    !lib && configHtmlPlugin(viteEnv, isBuild),
    configSvgIconsPlugin(isBuild),
    purgeIcons(),
    !lib && configCompressPlugin(viteEnv, isBuild),
    configVisualizerPlugin(viteEnv, isBuild),
    !lib && configPwaPlugin(viteEnv, isBuild),
  ];
  if (!isBuild) {
    vitePlugins.push(mkcert() as PluginOption);
  }
  return vitePlugins;
}
