# ITER-045 · 建立公开 GitHub 仓库基线

2026-09-30｜流程 WF-1.0.0，无迁移项｜代码运行版本保持 minigame-v0.13｜用户明确要求将项目上传至 `https://github.com/chongwufeng7/have-a-tea.git`。

## 范围和依据

目标仓库为用户账号下的空公开仓库。本地项目此前没有 Git 历史。本轮建立版本控制基线并上传游戏工程、源素材、原型、测试、工具及项目文档；不改玩法、界面、存档、广告或云环境，不将上传等同小游戏发布。

公开仓库排除本地 `artifacts/` 证据及浏览器资料、`.cache/`、依赖目录、微信开发者工具的 `project.private.config.json`、环境文件和常见私钥。`Implement-from-Figma-main/` 是用户提供的第三方辅助技能文件夹，项目记录未确认再分发授权，保留本机而不上传。证据仍保存在本机 `artifacts/`，GitHub 克隆版不含历史截图与调试日志。

## 核对与验证

已确认 GitHub 仓库名及本账号写入权限；工程入口仍为 `minigame/project.config.json`。运行素材含用户指定的 ACE Music 曲目，来源、授权现状与未审计事项记录在 `assets/audio/charming-guangzhou/source.json`；Figma 素材来源在各 `assets/*/sources.json`。本轮不会宣称第三方权利已获全面清除。

上传前需检查暂存文件、运行 `npm test` 与 `npm run check:docs`；上传后以远端提交和文件树复核为准。微信模拟器/真机的遗留项仍以 ITER-044 为准。

## 实际交付与复核

`npm test` 50/50通过，`npm run check:docs` 检查79份Markdown、0错误。首次提交 `ea2cfb3429ade412e970da0b944654158e0e6289` 已推送至 `origin/main`；`git ls-remote` 返回同一提交，GitHub 远端可以读取 `minigame/project.config.json`。共提交220个文件，暂存核对未包含 `artifacts/`、`.cache/`、`Implement-from-Figma-main/` 或私有配置；最大文件约10.9MB，全部低于GitHub单文件限制。项目运行版本仍为 minigame-v0.13，未做微信发布或云部署。

本段为首个提交完成后的文档补记；其最终提交号以后续Git记录为准。公开仓库地址：`https://github.com/chongwufeng7/have-a-tea`。
