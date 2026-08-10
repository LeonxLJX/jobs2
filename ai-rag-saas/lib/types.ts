// 共享类型定义 / Shared types
export interface User {
  id: string;
  email: string;
  name: string | null;
  plan: 'free' | 'pro';
}

export interface DocumentItem {
  id: string;
  filename: string;
  title: string;
  status: 'processing' | 'ready' | 'failed';
  chunkCount: number;
  createdAt: string;
}

export interface Source {
  documentId: string;
  documentTitle: string;
  chunkId: string;
  chunkIndex: number;
  content: string;
  score: number;
}

export interface ConversationItem {
  id: string;
  title: string;
  createdAt: string;
  messageCount: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources: Source[];
  createdAt: string;
}

export interface UsageData {
  plan: 'free' | 'pro';
  quota: { used: number; limit: number; remaining: number };
  today: { questionCount: number; uploadCount: number };
  totals: {
    documentCount: number;
    questionCount: number;
    uploadCount: number;
  };
  recent7: Array<{
    date: string;
    questionCount: number;
    uploadCount: number;
  }>;
}
