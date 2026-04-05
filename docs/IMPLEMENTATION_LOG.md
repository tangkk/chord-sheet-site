# Implementation Log

> 规则：每一个 solid step 都记录。该文档按时间顺序记录项目关键动作、原因、结果与后续事项。

## 2026-04-05

### Step 001 — 项目初始化
- 时间：2026-04-05 17:xx Asia/Shanghai
- 动作：在 `~/Documents/Projects` 下新建项目 `chord-sheet-site`
- 方式：使用 Astro basics 模板初始化，并安装依赖、初始化 Git
- 原因：
  - 目标是长期维护的静态内容型网站
  - Astro 适合 Markdown / content-heavy 项目
  - 与 GitHub Pages 兼容良好
- 结果：项目基础骨架已创建
- 输出：
  - `package.json`
  - `src/pages/index.astro`
  - `src/layouts/Layout.astro`
  - Git 仓库已初始化
- 后续：补齐项目文档、内容格式、首版页面与 transpose 逻辑

### Step 002 — 建立项目文档基线
- 时间：2026-04-05 17:xx Asia/Shanghai
- 动作：创建项目 README 与 docs 文档体系
- 原因：用户要求“每一个 solid step 都记录进文档”，因此先建立文档规范和承载位置
- 结果：形成长期维护所需的文档骨架
- 后续：每个关键实现步骤继续追加记录

### Step 003 — 引入 React 用于交互式 chord sheet 组件
- 时间：2026-04-05 17:xx Asia/Shanghai
- 动作：为 Astro 项目添加 React 集成
- 原因：transpose、显示偏好切换等交互逻辑用 React 组件承载更直接
- 结果：项目已可使用 `client:load` 的交互式组件
- 输出：
  - `@astrojs/react`
  - React / React DOM 依赖
  - Astro config 与 tsconfig 已更新

### Step 004 — 建立歌曲内容集合与示例数据
- 时间：2026-04-05 17:xx Asia/Shanghai
- 动作：创建 `songs` content collection，并加入两首示例粤语歌
- 原因：先把内容模型定下来，后续页面、解析、部署都围绕它展开
- 结果：歌曲以“一首歌一个 markdown 文件”的方式落地
- 输出：
  - `src/content.config.ts`
  - `src/content/songs/fushi-shanxia.md`
  - `src/content/songs/hai-kuo-tian-kong.md`

### Step 005 — 实现和弦转调核心逻辑
- 时间：2026-04-05 17:xx Asia/Shanghai
- 动作：实现和弦 note 映射、transpose 与 slash chord 支持
- 原因：transpose 是项目核心能力，必须独立封装
- 结果：可对 `(Chord)` 文本中的和弦进行升降调处理，并支持升号/降号显示偏好
- 输出：
  - `src/lib/chords.ts`

### Step 006 — 实现 `(Chord)` 文本解析器
- 时间：2026-04-05 17:xx Asia/Shanghai
- 动作：将内嵌和弦文本解析为按行、按片段的可渲染结构
- 原因：页面渲染需要把和弦对齐到对应歌词上方，不能直接裸输出 markdown
- 结果：已具备基本的和弦谱结构化解析能力
- 输出：
  - `src/lib/chord-sheet.ts`

### Step 007 — 实现交互式和弦谱组件
- 时间：2026-04-05 17:xx Asia/Shanghai
- 动作：创建 `ChordSheet.tsx`，提供 transpose、Reset、升降号偏好切换与排版显示
- 原因：这是用户真正会长期使用的核心界面
- 结果：可在浏览器中直接切换调性并看到和弦谱重新渲染
- 输出：
  - `src/components/ChordSheet.tsx`

### Step 008 — 重写站点布局与基础视觉样式
- 时间：2026-04-05 17:xx Asia/Shanghai
- 动作：替换 Astro 默认模板，建立适合和弦谱阅读的深色风格布局
- 原因：默认欢迎页无实际价值，需要从第一版就把阅读体验拉到可用水平
- 结果：具备首页、歌曲页可复用的全局样式体系
- 输出：
  - `src/layouts/Layout.astro`

### Step 009 — 实现首页与单曲页
- 时间：2026-04-05 17:xx Asia/Shanghai
- 动作：建立歌曲列表页与静态生成的单曲详情页
- 原因：完成 MVP 主流程：浏览列表 → 打开歌曲 → 转调查看
- 结果：首版站点信息架构已打通
- 输出：
  - `src/pages/index.astro`
  - `src/pages/songs/[...slug].astro`
- 后续：做本地 build 验证并修修首轮问题

