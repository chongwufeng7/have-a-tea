# ITER-034 · 接入选定背景音乐

2026-09-29｜WF-1.0.0，无迁移项｜计划minigame-v0.7 → minigame-v0.8｜实施中

用户明确选择ACE Music的Charming Guangzhou Scene并要求加入游戏。关联REQ-006音乐设置、REQ-010曲目接入；不重新生成音乐、不付费、不发布作品，不改变关卡/美术。

计划：确认同名原作品、大小/格式与来源，保存源音频，按包体限制生成运行资源，接入现有开关与前后台控制。验收：资源存在且可解码、循环/开关/前后台行为检查、小游戏包体和微信预览、文档同步；真机听感独立待验。

记录边界：下载及接入已由本轮用户明确授权，先告知大小再下载；若出现付费或无法确认曲目则停止该依赖步骤。原文件保留，回退恢复配置/播放器即可关闭新增音乐。实际结果稍后记录，不预填通过。


## 2026-09-30完成记录（跨日接续）
已确认曲库标题Charming Guangzhou Scene、work_id 4jQWQy7m、模型acestep-v15-xl-turbo、27秒。下载前告知438548字节约428KB，下载已获本轮明确授权。原文件后缀aac，容器实际M4A，保存assets/audio/charming-guangzhou/original.aac；按正确扩展名复制到minigame/assets/audio/charming-guangzhou.m4a，SHA256一致，不改旋律或音质。来源/参数见source.json与generation-request.json，未付费或公开发布原作品。

实现：config.js设置本地musicSource，版本minigame-v0.8；沿用music.js首次有效点击后播放、loop=true、音量0.45、开关持久化及前后台控制。关闭偏好不强制重开，换关不重建播放器。设置内“音乐制作中”提示因有音源自然隐藏。其他玩法、美术、云端、广告不改。

实际验证：npm test 32/32通过；浏览器wx适配器实际加载并解码M4A，27秒双声道，播放、循环标志、后台暂停、前台恢复、关闭暂停检查通过，audio-check.json留档。五视口及交互检查通过。循环标志通过不等于循环接缝听感已验证；不是微信真机播放验收。

微信CLI预览成功4113441字节，工具显示3.9MB；证据artifacts/minigame-v0.8/wechat-preview.txt、preview-info.json、preview-qr.png。低于项目4MiB检查阈值但余量小，后续加资源需重新检查。未审核/发布。

失败/限制如实记录：签名下载链接HEAD请求403，改为合法范围GET确认文件大小后下载；本机FFmpeg无libmp3lame且缺AAC解码器，转码未成功，未使用失败产物。最终用原M4A，浏览器实际解码通过；未安装/下载额外编码器。Canvas检查初次因9237未启动失败，启动浏览器后重跑通过。微信官方API与ACE条款网页在web工具中不可访问，未声称本轮重新核验完整条款；沿用此前来源证据和现有API实现。待手机实际试听/循环衔接与系统静音行为验证。

回退恢复before中的config/music，可重新关闭音源；源文件和运行副本可保留，不删除用户作品。文档检查见docs-check.txt，既有白名单问题未擅改。

本轮最终文档检查：67份Markdown、0错误。检查脚本已有另一任务ITER-035登记用户确认的目录，本轮未修改该脚本；先前白名单失败为历史记录。
