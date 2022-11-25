import { createLocalStorage } from '@dq-next/utils/storageCache';

const tempSavePathHistroy = createLocalStorage();

export interface folderPathType {
  path: string[];
  categoryId: number;
}

export function getPathHistory(): folderPathType {
  return tempSavePathHistroy.get('tempSavePathHistroy');
}

export function setPathHistory(folderPath: folderPathType) {
  return tempSavePathHistroy.set('tempSavePathHistroy', folderPath);
}
