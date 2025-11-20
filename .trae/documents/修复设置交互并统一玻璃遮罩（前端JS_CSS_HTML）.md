## 问题定位
- 设置按钮无响应：仅绑定了 `btn_settings_menu`，未绑定顶部控制栏的 `btn_settings`。参考 webroot/engine.js:503。
- 日志按钮绑定重复：`btn_backlog_el` 在 webroot/engine.js:405 与 417 两处绑定，逻辑不一致（toggle 与强制打开），导致体验混乱。
- 主菜单阶段仍可见底部大面板：`#dialogue_layer` 在主菜单显示，造成“下方那个大的日志/对话板块”误出场。参考 webroot/index.html:17-21 与 :68。
- 玻璃遮罩模糊度未统一：设置面板 `.panel` 使用固定 `backdrop-filter: blur(20px)`，未走统一变量。参考 webroot/styles.css:692。
- 右侧圆圈图标需要移除：参考 webroot/index.html:79-83。

## 修改方案
### 1. 事件绑定修复（engine.js）
- 在 `bind_controls()` 中给顶部控制栏按钮 `btn_settings` 绑定：点击 → `settings_panel_el.classList.remove("hidden")`。参考 webroot/engine.js:415 附近。
- 统一日志面板：删除重复绑定，保留“点击日志按钮 toggle 显隐 + 刷新列表”的一处逻辑；保留关闭按钮 `btn_backlog_close` 仅做隐藏。参考 webroot/engine.js:405-418。
- 开始/继续游戏：维持 `start_new_game()` 与 `continue_game()` → `show_control_bar()` → `start_first_scene()` 的流程，确保进入剧情必然显示控制栏与首句。参考 webroot/engine.js:507-512、517-526。
- 对话入日志：在 `render_dialogue()` 已将对话写入 `#backlog_list`；确认节点获取 `backlog_list_el` 存在。参考 webroot/engine.js:120-132、13。

### 2. 显示策略与层级（HTML+JS）
- 默认（主菜单阶段）隐藏：`#character_layer`、`#dialogue_layer`、`#backlog_panel`。
- 进入剧情后：显示 `#character_layer` 与 `#dialogue_layer`；日志面板依旧隐藏，仅在点击“日志”时玻璃态弹出。
- 实现方式：
  - 在 `init_engine()` 完成加载后，确保 `hide_control_bar()`，并给上述三层加 `hidden` 类。
  - 在 `start_first_scene()` 前移除 `character_layer` 与 `dialogue_layer` 的 `hidden` 类。

### 3. 统一玻璃遮罩变量（styles.css）
- 已有变量：`:root` 中 `--glass_blur`、`--glass_bg`、`--glass_border`。参考 webroot/styles.css:40-43。
- 将 `.panel`（设置面板）中的固定值替换为变量：
  - `background: var(--glass_bg)`
  - `backdrop-filter: blur(var(--glass_blur))`
  - `border: 1px solid var(--glass_border)`
- 左侧菜单按钮 `.gal_btn`、顶部控制栏 `#control_bar`、对话框 `#dialogue_layer`、日志面板 `.glass_panel` 均保持使用上述变量，确保“模糊度滑条”统一生效。

### 4. 移除右侧圆圈（index.html）
- 删除 `<!-- 右侧小圆图标 -->` 区块。参考 webroot/index.html:79-83。

### 5. 设置面板：模糊度滑条（engine.js）
- 已实现 `blur_range` 实时变更：`document.documentElement.style.setProperty('--glass_blur', px)` 并 `localStorage` 持久化。参考 webroot/engine.js:499-508。
- 启动时读取本地值并同步滑条位置，已实现（webroot/engine.js:506-508）。

## 验收与测试
- 打开 index.html：主菜单只显示左侧玻璃按钮列；顶部控制栏隐藏；下方大面板不出现。
- 点击“游戏设置”（左侧）：侧边设置玻璃面板弹出；调整“遮罩模糊度”滑条，观察顶部控制栏、菜单按钮、对话框、日志面板的模糊度统一变化。
- 点击“开始游戏”：主菜单隐藏，顶部玻璃控制栏淡入；立绘与底部对话框出现；对话推进时，打开“日志”可见玻璃态的对话历史（背景清晰可见）。
- 回到主菜单（若有入口或刷新）：上述隐藏策略保持。

## 说明
- 本次变更只涉及前端 HTML/CSS/JS，保持你现有的路由和剧情 JSON，不触碰后端（server.exe）。
- 命名延续现有代码库风格，避免大规模重构造成不必要风险；统一玻璃材质通过变量完成。
- 变更点均为“必要且直接”，不做无意义改动。请确认后我立即实施并完成验证。