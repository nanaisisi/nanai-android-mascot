package com.example.mascotnanai.data.model

import androidx.annotation.DrawableRes

data class SurfaceExpression(
    val id: Int,
    val label: String,
    @DrawableRes val drawableRes: Int,
    val description: String
)

data class Ghost(
    val id: String,
    val name: String,
    val craftman: String,
    val sakuraName: String,
    val keroName: String,
    val shioriType: String,
    val path: String,
    val description: String,
    val defaultSurfaceId: Int,
    val expressions: List<SurfaceExpression>,
    val bootPhrases: List<String>,
    val tapPhrases: List<String>,
    val idlePhrases: List<String>
)

data class BalloonStyle(
    val id: String,
    val name: String,
    val description: String,
    val backgroundColorHex: Long,
    val textColorHex: Long,
    val borderColorHex: Long,
    val cornerRadiusDp: Int
)

enum class GhostSize(val label: String, val scale: Float) {
    SMALL("小 (Small)", 0.8f),
    MEDIUM("中 (Medium)", 1.0f),
    LARGE("大 (Large)", 1.35f),
    EXTRA_LARGE("特大 (XL)", 1.7f)
}

enum class TalkFrequency(val label: String, val intervalSeconds: Int) {
    FREQUENT("よく話す (15秒)", 15),
    NORMAL("普通 (30秒)", 30),
    RARE("たまに (60秒)", 60),
    MANUAL("タップ時のみ", 0)
}

enum class MascotBackground(val label: String) {
    TRANSLUCENT("透過 / デスクトップ"),
    COZY_ROOM("コージー・ルーム"),
    PASTEL_SKY("パステル・スカイ"),
    MIDNIGHT("ミッドナイト・ダーク")
}

data class AppSettings(
    val autoLoadGhost: Boolean = true,
    val enableTalks: Boolean = true,
    val talkFrequency: TalkFrequency = TalkFrequency.NORMAL,
    val darkMode: Boolean = false,
    val alwaysOnTop: Boolean = true,
    val ghostSize: GhostSize = GhostSize.MEDIUM,
    val shellScale: Float = 1.0f,
    val balloonScale: Float = 1.0f,
    val currentBalloonId: String = "nanai_std",
    val backgroundTheme: MascotBackground = MascotBackground.TRANSLUCENT,
    val debugLevel: String = "info"
)

data class LogEntry(
    val id: Long = System.currentTimeMillis(),
    val timestamp: String,
    val level: String, // "info", "debug", "shiori", "warn", "error"
    val message: String
)
