/**
 * @brief `临时WebP占位图生成器`
 * @details `Canvas生成古风动漫风格占位图` `image/webp` `蛇形命名`
 */

"use strict";

const TEMP_IMAGE_WIDTH = 1920;
const TEMP_IMAGE_HEIGHT = 1080;

/**
 * @brief `获取临时webp占位图`
 * @param {string} name `资源名` 如 `bg_teahouse_01`
 * @param {number} width `宽度`
 * @param {number} height `高度`
 * @returns {string} `dataURL(image/webp)`
 */
function get_temp_webp(name, width = TEMP_IMAGE_WIDTH, height = TEMP_IMAGE_HEIGHT)
{
    const ctx = create_canvas(width, height);
    const n = name || "bg_teahouse_01";
    if (n.startsWith("bg_rain_alley")) {
        draw_bg_rain_alley(ctx, width, height);
    } else if (n.startsWith("bg_teahouse")) {
        draw_bg_teahouse(ctx, width, height);
    } else if (n.startsWith("bg_river_dock")) {
        draw_bg_river_dock(ctx, width, height);
    } else if (n.startsWith("bg_lantern_festival")) {
        draw_bg_lantern_festival(ctx, width, height);
    } else if (n.startsWith("char_gu_wan")) {
        draw_char_gu_wan(ctx, width, height);
    } else if (n.startsWith("char_lin_qing_he")) {
        draw_char_lin_qing_he(ctx, width, height);
    } else if (n.startsWith("cg_gw")) {
        draw_cg_generic(ctx, width, height);
    } else {
        draw_bg_teahouse(ctx, width, height);
    }
    return ctx.canvas.toDataURL("image/webp", 0.92);
}

/**
 * @brief `创建画布并返回ctx`
 */
function create_canvas(width, height)
{
    const canvas = document.createElement("canvas");
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.canvas = canvas;
    return ctx;
}

/**
 * @brief `绘制雨巷背景`
 */
function draw_bg_rain_alley(ctx, w, h)
{
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#1c2430");
    g.addColorStop(1, "#0e141b");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // 地面
    ctx.fillStyle = "#0b0f14"; ctx.fillRect(0, h * 0.78, w, h * 0.22);
    // 木格窗与檐
    ctx.fillStyle = "#161d26"; ctx.fillRect(w * 0.22, h * 0.15, w * 0.56, h * 0.06);
    // 灯笼
    draw_lantern(ctx, w * 0.32, h * 0.48, 40);
    draw_lantern(ctx, w * 0.62, h * 0.5, 34);
    // 雨线
    ctx.strokeStyle = "rgba(159,179,199,0.25)"; ctx.lineWidth = 2;
    for (let i = 0; i < 14; i++) {
        const x = (i + 1) * (w / 16);
        ctx.beginPath(); ctx.moveTo(x, -50); ctx.lineTo(x - 20, h); ctx.stroke();
    }
    // 水面反光
    ctx.fillStyle = "rgba(26,32,40,0.35)"; ctx.fillRect(w * 0.22, h * 0.8, w * 0.56, 32);
}

/**
 * @brief `绘制茶阁背景`
 */
function draw_bg_teahouse(ctx, w, h)
{
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#2a1e12"); g.addColorStop(1, "#1b130c");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // 木格窗口
    ctx.fillStyle = "#1f140d"; ctx.globalAlpha = 0.6; ctx.fillRect(w * 0.12, h * 0.12, w * 0.76, h * 0.48); ctx.globalAlpha = 1;
    ctx.strokeStyle = "#4a3725"; ctx.lineWidth = 8;
    for (let y = 0; y < 4; y++) { ctx.beginPath(); ctx.moveTo(w * 0.12, h * (0.16 + 0.08 * y)); ctx.lineTo(w * 0.88, h * (0.16 + 0.08 * y)); ctx.stroke(); }
    for (let x = 0; x < 5; x++) { ctx.beginPath(); ctx.moveTo(w * (0.2 + 0.12 * x), h * 0.12); ctx.lineTo(w * (0.2 + 0.12 * x), h * 0.6); ctx.stroke(); }
    // 灯光圆晕
    draw_light_bloom(ctx, w * 0.5, h * 0.4, 240, "rgba(201,168,106,0.35)");
    // 案几与茶具
    ctx.fillStyle = "#2f2216"; ctx.fillRect(w * 0.32, h * 0.72, w * 0.36, 24);
    ctx.fillStyle = "#3a2c1e"; ctx.fillRect(w * 0.36, h * 0.68, 64, 18);
    ctx.fillStyle = "#c9a86a"; ctx.beginPath(); ctx.arc(w * 0.41, h * 0.69, 12, 0, Math.PI * 2); ctx.fill();
}

