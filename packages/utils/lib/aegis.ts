import Aegis from 'aegis-web-sdk';
import { App } from 'vue';
import { isDevMode, isProdMode } from '../env';

export function initAegisSDK(uin: string) {
  window.aegis!.setConfig({
    uin,
  });
}

export function setupAegisSDK(app: App) {
  window.aegis = new Aegis({
    id: 'gQK92ugjvJJJR8Qr6r', // 上报 id
    reportApiSpeed: false, // 接口测速
    reportAssetSpeed: false, // 静态资源测速
    spa: true, // spa 应用页面跳转的时候开启 pv 计算
    api: {
      apiDetail: true, // 接口详情
      retCodeHandler(data: any) {
        try {
          data = JSON.parse(data);
        } catch (e) {}
        return {
          isErr: data.body.code !== 200,
          code: data.body.code,
        };
      },
    },
    env: isProdMode()
      ? Aegis.environment.production
      : isDevMode()
      ? Aegis.environment.local
      : Aegis.environment.test, // 环境
  });
  app.config.errorHandler = function (err: Error, _, info) {
    console.error(`Error: ${err.toString()}\nStack: ${err.stack}\nInfo: ${info}`);
    aegis!.error(`Error: ${err.toString()}\nStack: ${err.stack}\nInfo: ${info}`);
  };
}
