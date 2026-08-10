# Content Scheduler · 内容定时发布工具

[中文](#中文) | [English](#english)

---

## 中文

一个基于 Next.js 14 全栈 + TypeScript 的内容管理与定时发布工具 MVP。支持文章管理、分类、定时发布、立即发布、数据统计、邮件通知与任务执行日志。

### 技术栈

- **框架**：Next.js 14（App Router）+ TypeScript
- **ORM**：Prisma（默认 SQLite，可在 `.env` 切换 PostgreSQL）
- **样式**：TailwindCSS
- **认证**：JWT（jose）+ bcryptjs 密码哈希
- **定时任务**：node-cron（独立脚本 `scripts/cron.ts`）
- **邮件**：nodemailer（未配置 SMTP 时走控制台 mock 输出）

### 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 准备环境变量
cp .env.example .env   # Windows: copy .env.example .env

# 3. 创建数据库并执行迁移
npm run db:migrate

# 4. 写入种子数据
npm run seed

# 5. 启动开发服务器
npm run dev
```

打开 http://localhost:3000 ，使用种子账号登录：

- 邮箱：`author@example.com`
- 密码：`author123`

### 启动定时发布（另开终端）

```bash
npm run cron
```

`cron` 每分钟扫描 `status=scheduled` 且 `publishAt<=当前时间` 的文章，自动改为 `published`、写入发布日志、更新每日统计并发送邮件通知（未配置 SMTP 时打印到控制台）。

种子数据中包含一篇「定时发布测试文章」，发布时间为运行 seed 后 2 分钟，启动 cron 后到点会自动发布，便于验证。

### 常用脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建 |
| `npm run start` | 启动生产服务器 |
| `npm run db:migrate` | 创建/应用数据库迁移 |
| `npm run seed` | 写入种子数据 |
| `npm run cron` | 启动定时发布任务（独立进程） |

### 功能清单

- 注册 / 登录 / 登出（JWT + Cookie）
- 文章 CRUD：创建、编辑、保存草稿、列表（分页+状态筛选）、删除
- Markdown 编辑器（textarea + 实时预览）
- 分类 CRUD，文章归属分类
- 定时发布：设置 `publishAt`，状态置为 `scheduled`，cron 到点自动发布
- 立即发布：一键置为 `published`
- 数据统计：总文章 / 已发布 / 草稿 / 定时中 / 总浏览量 / 总点赞；最近 14 天发布趋势柱状图；最近文章
- 浏览量 mock 自增、点赞 +1
- 邮件通知：发布成功/失败时发送（mock 控制台打印）
- 任务执行日志：记录每次 cron / 手动发布结果

### 项目结构

```
content-scheduler/
├── app/                    # Next.js App Router
│   ├── api/                # Route Handlers
│   │   ├── auth/           # 注册/登录/登出/me
│   │   ├── articles/       # 文章 + 发布/定时/点赞
│   │   ├── categories/     # 分类 CRUD
│   │   ├── stats/          # 统计
│   │   └── logs/           # 发布日志
│   ├── articles/           # 文章页面
│   ├── categories/         # 分类页面
│   ├── logs/               # 日志页面
│   ├── register/ login/    # 认证页面
│   ├── layout.tsx page.tsx # 根布局 + 仪表盘
│   └── globals.css
├── components/             # Navbar、AppShell、TrendChart、ArticleEditor
├── lib/                    # db、auth、auth-core、email、stats、publish、markdown
├── prisma/                 # schema.prisma、seed.ts、migrations
├── scripts/                # cron.ts、loadEnv.ts
├── docs/                   # 需求文档
└── .env.example
```

### 切换 PostgreSQL

编辑 `.env`：

```
DATABASE_URL="postgresql://user:password@localhost:5432/content_scheduler?schema=public"
```

并删除 `prisma/schema.prisma` 中 `provider = "sqlite"` 改为 `provider = "postgresql"`，然后重新执行 `npm run db:migrate`。

### 配置邮件通知

在 `.env` 中填写 SMTP 信息，未填写时邮件以 mock 形式打印到 cron/服务器 控制台：

```
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-user"
SMTP_PASS="your-pass"
NOTIFY_FROM="noreply@example.com"
```

---

## English

A content management & scheduled-publishing MVP built with Next.js 14 (full-stack) + TypeScript. Supports article management, categories, scheduled publishing, instant publishing, statistics, email notifications, and task execution logs.

### Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **ORM**: Prisma (SQLite by default; switchable to PostgreSQL via `.env`)
- **Styling**: TailwindCSS
- **Auth**: JWT (jose) + bcryptjs password hashing
- **Cron**: node-cron (standalone script `scripts/cron.ts`)
- **Email**: nodemailer (console mock when SMTP is not configured)

### Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Prepare environment
cp .env.example .env

# 3. Create database & apply migrations
npm run db:migrate

# 4. Seed data
npm run seed

# 5. Start dev server
npm run dev
```

Open http://localhost:3000 and log in with the seed account:

- Email: `author@example.com`
- Password: `author123`

### Start the scheduled-publish worker (separate terminal)

```bash
npm run cron
```

The cron scans every minute for articles with `status=scheduled` and `publishAt<=now`, then flips them to `published`, writes a publish log, updates daily stats, and sends an email notification (printed to console when SMTP is not configured).

The seed data includes a "scheduled publish test" article whose `publishAt` is 2 minutes after seeding — start cron and watch it auto-publish.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run db:migrate` | Create/apply DB migrations |
| `npm run seed` | Seed sample data |
| `npm run cron` | Run the scheduled-publish worker |

### Features

- Register / Login / Logout (JWT + Cookie)
- Article CRUD: create, edit, save draft, list (pagination + status filter), delete
- Markdown editor (textarea + live preview)
- Category CRUD; articles belong to categories
- Scheduled publishing: set `publishAt`, status becomes `scheduled`, cron auto-publishes when due
- Instant publishing: one click to `published`
- Statistics: total / published / draft / scheduled / total views / total likes; 14-day trend bar chart; recent articles
- Mock self-incrementing views, like +1
- Email notifications on publish success/failure (mock console output)
- Execution logs for every cron / manual publish

### Switch to PostgreSQL

Edit `.env`:

```
DATABASE_URL="postgresql://user:password@localhost:5432/content_scheduler?schema=public"
```

Change `provider = "sqlite"` to `provider = "postgresql"` in `prisma/schema.prisma`, then re-run `npm run db:migrate`.

### Configure Email

Fill SMTP details in `.env`. When left empty, emails are mocked to the console:

```
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-user"
SMTP_PASS="your-pass"
NOTIFY_FROM="noreply@example.com"
```
