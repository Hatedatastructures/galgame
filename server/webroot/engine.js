
"use strict";
(function () {

    const btn_auto_el = document.getElementById("btn_auto");
    const btn_skip_el = document.getElementById("btn_skip");
    const btn_backlog_el = document.getElementById("btn_backlog");
    const btn_backlog_close_el = document.getElementById("btn_backlog_close");
    const backlog_panel_el = document.getElementById("backlog_panel");
    const backlog_list_el = document.getElementById("backlog_list");
    const btn_save_el = document.getElementById("btn_save");
    const btn_load_el = document.getElementById("btn_load");
    const btn_settings_el = document.getElementById("btn_settings");
    const btn_settings_close_el = document.getElementById("btn_settings_close");
    const btn_export_json_el = document.getElementById("btn_export_json");
    const settings_panel_el = document.getElementById("settings_panel");// 主菜单控件
    const main_menu_el = document.getElementById("main_menu");
    const btn_start_game_el = document.getElementById("btn_start_game");
    const btn_continue_game_el = document.getElementById("btn_continue_game");
    const btn_settings_menu_el = document.getElementById("btn_settings_menu");
    const btn_exit_el = document.getElementById("btn_exit");
    const btn_load_menu_el = document.getElementById("btn_load_menu");
    const btn_import_local_el = document.getElementById("btn_import_local");
    const route_file_input_el = document.getElementById("route_file_input");
    const theme_select_el = document.getElementById("theme_select");
    const control_bar_wrapper_el = document.getElementById("control_bar_wrapper");
    const blur_range_el = document.getElementById("blur_range");
    const opacity_range_el = document.getElementById("opacity_range");

    /**
     * @brief `初始化并开始游戏`
     */
    async function init_engine() {
        set_loading(true);
        try {
            await load_script_from_markdown();
            bind_controls();
            hide_control_bar();
            document.getElementById("character_layer").classList.add("hidden");
            document.getElementById("dialogue_layer").classList.add("hidden");
            backlog_panel_el.classList.add("hidden");
        } finally {
            set_loading(false);
        }
    }

    /**
     * @brief 真正进入第一句剧情
     */
    async function start_first_scene() {
        set_loading(true);
        const scene_id = pick_start_scene_id();
        // 应用首屏视觉
        apply_scene_visuals({
            bg_image: "assets/bg/bg_teahouse_01.webp",
            char_image: "assets/char/char_gu_wan_default.webp"
        });
        // 进入剧情，显示角色层/对话层
        document.getElementById("character_layer").classList.remove("hidden");
        document.getElementById("dialogue_layer").classList.remove("hidden");
        // 清空旧日志
        if (backlog_list_el) { backlog_list_el.innerHTML = ""; }
        await go_to_scene(scene_id);
        set_loading(false);
    }

    function pick_start_scene_id() {
        if (get_scene(game_state.current_scene_id)) { return game_state.current_scene_id; }
        for (const [sid] of scene_index_map.entries()) { return sid; }
        return "gw_000_fallback_intro";
    }

    /**
     * @brief `显示欢迎消息`
     */
    function show_welcome_message() {
        const dialogue_box = document.getElementById("dialogue_box");
        const name_plate = document.getElementById("name_plate");

        name_plate.textContent = "系统提示";
        dialogue_box.innerHTML = "欢迎来到《古风Galgame - 顾晚线》！<br><br>点击对话框继续剧情，使用控制栏按钮调整游戏设置。<br><br>祝您游戏愉快！🎮";
        dialogue_box.classList.add("fade_in");
    }

    /* duplicate go_to_scene removed */

    /**
     * @brief `渲染场景`
     * @param {object} scene `场景对象`
     */





    /**
     * @brief 显示顶部玻璃控制栏
     */
    function show_control_bar() {
        control_bar_wrapper_el.classList.remove("hidden");
    }

    /**
     * @brief 隐藏顶部玻璃控制栏
     */
    function hide_control_bar() {
        control_bar_wrapper_el.classList.add("hidden");
    }

    /**
     * @brief 刷新日志面板（保持滚动到顶部）
     */


    /* ========================= 转场管理 ========================= */

    const transition_overlay_el = document.getElementById("transition_overlay");

    /**
     * @brief  场景转场遮罩
     * @param  {number} hold_ms 遮罩停留毫秒
     * @return {Promise}  resolve 时遮罩已完全关闭
     */
    function transition_async(hold_ms = 400) {
        return new Promise(resolve => {
            transition_overlay_el.classList.add("active");
            setTimeout(() => {
                transition_overlay_el.classList.remove("active");
                setTimeout(resolve, 600); // 等淡出完成
            }, hold_ms);
        });
    }

    /**
     * @brief  带转场的背景替换
     * @param  {string} url 新背景地址
     */
    async function change_bg_with_transition(url) {
        const bg = document.getElementById("bg_layer");
        bg.classList.remove("show");
        bg.classList.add("exit");
        await transition_async(300);
        bg.style.backgroundImage = `url(${url})`;
        bg.classList.remove("exit");
        bg.classList.add("enter");
        // 强制重排
        void bg.offsetWidth;
        bg.classList.remove("enter");
        bg.classList.add("show");
    }

    /**
     * @brief  带转场的立绘替换
     * @param  {HTMLElement} sprite 立绘节点
     * @param  {string}      url   新立绘地址
     */
    async function change_sprite_with_transition(sprite, url) {
        sprite.classList.remove("show");
        sprite.classList.add("exit");
        await transition_async(200);
        sprite.style.backgroundImage = `url(${url})`;
        sprite.classList.remove("exit");
        sprite.classList.add("enter");
        void sprite.offsetWidth;
        sprite.classList.remove("enter");
        sprite.classList.add("show");
    }

    /**
     * @brief  带转场的对话文本更新
     * @param  {string} name  名字
     * @param  {string} text  文本
     */
    async function change_dialogue_with_transition(name, text) {
        const layer = document.getElementById("dialogue_layer");
        layer.classList.remove("show");
        layer.classList.add("exit");
        await transition_async(150);
        document.getElementById("name_plate").textContent = name;
        document.getElementById("dialogue_box").textContent = text;
        layer.classList.remove("exit");
        layer.classList.add("enter");
        void layer.offsetWidth;
        layer.classList.remove("enter");
        layer.classList.add("show");
    }


    /**
     * @brief `显示欢迎消息`
     */
    function show_welcome_message() {
        const dialogue_box = document.getElementById("dialogue_box");
        const name_plate = document.getElementById("name_plate");

        name_plate.textContent = "系统提示";
        dialogue_box.innerHTML = "欢迎来到《古风Galgame - 顾晚线》！<br><br>点击对话框继续剧情，使用控制栏按钮调整游戏设置。<br><br>祝您游戏愉快！🎮";
        dialogue_box.classList.add("fade_in");
    }

    /**
     * @brief `跳转到场景`
     * @param {string} scene_id `场景ID`
     */
    async function go_to_scene(scene_id) {
        let scene = get_scene(scene_id);
        if (!scene) {
            const fetched = await fetch_scene_json_from_server(scene_id);
            if (fetched) { register_scene(fetched); }
            scene = get_scene(scene_id);
        }
        if (!scene) { return; }
        if (!check_preconditions(scene)) { return; }
        game_state.current_scene_id = scene_id;
        game_state.current_dialogue_index = 0;
        if (scene.set_flags) { apply_flags(scene.set_flags); }
        if (typeof apply_scene_visuals === "function") { apply_scene_visuals(scene); }
        render_current_line();
        render_choices();
    }

    /**
     * @brief `推进一行对话`
     */
    function advance_dialogue() {
        const scene = get_scene(game_state.current_scene_id);
        if (!scene) { return; }
        const next_index = game_state.current_dialogue_index + 1;
        if (next_index < (scene.dialogues?.length || 0)) {
            game_state.current_dialogue_index = next_index;
            render_current_line();
        } else {
            render_choices();
        }
    }

    /**
     * @brief `选择选项`
     * @param {number} choice_index `选项索引`
     */
    function choose_option(choice_index) {
        const scene = get_scene(game_state.current_scene_id);
        if (!scene || !scene.choices) { return; }
        const choice = scene.choices[choice_index];
        if (!choice) { return; }

        if (choice.set_flags) { apply_flags(choice.set_flags); }
        if (choice.stats_delta) { apply_stats_delta(choice.stats_delta); }

        go_to_scene(choice.next);
    }

    /**
     * @brief `应用标记位`
     * @param {Object} flags `标记`
     */
    function apply_flags(flags) {
        for (const key in flags) {
            const val = flags[key];
            if (typeof val === "string" && val.startsWith("+")) {
                game_state.variables[key] = (game_state.variables[key] || 0) + Number(val.slice(1));
            } else {
                game_state.variables[key] = val;
            }
        }
    }

    /**
     * @brief `应用数值变化`
     * @param {Object} delta `变化`
     */
    function apply_stats_delta(delta) {
        for (const key in delta) {
            const d = delta[key];
            game_state.variables[key] = (game_state.variables[key] || 0) + d;
        }
    }

    /**
     * @brief `绑定控制按钮`
     */
    function bind_controls() {
        document.addEventListener("click", (ev) => {
            if (ev.target && ev.target.id === "dialogue_box") { advance_dialogue(); }
        });
        if (btn_auto_el) btn_auto_el.addEventListener("click", () => {
            game_state.auto_mode_enabled = !game_state.auto_mode_enabled;
            btn_auto_el.classList.toggle("auto_active", game_state.auto_mode_enabled);
            btn_auto_el.textContent = game_state.auto_mode_enabled ? "自动中" : "自动";
        });
        if (btn_skip_el) btn_skip_el.addEventListener("click", () => {
            game_state.skip_mode_enabled = !game_state.skip_mode_enabled;
            btn_skip_el.classList.toggle("auto_active", game_state.skip_mode_enabled);
            btn_skip_el.textContent = game_state.skip_mode_enabled ? "快进中" : "快进";
        });
        if (btn_backlog_el) btn_backlog_el.addEventListener("click", () => { backlog_panel_el.classList.toggle("hidden"); refresh_backlog_panel(); });
        if (btn_save_el) btn_save_el.addEventListener("click", () => save_to_slot(1));
        if (btn_load_el) btn_load_el.addEventListener("click", async () => {
            const loaded = await load_script_from_markdown();
            if (!loaded) { register_fallback_scenes(); }
            if (await load_from_slot(1)) { go_to_scene(game_state.current_scene_id); }
        });
        if (btn_settings_el) btn_settings_el.addEventListener("click", () => settings_panel_el.classList.remove("hidden"));
        if (btn_settings_close_el) btn_settings_close_el.addEventListener("click", () => settings_panel_el.classList.add("hidden"));
        if (btn_backlog_close_el) btn_backlog_close_el.addEventListener("click", () => backlog_panel_el.classList.add("hidden"));
        if (btn_export_json_el) btn_export_json_el.addEventListener("click", export_route_json);
        const text_speed_range_el = document.getElementById("text_speed_range");
        const bgm_volume_range_el = document.getElementById("bgm_volume_range");
        const se_volume_range_el = document.getElementById("se_volume_range");
        if (text_speed_range_el) text_speed_range_el.addEventListener("input", () => game_state.settings.text_speed = Number(text_speed_range_el.value));
        if (bgm_volume_range_el) bgm_volume_range_el.addEventListener("input", () => { game_state.settings.bgm_volume = Number(bgm_volume_range_el.value); audio_manager.update_volumes(); });
        if (se_volume_range_el) se_volume_range_el.addEventListener("input", () => { game_state.settings.se_volume = Number(se_volume_range_el.value); audio_manager.update_volumes(); });
        if (theme_select_el) theme_select_el.addEventListener("change", () => {
            const val = theme_select_el.value || "dark";
            game_state.settings.theme = val;
            localStorage.setItem("gw_theme", val);
            apply_theme(val);
        });
        document.addEventListener("keydown", (ev) => {
            const k = (ev.key || "").toLowerCase();
            if (k === "enter" || k === " ") { advance_dialogue(); }
            if (k === "b") { backlog_panel_el.classList.toggle("hidden"); refresh_backlog_panel(); }
            if (k === "s") { settings_panel_el.classList.toggle("hidden"); }
            if (k === "a") { if (btn_auto_el) btn_auto_el.click(); }
            if (k === "k") { if (btn_skip_el) btn_skip_el.click(); }
            if (/^[1-9]$/.test(k)) { const idx = Number(k) - 1; choose_option(idx); }
        });
    }



    /**
     * @brief `导出路线为JSON并下载`
     */
    function export_route_json() {
        const data_obj = build_route_json_object();
        const json_str = JSON.stringify(data_obj, null, 2);
        const blob = new Blob([json_str], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "route_gu_wan.json";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    /**
     * @brief `构建路线JSON对象`
     */
    function build_route_json_object() {
        const scenes = [];
        for (const [sid, scene] of scene_index_map.entries()) {
            scenes.push(scene);
        }
        const meta = (typeof route_metadata === "object" && route_metadata) ? route_metadata : {
            route_id: "route_gu_wan",
            title: "顾晚线",
            author: "林清河",
            schema_version: 2,
            emotions_enum: ["gentle", "calm", "soft", "firm"],
            characters: {},
            assets_manifest: {},
            dialogue_target_count: 5000,
            scene_target_count: 50,
            constants: { MAX_QIN_MI_DU, R18_THRESHOLD }
        };
        return { ...meta, scenes };
    }
    /**
     * @brief `主菜单初始化`
     */
    async function init_boot() {
        try {
            apply_scene_visuals({
                bg_image: "assets/bg/bg_teahouse_01.webp",
                char_image: "assets/char/char_gu_wan_default.webp"
            });
        } catch { }
        // 按钮绑定
        if (btn_start_game_el) { btn_start_game_el.addEventListener("click", start_new_game); }
        if (btn_continue_game_el) { btn_continue_game_el.addEventListener("click", continue_game); }
        if (btn_load_menu_el) { btn_load_menu_el.addEventListener("click", continue_game); }
        if (btn_settings_menu_el) { btn_settings_menu_el.addEventListener("click", () => settings_panel_el.classList.remove("hidden")); }
        if (btn_exit_el) { btn_exit_el.addEventListener("click", () => window.close()); }
        if (btn_import_local_el && route_file_input_el) {
            btn_import_local_el.addEventListener("click", () => route_file_input_el.click());
            route_file_input_el.addEventListener("change", async () => {
                const f = route_file_input_el.files && route_file_input_el.files[0];
                if (!f) { return; }
                const ok = await import_route_from_file(f);
                if (ok) {
                    main_menu_el.classList.add("hidden");
                    show_control_bar();
                    await start_first_scene();
                }
            });
        }

        // 遮罩模糊度实时调节
        blur_range_el.addEventListener("input", e => {
            const px = e.target.value + 'px';
            document.documentElement.style.setProperty('--glass_blur', px);
            localStorage.setItem('gw_glass_blur', px);
        });
        // 玻璃透明度实时调节（0-100 -> 0-1）
        if (opacity_range_el) {
            opacity_range_el.addEventListener("input", e => {
                const alpha = (Number(e.target.value) / 100).toFixed(2);
                document.documentElement.style.setProperty('--glass_bg_alpha', alpha);
                localStorage.setItem('gw_glass_opacity', alpha);
            });
        }
        // 读取保存值
        const saved_blur = localStorage.getItem('gw_glass_blur') || '12px';
        document.documentElement.style.setProperty('--glass_blur', saved_blur);
        blur_range_el.value = parseInt(saved_blur);
        const default_alpha = getComputedStyle(document.documentElement).getPropertyValue('--glass_bg_alpha').trim() || '0.40';
        const saved_alpha = localStorage.getItem('gw_glass_opacity') || default_alpha;
        document.documentElement.style.setProperty('--glass_bg_alpha', saved_alpha);
        if (opacity_range_el) { opacity_range_el.value = Math.round(Number(saved_alpha) * 100).toString(); }
        const saved_theme = localStorage.getItem("gw_theme") || game_state.settings.theme || "dark";
        apply_theme(saved_theme);
        if (theme_select_el) { theme_select_el.value = saved_theme; }
        // 有无存档指示
        const has_save = !!localStorage.getItem("gw_save_slot_1");
        if (!has_save) { btn_continue_game_el.classList.add("disabled"); }
    }

    /**
     * @brief `开始新游戏`
     */
    async function start_new_game() {
        main_menu_el.classList.add("hidden");
        show_control_bar();
        const loaded = await load_script_from_markdown();
        if (!loaded) { register_fallback_scenes(); }
        await start_first_scene();
    }

    /**
     * @brief `继续游戏`
     */
    async function continue_game() {
        const loaded = await load_script_from_markdown();
        if (!loaded) { register_fallback_scenes(); }
        if (await load_from_slot(1)) {
            main_menu_el.classList.add("hidden");
            show_control_bar();
            start_first_scene(); // 统一入口
        }
    }
    /**
     * @brief `设置加载遮罩`
     */
    function set_loading(on) {
        const el = document.getElementById("loading_overlay");
        if (!el) { return; }
        el.classList.toggle("hidden", !on);
    }

    function apply_theme(theme) {
        document.body.classList.remove("theme_dark");
        if (theme === "dark") {
            document.body.classList.add("theme_dark");
        }
    }

    /**
     * @brief `推进循环（自动/快进）`
     */
    setInterval(() => {
        if (game_state.auto_mode_enabled) {
            advance_dialogue();
        } else if (game_state.skip_mode_enabled) {
            advance_dialogue();
        }
    }, 600);

    window.init_engine = init_engine;
    window.init_boot = init_boot;
    window.choose_option = choose_option;
})();
