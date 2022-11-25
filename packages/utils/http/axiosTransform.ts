/**
 * Data processing class, can be configured according to the project
 */
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { VAxios } from './Axios';
import type { RequestOptions, Result } from '/#/axios';

export interface CreateAxiosOptions extends AxiosRequestConfig {
  authenticationScheme?: string;
  transform?: AxiosTransform;
  requestOptions?: RequestOptions;
}

export abstract class AxiosTransform {
  /**
   * @description: Process configuration before request
   * @description: Process configuration before request
   */
  beforeRequestHook?: (
    this: VAxios,
    config: AxiosRequestConfig,
    options: RequestOptions,
  ) => AxiosRequestConfig;

  /**
   * @description: Request successfully processed
   */
  responseSuccessHook?: (this: VAxios, res: AxiosResponse<Result>, options: RequestOptions) => any;

  /**
   * @description: 请求失败处理
   */
  responseCatchHook?: (
    this: VAxios,
    e: AxiosError<Result, any>,
    options: RequestOptions,
  ) => Promise<any>;
}
