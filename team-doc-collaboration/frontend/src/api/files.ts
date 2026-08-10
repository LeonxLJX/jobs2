import request from './request';
import type { FileAsset } from './types';

// 文件列表 / File list
export function getFiles(teamId: string) {
  return request.get<unknown, FileAsset[]>('/files', { params: { teamId } });
}

// 删除文件 / Delete file
export function deleteFile(id: string) {
  return request.delete<unknown, { message: string }>(`/files/${id}`);
}
