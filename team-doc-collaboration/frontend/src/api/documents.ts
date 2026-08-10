import request from './request';
import type { Document, DocumentVersion } from './types';

// 文档列表 / Document list
export function getDocuments(teamId: string) {
  return request.get<unknown, Document[]>('/documents', { params: { teamId } });
}

// 创建文档 / Create document
export function createDocument(data: { teamId: string; title: string; content?: string }) {
  return request.post<unknown, Document>('/documents', data);
}

// 文档详情 / Document detail
export function getDocument(id: string) {
  return request.get<unknown, Document>(`/documents/${id}`);
}

// 当前版本号（轮询用）/ Current version (for polling)
export function getDocumentVersion(id: string) {
  return request.get<unknown, { id: string; currentVersion: number; updatedAt: string }>(
    `/documents/${id}/version`,
  );
}

// 更新文档 / Update document
export function updateDocument(id: string, data: { title?: string; content?: string }) {
  return request.put<unknown, Document>(`/documents/${id}`, data);
}

// 删除文档（软删除）/ Delete document (soft)
export function deleteDocument(id: string) {
  return request.delete<unknown, Document>(`/documents/${id}`);
}

// 版本历史 / Version history
export function getDocumentVersions(id: string) {
  return request.get<unknown, DocumentVersion[]>(`/documents/${id}/versions`);
}

// 恢复到指定版本 / Restore version
export function restoreVersion(id: string, versionId: string) {
  return request.post<unknown, Document>(`/documents/${id}/versions/${versionId}/restore`);
}
