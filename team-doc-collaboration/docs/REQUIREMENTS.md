# 需求文档 / Requirements Document

## 多租户团队文档协作平台 / Multi-tenant Team Document Collaboration Platform

---

## 1. 概述 / Overview

### 中文
本项目是一个可运行的 MVP 多租户团队文档协作平台。系统采用前后端分离架构，后端基于 NestJS + Prisma，前端基于 Vue3 + Element Plus。默认使用 SQLite 数据库以实现开箱即用，同时支持通过环境变量切换到 PostgreSQL。

### English
This project is a runnable MVP multi-tenant team document collaboration platform. It adopts a separated frontend/backend architecture: the backend is built with NestJS + Prisma, and the frontend with Vue3 + Element Plus. SQLite is used by default for zero-config startup, with PostgreSQL support via environment variables.

---

## 2. 技术栈 / Tech Stack

### 中文
- 后端：NestJS、TypeScript、Prisma ORM、JWT、bcrypt、multer
- 前端：Vue3、TypeScript、Vite、Element Plus、Pinia、Vue Router
- 数据库：默认 SQLite，可切换 PostgreSQL

### English
- Backend: NestJS, TypeScript, Prisma ORM, JWT, bcrypt, multer
- Frontend: Vue3, TypeScript, Vite, Element Plus, Pinia, Vue Router
- Database: SQLite by default, switchable to PostgreSQL

---

## 3. 用户角色与权限 / Roles & Permissions

### 中文
系统定义三种角色：

| 角色 | 范围 | 权限 |
| --- | --- | --- |
| super_admin | 全局 | 拥有所有团队与系统的最高权限 |
| team_admin | 团队 | 管理所属团队成员（邀请、移除）、管理文档 |
| member | 团队 | 编辑所属团队的文档、上传文件 |

角色鉴权通过后端 `RolesGuard` 守卫与 `@Roles()` 装饰器实现。

### English
The system defines three roles:

| Role | Scope | Permissions |
| --- | --- | --- |
| super_admin | Global | Full access to all teams and system |
| team_admin | Team | Manage team members (invite, remove) and documents |
| member | Team | Edit documents and upload files in joined teams |

Authorization is enforced via the backend `RolesGuard` and `@Roles()` decorator.

---

## 4. 功能需求 / Functional Requirements

### 4.1 认证 / Authentication

#### 中文
- 注册：邮箱 + 密码 + 姓名，密码使用 bcrypt 哈希存储。
- 登录：返回 access token 与 refresh token。
- 登出：清除服务端 refresh token。
- 修改密码：校验旧密码后更新，并使 refresh token 失效。
- JWT 守卫保护所有需认证的接口。

#### English
- Register: email + password + name, password hashed with bcrypt.
- Login: returns access token and refresh token.
- Logout: clears server-side refresh token.
- Change password: verifies old password then updates, invalidating refresh token.
- JWT guard protects all authenticated endpoints.

### 4.2 团队 / Teams

#### 中文
- 创建团队：创建者自动成为团队 owner 与 team_admin。
- 团队列表：返回当前用户所属的全部团队。
- 团队详情：包含 owner、成员、文档/文件数量统计。
- 邀请成员：按邮箱查找用户并加入团队，可指定角色。
- 移除成员：team_admin 或 super_admin 可移除非 owner 成员。
- 成员校验：所有团队相关操作均校验调用者是否为团队成员。

#### English
- Create team: creator becomes owner and team_admin automatically.
- Team list: returns all teams the current user belongs to.
- Team detail: includes owner, members, and counts of documents/files.
- Invite member: find user by email and add to team with a role.
- Remove member: team_admin or super_admin can remove non-owner members.
- Membership check: all team-related operations verify caller is a member.

### 4.3 文档 / Documents

#### 中文
- 创建文档：指定团队，写入初始内容并生成首个版本快照（version=1）。
- 文档列表：按团队返回未删除的文档，按更新时间倒序。
- 文档详情：返回标题、内容、版本号、owner 等信息。
- 编辑文档：标题或内容变化时，自增版本号并保存新版本快照。
- 删除文档：软删除（设置 deletedAt），进入回收站。

#### English
- Create document: specify team, write initial content, and create the first version snapshot (version=1).
- Document list: returns non-deleted documents of a team, sorted by updatedAt desc.
- Document detail: returns title, content, version, owner, etc.
- Edit document: increments version and saves a new snapshot when title or content changes.
- Delete document: soft delete (sets deletedAt), moves to trash.

### 4.4 版本历史 / Version History

#### 中文
- 每次内容变化都保存一条 DocumentVersion 记录（版本号、标题、内容、编辑者、时间）。
- 查看历史：按版本号倒序返回全部版本。
- 恢复版本：将文档内容恢复到指定版本，并生成一个新版本快照（版本号继续递增），不覆盖历史记录。

#### English
- Each content change saves a DocumentVersion record (version, title, content, editor, time).
- View history: returns all versions sorted by version desc.
- Restore version: restores document to a specified version and creates a new version snapshot (version continues incrementing) without overwriting history.

### 4.5 文件上传 / File Upload

#### 中文
- 上传文件到本地 `backend/uploads/`，使用唯一文件名存储。
- 文件列表：按团队返回，含上传者、类型、大小。
- 预览：图片类型可在前端直接预览。
- 删除：同时删除数据库记录与磁盘文件。
- 静态服务：后端通过 `/uploads/` 前缀提供静态文件访问。

