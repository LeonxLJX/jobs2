# 企业后台管理系统 / Enterprise Admin System

> 一个开箱即用的企业级后台管理系统 MVP，基于 NestJS + Vue3 + Prisma 实现，内置认证、动态路由、菜单与按钮级权限、数据看板与操作审计日志。
>
> An out-of-the-box enterprise admin MVP built with NestJS + Vue3 + Prisma. Ships with authentication, dynamic routing, menu & button-level permissions, a data dashboard, and operation audit logs.

---

## 目录 / Table of Contents

- [功能特性 / Features](#功能特性--features)
- [技术栈 / Tech Stack](#技术栈--tech-stack)
- [项目结构 / Project Structure](#项目结构--project-structure)
- [快速开始 / Quick Start](#快速开始--quick-start)
- [默认账号 / Default Credentials](#默认账号--default-credentials)
- [可用脚本 / Available Scripts](#可用脚本--available-scripts)
- [环境变量 / Environment Variables](#环境变量--environment-variables)
- [核心概念 / Core Concepts](#核心概念--core-concepts)
- [API 概览 / API Overview](#api-概览--api-overview)
- [切换到 MySQL / Switch to MySQL](#切换到-mysql--switch-to-mysql)
- [许可证 / License](#许可证--license)

---

## 功能特性 / Features

| 模块 / Module | 能力 / Capability |
| --- | --- |
| 认证 / Auth | 登录、登出、修改密码、获取当前用户信息、获取当前用户菜单树 |
| 动态路由 / Dynamic Routing | 后端返回用户菜单树，前端根据权限动态生成路由（`router.addRoute`） |
| 菜单权限 / Menu Permission | 不同角色登录后看到不同的左侧菜单 |
| 按钮级权限 / Button Permission | 自定义指令 `v-permission` 控制按钮显隐 |
| 用户管理 / User | 分页 + 搜索、新增、编辑、删除、重置密码、分配角色 |
| 角色管理 / Role | 列表、新增、编辑、删除、分配权限（菜单 + 按钮） |
| 部门管理 / Dept | 树形结构、新增、编辑、删除 |
| 数据看板 / Dashboard | 数字卡片（用户数 / 订单数 / 今日活跃）+ ECharts 折线图 + 饼图 |
| 系统配置 / System Config | 键值对参数管理 |
| 字典管理 / Dictionary | 字典类型 + 字典项管理 |
| 操作审计日志 / Audit Log | 记录登录、增删改等关键操作；日志列表分页 + 筛选 |

---

## 技术栈 / Tech Stack

**后端 / Backend**
- NestJS 10 + TypeScript
- Prisma 5（默认 SQLite，可切 MySQL）
- Passport + JWT
- bcryptjs（密码加密）
- class-validator / class-transformer（参数校验与统一响应）

**前端 / Frontend**
- Vue 3 + TypeScript + Vite 5
- Element Plus 2 + @element-plus/icons-vue
- Pinia（状态管理）
- Vue Router 4（动态路由）
- ECharts 5（数据可视化）
- Axios（HTTP 请求）
- unplugin-auto-import / unplugin-vue-components（自动导入）

**数据库 / Database**
- 默认 SQLite（开箱即用，零配置）
- 可通过 `.env` 切换为 MySQL

---

## 项目结构 / Project Structure

```
enterprise-admin/
├── backend/                       # 后端 / Backend
│   ├── prisma/
│   │   ├── schema.prisma          # 数据模型 / Data model
│   │   └── seed.ts                # 种子数据 / Seed data
│   ├── src/
│   │   ├── auth/                  # 认证模块 / Auth module
│   │   ├── users/                 # 用户模块 / User module
│   │   ├── roles/                 # 角色模块 / Role module
│   │   ├── depts/                 # 部门模块 / Dept module
│   │   ├── permissions/           # 权限模块 / Permission module
│   │   ├── configs/               # 系统配置 / System config
│   │   ├── dicts/                 # 字典管理 / Dictionary
│   │   ├── logs/                  # 操作日志 / Operation log
│   │   ├── dashboard/             # 数据看板 / Dashboard
│   │   ├── prisma/                # Prisma 服务 / Prisma service
│   │   ├── common/                # 公共能力 / Common (guards/filters/interceptors/decorators)
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env.example
│   └── package.json
├── frontend/                      # 前端 / Frontend
│   ├── src/
│   │   ├── api/                   # 接口封装 / API wrappers
│   │   ├── components/            # 通用组件 / Common components
│   │   ├── directives/            # 自定义指令 / Custom directives (v-permission)
│   │   ├── layouts/               # 布局 / Layout (Sidebar / Header / Breadcrumb)
│   │   ├── router/                # 路由 / Router (动态路由生成)
│   │   ├── stores/                # Pinia 状态 / Pinia stores (user / permission)
│   │   ├── styles/                # 全局样式 / Global styles
│   │   ├── types/                 # 类型定义 / Type definitions
│   │   ├── utils/                 # 工具函数 / Utilities
│   │   ├── views/                 # 页面 / Views
│   │   │   ├── login/
│   │   │   ├── dashboard/
│   │   │   ├── error/404.vue
│   │   │   └── system/
│   │   │       ├── user/
│   │   │       ├── role/
│   │   │       ├── dept/
│   │   │       ├── permission/
│   │   │       ├── config/
│   │   │       ├── dict/
│   │   │       └── log/
│   │   ├── App.vue
│   │   └── main.ts
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── docs/
│   └── REQUIREMENTS.md            # 详细需求文档 / Detailed requirements
└── README.md
```

---

## 快速开始 / Quick Start

### 环境要求 / Prerequisites

- Node.js >= 18
- npm >= 9（或 pnpm / yarn 均可）

### 1. 启动后端 / Start Backend

```bash
cd backend

# 安装依赖 / Install dependencies
npm install

# 复制环境变量 / Copy env file
cp .env.example .env    # Windows: copy .env.example .env

# 生成 Prisma Client 并创建数据库 / Generate Prisma client & create database
npm run db:push

# 写入种子数据 / Seed initial data
npm run seed

# 启动开发服务器 / Start dev server
npm run dev
```

后端默认运行在 `http://localhost:3000`。
Backend runs at `http://localhost:3000` by default.

### 2. 启动前端 / Start Frontend

```bash
cd frontend

# 安装依赖 / Install dependencies
npm install

# 启动开发服务器 / Start dev server
npm run dev
```

前端默认运行在 `http://localhost:5173`。
Frontend runs at `http://localhost:5173` by default.

### 3. 访问系统 / Open the App

浏览器打开 `http://localhost:5173`，使用默认账号登录。
Open `http://localhost:5173` in your browser and log in with the default credentials.

---

## 默认账号 / Default Credentials

种子数据内置以下账号 / Seed data ships with these accounts:

| 用户名 / Username | 密码 / Password | 角色 / Role | 说明 / Description |
| --- | --- | --- | --- |
| `admin` | `admin123` | super_admin | 拥有全部权限 / Full permissions |
| `viewer` | `user123` | viewer | 仅可看数据看板 / Dashboard only |

---

## 可用脚本 / Available Scripts

### 后端 / Backend

| 命令 / Command | 说明 / Description |
| --- | --- |
| `npm run dev` | 启动开发服务器（watch 模式） |
| `npm run build` | 构建生产产物 |
| `npm run start` | 运行构建后的产物 |
| `npm run seed` | 写入种子数据 |
| `npm run db:migrate` | 创建并应用数据库迁移 |
| `npm run db:push` | 将 schema 推送到数据库（开发推荐） |
| `npm run db:generate` | 重新生成 Prisma Client |
| `npm run prisma:studio` | 打开 Prisma Studio 可视化管理 |

### 前端 / Frontend

| 命令 / Command | 说明 / Description |
| --- | --- |
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 类型检查 + 构建生产产物 |
| `npm run preview` | 预览构建产物 |

---

## 环境变量 / Environment Variables

后端配置文件 `backend/.env`（参考 `.env.example`）/ Backend config `backend/.env` (see `.env.example`):

| 变量 / Variable | 默认值 / Default | 说明 / Description |
| --- | --- | --- |
| `DATABASE_URL` | `file:./dev.db` | 数据库连接串。SQLite 用 `file:./xxx.db`，MySQL 用 `mysql://user:pass@host:port/db` |
| `JWT_SECRET` | `super-secret-key-please-change-in-production` | JWT 签名密钥，**生产环境务必修改** |
| `JWT_EXPIRES_IN` | `7d` | Token 过期时间 |
| `PORT` | `3000` | 后端端口 |
| `CORS_ORIGIN` | `http://localhost:5173` | 允许跨域的前端地址 |

前端配置文件 `frontend/.env` / Frontend config `frontend/.env`:

| 变量 / Variable | 说明 / Description |
| --- | --- |
| `VITE_API_BASE_URL` | 后端 API 基础地址，默认 `http://localhost:3000/api` |

---

## 核心概念 / Core Concepts

### 1. 统一响应格式 / Unified Response Format

所有接口统一返回 / All APIs return:

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

### 2. 动态路由 / Dynamic Routing

1. 用户登录后，前端调用 `GET /auth/menus` 获取当前用户可见的菜单树。
2. 前端在 `router/index.ts` 中递归生成 `RouteRecordRaw`，并通过 `router.addRoute` 注入。
3. 静态路由仅包含 `/login` 与 `/404`，业务路由全部由后端权限驱动。

After login, the frontend fetches the user's menu tree via `GET /auth/menus`, generates route records recursively, and injects them with `router.addRoute`. Only `/login` and `/404` are static.

### 3. 按钮级权限 / Button-level Permission

使用自定义指令 `v-permission` 控制 / Use the `v-permission` directive:

```vue
<!-- 单个权限码 / Single code -->
<el-button v-permission="'system:user:add'">新增</el-button>

<!-- 多个权限码（满足其一即可）/ Multiple codes (any match) -->
<el-button v-permission="['system:user:edit', 'system:user:delete']">操作</el-button>
```

无权限的元素会在 `mounted` 阶段从 DOM 中移除。
Unauthorized elements are removed from the DOM in the `mounted` hook.

### 4. RBAC 权限模型 / RBAC Model

```
User ──< UserRole >── Role ──< RolePermission >── Permission
                                                              ├── type=menu   (菜单)
                                                              └── type=button (按钮)
```

- `super_admin` 角色自动拥有全部权限（前端菜单全量返回）。
- 其他角色按 `RolePermission` 关联表过滤。

---

## API 概览 / API Overview

全局前缀 / Global prefix: `/api`

| 方法 / Method | 路径 / Path | 说明 / Description |
| --- | --- | --- |
| POST | `/auth/login` | 登录 |
| POST | `/auth/logout` | 登出 |
| POST | `/auth/change-password` | 修改密码 |
| GET | `/auth/profile` | 获取当前用户信息 |
| GET | `/auth/menus` | 获取当前用户菜单树 |
| GET/POST/PUT/DELETE | `/users` | 用户 CRUD |
| POST | `/users/:id/reset-password` | 重置用户密码 |
| POST | `/users/:id/roles` | 给用户分配角色 |
| GET/POST/PUT/DELETE | `/roles` | 角色 CRUD |
| GET | `/roles/:id/permissions` | 查看角色权限 |
| PUT | `/roles/:id/permissions` | 给角色分配权限 |
| GET/POST/PUT/DELETE | `/depts` | 部门 CRUD（树形） |
| GET/POST/PUT/DELETE | `/permissions` | 菜单/按钮权限 CRUD（树形） |
| GET/POST/PUT/DELETE | `/system-configs` | 系统配置 CRUD |
| GET/POST/PUT/DELETE | `/dict-types` | 字典类型 CRUD |
| GET/POST/PUT/DELETE | `/dict-items` | 字典项 CRUD |
| GET | `/dashboard/stats` | 看板数字卡片数据 |
| GET | `/dashboard/charts` | 看板图表数据 |
| GET | `/logs` | 操作日志列表（分页 + 筛选） |

完整字段与请求体详见 `docs/REQUIREMENTS.md`。
For full field definitions and request bodies, see `docs/REQUIREMENTS.md`.

---

## 切换到 MySQL / Switch to MySQL

1. 修改 `backend/prisma/schema.prisma`，将 `provider = "sqlite"` 改为 `provider = "mysql"`。
2. 修改 `backend/.env`：

   ```env
   DATABASE_URL="mysql://root:password@localhost:3306/enterprise_admin"
   ```

3. 重新推送 schema 并写入种子数据：

   ```bash
   npm run db:push
   npm run seed
   ```

> ⚠️ 切换数据库后，Prisma 会重新建表，原有 SQLite 数据不会自动迁移。
> After switching databases, Prisma recreates tables; existing SQLite data is not migrated automatically.

---

## 许可证 / License

MIT
