// 队列 handler 初始化：注册文档处理任务处理器
// Queue handler init: register document processing handler

import { queue } from './queue';
import { processDocument } from './documentProcessor';

let initialized = false;

// 注册 handler（幂等，只注册一次）
export function initQueue(): void {
  if (initialized) return;
  initialized = true;

  queue.register(async (task) => {
    if (task.type === 'process_document') {
      const documentId = task.payload.documentId as string;
      await processDocument(documentId);
    }
  });
}
