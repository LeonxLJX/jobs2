# 需求文档 / Requirements

> AI 智能问答 SaaS 系统（RAG 文档问答）— MVP 需求说明
>
> AI Q&A SaaS (RAG Document Q&A) — MVP Requirements

---

## 一、中文需求

### 1. 项目概述

构建一个基于 RAG（检索增强生成）的 AI 文档问答 SaaS 系统。用户可上传文本文档，系统自动分块并向量化，用户提问时检索相关片段并生成回答，同时标注来源。默认 Mock 模式开箱即用，无需外部 API Key。

### 2. 用户角色

- **Free 免费用户**：每日 10 次提问配额，可上传文档
- **Pro 会员**：无限提问，其余同 Free（mock 升级，不接真实支付）

### 3. 功能需求

#### 3.1 认证

| 功能 | 说明 |
|------|------|
| 注册 | 邮箱 + 密码（bcrypt 哈希），密码 ≥ 6 位 |
| 登录 | 校验后签发 JWT，写入 httpOnly cookie |
| 登出 | 清除 cookie |
| 鉴权 | API 路由通过 JWT 中间件保护，未登录返回 401 |

#### 3.2 文档上传与解析

- 支持 `.txt` / `.md` 文件，解析为纯文本
- PDF 等其他格式保留接口，返回 mock 提示
- 上传后接口立即返回，异步分块入库（`setImmediate` 内存队列）
- 文档状态：`processing` → `ready` / `failed`

#### 3.3 文本分块

- 按段落分块，超长段落按字数滑窗切分
- 每块约 500 字，块间重叠 50 字

#### 3.4 向量嵌入

- **Mock 模式**：关键词哈希向量（256 维，L2 归一化），中文按字 + bi-gram，英文按单词
- **真实模式**：可配置 OpenAI 兼容 Embedding API
- 嵌入以 JSON 字符串存入 `Chunk.embedding` 字段

#### 3.5 RAG 检索与回答

- 用户提问 → 问题向量化 → 与所有 chunk 余弦相似度比较 → 取 top-4
- 拼接上下文，生成回答
- Mock 回答：返回检索到的相关片段 + 来源标注
- 真实回答：调用 Chat API，system prompt 限定仅依据文档

#### 3.6 来源溯源

- 每条回答附带 `sources` 数组
- 每个来源包含：文档 ID、文档标题、chunk ID、chunk 序号、片段内容、相似度得分

#### 3.7 会话管理

- 提问自动归入会话（无 `conversationId` 时新建）
- 会话标题取问题前 20 字
- 会话列表、单会话详情（含全部消息）

#### 3.8 使用统计

- 按日聚合：提问次数、上传次数
- Dashboard 展示：今日提问/上传、文档总数、累计次数、最近 7 天趋势、配额进度条

#### 3.9 配额限制

- Free 用户每日 10 次提问（可通过 `FREE_DAILY_QUOTA` 环境变量调整）
- 跨天自动重置（`lastResetDate`）
- 超出返回 429 + 升级提示

#### 3.10 会员订阅

- mock 升级接口：`POST /api/subscription/upgrade`，将 `plan` 标记为 `pro`
- Pro 用户无配额限制
- 会员页展示 free / pro 对比 + 升级按钮

### 4. 数据模型

详见 `prisma/schema.prisma`：

- **User**：id, email, password, name, plan(free|pro), questionsToday, lastResetDate, createdAt
- **Document**：id, userId, filename, title, content, status(processing|ready|failed), chunkCount, createdAt
- **Chunk**：id, documentId, index, content, embedding(JSON string), createdAt
- **Conversation**：id, userId, title, createdAt
- **Message**：id, conversationId, role(user|assistant), content, sources(JSON string), createdAt
- **UsageStat**：id, userId, date, questionCount, uploadCount（按日聚合，唯一约束 userId+date）

### 5. API 列表

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 注册 |
| POST | `/api/auth/login` | 登录 |
| POST | `/api/auth/logout` | 登出 |
| GET | `/api/me` | 当前用户信息 |
| GET | `/api/documents` | 文档列表 |
| POST | `/api/documents` | 上传文档 |
| GET | `/api/documents/:id` | 文档详情（含 chunks） |
| DELETE | `/api/documents/:id` | 删除文档 |
| POST | `/api/chat` | 问答（body: {conversationId?, question}） |
| GET | `/api/conversations` | 会话列表 |
| GET | `/api/conversations/:id` | 会话详情（含消息） |
| GET | `/api/usage` | 使用统计 |
| POST | `/api/subscription/upgrade` | 升级为 Pro |

### 6. 前端页面

