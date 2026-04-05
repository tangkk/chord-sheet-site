# Chord Sheet Site

一个给 tangkk 自己长期维护的和弦谱静态网站项目。

## 项目目标

- 维护个人流行曲和弦谱，当前以粤语歌为主
- 继续沿用 `(Chord)` 内嵌歌词的轻量录入格式
- 在前端自动排版为“和弦在上、歌词在下”的阅读形式
- 支持原调存储、任意升降调 transpose
- 托管到 GitHub，优先兼容 GitHub Pages
- 从第一天开始保留完整项目文档，方便长期维护

## 当前状态

首版 MVP 开发中。

已完成内容见：

- `docs/IMPLEMENTATION_LOG.md`
- `docs/ARCHITECTURE.md`
- `docs/CONTENT_FORMAT.md`
- `docs/ROADMAP.md`
- `docs/DECISIONS.md`
- `docs/DEPLOYMENT.md`

## 本地开发

```bash
cd ~/Documents/Projects/chord-sheet-site
pnpm dev
```

## 构建

```bash
pnpm build
```

## 计划中的部署

- GitHub Pages
- 后续可选自定义域名

## 目录结构

```text
src/
  components/
  content/
  layouts/
  lib/
  pages/
docs/
```

## 维护原则

1. 任何 solid step 都要落文档
2. 内容格式优先稳定，不轻易破坏兼容性
3. 先做静态站 MVP，再逐步增强搜索、筛选、打印、收藏等功能
4. 原始和弦谱文本应尽量保持易写、易读、易迁移
```
