# 三三云平台 · 文档站

基于 [Mintlify](https://mintlify.com) 构建的文档站点。

## 目录结构

```
mint-doc/
├── api/              # API 说明文档 + OpenAPI 规范
├── platform/         # 平台介绍文档
├── forward/          # 数据转发说明
├── changelog/        # 更新记录
├── img/              # 文档图片素材
├── logo/             # 站点 Logo
├── custom.css        # 自定义样式
├── docs.json         # Mintlify 配置文件
├── i18n.js           # 界面文案本地化
├── search.js         # 本地站内搜索
├── package.json      # 项目配置
├── scripts/          # 构建脚本
└── dist/             # 编译产物（可直接部署）
```

## 开发调试

```bash
pnpm run dev
```

## 编译

```bash
pnpm run build
# 编译产物输出到 dist/ 目录

# 预览
cd dist
npx http-server -p 3000
```

## 部署

`dist/` 目录为纯静态资源，可直接部署到任何静态文件服务器：

- Nginx / Apache
- 阿里云 OSS / 腾讯云 COS
- Vercel / Netlify / GitHub Pages

所有资源路径均使用根路径（`/`），切换子页面后不会丢失资源引用。
