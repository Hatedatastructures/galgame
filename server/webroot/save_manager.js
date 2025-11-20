/**
 * @brief `存档管理器`
 * @details `提供多槽存档与读档`
 */

"use strict";

const SAVE_KEY_PREFIX = "gw_save_slot_";

/**
 * @brief `保存到槽`
 * @param {number} slot_id `槽位ID`
 */
function save_to_slot(slot_id) {
    const payload = {
        current_scene_id: game_state.current_scene_id,
        current_dialogue_index: game_state.current_dialogue_index,
        variables: game_state.variables
    };
    localStorage.setItem(SAVE_KEY_PREFIX + slot_id, JSON.stringify(payload));
}

/**
 * @brief `从槽读取`
 * @param {number} slot_id `槽位ID`
 */
async function load_from_slot(slot_id) {
    const raw = localStorage.getItem(SAVE_KEY_PREFIX + slot_id);
    if (!raw) { return false; }
    try {
        const payload = JSON.parse(raw);
        const scene_id = typeof payload.current_scene_id === "string" ? payload.current_scene_id : "";
        let scene = get_scene(scene_id);
        if (!scene) {
            try {
                const fetched = await fetch_scene_json_from_server(scene_id);
                if (fetched) { register_scene(fetched); scene = get_scene(scene_id); }
            } catch { }
        }
        if (!scene) { return false; }
        const max_idx = Math.max(0, (scene.dialogues?.length || 0) - 1);
        const idx = Number.isFinite(payload.current_dialogue_index) ? Math.max(0, Math.min(payload.current_dialogue_index, max_idx)) : 0;
        game_state.current_scene_id = scene_id;
        game_state.current_dialogue_index = idx;
        game_state.variables = (payload.variables && typeof payload.variables === "object") ? payload.variables : game_state.variables;
        return true;
    } catch {
        return false;
    }
}