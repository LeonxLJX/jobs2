// 简单内存队列：用于文档上传后异步分块入库
// Simple in-memory queue: async chunking after document upload
// 任务对象类型
export interface QueueTask {
  id: string;
  type: string;
  payload: Record<string, unknown>;
}

type TaskHandler = (task: QueueTask) => Promise<void>;

// 极简队列：注册 handler，enqueue 后用 setImmediate 异步执行
class SimpleQueue {
  private handler: TaskHandler | null = null;
  private processing = false;

  // 注册任务处理器
  register(handler: TaskHandler): void {
    this.handler = handler;
  }

  // 入队任务，立即返回
  enqueue(task: QueueTask): void {
    if (!this.handler) {
      console.warn('[queue] 未注册 handler，任务被丢弃', task.type);
      return;
    }
    const handler = this.handler;
    // 使用 setImmediate 在当前事件循环结束后异步执行
    setImmediate(async () => {
      await this.run(task, handler);
    });
  }

  // 串行执行任务，避免并发冲突
  private async run(task: QueueTask, handler: TaskHandler): Promise<void> {
    if (this.processing) {
      // 若有任务在跑，延迟重试
      setTimeout(() => this.run(task, handler), 50);
      return;
    }
    this.processing = true;
    try {
      await handler(task);
    } catch (err) {
      console.error('[queue] 任务执行失败', task.type, err);
    } finally {
      this.processing = false;
    }
  }
}

export const queue = new SimpleQueue();
