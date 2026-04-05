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

### Step 027 — 调整 instrumental 入库策略为“保留原始小节线文本”
- 时间：2026-04-05 18:xx Asia/Shanghai
- 动作：将《今夜没有风》中的 instrumental 段改回原始和弦文本行，并更新文档策略
- 原因：用户明确说明这类带 `|` 的纯音乐段，真正有意义的是原始和弦文本与小节线；下方空括号数量没有必要参与展示
- 结果：instrumental 段将优先保留原始 chord line，而不是强行规范成括号格式
- 输出：
  - `src/data/jinye-meiyou-feng.md`
  - `docs/CONTENT_FORMAT.md`

### Step 028 — 在纯音乐段中保留小节线并移除多余和弦框样式
- 时间：2026-04-05 18:xx Asia/Shanghai
- 动作：让 `|` 作为 barline 在纯和弦行中单独渲染，同时将和弦 chip 从带边框块状样式改为更干净的文本样式
- 原因：用户反馈 instrumental 段需要明确体现小节线，且 chord 后面的框样式多余
- 结果：纯音乐段会保留 barline 信息，视觉更接近真实 chord sheet
- 输出：
  - `src/lib/chord-sheet.ts`
  - `src/components/ChordSheet.tsx`
  - `src/layouts/Layout.astro`

### Step 029 — 将 intro/outro 统一改为保留原始 barline 文本
- 时间：2026-04-05 18:xx Asia/Shanghai
- 动作：把《今夜没有风》的 intro/outro 从无 barline 的规范化和弦行改回带 `|` 的原始文本形式，并更新文档策略
- 原因：用户明确确认：只要原文中有 `|`，就应该在网页中体现，不应因段落类型不同而丢失
- 结果：intro / instrumental / outro 的纯音乐展示策略已统一
- 输出：
  - `src/data/jinye-meiyou-feng.md`
  - `docs/CONTENT_FORMAT.md`

### Step 030 — 将 Notes 原文规范化工具纳入代码仓库
- 时间：2026-04-05 18:xx Asia/Shanghai
- 动作：新增仓库内脚本 `scripts/normalize-chord-sheet.mjs` 与入库工作流文档
- 原因：用户明确要求把“原始文本 → chord-sheet-site md 草案”的工具放进代码仓库，而不是只保留为临时人工流程
- 结果：仓库已具备第一版半自动规范化工具与对应文档说明
- 输出：
  - `scripts/normalize-chord-sheet.mjs`
  - `docs/INGEST_WORKFLOW.md`
  - `package.json`

### Step 031 — 删除两首临时示例歌曲
- 时间：2026-04-05 18:xx Asia/Shanghai
- 动作：删除 `富士山下` 与 `海阔天空` 两首示例 md 文件
- 原因：用户要求当前只保留《今夜没有风》作为真实样本，后续细节调整以这首歌为基准
- 结果：站点将只基于真实入库歌曲继续迭代
- 输出：
  - 删除 `src/data/fushi-shanxia.md`
  - 删除 `src/data/hai-kuo-tian-kong.md`

### Step 032 — 收紧曲谱排版行距以减少翻页频率
- 时间：2026-04-05 18:xx Asia/Shanghai
- 动作：降低 sheet 间距、歌词行高、和弦间距、blank line 高度与 alternate line 占用空间
- 原因：用户明确希望演奏查看时减少翻页，页面应更紧凑
- 结果：曲谱整体纵向占用空间减少，更适合边看边弹
- 输出：
  - `src/layouts/Layout.astro`

### Step 033 — 进行第二轮紧凑化压缩
- 时间：2026-04-05 18:xx Asia/Shanghai
- 动作：进一步压缩页面外边距、卡片 padding、toolbar 高度、section 标题字号、歌词行高与 chord 字号
- 原因：用户反馈第一轮收紧后，页面仍偏松，不利于减少翻页
- 结果：曲谱页改为更接近“演奏视图”的紧凑排版
- 输出：
  - `src/layouts/Layout.astro`

