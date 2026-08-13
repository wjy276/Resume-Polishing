# 智简优面 · 一站式 AI 求职助手

基于 **uni-app（Vue 3）** 开发的跨平台求职助手，主打 **AI 简历优化**：在线编辑简历、多模板实时预览、通过多智能体流水线对简历进行诊断与优化，并提供职位推荐、模拟面试、职业引导等求职能力。

> 当前主要面向 H5 运行，工程同时保留微信小程序、App 等多端构建能力。

---

## ✨ 功能特性

### 用户体系
- 登录 / 注册（独立登录页 + 全局登录弹窗）
- Token 过期自动识别：任何请求返回 401 时自动清理登录态并弹出登录弹窗
- 头像展示（默认头像本地化）、侧边栏与首页顶部退出登录

### 简历编辑
- A4 纸张实时预览，所见即所得
- 多套内置模板：经典 / 商务 / 创意 / 简约，每套有独立主题背景
- 富文本编辑器（TipTap）：模块内容、格式、列表等
- 模块自由增删、排序、显隐，标题可自定义
- 新建简历自动预填示例内容，用户可直接修改
- 模板广场：内置“示例简历模板”，支持一键创建
- 浏览器打印导出 PDF

### AI 智能优化
- 多 Agent 流水线：
  `简历解析 → 求职画像 → JD 解析 → 简历诊断 → 策略规划 → 模块优化 → 事实校对`
- 匹配分析报告、重点优化项、模块级优化建议
- 逐模块确认 / 一键应用，优化结果可直接写回简历
- 事实校对对话：高风险问题提示、原文对照、接受/忽略
- 求职意向（Career Intent）沉淀为全局优化提示词

### 其他模块
- 职位推荐：岗位列表、详情、技能匹配
- 模拟面试：多轮问答与职业引导
- 个人中心：简历列表、投递记录、收藏岗位、面试安排

---

## 🧱 技术栈

| 技术 | 版本 | 用途 |
| --- | --- | --- |
| uni-app | 3.0.0-5000420260318001 | 跨端应用框架 |
| Vue | 3.4.21 | 前端框架（Composition API + `<script setup>`） |
| Pinia | 2.1.7 | 全局状态管理（user / resume / aiOptimize / careerIntent / template） |
| TipTap | 3.22.4 | 富文本编辑 |
| Sass | 1.98.0 | 样式预处理 |
| Vite | 5.2.8 | 构建工具 |

---

## 📁 目录结构

```text
.
├── src
│   ├── api                  # 接口层（用户/简历/模板/AI Agent/职位）
│   ├── components           # 业务组件
│   │   ├── AIOptimize       # AI 优化相关（分析面板、对话、模块优化等）
│   │   ├── LoginPopup       # 登录/注册弹窗
│   │   ├── ResumeTemplates  # 简历模板组件
│   │   ├── TemplateGallery  # 模板广场
│   │   └── resume           # 简历编辑（侧边栏、编辑面板、A4 预览渲染）
│   ├── pages                # 页面
│   │   ├── Home             # 首页
│   │   ├── Job              # 职位推荐 / 职位详情
│   │   ├── Interview        # 模拟面试 / 面试模板
│   │   ├── Login            # 独立登录页
│   │   ├── My               # 个人中心
│   │   └── Resume           # 我的简历 / 简历编辑器
│   ├── stores               # Pinia stores
│   ├── styles               # 全局样式
│   ├── utils                # 工具（序列化、数据转换、简历模板引导等）
│   ├── static               # 静态资源（logo、头像等）
│   └── pages.json           # 页面路由配置
├── static                   # 公共静态资源
├── tests                    # 单元测试
├── openspec                 # OpenSpec 规范与变更记录
├── pages                    # 项目文档（技术难点分析等）
├── vite.config.js           # Vite / 开发代理配置
└── package.json
```

---

## 🚀 快速开始

### 环境要求

- Node.js **18+**
- npm（或 pnpm / yarn）

### 安装依赖

```bash
npm install
```

### 启动 H5 开发服务

```bash
npm run dev:h5
```

默认访问 `http://localhost:5173`。

### 构建 H5 生产包

```bash
npm run build:h5
```

构建产物输出到 `dist/build/h5`。

### 多端构建

工程预置了小程序 / App 等多端脚本，例如：

```bash
npm run dev:mp-weixin      # 微信小程序开发
npm run build:mp-weixin    # 微信小程序构建
npm run build:mp-alipay    # 支付宝小程序构建
```

完整脚本列表见 `package.json`。

---

## ⚙️ 环境变量

复制 `.env.example` 为 `.env`（如需覆盖默认配置）：

```bash
cp .env.example .env
```

| 变量 | 说明 |
| --- | --- |
| `VITE_AI_BASE_URL` | AI Agent 服务基础地址。留空时：开发环境走 `/ai-api` 代理，生产构建默认使用 `http://118.126.102.143:8000/api` |

---

## 🔌 后端依赖

前端依赖两个后端服务，地址均为项目默认值，可按实际环境调整：

### 1. 用户 / 简历服务

- 基础地址：`http://81.71.75.85:6008/api`
- 提供：登录注册、用户信息、简历 CRUD、模板广场、职位等接口
- 开发环境由 Vite 代理 `/api` 转发

### 2. AI Agent 服务（ResumeAgent FastAPI）

- 基础地址：`http://118.126.102.143:8000/api`
- 提供：健康检查、会话管理、多 Agent 执行、职业引导等接口
- 开发环境由 Vite 代理 `/ai-api` 转发
- 核心 Agent：
  `resume_parser`、`career_profiler`、`jd_matcher`、`resume_diagnostician`、`strategy_planner`、`module_optimizer`、`fact_checker`

> 代理配置见 `vite.config.js`；AI 服务地址可通过 `VITE_AI_BASE_URL` 覆盖。

---

## 🧪 测试

```bash
node tests/test_resume_serializer.mjs
```

---

## 📚 相关文档

- [技术难点分析](pages/技术难点分析.md)
- `openspec/`：OpenSpec 规范文档与变更记录

---

## 📄 说明

本项目为前端工程，后端服务地址与接口契约以实际部署环境为准；默认地址仅用于开发联调。
