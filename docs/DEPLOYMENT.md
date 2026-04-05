# Deployment

## 目标

将站点部署到 GitHub Pages，对应仓库：

- Repository: `https://github.com/tangkk/chord-sheet-site`

预期访问地址：

- `https://tangkk.github.io/chord-sheet-site/`

## 当前部署方案

- 平台：GitHub Pages
- 构建方式：GitHub Actions
- 触发条件：推送到 `main` 分支

## 已完成配置

- Astro `site` 已设置为 `https://tangkk.github.io`
- Astro `base` 已设置为 `/chord-sheet-site`
- 已创建 workflow：`.github/workflows/deploy.yml`

## 你需要在 GitHub 上确认的设置

仓库 Settings → Pages：

- Build and deployment → Source
- 选择：**GitHub Actions**

## 本地推送后的预期行为

1. push 到 `main`
2. GitHub Actions 自动安装依赖并构建
3. 构建产物上传到 Pages
4. 自动部署到：
   - `https://tangkk.github.io/chord-sheet-site/`

## 后续可选项

### 自定义域名
如果后续你要自己的域名：
- 需要添加 `public/CNAME`
- 并调整 `astro.config.mjs` 中的 `site`

### 私有访问
如果以后不想完全公开，需要另选托管策略或自行加访问层。

## 故障排查

### 页面样式或资源 404
通常是 `base` 配置不正确。
当前仓库页项目必须使用：
- `base: '/chord-sheet-site'`

### Actions 构建失败
优先检查：
- GitHub Pages Source 是否为 GitHub Actions
- Node / pnpm 是否正确安装
- lockfile 是否与 `package.json` 一致
