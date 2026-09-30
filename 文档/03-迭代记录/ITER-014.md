# ITER-014 · 统一茶楼室内场景

2026-09-26｜WF-1.0.0一致，无迁移项｜ui-v0.5 → ui-v0.6｜静态提案待确认

用户反馈：背景上下不统一、不符合逻辑，要求重新修改。关联REQ-002、ITER-013。分析：外部瓦檐与室内墙地、近景家具拼接造成空间歧义。本轮授权为背景修改，非玩法或代码修改。

实现现状：统一为正面茶楼室内，移除室外瓦檐，木梁连接立柱，两侧同高窗格，完整墙面、踢脚线和下方地面连续；近景茶桌与椅子位于同一室内。建筑浅色低对比，原按钮、小吃牌、提示纸签及木托盘保留风格。首轮生成额外绿植与侧桌，第二轮清理掉；最终以main-unified-interior.png为准。

产物：[主页面](../../artifacts/ui-v0.6/main-unified-interior.png)。使用内置image_gen，用户本轮附图为编辑来源；随后以生成图作清理目标，未用CLI。来源授权说明沿用ITER-010，无新增第三方资产。旧稿保留，无代码回退事项。

验证结果：人工查看最终图，确认无外部瓦檐、绿植或绿色标注，木梁/立柱/墙地连接，槽数3/7与必要入口保留。透视仅视觉核对，未做几何标定；生成式编辑使部分UI比例及位置变化，不声称像素锁定。静态稿不是实际关卡截图，未做交互或真机验收；代码未变，不重跑游戏回归。用户尚未验收新版，组件库继续待主页面确认后提取。

## 内置image_gen完整提示词
### 场景统一
Edit the attached Chinese snack game screenshot. Correct the entire ENVIRONMENT BACKGROUND into ONE logically coherent Cantonese morning-tea room interior, while preserving the foreground game UI and established warm hand-painted casual-game art style. User says existing background inconsistent and spatially illogical. Output ONE finished full portrait game screen, no external screenshot chrome, no green annotation rectangles, no top captions or bottom app icons.

BACKGROUND DESIGN: One fixed camera looking straight toward the back wall of a single small teahouse interior, with a gentle downward view of the floor. No exterior roof tiles anywhere. Replace outdoor gray tiled roof at top with a simple interior horizontal timber ceiling beam connected correctly to two slender wooden structural posts at far left and right; no floating beam ends. A continuous pale cream plaster rear wall behind header and tile pile. Matching understated wooden lattice windows at the SAME height on this SAME rear wall, left and right margins, symmetrical scale, vertical sides vertical. Faint simple lattice, no dense detail, no overlaid giant window ornaments. One consistent baseboard marks wall-floor junction near the lower edge of tile pile / just behind upper edge of storage tray, about 57% down entire screen. Above that line is wall, NOT floor. Below is one continuous pale beige tile floor: all receding grout lines use ONE central vanishing point, row spacing decreases into the distance. No fragmented perspective, no wall that blends arbitrarily into floor. Lower corners contain only a very restrained partial tea table on right with ceramic teapot and one simple partial chair on left, grounded naturally on this same floor, consistent scale and perspective, gentle contact shadows, do not collide with game controls. Make these furnishings pale and low contrast; all environment supports gameplay rather than competes. Warm soft light from upper left consistently. Maintain cream/honey muted environment, calm flat center behind the tile pile, no leaves, no outdoor scene, no extra room or split scene.

FOREGROUND UI LOCK: all game elements are clearly screen-space interface floating above this backdrop, preserving their position, size, appearance and function. Keep coral red '选关' button, cream '第 06 关' plaque, brown '玩法', coral red '重开'. Plain calm cream background behind these, NO dark header bar or enclosing panel. Keep progress '已消除 0 / 42'. Preserve same central stacked Chinese snack tiles composition and six food designs (bao, youtiao, zongzi, shumai, dumpling, tanghulu), bright cream available tiles and muted brown covered tiles, crisp cocoa outlines. Do not change layout into floor tiles or physically scatter food on furniture. No colored mat or new board frame.

Preserve wooden storage tray: label '临时区', exactly THREE empty temporary wells; pale informational slip with yellow lightbulb and dark brown two-line text '集齐三张相同小吃' / '即可消除'; label '暂存槽', '0 / 7', exactly SEVEN empty main wells. Preserve bottom tools '撤回', '洗牌', '移出3张', each '剩余1次'. Same shapes, colors, dimensions and outlines. Do not add mechanics, ads, popup, UI text or decorations. This is a background continuity correction, NOT a UI redesign. Render sharp clean strokes, not blurred or overtextured.

### 清理多余装饰
Make a strict cleanup edit to this exact image. Preserve its coherent single teahouse interior and ALL game UI, text, 3 temporary slots, 7 main slots, foreground snack tiles, positions and sizes. Remove the potted plant and entire small side table on the left middle edge. Remove the small side table on right middle edge. Remove ALL foliage silhouettes visible through both windows; replace with simple uniform warm ivory frosted panes, no view of outdoor scenery. Keep the two bottom foreground corner furnishings (left chair and right tea table with teapot) unchanged. Gently lighten and desaturate ONLY architectural background wooden posts and window frames to soft honey tan so they are secondary to the food and UI, while retaining their structural connections. Do not wash out the foreground UI. No new objects or new room changes. No gray tiled exterior roof, plants, leaves, annotations, captions, or extra decorations. Identical crop, aspect, warm hand-painted casual-game style and same perspective.

