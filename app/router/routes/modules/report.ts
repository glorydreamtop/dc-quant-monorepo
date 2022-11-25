import type { AppRouteModule } from '/@/router/types';

import { LAYOUT } from '/@/router/constant';
import { useI18n } from '/@/hooks/web/useI18n';
const { t } = useI18n();

const report: AppRouteModule = {
  path: '/report',
  name: 'Report',
  component: LAYOUT,
  redirect: '/report/reportView',
  meta: {
    orderNo: 10,
    icon: 'ion:grid-outline',
    title: t('routes.route.report'),
  },
  children: [
    {
      path: 'reportView',
      name: 'ReportView',
      component: () => import('/@/views/report/reportView/index.vue'),
      meta: {
        // affix: true,
        title: t('routes.route.reportView'),
      },
    },
  ],
};

export default report;
