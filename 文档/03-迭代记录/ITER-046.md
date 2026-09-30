# ITER-046 · 真机调试控制台复核

2026-10-01｜流程 WF-1.0.0，无迁移项｜运行版本仍为 minigame-v0.13｜关联 ISSUE-WX-017、TEST-WX-046。用户提供真机调试控制台截图，本轮先核对并记录证据，不改游戏代码或平台配置。

## 观察与判断

证据：`artifacts/minigame-v0.13/true-device-console-2026-10-01.png`（用户截图，SHA256 `C3100BAA540605FD92CA74BA80C54BC2972718E072F84B830CB76CC7B4CFAF52`）。截图右侧显示华为 ADY-AL00、系统版本 31、微信 8.0.78、基础库 3.17.3、Wi-Fi，调试服务状态“已结束”。控制台反复出现 `[wxapplib] [common reportUserBehavior] handleAction`，其中 `errMsg` 文本是 `reportUserBehavior:ok`；链接位置为 `WAGame.js:1`。另有 `session3d0` 周期上报及日志备份提示。截图顶部标示5条错误、12条警告，但当前画面没有展开每一条完整调用栈，不能断言所有条目均为同一种原因。

当前 `minigame/` 游戏源码未检出 `reportUserBehavior`、`session3d0` 或 `gameLogManagerConf` 调用；就截图中可见的这些条目，没有项目 `game.js`/`js/` 的栈帧。因此将可见红字暂记为微信运行层日志，而非已复现的游戏逻辑异常。`errMsg` 包含 `ok` 不等于游戏功能验收通过；“服务已结束”也不单独证明游戏崩溃。此前模拟器的 `jsbridge not ready` 是另一条日志，本截图未显示它，不能据此宣布该问题已彻底消失。

## 验证边界与接续

截图只提供控制台和设备信息，没有手机游戏画面、点牌/道具、音乐或存档的操作结果；TEST-WX-046 记为“真机控制台已观察，游戏功能待验”，不记为真机通过。若用户确认真机黑屏、闪退或交互异常，按复现步骤和对应游戏脚本栈继续排查；若游戏功能正常，保留该运行层日志观察项，不为消除控制台红色条目改动玩法代码或隐藏日志。

本轮不修改小游戏工程；此前 50 项自动测试与开发预览结果属于 ITER-044 历史证据，不冒充本次真机功能验证。云端、广告和正式发布状态均不变。

文档登记后复核：本轮重新运行 `npm test`，50/50通过；`npm run check:docs` 检查80份Markdown、0错误。两项结果只验证本地代码及文档，不改变真机功能“待验”的结论。

补充：检查期间项目根目录新出现本地 `审核配图/`，文件名含临时会话参数。原地保留，加入 Git 忽略与文档根目录登记，不读取、改名或公开上传其内容；该目录不是本轮真机日志结论的依据。加入后需重新执行检查，以上首次80份Markdown零错误是该目录出现前的结果。

目录登记后复核：`npm run check:docs` 检查80份Markdown、0错误；`npm run check:code` 检查28个JavaScript文件、0语法错误；Git 忽略规则确认备案图片目录不会进入暂存。

用户后续确认 `审核配图/` 是用于小游戏备案的图片；不参与本轮调试，也不上传公开仓库。用户另给出模拟器绿框截图，保存为 `artifacts/minigame-v0.13/simulator-jsbridge-2026-10-01.png`（SHA256 `EA58DFE2551DE3576D50C8A57AF9AC6218A54E7E9BC96B337C85CB70537AAF03`）。绿框是 `jsbridge invoke getSystemInfo fail: jsbridge not ready`，所示调用栈均为 `WAGame.js`；右侧游戏画面已绘制。游戏源码没有直接调用 `getSystemInfo`，但 `minigame/js/platform.js` 在 `getWindowInfo()` 抛错时会回退到 `getSystemInfoSync()`；现有截图没有项目栈，不能认定该回退触发报错。定位到微信模拟器运行层启动链，内部初始化失败的准确根因仍未证实。此前真机截图出现的是另一个 `reportUserBehavior` 日志，未显示同一条 `jsbridge` 错误；这支持“模拟器特有或时序相关”的推测，但不足以定论。该项保持观察，除非真机出现功能异常或项目栈，再开展针对性修复。
