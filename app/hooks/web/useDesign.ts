import setting from '../../settings/projectSetting';

export function useDesign(scope: string) {
  const prefixCls = setting.prefixCls;
  return {
    prefixCls: `${prefixCls}-${scope}`,
    prefixVar: prefixCls,
  };
}