### Step 034 — 明确“本地先验收、再 push”为固定流程
- 时间：2026-04-05 18:xx Asia/Shanghai
- 动作：将本地验收优先的发布流程写入 README 与入库工作流文档
- 原因：用户明确要求不要每次依赖 github.io 验证，而应本地先确认效果
- 结果：项目文档已固定“本地先验收、再 push”的工作方式
- 输出：
  - `README.md`
  - `docs/INGEST_WORKFLOW.md`

### Step 035 — 收敛标题、标签与纯音乐段视觉样式
- 时间：2026-04-05 18:xx Asia/Shanghai
- 动作：让纯音乐段和弦字号与正文和弦一致，移除 song hero 卡片化样式，并去掉 tag 的框状视觉
- 原因：用户指出当前纯音乐段和弦偏大、标题单独成块浪费空间、标签框样式难看
- 结果：页面顶部与纯音乐段样式更统一、更省空间、更清爽
- 输出：
  - `src/layouts/Layout.astro`
  - `docs/CONTENT_FORMAT.md`

### Step 036 — 去掉正文外框并隐藏标题上方歌手行
- 时间：2026-04-05 18:xx Asia/Shanghai
- 动作：移除 chord sheet 正文区域的卡片边框/阴影，并删除标题上方单独的歌手行
- 原因：用户希望正文更像直接阅读的谱面，不要被框起来；同时认为标题上方再显示歌手名是多余信息
- 结果：歌曲详情页顶部与正文区域都进一步去装饰化
- 输出：
  - `src/pages/songs/[...slug].astro`
  - `src/layouts/Layout.astro`

### Step 037 — 修复短歌词下密集和弦的重叠问题
- 时间：2026-04-05 18:xx Asia/Shanghai
- 动作：让每个和弦-歌词 segment 以自身最大内容宽度占位，避免短歌词被长和弦挤压后相邻和弦视觉粘连
- 原因：像“多 / Abm7b5 / 细致新 / Db / 鲜”这类短歌词+密集和弦的句子，若只按歌词宽度排版，会导致和弦挤在一起
- 结果：密集和弦在短歌词场景下会有更稳定的横向展开空间
- 输出：
  - `src/layouts/Layout.astro`

### Step 038 — 为“短歌词 + 长和弦”场景增加额外占位保护
- 时间：2026-04-05 18:xx Asia/Shanghai
- 动作：在渲染阶段识别长和弦配短歌词的 segment，并追加更大的最小宽度
- 原因：用户反馈像“多细致新鲜”这一句仍未出现明显改善，说明仅靠常规 max-content 占位还不够
- 结果：极短歌词下的长和弦会获得额外横向空间，减少视觉粘连
- 输出：
  - `src/components/ChordSheet.tsx`
  - `src/layouts/Layout.astro`

### Step 039 — 改为单行横向排版并按和弦长度动态扩宽危险 segment
- 时间：2026-04-05 18:xx Asia/Shanghai
- 动作：将歌词行从可换行 flex 改为单行横向布局，并对“长和弦 + 短歌词” segment 按和弦长度动态设置最小宽度
- 原因：用户确认上一轮增强仍不够明显，说明必须避免该类歌词行在布局层继续被压缩
- 结果：像“多细致新鲜”这种句子会优先保持横向展开，不再轻易挤成一团
- 输出：
  - `src/components/ChordSheet.tsx`
  - `src/layouts/Layout.astro`

### Step 040 — 为手机端增加右侧垂直 transpose 工具条
- 时间：2026-04-05 18:xx Asia/Shanghai
- 动作：保留桌面端顶部工具栏，同时在手机端隐藏顶部工具栏并改为右侧垂直浮动控制条
- 原因：用户在手机实测中反馈顶部调 key 工具过于占地方，希望改为放在屏幕最右边垂直排列
- 结果：手机端首屏正文占比提升，transpose 控件更贴近演奏查看场景
- 输出：
  - `src/components/ChordSheet.tsx`
  - `src/layouts/Layout.astro`
  - `docs/INGEST_WORKFLOW.md`

### Step 041 — 收敛歌曲头部信息并移除 Capo 显示
- 时间：2026-04-05 18:xx Asia/Shanghai
- 动作：去掉 Capo 展示，将原调、语言、风格、歌手收敛到同一行，并减少手机端标题区与正文之间的空隙
- 原因：用户希望歌曲头部信息更紧凑，避免语言重复显示，并进一步压缩手机端首屏占用
- 结果：歌曲详情页头部信息更简洁，正文更早进入视野
- 输出：
  - `src/pages/index.astro`
  - `src/pages/songs/[...slug].astro`
  - `src/components/ChordSheet.tsx`
  - `src/layouts/Layout.astro`

