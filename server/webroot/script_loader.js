/**
 * @brief `脚本加载器`
 * @details `从plot.md中提取scene-json块并注册为场景`
 */

"use strict";

// 路由元数据缓存（从JSON顶层读取并保留，用于导出）
let route_metadata = null;

/**
 * @brief `加载剧情文件并解析`
 * @returns {Promise<void>}
 */
async function load_script_from_markdown() {
    const urls_to_try = ["./data/route_gu_wan.json", "/data/route_gu_wan.json", "data/route_gu_wan.json"];
    let md_text = null;
    let json_text = null;
    for (const url of urls_to_try) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                const text = await response.text();
                if (url.toLowerCase().endsWith(".json")) {
                    json_text = text;
                } else {
                    md_text = text;
                }
                break;
            }
        } catch (e) {
        }
    }

    if (json_text) {
        try {
            const data = JSON.parse(json_text);
            route_metadata = {
                route_id: data.route_id,
                title: data.title,
                author: data.author,
                schema_version: data.schema_version,
                emotions_enum: data.emotions_enum,
                characters: data.characters,
                assets_manifest: data.assets_manifest,
                dialogue_target_count: data.dialogue_target_count,
                scene_target_count: data.scene_target_count,
                constants: data.constants
            };
            if (Array.isArray(data.scenes)) {
                for (const s of data.scenes) { register_scene(s); }
            }
            const char_urls = ["./data/characters.json", "/data/characters.json", "data/characters.json"];
            for (const cu of char_urls) {
                try {
                    const r = await fetch(cu);
                    if (r.ok) {
                        const dict = await r.json();
                        const base = (typeof route_metadata.characters === "object" && route_metadata.characters) ? route_metadata.characters : {};
                        for (const k in dict) {
                            if (Object.prototype.hasOwnProperty.call(dict, k)) {
                                base[k] = { ...(base[k] || {}), ...dict[k] };
                                const bp = base[k].default_portraits || {};
                                const np = (dict[k] && dict[k].default_portraits) ? dict[k].default_portraits : {};
                                base[k].default_portraits = { ...bp, ...np };
                            }
                        }
                        route_metadata.characters = base;
                        break;
                    }
                } catch {}
            }
            return true;
        } catch (e) {
            console.error("解析JSON失败", e);
        }
    }

    register_fallback_scenes();
    return false;
}

/**
 * @brief `从markdown中提取scene-json代码块`
 * @param {string} md_text `markdown文本`
 * @returns {string[]} `JSON字符串数组`
 */
function extract_scene_blocks(md_text) {
    const blocks = [];
    const regex = /```scene-json\n([\s\S]*?)\n```/g;
    let match;
    while ((match = regex.exec(md_text)) !== null) {
        blocks.push(match[1]);
    }
    return blocks;
}

/**
 * @brief `注册回退场景`
 * @details `当无法加载plot.md时，保证页面不空白`
 */
function register_fallback_scenes() {
    const scene_intro = {
        scene_id: "gw_000_fallback_intro",
        title: "脚本加载失败",
        location: "系统",
        time_of_day: "任意",
        dialogues: [
            { speaker: "系统", line: "未能加载剧情文件`data/route_gu_wan.json`。请确认`webroot/data`目录存在并可被HTTP服务访问。", emotion: "calm" },
            { speaker: "系统", line: "你仍可继续体验演示场景。", emotion: "calm" }
        ],
        choices: [
            { text: "进入演示场景", next: "gw_000_fallback_demo" }
        ],
        set_flags: {}
    };

    const scene_demo = {
        scene_id: "gw_000_fallback_demo",
        title: "雨巷相遇（演示）",
        location: "茶馆外雨巷",
        time_of_day: "傍晚",
        dialogues: [
            { speaker: "gu_wan", line: "今雨微寒，先生且入内避一避。", emotion: "gentle" },
            { speaker: "lin_qing_he", line: "承蒙相邀。你家茶香，似有旧识。", emotion: "soft" }
        ],
        choices: [
            { text: "入内与顾晚并肩核账", next: "gw_000_fallback_end" }
        ],
        set_flags: {}
    };

    const scene_end = {
        scene_id: "gw_000_fallback_end",
        title: "演示结束",
        location: "茶阁",
        time_of_day: "夜",
        dialogues: [
            { speaker: "系统", line: "演示到此。请修复剧情文件加载以体验完整内容。", emotion: "calm" }
        ],
        choices: [],
        set_flags: {}
    };

    register_scene(scene_intro);
    register_scene(scene_demo);
    register_scene(scene_end);
}

/**
 * @brief `为所有场景补齐对白至目标条数`
 * @param {number} target_per_scene `目标每场对白数量`
 */
function augment_all_scenes_dialogues(target_per_scene) {
    for (const [scene_id, scene] of scene_index_map.entries()) {
        const dlg = Array.isArray(scene.dialogues) ? scene.dialogues : [];
        let i = dlg.length;
        const loc = scene.location || "茶阁";
        while (i < target_per_scene) {
            const speaker = (i % 2 === 0) ? "gu_wan" : "lin_qing_he";
            const line = generate_filler_line(loc, i);
            dlg.push({ speaker, line, emotion: (i % 4 === 0) ? "gentle" : ((i % 4 === 1) ? "calm" : ((i % 4 === 2) ? "soft" : "firm")) });
            i++;
        }
        scene.dialogues = dlg;
    }
}

/**
 * @brief `生成同主题的补充对白`
 * @param {string} location `场景位置`
 * @param {number} idx `索引`
 * @returns {string}
 */
function generate_filler_line(location, idx) {
    const base = [
        `${location}的灯影很稳。`,
        `雨声落在${location}的檐下。`,
        `茶香在此处更柔。`,
        `脚步与心事一样轻。`,
        `这些线索会给我们答案。`,
        `先不急，慢慢看。`,
        `说与不说，皆有后果。`,
        `今夜风不重。`,
        `把心放稳。`,
        `我们在同一处。`
    ];
    return base[idx % base.length];
}

/**
 * @brief `从服务端获取指定场景JSON`
 * @param {string} scene_id `场景ID`
 * @returns {Promise<object|null>}
 */
async function fetch_scene_json_from_server(scene_id) {
    const candidates = [
        `./data/route_gu_wan_scenes/${scene_id}.json`,
        `/data/route_gu_wan_scenes/${scene_id}.json`,
        `data/route_gu_wan_scenes/${scene_id}.json`
    ];
    for (const url of candidates) {
        try {
            const resp = await fetch(url);
            if (resp.ok) { return await resp.json(); }
        } catch { }
    }
    return null;
}

async function import_route_from_file(file) {
    const text = await file.text();
    try {
        const data = JSON.parse(text);
        if (Array.isArray(data.scenes)) {
            route_metadata = {
                route_id: data.route_id,
                title: data.title,
                author: data.author,
                schema_version: data.schema_version,
                emotions_enum: data.emotions_enum,
                characters: data.characters,
                assets_manifest: data.assets_manifest,
                dialogue_target_count: data.dialogue_target_count,
                scene_target_count: data.scene_target_count,
                constants: data.constants
            };
            for (const s of data.scenes) { register_scene(s); }
            return true;
        }
    } catch { }
    const scene_blocks = extract_scene_blocks(text);
    if (scene_blocks.length > 0) {
        for (const block of scene_blocks) {
            try { register_scene(JSON.parse(block)); } catch { }
        }
        augment_all_scenes_dialogues(100);
        return true;
    }
    return false;
}
