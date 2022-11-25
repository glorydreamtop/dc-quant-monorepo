import { BasicColumn } from '/@/components/Table';
import { useI18n } from '/@/hooks/web/useI18n';
import { isEmpty, isNull } from '@dq-next/utils/is';
import { Switch, Tag } from 'ant-design-vue';
import { updateUserInfo } from '@dq-next/http-apis/sys/user';
import type { UserInfo } from '/#/store';
import { computed, ref } from 'vue';
import { useRootSetting } from '/@/hooks/setting/useRootSetting';
import { fade } from '@dq-next/utils/color';
import mitt from '@dq-next/utils/mitt';

const { getColorScheme } = useRootSetting();
const colors = computed(() => {
  return getColorScheme.value.map((color) => fade(color, 60));
});
const { t } = useI18n();
export const userListEventBus = mitt();

const roleList = ref<LabelValueOptions>([]);

userListEventBus.on('roleListUpdate', (v) => {
  roleList.value = v;
});

export function getColumns(): BasicColumn[] {
  return [
    {
      title: t('sys.user.userName'),
      dataIndex: 'username',
      width: 120,
      edit: true,
      editComponent: 'Input',
      fixed: 'left',
    },
    {
      title: t('sys.user.role'),
      dataIndex: 'roleIdList',
      width: 300,
      edit: true,
      editComponent: 'Select',
      editComponentProps: {
        mode: 'tags',
        optionLabelProp: 'label',
        options: roleList,
      },
      customRender: ({ record }: { record: UserInfo }) => {
        return (
          <span class="flex gap-1 justify-center">
            {record.roleIdList.map((roleId, index) => (
              <Tag key={roleId} color={colors.value[index]}>
                {roleNameFilter(roleId)}
              </Tag>
            ))}
          </span>
        );
      },
    },
    {
      title: t('sys.user.mail'),
      dataIndex: 'wechatUsername',
      edit: true,
      editComponent: 'Input',
      customRender: ({ record }) => {
        const str = record.wechatUsername;
        const vaild = !isNull(str);
        return vaild ? (
          <a href={`mailto:${record.wechatUsername}`}>{record.wechatUsername}</a>
        ) : (
          <span class="text-gray-400">{t('sys.user.noEmail')}</span>
        );
      },
    },
    {
      title: t('sys.user.mobile'),
      dataIndex: 'mobile',
      width: 160,
      edit: true,
      editComponent: 'Input',
      customRender: ({ record }) => {
        const str = record.mobile;
        const vaild = !isNull(str) && !isEmpty(str);
        return vaild ? (
          <span>{record.mobile}</span>
        ) : (
          <span class="text-gray-400">{t('sys.user.noPhone')}</span>
        );
      },
    },
    {
      title: t('sys.user.createTime'),
      dataIndex: 'createTime',
      width: 200,
    },
    {
      title: t('sys.user.status'),
      dataIndex: 'status',
      width: 100,
      customRender: ({ record }) => {
        const status = Boolean(record.status);
        const text = [t('sys.user.off'), t('sys.user.on')];
        async function onStatusChange(status: boolean) {
          record.status = Number(status);
          await updateUserInfo({ status: record.status, userId: record.userId });
        }
        return (
          <Switch
            checked-children={text[1]}
            un-checked-children={text[0]}
            checked={status}
            onChange={onStatusChange}
          />
        );
      },
    },
  ];
}

// id翻译成角色名字
function roleNameFilter(id: number) {
  return roleList.value.find((role) => role.value === id)?.label || null;
}
