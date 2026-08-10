# Mid Full-Stack Engineer 商业项目集 | Commercial Projects Collection

> 刘鑫 (Liu Xin) · liuzhaoxing373@gmail.com · 15190420098 · GitHub: https://github.com/LeonxLJX
>
> 5 个独立可运行的全栈商业 MVP 项目，覆盖企业协作、AI SaaS、后台管理、内容发布、会员支付等真实业务场景。

---

## 📦 项目清单 | Project List

| # | 项目名称 | 技术栈 | 业务亮点 |
|---|---------|--------|---------|
| 1 | [多租户团队文档协作平台](./team-doc-collaboration) | NestJS + Vue3 + Element Plus + PostgreSQL | RBAC 权限、文档版本历史、实时同步 |
| 2 | [AI 智能问答 SaaS 系统](./ai-rag-saas) | Next.js 14 + Prisma + PostgreSQL + Mock RAG | 文档向量化、RAG 检索、配额订阅 |
| 3 | [企业后台管理系统](./enterprise-admin) | NestJS + Vue3 + Element Plus + MySQL | 动态路由、按钮级权限、数据看板 |
| 4 | [内容定时发布工具](./content-scheduler) | Next.js 14 + Prisma + PostgreSQL + node-cron | 草稿、定时发布、数据统计、邮件通知 |
| 5 | [会员与支付闭环网站](./membership-payment) | NestJS + Vue3 + Stripe + PostgreSQL | 会员等级、签到、Stripe 支付、Webhook |

---

## 🚀 快速开始 | Quick Start

每个项目都是独立可运行的 MVP，进入对应目录按其 README 操作即可：

```bash
cd team-doc-collaboration   # 或 ai-rag-saas / enterprise-admin / content-scheduler / membership-payment
cp .env.example .env        # 复制环境变量模板
npm install                 # 安装依赖（前后端分别执行，详见各项目 README）
npm run dev                 # 启动开发服务
```

> 默认使用 SQLite / 本地文件存储以便开箱即用，可通过 `.env` 切换到 PostgreSQL / MySQL。

---

## 📐 约定 | Conventions

- **代码**：变量 / 函数 / 类名使用英文 | Code identifiers in English
- **注释**：使用中文 | Comments in Chinese
- **文档**：README / REQUIREMENTS 等均为中英文双语 | Docs bilingual (CN + EN)
- **技术栈**：按简历混合，NestJS+Vue3 与 Next.js 全栈混搭 | Mixed stack per resume
- **完成度**：可运行 MVP（核心业务闭环 + 关键页面 + 数据库 schema）| Runnable MVP

---

## 📂 工作区结构 | Workspace Structure

```
新建文件夹 (38)/
├── README.md                          # 本文件 | This file
├── REQUIREMENTS.md                    # 总体需求文档（中英文）| Master requirements
├── Mid Full-Stack Engineer Resume...pdf
├── team-doc-collaboration/            # 项目1
├── ai-rag-saas/                       # 项目2
├── enterprise-admin/                  # 项目3
├── content-scheduler/                 # 项目4
└── membership-payment/                # 项目5
```

每个项目子目录包含：
- `README.md` — 项目说明（中英文）
- `docs/REQUIREMENTS.md` — 详细需求文档（中英文）
- `package.json` / `.env.example` — 依赖与环境变量
- `backend/` + `frontend/`（NestJS+Vue3 项目）或根目录（Next.js 项目）
- 数据库 schema（Prisma schema 或 SQL 文件）

---

## 🔧 全局技术栈 | Global Tech Stack

| 分类 | 技术 |
|------|------|
| 前端 | Vue3, Next.js 14, TypeScript, Pinia, TailwindCSS, Element Plus |
| 后端 | Node.js, NestJS, Express, RESTful API, JWT |
| 数据库 | PostgreSQL, MySQL, SQLite(MVP 默认), Redis |
| 任务 | node-cron, 异步队列 |
| DevOps | Git, Docker(可选), Docker Compose(可选) |
| 集成 | Stripe 支付, Webhook, 文件存储, 邮件通知 |

---

## 📞 联系方式 | Contact

- **Name**: Liu Xin (刘鑫)
- **Email**: liuzhaoxing373@gmail.com
- **Phone**: 15190420098
- **GitHub**: https://github.com/LeonxLJX
