import request from './request';
import type { Document } from './types';

// 回收站列表 / Trash list
export function getTrash(teamId: string) {
  return request.get<unknown, Document[]>('/trash', { params: { teamId } });
}

// 恢复文档 / Restore document
export function restoreDocument(documentId: string) {
  return request.post<unknown, Document>(`/trash/${documentId}/restore`);
}

// 彻底删除文档 / Permanently delete document
export function purgeDocument(documentId: string) {
  return request.delete<unknown, { message: string }>(`/trash/${documentId}`);
}
