import { withInstall } from '@dq-next/utils';
import basicDrawer from './src/BasicDrawer.vue';
import barDrawer from './src/BarDrawer.vue';

export const BasicDrawer = withInstall(basicDrawer);
export const BarDrawer = withInstall(barDrawer);
export * from './src/typing';
export { useDrawer, useDrawerInner } from './src/useDrawer';
