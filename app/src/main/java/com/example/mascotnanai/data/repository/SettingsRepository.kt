package com.example.mascotnanai.data.repository

import android.content.Context
import android.content.SharedPreferences
import com.example.mascotnanai.data.model.AppSettings
import com.example.mascotnanai.data.model.GhostSize
import com.example.mascotnanai.data.model.MascotBackground
import com.example.mascotnanai.data.model.TalkFrequency
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class SettingsRepository(context: Context) {

    private val prefs: SharedPreferences =
        context.getSharedPreferences("mascot_nanai_prefs", Context.MODE_PRIVATE)

    private val _settings = MutableStateFlow(loadSettings())
    val settings: StateFlow<AppSettings> = _settings.asStateFlow()

    private val _selectedGhostId = MutableStateFlow(
        prefs.getString(KEY_CURRENT_GHOST, "mock_nanai") ?: "mock_nanai"
    )
    val selectedGhostId: StateFlow<String> = _selectedGhostId.asStateFlow()

    private fun loadSettings(): AppSettings {
        val sizeName = prefs.getString(KEY_GHOST_SIZE, GhostSize.MEDIUM.name) ?: GhostSize.MEDIUM.name
        val ghostSize = runCatching { GhostSize.valueOf(sizeName) }.getOrDefault(GhostSize.MEDIUM)

        val freqName = prefs.getString(KEY_TALK_FREQ, TalkFrequency.NORMAL.name) ?: TalkFrequency.NORMAL.name
        val talkFreq = runCatching { TalkFrequency.valueOf(freqName) }.getOrDefault(TalkFrequency.NORMAL)

        val bgName = prefs.getString(KEY_BG_THEME, MascotBackground.TRANSLUCENT.name) ?: MascotBackground.TRANSLUCENT.name
        val bgTheme = runCatching { MascotBackground.valueOf(bgName) }.getOrDefault(MascotBackground.TRANSLUCENT)

        return AppSettings(
            autoLoadGhost = prefs.getBoolean(KEY_AUTO_LOAD, true),
            enableTalks = prefs.getBoolean(KEY_ENABLE_TALKS, true),
            talkFrequency = talkFreq,
            darkMode = prefs.getBoolean(KEY_DARK_MODE, false),
            alwaysOnTop = prefs.getBoolean(KEY_ALWAYS_ON_TOP, true),
            ghostSize = ghostSize,
            shellScale = prefs.getFloat(KEY_SHELL_SCALE, 1.0f),
            balloonScale = prefs.getFloat(KEY_BALLOON_SCALE, 1.0f),
            currentBalloonId = prefs.getString(KEY_BALLOON_ID, "nanai_std") ?: "nanai_std",
            backgroundTheme = bgTheme,
            debugLevel = prefs.getString(KEY_DEBUG_LEVEL, "info") ?: "info"
        )
    }

    fun updateSettings(newSettings: AppSettings) {
        prefs.edit()
            .putBoolean(KEY_AUTO_LOAD, newSettings.autoLoadGhost)
            .putBoolean(KEY_ENABLE_TALKS, newSettings.enableTalks)
            .putString(KEY_TALK_FREQ, newSettings.talkFrequency.name)
            .putBoolean(KEY_DARK_MODE, newSettings.darkMode)
            .putBoolean(KEY_ALWAYS_ON_TOP, newSettings.alwaysOnTop)
            .putString(KEY_GHOST_SIZE, newSettings.ghostSize.name)
            .putFloat(KEY_SHELL_SCALE, newSettings.shellScale)
            .putFloat(KEY_BALLOON_SCALE, newSettings.balloonScale)
            .putString(KEY_BALLOON_ID, newSettings.currentBalloonId)
            .putString(KEY_BG_THEME, newSettings.backgroundTheme.name)
            .putString(KEY_DEBUG_LEVEL, newSettings.debugLevel)
            .apply()
        _settings.value = newSettings
    }

    fun saveSelectedGhostId(ghostId: String) {
        prefs.edit().putString(KEY_CURRENT_GHOST, ghostId).apply()
        _selectedGhostId.value = ghostId
    }

    fun resetToDefaults() {
        prefs.edit().clear().apply()
        _settings.value = AppSettings()
        _selectedGhostId.value = "mock_nanai"
    }

    companion object {
        private const val KEY_AUTO_LOAD = "auto_load_ghost"
        private const val KEY_ENABLE_TALKS = "enable_talks"
        private const val KEY_TALK_FREQ = "talk_frequency"
        private const val KEY_DARK_MODE = "dark_mode"
        private const val KEY_ALWAYS_ON_TOP = "always_on_top"
        private const val KEY_GHOST_SIZE = "ghost_size"
        private const val KEY_SHELL_SCALE = "shell_scale"
        private const val KEY_BALLOON_SCALE = "balloon_scale"
        private const val KEY_BALLOON_ID = "current_balloon_id"
        private const val KEY_BG_THEME = "bg_theme"
        private const val KEY_DEBUG_LEVEL = "debug_level"
        private const val KEY_CURRENT_GHOST = "current_ghost_id"
    }
}
