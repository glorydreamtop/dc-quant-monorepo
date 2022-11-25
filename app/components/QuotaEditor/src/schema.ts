import { computed } from 'vue';
import { FormSchema } from '../../Form';
import { TreeItem } from '../../Tree';
import { SourceTypeEnum, SourceTypeNameEnum } from '/@/enums/quotaEnum';
import { useI18n } from '/@/hooks/web/useI18n';
import { useQuotaTreeStore } from '/@/store/modules/quotaTree';
import { treeMap } from '@dq-next/utils/helper/treeHelper';
import { isNull } from '@dq-next/utils/is';
const { t } = useI18n();
const quotaTreeStore = useQuotaTreeStore();

const productTreeData = computed<TreeItem>(() => {
  return treeMap(quotaTreeStore.getProductTree, {
    conversion: (node) => {
      return {
        name: node.name,
        code: isNull(node.code) || node.code === '-' ? node.name : node.code,
        isLeaf: !isNull(node.code),
        selectable: !isNull(node.code),
      };
    },
  });
});

export const schemas = computed<FormSchema[]>(() => {
  return [
    {
      field: 'name',
      label: t('quota.quotaEditorModal.form.name'),
      required: true,
      component: 'Input',
    },
    {
      field: 'categoryIdList',
      label: t('quota.quotaEditorModal.form.categoryId'),
      required: true,
      component: 'TreeSelect',
      componentProps: {
        multiple: true,
        fieldNames: {
          title: 'name',
          value: 'id',
        },
        optionLabelProp: 'label',
        treeData: quotaTreeStore.getSysQuotaTree,
      },
    },
    {
      field: 'sourceType',
      label: t('quota.quotaEditorModal.form.sourceType'),
      required: true,
      component: 'Select',
      componentProps: {
        optionLabelProp: 'label',
        options: [
          {
            label: SourceTypeNameEnum.wind,
            value: SourceTypeEnum.wind,
          },
          {
            label: SourceTypeNameEnum.bloomberg,
            value: SourceTypeEnum.bloomberg,
          },
          {
            label: SourceTypeNameEnum.reuter,
            value: SourceTypeEnum.reuter,
          },
          {
            label: SourceTypeNameEnum.mysteel,
            value: SourceTypeEnum.mysteel,
          },
          {
            label: SourceTypeNameEnum.cofeed,
            value: SourceTypeEnum.cofeed,
          },
          {
            label: SourceTypeNameEnum.formula,
            value: SourceTypeEnum.formula,
          },
          {
            label: SourceTypeNameEnum.website,
            value: SourceTypeEnum.website,
          },
          {
            label: SourceTypeNameEnum.eia,
            value: SourceTypeEnum.eia,
          },
          {
            label: SourceTypeNameEnum.usda,
            value: SourceTypeEnum.usda,
          },
          {
            label: SourceTypeNameEnum.manual,
            value: SourceTypeEnum.manual,
          },
          {
            label: SourceTypeEnum.other,
            value: SourceTypeEnum.other,
          },
        ],
      },
    },
    {
      field: 'sourceCode',
      label: t('quota.quotaEditorModal.form.sourceCode'),
      component: 'Input',
    },
    {
      field: 'frequency',
      label: t('quota.quotaEditorModal.form.frequency'),
      defaultValue: '日',
      required: true,
      component: 'Select',
      componentProps: {
        options: [
          {
            value: '日',
          },
          {
            value: '周',
          },
          {
            value: '半月',
          },
          {
            value: '月',
          },
          {
            value: '季',
          },
          {
            value: '年',
          },
          {
            label: '其他',
            value: '',
          },
        ],
      },
    },
    {
      field: 'unit',
      label: t('quota.quotaEditorModal.form.unit'),
      component: 'Input',
    },
    // {
    //   field: 'sourceDescription',
    //   label: t('quota.quotaEditorModal.form.sourceDescription'),
    //   component: 'Input',
    // },
    {
      field: 'commodity',
      label: t('quota.quotaEditorModal.form.commodity'),
      component: 'TreeSelect',
      componentProps: {
        fieldNames: {
          title: 'name',
          value: 'code',
        },
        optionLabelProp: 'label',
        treeData: productTreeData,
      },
    },
    {
      field: 'shortName',
      label: t('quota.quotaEditorModal.form.shortName'),
      component: 'Input',
    },
    {
      field: 'description',
      label: t('quota.quotaEditorModal.form.description'),
      component: 'Input',
    },
    {
      field: 'tableName',
      label: t('quota.quotaEditorModal.form.tableName'),
      component: 'Select',
      componentProps: {
        options: [
          {
            value: 'T_AGRI',
          },
          {
            value: 'T_CHEMI',
          },
          {
            value: 'T_D',
          },
          {
            value: 'T_METAL',
          },
          {
            value: 'T_UDATA',
          },
          {
            value: 'T_YS',
          },
        ],
      },
    },
    {
      field: 'industry',
      label: t('quota.quotaEditorModal.form.industry'),
      component: 'Select',
      componentProps: {
        options: [
          {
            value: '宏观',
          },
          {
            value: '化工',
          },
          {
            value: '黑色',
          },
          {
            value: '有色',
          },
          {
            value: '农产品',
          },
          {
            value: '贵金属',
          },
          {
            value: '股指',
          },
          {
            value: '国债',
          },
          {
            value: '量化',
          },
        ],
      },
    },
    // {
    //   field: 'status',
    //   component: 'RadioGroup',
    //   label: t('quota.quotaEditorModal.form.status'),
    //   defaultValue: 1,
    //   componentProps: {
    //     options: [
    //       {
    //         label: '启用',
    //         value: 1,
    //       },
    //       {
    //         label: '禁用',
    //         value: 0,
    //       },
    //     ],
    //   },
    // },
  ];
});
