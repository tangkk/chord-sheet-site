# Ingest Workflow

## 目标

把来自 mac Notes app 的原始 chord sheet 文本，先转换成一个可审阅的 markdown 草案，再决定是否正式入库。

## 当前工具

仓库内已提供第一版辅助脚本：

- `scripts/normalize-chord-sheet.mjs`

它的定位是：

- **半自动规范化工具**
- 不是盲目全自动导入器
- 目标是减少重复手工整理，而不是跳过人工检查

## 支持的输入形态（当前）

### 1. 和弦直接内嵌歌词
```text
( F )拦路雨偏似 ( C/E )雪花
```

### 2. 和弦行 + 歌词括号定位
```text
E/G# F#m7
让(我)愉快荡到天(边)
```

### 3. alternate line
```text
仍然获(得)一点感动 [仍然值得一点感动]
```

### 4. 带小节线的纯音乐段
```text
Eb Bb/D | Cm7 Eb/Bb | G Cm F | Bb Eb Ab | Bm7 E11
```

### 5. PDF（保留视觉对位信息的输入源）
当 Notes 原文中的和弦位置对齐很重要，而聊天纯文本会丢失空格和横向位置时，可优先使用 PDF 输入。

当前策略：
- PDF 是正式支持的输入来源之一
- 优先用于“和弦压在具体歌词字位上”的曲谱
- 第一版目标是提取可审阅草案，不承诺百分之百自动精准还原

## 用法

```bash
cd ~/Documents/Projects/chord-sheet-site
pnpm normalize:sheet /path/to/raw.txt "今夜没有风" "梁咏琪" "A"
```

输出结果会直接打印到 stdout。

如果要保存为草案文件：

```bash
pnpm normalize:sheet /path/to/raw.txt "今夜没有风" "梁咏琪" "A" > /tmp/jinye-meiyou-feng.md
```

### PDF 提取（第一版）

```bash
cd ~/Documents/Projects/chord-sheet-site
pnpm extract:pdf /path/to/song.pdf > /tmp/song-from-pdf.txt
```

### PDF 对位草案（第一版）

```bash
cd ~/Documents/Projects/chord-sheet-site
pnpm align:pdf /path/to/song.pdf > /tmp/song-aligned-draft.txt
```

### PDF → md（pdfplumber 路线，当前主推荐）

适用场景：
- 输入是 PDF
- 原谱的和弦位置主要依赖横向版面
- 目标是尽量保全每一个和弦、每一个字，以及它们的相对落点

当前约定：
1. PDF 入库优先走 `pdfplumber` 路线，而不是只靠 Ghostscript `txtwrite`
2. `txtwrite` 可作为快速可读文本草案，但不是高精度对位的最终依据
3. `pdfplumber` 负责读取字符级坐标 / 行坐标 / 和弦列位置
4. 脚本应先做行分类，再做配对；至少区分 chord line / lyric line / section / label / blank，不能把不是 chords 的行强行当作 chords
5. 需要支持一条和弦行对应多条歌词行，不再默认强绑成 1:1
6. 生成的 md 默认视为“坐标驱动草案”，仍需本地验收
7. 若目标是尽量接近 PDF 页面视觉效果，后续可继续增强渲染层，而不只停留在普通文本流

建议流程：
1. 运行正式脚本入口：

```bash
cd ~/Documents/Projects/chord-sheet-site
pnpm pdfplumber:md -- \
  /path/to/song.pdf \
  --out src/data/song-slug.md \
  --title "歌名" \
  --artist "歌手" \
  --language zh \
  --original-key C \
  --tags 国语 流行 歌手名 \
  --debug-json tmp/song-slug-pdfplumber-debug.json
```

2. 保证：和弦不丢、字不丢、行结构不丢
3. 特别检查：section / intro / chord-only 段是否保住；是否出现一条 chord row 对多条歌词时只给第一行上和弦；是否误生成 `() () () ()` 这类空占位
4. 将结果整理为项目 md（必要时做少量人工精修）
5. 本地用 `pnpm build` / `pnpm preview` 验收
6. 验收通过后再决定是否 push

---

## 当前正式入库入口

### 入口 1：PDF
- 优先走 `pdfplumber` 对位路线
- 适合 Notes / PDF 导出版、视觉对位明显的原稿

### 入口 2：带 `(Chord)` 位置信息的文本
- 直接进入 md 整理 / normalize 流程
- 适合原始输入已经明确表达和弦压字位置的情况

## 当前限制

- 不会自动写入 `src/data/`
- 不会自动 commit / push
- 若“和弦数量”和“括号定位数量”不一致，会给出 warning
- PDF 第一版目前依赖 Ghostscript 的 `txtwrite` 提取
- PDF 提取后仍需人工检查对位是否足够可靠
- 对复杂变体仍应人工审阅

## 验收提醒

手机端体验应优先在本地验证，尤其关注：
- 标题区横向 transpose 工具条是否紧凑、是否抢正文空间
- 纯音乐段落的可读性
- 长句在移动端是否需要切换到阅读优先版，而不是被单行截断

### 重要约定：避免反复使用不稳定的 dev 验收
- `pnpm dev` 主要用于开发期快速改动和热更新观察
- 最终验收默认优先使用：

```bash
pnpm build
pnpm preview
```

- 若首页或路由在 `pnpm dev` 中再次出现 Vite 侧异常（例如 `TypeError: Cannot read properties of undefined (reading 'call')`），不要把它当作已发布结果的判定依据
- 对外或阶段性确认前，必须以 `build + preview` 结果为准

## 建议流程

1. tangkk 粘贴原始 Notes 文本
2. 保存为临时 txt 文件
3. 运行脚本生成 md 草案
4. 人工检查 warning 与格式
5. 入库到 `src/data/*.md`
6. **本地先验收（`pnpm dev` 或 `pnpm preview`）**
7. 确认无误后再 commit / push
