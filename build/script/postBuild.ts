// #!/usr/bin/env node
import colors from 'picocolors';

import pkg from '../../package.json';

export const runBuild = async () => {
  try {
    console.log(`✨ ${colors.cyan(`[${pkg.name}]`)}` + ' - build successfully!');
  } catch (error) {
    console.log(colors.red('vite build error:\n' + error));
    process.exit(1);
  }
};
runBuild();
