/**
 * @brief `游戏引擎入口`
 * @details `控制场景推进、选择与UI交互`
 */

"use strict";

const btn_auto_el = document.getElementById("btn_auto");
const btn_skip_el = document.getElementById("btn_skip");
const btn_backlog_el = document.getElementById("btn_backlog");
const btn_save_el = document.getElementById("btn_save");
const btn_load_el = document.getElementById("btn_load");
const btn_settings_el = document.getElementById("btn_settings");
const btn_settings_close_el = document.getElementById("btn_settings_close");
const btn_export_json_el = document.getElementById("btn_export_json");
const settings_panel_el = document.getElementById("settings_panel");
const backlog_panel_el = document.getElementById("backlog_panel");

/**
 * @brief `初始化并开始游戏`
 */
async function init_engine()
{
    const loaded = await load_script_from_markdown();
    bind_controls();
    if (loaded) {
        go_to_scene(game_state.current_scene_id);
    } else {
        go_to_scene("gw_000_fallback_intro");
    }
    show_welcome_message();
}

/**
 * @brief `显示欢迎消息`
 */
function show_welcome_message()
{
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
function go_to_scene(scene_id)
{
    const scene = get_scene(scene_id);
    if (!scene) { return; }
    if (!check_preconditions(scene)) { return; }

    game_state.current_scene_id = scene_id;
    game_state.current_dialogue_index = 0;

    if (scene.set_flags) { apply_flags(scene.set_flags); }
    // 应用场景图像
    if (typeof apply_scene_visuals === "function") { apply_scene_visuals(scene); }
    render_current_line();
    render_choices();
}

/**
 * @brief `推进一行对话`
 */
function advance_dialogue()
{
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
function choose_option(choice_index)
{
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
function apply_flags(flags)
{
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
function apply_stats_delta(delta)
{
    for (const key in delta) {
        const d = delta[key];
        game_state.variables[key] = (game_state.variables[key] || 0) + d;
    }
}

/**
 * @brief `绑定控制按钮`
 */
function bind_controls()
{
    document.addEventListener("click", (ev) => {
        if (ev.target.id === "dialogue_box") {
            advance_dialogue();
        }
    });

    btn_auto_el.addEventListener("click", () => {
        game_state.auto_mode_enabled = !game_state.auto_mode_enabled;
        btn_auto_el.classList.toggle("auto_active", game_state.auto_mode_enabled);
        btn_auto_el.textContent = game_state.auto_mode_enabled ? "自动中" : "自动";
    });
    btn_skip_el.addEventListener("click", () => {
        game_state.skip_mode_enabled = !game_state.skip_mode_enabled;
        btn_skip_el.classList.toggle("auto_active", game_state.skip_mode_enabled);
        btn_skip_el.textContent = game_state.skip_mode_enabled ? "快进中" : "快进";
    });
    btn_backlog_el.addEventListener("click", () => {
        backlog_panel_el.classList.toggle("hidden");
        refresh_backlog_panel();
    });
    btn_save_el.addEventListener("click", () => save_to_slot(1));
    btn_load_el.addEventListener("click", () => {
        if (load_from_slot(1)) {
            go_to_scene(game_state.current_scene_id);
        }
    });
    btn_settings_el.addEventListener("click", () => settings_panel_el.classList.remove("hidden"));
    btn_settings_close_el.addEventListener("click", () => settings_panel_el.classList.add("hidden"));
    btn_export_json_el.addEventListener("click", export_route_json);

    const text_speed_range_el = document.getElementById("text_speed_range");
    const bgm_volume_range_el = document.getElementById("bgm_volume_range");
    const se_volume_range_el = document.getElementById("se_volume_range");
    text_speed_range_el.addEventListener("input", () => game_state.settings.text_speed = Number(text_speed_range_el.value));
    bgm_volume_range_el.addEventListener("input", () => { game_state.settings.bgm_volume = Number(bgm_volume_range_el.value); audio_manager.update_volumes(); });
    se_volume_range_el.addEventListener("input", () => { game_state.settings.se_volume = Number(se_volume_range_el.value); audio_manager.update_volumes(); });
}

window.addEventListener("load", init_engine);

/**
 * @brief `导出路线为JSON并下载`
 */
function export_route_json()
{
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
function build_route_json_object()
{
    const scenes = [];
    for (const [sid, scene] of scene_index_map.entries()) {
        scenes.push(scene);
    }
    return {
        route_id: "route_gu_wan",
        title: "顾晚线",
        author: "林清河",
        constants: { MAX_QIN_MI_DU, R18_THRESHOLD },
        scenes
    };
}