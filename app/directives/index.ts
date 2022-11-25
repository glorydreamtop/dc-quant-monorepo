/**
 * Configure and register global directives
 */
import type { App } from 'vue';
import { setupPermissionDirective } from './permission';
import { setupLoadingDirective } from './loading';
import { setupRepeatDirective } from './repeatClick';
import { setupResizeDirective, setupAutoSizeDirective } from './resizeable';
import { setupTooltipDirective } from './tooltip';

export function setupGlobDirectives(app: App) {
  setupTooltipDirective(app);
  setupPermissionDirective(app);
  setupLoadingDirective(app);
  setupRepeatDirective(app);
  setupResizeDirective(app);
  setupAutoSizeDirective(app);
}
