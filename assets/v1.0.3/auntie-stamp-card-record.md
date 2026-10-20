# 阿姨手持盖章单 · ITER-049

2026-10-18｜WF-1.0.1｜ISSUE/REQ/RULE/TEST-049-STAMP。

I0：用户给出阿姨图及旧式红色点心盖章纸，要求把手中的虾饺改为盖章纸。按上下文理解为整个手持蒸笼替换为纸单；该实现选择已在开工说明。

I1：保留阿姨身份、笑容、衣着及画风，双手改拿参考所示的旧式早茶单；四列三行红色圆章，含一个空圈。蒸笼、点心与热气移除。只修改通关插画，不增加盖章玩法或改变按钮。

I2：仅源美术及导出来源变化，renderer仍引用原auntie-serving.png，弹窗尺寸、按钮、规则及存档不变。新增源文件auntie-stamp-card.png，旧阿姨源图全部保留；回退把build-v103-assets.py来源改回auntie-serving-hargow-v2.png并重新导出。

I3：内置imagegen局部编辑，生成标识exec-e5a9e75b-deb7-4c98-8fb8-17d487118a8d。用户图一为编辑目标，图二为纸单内容与质感参考；未下载第三方素材。源文件assets/v1.0.3/auntie-stamp-card.png，运行文件minigame/assets/v103/auntie-serving.png。生成式人物有细微纹理差异，不声称非修改区域逐像素一致。

## 完整提示词

Precise image edit. Image 1 is the edit target: preserve this exact friendly middle-aged Cantonese tea-house waitress auntie's face identity, smiling expression, hairstyle, cream collared short-sleeve blouse, brick-red apron, hand-painted watercolor/gouache texture, proportions, half-body framing and transparent background. Change ONLY what she is holding and the hands/forearms minimally necessary. Replace the ENTIRE bamboo steamer and all shrimp dumplings with one LARGE vintage cream paper dim-sum order stamp card held naturally with BOTH hands at waist/chest height, tilted slightly toward the viewer so its face is visible. Remove all bamboo, dumplings and steam. Image 2 is the authoritative reference for the PAPER CARD: aged ivory paper, subtle wrinkles and slightly uneven edges, a clean 4-column by 3-row grid of faded vermilion red double-ring round ink stamps with gently distressed stamp edges, each stamp containing a short Chinese dim sum label. Preserve the order and exact text if legible: row1 虾饺 / 烧卖 / 蛋挞 / 凤爪; row2 排骨 / blank red circle / 蛋挞 / 萝卜糕; row3 排骨 / 肠粉 / 奶黄包 / 萝卜糕. Hand-painted naturally integrated paper, no surrounding background. Card should be landscape oriented about the original steamer's width, broad enough to visually read as a traditional stamped tea-house bill, NO clipboard, NO menu book, NO wooden tray behind paper, NO extra cash, NO pen. Hands grip left and right bottom edges convincingly without covering the stamp grid. Keep the original auntie's cheerful pose and friendly face as closely as possible. Produce a clean cutout with actual alpha transparency, no dark halo, no background scenery, no new text outside card, no logos/watermark. Leave all artwork inside the canvas with comfortable margins.

I4实际结果：已目视检查生成源图和第2关实际通关截图；浏览器原生代码第1/2/30关402×850及第2关320×568检查通过，图像正常解码、按钮在安全区且只有正确动作，跳关结果2/3/1/3正确，运行异常0。截图及结果见artifacts/v1.0.3/browser/victory-stamp-card-*。npm test 44/44通过；微信CLI预览成功1,211,509字节，证据preview-stamp-info.json。图片导出约41KB，运行来源映射未改变其他资源或功能；未运行完整微信交互/真机测试，不声称用户认可。

I5：源图、提示词、导出关系、实际截图/结果和preview-stamp-qr.png已归档。旧阿姨源图仍保留，源码可读；未上传、未自动修改Figma。I6：用户视觉反馈及真机待验，不扩展为整轮验收完成。
