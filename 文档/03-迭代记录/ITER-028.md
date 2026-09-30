# ITER-028 · 暂存槽卡牌尺寸修复

2026-09-29｜WF-1.0.0，无迁移项｜minigame-v0.3 → minigame-v0.4｜待用户视觉验收

用户截图指出暂存槽点心卡超出槽位。关联REQ-002、ISSUE-014，RULE-001—008不改。

原因：暂存槽按固定牌宽绘制，牌高超过槽高；临时区同样存在轻微溢出。实现：renderer.js新增slotCard，按槽宽高约束等比缩放并水平垂直居中，预留内边距；临时区点击范围仍为整个槽位。中间牌阵放大倍率、玩法、存档、背景、音乐与广告均不变，无新增素材。尺寸以代码为准。

修改前renderer/config备份：artifacts/minigame-v0.4/before。回退恢复对应两文件，不声明Git历史。

验证：28项现有自动测试通过；实际小游戏入口的浏览器wx适配器5尺寸和交互检查通过。新增暂存两张牌截图，并人工查看canvas-tray.png、canvas-reserve.png确认槽内完整显示及居中。截图、tests.txt、canvas-check.json均在artifacts/minigame-v0.4。微信开发预览结果以同目录wechat-preview.txt为准，不等同真机验收。未新增镜像实现的单元测试。

待用户在微信重新编译验收；真机尚未验收。文档检查仍有既有根目录白名单问题，保留用户资料。
