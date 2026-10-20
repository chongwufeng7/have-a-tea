# 虾饺造型修正 · ITER-049

2026-10-18｜WF-1.0.1。用户提供蒸笼内虾饺参考，指出现有造型不准确。ISSUE-049-HARGOW（P2）关联 REQ-049-HARGOW、RULE-049-HARGOW、TEST-049-HARGOW。

I0：原牌面和阿姨蒸笼里的虾饺偏尖顶、聚褶包子状；用户图为饱满低矮、弧边折褶、薄皮透出虾仁。用户图只作造型参考，留档 artifacts/v1.0.3/har-gow-user-reference.png，不作为可自由分发的第三方运行素材。

I1：统一牌面、笼内、暂存及介绍中的虾饺，并修正阿姨所端三颗。保留原人物、布局及其他点心。此为用户授权的美术修正，不改变规则或数值。

I2：新建独立 har-gow.png，food(type=0)集中引用，使各处同步；其他十种继续使用原图集。阿姨新版另存 auntie-serving-hargow-v2.png，运行导出映射到既有 auntie-serving.png。旧两源图不覆盖，回退改回原图集0号格和旧阿姨导出来源即可；存档、平台、广告无影响。当前小游戏Figma同步待用户确认修正效果，不在本次后台改写云文件。

I3：使用内置 imagegen，以用户图为造型参考，原图集为画风参考；人物编辑以原阿姨为目标、用户图为造型参考。新单颗生成标识 exec-d4e96273-9ae6-49ae-b244-b86e5f260e02；新人物 exec-2c4584cb-1902-4f8c-9c57-0d862cf6bed5。无额外下载素材。源图 assets/v1.0.3/har-gow.png、auntie-serving-hargow-v2.png；tools/build-v103-assets.py负责缩放压缩，保留透明度。

## 单颗完整提示词

Edit/reference task for a Cantonese dim sum game asset. Image 1 is the authoritative reference for shrimp dumpling / har gow SHAPE, thin wrapper and visible shrimp. Image 2 is only reference for the existing game's clean hand-painted illustrated food icon style. Output exactly ONE isolated shrimp dumpling on a genuinely transparent background, no steamer, no plate, no parchment, no table, no text. Match Image 1: plump low rounded HALF-MOON clam-shell body, a row of large flowing overlapping pleats following a curved edge, rounded broad bottom, translucent pearl-white thin wrapper revealing orange pink whole curled shrimp filling. The seam runs along the curved upper edge rather than gathering at one central point. Absolutely NO pointed apex, no top knot, no radial bao-bun pleats, no onion shape, no xiaolongbao or soup dumpling, no elongated Japanese gyoza. View at a clear three-quarter top angle similar to Image 1; keep the silhouette full and wide, not a vertical cone. Maintain tasty pearly highlights with soft peach shrimp inside, fine warm brown illustrated outlines, delicate gouache/watercolor shading consistent with Image 2 but accurate har gow anatomy. Center the one dumpling, occupying about 82% canvas width, ample clean transparent margin. Preserve genuine alpha, no opaque backdrop or cast rectangular shadow. This is a replacement small UI sprite, readable at 55px.

## 人物局部编辑完整提示词

Precise localized image edit. Image 1 is the EDIT TARGET. Keep the exact auntie portrait, face identity, hair, smiling expression, clothing, apron, both hands, pose, framing, color, watercolor illustration style, bamboo steamer and parchment, steam and existing transparency unchanged. Only replace the THREE dumplings inside her bamboo steamer. Image 2 is the authoritative SHAPE reference for genuine Cantonese shrimp har gow: a low plump rounded half-moon clamshell with flowing overlapping pleats arrayed along a curved edge, translucent pearl-white thin skin revealing orange-pink whole curled shrimp. NOT bao buns, NOT pointed center top-knots, NOT radial gathered pleats, NOT onion cones. Each of the three dumplings must match Image 2's anatomy at a smaller scale adapted to the existing steamer perspective. Keep exactly three dumplings, all comfortably inside the existing steamer on parchment. Do not include the reference image's second steamer or background. Do not change any pixels outside the dumpling region more than necessary for local watercolor blending. Preserve the transparent background with actual alpha. No text, no logo, no additional objects.

I4实际结果：41/41自动测试通过；原生代码浏览器适配检查图片解码、type0独立图/type1原图集映射、介绍/牌面/笼内/成功页及短屏通过，运行异常0。已目视检查三张实际截图，证据 artifacts/v1.0.3/browser/hargow-*.png、hargow-results.json，透明通道及尺寸证据 hargow-asset-check.json。微信CLI预览成功1,018,864字节，证据 preview-hargow-info.json。微信完整交互/真机未测。定向代码审查：集中food映射覆盖各使用处，资源纳入原加载失败重试，其他类型与存档不变，未发现本次阻断项。生成式人物有细微差异，不声称局部以外逐像素相同。

I5：新旧源图、运行映射、实际截图和结果已归档；预览码 preview-hargow-qr.png。Figma未改，用户未验收，无上传。I6：造型准确性和小尺寸辨识待用户反馈；不因生成成功而标记用户认可。
