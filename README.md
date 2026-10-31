# Forget's Blog

基于 Astro 的静态博客，从 Hexo 迁移而来。保留大部分功能。


## 特性

字体图标仅保留实际使用的 Font Awesome SVG 轮廓，源码使用处标明了转换来源，原 CSS 引用以注释保留。favicon 使用优化的 PNG 和含 16/32/48/64px 的 ICO；未压缩原件仅保存在本地 legacy 备份中。

- Markdown 文章、标签、分类、分页与年月归档。
- 「偏航」随机阅读：构建时生成独立文章索引，点击时才加载，自动排除当前文章和草稿。
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

### 搜索引擎元数据

构建时由 `@astrojs/sitemap` 生成 sitemap-index.xml。收录首页、关于页、公开文章、归档总览、有内容的标签／分类入口及详情；排除随机入口、404、空分类、年月归档和列表分页。策略位于 scripts/sitemap-policy.mjs，依据实际生成路由判断分类是否有内容，不使用构建时间伪造更新日期。

robots.txt 允许抓取并声明 sitemap 地址；随机页通过 noindex 控制收录，不在 robots 中阻止抓取。站点域名统一来自 src/site.ts，同时供 Astro 配置与 robots 使用。

JSON-LD 由 src/lib/structured-data.ts 生成：首页为 WebSite，文章为 BlogPosting，关于页为 ProfilePage 与 Person。统一作者标识，仅使用已公开的名字与社交账号；修改时间和摘要只在手动填写 updated／desc 时输出，不添加图片。序列化会转义 HTML 敏感字符，避免标题破坏 script 标签。

日期校验位于独立的 `src/lib/article-date.ts`，采用 Temporal 标准 API（通过 polyfill 提供），不依赖 Astro。支持 `YYYY-MM-DD`、旧格式 `YYYY-MM-DD HH:mm:ss`、ISO 8601 的 `Z` 或时区偏移，以及已解析的 Date 对象。无时区字符串按 `src/site.ts` 的 timezone 解释，显式偏移优先；非法日期和夏令时歧义会报错，歧义时请填写显式偏移。建议日期加引号，避免不同引擎的 YAML 解析器自行改变语义；迁移时推荐使用带偏移的 ISO 日期。

摘要只读取手写 `desc`，缺少时返回空字符串，不从正文生成。旧自动摘要及改进参考保存在 `src/lib/summary.ts` 的注释中，默认不执行。「偏航」入口页使用 `noindex, follow`，文章仍可正常收录。

文章放在 `src/content/posts/`，关于页位于 `src/content/about.md`。`slug` 决定文章地址，迁移文章需保留原有大小写与字符，以免旧链接失效。`draft: true` 的文章不会发布。

`slug` 填写未编码的单个目录名，中文、内部空格、`&` 等字符由程序处理。为兼容 Astro 静态输出及 Windows/GitHub Pages，禁止 `#`、`?`、`%`、路径分隔符和文件名保留字符，不允许尾随空格／句点或 Windows 保留设备名；构建时明确报错，不自动改名。不要手动填写 `%20` 等 URL 编码。

| 文件 | 用途 |
| --- | --- |
| `src/site.ts` | 标题、作者、社交链接、时区与分页数量 |
| `astro.config.mjs` | 站点地址、构建与 Markdown 配置 |
| `src/styles/_typography.scss` | 从本地修改版 CSS 整理的主题样式 |
| `src/styles/main.scss` | 配色、响应式布局、代码块与按钮样式 |
| `src/styles/fonts.css` | Gentium 字体声明 |

正式地址为 https://blog.forgetwolf.net/ 。修改域名时只需更新 `src/site.ts` 的 url；Astro 配置、canonical、订阅、sitemap、robots 和 JSON-LD 均从这里读取。当前自定义域名部署在根目录，不配置 `/Blog/` base。

## 配色切换逻辑

桌面按钮显示当前配色的太阳或月亮，小 `A` 表示自动。点击切换到另一配色：目标与系统不同则保存手动模式，与系统相同则恢复自动。系统变化或刷新页面不会自行取消手动模式。

窄屏（不超过 768px）及无悬停能力的粗指针触控设备隐藏按钮，只跟随系统；桌面偏好仍被保留。偏好只存储在当前浏览器的 localStorage 中，不上传服务器。禁用 JavaScript 时仍可自动配色。

## 构建与部署

构建产物位于 `dist/`，包含 GitHub Pages 使用的 `.nojekyll`。将 **dist 的内容** 部署至静态托管服务即可；源码仓库和部署产物应分别管理。

### GitHub Pages 自动部署

源码仓库为 [ForgetWolf/Blog](https://github.com/ForgetWolf/Blog)，本地位于 `D:\Blog\astro-blog`（与父目录 Hexo 仓库不同）。Git origin 使用 SSH：`git@github.com:ForgetWolf/Blog.git`。在该仓库 Pages 设置中绑定 `blog.forgetwolf.net`；HTTP 跳转 HTTPS 由 GitHub／Cloudflare 的托管设置控制，静态源码中的 https 地址不等于已启用服务端跳转。

仓库自带 `.github/workflows/deploy.yml`：向 main 推送后，使用 Deno 安装锁定的依赖、检查和构建 Astro，再将 dist 上传至 Pages。也可从 Actions 手动运行 **Deploy Astro to GitHub Pages**。

在仓库 Settings → Pages → Build and deployment 中将 Source 设为 **GitHub Actions**。此设置本身不会把 Jekyll 构建转换为 Astro；若之前创建过使用 `actions/jekyll-build-pages` 的工作流，请删除或禁用那个旧工作流，避免重复部署。

仓库根目录应直接包含 package.json、deno.lock、src 和 .github，而不是再包一层 astro-blog 目录。无需提交 dist，也不需要配置个人访问令牌。

`node_modules/`、`dist/`、`.astro/`、验证截图、日志、环境变量及本地迁移备份均由 `.gitignore` 排除。不要将本地备份或凭据放入 `public/`，该目录的内容会直接发布。示例环境变量文件可使用 `.env.example`，其中只填写占位值。
~~也可用直接扔给AI让AI去做~~


## 致谢

- **Makito / sumimakito**：[hexo-theme-typography](https://github.com/sumimakito/hexo-theme-typography)，原主题设计与实现。本项目基于 Typography 移植，感谢作者带来的排版与设计。
- **Codex（OpenAI）**：协助 Astro 移植、样式整理、配色交互与验证。
- 感谢 Astro、jQuery、Bootstrap、Font Awesome、Gentium 和 Noto 字体的维护者。

## 许可

主题与移植代码采用 [MIT License](LICENSE)，保留原作者版权声明。第三方组件、字体及其完整许可见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) 和 `public/licenses/`。

**文章，关于页文字与个人原创素材的版权归 ForgetWolf233 所有，除另有注明外，不适用上述代码的 MIT 授权。本人保留所有权利。**
