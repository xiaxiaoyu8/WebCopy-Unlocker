<p align="center">
  <img src="copy-unlocker-extension/icons/green-128.png" width="96" height="96" alt="Copy Unlocker 图标">
</p>

# WebCopy-Unlocker · 网页复制解锁

**中文** | [English](README.en.md)

[下载插件 ZIP](copy-unlocker-extension.zip) | [安装教程](#安装) | [使用场景](#使用场景)

Copy Unlocker 是一个适用于 Chrome 和 Microsoft Edge 的轻量级网页复制解锁插件。当你在百度文库、CSDN、知乎等网站遇到文字无法选中、复制操作被拦截或右键菜单被禁用时，可以点击插件图标，尝试恢复当前页面的文本选择、复制、剪切、粘贴和右键菜单，方便整理学习笔记、摘录资料和复制代码。

![Manifest V3](https://img.shields.io/badge/Manifest-V3-4285F4)
![Chrome & Edge](https://img.shields.io/badge/Browser-Chrome%20%26%20Edge-16A34A)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E)

百度文库、CSDN、知乎等限制复制场景均有效，如帮到您，请您点击Star给我鼓励,这对我有非常大的帮助

## 项目亮点

- **Manifest V3** 扩展，支持 Chrome / Microsoft Edge。
- **点击即用**，按需解除当前页面限制。
- **原生 JavaScript**，直接加载源码即可使用。
- **最小权限**，仅申请 `activeTab` 和 `scripting`。

## 使用场景

可用于尝试解除 **百度文库、CSDN、知乎** 等网站页面中无法直接复制或选择文本的限制，适合摘录资料、整理学习笔记和复制技术文章中的代码片段。

| 场景 | 操作 |
| --- | --- |
| 百度文库 | 对页面中已加载、以普通网页文本呈现的内容，尝试恢复文本选择与复制 |
| CSDN | 对技术文章中受事件或样式限制的正文和代码，尝试恢复选择、复制与右键菜单 |
| 知乎 | 对回答、文章中已显示且受前端事件或样式限制的文字，尝试恢复复制 |
| 其他网站 | 对禁止选中、拦截复制快捷键或禁用右键菜单的普通网页，尝试解除限制 |


## 功能

- 解除常见的复制、剪切、粘贴、右键菜单和文本选择事件限制。
- 覆盖页面的 `user-select` 样式，帮助恢复文本选择。
- 观察新增内容和相关事件属性变化，继续清理限制。
- 启用后的前 10 秒定时清理，并拦截后续注册的相关事件监听器。
- 灰色图标表示尚未启用，绿色图标表示注入脚本已执行，页面右上角显示提示。
- 刷新或导航后恢复灰色图标，需要时再次点击启用。

## 安装

### 从 GitHub 下载

1. 点击仓库的 **Code → Download ZIP**，解压下载内容。
2. 打开 Chrome 的 `chrome://extensions/` 或 Edge 的 `edge://extensions/`。
3. 开启 **开发者模式**，点击 **加载已解压的扩展程序**。
4. 选择其中包含 `manifest.json` 的 `copy-unlocker-extension` 文件夹。
5. 在浏览器扩展菜单中固定 Copy Unlocker，方便随时点击。

也可下载仓库中的 `copy-unlocker-extension.zip`，解压后选择其内部同名文件夹。请保留安装目录，浏览器会从该目录加载文件。

## 使用

1. 打开浏览器插件开发者模式，再将插件固定于工具栏。
2. 打开需要复制内容的网页。
3. 点击 Copy Unlocker 图标。
4. 看到绿色图标和页面提示后，尝试选中文本、复制或打开右键菜单。

重复点击会再次执行清理。绿色图标表示脚本已运行，具体能否解除限制取决于页面实现。

## 适用范围与注意事项

- 适用于普通网页中通过 JavaScript 事件或 CSS 禁止复制和选择的常见情况。
- 浏览器内部页面、扩展管理页面及部分受保护页面限制脚本注入。
- 嵌入页面能否处理取决于浏览器授予的访问权限，跨域 iframe 可能仍保留限制。点击后新加载的 iframe 可能需要再次启用。
- 图片、Canvas 中的文字需要 OCR 等其他方式提取，Shadow DOM 内部限制也可能继续存在。
- 事件拦截可能影响网站快捷键、自定义编辑器、拖动和右键菜单。插件保留现有 DOM 与表单值，但复杂页面仍需实际验证。
- 请尊重内容版权和网站使用条款。

## 权限与隐私

| 权限 | 用途 |
| --- | --- |
| `activeTab` | 用户点击后，临时获得当前标签页的访问能力 |
| `scripting` | 向获准访问的页面注入解锁脚本 |

当前源代码没有遥测、远程请求、账号系统或数据上传逻辑，也没有申请剪贴板读写权限。解锁脚本在页面主执行环境中处理事件与样式。有关行为以仓库源代码为准。

## 项目结构

```text
copy-unlocker-extension/
  manifest.json       扩展配置与权限
  background.js       点击触发、注入与图标状态
  unlock-copy.js      事件拦截、样式与动态内容处理
  icons/              灰色与绿色图标
  README.md           随安装包提供的说明
README.md             中文项目首页
README.en.md          英文介绍
copy-unlocker-extension.zip  可解压安装的发行包
```

## 开发与验证

项目直接从源码加载，无需安装依赖或构建。修改后在扩展管理页重新加载插件，并刷新测试网页。

```sh
node --check copy-unlocker-extension/background.js
node --check copy-unlocker-extension/unlock-copy.js
node --test tests/listener-guard.test.cjs
```

手动检查复制、选择、剪切、粘贴、右键菜单、重复点击、动态内容、表单值，以及刷新和导航后的图标状态。对受保护页面检查扩展服务工作线程控制台的注入错误。

在 PowerShell 中重新打包

```powershell
Compress-Archive -Path ./copy-unlocker-extension -DestinationPath ./copy-unlocker-extension.zip -Force
```