'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/client';
import type { ConversationItem, Message, Source } from '@/lib/types';
import SourceCard from '@/components/SourceCard';

interface ChatResponse {
  answer: string;
  sources: Source[];
  conversationId: string;
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [authChecked, setAuthChecked] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 加载会话列表
  async function loadConversations() {
    const res = await apiFetch<{ conversations: ConversationItem[] }>(
      '/api/conversations'
    );
    if (res.success && res.data) {
      setConversations(res.data.conversations);
    } else if (res.error?.includes('未登录') || res.error?.includes('401')) {
      router.push('/login');
    }
    setAuthChecked(true);
  }

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // 加载会话消息
  async function loadMessages(convId: string) {
    const res = await apiFetch<{ conversation: { messages: Message[] } }>(
      `/api/conversations/${convId}`
    );
    if (res.success && res.data) {
      setMessages(res.data.conversation.messages);
      setActiveId(convId);
    }
  }

  // 新建会话：清空当前对话区
  function handleNewChat() {
    setActiveId(null);
    setMessages([]);
    setError('');
  }

  // 发送问题
  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const question = input.trim();
    if (!question || sending) return;
    setSending(true);
    setError('');
    // 乐观渲染用户消息
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: question,
      sources: [],
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setInput('');

    const res = await apiFetch<ChatResponse>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ conversationId: activeId, question }),
    });

    setSending(false);
    if (res.success && res.data) {
      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: res.data.answer,
        sources: res.data.sources,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      // 如果是新会话，切换到新会话
      if (!activeId) {
        setActiveId(res.data.conversationId);
        loadConversations();
      }
    } else {
      setError(res.error || '问答失败');
    }
  }

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!authChecked) {
    return <div className="p-8 text-center text-gray-400">加载中…</div>;
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-140px)] max-w-7xl px-4 py-4">
      {/* 左侧会话列表 */}
      <aside className="mr-4 flex w-64 flex-col rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-3">
          <button
            onClick={handleNewChat}
            className="w-full rounded bg-brand-600 py-2 text-sm text-white hover:bg-brand-700"
          >
            + 新建会话
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="p-3 text-center text-xs text-gray-400">暂无会话</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {conversations.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => loadMessages(c.id)}
                    className={`w-full truncate px-3 py-3 text-left text-sm hover:bg-gray-50 ${
                      activeId === c.id ? 'bg-brand-50 text-brand-700' : 'text-gray-700'
                    }`}
                  >
                    <div className="truncate">{c.title}</div>
                    <div className="mt-0.5 text-xs text-gray-400">
                      {c.messageCount} 条消息
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* 右侧对话区 */}
      <section className="flex flex-1 flex-col rounded-lg border border-gray-200 bg-white">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center text-gray-400">
              <div>
                <p className="mb-2 text-lg">🤖 AI 文档问答</p>
                <p className="text-sm">
                  上传文档后，在此输入问题即可获得基于文档内容的回答
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      m.role === 'user'
                        ? 'bg-brand-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm">{m.content}</div>
                    {m.role === 'assistant' && <SourceCard sources={m.sources} />}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-400">
                    思考中…
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* 输入区 */}
        <div className="border-t border-gray-200 p-3">
          {error && <p className="mb-2 text-sm text-red-500">{error}</p>}
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入你的问题…"
              className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="rounded bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700 disabled:opacity-50"
            >
              发送
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
