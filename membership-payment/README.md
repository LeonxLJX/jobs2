# 个人会员与支付闭环网站 / Membership & Payment Website

一个基于 NestJS + Vue3 的全栈会员管理与支付闭环 MVP 项目，支持会员等级体系、每日签到、积分系统、Stripe 支付（默认 Mock 模式）、订单管理、账单与退款审核。

A full-stack membership management & payment MVP built with NestJS + Vue3. Supports membership tiers, daily check-in, points system, Stripe payment (mock mode by default), orders, bills and refund review.

---

## 📌 目录 / Table of Contents

- [技术栈 / Tech Stack](#技术栈--tech-stack)
- [功能特性 / Features](#功能特性--features)
- [项目结构 / Project Structure](#项目结构--project-structure)
- [快速开始 / Quick Start](#快速开始--quick-start)
- [环境变量 / Environment Variables](#环境变量--environment-variables)
- [API 接口 / API Reference](#api-接口--api-reference)
- [演示账号 / Demo Accounts](#演示账号--demo-accounts)
- [支付流程 / Payment Flow](#支付流程--payment-flow)
- [开发说明 / Development Notes](#开发说明--development-notes)

---

## 技术栈 / Tech Stack

### 后端 / Backend
- **NestJS 10** + TypeScript
- **Prisma 5** ORM（默认 SQLite，可切换 PostgreSQL）
- **JWT** 认证 + **bcrypt** 密码加密
- **Stripe** 支付（支持 Mock 模式与真实模式）
- **Passport** JWT 策略

### 前端 / Frontend
- **Vue 3.4** + TypeScript
- **Vite 5** 构建工具
- **Element Plus 2.5** UI 组件库
- **Pinia 2** 状态管理
- **Vue Router 4** 路由
- **Axios** HTTP 请求

---

## 功能特性 / Features

| 模块 | 功能 |
|------|------|
| 🔐 认证 | 注册、登录、登出、修改密码 |
| 👤 用户中心 | 个人信息、修改头像（mock）、会员状态、套餐权益 |
| 💳 会员体系 | free / pro / enterprise 三档，不同权益与配额 |
| 📅 每日签到 | 每天 1 次，7 天循环奖励（+1/+1/+2/+2/+3/+3/+5），连续签到递增 |
| 💰 积分系统 | 签到得积分，积分可 mock 抵扣订单（100 积分 = $1） |
| 💳 支付 | Stripe 订阅制（pro 月付）+ 一次性（enterprise 终身），Mock 模式可手动触发 |
| 📦 订单管理 | 列表、详情、取消未支付订单 |
| 🧾 账单记录 | 支付成功自动生成账单，可查看详情（mock 打印） |
| 🔄 退款申请 | 用户申请退款，管理员审核（approve/reject），通过后降级会员 |

---

## 项目结构 / Project Structure

```
membership-payment/
├── backend/                      # 后端 / Backend
│   ├── prisma/
│   │   ├── schema.prisma         # 数据模型 / Schema
│   │   └── seed.ts               # 种子数据 / Seed
│   ├── src/
│   │   ├── main.ts               # 入口 / Entry
│   │   ├── app.module.ts         # 根模块 / Root module
│   │   ├── prisma/               # Prisma 服务 / Prisma service
│   │   ├── common/               # 公共工具 / Common utils
│   │   │   ├── api-response.ts   # 统一响应 / Unified response
│   │   │   ├── all-exceptions.filter.ts
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   └── current-user.decorator.ts
│   │   ├── auth/                 # 认证模块 / Auth
│   │   ├── users/                # 用户模块 / Users
│   │   ├── plans/                # 套餐模块 / Plans
│   │   ├── sign/                 # 签到模块 / Sign
│   │   ├── points/               # 积分模块 / Points
│   │   ├── payment/              # 支付模块 / Payment
│   │   ├── orders/               # 订单模块 / Orders
│   │   ├── bills/                # 账单模块 / Bills
│   │   └── refunds/              # 退款模块 / Refunds
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/                     # 前端 / Frontend
│   ├── src/
│   │   ├── main.ts
│   │   ├── App.vue
│   │   ├── api/                  # API 请求层 / API layer
│   │   ├── stores/               # Pinia 状态 / Pinia stores
│   │   ├── router/               # 路由 / Router
│   │   ├── layouts/              # 布局 / Layouts
│   │   ├── views/                # 页面 / Views
│   │   │   ├── auth/             # 登录注册 / Auth
│   │   │   ├── orders/           # 订单 / Orders
│   │   │   ├── bills/            # 账单 / Bills
│   │   │   ├── refunds/          # 退款 / Refunds
│   │   │   ├── payment/          # 支付 / Payment
│   │   │   └── admin/            # 管理 / Admin
│   │   ├── types/                # 类型定义 / Types
│   │   └── styles/
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── docs/
│   └── REQUIREMENTS.md           # 需求文档 / Requirements
└── README.md
```

---

## 快速开始 / Quick Start

### 1. 启动后端 / Start Backend

```bash
cd backend

# 安装依赖 / Install dependencies
npm install

# 复制环境变量 / Copy env file
cp .env.example .env

# 生成 Prisma Client / Generate Prisma client
npm run db:generate

# 创建数据库并写入种子数据 / Create DB & seed
npm run db:push
npm run seed

# 启动开发服务器 / Start dev server
npm run dev
```

后端默认运行在 `http://localhost:3000`

### 2. 启动前端 / Start Frontend

```bash
cd frontend

# 安装依赖 / Install dependencies
npm install

# 复制环境变量 / Copy env file
cp .env.example .env

# 启动开发服务器 / Start dev server
npm run dev
```

前端默认运行在 `http://localhost:5173`

### 3. 访问应用 / Open App

打开浏览器访问 `http://localhost:5173`，使用演示账号登录。

Open `http://localhost:5173` in browser, login with demo accounts.

---

## 环境变量 / Environment Variables

### 后端 / Backend (`.env`)

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `DATABASE_URL` | 数据库连接串 / DB URL | `file:./dev.db` (SQLite) |
| `JWT_SECRET` | JWT 密钥 / JWT secret | - |
| `JWT_EXPIRES_IN` | Token 过期 / Token expiry | `7d` |
| `PORT` | 端口 / Port | `3000` |
| `PAYMENT_MODE` | 支付模式 / Payment mode | `mock` |
| `STRIPE_SECRET_KEY` | Stripe 密钥（空则 mock）/ Stripe key | `` |
| `STRIPE_WEBHOOK_SECRET` | Webhook 密钥 / Webhook secret | `` |
| `STRIPE_SUCCESS_URL` | 支付成功跳转 / Success URL | - |
| `STRIPE_CANCEL_URL` | 支付取消跳转 / Cancel URL | - |
| `CORS_ORIGIN` | 跨域源 / CORS origin | `http://localhost:5173` |

切换 PostgreSQL：将 `DATABASE_URL` 改为 `postgresql://user:password@localhost:5432/membership?schema=public`，并将 `prisma/schema.prisma` 中 `provider = "sqlite"` 改为 `provider = "postgresql"`。

To switch to PostgreSQL: change `DATABASE_URL` to a postgres connection string, and update `provider` in `schema.prisma` to `"postgresql"`.

### 前端 / Frontend (`.env`)

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `VITE_API_BASE` | 后端地址 / Backend URL | `http://localhost:3000` |

---

## API 接口 / API Reference

所有接口统一返回 `{ code, message, data }`，`code = 0` 表示成功。

All APIs return `{ code, message, data }`, `code = 0` means success.

### 认证 / Auth
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 注册 |
| POST | `/api/auth/login` | 登录 |
| POST | `/api/auth/logout` | 登出 |
| POST | `/api/auth/change-password` | 修改密码 |

### 用户 / Users
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/users/profile` | 个人信息 |
| PUT | `/api/users/profile` | 更新信息 |

### 套餐 / Plans
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/plans` | 套餐列表 |

### 签到 / Sign
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/sign/checkin` | 签到 |
| GET | `/api/sign/today` | 今日状态 |
| GET | `/api/sign/history` | 签到历史 |

### 积分 / Points
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/points/history` | 积分记录 |

### 支付 / Payment
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/payment/checkout` | 创建支付会话 |
| POST | `/api/payment/mock-webhook` | Mock 触发支付成功 |
| POST | `/api/payment/webhook` | Stripe 真实 Webhook |
| GET | `/api/payment/mock-session/:sessionId` | 查询 Mock 会话 |

### 订单 / Orders
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/orders` | 订单列表 |
| GET | `/api/orders/:id` | 订单详情 |
| POST | `/api/orders/:id/cancel` | 取消订单 |

### 账单 / Bills
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/bills` | 账单列表 |
| GET | `/api/bills/:id` | 账单详情 |

### 退款 / Refunds
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/refunds` | 申请退款 |
| GET | `/api/refunds` | 退款列表 |
| PUT | `/api/refunds/:id/approve` | 通过（管理员） |
| PUT | `/api/refunds/:id/reject` | 拒绝（管理员） |

---

## 演示账号 / Demo Accounts

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 普通用户 / User | `user@example.com` | `user123` |
| 管理员 / Admin | `admin@example.com` | `admin123` |

---

## 支付流程 / Payment Flow

### Mock 模式（默认）/ Mock Mode (default)

```
1. 用户选择套餐 → POST /api/payment/checkout
2. 返回 { sessionId, checkoutUrl }，checkoutUrl 指向前端 /payment/mock-pay?session=xxx
3. 前端跳转到模拟支付页，展示订单信息
4. 用户点击「确认支付」→ POST /api/payment/mock-webhook { sessionId }
5. 后端处理：
   - 订单状态 pending → paid
   - 用户 plan 升级（pro 设 1 个月到期，enterprise 终身）
   - 自动生成账单 Bill
6. 前端跳转订单页，显示已支付
```

### Stripe 真实模式 / Stripe Real Mode

在 `.env` 中配置：
```
PAYMENT_MODE=stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

启动 Stripe CLI 监听 webhook：
```bash
stripe listen --forward-to localhost:3000/api/payment/webhook
```

流程与 Mock 一致，但 `checkoutUrl` 指向 Stripe 官方支付页，支付完成后由 Stripe 调用 webhook 自动更新订单。

---

## 开发说明 / Development Notes

- **代码规范**：代码标识符英文，注释中文 / Code identifiers in English, comments in Chinese
- **统一响应**：所有接口返回 `{ code, message, data }`
- **认证**：JWT Bearer Token，通过 `Authorization: Bearer <token>` 传递
- **数据库**：默认 SQLite 零配置启动，生产环境建议切换 PostgreSQL
- **支付安全**：Mock 模式仅用于开发演示，生产环境务必配置 Stripe 真实密钥与 webhook 验签

### 常用命令 / Common Commands

```bash
# 后端 / Backend
npm run dev          # 开发模式
npm run build        # 构建
npm run seed         # 写入种子数据
npm run db:push      # 推送 schema 到数据库
npm run db:migrate   # 创建迁移
npm run db:generate  # 生成 Prisma Client

# 前端 / Frontend
npm run dev          # 开发模式
npm run build        # 构建
```

---

## License

MIT