/**
 * @brief `绘制渡口背景`
 */
function draw_bg_river_dock(ctx, w, h)
{
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#0e141b"); g.addColorStop(1, "#1c2430");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // 木栈桥
    ctx.fillStyle = "#4a3725"; ctx.fillRect(w * 0.1, h * 0.7, w * 0.7, 18);
    // 小舟
    ctx.fillStyle = "#3a2c1e"; ctx.beginPath(); ctx.moveTo(w * 0.2, h * 0.78); ctx.quadraticCurveTo(w * 0.24, h * 0.74, w * 0.28, h * 0.78); ctx.lineTo(w * 0.28, h * 0.79); ctx.quadraticCurveTo(w * 0.24, h * 0.83, w * 0.2, h * 0.79); ctx.closePath(); ctx.fill();
    // 水面微波
    ctx.strokeStyle = "rgba(112,128,144,0.6)"; ctx.lineWidth = 2; for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.arc(w * 0.55, h * (0.78 + i * 0.02), w * (0.1 + i * 0.01), 0, Math.PI); ctx.stroke(); }
    // 灯笼
    draw_lantern(ctx, w * 0.78, h * 0.46, 28);
}

/**
 * @brief `绘制灯会背景`
 */
function draw_bg_lantern_festival(ctx, w, h)
{
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#0e141b"); g.addColorStop(1, "#1b130c");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // 灯笼群
    for (let i = 0; i < 24; i++) {
        draw_lantern(ctx, Math.random() * w, Math.random() * h * 0.6, 16 + Math.random() * 10);
    }
    // 光斑
    for (let i = 0; i < 20; i++) { draw_light_bloom(ctx, Math.random() * w, Math.random() * h * 0.5, 60 + Math.random() * 40, "rgba(200,160,80,0.25)"); }
}

/**
 * @brief `绘制顾晚立绘占位轮廓`
 */
function draw_char_gu_wan(ctx, w, h)
{
    // 基础背景
    draw_bg_teahouse(ctx, w, h);
    
    // 头部轮廓
    ctx.fillStyle = "rgba(255,228,196,0.9)";
    ctx.beginPath(); ctx.arc(w * 0.5, h * 0.15, w * 0.08, 0, Math.PI * 2); ctx.fill();
    
    // 头发
    ctx.fillStyle = "rgba(44,42,40,0.9)";
    ctx.beginPath(); ctx.arc(w * 0.5, h * 0.12, w * 0.09, Math.PI, Math.PI * 2); ctx.fill();
    
    // 襦裙轮廓（古风女装）
    ctx.fillStyle = "rgba(201,168,106,0.85)";
    // 上身
    ctx.beginPath(); ctx.moveTo(w * 0.45, h * 0.23); ctx.lineTo(w * 0.55, h * 0.23); ctx.lineTo(w * 0.53, h * 0.42); ctx.lineTo(w * 0.47, h * 0.42); ctx.closePath(); ctx.fill();
    
    // 袖子
    ctx.beginPath(); ctx.moveTo(w * 0.47, h * 0.25); ctx.quadraticCurveTo(w * 0.42, h * 0.35, w * 0.44, h * 0.45); ctx.lineTo(w * 0.48, h * 0.42); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(w * 0.53, h * 0.25); ctx.quadraticCurveTo(w * 0.58, h * 0.35, w * 0.56, h * 0.45); ctx.lineTo(w * 0.52, h * 0.42); ctx.closePath(); ctx.fill();
    
    // 长裙
    ctx.fillStyle = "rgba(180,150,100,0.85)";
    ctx.beginPath(); ctx.moveTo(w * 0.47, h * 0.42); ctx.quadraticCurveTo(w * 0.5, h * 0.75, w * 0.53, h * 0.42); ctx.closePath(); ctx.fill();
    
    // 腰带
    ctx.fillStyle = "rgba(139,115,85,0.9)";
    ctx.fillRect(w * 0.46, h * 0.41, w * 0.08, h * 0.02);
}

/**
 * @brief `绘制林清河立绘占位轮廓`
 */
