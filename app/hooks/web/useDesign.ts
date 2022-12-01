export function useDesign(scope: string) {
  const prefixCls = 'hubert';
  return {
    prefixCls: `${prefixCls}-${scope}`,
    prefixVar: prefixCls,
  };
}
