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

建议流程：
1. 先用 `extract:pdf` 提取可读文本
2. 人工查看位置/空格是否仍足够可靠
3. 若对位信息仍主要体现在“和弦行 + 歌词行”的关系中，可先直接入库为可审阅版本
4. 再决定是否继续进入 `normalize:sheet` 或后续更精细的括号化处理

## 当前限制

- 不会自动写入 `src/data/`
- 不会自动 commit / push
- 若“和弦数量”和“括号定位数量”不一致，会给出 warning
- PDF 第一版目前依赖 Ghostscript 的 `txtwrite` 提取
- PDF 提取后仍需人工检查对位是否足够可靠
- 对复杂变体仍应人工审阅

## 验收提醒

手机端体验应优先在本地验证，尤其关注：
- 右侧垂直 transpose 工具条
- 纯音乐段落的可读性
- 长句是否需要横向滚动

## 建议流程

1. tangkk 粘贴原始 Notes 文本
2. 保存为临时 txt 文件
3. 运行脚本生成 md 草案
4. 人工检查 warning 与格式
5. 入库到 `src/data/*.md`
6. **本地先验收（`pnpm dev` 或 `pnpm preview`）**
7. 确认无误后再 commit / push
