import { generate } from '@ant-design/colors';
import { getThemeVariables } from 'ant-design-vue/dist/theme';
import { resolve } from 'path';
const primaryColor = '#2f54eb';

const configLessPath = resolve('design/config.less');
/**
 * less global variable
 */
export function generateModifyVars(dark = false) {
  const palettes = generate(primaryColor);
  const primary = palettes[5];

  const primaryColorObj: Record<string, string> = {};

  for (let index = 0; index < 10; index++) {
    primaryColorObj[`primary-${index + 1}`] = palettes[index];
  }

  const modifyVars = getThemeVariables({ dark });
  return {
    ...modifyVars,
    // Used for global import to avoid the need to import each style file separately
    // reference:  Avoid repeated references
    hack: `${modifyVars.hack} @import (reference) "${configLessPath}";`,
    'primary-color': primary,
    ...primaryColorObj,
    'processing-color': primary,
    // 反馈组件
    'success-color': '#30BF78', //  Success color
    'error-color': '#F4664A', //  False color
    'warning-color': '#FAAD14', //   Warning color
    'info-color': primary,
    'font-size-base': '14px', //  Main font size
    'border-radius-base': '2px', //  Component/float fillet
    'link-color': primary, //   Link color
    'layout-body-background': '#F6F6F6', //  layout bg color
    'app-content-background': 'F6F6F6',
    'font-family': 'PingFang',
    'layout-header-background': 'transparent',
  };
}
