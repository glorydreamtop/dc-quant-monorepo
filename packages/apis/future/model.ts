import { openInterestEnum } from '../../enums/monitorEnum';

export interface RankParams {
  tradeDate: string;
  contract?: string;
  productId?: string;
  rankType: openInterestEnum;
}

export interface RankMember {
  memberName: string;
  volume: number;
  volumeChange: number;
  rankType?: 0 | 1 | -1;
  productId: string;
  productName: string;
  contract: string;
  tradeDate: string;
}

export type RankResult = RankMember[];

export interface SearchProductOrContractParams {
  productId?: string;
  productName?: string;
}

export interface tableData {
  [key: string]: string | number;
}
