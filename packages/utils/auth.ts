import { webStorage, BasicKeys } from './storageCache';
import { TOKEN_KEY } from '/@/enums/cacheEnum';

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
  return webStorage.ls.get(key) as T;
}

export function setAuthCache(key: BasicKeys, value) {
  return webStorage.ls.set(key, value);
}

export function clearAuthCache() {
  return webStorage.ls.clear();
}