### Step 010 — 首轮构建验证与内容加载修正
- 时间：2026-04-05 17:xx Asia/Shanghai
- 动作：执行本地构建，发现 Astro content collection 未正常读到歌曲条目；改为自定义静态文件 loader
- 原因：MVP 当前重点是先把稳定可用版本跑起来，避免卡在内容集合配置细节上
- 结果：歌曲内容改由 `src/data/*.md` + `src/lib/song-loader.ts` 读取，静态构建恢复正常
- 输出：
  - `src/lib/song-loader.ts`
  - `src/data/*.md`
  - 页面读取逻辑已切换
- 验证：`pnpm build` 成功生成首页与两首示例歌曲页面
- 备注：后续若有必要，可再评估是否迁回 Astro content collection

### Step 011 — 建立长期决策文档
- 时间：2026-04-05 17:xx Asia/Shanghai
- 动作：创建 `docs/DECISIONS.md`
- 原因：长期项目除了知道“做了什么”，还需要知道“为什么这么做”
- 结果：已开始记录框架、内容格式、loader、部署方案等关键设计决策
- 输出：
  - `docs/DECISIONS.md`

### Step 012 — 接入 GitHub Pages 自动部署
- 时间：2026-04-05 17:xx Asia/Shanghai
- 动作：为仓库 `tangkk/chord-sheet-site` 配置 Astro Pages 参数与 GitHub Actions workflow
- 原因：用户已创建 GitHub 仓库，当前最合理的下一步是打通自动部署
- 结果：推送到 `main` 后可通过 GitHub Actions 自动构建并部署 Pages
- 输出：
  - `.github/workflows/deploy.yml`
  - `astro.config.mjs` 已设置 `site` 与 `base`
  - `docs/DEPLOYMENT.md`
- 备注：仓库 Pages Source 需在 GitHub Settings 中设为 `GitHub Actions`

### Step 013 — 修正 GitHub Pages 子路径链接
- 时间：2026-04-05 17:xx Asia/Shanghai
- 动作：将页面中的手写根路径链接改为基于 `import.meta.env.BASE_URL`
- 原因：项目部署在 GitHub Pages 仓库子路径 `/chord-sheet-site/` 下，若继续写死 `/songs/...` 会导致线上 404
- 结果：首页歌曲链接与歌曲页返回链接都已兼容 GitHub Pages 子路径
- 输出：
  - `src/pages/index.astro`
  - `src/pages/songs/[...slug].astro`
- 备注：首轮修正时发现路径拼接细节会产生 `/chord-sheet-sitesongs/...`，随后改为先计算 `baseUrl` 再拼接，避免子路径错误

### Step 014 — 连接 GitHub 仓库 remote
- 时间：2026-04-05 17:xx Asia/Shanghai
- 动作：为本地仓库添加 `origin`，初始指向 `https://github.com/tangkk/chord-sheet-site.git`
- 原因：用户已创建远端仓库，部署打通前必须先让本地仓库与 GitHub 仓库建立连接
- 结果：本地仓库已可向 GitHub 仓库执行后续 push
- 输出：
  - Git remote `origin`

### Step 015 — 切换 remote 到 SSH 并执行首次 push
- 时间：2026-04-05 17:xx Asia/Shanghai
- 动作：由于 HTTPS push 缺少 CLI 凭据，改用 SSH remote `git@github.com:tangkk/chord-sheet-site.git` 并执行首次推送
- 原因：用户确认本机已配置 GitHub SSH key；SSH 是当前最快且最稳的认证方式
- 结果：若 push 成功，GitHub Actions 将开始自动部署 Pages
- 输出：
  - remote `origin` 已切换到 SSH
  - 首次 push 状态已执行

### Step 016 — 修复 GitHub Actions 中 pnpm 版本冲突
- 时间：2026-04-05 17:xx Asia/Shanghai
- 动作：移除 workflow 中 `pnpm/action-setup` 的显式 `version: 10`
- 原因：GitHub Actions 同时读取到了 workflow 里的 pnpm 版本与 `package.json` 的 `packageManager` 版本，导致冲突报错
- 结果：workflow 将改为直接使用 `package.json` 中声明的 pnpm 版本
- 输出：
  - `.github/workflows/deploy.yml`

### Step 017 — 将用户称呼从 “KT” 调整为 “tangkk”
- 时间：2026-04-05 17:xx Asia/Shanghai
- 动作：将当前项目中的用户可见文案，以及工作区中的称呼偏好，从 `KT` 改为 `tangkk`
- 原因：用户明确表示不希望被称为 `KT`
- 结果：当前项目页面文案与长期身份文件已同步改用 `tangkk`
- 输出：
  - `src/pages/index.astro`
  - `README.md`
  - `~/.openclaw/workspace/USER.md`

