# ITER-011 · 顶部与牌阵的背景层次

2026-09-26｜流程WF-1.0.0一致，无迁移项｜ui-v0.2 → ui-v0.3｜静态图已交付，待用户确认

用户已确认：茶楼背景可以；本次绿色标注指顶部按钮和中央牌阵，与背景区分不足。关联REQ-002、ITER-010；仅调整视觉层次，不改代码、规则和下方托盘布局，不提前提取组件。

实现现状：顶部增加深木色统一衬底、浅边与投影；中央增加低饱和灰青茶席底垫，背景建筑降低对比度。保留原食物画法、按钮风格、临时区三槽与暂存槽七格；移除绿色标注。灰青茶席为本轮提案，尚未获用户确认。

产物：[主页面](../../artifacts/ui-v0.3/main-hierarchy.png)。使用内置image_gen编辑用户本轮附图，未使用CLI、外部代码或新下载素材。来源授权沿用ITER-010记录，不新增素材授权结论。旧稿完整保留，回退可重新选用ui-v0.2，无运行代码影响。

验证结果：已查看生成图，核对顶部衬底、茶席、背景弱化、槽数和文字。牌面位置有生成式细微偏差，静态图不作为精确关卡、像素锁定或交互验收依据；未运行游戏测试、浏览器/微信/真机验证。下一步用户审阅主页面，再从确认稿提取组件。

## 完整提示词
Edit the attached Chinese snack tile game mockup with TWO green marked regions. User ACCEPTS the teahouse architectural background and existing art style, but needs stronger foreground/background separation in the header and board. This is a tightly scoped hierarchy adjustment, not a redesign. Output one clean portrait full game screen of the same composition. REMOVE BOTH green annotation rectangles completely.

Preserve exact established warm hand-painted cartoon style, cream food tiles, cocoa outlines, soft bevels and food illustrations. Preserve the teahouse roof, wooden lattice, side teapots, chairs, floor and setting. Gently mute ONLY environmental background saturation and contrast so it recedes; do not make it blurry or dark. Preserve same button positions, sizes, labels, tile pile shape and stacking, existing bottom walnut tray and three tool buttons.

TOP GREEN REGION: put one understated continuous dark cocoa-walnut rounded backing strip BEHIND the existing header controls, with a fine cream inner rim and soft downcast shadow to separate the controls from architecture. Keep bright coral '选关' and '重开', cream level plaque '第 06 关', brown '玩法' unchanged and legible, slight crisp warm edge highlights so they read as foreground objects. Do not add padding that moves the board downward.

LARGE GREEN REGION: place a single calm desaturated gray-teal tea-cloth mat underneath the entire pile, occupying its existing board rectangle and with enough visible margin around tiles (roughly 12-18px at reference scale). Mat is a muted medium-light gray sage/teal (approximately #9DAFA4), substantially cooler and less saturated than the warm cream tiles, NOT bright green, NOT dark emerald. Subtle soft fabric surface, almost flat with minimal texture, rounded corners, thin ivory stitched border, slim muted brown edge and small soft shadow. Whole tile pile sits on this mat, cleanly separated from architecture and pale tan floor. Keep exact pile position and footprint, no rearrangement. Bright selectable ivory cards remain highest contrast, covered cards muted warm brown, with restrained clean contact shadows; do not darken the actual food illustrations or add sparkle. Mat should be a supportive original-teahouse-style textile, not a new modern app card or another thick wooden tray.

KEEP lower walnut temporary/storage tray unchanged: label '临时区', exactly THREE empty temporary wells; guidance '集齐三张相同小吃 即可消除'; '暂存槽', '0 / 7', exactly SEVEN empty main wells. Keep progress '已消除 0 / 42' and bottom '撤回','洗牌','移出3张', each '剩余1次'. No leaves, currencies, ads, extra buttons or popup. No exterior annotations, captions or white margins.

