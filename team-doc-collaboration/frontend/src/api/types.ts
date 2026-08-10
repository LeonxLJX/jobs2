// 统一响应类型 / Unified response shape
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  path?: string;
  timestamp?: string;
}

// 用户 / User
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt?: string;
}

// 登录返回 / Login response
export interface AuthResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// 团队 / Team
export interface Team {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  owner?: User;
  members?: TeamMember[];
  myRole?: string;
  _count?: { documents: number; files: number; members: number };
}

// 团队成员 / Team member
export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: string;
  user: User;
  createdAt: string;
}

// 文档 / Document
export interface Document {
  id: string;
  teamId: string;
  title: string;
  content: string;
  ownerId: string;
  deletedAt: string | null;
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
  owner?: User;
  team?: { id: string; name: string };
  _count?: { versions: number };
}

// 文档版本 / Document version
export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  title: string;
  content: string;
  editorId: string;
  createdAt: string;
  editor?: { id: string; name: string; email: string };
}

// 文件资源 / File asset
export interface FileAsset {
  id: string;
  teamId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  uploaderId: string;
  createdAt: string;
  uploader?: User;
}
