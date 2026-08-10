# 需求文档 / Requirements Document

# 个人会员与支付闭环网站 / Membership & Payment Website

> 版本 / Version: 1.0.0
> 日期 / Date: 2026-07-30

---

## 目录 / Table of Contents

1. [项目概述 / Overview](#1-项目概述--overview)
2. [技术架构 / Tech Architecture](#2-技术架构--tech-architecture)
3. [数据模型 / Data Model](#3-数据模型--data-model)
4. [功能需求 / Functional Requirements](#4-功能需求--functional-requirements)
5. [API 接口规范 / API Specification](#5-api-接口规范--api-specification)
6. [前端页面需求 / Frontend Pages](#6-前端页面需求--frontend-pages)
7. [业务流程 / Business Flows](#7-业务流程--business-flows)
8. [非功能需求 / Non-functional Requirements](#8-非功能需求--non-functional-requirements)
9. [交付清单 / Deliverables](#9-交付清单--deliverables)

---

## 1. 项目概述 / Overview

### 1.1 项目目标 / Goal

构建一个可运行的 MVP，实现个人会员管理与支付闭环，包含认证、会员等级、签到积分、支付、订单、账单、退款等完整功能。

Build a runnable MVP implementing personal membership management and payment closed-loop, including auth, membership tiers, check-in/points, payment, orders, bills, and refunds.

### 1.2 目标用户 / Target Users

- **普通用户**：注册、签到、订阅会员、查看订单与账单、申请退款
- **管理员**：审核退款申请、管理用户会员状态

### 1.3 核心价值 / Core Value

- 零配置可启动（SQLite + Mock 支付）
- 完整支付闭环（创建订单 → 支付 → 升级会员 → 生成账单）
- 双模式支付（Mock 开发 / Stripe 生产）

---

## 2. 技术架构 / Tech Architecture

### 2.1 后端 / Backend

| 组件 | 技术 | 版本 |
|------|------|------|
| 框架 | NestJS | 10.x |
| 语言 | TypeScript | 5.x |
| ORM | Prisma | 5.x |
| 数据库 | SQLite（默认）/ PostgreSQL | - |
| 认证 | JWT + Passport + bcrypt | - |
| 支付 | Stripe SDK | 14.x |
| 校验 | class-validator + class-transformer | - |

### 2.2 前端 / Frontend

| 组件 | 技术 | 版本 |
|------|------|------|
| 框架 | Vue 3 | 3.4.x |
| 语言 | TypeScript | 5.x |
| 构建 | Vite | 5.x |
| UI | Element Plus | 2.5.x |
| 状态 | Pinia | 2.x |
| 路由 | Vue Router | 4.x |
| HTTP | Axios | 1.6.x |

### 2.3 架构图 / Architecture

```
┌─────────────┐      HTTP/JSON       ┌─────────────┐
│  Frontend   │  ←─────────────────→  │  Backend    │
│  Vue3+EP    │   /api/*              │  NestJS     │
└─────────────┘                       └──────┬──────┘
                                             │
                                     ┌───────┴───────┐
                                     │   Prisma ORM  │
                                     └───────┬───────┘
                                             │
                                     ┌───────┴───────┐
                                     │  SQLite / PG  │
                                     └───────────────┘
                                             │
                          ┌──────────────────┴──────────────────┐
                          │  Stripe (可选) / Mock 支付（默认）    │
                          └─────────────────────────────────────┘
```

---

## 3. 数据模型 / Data Model

### 3.1 User（用户）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| email | String | 唯一邮箱 |
| password | String | bcrypt 哈希 |
| name | String | 昵称 |
| avatar | String? | 头像 URL |
| role | String | `user` / `admin` |
| plan | String | `free` / `pro` / `enterprise` |
| points | Int | 积分余额 |
| planExpireAt | DateTime? | 套餐到期时间（终身为 null） |
| lastSignDate | DateTime? | 最后签到日期 |
| signStreak | Int | 连续签到天数 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

### 3.2 MembershipPlan（会员套餐）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| name | String | 套餐名 |
| code | String | 唯一编码：`free` / `pro` / `enterprise` |
| price | Float | 价格 |
| currency | String | 货币（默认 usd） |
| billingType | String | `subscription` / `oneshot` |
| interval | String? | 周期：`month` / `year` / `lifetime` |
| features | String (JSON) | 权益列表 JSON 字符串 |
| active | Boolean | 是否上架 |

### 3.3 Order（订单）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| userId | String | 用户 ID |
| planId | String | 套餐 ID |
| amount | Float | 实付金额（抵扣后） |
| currency | String | 货币 |
| status | String | `pending` / `paid` / `cancelled` / `refunded` |
| type | String | `subscription` / `oneshot` |
| stripeSessionId | String? | 支付会话 ID |
| pointsUsed | Int | 使用的积分数量 |
| paidAt | DateTime? | 支付时间 |
| cancelledAt | DateTime? | 取消时间 |
| createdAt | DateTime | 创建时间 |

### 3.4 Bill（账单）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| userId | String | 用户 ID |
| orderId | String | 订单 ID（唯一） |
| amount | Float | 金额 |
| currency | String | 货币 |
| issuedAt | DateTime | 开具时间 |

### 3.5 RefundRequest（退款申请）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| userId | String | 申请人 |
| orderId | String | 订单 ID |
| reason | String | 退款原因 |
| status | String | `pending` / `approved` / `rejected` |
| reviewedBy | String? | 审核人 ID |
| reviewedAt | DateTime? | 审核时间 |
| createdAt | DateTime | 创建时间 |

### 3.6 SignLog（签到记录）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| userId | String | 用户 ID |
| date | DateTime | 签到日期（按天） |
| pointsAwarded | Int | 获得积分 |

约束：`(userId, date)` 联合唯一，每个用户每天仅可签到一次。

### 3.7 PointsLog（积分记录）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| userId | String | 用户 ID |
| change | Int | 变动量（正获得，负消耗） |
| reason | String | 变动原因 |
| balance | Int | 变动后余额 |
| createdAt | DateTime | 创建时间 |

---

## 4. 功能需求 / Functional Requirements

### 4.1 认证模块 / Auth

| 编号 | 需求 | 优先级 |
|------|------|--------|
| AUTH-01 | 用户注册（邮箱+密码+昵称），密码 bcrypt 加密 | P0 |
| AUTH-02 | 用户登录，返回 JWT Token | P0 |
| AUTH-03 | 用户登出（前端清除 Token） | P0 |
| AUTH-04 | 修改密码（需旧密码验证） | P0 |
| AUTH-05 | 注册赠送 50 积分 | P1 |

### 4.2 用户中心 / User Center

| 编号 | 需求 | 优先级 |
|------|------|--------|
| USER-01 | 查看个人信息（昵称、邮箱、头像、角色） | P0 |
| USER-02 | 修改昵称与头像（mock：直接存 URL） | P0 |
| USER-03 | 查看会员状态（等级、到期时间、权益） | P0 |
| USER-04 | 查看积分余额与签到连续天数 | P1 |

### 4.3 会员等级体系 / Membership Tiers

| 编号 | 需求 | 优先级 |
|------|------|--------|
| PLAN-01 | 三档套餐：free（免费）/ pro（$9.9/月）/ enterprise（$199 终身） | P0 |
| PLAN-02 | 每档套餐有独立权益列表（features JSON） | P0 |
| PLAN-03 | 套餐支持订阅制（subscription）与一次性（oneshot） | P0 |
| PLAN-04 | 前端展示套餐对比与升级 CTA | P0 |

### 4.4 每日签到 / Daily Check-in

| 编号 | 需求 | 优先级 |
|------|------|--------|
| SIGN-01 | 每天可签到 1 次（按天去重） | P0 |
| SIGN-02 | 7 天循环奖励：+1/+1/+2/+2/+3/+3/+5 积分 | P0 |
| SIGN-03 | 连续签到天数递增，断签重置为第 1 天 | P0 |
| SIGN-04 | 签到记录入库（SignLog） | P0 |
| SIGN-05 | 查询今日签到状态与下次奖励 | P0 |
| SIGN-06 | 查询签到历史（含日历视图） | P1 |

### 4.5 积分系统 / Points

| 编号 | 需求 | 优先级 |
|------|------|--------|
| PTS-01 | 签到获得积分，记录到 PointsLog | P0 |
| PTS-02 | 积分可 mock 抵扣订单（100 积分 = $1） | P0 |
| PTS-03 | 抵扣后扣减积分并记录；订单取消时返还 | P0 |
| PTS-04 | 积分变动历史列表（分页） | P1 |

### 4.6 支付 / Payment

| 编号 | 需求 | 优先级 |
|------|------|--------|
| PAY-01 | 创建 checkout session，返回 sessionId + checkoutUrl | P0 |
| PAY-02 | Mock 模式：返回前端模拟支付页 URL | P0 |
| PAY-03 | Mock 模式：手动触发 `/payment/mock-webhook` 模拟支付成功 | P0 |
| PAY-04 | Stripe 真实模式：调用 Stripe API 创建 session | P1 |
| PAY-05 | Stripe webhook 验证签名后处理支付成功 | P1 |
| PAY-06 | 支付成功：订单 pending → paid，用户 plan 升级，生成账单 | P0 |
| PAY-07 | 订阅制（pro）设 1 个月到期，一次性（enterprise）终身 | P0 |

### 4.7 订单管理 / Orders

| 编号 | 需求 | 优先级 |
|------|------|--------|
| ORD-01 | 订单列表（支持按状态过滤） | P0 |
| ORD-02 | 订单详情（含套餐、账单、退款记录） | P0 |
| ORD-03 | 取消未支付订单（仅 pending 可取消） | P0 |
| ORD-04 | 取消时若使用积分抵扣，返还积分 | P0 |
| ORD-05 | 继续支付未完成订单（跳转 mock 支付页） | P1 |

### 4.8 账单记录 / Bills

| 编号 | 需求 | 优先级 |
|------|------|--------|
| BILL-01 | 支付成功自动生成账单 | P0 |
| BILL-02 | 账单列表 | P0 |
| BILL-03 | 账单详情页（mock：可打印） | P0 |

### 4.9 退款申请 / Refunds

| 编号 | 需求 | 优先级 |
|------|------|--------|
| REF-01 | 用户对已支付订单申请退款（填写原因） | P0 |
| REF-02 | 同一订单不可重复申请（pending 状态存在时拒绝） | P0 |
| REF-03 | 用户查看自己的退款列表 | P0 |
| REF-04 | 管理员查看全部退款申请 | P0 |
| REF-05 | 管理员审核：approve / reject | P0 |
| REF-06 | 审核通过：订单状态 → refunded，用户降级为 free | P0 |
| REF-07 | 审核拒绝：订单保持 paid | P0 |

---

## 5. API 接口规范 / API Specification

### 5.1 统一响应格式 / Unified Response

```json
{
  "code": 0,
  "message": "success",
  "data": { }
}
```

- `code = 0`：成功
- `code != 0`：失败（`message` 为错误信息）

### 5.2 认证方式 / Authentication

除注册/登录外，所有接口需在 Header 携带：

```
Authorization: Bearer <token>
```

### 5.3 接口列表 / Endpoint List

#### 认证 / Auth
| 方法 | 路径 | Body | 说明 |
|------|------|------|------|
| POST | `/api/auth/register` | `{email, password, name}` | 注册 |
| POST | `/api/auth/login` | `{email, password}` | 登录 |
| POST | `/api/auth/logout` | - | 登出 |
| POST | `/api/auth/change-password` | `{oldPassword, newPassword}` | 改密 |

#### 用户 / Users
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/users/profile` | 获取个人信息 |
| PUT | `/api/users/profile` | 更新个人信息 |

#### 套餐 / Plans
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/plans` | 套餐列表 |

#### 签到 / Sign
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/sign/checkin` | 签到 |
| GET | `/api/sign/today` | 今日状态 |
| GET | `/api/sign/history?days=30` | 签到历史 |

#### 积分 / Points
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/points/history?page=1&pageSize=20` | 积分记录 |

#### 支付 / Payment
| 方法 | 路径 | Body | 说明 |
|------|------|------|------|
| POST | `/api/payment/checkout` | `{planId, pointsUsed?}` | 创建支付会话 |
| POST | `/api/payment/mock-webhook` | `{sessionId}` | Mock 触发支付成功 |
| POST | `/api/payment/webhook` | Stripe raw body | Stripe webhook |
| GET | `/api/payment/mock-session/:sessionId` | - | 查询 Mock 会话 |

#### 订单 / Orders
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/orders?status=pending` | 订单列表 |
| GET | `/api/orders/:id` | 订单详情 |
| POST | `/api/orders/:id/cancel` | 取消订单 |

#### 账单 / Bills
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/bills` | 账单列表 |
| GET | `/api/bills/:id` | 账单详情 |

#### 退款 / Refunds
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/refunds` | 申请退款 |
| GET | `/api/refunds?scope=all&status=pending` | 退款列表 |
| PUT | `/api/refunds/:id/approve` | 通过（管理员） |
| PUT | `/api/refunds/:id/reject` | 拒绝（管理员） |

---

## 6. 前端页面需求 / Frontend Pages

| 页面 | 路由 | 说明 |
|------|------|------|
| 登录 | `/login` | 邮箱密码登录，含演示账号提示 |
| 注册 | `/register` | 注册新账号 |
| 首页 | `/home` | Hero 区 + 套餐展示 + 升级 CTA |
| 用户中心 | `/profile` | 个人信息 + 会员状态 + 修改密码 |
| 签到页 | `/sign` | 签到按钮 + 7天奖励循环 + 日历 + 积分记录 |
| 定价页 | `/pricing` | 3 档套餐 + 积分抵扣 + 立即订阅 |
| 模拟支付页 | `/payment/mock-pay` | Mock 支付确认 |
| 支付结果页 | `/payment/success` `/payment/cancel` | 支付成功/取消 |
| 订单列表 | `/orders` | 订单表格 + 状态过滤 |
| 订单详情 | `/orders/:id` | 订单详情 + 操作按钮 |
| 账单列表 | `/bills` | 账单表格 |
| 账单详情 | `/bills/:id` | 可打印账单 |
| 退款记录 | `/refunds` | 退款列表 + 申请对话框 |
| 退款审核 | `/admin/refunds` | 管理员审核页 |

---

## 7. 业务流程 / Business Flows

### 7.1 签到流程 / Check-in Flow

```
用户点击签到按钮
    │
    ▼
后端校验今日是否已签到（按天去重）
    │ 已签 ──→ 返回错误「今日已签到」
    │ 未签
    ▼
计算连续签到天数：
    - 昨天签过 → streak + 1
    - 昨天没签 → 重置为 1
    │
    ▼
根据 7 天循环表计算奖励：(streak-1) % 7
    → [+1, +1, +2, +2, +3, +3, +5]
    │
    ▼
事务写入：
    1. SignLog 签到记录
    2. PointsLog 积分记录
    3. User 更新 points / lastSignDate / signStreak
    │
    ▼
返回奖励信息
```

### 7.2 支付流程 / Payment Flow

```
用户选择套餐 + 可选积分抵扣
    │
    ▼
POST /payment/checkout { planId, pointsUsed }
    │
    ▼
后端创建 Order（pending）+ 扣减积分（若有）
    │
    ▼
Mock 模式：生成 mock_session_id，返回前端支付页 URL
Stripe 模式：调用 Stripe 创建 session，返回 Stripe URL
    │
    ▼
前端跳转支付页
    │
    ▼
Mock：用户点击确认 → POST /payment/mock-webhook
Stripe：用户支付完成 → Stripe 调用 webhook
    │
    ▼
后端 handlePaymentSuccess：
    1. Order.status → paid, paidAt = now
    2. User.plan → 套餐 code
       - subscription: planExpireAt = now + 1 月
       - oneshot: planExpireAt = null（终身）
    3. 创建 Bill 账单（upsert）
    │
    ▼
前端跳转订单页，显示已支付 + 会员升级
```

### 7.3 退款流程 / Refund Flow

```
用户对已支付订单申请退款（填写原因）
    │
    ▼
POST /refunds { orderId, reason }
    │
    ▼
后端校验：
    - 订单状态 = paid
    - 无 pending 退款申请
    │
    ▼
创建 RefundRequest（pending）
    │
    ▼
管理员在 /admin/refunds 审核
    │
    ├─ 通过 approve：
    │     1. RefundRequest.status → approved
    │     2. Order.status → refunded
    │     3. User.plan → free, planExpireAt = null
    │
    └─ 拒绝 reject：
          RefundRequest.status → rejected
          订单保持 paid
```

---

## 8. 非功能需求 / Non-functional Requirements

| 编号 | 需求 | 说明 |
|------|------|------|
| NFR-01 | 零配置启动 | SQLite 默认，无需安装数据库 |
| NFR-02 | 双支付模式 | Mock 开发 + Stripe 生产，.env 切换 |
| NFR-03 | 代码规范 | 标识符英文，注释中文 |
| NFR-04 | 类型完整 | 前后端 TypeScript，无 any 滥用 |
| NFR-05 | 统一响应 | 所有 API 返回 `{code, message, data}` |
| NFR-06 | 安全 | JWT 认证，bcrypt 密码，Stripe webhook 验签 |
| NFR-07 | 数据库可切换 | SQLite → PostgreSQL 仅改 .env |
| NFR-08 | 无占位空文件 | 所有文件均有实际内容 |

---

## 9. 交付清单 / Deliverables

### 9.1 后端 / Backend

- [x] Prisma schema（7 个模型）
- [x] Seed 种子数据（2 用户 + 3 套餐 + 历史订单/账单/签到/积分）
- [x] 9 个业务模块（auth/users/plans/sign/points/payment/orders/bills/refunds）
- [x] JWT 认证 + 角色守卫
- [x] 统一响应 + 全局异常过滤
- [x] Mock + Stripe 双支付模式
- [x] .env.example 配置模板

### 9.2 前端 / Frontend

- [x] 路由配置 + 登录守卫 + 角色守卫
- [x] Pinia auth store
- [x] Axios 请求封装（自动携带 token + 统一解包）
- [x] 9 个 API 模块
- [x] 主布局（顶栏导航 + 用户下拉）
- [x] 14 个页面视图
- [x] 类型定义完整

### 9.3 文档 / Documentation

- [x] README.md（中英文双语）
- [x] docs/REQUIREMENTS.md（中英文双语详细需求）

### 9.4 演示数据 / Demo Data

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 普通用户 | user@example.com | user123 |
| 管理员 | admin@example.com | admin123 |

---

> 文档结束 / End of Document
