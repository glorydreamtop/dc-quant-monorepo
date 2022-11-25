import { FormSchema } from '/@/components/Form';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

export function getSchemas(): FormSchema[] {
  return [
    {
      label: t('sys.user.userName'),
      field: 'username',
      component: 'Input',
    },
    {
      label: t('sys.user.role'),
      field: 'roleIdList',
      component: 'Select',
      componentProps: {
        mode: 'tags',
        optionLabelProp: 'label',
      },
    },
    {
      label: t('sys.user.mail'),
      field: 'wechatUsername',
      component: 'Input',
      rules: [{}],
    },
    {
      label: t('sys.user.mobile'),
      field: 'mobile',
      component: 'Input',
    },
    {
      label: t('sys.user.status'),
      field: 'status',
      component: 'Switch',
    },
  ];
}
