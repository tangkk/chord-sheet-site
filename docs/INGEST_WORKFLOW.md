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

## 支持的输入形态（第一版）

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

## 当前限制

- 不会自动写入 `src/data/`
- 不会自动 commit / push
- 若“和弦数量”和“括号定位数量”不一致，会给出 warning
- 对复杂变体仍应人工审阅

## 建议流程

1. tangkk 粘贴原始 Notes 文本
2. 保存为临时 txt 文件
3. 运行脚本生成 md 草案
4. 人工检查 warning 与格式
5. 入库到 `src/data/*.md`
6. **本地先验收（`pnpm dev` 或 `pnpm preview`）**
7. 确认无误后再 commit / push
