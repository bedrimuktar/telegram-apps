import { postEvent } from '@/globals/globals.js';
import { isRGB } from '@/colors/isRGB.js';
import { getStorageValue, setStorageValue } from '@/storage/storage.js';
import { isPageReload } from '@/navigation/isPageReload.js';
import * as themeParams from '@/theme-params/themeParams.js';
import { decorateWithSupports, type WithSupports } from '@/components/decorateWithSupports.js';
import type { RGB } from '@/colors/types.js';

import * as _ from './miniApp.private.js';
import type { HeaderColor } from './types.js';

// fixme: rgb color key check

const SET_BG_COLOR_METHOD = 'web_app_set_background_color';
const SET_HEADER_COLOR_METHOD = 'web_app_set_header_color';
const STORAGE_KEY = 'miniApp';

/**
 * Mounts the component.
 */
function mount(): void {
  if (!_.isMounted()) {
    const s = isPageReload() && getStorageValue(STORAGE_KEY);
    themeParams.mount();
    _.backgroundColor.set(s ? s.backgroundColor : themeParams.backgroundColor() || '#000000');
    _.backgroundColor.sub(onBgColorChanged);
    _.headerColor.set(s ? s.headerColor : themeParams.headerBackgroundColor() || 'bg_color');
    _.headerColor.sub(onHeaderColorChanged);
    _.isMounted.set(true);
  }
}

function onHeaderColorChanged(color: HeaderColor): void {
  saveState();
  postEvent()(SET_HEADER_COLOR_METHOD, isRGB(color) ? { color } : { color_key: color });
}

function onBgColorChanged(color: RGB): void {
  saveState();
  postEvent()(SET_BG_COLOR_METHOD, { color });
}

function saveState() {
  setStorageValue(STORAGE_KEY, {
    backgroundColor: _.backgroundColor(),
    headerColor: _.headerColor(),
  });
}

/**
 * Updates the background color.
 */
const setBackgroundColor: WithSupports<(color: RGB) => void> = decorateWithSupports(color => {
  _.backgroundColor.set(color);
}, SET_BG_COLOR_METHOD);

/**
 * Updates the header color.
 */
const setHeaderColor: WithSupports<(color: HeaderColor) => void> = decorateWithSupports(color => {
  _.headerColor.set(color);
}, SET_HEADER_COLOR_METHOD);

/**
 * Unmounts the component.
 */
function unmount(): void {
  _.backgroundColor.unsub(onBgColorChanged);
  _.headerColor.unsub(onHeaderColorChanged);
  _.isMounted.set(false);
}

export {
  mount,
  unmount,
  setHeaderColor,
  setBackgroundColor,
};

export * from './miniApp.computed.js';