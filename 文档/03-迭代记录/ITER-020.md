# ITER-020 · 第20关真实牌阵UI

2026-09-26｜WF-1.0.0，无迁移项｜ui-level20-v0.1｜设计已交付，待用户验收

用户要求依据原型与Figma组件重绘第20关UI，关联REQ-002、ITER-019。读取当前game.js和app.js，采用第20关默认种子初始状态；保持玩法和代码不变。范围为Figma独立画板和UI图片，不启动微信工程或广告接入。

## 实现与来源
[Figma第20关](https://www.figma.com/design/RW5WV3CXtgDbdaWfiWb7xN?node-id=27-256)，画板402×734.26；[完整效果图](../../artifacts/ui-level20-v0.1/main.png)。复用当前主页面8:2和当前已修改的六种牌组件，保留用户在Figma中已有的修改，原主页面未覆盖。

数值唯一来源prototypes/snack-tiles/game.js的LEVELS、Game、available、boardLayout。读取时第20关为84牌/9种/12层，默认seed=158380；9张可选、暂存槽0/7、临时区空，三道具各剩1次，其中撤回/移出当前禁用、洗牌可用。该数值为实现现状，不是商业难度验收结论。

84个独立牌按原型x/y/z与类型排列，64逻辑像素步距；复用牌体有底部厚度，外观高度略大于原型方形按钮。整体居中，调整托盘/道具下移以保留区块间距。保留选关、玩法、重开入口和当前阶段提示。未增加新机制。

春卷、月饼、麻花为原型已有而Figma缺少的类型，用内置imagegen按已有图标风格补齐，作为独立位图。来源为项目ITER-018图标参考，未引入外部素材；[生成提示词](../../artifacts/ui-level20-v0.1/extra-foods-prompt.txt)。新素材细节存在生成式差异，待美术验收。

## TEST-ITER020-VIS
已查看实际Figma整页渲染，核对关卡/进度、3个临时槽、7个主槽、道具次数、遮挡亮暗、区块间距；已读取Figma牌位逐一对比原型84牌，坐标/类型/可选状态错误为0。原型代表截图来自layout-v0.5历史证据，另直接执行当前Game生成器核对数据，未声称本轮重新进行浏览器交互测试。

证据：[当前牌局数据](../../artifacts/ui-level20-v0.1/level-state.json)、[节点记录](../../artifacts/ui-level20-v0.1/figma-state.json)、[结构核对](../../artifacts/ui-level20-v0.1/validation.json)。未做点击交互、微信或真机验证；未改运行代码，未重跑无关游戏测试。UI图为Figma渲染而非imagegen任意排列。用户验收待完成。

独立新增画板，旧稿保留；未声称Git回退。文档检查日志artifacts/ui-level20-v0.1/docs-check.txt。