### Step 042 — 将桌面端 transpose 工具也统一为右侧浮动样式
- 时间：2026-04-05 19:xx Asia/Shanghai
- 动作：取消桌面端横向工具栏，统一为与手机端一致的右侧垂直浮动工具条，仅保留顶部 key 信息
- 原因：用户明确表示更喜欢手机端当前的 transpose 展示方式，希望桌面端也统一成这种感觉
- 结果：桌面与手机的 key transpose 交互样式一致，界面更统一
- 输出：
  - `src/components/ChordSheet.tsx`
  - `src/layouts/Layout.astro`

### Step 043 — 移除正文上方重复的 key 信息
- 时间：2026-04-05 19:xx Asia/Shanghai
- 动作：删除 chord sheet 正文上方的 `Key / A / 原调 A` 信息块
- 原因：用户指出歌曲头部已经展示了原调，该信息在正文顶部重复且占空间
- 结果：页面头部信息更简洁，正文更早进入视野
- 输出：
  - `src/components/ChordSheet.tsx`

### Step 044 — 在浮动转调工具中显示当前 key，并让纯音乐段也随转调变化
- 时间：2026-04-05 19:xx Asia/Shanghai
- 动作：为右侧浮动工具条加入当前 key / 原调展示，并让 `chords-only` 纯音乐段的和弦也参与 transpose
- 原因：用户希望转调后的 key 有明确显示位置，同时发现当前纯音乐段未跟随转调变化
- 结果：转调状态在工具条中可见，纯音乐段与正文和弦的转调行为已统一
- 输出：
  - `src/components/ChordSheet.tsx`
  - `src/lib/chord-sheet.ts`
  - `src/layouts/Layout.astro`

### Step 045 — 将当前稳定规则摘要回写到 README
- 时间：2026-04-05 19:xx Asia/Shanghai
- 动作：把近期反复确认后的关键规则与页面方向整理进 README 的摘要部分
- 原因：用户要求把刚才沟通里重要的关键点沉淀为更容易读取的项目文档，而不是只散落在细分文档与聊天中
- 结果：README 已能快速反映当前项目的转换规则、验收流程与页面交互方向
- 输出：
  - `README.md`

### Step 046 — 将首页改为平铺式曲目列表
- 时间：2026-04-05 19:xx Asia/Shanghai
- 动作：移除首页卡片式列表与多余介绍文案，改为单标题 + 单行平铺曲目信息
- 原因：用户明确要求首页不要卡片方式，而要平铺方式，并且标题只保留“tangkk 的个人和弦谱库”
- 结果：首页信息结构更克制，更像个人曲库入口而非项目介绍页
- 输出：
  - `src/pages/index.astro`
  - `src/layouts/Layout.astro`

### Step 047 — 将 PDF 输入纳入入库工具链第一版
- 时间：2026-04-05 19:xx Asia/Shanghai
- 动作：新增 `scripts/extract-chord-sheet-from-pdf.mjs`，并把 PDF 写入 README 与入库工作流文档
- 原因：用户确认希望把 PDF 作为正式输入源支持，以尽量保留 Notes 中的视觉对位信息
- 结果：仓库已具备第一版 PDF 提取入口，可先提取可审阅文本草案再进入后续规范化流程
- 输出：
  - `scripts/extract-chord-sheet-from-pdf.mjs`
  - `package.json`
  - `README.md`
  - `docs/INGEST_WORKFLOW.md`

### Step 048 — 通过 PDF 路线入库《黑洞裡》首版
- 时间：2026-04-05 19:xx Asia/Shanghai
- 动作：使用《黑洞裡.pdf》提取结果，整理为第一版可用 md 文件
- 原因：验证 PDF 输入路线是否足以支撑真实歌曲入库
- 结果：歌曲已以“和弦行 + 歌词行”的可审阅结构完成首版入库
- 输出：
  - `src/data/heidongli.md`