### Step 018 — 明确歌曲入库方式为“Notes 粘贴原文 → 规范化入库”
- 时间：2026-04-05 17:xx Asia/Shanghai
- 动作：将歌曲入库工作流写入 README 与内容格式文档
- 原因：用户明确表示后续不会先做批量导入，而是会一条一条粘贴来自 mac Notes app 的历史 chord sheet，并需要我帮助规范化
- 结果：项目文档已明确默认入库流程与规范化处理原则
- 输出：
  - `README.md`
  - `docs/CONTENT_FORMAT.md`

### Step 019 — 明确支持两种原始 chord sheet 输入形态
- 时间：2026-04-05 17:xx Asia/Shanghai
- 动作：将“内嵌和弦形态”与“和弦行 + 歌词括号定位形态”同时写入文档
- 原因：用户确认这两种写法以后都需要支持，且第二种是来自 Notes 的真实历史输入形态
- 结果：文档已明确区分两种输入格式及默认解释规则
- 输出：
  - `README.md`
  - `docs/CONTENT_FORMAT.md`

### Step 020 — 确立 alternate line 与纯音乐括号的入库规则
- 时间：2026-04-05 17:xx Asia/Shanghai
- 动作：将 `[]` 解释为 alternate line，将空括号 `()` 解释为纯音乐/无歌词占位，并写入文档
- 原因：用户明确说明这两类写法是其历史 chord sheet 的真实组成部分，必须支持
- 结果：项目文档已具备更完整的原始输入语义约定
- 输出：
  - `docs/CONTENT_FORMAT.md`

### Step 021 — 入库《今夜没有风》首版规范化文件
- 时间：2026-04-05 17:xx Asia/Shanghai
- 动作：根据 Notes 原文，将《今夜没有风》整理为项目标准 markdown 文件
- 原因：建立第一首真实歌曲入库样本，验证规范化流程可行
- 结果：歌曲已按当前约定完成首版入库
- 输出：
  - `src/data/jinye-meiyou-feng.md`

### Step 022 — 优化渲染器以支持结构标题与 alternate line
- 时间：2026-04-05 17:xx Asia/Shanghai
- 动作：为 chord sheet 解析器与前端组件增加 `section` / `alt` 行类型支持
- 原因：真实曲谱已包含 `intro:`、`verse:` 等结构段落，以及 `[alt]` alternate line，默认纯文本显示不够清楚
- 结果：结构标题与 alternate line 可在页面上用更清晰的样式展示
- 输出：
  - `src/lib/chord-sheet.ts`
  - `src/components/ChordSheet.tsx`

### Step 023 — 将站点视觉从深色改为浅色清爽风格
- 时间：2026-04-05 17:xx Asia/Shanghai
- 动作：重设全局配色、背景、卡片、按钮与字体栈
- 原因：用户明确希望网站改为浅色系、整体更清爽，字体观感也要更轻盈
- 结果：站点视觉方向已从深色阅读风格切换为浅色清爽风格
- 输出：
  - `src/layouts/Layout.astro`

### Step 024 — 修复纯音乐和弦行显示粘连问题
- 时间：2026-04-05 18:xx Asia/Shanghai
- 动作：为没有歌词内容的 segment 增加最小宽度占位
- 原因：像 intro / instrumental 这种只有和弦、没有歌词的行，渲染后各和弦会挤在一起，不利于阅读
- 结果：纯音乐段的和弦之间会保留基本间距
- 输出：
  - `src/components/ChordSheet.tsx`
  - `src/layouts/Layout.astro`

### Step 025 — 将语言显示从代码改为中文名称
- 时间：2026-04-05 18:xx Asia/Shanghai
- 动作：将页面中的 `language: yue` 显示为 `粤语`
- 原因：面向实际使用时，语言字段直接显示代码不够自然
- 结果：页面上的语言信息改为更直观的中文名称
- 输出：
  - `src/pages/index.astro`
  - `src/pages/songs/[...slug].astro`

### Step 026 — 为纯和弦行增加专门渲染样式
- 时间：2026-04-05 18:xx Asia/Shanghai
- 动作：识别并专门渲染只有和弦、没有歌词的行
- 原因：intro / instrumental / outro 这类段落不应沿用歌词行排版，和弦之间需要明显展开
- 结果：纯和弦行会以横向展开的独立 chord row 样式显示
- 输出：
  - `src/lib/chord-sheet.ts`
  - `src/components/ChordSheet.tsx`
  - `src/layouts/Layout.astro`
- 备注：首轮实现只识别了裸和弦文本行，未覆盖 `( A ) ( Dm6 ) ...` 这种已规范化的纯和弦写法；后续补充为：当一整行所有 segment 都仅含空白歌词且全部带和弦时，也应归类为 `chords-only`
