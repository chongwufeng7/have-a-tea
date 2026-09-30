# ITER-013 · 顶部背景与提示文字区分

2026-09-26｜WF-1.0.0一致，无迁移项｜ui-v0.4 → ui-v0.5｜静态提案待确认

用户反馈：本轮附图顶部控制/进度区及灯泡说明两处仍难与背景区分。关联REQ-002、ITER-012。范围仅效果图，不改代码、数值或提取组件。

实现现状：内置image_gen编辑用户本轮codex-clipboard-01d00a0e-9295-430e-90c2-ffe8bbd4f1fa.png。顶部按钮背后改为纯净浅米色，屋檐横梁保留在其上方，移除穿插背景灯笼；进度区增加细边。灯泡说明改浅米色纸签、深棕文字。其余沿用既有茶楼、小吃牌、木托盘风格。来源及授权说明沿用ITER-010，无新增外部素材。

产物：[主页面](../../artifacts/ui-v0.5/main-header-hint.png)，旧稿保留。人工查看生成结果：两处底色已分离，文字可读，临时槽3、暂存槽7，无绿色标注。生成图片位置/比例可能细微变化，不等于实际关卡或像素级还原。纸签尚有轻微厚度感，实现时按非交互说明处理。未运行游戏测试、浏览器或真机验证；本轮未改代码。新版待用户视觉确认，之后才提取组件。

## 内置image_gen完整提示词
Edit this exact attached Chinese snack game mockup. Only TWO localized changes requested by user, marked by bright green annotation boxes. Remove the annotation boxes in output. Produce one clean portrait screen in identical warm hand-painted chunky cartoon style.

CHANGE 1, HEADER GREEN BOX: make environmental background directly behind all four header controls and progress row plain pale warm ivory plaster, a calm uninterrupted field. Remove dark timber lattice/crossbeams and hanging lanterns from behind the controls within this region. Keep dark roof tiles and overhead timber beam only ABOVE the UI zone at very top of screen. No large new backing panel, no dark toolbar, no framed header enclosure. The existing '选关' red button, '第 06 关' cream plaque, '玩法' brown button, '重开' red button must maintain their exact arrangement, size and artwork. Give cream level plaque a slightly cleaner cocoa outline and small downward shadow so it separates clearly from plain background. Preserve existing progress component '已消除 0 / 42' and its empty bar; add a thin warm medium-brown boundary to the existing light progress strip so it is readable, not a new enclosing frame. Background behind this zone must have markedly lower contrast than UI. Leave other softened side architecture untouched.

CHANGE 2, SMALL GREEN BOX IN WOODEN TRAY: replace only the background of lightbulb help text with a simple flat pale cream paper slip, softly rounded corners, very thin tan edge and tiny shadow. Yellow lightbulb with dark brown outline on left, dark cocoa Chinese text on right, exactly two lines: '集齐三张相同小吃' and '即可消除'. Sufficient inner padding, clear high contrast. Paper slip should read as informational label, NOT a raised clickable button; no gloss, no thick frame. Fit inside original marked area without expanding tray or moving the three temporary slots.

STRICTLY PRESERVE everything else: same food tile pile arrangement, same bao, shumai, youtiao, zongzi, dumplings and tanghulu art, same cream/brown covered states, original tan board background WITHOUT any colored mat; original walnut tray, '临时区', exactly THREE empty temporary wells; '暂存槽', '0 / 7', exactly SEVEN empty main wells. Bottom buttons '撤回', '洗牌', '移出3张', each '剩余1次'. Floor and lower corner tea table and chairs. No global recolor, no changes to game layout or functions. No leaves, extra UI, popup, advertisements or outer captions. Maintain warm cream/red/yellow/cocoa palette. Clean full bleed portrait, no green marks or external screenshot borders.

