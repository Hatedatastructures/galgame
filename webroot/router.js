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
function register_scene(scene_obj)
{
    scene_index_map.set(scene_obj.scene_id, scene_obj);
}

/**
 * @brief `获取场景`
 * @param {string} scene_id `场景ID`
 * @returns {Object|null} `场景对象或null`
 */
function get_scene(scene_id)
{
    return scene_index_map.get(scene_id) || null;
}

/**
 * @brief `判断前置条件是否满足`
 * @param {Object} scene_obj `场景对象`
 * @returns {boolean}
 */
function check_preconditions(scene_obj)
{
    if (!scene_obj.preconditions) { return true; }
    for (const key in scene_obj.preconditions) {
        const expected = scene_obj.preconditions[key];
        const actual = game_state.variables[key];
        if (typeof expected === "number") {
            if (actual !== expected) { return false; }
        } else if (typeof expected === "string" && expected.startsWith(">=")) {
            const threshold = Number(expected.slice(2));
            if (!(actual >= threshold)) { return false; }
        }
    }
    return true;
}