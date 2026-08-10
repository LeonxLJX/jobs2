# 总体需求文档 | Master Requirements Document

> 本文档汇总 5 个全栈商业项目的总体需求、技术约束与交付标准。
>
> This document aggregates the overall requirements, technical constraints and delivery standards for 5 full-stack commercial projects.

---

## 1. 项目背景 | Background

为完整呈现中级全栈工程师在真实商业场景下的从 0 到 1 开发能力，构建 5 个独立可运行的全栈 MVP 项目，覆盖：

1. **企业协作** — 多租户团队文档协作平台
2. **AI SaaS** — 基于 RAG 的智能文档问答系统
3. **后台管理** — 通用企业后台管理系统
4. **内容运营** — 内容定时发布工具
5. **商业闭环** — 会员与支付闭环网站

每个项目均包含：用户认证 / 权限控制 / 核心业务 CRUD / 数据库设计 / 前端关键页面 / 后端 RESTful API。

---

## 2. 技术约束 | Technical Constraints

### 2.1 技术栈分配 | Stack Assignment

| 项目 | 前端 | 后端 | 数据库 | 说明 |
|------|------|------|--------|------|
| team-doc-collaboration | Vue3 + Element Plus + Pinia | NestJS + Prisma | PostgreSQL(SQLite MVP) | 企业级 CRUD 标准 |
| ai-rag-saas | Next.js 14 App Router (全栈) | Next.js Route Handlers + Prisma | PostgreSQL(SQLite MVP) | AI 应用主流方案 |
| enterprise-admin | Vue3 + Element Plus + Pinia | NestJS + Prisma | MySQL(SQLite MVP) | 经典后台组合 |
| content-scheduler | Next.js 14 App Router (全栈) | Next.js + Prisma + node-cron | PostgreSQL(SQLite MVP) | 内容站点方案 |
| membership-payment | Vue3 + Element Plus + Pinia | NestJS + Prisma + Stripe | PostgreSQL(SQLite MVP) | 支付闭环 |

### 2.2 编码规范 | Coding Conventions

- **代码标识符**：英文（变量、函数、类、文件名）| English identifiers
- **代码注释**：中文 | Chinese comments
- **文档**：中英文双语（README、REQUIREMENTS）| Bilingual docs
- **commit message / 错误信息**：英文 | English
- **TypeScript**：所有项目使用 TS | All projects use TypeScript

### 2.3 可运行 MVP 标准 | Runnable MVP Standard

每个项目必须满足：
- ✅ `npm install` 无致命错误
- ✅ `npm run dev` 可启动开发服务
- ✅ 提供种子数据脚本（至少 1 个管理员账号 + 示例业务数据）
- ✅ 前端可登录并演示核心业务流程
- ✅ 后端 API 可通过 Postman / curl 验证
- ✅ 默认使用 SQLite，无需额外安装数据库即可运行
- ✅ `.env.example` 完整列出所有环境变量

---

## 3. 通用功能模块 | Common Modules

以下模块在多个项目中复用，实现方式保持一致：

### 3.1 认证模块 | Authentication
- JWT 签发与校验（access token + refresh token）
- 注册 / 登录 / 登出 / 修改密码
- 密码使用 bcrypt 哈希存储

### 3.2 权限模块 | Authorization
- RBAC 角色权限模型（super_admin / admin / member）
- 中间件 / 守卫统一鉴权
- 前端路由守卫 + 按钮级权限指令

### 3.3 文件存储 | File Storage
- 本地文件存储（MVP 默认）
- 可切换到 S3 兼容存储（通过 .env 配置）

### 3.4 错误处理 | Error Handling
- 统一响应格式：`{ code, message, data }`
- 全局异常过滤器 / 中间件
- 前端 axios 拦截器统一处理

---

## 4. 各项目核心需求摘要 | Per-Project Requirements Summary

### 4.1 多租户团队文档协作平台 | Team Doc Collaboration
- 用户注册 / 登录 / 团队邀请
- RBAC：超级管理员 / 团队管理员 / 普通成员
- 文档创建 / 在线编辑 / 版本历史 / 恢复
- 文件上传 / 预览 / 分类 / 回收站
- 实时数据同步（轮询或 WebSocket）

### 4.2 AI 智能问答 SaaS 系统 | AI RAG SaaS
- PDF / Markdown 文档上传与解析
- 文本分块 + 向量嵌入存储（Mock 默认，可配置真实 Embedding API）
- RAG 检索 + 智能问答 + 来源溯源
- 用户使用量统计 + 免费配额限制
- 会员订阅功能
- 异步队列处理文档解析

### 4.3 企业后台管理系统 | Enterprise Admin
- 动态路由 + 菜单权限 + 按钮级权限
- 用户管理 / 角色管理 / 部门管理
- 数据看板 + 可视化统计图表
- 系统参数配置 / 字典管理 / 操作审计日志

### 4.4 内容定时发布工具 | Content Scheduler
- 文章编辑 / 草稿保存 / 定时发布 / 分类管理
- node-cron 定时任务自动发布 + 执行状态记录
- 数据统计：浏览量 / 点赞 / 访问趋势
- 邮件通知：任务完成 / 异常提醒

### 4.5 会员与支付闭环网站 | Membership & Payment
- 用户中心 / 会员等级体系 / 每日签到奖励
- Stripe 支付：订阅 + 一次性付款
- Webhook 回调验证 + 订单状态自动更新
- 订单管理 / 账单记录 / 退款申请与审核

---

## 5. 交付物清单 | Deliverables Checklist

每个项目交付：

| 交付物 | 路径 | 语言 |
|--------|------|------|
| 项目说明 | `README.md` | 中英文 |
| 详细需求文档 | `docs/REQUIREMENTS.md` | 中英文 |
| 环境变量模板 | `.env.example` | 英文 |
| 数据库 Schema | `prisma/schema.prisma` 或 `db/schema.sql` | 英文 |
| 后端源码 | `backend/src/` 或 `app/` | 英文代码 + 中文注释 |
| 前端源码 | `frontend/src/` 或 `app/` `components/` | 英文代码 + 中文注释 |
| 种子数据脚本 | `prisma/seed.ts` 或 `seed.ts` | 英文代码 + 中文注释 |

---

## 6. 验收标准 | Acceptance Criteria

- [ ] 5 个项目目录结构完整
- [ ] 每个项目 README + REQUIREMENTS 中英文齐全
- [ ] 每个项目 `npm install && npm run dev` 可启动
- [ ] 每个项目至少 3 个核心 API 可用
- [ ] 每个项目至少 3 个前端页面可访问
- [ ] 代码标识符英文，注释中文
- [ ] 种子数据可初始化管理员账号
- [ ] `.env.example` 完整

---

## 7. 联系方式 | Contact

- **Name**: Liu Xin (刘鑫)
- **Email**: liuzhaoxing373@gmail.com
- **Phone**: 15190420098
- **GitHub**: https://github.com/LeonxLJX
