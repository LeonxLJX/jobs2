# 企业后台管理系统 - 需求文档 / Enterprise Admin System - Requirements

> 本文档详细描述企业后台管理系统 MVP 的功能需求、数据模型、接口契约与前端页面规范。
>
> This document details the functional requirements, data model, API contracts, and frontend page specifications of the Enterprise Admin MVP.

---

## 目录 / Table of Contents

- [1. 项目概述 / Overview](#1-项目概述--overview)
- [2. 技术架构 / Tech Architecture](#2-技术架构--tech-architecture)
- [3. 编码规范 / Coding Conventions](#3-编码规范--coding-conventions)
- [4. 数据模型 / Data Model](#4-数据模型--data-model)
- [5. 功能需求 / Functional Requirements](#5-功能需求--functional-requirements)
- [6. 接口契约 / API Contracts](#6-接口契约--api-contracts)
- [7. 前端页面规范 / Frontend Page Specs](#7-前端页面规范--frontend-page-specs)
- [8. 权限设计 / Permission Design](#8-权限设计--permission-design)
- [9. 种子数据 / Seed Data](#9-种子数据--seed-data)
- [10. 非功能需求 / Non-functional Requirements](#10-非功能需求--non-functional-requirements)

---

## 1. 项目概述 / Overview

### 1.1 目标 / Goal

构建一个**可运行 MVP** 的企业后台管理系统，覆盖认证、权限、用户/角色/部门管理、数据看板、系统配置、字典管理与操作审计日志等核心场景，开箱即用（默认 SQLite，零配置）。

Build a runnable MVP of an enterprise admin system covering authentication, permissions, user/role/dept management, dashboard, system config, dictionary, and audit logs. Out-of-the-box with SQLite (zero config).

### 1.2 用户角色 / User Roles

| 角色 / Role | 编码 / Code | 能力 / Capability |
| --- | --- | --- |
| 超级管理员 | `super_admin` | 拥有全部菜单与按钮权限 |
| 编辑 | `editor` | 可管理部门、配置、字典、查看日志，不能管理账号与权限 |
| 访客 | `viewer` | 仅可查看数据看板 |

---

## 2. 技术架构 / Tech Architecture

### 2.1 后端 / Backend

- **框架**：NestJS 10 + TypeScript
- **ORM**：Prisma 5
- **数据库**：默认 SQLite，可通过 `.env` 切换 MySQL
- **认证**：Passport + JWT
- **加密**：bcryptjs（密码哈希，salt rounds = 10）
- **校验**：class-validator + class-transformer
- **目录分层**：每个业务模块包含 `controller` / `service` / `module` / `dto`

### 2.2 前端 / Frontend

- **框架**：Vue 3 + TypeScript + Vite 5
- **UI**：Element Plus 2 + @element-plus/icons-vue
- **状态**：Pinia（`user` store + `permission` store）
- **路由**：Vue Router 4（动态路由）
- **可视化**：ECharts 5
- **HTTP**：Axios（统一封装请求/响应拦截）
- **自动导入**：unplugin-auto-import + unplugin-vue-components

### 2.3 目录结构 / Directory Layout

```
enterprise-admin/
├── backend/
│   ├── prisma/            # schema.prisma + seed.ts
│   └── src/
│       ├── auth/ users/ roles/ depts/ permissions/
│       ├── configs/ dicts/ logs/ dashboard/
│       ├── prisma/        # PrismaService
│       └── common/        # guards / filters / interceptors / decorators / middlewares
└── frontend/
    └── src/
        ├── api/ components/ directives/ layouts/
        ├── router/ stores/ styles/ types/ utils/
        └── views/         # login / dashboard / error / system/*
```

---

## 3. 编码规范 / Coding Conventions

- **代码标识符一律英文**：变量、函数、类、文件名、数据库字段全部使用英文。
- **代码注释一律中文**：所有注释使用中文（可附英文）。
- **统一响应格式**：`{ code: number, message: string, data: any }`。
- **统一错误处理**：全局异常过滤器 `HttpExceptionFilter` 捕获并转换为统一格式。
- **API 前缀**：所有接口统一加 `/api` 前缀。
- **不写测试、不写 Docker**：MVP 范围内不包含单元测试与容器化。

---

## 4. 数据模型 / Data Model

完整 Prisma schema 见 `backend/prisma/schema.prisma`。

### 4.1 User（用户）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | String (cuid) | 主键 |
| username | String | 登录名，唯一 |
| password | String | bcrypt 哈希 |
| name | String | 显示名 |
| email | String? | 邮箱 |
| phone | String? | 电话 |
| deptId | String? | 所属部门 ID |
| status | Int | 1 启用 / 0 禁用 |
| createdAt / updatedAt | DateTime | 时间戳 |

关系：`User 1—N UserRole`，`User 1—N OperationLog`。

### 4.2 Role（角色）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | String | 主键 |
| name | String | 角色名 |
| code | String | 角色编码，唯一（如 `super_admin`） |
| description | String? | 描述 |

关系：`Role 1—N UserRole`，`Role 1—N RolePermission`。

### 4.3 UserRole（用户-角色）

联合唯一：`(userId, roleId)`。

### 4.4 Permission（权限：菜单 + 按钮）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | String | 主键 |
| name | String | 显示名（如「用户管理」） |
| code | String | 权限码，唯一（如 `system:user`） |
| type | String | `menu` 或 `button` |
| parentId | String? | 父级 ID，自关联形成树 |
| path | String? | 路由路径 |
| component | String? | 组件路径（如 `system/user/index`） |
| icon | String? | Element Plus 图标名 |
| sort | Int | 排序值 |

关系：自关联 `parent / children`，`Permission 1—N RolePermission`。

### 4.5 RolePermission（角色-权限）

联合唯一：`(roleId, permissionId)`。

### 4.6 Dept（部门，树形）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | String | 主键 |
| name | String | 部门名 |
| parentId | String? | 父部门 ID |
| sort | Int | 排序 |
| leader | String? | 负责人 |
| status | Int | 1 启用 / 0 禁用 |

### 4.7 SystemConfig（系统配置）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | String | 主键 |
| key | String | 配置键，唯一 |
| value | String | 配置值 |
| remark | String? | 备注 |

### 4.8 DictType（字典类型）/ DictItem（字典项）

- `DictType`：`id / name / code(唯一) / status`，`1—N` 关联 `DictItem`。
- `DictItem`：`id / dictTypeId / label / value / sort / status`。

### 4.9 OperationLog（操作日志）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | String | 主键 |
| userId | String? | 操作用户 ID（可为空，如匿名失败登录） |
| username | String? | 用户名冗余字段 |
| action | String | `login` / `create` / `update` / `delete` / `other` |
| target | String? | 操作目标描述 |
| ip | String? | 请求 IP |
| detail | String? | 详情（JSON 字符串或文本） |
| createdAt | DateTime | 时间 |

索引：`userId`、`createdAt`。

---

## 5. 功能需求 / Functional Requirements

### 5.1 认证 / Authentication

- **登录** `POST /auth/login`：校验用户名密码，返回 JWT。
- **登出** `POST /auth/logout`：前端清除 token（后端为无状态 JWT，可选记录日志）。
- **修改密码** `POST /auth/change-password`：需校验旧密码，新密码 bcrypt 重新哈希。
- **获取当前用户信息** `GET /auth/profile`：返回用户基本信息 + 角色列表。
- **获取当前用户菜单树** `GET /auth/menus`：根据用户角色聚合权限，返回树形菜单（仅 `type=menu`）。

### 5.2 动态路由 / Dynamic Routing

- 前端仅静态注册 `/login`、`/404`。
- 登录后路由守卫调用 `GET /auth/menus`，递归生成 `RouteRecordRaw`。
- 父级菜单用 `Layout` 组件包裹；叶子菜单嵌套一层空 `path` 子路由。
- 路由生成完成后追加 `/:pathMatch(.*)*` 兜底 404。
- 生成失败（token 失效）→ 重置 store 并跳回登录。

### 5.3 菜单权限 / Menu Permission

- 不同角色登录后，左侧 Sidebar 仅渲染其有权限的菜单。
- `super_admin` 自动拥有全部菜单。

### 5.4 按钮级权限 / Button-level Permission

- 自定义指令 `v-permission`，支持字符串或字符串数组。
- 数组情况：满足任一权限码即显示（OR 逻辑）。
- 无权限元素在 `mounted` 钩子中从 DOM 移除（非 `display:none`）。
- 权限码来源：`permissionStore`，由用户菜单树与角色权限聚合。

### 5.5 用户管理 / User Management

- 列表：分页 + 关键词搜索（用户名/姓名/手机号）+ 状态筛选。
- 新增：用户名、姓名、密码、邮箱、电话、部门、状态。
- 编辑：除密码外字段可改。
- 删除：单条删除（不允许删除自己）。
- 重置密码：`POST /users/:id/reset-password`。
- 分配角色：`POST /users/:id/roles`，全量覆盖。

### 5.6 角色管理 / Role Management

- 列表：分页。
- 新增 / 编辑 / 删除。
- 查看角色权限：`GET /roles/:id/permissions`，返回该角色已分配的权限 ID 列表。
- 分配权限：`PUT /roles/:id/permissions`，全量覆盖（菜单 + 按钮）。

### 5.7 部门管理 / Department Management

- 树形展示（`el-table` + `row-key`）。
- 新增（可指定父级）/ 编辑 / 删除。
- 删除前校验是否存在子部门。

### 5.8 数据看板 / Dashboard

- **数字卡片**：总用户数、总订单数（mock）、今日活跃用户数。
- **ECharts 折线图**：近 7 天活跃趋势。
- **ECharts 饼图**：用户角色分布或部门分布。
- 数据来源：`GET /dashboard/stats` 与 `GET /dashboard/charts`。

### 5.9 系统配置 / System Config

- 键值对列表：分页 + 搜索。
- 新增 / 编辑 / 删除。
- `key` 唯一。

### 5.10 字典管理 / Dictionary

- **字典类型**：列表 + CRUD，`code` 唯一。
- **字典项**：按字典类型分组查看 + CRUD，含 `label` / `value` / `sort` / `status`。

### 5.11 操作审计日志 / Audit Log

- 记录关键操作：登录（成功/失败）、新增、修改、删除。
- 通过中间件 / 拦截器自动写入 `OperationLog`。
- 日志列表：分页 + 关键词 + 操作类型筛选 + 时间范围筛选。

---

## 6. 接口契约 / API Contracts

### 6.1 统一响应 / Unified Response

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

错误响应示例 / Error example:

```json
{
  "code": 401,
  "message": "未登录或登录已过期 / Unauthorized",
  "data": null
}
```

### 6.2 认证接口 / Auth APIs

#### `POST /api/auth/login`

请求体 / Request body:
```json
{ "username": "admin", "password": "admin123" }
```
响应 / Response:
```json
{
  "code": 200,
  "message": "success",
  "data": { "token": "xxx.yyy.zzz" }
}
```

#### `POST /api/auth/logout`
无请求体，需带 Authorization 头。返回 `{ code: 200 }`。

#### `POST /api/auth/change-password`
请求体:
```json
{ "oldPassword": "xxx", "newPassword": "yyy" }
```

#### `GET /api/auth/profile`
响应:
```json
{
  "code": 200,
  "data": {
    "id": "...",
    "username": "admin",
    "name": "超级管理员",
    "roles": ["super_admin"]
  }
}
```

#### `GET /api/auth/menus`
响应：当前用户可见菜单树（仅 `type=menu`）。
```json
{
  "code": 200,
  "data": [
    {
      "id": "...",
      "name": "系统管理",
      "code": "system",
      "path": "/system",
      "component": "Layout",
      "icon": "Setting",
      "children": [
        { "id": "...", "name": "用户管理", "code": "system:user", "path": "user", "component": "system/user/index", "icon": "User" }
      ]
    }
  ]
}
```

### 6.3 用户接口 / User APIs

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/users` | 分页查询，query: `page / pageSize / keyword / status` |
| POST | `/api/users` | 新增 |
| GET | `/api/users/:id` | 详情 |
| PUT | `/api/users/:id` | 编辑 |
| DELETE | `/api/users/:id` | 删除 |
| POST | `/api/users/:id/reset-password` | 重置密码，body: `{ password }` |
| POST | `/api/users/:id/roles` | 分配角色，body: `{ roleIds: [] }` |

### 6.4 角色接口 / Role APIs

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/roles` | 分页查询 |
| POST | `/api/roles` | 新增 |
| PUT | `/api/roles/:id` | 编辑 |
| DELETE | `/api/roles/:id` | 删除 |
| GET | `/api/roles/:id/permissions` | 查看已分配权限 ID 列表 |
| PUT | `/api/roles/:id/permissions` | 分配权限，body: `{ permissionIds: [] }` |

### 6.5 部门接口 / Dept APIs

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/depts` | 返回树形 |
| POST | `/api/depts` | 新增 |
| PUT | `/api/depts/:id` | 编辑 |
| DELETE | `/api/depts/:id` | 删除 |

### 6.6 权限接口 / Permission APIs

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/permissions` | 返回树形 |
| POST | `/api/permissions` | 新增菜单/按钮 |
| PUT | `/api/permissions/:id` | 编辑 |
| DELETE | `/api/permissions/:id` | 删除 |

### 6.7 系统配置接口 / System Config APIs

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/system-configs` | 分页 + 搜索 |
| POST | `/api/system-configs` | 新增 |
| PUT | `/api/system-configs/:id` | 编辑 |
| DELETE | `/api/system-configs/:id` | 删除 |

### 6.8 字典接口 / Dictionary APIs

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/dict-types` | 字典类型列表 |
| POST | `/api/dict-types` | 新增类型 |
| PUT | `/api/dict-types/:id` | 编辑类型 |
| DELETE | `/api/dict-types/:id` | 删除类型（级联删项） |
| GET | `/api/dict-items` | 字典项列表，query: `dictTypeId` |
| POST | `/api/dict-items` | 新增项 |
| PUT | `/api/dict-items/:id` | 编辑项 |
| DELETE | `/api/dict-items/:id` | 删除项 |

### 6.9 看板接口 / Dashboard APIs

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/dashboard/stats` | 数字卡片数据 |
| GET | `/api/dashboard/charts` | 图表数据（折线 + 饼图） |

### 6.10 日志接口 / Log APIs

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/logs` | 分页 + 筛选，query: `page / pageSize / keyword / action / startDate / endDate` |

---

## 7. 前端页面规范 / Frontend Page Specs

### 7.1 登录页 / Login

- 居中卡片，用户名 + 密码 + 登录按钮。
- 登录成功后跳转 `redirect` 参数或默认 `/`。
- 表单校验：用户名/密码必填。

### 7.2 布局 / Layout

- 左侧：动态菜单（递归渲染，支持折叠）。
- 顶栏：面包屑（基于当前路由 meta.title）+ 用户下拉（用户名 / 修改密码 / 登出）。
- 内容区：`<router-view>` + `<transition>`。

### 7.3 Dashboard

- 顶部 3 个数字卡片（`el-card` + 大数字）。
- 下方两列：左侧 ECharts 折线图（近 7 天活跃），右侧 ECharts 饼图（角色分布）。
- 图表自适应窗口 resize。

### 7.4 列表页通用规范 / List Page Conventions

- 顶部搜索栏 `el-card`：关键词输入 + 筛选 + 搜索/重置按钮。
- 数据表格 `el-table`：`border` + `stripe` + `v-loading`。
- 分页：通用 `Pagination` 组件（封装 `el-pagination`）。
- 操作列：编辑 / 删除按钮受 `v-permission` 控制。

### 7.5 弹窗表单规范 / Dialog Form Conventions

- `el-dialog` + `el-form` + `FormRules` 校验。
- 提交按钮 loading 状态防重复提交。
- 成功后关闭弹窗并刷新列表。

---

## 8. 权限设计 / Permission Design

### 8.1 权限码命名 / Permission Code Naming

- 菜单：`模块:子模块`，如 `system:user`。
- 按钮：`模块:子模块:动作`，如 `system:user:add`。

### 8.2 权限码清单 / Permission Code List

| 权限码 | 类型 | 说明 |
| --- | --- | --- |
| `dashboard` | menu | 数据看板 |
| `system` | menu | 系统管理目录 |
| `system:user` | menu | 用户管理 |
| `system:user:add` / `edit` / `delete` / `reset` / `assign` | button | 用户操作 |
| `system:role` | menu | 角色管理 |
| `system:role:add` / `edit` / `delete` / `assign` | button | 角色操作 |
| `system:dept` | menu | 部门管理 |
| `system:dept:add` / `edit` / `delete` | button | 部门操作 |
| `system:permission` | menu | 菜单权限管理 |
| `system:permission:add` / `edit` / `delete` | button | 菜单操作 |
| `system:config` | menu | 系统配置 |
| `system:config:add` / `edit` / `delete` | button | 配置操作 |
| `system:dict` | menu | 字典管理 |
| `system:dict:add` / `edit` / `delete` | button | 字典操作 |
| `system:log` | menu | 操作日志（仅查看） |

### 8.3 权限校验流程 / Permission Check Flow

1. 请求到达 `JwtAuthGuard`：校验 JWT，解析用户。
2. `PermissionsGuard`：读取 `@RequirePermissions(...)` 元数据，与用户角色聚合的权限码比对。
3. 前端：路由守卫拉取菜单树生成路由；`v-permission` 指令控制按钮显隐。

---

## 9. 种子数据 / Seed Data

`backend/prisma/seed.ts` 写入以下初始数据 / Initial data seeded:

- **部门**：总公司 → 研发部、市场部。
- **角色**：`super_admin` / `editor` / `viewer`。
- **权限树**：完整菜单 + 按钮权限（见 §8.2）。
- **角色权限**：
  - `super_admin` → 全部权限。
  - `editor` → 看板 + 部门/配置/字典/日志相关权限。
  - `viewer` → 仅看板。
- **用户**：
  - `admin` / `admin123`（super_admin）
  - `viewer` / `user123`（viewer）
- **系统配置**：`site_name`、`site_version`、`default_password`、`login_max_retry` 等。
- **字典**：示例字典类型与字典项。

---

## 10. 非功能需求 / Non-functional Requirements

- **可运行性 / Runnable**：默认 SQLite，`npm install` + `npm run db:push` + `npm run seed` + `npm run dev` 即可启动，无需额外数据库。
- **类型完整 / Type Safety**：前后端均使用 TypeScript，无 `any` 滥用。
- **无占位空文件 / No Empty Placeholders**：所有文件均包含实际实现。
- **无测试 / No Tests**：MVP 不包含单元测试。
- **无 Docker / No Docker**：MVP 不包含容器化配置。
- **跨域 / CORS**：后端通过 `enableCors` 允许前端开发地址跨域。
- **安全 / Security**：JWT 鉴权、密码 bcrypt 哈希、生产环境须修改 `JWT_SECRET`。