#### English
- Upload files to local `backend/uploads/` with unique filenames.
- File list: returns by team with uploader, type, size.
- Preview: image types can be previewed inline on the frontend.
- Delete: removes both the DB record and the disk file.
- Static serving: backend serves files under the `/uploads/` prefix.

### 4.6 回收站 / Trash

#### 中文
- 回收站列表：按团队返回已软删除的文档，按删除时间倒序。
- 恢复：清除 deletedAt，文档回到正常列表。
- 彻底删除：从数据库永久删除文档及其所有版本快照。

#### English
- Trash list: returns soft-deleted documents of a team, sorted by deletedAt desc.
- Restore: clears deletedAt, returning the document to the normal list.
- Permanently delete: removes the document and all its version snapshots from the database.

### 4.7 实时同步 / Real-time Sync

#### 中文
采用简易轮询方案：前端在文档编辑页每 5 秒请求一次 `/documents/:id/version` 获取最新版本号。若服务端版本号大于本地版本号，则提示用户远程有更新，可手动重新加载。

#### English
A simple polling approach is used: the frontend requests `/documents/:id/version` every 5 seconds on the edit page to get the latest version. If the server version is greater than the local version, the user is notified that a remote update exists and can manually reload.

---

## 5. 数据模型 / Data Model

### 中文

| 模型 | 关键字段 |
| --- | --- |
| User | id, email, password, name, role, refreshToken, createdAt |
| Team | id, name, ownerId, createdAt |
| TeamMember | id, teamId, userId, role（team_admin / member）|
| Document | id, teamId, title, content, ownerId, deletedAt, currentVersion, createdAt, updatedAt |
| DocumentVersion | id, documentId, version, title, content, editorId, createdAt |
| FileAsset | id, teamId, filename, originalName, mimeType, size, path, uploaderId, createdAt |

### English

| Model | Key Fields |
| --- | --- |
| User | id, email, password, name, role, refreshToken, createdAt |
| Team | id, name, ownerId, createdAt |
| TeamMember | id, teamId, userId, role (team_admin / member) |
| Document | id, teamId, title, content, ownerId, deletedAt, currentVersion, createdAt, updatedAt |
| DocumentVersion | id, documentId, version, title, content, editorId, createdAt |
| FileAsset | id, teamId, filename, originalName, mimeType, size, path, uploaderId, createdAt |

---

## 6. API 规范 / API Specification

### 中文
- 所有接口返回统一格式 `{ code, message, data }`，`code === 0` 表示成功。
- 错误响应包含 `code`（HTTP 状态码）、`message`、`path`、`timestamp`。
- 需认证接口要求请求头携带 `Authorization: Bearer <accessToken>`。
- RESTful 路径设计，资源命名复数形式。

### English
- All endpoints return `{ code, message, data }`, where `code === 0` means success.
- Error responses include `code` (HTTP status), `message`, `path`, `timestamp`.
- Authenticated endpoints require the `Authorization: Bearer <accessToken>` header.
- RESTful path design with plural resource names.

---

## 7. 前端页面 / Frontend Pages

### 中文
- 登录页 / 注册页
- 主布局：左侧菜单（团队、文档、文件、回收站）+ 顶栏用户下拉
- 团队列表 / 团队详情（成员管理 + 邀请 + 移除）
- 文档列表 / 文档编辑页（标题输入 + 内容编辑区 + 保存 + 版本历史抽屉 + 轮询同步提示）
- 文件管理页（上传 + 列表 + 图片预览）
- 回收站页（恢复 + 彻底删除）
- 个人中心（信息展示 + 修改密码）

### English
- Login / Register pages
- Main layout: left menu (teams, documents, files, trash) + top user dropdown
- Team list / Team detail (member management + invite + remove)
- Document list / Document edit (title input + content editor + save + version history drawer + polling sync notice)
- File management (upload + list + image preview)
- Trash (restore + permanent delete)
- Profile (info display + change password)

---

## 8. 非功能需求 / Non-functional Requirements

### 中文
- 代码标识符一律英文，注释一律中文，错误信息与 commit message 一律英文。
- 所有源码使用 TypeScript。
- 数据库默认 SQLite，开箱即用，无需安装外部服务。
- 文件上传大小默认限制 10MB（可配置）。
- 提供 `.env.example` 完整环境变量样例。
- 提供种子数据脚本，便于快速体验。

### English
- All code identifiers in English, comments in Chinese, error messages and commit messages in English.
- All source code uses TypeScript.
- Database defaults to SQLite for zero-config, no external service required.
- File upload size limited to 10MB by default (configurable).
- A complete `.env.example` is provided.
- A seed script is provided for quick onboarding.

---

## 9. 交付物 / Deliverables

### 中文
1. 完整后端：NestJS 模块化结构、Prisma schema、种子数据、JWT 守卫、RBAC 中间件。
2. 完整前端：路由、状态管理、API 封装、布局与全部页面。
3. README.md（中英文双语）。
4. docs/REQUIREMENTS.md（中英文双语）。

### English
1. Complete backend: NestJS modular structure, Prisma schema, seed data, JWT guard, RBAC middleware.
2. Complete frontend: router, state management, API wrappers, layout, and all pages.
3. README.md (bilingual Chinese/English).
4. docs/REQUIREMENTS.md (bilingual Chinese/English).
