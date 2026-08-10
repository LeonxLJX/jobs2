# Team Doc Collaboration · 多租户团队文档协作平台

一个开箱即用的多租户团队文档协作 MVP 平台，支持认证、RBAC 权限、团队管理、文档编辑、版本历史、文件上传与回收站。

A ready-to-run multi-tenant team document collaboration MVP platform with authentication, RBAC, team management, document editing, version history, file upload, and trash.

---

## 技术栈 / Tech Stack

- **后端 / Backend**：NestJS + TypeScript + Prisma ORM + JWT + bcrypt
- **前端 / Frontend**：Vue3 + TypeScript + Vite + Element Plus + Pinia + Vue Router
- **数据库 / Database**：默认 SQLite（零配置），可通过 `.env` 切换 PostgreSQL
- **Database**: SQLite by default (zero config), switchable to PostgreSQL via `.env`

---

## 目录结构 / Project Structure

```
team-doc-collaboration/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # 数据模型 / Data model
│   │   └── seed.ts            # 种子数据 / Seed data
│   ├── src/
│   │   ├── auth/              # 认证模块 / Auth module
│   │   ├── users/             # 用户模块 / Users module
│   │   ├── teams/             # 团队模块 / Teams module
│   │   ├── documents/         # 文档模块（含版本历史）/ Documents (with versions)
│   │   ├── files/             # 文件上传 / File upload
│   │   ├── trash/             # 回收站 / Trash
│   │   ├── prisma/            # Prisma 服务 / Prisma service
│   │   └── common/            # 守卫、装饰器、拦截器、过滤器 / Guards, decorators, interceptors, filters
│   ├── uploads/               # 上传文件目录 / Upload directory
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/               # 接口封装 / API wrappers
│   │   ├── stores/            # Pinia 状态 / Pinia stores
│   │   ├── router/            # 路由 / Router
│   │   ├── layouts/           # 布局 / Layouts
│   │   └── views/             # 页面 / Views
│   └── .env.example
├── docs/
│   └── REQUIREMENTS.md       # 需求文档 / Requirements doc
└── package.json               # 根编排脚本 / Root orchestration
```

---

## 快速开始 / Quick Start

### 前置条件 / Prerequisites

- Node.js >= 18
- npm >= 9

### 一键启动 / One-click Setup

在根目录执行 / Run in project root:

```bash
# 1. 安装依赖并初始化数据库 / Install deps and init database
npm run setup

# 2. 同时启动前后端 / Start both frontend and backend
npm run dev
```

### 分步启动 / Step-by-step

```bash
# 后端 / Backend
cd backend
npm install
cp .env.example .env
npm run db:generate
npm run db:push        # 创建 SQLite 表 / Create SQLite tables
npm run seed           # 写入种子数据 / Seed data
npm run dev            # http://localhost:3000

# 前端 / Frontend (新终端 / new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev            # http://localhost:5173
```

---

## 默认账号 / Default Account

种子数据提供一个超级管理员账号 / Seed data provides a super admin account:

- **Email**: `admin@example.com`
- **Password**: `admin123`

---

## 核心功能 / Core Features

| 功能 / Feature | 说明 / Description |
| --- | --- |
| 认证 / Authentication | 注册、登录、登出、修改密码；JWT (access + refresh) / Register, login, logout, change password; JWT |
| RBAC 权限 / RBAC | super_admin / team_admin / member 三级角色鉴权 / Three-level role authorization |
| 团队 / Teams | 创建团队、邀请成员、成员列表、移除成员 / Create team, invite members, list & remove members |
| 文档 / Documents | 创建、编辑、列表、详情、删除 / Create, edit, list, detail, delete |
| 版本历史 / Version History | 每次编辑保存快照，查看历史并恢复 / Snapshot per edit, view history and restore |
| 文件上传 / File Upload | 上传到本地 `backend/uploads/`，列表、图片预览、删除 / Upload to local, list, image preview, delete |
| 回收站 / Trash | 文档软删除进入回收站，可恢复或彻底删除 / Soft delete with restore and purge |
| 实时同步 / Real-time Sync | 前端每 5 秒轮询文档版本号 / Frontend polls document version every 5s |

---

## 后端 API / Backend API

统一响应格式 / Unified response: `{ "code": 0, "message": "success", "data": ... }`

| 方法 / Method | 路径 / Path | 说明 / Description |
| --- | --- | --- |
| POST | `/auth/register` | 注册 / Register |
| POST | `/auth/login` | 登录 / Login |
| POST | `/auth/logout` | 登出 / Logout |
| POST | `/auth/change-password` | 修改密码 / Change password |
| GET | `/users/me` | 当前用户 / Current user |
| GET / POST | `/teams` | 团队列表 / 创建 / List / Create teams |
| GET | `/teams/:id` | 团队详情 / Team detail |
| GET / POST | `/teams/:id/members` | 成员列表 / 邀请 / List / invite |
| DELETE | `/teams/:id/members/:userId` | 移除成员 / Remove member |
| GET / POST | `/documents` | 文档列表 / 创建 / List / Create |
| GET / PUT / DELETE | `/documents/:id` | 详情 / 更新 / 删除 / Detail / Update / Delete |
| GET | `/documents/:id/version` | 当前版本号（轮询）/ Current version (polling) |
| GET | `/documents/:id/versions` | 版本历史 / Version history |
| POST | `/documents/:id/versions/:versionId/restore` | 恢复版本 / Restore version |
| POST | `/files/upload` | 上传文件 / Upload file |
| GET | `/files` | 文件列表 / File list |
| DELETE | `/files/:id` | 删除文件 / Delete file |
| GET | `/trash` | 回收站列表 / Trash list |
| POST | `/trash/:documentId/restore` | 恢复文档 / Restore |
| DELETE | `/trash/:documentId` | 彻底删除 / Permanently delete |

---

## 环境变量 / Environment Variables

参见 `backend/.env.example` 与 `frontend/.env.example`。

See `backend/.env.example` and `frontend/.env.example`.

### 切换到 PostgreSQL / Switch to PostgreSQL

编辑 `backend/.env` / Edit `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/team_doc?schema=public"
```

然后将 `prisma/schema.prisma` 中的 `provider = "sqlite"` 改为 `provider = "postgresql"`，重新执行 `npm run db:push`。

Then change `provider = "sqlite"` to `provider = "postgresql"` in `prisma/schema.prisma`, and re-run `npm run db:push`.

---

## 常用脚本 / Useful Scripts

```bash
# 后端 / Backend
npm run dev          # 开发模式 / dev mode
npm run build        # 构建 / build
npm run seed         # 种子数据 / seed
npm run db:migrate   # 迁移 / migrate
npm run db:push      # 同步 schema / push schema
npm run db:generate  # 生成客户端 / generate client

# 前端 / Frontend
npm run dev          # 开发模式 / dev mode
npm run build        # 构建 / build

# 根目录 / Root
npm run dev          # 同时启动前后端 / start both
npm run setup        # 安装并初始化 / install and init
```

---

## 许可 / License

MIT
