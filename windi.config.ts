import { defineConfig } from 'vite-plugin-windicss';
import { generate } from '@ant-design/colors';

export default defineConfig({
  darkMode: 'class',
  plugins: [createEnterPlugin()],
  extract: {
    include: ['app/**/*.{vue,tsx}', 'packages/**/*.{vue,tsx}'],
  },
  theme: {
    extend: {
      zIndex: {
        '-1': '-1',
      },
      width: {
        fit: 'fit-content',
      },
      minWidth: {
        fit: 'fit-content',
      },
      colors: {
        primary: '#2f54eb',
        ...createPrimaryColorScheme(),
      },
      cursor: {
        'nw-resize': 'nw-resize',
        move: 'move',
        'w-resize': 'w-resize',
        'n-resize': 'n-resize',
        pointer: 'pointer',
      },
      screens: {
        sm: '576px',
        md: '768px',
        lg: '992px',
        xl: '1200px',
        '2xl': '1600px',
      },
    },
  },
  shortcuts: {
    'component-border': 'border-gray-300 rounded-sm border',
  },
});

/**
 * Used for animation when the element is displayed.
 * @param maxOutput The larger the maxOutput output, the larger the generated css volume.
 */
function createEnterPlugin(maxOutput = 6) {
  const createCss = (index: number, d = 'x') => {
    const upd = d.toUpperCase();
    return {
      [`*> .enter-${d}:nth-child(${index})`]: {
        transform: `translate${upd}(50px)`,
      },
      [`*> .-enter-${d}:nth-child(${index})`]: {
        transform: `translate${upd}(-50px)`,
      },
      [`* > .enter-${d}:nth-child(${index}),* > .-enter-${d}:nth-child(${index})`]: {
        'z-index': `${10 - index}`,
        opacity: '0',
        animation: `enter-${d}-animation 0.4s ease-in-out 0.3s`,
        'animation-fill-mode': 'forwards',
        'animation-delay': `${(index * 1) / 10}s`,
      },
    };
  };
  const handler = ({ addBase }) => {
    const addRawCss = {};
    for (let index = 1; index < maxOutput; index++) {
      Object.assign(addRawCss, {
        ...createCss(index, 'x'),
        ...createCss(index, 'y'),
      });
    }
    addBase({
      ...addRawCss,
      [`@keyframes enter-x-animation`]: {
        to: {
          opacity: '1',
          transform: 'translateX(0)',
        },
      },
      [`@keyframes enter-y-animation`]: {
        to: {
          opacity: '1',
          transform: 'translateY(0)',
        },
      },
    });
  };
  return { handler };
}

function createPrimaryColorScheme() {
  const colors = generate('#2f54eb');
  return {
    'primary-50': colors[0],
    'primary-100': colors[1],
    'primary-200': colors[2],
    'primary-300': colors[3],
    'primary-400': colors[4],
    'primary-500': colors[5],
    'primary-600': colors[6],
    'primary-700': colors[7],
    'primary-800': colors[8],
    'primary-900': colors[9],
  };
}
