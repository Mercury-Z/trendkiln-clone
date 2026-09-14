# Trendkiln

> 每天十分钟，扫完 AI 编程该看什么 · 10 minutes a day to scan what matters in AI coding

[Trendkiln](https://trendkiln.pages.dev/) 的**开源复刻版**：一个聚焦 AI 编程的每日信息聚合站，包含今日摘要、GitHub 热度榜、模型能力榜、资讯时间线、我的关注与设置，支持中英双语。

- **纯静态站点**，零构建依赖，部署在免费的 **GitHub Pages**
- **GitHub Actions 定时采集**，数据每天自动更新两次
- 关注 / 稍后读 / 已读状态全部保存在浏览器 localStorage，无需账号

---

## 页面

| 路由 | 内容 |
| --- | --- |
| `/` | 今日摘要：每天 5 件事（GitHub 异动 / 模型排名 / 必读资讯） |
| `/github/` | GitHub 热度榜：天榜 / 周榜 / 月榜，卡片 / 表格双布局，相对快照增量 |
| `/models/` | 模型能力榜：智能指数 / 编程智能体指数 / 编程成本 / 文生图 / 图生视频 |
| `/feed/` | 资讯时间线：精选 RSS / 官方动态，已读 / 稍后读过滤 |
| `/watchlist/` | 我的关注：钉住 repo / 模型 / 关键词，展示近期信号 |
| `/settings/` | 设置：语言、摘要条数、GitHub 默认布局、重置本地数据 |

## 数据来源

| 数据 | 来源 |
| --- | --- |
| GitHub 热度 | [github.com/trending](https://github.com/trending)（daily / weekly / monthly） |
| 仓库 Topics | GitHub REST API（Actions 内用内置 token 补充） |
| 模型榜 | [Artificial Analysis](https://artificialanalysis.ai/) 公开榜快照（`data/models_snapshot.json`，人工维护） |
| 资讯 | VS Code Blog · Simon Willison · OpenAI Blog · GitHub Blog / Changelog · Latent Space · Hugging Face · Vercel · openai/codex releases |

> 说明：原站资讯/摘要有机翻与 LLM 润色；本复刻版保留内容的原始语言（英文为主），仅站点界面为中英双语。模型榜的「用途/优势/创新点」为启发式生成，来源为仓库描述与 topics。

## 目录结构

```
.
├── index.html            # 今日摘要
├── github/  models/  feed/  watchlist/  settings/   # 各页面
├── assets/               # style.css + app.js + 各页 JS
├── data/                 # 采集生成的 JSON（含快照）
│   ├── digest.json       # 今日摘要
│   ├── github.json       # GitHub 热度（3 个周期）
│   ├── models.json       # 模型榜（5 个分类）
│   ├── feed.json         # 资讯（合并去重）
│   ├── history.json      # 历史快照（用于增量/名次变化）
│   └── models_snapshot.json  # 模型榜快照（人工维护）
├── scripts/
│   ├── collect.js        # 一键采集器（Node 原生 fetch，零依赖）
│   ├── serve.js          # 本地静态预览服务器
│   └── lib/              # github / models / feeds / digest / enrich / http / store
└── .github/workflows/update.yml   # 定时采集 + 自动提交
```

## 本地预览

需要 Node.js 18+：

```bash
node scripts/collect.js   # （可选）先抓一次最新数据
node scripts/serve.js     # 打开 http://localhost:4173
```

## 部署（GitHub Pages，全免费）

1. 把本项目推送到一个 **公开** GitHub 仓库（公开仓库的 Pages 与 Actions 免费）。
2. 在仓库 Settings → Pages 中，将 Source 设为 `Deploy from a branch` → `main` / `/ (root)`。
3. `.github/workflows/update.yml` 会自动**每天 01:17 / 13:17 (UTC)** 运行采集并提交 `data/`，每次推送到 `main` 都会触发 Pages 重新发布，站点自动保持新鲜。
4. 也可在 Actions 页面手动 `Run workflow` 立即更新。

## 自定义

- **模型榜数据**：编辑 `data/models_snapshot.json`，按分类填入 `entries`（model / company / score）。公司名在 `companies` 中映射。
- **资讯源**：编辑 `scripts/lib/feeds.js` 中的 `FEED_SOURCES`，增删 RSS/Atom 地址。
- **今日摘要条数与风格**：首页条数在「设置」中调整；摘选的逻辑在 `scripts/lib/digest.js`。
- **站点文案**：`assets/app.js` 的 `I18N` 词典，同时支持中文与英文。

## 免责声明

本项目为学习用途的复刻，与原始 Trendkiln 无任何关联。数据版权归各来源方所有。模型榜快照分数为人工整理的公开榜快照，仅供参考。
