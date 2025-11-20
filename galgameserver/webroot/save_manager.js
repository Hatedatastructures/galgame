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
function load_from_slot(slot_id) {
    const raw = localStorage.getItem(SAVE_KEY_PREFIX + slot_id);
    if (!raw) { return false; }
    try {
        const payload = JSON.parse(raw);
        game_state.current_scene_id = payload.current_scene_id;
        game_state.current_dialogue_index = payload.current_dialogue_index;
        game_state.variables = payload.variables;
        return true;
    } catch {
        return false;
    }
}