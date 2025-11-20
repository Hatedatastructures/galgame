/**
 * @brief `渲染器`
 * @details `负责对话、姓名与选项的展示`
 */

"use strict";

const name_plate_el = document.getElementById("name_plate");
const dialogue_box_el = document.getElementById("dialogue_box");
const choice_list_el = document.getElementById("choice_list");
const backlog_panel_el = document.getElementById("backlog_panel");
const bg_layer_el = document.getElementById("bg_layer");
const char_layer_el = document.getElementById("character_layer");
const cg_layer_el = document.getElementById("cg_layer");

/**
 * @brief `渲染当前对话行`
 */
function render_current_line()
{
    const scene = get_scene(game_state.current_scene_id);
    if (!scene) { return; }
    apply_scene_visuals(scene);
    const line_obj = scene.dialogues?.[game_state.current_dialogue_index];
    if (!line_obj) { return; }

    name_plate_el.textContent = format_speaker_name(line_obj.speaker);
    typewrite_text(dialogue_box_el, line_obj.line, game_state.settings.text_speed);

    game_state.backlog_lines.push(`${format_speaker_name(line_obj.speaker)}：${line_obj.line}`);
}

/**
 * @brief `渲染选择列表`
 */
function render_choices()
{
    const scene = get_scene(game_state.current_scene_id);
    choice_list_el.innerHTML = "";
    if (!scene || !scene.choices || scene.choices.length === 0) { return; }

    for (let i = 0; i < scene.choices.length; i++) {
        const li = document.createElement("li");
        li.textContent = scene.choices[i].text;
        li.addEventListener("click", () => choose_option(i));
        choice_list_el.appendChild(li);
    }
}

/**
 * @brief `打字机效果`
 * @param {HTMLElement} el `目标元素`
 * @param {string} text `文本`
 * @param {number} speed `速度`
 */
function typewrite_text(el, text, speed)
{
    el.textContent = "";
    let i = 0;
    const interval_id = setInterval(() => {
        el.textContent += text[i];
        i++;
        if (i >= text.length) { clearInterval(interval_id); }
    }, Math.max(10, 70 - speed));
}

/**
 * @brief `格式化说话者名称`
 * @param {string} speaker `说话者`
 * @returns {string}
 */
function format_speaker_name(speaker)
{
    switch (speaker) {
        case "gu_wan": return "顾晚";
        case "lin_qing_he": return "林清河";
        default: return speaker || "";
    }
}

/**
 * @brief `刷新日志面板`
 */
function refresh_backlog_panel()
{
    const list_el = document.getElementById("backlog_list");
    if (!list_el) { return; }
    list_el.innerHTML = game_state.backlog_lines.map(l => `<li>${l}</li>`).join("");
    list_el.scrollTop = 0;
}

/**
 * @brief `应用场景图像`
 * @param {Object} scene `场景对象`
 */
function apply_scene_visuals(scene)
{
    const bg_url = scene.bg_image || null;
    const char_url = scene.char_image || null;
    const char_urls = Array.isArray(scene.char_images) ? scene.char_images : null;
    const char_positions = Array.isArray(scene.char_positions) ? scene.char_positions : null;
    const cg_url = scene.cg_image || null;
    const cg_audio_url = scene.cg_audio || null;

    if (bg_url && bg_url !== game_state.current_bg) {
        preload_and_apply_background(bg_url);
        game_state.current_bg = bg_url;
    }

    // 多立绘优先
    if (char_urls && char_urls.length > 0) {
        apply_multiple_characters(char_urls, char_positions);
        game_state.current_char = "__multi__";
    } else if (char_url !== undefined) {
        clear_character_sprites();
        if (char_url && char_url !== game_state.current_char) {
            preload_and_apply_character(char_url);
            game_state.current_char = char_url;
        } else if (!char_url) {
            char_layer_el.style.backgroundImage = "";
            game_state.current_char = null;
        }
    }

    if (cg_url !== undefined) {
        if (cg_url && cg_url !== game_state.current_cg) {
            preload_and_apply_cg(cg_url);
            game_state.current_cg = cg_url;
        } else if (!cg_url) {
            cg_layer_el.style.backgroundImage = "";
            cg_layer_el.style.opacity = 0;
            game_state.current_cg = null;
        }
    }

    if (cg_audio_url !== undefined) {
        if (cg_audio_url && cg_audio_url !== game_state.current_cg_audio) {
            audio_manager.play_se(cg_audio_url);
            game_state.current_cg_audio = cg_audio_url;
        } else if (!cg_audio_url) {
            game_state.current_cg_audio = null;
        }
    }
}

/**
 * @brief `预加载并应用背景`
 */
function preload_and_apply_background(url)
{
    const img = new Image();
    img.onload = () => { bg_layer_el.style.backgroundImage = `url('${url}')`; };
    img.onerror = () => {
        try {
            const name = infer_name_from_url(url);
            const data_url = get_temp_webp(name);
            bg_layer_el.style.backgroundImage = `url('${data_url}')`;
        } catch { bg_layer_el.style.backgroundImage = ""; }
    };
    img.src = url;
}

/**
 * @brief `预加载并应用立绘`
 */
function preload_and_apply_character(url)
{
    clear_character_sprites();
    const img = new Image();
    img.onload = () => { char_layer_el.style.backgroundImage = `url('${url}')`; };
    img.onerror = () => {
        try {
            const name = infer_name_from_url(url);
            const data_url = get_temp_webp(name);
            char_layer_el.style.backgroundImage = `url('${data_url}')`;
        } catch { char_layer_el.style.backgroundImage = ""; }
    };
    img.src = url;
}

/**
 * @brief `预加载并应用CG`
 */
function preload_and_apply_cg(url)
{
    const img = new Image();
    img.onload = () => { cg_layer_el.style.backgroundImage = `url('${url}')`; cg_layer_el.style.opacity = 1; };
    img.onerror = () => {
        try {
            const name = infer_name_from_url(url);
            const data_url = get_temp_webp(name);
            cg_layer_el.style.backgroundImage = `url('${data_url}')`;
            cg_layer_el.style.opacity = 1;
        } catch { cg_layer_el.style.backgroundImage = ""; cg_layer_el.style.opacity = 0; }
    };
    img.src = url;
}
/**
 * @brief `应用多立绘`
 */
function apply_multiple_characters(urls, positions)
{
    clear_character_sprites();
    const count = urls.length;
    for (let i = 0; i < count; i++) {
        const url = urls[i];
        const pos = positions?.[i] || {};
        const x_percent = pos.x || (count === 1 ? "50%" : (i === 0 ? "30%" : "70%"));
        const scale = Number(pos.scale || 1.0);
        const sprite = document.createElement("div");
        sprite.className = "char_sprite";
        sprite.style.left = x_percent;
        sprite.style.transform = `translateX(-50%) scale(${scale})`;
        const img = new Image();
        img.onload = () => { sprite.style.backgroundImage = `url('${url}')`; sprite.classList.add("show"); };
        img.onerror = () => {
            try {
                const name = infer_name_from_url(url);
                const data_url = get_temp_webp(name);
                sprite.style.backgroundImage = `url('${data_url}')`;
                sprite.classList.add("show");
            } catch { /* ignore */ }
        };
        img.src = url;
        char_layer_el.appendChild(sprite);
    }
    // 背景式立绘清空
    char_layer_el.style.backgroundImage = "";
}

/**
 * @brief `清空立绘容器`
 */
function clear_character_sprites()
{
    while (char_layer_el.firstChild) {
        char_layer_el.removeChild(char_layer_el.firstChild);
    }
}
