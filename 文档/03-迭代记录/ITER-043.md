# ITER-043 · 微信开发者工具模拟器启动报错诊断

2026-09-30｜WF-1.0.0，无迁移项｜运行版本仍 minigame-v0.12｜状态：模拟器阻断待排查。关联 ISSUE-WX-017、TEST-WX-043。

用户提供的开发者工具截图显示调试器报 `jsbridge not ready`，并报 `(app.json 或自定义编译条件错误) app.json 中未定义自定义编译中指定的启动页面`。这不是可忽略的游戏内提示：模拟器没有证据表明成功运行对局。截图已保存至 `artifacts/minigame-diagnostic-v0.1/simulator-error.png`。

本轮核对正式工程 `minigame/project.config.json` 为 `compileType=game`，AppID `wxe7a2e6370df97a67`，文件入口为 `game.js/game.json`，工程没有小程序 `app.json`。由此判断错误指向开发者工具的启动/编译模式或自定义编译条件；具体触发原因尚未验证，不能仅凭截图判定是源码缺陷或平台缺陷。已用CLI关闭并重新打开该项目，命令均返回成功，窗口确认显示小游戏目录；尚未取得重新编译后的无错模拟器画面。没有为了消除报错伪造 `app.json`，本轮未修改业务代码。

此前ITER-042的CLI `preview` 成功仅证明开发预览包生成并上传，不能证明IDE模拟器启动或真机运行。TEST-WX-043当前结果：模拟器启动未通过/待复测；手动切换小游戏模式、清除错误自定义编译条件和重新编译后的实际画面待验证。真机也仍待验。项目测试与正式本地存档键、云端未部署状态不变。

本轮未改运行代码；`npm test` 49/49通过，`npm run check:docs` 检查77份Markdown、0错误。日志在 `artifacts/minigame-diagnostic-v0.1/`。这些检查不抵消模拟器阻断。

用户随后要求完整重启开发者工具。已用CLI正常退出，确认旧主窗口消失，再从 `minigame/` 打开；窗口标题 `dimsum-game`，截取到的开发工具顶部显示“小游戏模式”。`cli auto` 返回成功并核对同一AppID；重启后 `cli preview` 再次成功，4114027字节。开发工具本地8份同期日志未找到截图中的 `jsbridge not ready`、`app.json` 或“自定义编译”文字，但控制台消息不一定写入这些日志。本机窗口截取未覆盖右侧模拟器/调试器，因此不能宣称红字消失或模拟器完整运行。证据为 `artifacts/minigame-diagnostic-v0.1/ide-after-restart.png`、`wechat-preview-after-restart.txt`；TEST-WX-043仍待模拟器画面复核。
