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

## 验收与发布约定

- 默认流程：**本地先验收，再 push**
- 调整样式、渲染规则、歌曲入库后，优先通过本地网页确认效果
- 确认无误后，再 commit / push 到 GitHub Pages

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

## 当前已沉淀的关键约定

### 内容与转换
- `[]` 解释为 alternate line，当前入库时写成紧随主歌词后的 `[alt] ...` 行
- `intro / outro / instrumental / solo / break` 等无歌词段落，统一按“纯音乐段落”理解
- 只要原文中存在小节线 `|`，就优先保留原始和弦文本行，不根据空括号数量重建版式
- PDF 现已作为正式支持的输入来源之一，优先用于需要保留视觉对位信息的曲谱
- 对于 PDF 路线的歌曲，第一版可先保留“和弦行 + 歌词行”的可审阅结构，不强行一步转成括号格式
- 关于“原始文本 → md 草案”的新规则，默认必须落到仓库里的脚本与文档，不保留只存在聊天里的临时规则

### 工具与流程
- 规范化工具已放入仓库：`scripts/normalize-chord-sheet.mjs`
- PDF 提取工具已放入仓库：`scripts/extract-chord-sheet-from-pdf.mjs`
- 这两类工具的定位都是半自动草案生成器，不是盲目全自动导入器
- 任何关于转换的新讨论，默认都要同步更新脚本 / 文档 / 实施日志
- 默认发布流程：**本地先验收，再 push**

### 当前页面交互与展示方向
- 歌曲页优先服务“看谱/弹奏”，不是内容卡片页
- 页面整体偏紧凑，目标是减少翻页
- 转调工具统一采用右侧垂直浮动工具条（桌面端与手机端一致）
- 浮动工具条内显示当前 key 与原调
- 纯音乐段落也必须参与 transpose，不允许只正文和弦转调
- 歌曲头部信息收敛为单行 meta，避免重复展示与无效装饰
```
