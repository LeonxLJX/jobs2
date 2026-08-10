# 需求文档 / Requirements

[中文](#中文需求) | [English](#english-requirements)

---

## 中文需求

### 1. 项目概述

构建一个内容管理与定时发布工具 MVP，支持作者创建文章、管理分类、定时或立即发布，并查看发布统计与执行日志。

### 2. 技术要求

- 框架：Next.js 14（App Router）+ TypeScript
- ORM：Prisma，默认 SQLite，`.env` 可切换 PostgreSQL
- 样式：TailwindCSS
- 定时任务：node-cron，独立脚本运行
- 认证：JWT（jose）+ bcrypt 密码哈希
- 邮件：nodemailer，未配置 SMTP 时控制台 mock 输出

### 3. 用户角色

- 单一角色：作者（注册用户），所有数据按用户隔离。

### 4. 功能需求

#### 4.1 认证

- 注册：邮箱、用户名、密码（≥6 位）、可选通知邮箱。
- 登录：邮箱 + 密码，签发 JWT 并写入 httpOnly Cookie。
- 登出：清除 Cookie。

#### 4.2 文章管理

- 创建文章（标题、内容、摘要、分类）。
- 编辑文章。
- 保存为草稿（status=draft）。
- 文章列表：分页 + 按状态（草稿/定时中/已发布）筛选。
- 删除文章。

#### 4.3 富文本编辑

- 使用 textarea + Markdown 实时预览（不引入重型富文本库）。
- 支持标题、粗体、斜体、代码、引用、列表、链接等基础 Markdown 语法。

#### 4.4 分类管理

- 分类 CRUD（名称、描述）。
- 文章可归属一个分类；删除分类后文章变为无分类。

#### 4.5 定时发布

- 设置 `publishAt` 时间，状态置为 `scheduled`。
- node-cron 每分钟扫描 `status=scheduled` 且 `publishAt<=now` 的文章。
- 到点自动：状态改为 `published`、记录 `publishedAt`、写入 `PublishLog`、更新 `StatDaily`、发送邮件。

#### 4.6 立即发布

- 手动发布按钮：立即将状态改为 `published`，记录日志与统计。

#### 4.7 数据统计

- 汇总：总文章数、已发布数、草稿数、定时中数、总浏览量、总点赞数。
- 趋势：最近 14 天每日发布数柱状图。
- 最近文章列表。
- 浏览量 mock 自增（查看文章详情时 +1）。
- 点赞 +1。

#### 4.8 邮件通知

- 发布成功 / 失败时发送邮件到用户的 `notifyEmail`（或注册邮箱）。
- 未配置 SMTP 时在控制台 mock 打印。

#### 4.9 任务执行日志

- 记录每次 cron 执行与手动发布的执行结果（success/failed、消息、时间）。
- 日志页面分页查看，关联文章标题。

### 5. 数据模型

| 模型 | 字段 |
| --- | --- |
| User | id, email, password, name, notifyEmail, createdAt |
| Category | id, userId, name, description, createdAt |
| Article | id, userId, categoryId, title, content, excerpt, status(draft\|scheduled\|published), publishAt, publishedAt, views, likes, createdAt, updatedAt |
| PublishLog | id, articleId, status(success\|failed), message, executedAt |
| StatDaily | id, userId, date, publishedCount, totalViews |

### 6. API 接口

- `POST /api/auth/register`、`POST /api/auth/login`、`POST /api/auth/logout`、`GET /api/auth/me`
- `GET/POST /api/articles`
- `GET/PUT/DELETE /api/articles/:id`
- `POST /api/articles/:id/publish`（立即发布）
- `POST /api/articles/:id/schedule`（设置定时）
- `POST /api/articles/:id/like`（点赞 +1）
- `GET/POST/PUT/DELETE /api/categories`、`PUT/DELETE /api/categories/:id`
- `GET /api/stats`（汇总 + 趋势 + 最近文章）
- `GET /api/logs`（分页日志）

### 7. 前端页面

- `/register`、`/login`
- `/`（仪表盘：统计卡片 + 趋势图 + 最近文章）
- `/articles`（列表 + 筛选 + 新建）
- `/articles/new`、`/articles/:id/edit`（编辑器：标题 + 分类 + 内容 + 预览 + 状态操作）
- `/categories`（分类管理）
- `/logs`（发布日志）

### 8. 定时任务

- `scripts/cron.ts`：node-cron 每分钟运行。
- 启动后立即执行一次扫描，随后按 `CRON_SCHEDULE`（默认 `* * * * *`）定时执行。
- 通过 `npm run cron` 启动，需另开终端。

### 9. 种子数据

- 1 个用户：`author@example.com` / `author123`
- 3 个分类：技术、生活、笔记
- 5 篇文章：2 已发布、2 草稿、1 定时中（发布时间为 seed 后 2 分钟，便于验证 cron）
- 若干 StatDaily：最近 2 天趋势数据

### 10. 非功能要求

- 代码标识符一律英文，注释一律中文。
- 类型完整，无占位空文件。
- 不写测试、不写 Docker。

---

## English Requirements

### 1. Overview

Build a content management & scheduled-publishing MVP. Authors can create articles, manage categories, publish on schedule or instantly, and view publishing statistics and execution logs.

### 2. Tech Requirements

- Framework: Next.js 14 (App Router) + TypeScript
- ORM: Prisma; SQLite by default, switchable to PostgreSQL via `.env`
- Styling: TailwindCSS
- Cron: node-cron, run as a standalone script
- Auth: JWT (jose) + bcrypt password hashing
- Email: nodemailer; console mock when SMTP is not configured

### 3. User Roles

- Single role: Author (registered user). All data is isolated per user.

### 4. Functional Requirements

#### 4.1 Authentication

- Register: email, name, password (≥6 chars), optional notify email.
- Login: email + password, issue JWT into an httpOnly cookie.
- Logout: clear cookie.

#### 4.2 Article Management

- Create article (title, content, excerpt, category).
- Edit article.
- Save as draft (status=draft).
- List: pagination + filter by status (draft/scheduled/published).
- Delete article.

#### 4.3 Rich Text Editing

- textarea + Markdown live preview (no heavy rich-text library).
- Support headings, bold, italic, code, blockquote, lists, links.

#### 4.4 Category Management

- Category CRUD (name, description).
- An article belongs to one category; deleting a category sets article's category to null.

#### 4.5 Scheduled Publishing

- Set `publishAt`; status becomes `scheduled`.
- node-cron scans every minute for `status=scheduled` and `publishAt<=now`.
- On due: set status to `published`, record `publishedAt`, write `PublishLog`, update `StatDaily`, send email.

#### 4.6 Instant Publishing

- A manual "publish now" button: immediately set status to `published`, log and update stats.

#### 4.7 Statistics

- Summary: total / published / draft / scheduled counts, total views, total likes.
- Trend: 14-day daily published-count bar chart.
- Recent articles list.
- Mock self-incrementing views (on article detail fetch).
- Like +1.

#### 4.8 Email Notifications

- Send email on publish success/failure to user's `notifyEmail` (or registered email).
- Console mock when SMTP is not configured.

#### 4.9 Execution Logs

- Record every cron run and manual publish result (success/failed, message, time).
- Paginated log page with article title.

### 5. Data Models

| Model | Fields |
| --- | --- |
| User | id, email, password, name, notifyEmail, createdAt |
| Category | id, userId, name, description, createdAt |
| Article | id, userId, categoryId, title, content, excerpt, status(draft\|scheduled\|published), publishAt, publishedAt, views, likes, createdAt, updatedAt |
| PublishLog | id, articleId, status(success\|failed), message, executedAt |
| StatDaily | id, userId, date, publishedCount, totalViews |

### 6. API

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET/POST /api/articles`
- `GET/PUT/DELETE /api/articles/:id`
- `POST /api/articles/:id/publish` (instant publish)
- `POST /api/articles/:id/schedule` (set schedule)
- `POST /api/articles/:id/like` (like +1)
- `GET/POST/PUT/DELETE /api/categories`, `PUT/DELETE /api/categories/:id`
- `GET /api/stats` (summary + trend + recent)
- `GET /api/logs` (paginated logs)

### 7. Pages

- `/register`, `/login`
- `/` (dashboard: stat cards + trend chart + recent articles)
- `/articles` (list + filter + new)
- `/articles/new`, `/articles/:id/edit` (editor: title + category + content + preview + status actions)
- `/categories` (category management)
- `/logs` (publish logs)

### 8. Cron Job

- `scripts/cron.ts`: node-cron runs every minute.
- Runs once immediately on start, then on `CRON_SCHEDULE` (default `* * * * *`).
- Start via `npm run cron` in a separate terminal.

### 9. Seed Data

- 1 user: `author@example.com` / `author123`
- 3 categories: Tech, Life, Notes
- 5 articles: 2 published, 2 drafts, 1 scheduled (publishAt = seed time + 2 min, to verify cron)
- Some StatDaily: 2 days of trend data

### 10. Non-Functional

- Code identifiers in English; comments in Chinese.
- Complete types, no placeholder empty files.
- No tests, no Docker.
