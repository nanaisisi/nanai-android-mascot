package com.example.mascotnanai.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.mascotnanai.data.model.AppSettings
import com.example.mascotnanai.data.model.BalloonStyle
import com.example.mascotnanai.data.model.Ghost
import com.example.mascotnanai.data.model.LogEntry
import com.example.mascotnanai.data.model.TalkFrequency
import com.example.mascotnanai.data.repository.GhostRepository
import com.example.mascotnanai.data.repository.SettingsRepository
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

enum class ActiveModal {
    NONE,
    GHOST_MGMT,
    BALLOON_MGMT,
    SCANNER,
    SHIORI_TEST,
    SETTINGS,
    DEBUG_LOGS,
    HELP
}

class MascotViewModel(application: Application) : AndroidViewModel(application) {

    private val ghostRepository = GhostRepository()
    private val settingsRepository = SettingsRepository(application)

    val availableGhosts: StateFlow<List<Ghost>> = ghostRepository.availableGhosts
    val balloonStyles: StateFlow<List<BalloonStyle>> = ghostRepository.balloonStyles
    val settings: StateFlow<AppSettings> = settingsRepository.settings

    private val _currentGhost = MutableStateFlow<Ghost?>(null)
    val currentGhost: StateFlow<Ghost?> = _currentGhost.asStateFlow()

    private val _currentSurfaceId = MutableStateFlow(0)
    val currentSurfaceId: StateFlow<Int> = _currentSurfaceId.asStateFlow()

    private val _currentBalloon = MutableStateFlow<BalloonStyle?>(null)
    val currentBalloon: StateFlow<BalloonStyle?> = _currentBalloon.asStateFlow()

    private val _balloonText = MutableStateFlow("")
    val balloonText: StateFlow<String> = _balloonText.asStateFlow()

    private val _isBalloonVisible = MutableStateFlow(false)
    val isBalloonVisible: StateFlow<Boolean> = _isBalloonVisible.asStateFlow()

    private val _activeModal = MutableStateFlow(ActiveModal.NONE)
    val activeModal: StateFlow<ActiveModal> = _activeModal.asStateFlow()

    private val _isMenuOpen = MutableStateFlow(false)
    val isMenuOpen: StateFlow<Boolean> = _isMenuOpen.asStateFlow()

    private val _logs = MutableStateFlow<List<LogEntry>>(emptyList())
    val logs: StateFlow<List<LogEntry>> = _logs.asStateFlow()

    private val _lastShioriRequest = MutableStateFlow("")
    val lastShioriRequest: StateFlow<String> = _lastShioriRequest.asStateFlow()

    private val _lastShioriResponse = MutableStateFlow("")
    val lastShioriResponse: StateFlow<String> = _lastShioriResponse.asStateFlow()

    // Position of mascot for drag support (in dp offset from center)
    private val _mascotOffsetX = MutableStateFlow(0f)
    val mascotOffsetX: StateFlow<Float> = _mascotOffsetX.asStateFlow()

    private val _mascotOffsetY = MutableStateFlow(0f)
    val mascotOffsetY: StateFlow<Float> = _mascotOffsetY.asStateFlow()

    private var heartbeatJob: Job? = null
    private var balloonHideJob: Job? = null
    private var secondCounter = 0

    init {
        addLog("info", "Mascot Nanai アプリケーション初期化開始")
        initializeMascot()
        startHeartbeat()
    }

    private fun initializeMascot() {
        val allBalloons = ghostRepository.balloonStyles.value
        val initialBalloonId = settings.value.currentBalloonId
        _currentBalloon.value = allBalloons.find { it.id == initialBalloonId } ?: allBalloons.firstOrNull()

        val allGhosts = ghostRepository.availableGhosts.value
        val savedGhostId = settingsRepository.selectedGhostId.value
        val ghostToLoad = if (settings.value.autoLoadGhost) {
            allGhosts.find { it.id == savedGhostId } ?: allGhosts.firstOrNull()
        } else {
            null
        }

        if (ghostToLoad != null) {
            loadGhost(ghostToLoad, isBoot = true)
        } else {
            addLog("warn", "ゴースト未選択状態で待機中")
        }
    }

    fun loadGhost(ghost: Ghost, isBoot: Boolean = false) {
        _currentGhost.value = ghost
        _currentSurfaceId.value = ghost.defaultSurfaceId
        settingsRepository.saveSelectedGhostId(ghost.id)
        addLog("info", "ゴースト「${ghost.name}」(${ghost.sakuraName}) をロードしました")

        val event = if (isBoot) "OnBoot" else "OnGhostChanged"
        triggerShioriEvent(event)
    }

