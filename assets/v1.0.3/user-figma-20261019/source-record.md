# 用户Figma更新同步来源

2026-10-19，ITER-049 / REQ-049-FIGMA-USER-01。用户明确授权按其自行修改的Figma组件和效果图实施。来源原文件RW5WV3CXtgDbdaWfiWb7xN，餐车185:1991（独立导出图，含用户CROP设置）、蒸笼146:1549内的FIT源图、木托盘195:2294内Frame1的源图。通过get_design_context及download_assets返回地址下载，无额外第三方素材或许可声明。用户提供素材的外部权属未独立核验。仅机械缩放和调色板压缩，保留透明。

当前暂存组件中前三格的虾饺属于摆放示例，原生按实际暂存数组动态绘制，不烘焙进底板；容量文字同样按实际数量显示。其余七个浅色托位均保留，无虚线。旧整板版本为被本次用户设计替代的历史，不能回写覆盖本次Figma。

排查发现download_assets的402×134导出图alpha恒为255、带白底；已保留问题样本chassis.png。最终运行改用get_design_context提供的原始chassis-source.png（1619×971，alpha 0—255），以原Figma imageTransform在Canvas裁切，避免白底矩形。保持用户原裁切，没有另行重画或背景抠图。
