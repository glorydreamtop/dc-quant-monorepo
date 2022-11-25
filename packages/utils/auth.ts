import { webStorage, BasicKeys } from './storageCache';
import { CacheTypeEnum } from '/@/enums/cacheEnum';
import projectSetting from '/@/settings/projectSetting';
import { TOKEN_KEY } from '/@/enums/cacheEnum';

const { permissionCacheType } = projectSetting;
const isLocal = permissionCacheType === CacheTypeEnum.LOCAL;

export function getToken(): string {
  // storage中没有token，则从cookie中获取
  let token: string | undefined = getAuthCache(TOKEN_KEY);
  if (!token) {
    const tokenFromCookie = document.cookie
      .split(';')
      .find((item) => item.trim().startsWith(TOKEN_KEY))
      ?.split('=')[1];
    if (tokenFromCookie) {
      token = tokenFromCookie;
      setAuthCache(TOKEN_KEY, token);
    }
  }
  return token as string;
}

export function getAuthCache<T>(key: BasicKeys) {
  return webStorage[isLocal ? 'ls' : 'ss'].get(key) as T;
}

export function setAuthCache(key: BasicKeys, value) {
  return webStorage[isLocal ? 'ls' : 'ss'].set(key, value);
}

export function clearAuthCache() {
  return webStorage[isLocal ? 'ls' : 'ss'].clear();
}