| 路径 | 说明 |
|------|------|
| `/register` | 注册页 |
| `/login` | 登录页 |
| `/` | Dashboard：统计 + 配额进度条 |
| `/documents` | 文档列表 + 上传 |
| `/chat` | 问答：左侧会话列表 + 右侧对话区 + 来源卡片 |
| `/subscription` | 会员页：free/pro 对比 + 升级按钮 |

### 7. 非功能需求

- 类型完整，无 `any` 占位
- 代码标识符英文，注释中文
- Mock RAG 必须真正可跑通：上传 → 分块 → 提问 → 返回相关片段
- 不写测试、不写 Docker

---

## 二、English Requirements

### 1. Overview

Build a RAG-based AI document Q&A SaaS. Users upload text documents; the system chunks & embeds them; questions are answered by retrieving relevant chunks and citing sources. Mock mode runs out-of-the-box without any API key.

### 2. User Roles

- **Free**: 10 questions/day quota, can upload documents
- **Pro**: unlimited questions (mock upgrade, no real payment)

### 3. Functional Requirements

#### 3.1 Auth

| Feature | Description |
|---------|-------------|
| Register | email + password (bcrypt), password ≥ 6 chars |
| Login | issue JWT, store in httpOnly cookie |
| Logout | clear cookie |
| Protection | API routes guarded by JWT middleware, 401 if unauthenticated |

#### 3.2 Document Upload & Parsing

- `.txt` / `.md` parsed to plain text
- PDF & others: mock interface returning a notice
- Upload returns immediately; chunking is async via `setImmediate` in-memory queue
- Status: `processing` → `ready` / `failed`

#### 3.3 Chunking

- Paragraph-based with fixed-size sliding window for long paragraphs
- ~500 chars per chunk, 50-char overlap

#### 3.4 Embedding

- **Mock**: keyword-hash vector (256-dim, L2-normalized); CN chars + bi-grams, EN words
- **Real**: configurable OpenAI-compatible Embedding API
- Stored as JSON string in `Chunk.embedding`

#### 3.5 RAG Retrieval & Answer

- Question → embed → cosine similarity vs all chunks → top-4
- Assemble context → generate answer
- Mock answer: return retrieved chunks + source citation
- Real answer: Chat API with system prompt restricting to provided context

#### 3.6 Source Citation

- Each answer includes a `sources` array
- Each source: documentId, documentTitle, chunkId, chunkIndex, content snippet, similarity score

#### 3.7 Conversations

- Questions auto-belong to a conversation (new one if no `conversationId`)
- Title = first 20 chars of the question
- List & detail (with all messages)

#### 3.8 Usage Stats

- Daily aggregate: questionCount, uploadCount
- Dashboard: today's counts, total documents, cumulative counts, 7-day trend, quota progress bar

#### 3.9 Quota

- Free: 10 questions/day (configurable via `FREE_DAILY_QUOTA`)
- Auto-reset across days (`lastResetDate`)
- Exceed → 429 + upgrade prompt

#### 3.10 Subscription

- Mock upgrade: `POST /api/subscription/upgrade` sets `plan = pro`
- Pro = unlimited
- Subscription page shows free/pro comparison + upgrade button

### 4. Data Model

See `prisma/schema.prisma`:

- **User**: id, email, password, name, plan(free|pro), questionsToday, lastResetDate, createdAt
- **Document**: id, userId, filename, title, content, status, chunkCount, createdAt
- **Chunk**: id, documentId, index, content, embedding(JSON string), createdAt
- **Conversation**: id, userId, title, createdAt
- **Message**: id, conversationId, role, content, sources(JSON string), createdAt
- **UsageStat**: id, userId, date, questionCount, uploadCount (daily aggregate, unique userId+date)

### 5. API List

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/me` | Current user |
| GET | `/api/documents` | List documents |
| POST | `/api/documents` | Upload document |
| GET | `/api/documents/:id` | Document detail (with chunks) |
| DELETE | `/api/documents/:id` | Delete document |
| POST | `/api/chat` | Q&A (body: {conversationId?, question}) |
| GET | `/api/conversations` | List conversations |
| GET | `/api/conversations/:id` | Conversation detail (with messages) |
| GET | `/api/usage` | Usage stats |
| POST | `/api/subscription/upgrade` | Upgrade to Pro |

### 6. Frontend Pages

| Path | Description |
|------|-------------|
| `/register` | Register |
| `/login` | Login |
| `/` | Dashboard: stats + quota bar |
| `/documents` | Document list + upload |
| `/chat` | Q&A: left conversation list + right chat + source cards |
| `/subscription` | Subscription: free/pro comparison + upgrade button |

### 7. Non-Functional

- Complete types, no `any` placeholders
- English identifiers, Chinese comments
- Mock RAG must actually work end-to-end: upload → chunk → ask → retrieve
- No tests, no Docker
