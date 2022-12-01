import type { AxiosRequestConfig, AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import type { RequestOptions, Result, UploadFileParams } from '/#/axios';
import type { CreateAxiosOptions } from './axiosTransform';
import axios from 'axios';
import qs from 'qs';
import { AxiosCanceler } from './axiosCancel';
import { isFunction } from '@dq-next/utils/is';
import { cloneDeep } from 'lodash-es';
import { ContentTypeEnum } from '/@/enums/httpEnum';
import { RequestEnum } from '/@/enums/httpEnum';

export * from './axiosTransform';

/**
 * @description:  axios module
 */
export class VAxios {
  private axiosInstance: AxiosInstance;
  private readonly options: CreateAxiosOptions;

  constructor(options: CreateAxiosOptions) {
    this.options = options;
    this.axiosInstance = axios.create(options);
    this.setupInterceptors();
  }

  /**
   * @description:  Create axios instance
   */
  private createAxios(config: CreateAxiosOptions): void {
    this.axiosInstance = axios.create(config);
  }

  private getTransform() {
    const { transform } = this.options;
    return transform;
  }

  getAxios(): AxiosInstance {
    return this.axiosInstance;
  }

  /**
   * @description: Reconfigure axios
   */
  configAxios(config: CreateAxiosOptions) {
    if (!this.axiosInstance) {
      return;
    }
    this.createAxios(config);
  }

  /**
   * @description: Set general header
   */
  setHeader(headers: any): void {
    if (!this.axiosInstance) {
      return;
    }
    Object.assign(this.axiosInstance.defaults.headers, headers);
  }

  /**
   * @description: Interceptor configuration
   */
  private setupInterceptors() {
    const transform = this.getTransform();
    if (!transform) {
      return;
    }

    const axiosCanceler = new AxiosCanceler();

    // Request interceptor configuration processing
    this.axiosInstance.interceptors.request.use((config: AxiosRequestConfig) => {
      // If cancel repeat request is turned on, then cancel repeat request is prohibited
      // @ts-ignore
      const { ignoreCancelToken } = config.requestOptions;
      const ignoreCancel =
        ignoreCancelToken !== undefined
          ? ignoreCancelToken
          : this.options.requestOptions?.ignoreCancelToken;

      !ignoreCancel && axiosCanceler.addPending(config);
      return config;
    }, undefined);
  }

  /**
   * @description:  File Upload
   */
  uploadFile<T = any>(config: AxiosRequestConfig<UploadFileParams>) {
    const formData = new window.FormData();
    const params = config.data!;
    const customFilename = params.name || 'files';
    if (params.data) {
      Object.keys(params.data).forEach((key) => {
        const value = params.data![key];
        if (Array.isArray(value)) {
          value.forEach((item) => {
            formData.append(key, item);
          });
          return;
        }
        formData.append(key, params.data![key]);
      });
    }

    if (params.file) {
      if (Array.isArray(params.file)) {
        params.file.forEach((file) => {
          formData.append(customFilename, file, params.filename);
        });
      } else {
        formData.append(customFilename, params.file, params.filename);
      }
    }

    return this.axiosInstance.request<T>({
      ...config,
      method: 'POST',
      data: formData,
      headers: {
        'Content-type': ContentTypeEnum.FORM_DATA,
        // @ts-ignore
        ignoreCancelToken: true,
      },
    });
  }

  // support form-data
  supportFormData(config: AxiosRequestConfig) {
    const headers = config.headers || this.options.headers;
    const contentType = headers?.['Content-Type'] || headers?.['content-type'];

    if (
      contentType !== ContentTypeEnum.FORM_URLENCODED ||
      !Reflect.has(config, 'data') ||
      config.method?.toUpperCase() === RequestEnum.GET
    ) {
      return config;
    }

    return {
      ...config,
      data: qs.stringify(config.data, { arrayFormat: 'brackets' }),
    };
  }

  get<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    return this.request({ ...config, method: 'GET' }, options);
  }

  post<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    return this.request({ ...config, method: 'POST' }, options);
  }

  put<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    return this.request({ ...config, method: 'PUT' }, options);
  }

  delete<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    return this.request({ ...config, method: 'DELETE' }, options);
  }

  request<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    let conf: CreateAxiosOptions = cloneDeep(config);
    const transform = this.getTransform();

    const { requestOptions } = this.options;

    const opt: RequestOptions = Object.assign({}, requestOptions, options);

    const { beforeRequestHook, responseCatchHook, responseSuccessHook } = transform || {};
    if (beforeRequestHook && isFunction(beforeRequestHook)) {
      conf = beforeRequestHook.call(this, conf, opt);
    }
    conf.requestOptions = opt;

    conf = this.supportFormData(conf);

    return new Promise((resolve, reject) => {
      this.axiosInstance
        .request<any, AxiosResponse<Result>>(conf)
        .then((res: AxiosResponse<Result>) => {
          if (responseSuccessHook && isFunction(responseSuccessHook)) {
            try {
              const ret = responseSuccessHook.call(this, res, opt);
              resolve(ret);
            } catch (err) {
              reject(err || new Error('request error!'));
            }
            return;
          }
          resolve(res as unknown as Promise<T>);
        })
        .catch((e: AxiosError<Result, any>) => {
          if (responseCatchHook && isFunction(responseCatchHook)) {
            const err = responseCatchHook.call(this, e, opt);
            reject(err);
            return err;
          }
          reject(e);
        });
    });
  }
}
