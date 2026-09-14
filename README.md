# trendkiln-clone (已归档为跳转)

这个仓库原本是本项目的早期静态实现。它已经被还原度更高的复刻版本取代：

**新地址：<https://mercury-z.github.io/trendkiln/>**

仓库现在只保留一个静态跳转页：`/`、`/github/`、`/models/`、`/feed/`、
`/watchlist/`、`/settings/` 会分别跳转到新站点对应页面，`404.html`
会把其余深层链接映射到最接近的页面。

旧的实现代码、数据采集脚本与其历史仍然完整保存在 [`legacy`](../../tree/legacy) 分支上。

## 为什么迁移

早期版本是手写的原生 JS 静态站，自有 CSS 与客户端渲染，与原站的 DOM 结构、
设计系统都不一致。新版本按原站技术栈（Nuxt 3 + Tailwind + i18n）重写，
并逐路由校验了服务端渲染 DOM 的一致性。