function draw_char_lin_qing_he(ctx, w, h)
{
    // 基础背景
    draw_bg_teahouse(ctx, w, h);
    
    // 头部轮廓
    ctx.fillStyle = "rgba(255,228,196,0.9)";
    ctx.beginPath(); ctx.arc(w * 0.5, h * 0.15, w * 0.08, 0, Math.PI * 2); ctx.fill();
    
    // 头发（束发）
    ctx.fillStyle = "rgba(30,30,30,0.9)";
    ctx.beginPath(); ctx.arc(w * 0.5, h * 0.12, w * 0.085, Math.PI, Math.PI * 2); ctx.fill();
    // 发髻
    ctx.fillStyle = "rgba(20,20,20,0.9)";
    ctx.beginPath(); ctx.arc(w * 0.5, h * 0.08, w * 0.04, 0, Math.PI * 2); ctx.fill();
    
    // 长袍（文人装束）
    ctx.fillStyle = "rgba(70,85,105,0.85)";
    // 上身
    ctx.beginPath(); ctx.moveTo(w * 0.46, h * 0.23); ctx.lineTo(w * 0.54, h * 0.23); ctx.lineTo(w * 0.52, h * 0.45); ctx.lineTo(w * 0.48, h * 0.45); ctx.closePath(); ctx.fill();
    
    // 袖子（宽袍大袖）
    ctx.beginPath(); ctx.moveTo(w * 0.46, h * 0.25); ctx.quadraticCurveTo(w * 0.41, h * 0.38, w * 0.43, h * 0.48); ctx.lineTo(w * 0.47, h * 0.45); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(w * 0.54, h * 0.25); ctx.quadraticCurveTo(w * 0.59, h * 0.38, w * 0.57, h * 0.48); ctx.lineTo(w * 0.53, h * 0.45); ctx.closePath(); ctx.fill();
    
    // 长袍下摆
    ctx.fillStyle = "rgba(60,75,95,0.85)";
    ctx.beginPath(); ctx.moveTo(w * 0.48, h * 0.45); ctx.quadraticCurveTo(w * 0.5, h * 0.78, w * 0.52, h * 0.45); ctx.closePath(); ctx.fill();
    
    // 腰带（文人玉佩）
    ctx.fillStyle = "rgba(40,55,75,0.9)";
    ctx.fillRect(w * 0.47, h * 0.43, w * 0.06, h * 0.02);
    // 玉佩
    ctx.fillStyle = "rgba(160,180,200,0.8)";
    ctx.beginPath(); ctx.arc(w * 0.5, h * 0.46, w * 0.01, 0, Math.PI * 2); ctx.fill();
}

/**
 * @brief `绘制通用CG占位（双人靠近）`
 */
function draw_cg_generic(ctx, w, h)
{
    draw_bg_teahouse(ctx, w, h);
    
    // 详细人物轮廓
    // 顾晚（左）
    ctx.fillStyle = "rgba(201,168,106,0.85)";
    // 头部
    ctx.beginPath(); ctx.arc(w * 0.42, h * 0.45, w * 0.06, 0, Math.PI * 2); ctx.fill();
    // 身体
    ctx.beginPath(); ctx.moveTo(w * 0.38, h * 0.52); ctx.lineTo(w * 0.46, h * 0.52); ctx.lineTo(w * 0.44, h * 0.75); ctx.lineTo(w * 0.4, h * 0.75); ctx.closePath(); ctx.fill();
    
    // 林清河（右）
    ctx.fillStyle = "rgba(80,90,110,0.85)";
    // 头部
    ctx.beginPath(); ctx.arc(w * 0.58, h * 0.45, w * 0.06, 0, Math.PI * 2); ctx.fill();
    // 身体
    ctx.beginPath(); ctx.moveTo(w * 0.54, h * 0.52); ctx.lineTo(w * 0.62, h * 0.52); ctx.lineTo(w * 0.6, h * 0.75); ctx.lineTo(w * 0.56, h * 0.75); ctx.closePath(); ctx.fill();
    
    // 靠近效果
    ctx.fillStyle = "rgba(255,228,196,0.3)";
    ctx.beginPath(); ctx.arc(w * 0.5, h * 0.5, w * 0.03, 0, Math.PI * 2); ctx.fill();
    
    // 温馨光效
    draw_light_bloom(ctx, w * 0.5, h * 0.55, 200, "rgba(201,168,106,0.3)");
    draw_light_bloom(ctx, w * 0.5, h * 0.65, 120, "rgba(255,228,196,0.2)");
}

/**
 * @brief `绘制灯笼`
 */
function draw_lantern(ctx, cx, cy, r)
{
    const grad = ctx.createLinearGradient(0, cy - r, 0, cy + r);
    grad.addColorStop(0, "#c9a86a"); grad.addColorStop(1, "#a07d45");
    ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
}

/**
 * @brief `光晕`
 */
function draw_light_bloom(ctx, cx, cy, r, color)
{
    const g = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r);
    g.addColorStop(0, color || "rgba(200,160,80,0.3)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
}

/**
 * @brief `从路径中推断资源名`
 */
function infer_name_from_url(url)
{
    if (!url) { return "bg_teahouse_01"; }
    const parts = url.split("/");
    const file = parts[parts.length - 1] || "";
    return file.replace(/\.(png|jpg|jpeg|webp|svg)$/i, "");
}