# SenseNova · LLM API 服务平台 (Frontend Prototype)

静态 HTML / CSS / JS 原型，用于展示 SenseNova 大模型 API 服务平台的前端结构与交互流程。

## 页面结构

### 公开站点
- `index.html` — 落地页（Hero / 特性 / Token Plan 预览 / CTA）
- `pricing.html` — Token Plan 套餐页
- `docs.html` — API 文档
- `playground.html` — 体验中心（文本模型交互测试）
- `login.html` / `register.html` — 手机号登录 / 注册

### 控制台
- `console/dashboard.html` — 账户总览
- `console/api-keys.html` — API Keys 管理
- `console/usage.html` — 用量统计

### 内部后台
- `admin/index.html` — Admin 平台总览

## 本地预览

```bash
python3 -m http.server 5180
# 然后访问 http://localhost:5180
```

## 技术栈

- 纯静态 HTML / CSS / JS，零依赖
- 样式统一在 `assets/style.css`
- 交互逻辑在 `assets/app.js`
