import { setAuthCache } from '@dq-next/utils/auth';
import { TOKEN_KEY } from '/@/enums/cacheEnum';
import { setupLibI18n } from '/@/locales/setupI18n';

function setToken(token: string) {
  setupLibI18n();
  setAuthCache(TOKEN_KEY, token);
}

export { setToken };

export { default as BasicChart } from './Chart/src/BasicChart.vue';
export { default as DoubleSideChart } from './Chart/src/DoubleSideChart.vue';
export { default as TempChart } from './Chart/src/TempChart.vue';
export { default as XAxisEditor } from './Chart/src/XAxisEditor.vue';
export { default as YAxisEditor } from './Chart/src/YAxisEditor.vue';
export { default as SeriesEditor } from './Chart/src/SeriesEditor.vue';
export { default as DevModal } from './Chart/src/DevModal.vue';
export * from './Chart/helper';