    fun selectSurface(surfaceId: Int) {
        _currentSurfaceId.value = surfaceId
        val exp = _currentGhost.value?.expressions?.find { it.id == surfaceId }
        addLog("debug", "サーフェス変更: \\s[$surfaceId] (${exp?.label ?: ""})")
    }

    fun onCharacterClick() {
        val ghost = _currentGhost.value ?: return
        addLog("shiori", "マウスクリック通知送信 (OnMouseClick)")
        triggerShioriEvent("OnMouseClick")
    }

    fun triggerShioriEvent(event: String, userMessage: String? = null) {
        val ghost = _currentGhost.value ?: return
        val response = ghostRepository.processShioriRequest(ghost, event, userMessage)

        _lastShioriRequest.value = response.rawRequest
        _lastShioriResponse.value = response.rawResponse
        _currentSurfaceId.value = response.suggestedSurfaceId

        showBalloon(response.dialogue)
        addLog("shiori", "SHIORI Event: $event -> \"${response.dialogue}\"")
    }

    fun showBalloon(text: String, durationMs: Long = 4000L) {
        _balloonText.value = text
        _isBalloonVisible.value = true

        balloonHideJob?.cancel()
        balloonHideJob = viewModelScope.launch {
            delay(durationMs)
            _isBalloonVisible.value = false
        }
    }

    fun hideBalloon() {
        balloonHideJob?.cancel()
        _isBalloonVisible.value = false
    }

    private fun startHeartbeat() {
        heartbeatJob?.cancel()
        heartbeatJob = viewModelScope.launch {
            while (true) {
                delay(1000L)
                secondCounter++

                // Check periodic idle talk
                val currentSettings = settings.value
                if (currentSettings.enableTalks && currentSettings.talkFrequency != TalkFrequency.MANUAL) {
                    val interval = currentSettings.talkFrequency.intervalSeconds
                    if (interval > 0 && secondCounter % interval == 0) {
                        if (!_isBalloonVisible.value && _currentGhost.value != null) {
                            triggerShioriEvent("OnTalk")
                        }
                    }
                }
            }
        }
    }

    fun setBalloonStyle(style: BalloonStyle) {
        _currentBalloon.value = style
        updateSettings(settings.value.copy(currentBalloonId = style.id))
        showBalloon("バルーンスタイルを「${style.name}」に変更しました。", 2500L)
        addLog("info", "バルーン変更: ${style.name}")
    }

    fun updateMascotPosition(deltaX: Float, deltaY: Float) {
        _mascotOffsetX.value += deltaX
        _mascotOffsetY.value += deltaY
    }

    fun resetMascotPosition() {
        _mascotOffsetX.value = 0f
        _mascotOffsetY.value = 0f
    }

    fun toggleMenu() {
        _isMenuOpen.value = !_isMenuOpen.value
    }

    fun closeMenu() {
        _isMenuOpen.value = false
    }

    fun openModal(modal: ActiveModal) {
        _activeModal.value = modal
        _isMenuOpen.value = false
        addLog("debug", "モーダル表示: $modal")
    }

    fun closeModal() {
        _activeModal.value = ActiveModal.NONE
    }

    fun updateSettings(newSettings: AppSettings) {
        settingsRepository.updateSettings(newSettings)
        addLog("info", "設定を更新しました (ダークモード: ${newSettings.darkMode}, サイズ: ${newSettings.ghostSize.label})")
    }

    fun resetSettings() {
        settingsRepository.resetToDefaults()
        val allBalloons = ghostRepository.balloonStyles.value
        _currentBalloon.value = allBalloons.firstOrNull()
        showBalloon("設定を初期値にリセットしました。", 2500L)
        addLog("info", "設定をリセットしました")
    }

    fun addLog(level: String, message: String) {
        val timeStr = SimpleDateFormat("HH:mm:ss.SSS", Locale.getDefault()).format(Date())
        val entry = LogEntry(
            timestamp = timeStr,
            level = level,
            message = message
        )
        val current = _logs.value.toMutableList()
        current.add(0, entry)
        if (current.size > 200) {
            _logs.value = current.take(200)
        } else {
            _logs.value = current
        }
    }

    fun clearLogs() {
        _logs.value = emptyList()
        addLog("info", "ログをクリアしました")
    }

    fun getLogsExportText(): String {
        return _logs.value.reversed().joinToString("\n") {
            "[${it.timestamp}] [${it.level.uppercase()}] ${it.message}"
        }
    }

    override fun onCleared() {
        super.onCleared()
        heartbeatJob?.cancel()
        balloonHideJob?.cancel()
    }
}
