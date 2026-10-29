# Forget's Blog

基于 Astro 的静态博客，从 Hexo 迁移而来。保留大部分功能。


## 特性

- Markdown 文章、标签、分类、分页与年月归档。
- 保留原 Hexo 的文章地址：`/年/月/日/slug/`。
- 按照个人喜好，中文 Noto Serif SC，英文 Gentium，使用单层小写 g；字体本地托管。
- 代码高亮切换为Astro 内置 Shiki 代码高亮与行号，支持浅深两套样式。
- 桌面默认跟随系统配色，支持手动切换并记住选择；移动端懒得做懒得测，我教用户怎么在移动端看我的blog，所以只自动切换。
- Atom 订阅、分享链接与复制链接。

## 本地开发

当前使用 Deno 2.x 管理依赖。也可使用满足 `package.json` 中 engines 要求的 Node.js 与 npm。

| 操作 | Deno | Node / npm |
| --- | --- | --- |
| 安装依赖 | `deno install` | `npm install` |
| 后台开发 | `deno task dev --background` | `npm run dev -- --background` |
| 查看状态 | `deno task astro dev status` | `npm run astro -- dev status` |
| 停止开发 | `deno task astro dev stop` | `npm run astro -- dev stop` |
| 类型检查 | `deno task check` | `npm run check` |
| 构建 | `deno task build` | `npm run build` |
| 预览构建 | `deno task preview` | `npm run preview` |

仓库保留 `deno.lock`。切换至 npm 维护时，运行 `npm install` 生成并提交 `package-lock.json`，之后使用 `npm ci`；避免交替使用两个工具升级依赖。TypeScript 当前限定为 6.x，以配合类型检查工具。

## 写作与配置

文章放在 `src/content/posts/`，关于页位于 `src/content/about.md`。`slug` 决定文章地址，迁移文章需保留原有大小写与字符，以免旧链接失效。`draft: true` 的文章不会发布。

| 文件 | 用途 |
| --- | --- |
| `src/site.ts` | 标题、作者、社交链接、时区与分页数量 |
| `astro.config.mjs` | 站点地址、构建与 Markdown 配置 |
| `src/styles/_typography.scss` | 从本地修改版 CSS 整理的主题样式 |
| `src/styles/main.scss` | 配色、响应式布局、代码块与按钮样式 |
| `src/styles/fonts.css` | Gentium 字体声明 |

修改域名时，同时更新 `src/site.ts` 和 `astro.config.mjs` 中的地址。

## 配色切换逻辑

桌面按钮显示当前配色的太阳或月亮，小 `A` 表示自动。点击切换到另一配色：目标与系统不同则保存手动模式，与系统相同则恢复自动。系统变化或刷新页面不会自行取消手动模式。

窄屏（不超过 768px）及无悬停能力的粗指针触控设备隐藏按钮，只跟随系统；桌面偏好仍被保留。偏好只存储在当前浏览器的 localStorage 中，不上传服务器。禁用 JavaScript 时仍可自动配色。

## 构建与部署

构建产物位于 `dist/`，包含 GitHub Pages 使用的 `.nojekyll`。将 **dist 的内容** 部署至静态托管服务即可；源码仓库和部署产物应分别管理。

`node_modules/`、`dist/`、`.astro/`、验证截图、日志、环境变量及本地迁移备份均由 `.gitignore` 排除。不要将本地备份或凭据放入 `public/`，该目录的内容会直接发布。示例环境变量文件可使用 `.env.example`，其中只填写占位值。
~~也可用直接扔给AI让AI去做~~


## 致谢

- **Makito / sumimakito**：[hexo-theme-typography](https://github.com/sumimakito/hexo-theme-typography)，原主题设计与实现。本项目基于 Typography 移植，感谢作者带来的排版与设计。
- **Codex（OpenAI）**：协助 Astro 移植、样式整理、配色交互与验证。
- 感谢 Astro、jQuery、Bootstrap、Font Awesome、Gentium 和 Noto 字体的维护者。

## 许可

主题与移植代码采用 [MIT License](LICENSE)，保留原作者版权声明。第三方组件、字体及其完整许可见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) 和 `public/licenses/`。

**文章，关于页文字与个人原创素材的版权归 ForgetWolf233 所有，除另有注明外，不适用上述代码的 MIT 授权。本人保留所有权利。**
