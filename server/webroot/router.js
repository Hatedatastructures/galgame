/**
 * @brief `场景路由`
 * @details `索引场景与提供查询接口`
 */

"use strict";

const scene_index_map = new Map();

/**
 * @brief `注册场景`
 * @param {Object} scene_obj `场景对象`
 */
function register_scene(scene_obj) {
    scene_index_map.set(scene_obj.scene_id, scene_obj);
}

/**
 * @brief `获取场景`
 * @param {string} scene_id `场景ID`
 * @returns {Object|null} `场景对象或null`
 */
function get_scene(scene_id) {
    return scene_index_map.get(scene_id) || null;
}

/**
 * @brief `判断前置条件是否满足`
 * @param {Object} scene_obj `场景对象`
 * @returns {boolean}
 */
function check_preconditions(scene_obj) {
    const legacy = scene_obj.preconditions;
    if (legacy) {
        for (const key in legacy) {
            const expected = legacy[key];
            const actual = game_state.variables[key];
            if (typeof expected === "number") {
                if (actual !== expected) { return false; }
            } else if (typeof expected === "string" && expected.startsWith(">=")) {
                const threshold = Number(expected.slice(2));
                if (!(actual >= threshold)) { return false; }
            }
        }
    }
    const v2 = Array.isArray(scene_obj.preconditions_v2) ? scene_obj.preconditions_v2 : null;
    if (v2) {
        for (const cond of v2) {
            const key = cond.var;
            const op = cond.op;
            const val = cond.value;
            const actual = game_state.variables[key];
            switch (op) {
                case "eq": if (!(actual === val)) { return false; } break;
                case "ne": if (!(actual !== val)) { return false; } break;
                case "ge": if (!(actual >= val)) { return false; } break;
                case "gt": if (!(actual > val)) { return false; } break;
                case "le": if (!(actual <= val)) { return false; } break;
                case "lt": if (!(actual < val)) { return false; } break;
                default: break;
            }
        }
    }
    return true;
}