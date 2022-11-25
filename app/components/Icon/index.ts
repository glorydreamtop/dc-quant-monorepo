import Icon from './src/Icon.vue';
import SvgIcon from './src/SvgIcon.vue';
import Iconify from '@purge-icons/generated';

export const encodeSvgForCss = (svg: string): string => {
  let useSvg = svg.startsWith('<svg>') ? svg.replace('<svg>', '<svg >') : svg;
  if (!useSvg.includes(' xmlns:xlink=') && useSvg.includes(' xlink:')) {
    useSvg = useSvg.replace('<svg ', '<svg xmlns:xlink="http://www.w3.org/1999/xlink" ');
  }
  if (!useSvg.includes(' xmlns=')) {
    useSvg = useSvg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
  }
  return useSvg
    .replace(/"/g, "'")
    .replace(/%/g, '%25')
    .replace(/#/g, '%23')
    .replace(/{/g, '%7B')
    .replace(/}/g, '%7D')
    .replace(/</g, '%3C')
    .replace(/>/g, '%3E');
};

const icon2Css = (iconName: string) => {
  const svg = Iconify.renderHTML(iconName, {})!;
  const css = encodeSvgForCss(svg);
  const url = `url("data:image/svg+xml;utf8,${css}")`;

  const mode = svg.includes('currentColor') ? 'mask' : 'bg';

  if (mode === 'mask') {
    return {
      '--un-icon': url,
      mask: 'var(--un-icon) no-repeat exclude',
      'mask-size': '100% 100%',
      '-webkit-mask': 'var(--un-icon) no-repeat',
      '-webkit-mask-size': '100% 100%',
      'background-color': 'currentColor',
    };
  } else {
    return {
      'background-image': url,
      'background-repeat': 'no-repeat',
      'background-size': '100% 100%',
      // 'background-color': 'transparent',
    };
  }
};

export { Icon, SvgIcon, icon2Css };

export default Icon;
