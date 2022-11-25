import { defineStore } from 'pinia';
import { CategoryTreeModel } from '/#/quota';
import { getQuotaTree } from '@dq-next/http-apis/quota';
import { CategoryTreeType } from '/@/enums/quotaEnum';

interface QuotaTreeState {
  sysQuotaTree: CategoryTreeModel[];
  userQuotaTree: CategoryTreeModel[];
  productTree: CategoryTreeModel[];
}

export const useQuotaTreeStore = defineStore({
  id: 'app-quotaTree',
  state: (): QuotaTreeState => ({
    sysQuotaTree: [],
    userQuotaTree: [],
    productTree: [],
  }),
  getters: {
    getSysQuotaTree(): CategoryTreeModel[] {
      return this.sysQuotaTree;
    },
    getUserQuotaTree(): CategoryTreeModel[] {
      return this.userQuotaTree;
    },
    getProductTree(): CategoryTreeModel[] {
      return this.productTree;
    },
  },
  actions: {
    async setSysQuotaTree(): Promise<CategoryTreeModel[]> {
      this.sysQuotaTree = await getQuotaTree({ type: CategoryTreeType.sysQuota });
      return this.sysQuotaTree;
    },
    async setUserQuotaTree(): Promise<CategoryTreeModel[]> {
      this.userQuotaTree = await getQuotaTree({ type: CategoryTreeType.userQuota });
      return this.userQuotaTree;
    },
    async seteProductTree(): Promise<CategoryTreeModel[]> {
      this.productTree = await getQuotaTree({ type: CategoryTreeType.product });
      return this.productTree;
    },
  },
});
