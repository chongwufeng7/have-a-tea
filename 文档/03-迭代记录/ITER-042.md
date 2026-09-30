# ITER-042 · 打开小游戏工程并恢复开发预览

2026-09-30｜WF-1.0.0，无迁移项｜起始 minigame-v0.11，交付 minigame-v0.12｜技术交付，用户视觉与真机待验。关联 ISSUE-PACK-001、TEST-PACK-001；不变更玩法规则、存档、广告或云环境。

用户要求打开微信开发者工具运行「叹了个茶」，并指出先前窗口实际为STAR普通小程序。本轮核对 `minigame/project.config.json`：`compileType=game`，AppID `wxe7a2e6370df97a67`；工具CLI `open --project I:/codex/paopaolong/minigame` 返回成功，可见窗口标题 `dimsum-game`。

第一次开发预览上传失败：微信返回错误码80051，`source size 4100KB exceed max limit 4MB`。原因是上轮包体距离限制过近。为恢复预览，仅对运行所用 `assets/wood-tray.png` 无损重编码；原图603862字节，新图519483字节，1024×441逐像素相同。原图保存在 `artifacts/minigame-v0.12/before/wood-tray.png`，可单文件回退，但回退会重新触发包体限制。版本号更新至v0.12，无其他代码变更。

TEST-PACK-001：重新运行微信CLI开发预览成功，包体4114027字节，二维码见 `artifacts/minigame-v0.12/preview-info.json`、`preview.png`，CLI日志见 `wechat-preview.txt`。`npm test` 49/49通过，`npm run check:docs` 检查76份Markdown、0错误；日志同目录。微信模拟器窗口打开不等于完成游戏内交互检查；手机真机和用户视觉验收未做。没有审核或发布；测试/正式仍仅本地分键，云环境未部署。

Git仍未建立。此轮只为排除预览阻断做必要资源压缩；若后续增加音频或图片，应先留出更充足包体空间。
