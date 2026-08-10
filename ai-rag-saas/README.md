# AI RAG SaaS - 智能文档问答系统

> 基于 RAG（检索增强生成）的 AI 文档问答 SaaS 系统。默认 Mock 模式开箱即用，无需任何 API Key。
>
> A RAG-based AI document Q&A SaaS. Runs out-of-the-box in Mock mode — no API key required.

---

## 中文说明

### 功能特性

- **认证系统**：注册 / 登录 / 登出，JWT 中间件保护 API，bcrypt 密码哈希
- **文档上传与解析**：支持 `.txt` / `.md`，PDF 保留 mock 接口
- **文本分块**：按段落 + 固定字数（~500 字）分块，带重叠
- **向量嵌入**：Mock 模式用关键词哈希向量；可配置真实 OpenAI 兼容 Embedding API
- **RAG 检索**：提问 → 余弦相似度检索相关 chunk → 拼接上下文 → 生成回答
- **来源溯源**：每个回答标注来源文档名 + 分块编号 + 相似度得分
- **会话管理**：问答历史列表、单条会话详情
- **使用统计**：提问次数、上传文档数、最近 7 天趋势
- **免费配额**：免费用户每日 10 次提问，超出提示升级
- **会员订阅**：mock free / pro 状态，pro 无限提问，提供升级接口
- **异步处理**：文档上传后用 setImmediate 内存队列异步分块入库

### 技术栈

| 分类 | 技术 |
|------|------|
| 框架 | Next.js 14（App Router）+ TypeScript |
| ORM | Prisma |
| 数据库 | SQLite（默认）/ PostgreSQL（可切换） |
| 样式 | TailwindCSS |
| 认证 | JWT（jose 库）+ bcryptjs |
| AI | Mock 模式默认，可配置 OpenAI 兼容 API |

### 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 复制环境变量
cp .env.example .env

# 3. 创建数据库 & 表（SQLite 默认）
npm run db:push

# 4. 写入种子数据（含示例用户和文档）
npm run seed

# 5. 启动开发服务器
npm run dev
```

打开 http://localhost:3000，使用种子账号登录：

- 邮箱：`user@example.com`
- 密码：`user123`

### 体验完整 RAG 流程

1. 登录后进入「文档」页，上传一个 `.txt` 或 `.md` 文件
2. 文档状态变为「就绪」后，进入「问答」页
3. 输入问题，即可获得基于文档内容的回答 + 来源标注

种子数据已内置一份「RAG 检索增强生成简介」文档，可直接提问体验。

### 切换真实 AI（可选）

编辑 `.env`：

```env
OPENAI_API_KEY="sk-xxx"
OPENAI_BASE_URL="https://api.openai.com/v1"
EMBEDDING_MODEL="text-embedding-3-small"
CHAT_MODEL="gpt-4o-mini"
```

配置后系统自动使用真实 Embedding + Chat API，失败时自动回退到 Mock。

### 切换 PostgreSQL

编辑 `.env`：

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ai_rag_saas?schema=public"
```

然后将 `prisma/schema.prisma` 中 `provider = "sqlite"` 改为 `provider = "postgresql"`，重新 `npm run db:push`。

### 常用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run start` | 启动生产服务器 |
| `npm run seed` | 写入种子数据 |
| `npm run db:push` | 推送 schema 到数据库（SQLite 友好） |
| `npm run db:migrate` | 创建迁移（PostgreSQL） |
| `npm run db:studio` | 打开 Prisma Studio |

### 项目结构

```
ai-rag-saas/
├── app/                    # Next.js App Router
│   ├── api/                # API 路由
│   │   ├── auth/           # 注册/登录/登出
│   │   ├── documents/      # 文档上传与查询
│   │   ├── chat/           # RAG 问答
│   │   ├── conversations/  # 会话管理
│   │   ├── usage/          # 使用统计
│   │   ├── subscription/   # 会员升级
│   │   └── me/             # 当前用户
│   ├── register/           # 注册页
│   ├── login/              # 登录页
│   ├── documents/          # 文档管理页
│   ├── chat/               # 问答页
│   ├── subscription/       # 会员页
│   ├── layout.tsx          # 根布局
│   └── page.tsx            # 首页/Dashboard
├── components/             # React 组件
├── lib/                    # 工具库
│   ├── rag/                # RAG 核心（embedding/mockRag/chat）
│   ├── db.ts               # Prisma 客户端
│   ├── auth.ts             # JWT 认证
│   ├── chunking.ts         # 文本分块
│   ├── queue.ts            # 内存队列
│   └── usage.ts            # 配额统计
├── prisma/
│   ├── schema.prisma       # 数据模型
│   └── seed.ts             # 种子数据
└── docs/
    └── REQUIREMENTS.md     # 需求文档
```

---

## English

### Features

- **Auth**: register / login / logout, JWT middleware, bcrypt hashing
- **Document upload & parsing**: `.txt` / `.md` supported; PDF mock interface reserved
- **Chunking**: paragraph + fixed-size (~500 chars) with overlap
- **Embedding**: mock keyword-hash vectors by default; configurable real OpenAI-compatible API
- **RAG retrieval**: question → cosine similarity → top-k chunks → context → answer
- **Source citation**: each answer cites source document, chunk index & score
- **Conversations**: history list & detail
- **Usage stats**: question/upload counts, 7-day trend
- **Free quota**: 10 questions/day for free users, upgrade prompt when exceeded
- **Subscription**: mock free / pro plans, pro = unlimited, upgrade endpoint
- **Async processing**: `setImmediate` in-memory queue for chunking on upload

### Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router) + TypeScript |
| ORM | Prisma |
| DB | SQLite (default) / PostgreSQL (switchable) |
| Styling | TailwindCSS |
| Auth | JWT (jose) + bcryptjs |
| AI | Mock by default, configurable OpenAI-compatible API |

### Quick Start

```bash
npm install
cp .env.example .env
npm run db:push
npm run seed
npm run dev
```

Visit http://localhost:3000 and log in with the seeded account:

- Email: `user@example.com`
- Password: `user123`

### License

MIT — MVP demo project.
