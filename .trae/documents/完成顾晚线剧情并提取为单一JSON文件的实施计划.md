## 目标
- 在网页端临时生成`WebP`格式占位图（背景/立绘/CG），确保当前项目可视化正常运行；不依赖外部素材即可预览。
- 保持后续可替换：当你生成正式图片后，直接替换同名`webp`文件或改字段即可。

## 生成与接入方案
- 新增文件：`webroot/placeholder_images.js`
  - 使用`Canvas`绘制古风动漫风格的简化场景（雨巷、茶阁、渡口、灯会）与立绘/CG轮廓；
  - 导出函数：
    - `get_temp_webp(name, width=1920, height=1080)`：返回`image/webp`的`dataURL`；
    - 支持名称：`bg_rain_alley_01`、`bg_teahouse_01`、`bg_river_dock_01`、`bg_lantern_festival_01`、`char_gu_wan_default`等；
- 引擎改造（最小改动）：
  - 在`renderer.js`的`preload_and_apply_*`中加入`fetch`失败时的回退：调用`get_temp_webp`生成临时图片并应用到对应层（背景/立绘/CG）。
  - 不改变现有加载成功逻辑；仅在文件缺失或读取失败时启用占位生成。

## 命名与目录
- 临时占位不落地为文件（纯`dataURL`），后续正式素材放置位置：
  - 背景：`webroot/assets/bg/*.webp`
  - 立绘：`webroot/assets/char/*.webp`
  - CG：`webroot/assets/cg/*.webp`
- 现有`plot.md`引用保持不变；当对应文件不存在时自动使用占位。

## 风格与常量
- 蛇形命名；常量大写：如`TEMP_IMAGE_WIDTH=1920`、`TEMP_IMAGE_HEIGHT=1080`。
- 注释采用中文`/** doxygen */`，UTF-8，4空格缩进，C++式大括号换行风格（JS中保持风格一致）。

## 验证
- 打开`webroot/index.html`，在未提供正式图片的情况下，所有含`bg_image/char_image/cg_image`字段的场景均展示临时`webp`占位图；
- 当你放入正式`webp`素材后，加载成功则不会触发占位生成；

## 后续（剧情与JSON）
- 我将继续完成剧情扩写至≥5000条对白，之后编写提取器输出`webroot/data/route_gu_wan.json`并让引擎优先加载JSON。