# ITER-016 · 放大后区块间距修正

2026-09-26｜WF-1.0.0一致，无迁移项｜ui-v0.7 → ui-v0.8｜静态提案待确认

用户要求：注意间距。附图进度条贴近顶牌，底牌压到托盘，托盘和工具间距不足。关联REQ-002、ITER-015。本轮只调整静态页面间距，不改游戏代码、规则或提取组件。

实现现状：保留较大元素，调整牌阵高度与各区域留白；进度条与顶牌、底牌与托盘分离，底部工具及次数标牌完整显示。使用内置image_gen编辑用户本轮codex-clipboard-173022e9-2868-4626-b289-43c2d108802c.png，无新外部素材，来源授权沿用ITER-010。

产物：[间距修正版](../../artifacts/ui-v0.8/main-spacing.png)。旧稿保留，无运行代码回退事项。

验证结果：已查看生成图，顶牌与进度条、底牌与托盘均有可见空隙；3个临时槽、7格主槽、顶部和底部入口齐全，无绿色标注。托盘到工具的间距仍小于牌阵上下间距，生成图未严格执行提示词百分比；不声称像素级等距或已完成响应式验收。后续实现用统一间距约束校准。未运行游戏、浏览器或真机测试；新版待用户确认。

## 内置image_gen完整提示词
Edit this attached Chinese snack game mockup ONLY to correct SPACING. Preserve the enlarged playable UI scale, same food art, same warm hand-painted cartoon style, same teahouse background, exact controls and labels. Remove green annotations. Single full portrait image with same aspect ratio, no presentation border.

Critical visible defects to fix: progress strip touches top food tile; bottommost food tile intersects wood tray; tray touches tool buttons; inconsistent side margins. Establish clear nonoverlapping VERTICAL BANDS with visible calm background between them. Target normalized screen coordinates: header controls y5%-11%, progress y12.5%-16.5%, tile pile bounding box y19%-58%, storage tray y61%-81%, tool buttons including counters y84%-94%, bottom safe space 6%. Keep entire pile centered horizontally. Uniform UI outer margins ~4% screen width, same left/right alignment for progress and tray. Header buttons evenly separated, all controls in frame. Maintain LARGE readable tiles with board width about 84–88% of screen, do not return to tiny UI; gently compact vertical layering / reduce pile height a little if needed to create real gaps. Never stretch individual square tiles into rectangles. No food tile or shadow may touch the progress strip or tray. Explicitly leave at least ~2% screen height of empty background between each major module (including its shadow). Tray inner padding even all around; seven wells equal size and consistent gaps, temporary wells aligned. Tool buttons same size and equal horizontal gaps.

Preserve header '选关', '第 06 关', '玩法', '重开'; progress '已消除 0 / 42'; the familiar central stack and Chinese food designs with ivory selectable faces and muted covered faces. Preserve tray '临时区' with exactly THREE empty wells and ivory hint slip '集齐三张相同小吃' / '即可消除'; '暂存槽', '0 / 7', exactly SEVEN empty main wells in a single row. Bottom tools '撤回', '洗牌', '移出3张', each '剩余1次'. Same cocoa outlines, cream/coral/yellow/walnut palette. Existing interior perspective and architecture remain, no new objects. No ads, popup, new panels, colored mat or gameplay changes. Strong priority: generous deliberate module spacing, keep a clean visible gap especially BELOW the lowest food tile BEFORE the tray.

