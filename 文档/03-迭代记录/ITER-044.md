# ITER-044 · 顶部导航与系统胶囊对齐

2026-09-30｜WF-1.0.0，无迁移项｜起始 minigame-v0.12，交付 minigame-v0.13｜技术交付、微信真机和用户视觉待验。关联 ISSUE-WX-018、ISSUE-WX-017、TEST-WX-016/043。

用户提供的微信开发者工具截图显示对局已经运行；绿框中设置按钮、日期关卡牌匾与微信系统胶囊未处于同一水平中心线。红框还显示 `jsbridge not ready` 和HarmonyOS兼容提示。截图存于 `artifacts/minigame-v0.13/before/user-feedback.png`。本轮只调整原生小游戏顶部导航的绘制位置，并复核报错；不改牌局、存档、广告、音乐或背景。

原因：`renderer.resize()`原先用安全区上边界把共用的 `top` 压低，系统胶囊却按 `getMenuButtonBoundingClientRect()` 显示。实际微信模拟器返回窗口390×844、安全区top47、胶囊top44/height31，于是两个本地图案中心相对胶囊下移。现独立计算 `headerY`，让设置图案和牌匾中心使用胶囊中心；保留原 `top` 供牌阵与安全区布局使用。胶囊缺失时沿用原安全区布局。只修改 `minigame/js/renderer.js` 与版本号，修前快照在同一证据目录的 `before/`。

TEST-WX-016：用实际模拟器同组坐标验证 `headerY` 中心等于胶囊中心59.5逻辑像素，牌阵仍在原安全区下方。`npm test` 50/50通过，`npm run check:code` 检查28个JS文件无语法错误；浏览器wx适配器5种视口与游戏交互检查通过，检查图见 `canvas-390x844.png` 等。微信CLI开发预览成功，包体4107115字节，未审核或发布。开发者工具刷新成功，运行时API可用；内置 `simulator_screenshot` 多次返回 `waitForAutomatorReady timeout`，因此没有新版微信模拟器截图，用户视觉/真机仍待验。

红框复核：重启后旧 `app.json` 启动错误已不见，用户截图证明对局画面显示。控制台现存一条 `WAGame.js` 内 `getSystemInfo` 的 `jsbridge not ready` 启动错误，以及一条HarmonyOS兼容建议；刷新后仍出现，但游戏运行时 `wx.createCanvas`、`wx.getWindowInfo` 可调用。未见本项目 `game.js` 或 `renderer.js` 的错误栈。该红字的微信工具/基础库根因尚未独立复现，不以清空控制台或伪造小程序入口遮盖；保留为ISSUE-WX-017的平台兼容观察项。日志证据 `wechat-console.txt`。

未建Git；本轮可用 `before/renderer.js` 与 `before/config.js` 作局部回退，回退后需重跑自动测试与微信预览。测试/正式仍仅本地存档分键，云端未部署。
## 2026-09-30 用户反馈处理总结（补记）

- 用户反馈：微信开发者工具红框仍有日志；顶部绿框的设置、日期关卡牌与微信菜单需要沿同一水平中心线对齐。
- 实现现状：`minigame/js/renderer.js` 按微信菜单按钮的实际位置计算顶部控件的绘制基准；仅调整顶部设置和日期关卡牌，牌区与底部操作区沿用原布局。运行版本更新至 v0.13。
- 验证结果：此前运行的 `npm test` 为 50/50 通过，`npm run check:code` 为 28 个 JS 文件零语法错误；五种视口的画布适配检查通过；开发预览包生成成功，包体 4,107,115 字节。证据位于 `artifacts/minigame-v0.13/`。这些检查不能替代微信模拟器的视觉验收或真机验收。
- 红框日志：刷新后仍可见微信开发者工具内部 `WAGame.js` 的 `jsbridge invoke getSystemInfo fail: jsbridge not ready`，另有 HarmonyOS 兼容提示。当前观察到游戏可运行，未见 `app.json` 或游戏脚本的新报错；内部日志成因尚未独立确定，不能记为已修复。
- 未完成验证：微信模拟器截图接口超时，无法据此确认新版顶部对齐的实际画面；需在开发者工具和真机目视复核。本次补记时命令执行工具发生 `helper_unknown_error: setup refresh had errors`，因此未能补跑 `npm run check:docs`，不得记为通过。
