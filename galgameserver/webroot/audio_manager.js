/**
 * @brief `音频管理器`
 * @details `控制BGM与音效`
 */

"use strict";

const audio_manager = {
    bgm_audio: null,
    se_audio: null,
    init_audio()
    {
        this.bgm_audio = new Audio();
        this.se_audio = new Audio();
        this.bgm_audio.loop = true;
        this.update_volumes();
    },
    update_volumes()
    {
        this.bgm_audio.volume = game_state.settings.bgm_volume;
        this.se_audio.volume = game_state.settings.se_volume;
    },
    play_bgm(url)
    {
        if (!this.bgm_audio) { this.init_audio(); }
        this.bgm_audio.src = url;
        this.bgm_audio.play().catch(() => {});
    },
    play_se(url)
    {
        if (!this.se_audio) { this.init_audio(); }
        this.se_audio.src = url;
        this.se_audio.play().catch(() => {});
    }
};