/**
 * @brief `游戏状态管理`
 * @details `维护变量、当前场景与UI运行参数`
 */

"use strict";

const MAX_QIN_MI_DU = 100;
const R18_THRESHOLD = 70;

const game_state = {
    current_scene_id: "gw_001_intro",
    current_dialogue_index: 0,
    auto_mode_enabled: false,
    skip_mode_enabled: false,
    backlog_lines: [],
    current_bg: null,
    current_char: null,
    current_cg: null,
    current_cg_audio: null,
    variables: {
        route_gu_wan_locked: 0,
        gu_wan_qin_mi_du: 0,
        consent_confirmed: 0,
        route_stability_gw: 0,
        tea_debt_resolved: 0
    },
    settings: {
        text_speed: 30,
        bgm_volume: 0.6,
        se_volume: 0.8,
        theme: "dark"
    }
};

/**
 * @brief `重置游戏状态`
 */
function reset_game_state()
{
    game_state.current_scene_id = "gw_001_intro";
    game_state.current_dialogue_index = 0;
    game_state.auto_mode_enabled = false;
    game_state.skip_mode_enabled = false;
    game_state.backlog_lines = [];
    game_state.current_bg = null;
    game_state.current_char = null;
    game_state.current_cg = null;
    game_state.current_cg_audio = null;
    game_state.variables = {
        route_gu_wan_locked: 0,
        gu_wan_qin_mi_du: 0,
        consent_confirmed: 0,
        route_stability_gw: 0,
        tea_debt_resolved: 0
    };
    game_state.settings.theme = localStorage.getItem("gw_theme") || "dark";
}
