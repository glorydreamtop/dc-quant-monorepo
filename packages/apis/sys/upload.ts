import { UploadApiResult } from './model/uploadModel';
import { defHttp } from '@dq-next/utils/http';
import { UploadFileParams } from '/#/axios';
import { useGlobSetting } from '/@/hooks/setting';
import { getToken } from '@dq-next/utils/auth';

const { uploadUrl = '' } = useGlobSetting();

/**
 * @description: Upload interface
 */
export function uploadApi(
  params: UploadFileParams,
  onUploadProgress: (progressEvent: ProgressEvent) => void,
) {
  return defHttp.uploadFile<UploadApiResult>({
    url: uploadUrl,
    onUploadProgress,
    data: {
      name: 'files',
      ...params,
      token: getToken(),
    },
  });
}