- 备注：该版本优先保留 PDF 中的和弦行与歌词行关系，后续如需更精细的逐字括号化，可再继续迭代

### Step 049 — 修正《黑洞裡》的元数据
- 时间：2026-04-05 19:xx Asia/Shanghai
- 动作：将《黑洞裡》的歌手改为方大同，原调改为 C，语言改为国语
- 原因：用户补充并纠正了该曲的真实基础信息
- 结果：歌曲 metadata 已与真实信息对齐
- 输出：
  - `src/data/heidongli.md`

### Step 050 — 增加 PDF 对位草案工具第一版
- 时间：2026-04-05 19:xx Asia/Shanghai
- 动作：新增 `scripts/pdf-align-to-chordpro-draft.mjs`，尝试根据 PDF 提取结果中的横向位置恢复括号草案
- 原因：用户指出《黑洞裡》当前版本与 PDF 中的和弦位置不一致，需要把 PDF 里的视觉对位信息进一步转成可用草案
- 结果：仓库已具备第一版“PDF → 对位草案”能力，可用来验证位置恢复是否足够可靠
- 输出：
  - `scripts/pdf-align-to-chordpro-draft.mjs`
  - `package.json`
  - `README.md`
  - `docs/INGEST_WORKFLOW.md`

### Step 051 — 固化本地验收优先级，避免反复被 dev 异常干扰
- 时间：2026-04-05 19:xx Asia/Shanghai
- 动作：把“最终验收默认用 `pnpm build` / `pnpm preview`，不要反复以 `pnpm dev` 报错判断页面状态”写入 README 与入库工作流文档
- 原因：用户反馈首页 Vite 异常问题已经出现多次，需要形成明确约定，避免今后重复踩坑
- 结果：本地验证流程已明确区分开发热更新与最终验收
- 输出：
  - `README.md`
  - `docs/INGEST_WORKFLOW.md`

### Step 052 — 将 pdfplumber 路线落实为正式 PDF 入库入口
- 时间：2026-04-05 20:xx Asia/Shanghai
- 动作：把基于 `pdfplumber` 的 PDF → md 转换流程补入 README 与入库工作流，并明确当前正式支持两类入库入口：PDF、带 `(Chord)` 位置信息的文本
- 原因：用户确认当前 `pdfplumber` 结果已经足够接近，要求将整套流程沉淀到代码仓库中，作为正式入库入口之一
- 结果：仓库文档已明确 PDF 入库优先走 `pdfplumber` 对位路线，Ghostscript `txtwrite` 降级为快速文本草案辅助
- 输出：
  - `README.md`
  - `docs/INGEST_WORKFLOW.md`

### Step 053 — 将 pdfplumber PDF → md 全流程固化为脚本入口
- 时间：2026-04-05 20:xx Asia/Shanghai
- 动作：新增 `scripts/pdfplumber-to-md.py` 并在 `package.json` 中挂出 `pnpm pdfplumber:md` 命令，用于把 PDF 直接转换成项目 md 草案
- 原因：用户要求把“整个基于 pdfplumber 把 PDF 转成 md 的全过程”落实成正式脚本入口，而不是只停留在临时实验与文档说明
- 结果：仓库现在具备可直接执行的 `pdfplumber` PDF → md 命令行入口，可产出 md 与可选 debug json
- 输出：
  - `scripts/pdfplumber-to-md.py`
  - `package.json`
  - `README.md`
  - `docs/INGEST_WORKFLOW.md`

### Step 054 — 统一语言显示为粤语 / 国语 / 英语，并再次收紧首页渲染写法
- 时间：2026-04-05 20:xx Asia/Shanghai
- 动作：新增语言归一化工具，将 `zh` 映射为 `国语`、`yue` 映射为 `粤语`、`en` 映射为 `英语`，同时简化首页与歌曲页的语言渲染逻辑
- 原因：用户要求后续语言只保留“粤语 / 国语 / 英语”三种选择，且首页再次出现 TypeError，需要继续减少不稳定写法
- 结果：语言标签展示已统一，首页/歌曲页改为更直接的归一化输出
- 输出：
  - `src/lib/language.ts`
  - `src/pages/index.astro`
  - `src/pages/songs/[...slug].astro`
  - `docs/CONTENT_FORMAT.md`
