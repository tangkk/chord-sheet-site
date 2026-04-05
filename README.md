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
- `docs/INGEST_WORKFLOW.md`

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

## 歌曲入库工作流

当前默认入库方式：**一条一条来，不做批量导入**。

### 标准流程

1. tangkk 从 mac Notes app 直接粘贴历史 chord sheet 原文
2. 原文格式可以不规范，不要求先手工整理
3. 由我负责：
   - 清洗粘贴噪音
   - 统一空行、缩进、括号与和弦写法
   - 补成项目要求的 frontmatter + `(Chord)` 正文格式
   - 写入对应歌曲文件
4. 完成后再进入站内展示与后续微调

### 约定

- 以后所有歌曲入库，默认都按这个流程处理
- 需要同时支持两种常见原始输入：
  1. `(Chord)` 直接内嵌歌词
  2. `和弦行 + 歌词括号定位` 的 Notes 风格写法
- 优先保留原始记谱习惯的可读性，不为了“格式漂亮”过度改写内容
- 若原文里存在不确定和弦/结构，我会先标出来，不会擅自乱猜
```
