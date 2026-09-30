# ITER-010 · 第二版风格选定与早茶场景微调

2026-09-26｜WF-1.0.0，与当前规范一致，无迁移项｜起始ui-v0.1，目标ui-v0.2｜状态：静态图已交付，微调待确认

用户已确认：选择此前第二张主页面风格；去掉背景树叶，换早茶建筑元素；绿框标出的临时区和暂存槽与背景区分；接受居中失败弹窗。关联REQ-002、RULE-003/004/006；本轮仅静态美术设计，不改代码或玩法，组件库待页面确认后从定稿提取。

实现现状：内置image_gen编辑用户本轮附图，保留暖色手绘、厚描边、食物插画、凸起按钮。背景改茶楼木窗檐口；槽区为深木色托盘，三个临时槽与七个暂存槽；移除绿色标注。额外生成相同风格失败弹窗，示例状态为只剩撤回可用，按钮“撤回继续”“重试本关”。这是视觉状态示意，不是实际第6关运行截图或关卡数值证明。

产物：[主页面](../../artifacts/ui-v0.2/main-teahouse.png)、[满槽弹窗](../../artifacts/ui-v0.2/tray-full-dialog.png)。旧图保留，不覆盖。来源为用户提供的已选设计截图；原始第三方参考图无另行授权材料，不据此声称拥有其素材许可。生成图不直接当作可发布游戏资产。

视觉核对：无背景树叶（粽叶属于食物图案保留）；槽区深浅区分、3/7槽数、必要入口及弹窗文字已查看。局限：AI效果图中的灰色道具状态是示意，正式实现必须按可用条件绘制；画面牌数与进度未进行运行一致性验证。未运行交互、微信、真机测试；游戏代码未改，不重跑游戏回归。最终微调未获用户验收。

下一步：用户确认此主页面后，再提取同一套规范与组件；失败状态按钮随实际道具可用性变化。不重新设计画风。

## 生成方式及完整提示词
使用内置image_gen，未用CLI。主页面编辑输入：本轮codex-clipboard-b8258878-4018-4b8d-a863-014919bcba6f.png；弹窗输入：本轮生成主页面。

### 主页面
Edit the attached selected game UI mockup. Produce ONE clean full portrait game screen, no presentation margins, no screenshot app chrome, no caption above, no green annotation rectangle. Preserve this EXACT established 2D hand-drawn casual Chinese snack game style: warm creamy ivory, caramel wood, cocoa outlines, soft painted shading, chunky rounded beveled buttons, identical food illustration language. This is a restrained revision, not a redesign.
Change only: 1) Remove ALL background greenery, leaves, bushes, flowers and leaf ornaments on the level sign. Replace peripheral background with restrained Cantonese morning-tea teahouse architecture: warm timber lattice windows, tea-house wooden columns, small tiled eaves along top, subtle cream plaster and wooden lower wall panels. Architecture only along margins and top; center behind tiles calm pale warm cream. No plants anywhere except edible green zongzi wrappers on food tiles MUST remain. 2) The green-marked area containing temporary area and seven-slot tray must become visibly distinct from background: one cohesive medium-dark warm walnut serving-tray panel with thick rounded wooden rim, subtle recessed shadow. Inside retain pale cream slot wells with brown borders and clear labels. Three temporary slots above, exactly SEVEN main slots below. Maintain original positions and dimensions; make surface darker than cream page, not black, not green. Remove annotation green outline.
Preserve top controls '选关', '第 06 关', '玩法', '重开'; progress '已消除 0 / 42'; same central tile pile arrangement and food art (bao, youtiao, zongzi, shumai, dumpling, tanghulu). Upper tiles bright cream, covered tiles muted brown. Preserve lower region label '临时区', exactly three empty slots, instruction '集齐三张相同小吃 即可消除'; label '暂存槽', '0 / 7', exactly seven empty wells. Preserve bottom three buttons '撤回', '洗牌', '移出3张', each '剩余1次', same sizes and shapes, no new features, currencies or ads. Entire screen fits portrait. Crisp Chinese lettering. No popup on this main-screen image.

### 弹窗
Use the provided revised Chinese snack teahouse game screen as the EXACT style and background reference. Create a portrait screenshot of its FAILURE MODAL state. Keep same warm hand-drawn cartoon wood-and-cream interface, not a new art style. Dim the existing game screen evenly with a translucent warm dark overlay. Center one readable rounded cream dialog with thick walnut wooden frame, cocoa outlines, gentle chunky depth shadows. Header exact Chinese '暂存槽已满'. Beneath exact text '撤回一步，重新选择小吃'. Two large buttons side by side: primary warm coral-red glossy beveled button exact '撤回继续', secondary pale cream button with brown outline exact '重试本关'. No close X, no new gameplay, no ads, no video icons, no reward icons. No foliage. Modal takes about 80% screen width, centered vertically; background recognizably the same teahouse and tile art but subdued. For background failure state, main tray contains exactly seven tiles matching these types left to right: zongzi, youtiao, youtiao, bao, tanghulu, tanghulu, bao, and tray counter '7 / 7'. Temporary three wells filled with zongzi, tanghulu, bao. Behind overlay bottom tools show 撤回剩余1次, 洗牌剩余0次, 移出3张剩余0次. Most background text may remain dim but no duplicated dialog at bottom. Primary focus is clear popup typography and style continuity. No margins, no annotations, no captions outside game screen. This is a visual state illustration, no need to portray an exact generated level.

