import { webStorage, BasicKeys } from './storageCache';
import { TOKEN_KEY } from '/@/enums/cacheEnum';

export function getToken(_TOKEN_KEY: BasicKeys = TOKEN_KEY): string {
  // storage中没有token，则从cookie中获取
  let token: string | undefined = getAuthCache(_TOKEN_KEY);
  if (!token) {
    const tokenFromCookie = document.cookie
      .split(';')
      .find((item) => item.trim().startsWith(_TOKEN_KEY))
      ?.split('=')[1];
    if (tokenFromCookie) {
      token = tokenFromCookie;
      setAuthCache(_TOKEN_KEY, token);
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
