# ITER-015 · 放大主要游戏元素

2026-09-26｜WF-1.0.0一致，无迁移项｜ui-v0.7｜静态稿待用户确认

用户已确认：场景方向“差不多”，要求再出一张，将本轮绿框内关卡信息、牌阵、临时区与暂存槽放大。关联REQ-002、ITER-014。以用户最新附图为编辑目标，该图含植物与侧桌；本轮按其底图保留背景，不把此前清理稿自动替换进去。

实现现状：内置image_gen按约15%的视觉放大目标生成，缩小两侧留白，放大文字、食物牌与槽位；下方工具顺延，保留样式。未作像素级比例测量，不能声称各元素精确放大15%。本轮未改代码、数值、机制或提取组件。

产物：[放大版主页面](../../artifacts/ui-v0.7/main-larger-ui.png)。来源为用户本轮codex-clipboard-dce760fd-6a90-495f-babe-eac3c67151bb.png，授权记录沿用ITER-010，无新增外部素材。旧稿保留，无代码回退事项。

验证结果：已查看输出，主元素明显放大、左右留白缩小，3个临时槽与7格暂存槽完整，顶部入口和底部工具均在画面内，无绿色标注。牌阵上下间距较紧，后续实现需保留触控与阴影安全间距；静态稿不代表实际关卡或响应式验证。未运行游戏、浏览器或真机测试，用户尚未验收本稿。

## 内置image_gen完整提示词
Edit the supplied Chinese snack game screen. User is nearly happy and requests ONLY that all UI elements INSIDE the green rectangle become larger. Preserve the current teahouse interior, warm hand-painted art, materials, palette, food icon drawing and all existing gameplay. Deliver one full portrait screen of the SAME aspect ratio and camera framing, not a zoom of the whole picture. Remove green annotation.

Enlarge the foreground header, progress strip, whole layered food tile pile, and wooden temporary/storage tray by approximately 15% in linear dimensions relative to screen. Main UI should occupy about 90–94% of screen width instead of the present 76–80%. Reduce left/right blank margins. Keep all graphics and text crisp and increase their font/icon sizes proportionately. Keep them centered. Fit everything with no clipped buttons, tiles or wells, no overlap between regions. Use some of excess empty floor at bottom: top enlarged header can start around 6% down screen, larger pile below progress, enlarged tray ends around 80–82% down screen. Place existing three tool buttons just below tray, retaining THEIR existing size and style, shift downward only as needed, fully visible with a small bottom margin. Do not enlarge background architecture or furniture, do not change camera framing. Foreground may cover more of side scenery, which is intended.

Preserve exactly: top '选关', '第 06 关', '玩法', '重开'; progress '已消除 0 / 42'; same tile pile arrangement with larger cream tiles and food illustrations, muted covered tiles. Wood tray: '临时区', exactly THREE empty temporary wells, pale hint card '集齐三张相同小吃' / '即可消除' with lightbulb. '暂存槽', '0 / 7', exactly SEVEN empty main wells in one row; enlarge wells, retain gap and complete visible rim. Bottom '撤回', '洗牌', '移出3张', each '剩余1次'. No extra slots, no new buttons, no ads, no redesigned panels, no new theme, no green frame or outside captions. Keep coherent interior room and all background details from the reference rather than redesigning them. The requested difference must be visibly larger playable UI at the same viewport size, not merely a higher resolution export.

