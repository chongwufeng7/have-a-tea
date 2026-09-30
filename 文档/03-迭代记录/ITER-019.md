# ITER-019 · imagegen图标拆分与Figma绘制

2026-09-26｜WF-1.0.0，无迁移项｜icons-figma-v0.1｜设计已交付，待用户验收

用户已明确：结合imagegen图片，在Figma绘制一份。关联REQ-002、ITER-018。执行reference-to-figma、figma-use技能，限定独立图标，不改主页面、玩法或游戏代码；不扩建完整组件库。

## 实现现状
原文件新增“04 独立图标”页，两块840×1250画板：

- [原图拆分](https://www.figma.com/design/RW5WV3CXtgDbdaWfiWb7xN?node-id=18-179)：12个独立224×224透明图标容器，内部独立图片裁切，按原比例居中；均配置2倍PNG导出。
- [可编辑操作图标](https://www.figma.com/design/RW5WV3CXtgDbdaWfiWb7xN?node-id=18-176)：六种食物仍为位图插画，撤回、洗牌、移出三张、返回、玩法、重开为原生矢量路径，含可编辑渐变与描边，另有SVG导出设置。

来源仅为ITER-018内置image_gen图标合集；原图置于同页对照区。以Figma图片填充裁切拆分，未用整张图冒充独立图标。食物内部笔触不可矢量编辑；矢量版为参考重绘，光影与轮廓存在简化，原图拆分版完整保留供选择。独立图标是命名Frame，不声称均已成为组件。

## TEST-ITER019-VIS 验证
已查看两块画板实际Figma截图：[原图拆分渲染](../../artifacts/icons-figma-v0.1/split.png)、[矢量版渲染](../../artifacts/icons-figma-v0.1/editable.png)。12种主体完整，无相邻素材串入，透明区显示画板底色，名称与各图标一致。结构检查确认24个独立命名图标容器，原主页面未修改。截图按840×1250显示；未做游戏内小尺寸或真机测试，未实际逐项导出独立文件，不等同导出文件验收。

节点/裁切坐标：[状态记录](../../artifacts/icons-figma-v0.1/state.json)。本轮新增画板，旧资料保留，回退不影响原稿。游戏测试未运行。文档检查沿用工具，日志artifacts/icons-figma-v0.1/docs-check.txt；用户视觉验收待完成。
