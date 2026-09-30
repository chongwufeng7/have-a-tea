# ITER-012 · 简化左右茶楼背景

2026-09-26｜WF-1.0.0一致，无迁移项｜ui-v0.4｜静态提案，待用户审阅

用户已确认：否定ITER-011增加茶席及顶部衬底的效果，要求以本轮附图为底稿，简化绿框标出的左右建筑背景。关联REQ-002、ITER-010/011。本轮只改效果图，不改代码或提取组件。

实现现状：内置image_gen编辑本轮codex-clipboard-f0e338b5-d5e2-4d38-979c-8f4b2378c9d3.png；稀疏窗格、浅色立柱、淡化早茶牌，去掉牌阵两边小桌茶具，保留屋檐及底部桌椅。按钮、食品牌和木托盘保持原风格；不沿用灰青茶席和顶部长衬底。来源为用户提供的已有设计图，来源授权记录沿用ITER-010，无新增第三方资产。

产物：[背景简化稿](../../artifacts/ui-v0.4/main-soft-background.png)。旧稿保留可供比较，无运行代码回退事项。

验证结果：已查看生成结果，两侧建筑明显浅化、细节减少；未残留绿色标注或画布角标，临时区三槽、暂存槽七槽。生成式图片存在比例/位置细微变化，不声称像素不变或实际关卡截图。未运行游戏、浏览器、微信或真机测试，未改代码无需重跑游戏回归。新版待用户确认；此前ui-v0.3未获认可。

## 内置image_gen完整提示词
Precisely edit the attached game UI screenshot. The user's green annotations mark ONLY the left and right architectural scenery strips behind the game, roughly upper half of screen. User rejected adding colored mats and extra panels. Use THIS attached image as baseline. Produce a single clean full portrait game screen.

PRIMARY CHANGE: simplify and substantially weaken the two side background scenery strips so the foreground tiles and buttons are dominant. Replace dense dark window grids with only a few very faint simple light-tan lattice strokes over plain creamy plaster. Lighten the side wooden pillars to pale honey beige with minimal grain and thin low-contrast edges. Remove the small side tables, teapots and tiny decorative clutter beside the tile pile. Reduce the right hanging '早茶' plaque into a very subtle pale tan silhouette with faint lettering, or omit it if cluttered. Lanterns can remain as pale small simple outlines behind the buttons. These side structures should be around 65% less contrast and detail, nearly blending into the pale cream central background, while remaining a recognizable teahouse. Hand-painted shapes must remain clean, NOT Gaussian blur, NOT fog over UI, NOT washed-out food.

PRESERVE: the existing charcoal tiled eave and warm overhead timber beam; all actual UI and exact composition: bright coral '选关', cream '第 06 关' plaque, '玩法', coral '重开'; progress '已消除 0 / 42'; same central layered food tile pile at same size and position, richly drawn dumplings, bao, youtiao, zongzi, shumai and tanghulu. Original cream empty space under the pile, NO colored mat, NO board enclosure, NO added header backing or long bar. The food tiles and UI outlines retain their crisp saturated original appearance. Preserve lower walnut tray, '临时区', exactly THREE temporary wells, instruction '集齐三张相同小吃 即可消除', '暂存槽', '0 / 7', exactly SEVEN tray wells. Preserve bottom controls '撤回', '洗牌', '移出3张', each '剩余1次'. Preserve bottom floor, cropped chairs and tea table. All original warm playful hand-painted rounded chunky style unchanged. Only simplify side scenery, do not redesign.

Remove ALL bright green annotations, remove the black '画布' screenshot badge at bottom right and any external screenshot margins or app controls. No ads, new features, text captions, popup or plants.

