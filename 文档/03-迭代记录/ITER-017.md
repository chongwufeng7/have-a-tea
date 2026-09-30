# ITER-017 · 已确认主页面还原 Figma

日期2026-09-26｜流程WF-1.0.0一致，无迁移项｜版本figma-v0.1｜状态：设计已交付，待用户验收

## 范围与确认
用户已确认ui-v0.8/main-spacing.png效果，要求用SKILL还原Figma，并选择huangxiaoling团队。实际归属为有Full席位的xiaolinghuang's team。关联REQ-002、ITER-016。本轮仅设计文件，不改游戏代码、不增加玩法或广告。

使用reference-to-figma、figma-use、figma-create-new-file、figma-generate-design、figma-generate-library；素材补全使用imagegen。新文件没有可复用游戏组件，检查现有库和搜索结果后按定稿建立本地基础。

## 实现现状
[打开Figma主页面](https://www.figma.com/design/RW5WV3CXtgDbdaWfiWb7xN?node-id=8-2)。有对局主页面、复用组件、参考与说明三页。原稿928×1695等比还原至402×734.26；主画板8:2。

- 42张独立牌实例；六种食物各有可选/遮挡状态。
- 三个临时槽、七格暂存槽、关卡/进度和三种道具入口。
- 15个可编辑文字层；按钮、槽位和牌面结构为原生图层。牌面、槽位有复用组件，另有颜色变量和文字样式；并非全部图层都已绑定变量。
- 食物为确认稿裁切位图；背景和托盘木纹为生成补全位图。整张参考图仅放对照页，未代替主页面分层还原。

## 验证结果与限制
已查看实际Figma渲染，修正食物裁切串入邻牌、槽位二次缩放、洗牌图标及托盘木纹。最终证据：[Figma整页渲染](../../artifacts/figma-v0.1/final-render.png)。核对3/7槽数、入口完整、区块未重叠和文字可见。首次/中间截图保留作修正记录。

原图绘字用Noto Sans SC Black/Bold替代；原生按钮/牌边与手绘稿材质和局部几何仍有差异，不声称像素一致。42牌仅用于视觉排列，不代表运行第6关配置；未连接点击交互。未运行游戏、微信或真机测试；Figma稿用户验收待完成。

## 素材与记录
来源为用户已确认的项目生成稿，来源授权沿用ITER-010；未引入新的第三方食物素材。背景/托盘补全来自内置image_gen，局部纹理可能变化。字体由Figma提供，未随项目分发字体文件。

- [背景提示词](../../artifacts/figma-v0.1/background-prompt.txt)
- [托盘提示词](../../artifacts/figma-v0.1/tray-prompt.txt)
- [布局记录](../../artifacts/figma-v0.1/layout-plan.json)
- [Figma节点记录](../../artifacts/figma-v0.1/state.json)
- [文档检查日志](../../artifacts/figma-v0.1/docs-check.txt)

下一步：用户查看Figma还原效果。正式游戏UI接入尚未实施。

文档检查实际结果：46份Markdown，1个既有错误——根目录Implement-from-Figma-main未登记；保留用户资料未移动。此次未改运行代码，未重跑游戏测试。
