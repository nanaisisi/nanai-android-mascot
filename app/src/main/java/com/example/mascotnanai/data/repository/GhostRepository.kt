package com.example.mascotnanai.data.repository

import com.example.mascotnanai.R
import com.example.mascotnanai.data.model.BalloonStyle
import com.example.mascotnanai.data.model.Ghost
import com.example.mascotnanai.data.model.SurfaceExpression
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class GhostRepository {

    private val _availableGhosts = MutableStateFlow<List<Ghost>>(emptyList())
    val availableGhosts: StateFlow<List<Ghost>> = _availableGhosts.asStateFlow()

    private val _balloonStyles = MutableStateFlow<List<BalloonStyle>>(emptyList())
    val balloonStyles: StateFlow<List<BalloonStyle>> = _balloonStyles.asStateFlow()

    init {
        loadDefaultBalloons()
        loadDefaultGhosts()
    }

    private fun loadDefaultBalloons() {
        val balloons = listOf(
            BalloonStyle(
                id = "nanai_std",
                name = "なない標準 (Nanai Std)",
                description = "爽やかなペールブルーの標準バルーン",
                backgroundColorHex = 0xF0F8FBFF,
                textColorHex = 0xFF2A3B50,
                borderColorHex = 0xFF4A6FA5,
                cornerRadiusDp = 18
            ),
            BalloonStyle(
                id = "modern_glass",
                name = "グラスモーフィズム (Glass)",
                description = "現代的なすりガラス風バルーン",
                backgroundColorHex = 0xD9FFFFFF,
                textColorHex = 0xFF1E293B,
                borderColorHex = 0xFF94A3B8,
                cornerRadiusDp = 22
            ),
            BalloonStyle(
                id = "comic_pop",
                name = "コミック・ポップ (Comic)",
                description = "漫画スタイルのポップな吹き出し",
                backgroundColorHex = 0xFFFFFFFF,
                textColorHex = 0xFF111827,
                borderColorHex = 0xFF1E293B,
                cornerRadiusDp = 14
            ),
            BalloonStyle(
                id = "midnight",
                name = "ミッドナイト (Dark)",
                description = "目に優しいダークモードバルーン",
                backgroundColorHex = 0xEE1E293B,
                textColorHex = 0xFFF1F5F9,
                borderColorHex = 0xFF38BDF8,
                cornerRadiusDp = 18
            )
        )
        _balloonStyles.value = balloons
    }

    private fun loadDefaultGhosts() {
        val nanaiExpressions = listOf(
            SurfaceExpression(0, "素 (Normal)", R.drawable.surface0, "おだやかな通常表情"),
            SurfaceExpression(1, "照れ (Blushing)", R.drawable.surface1, "少しはにかんだ照れ顔"),
            SurfaceExpression(2, "驚き (Surprised)", R.drawable.surface2, "まんまるおめめの驚き顔"),
            SurfaceExpression(3, "不安 (Anxious)", R.drawable.surface3, "ちょっと心配そうな表情"),
            SurfaceExpression(4, "笑顔 (Smiling)", R.drawable.surface4, "にっこり嬉しい笑顔"),
            SurfaceExpression(5, "むすっ (Pouting)", R.drawable.surface5, "ちょっと拗ねた表情"),
            SurfaceExpression(6, "ウインク (Wink)", R.drawable.surface6, "元気いっぱいのウインク"),
            SurfaceExpression(7, "きらきら (Sparkle)", R.drawable.surface7, "期待に満ちたきらきら顔"),
            SurfaceExpression(8, "考え中 (Thinking)", R.drawable.surface8, "じーっと考え込む表情"),
            SurfaceExpression(9, "大喜び (Joyful)", R.drawable.surface9, "両手を広げて大はしゃぎ"),
            SurfaceExpression(10, "相棒・素 (Kero Normal)", R.drawable.surface10, "相棒の通常モード"),
            SurfaceExpression(11, "相棒・応援 (Kero Cheer)", R.drawable.surface11, "旗を振って応援する相棒"),
            SurfaceExpression(12, "相棒・興味 (Kero Wonder)", R.drawable.surface12, "首を傾げて観察中"),
            SurfaceExpression(13, "相棒・すやすや (Kero Sleep)", R.drawable.surface13, "気持ちよさそうにお昼寝")
        )

        val mockNanai = Ghost(
            id = "mock_nanai",
            name = "mock_nanai",
            craftman = "ghostmaster / 伺か研究会",
            sakuraName = "なない (Nanai)",
            keroName = "てすと (Test Kero)",
            shioriType = "SATORI (里々) SHIORI/3.0",
            path = "assets/ghost/mock_nanai",
            description = "Mascot Nanai公式プリセットゴースト。ふわふわ浮遊するマスコット少女です。",
            defaultSurfaceId = 0,
            expressions = nanaiExpressions,
            bootPhrases = listOf(
                "こんにちは！マスコットナナイです。今日もよろしくね！",
                "起動完了！Androidの画面にやってきましたー！",
                "ふわ〜、呼ばれて飛び出てナナイです！何をして遊ぶ？",
                "やっほー！今日もいい天気…かな？端末の中は快適だよ！"
            ),
            tapPhrases = listOf(
                "えへへ、つんつんされた！何か用事かな？",
                "くすぐったいよ〜！でもタップしてくれてありがとう！",
                "はいはい！ナナイはここにスタンバイしてるよ！",
                "わっ！びっくりした〜！つつく時は優しくね？",
                "ん？なになに？お話きくよ〜！",
                "今日もがんばってて偉いね！ナナイが応援してるよ！",
                "ぽよんっ！Android画面の上はふわふわしてて楽しいな〜"
            ),
            idlePhrases = listOf(
                "ふぅ〜、画面の隅っこって落ち着くよね。",
                "ねえねえ、ちょっと休憩しない？水分補給も忘れずにね！",
                "Androidアプリ開発ってわくわくするね〜。",
                "相棒のてすとくん、さっきからウトウトしてるみたい…",
                "右上メニューの⚙️ボタンから、いつでも大きさを変えられるよ！",
                "ふふ、あなたの手元でいつでも待機中だよ〜！"
            )
        )

        val testGhost = Ghost(
            id = "test_ghost",
            name = "test_ghost",
            craftman = "YAYA Team",
            sakuraName = "テストゴースト (YAYA)",
            keroName = "サブユニット",
            shioriType = "YAYA SHIORI/3.0",
            path = "assets/ghost/test_ghost",
            description = "SHIORI 3.0プロトコル検証用デバッグゴースト。",
            defaultSurfaceId = 2,
            expressions = nanaiExpressions,
            bootPhrases = listOf(
                "[SHIORI/3.0] YAYA Test Ghost initialized successfully.",
                "テストゴーストをロードしました。イベントリスナー稼働中。"
            ),
            tapPhrases = listOf(
                "OnMouseClick: ID=0, Reference0=x, Reference1=y",
                "シグナルを受信しました。Status 200 OK.",
                "デバッグリクエストに応答中: Nanai SHIORI Bridge active."
            ),
            idlePhrases = listOf(
                "Heartbeat: OnSecondChange tick received.",
                "Memory and thread state nominal."
            )
        )

        _availableGhosts.value = listOf(mockNanai, testGhost)
    }

    fun processShioriRequest(ghost: Ghost, event: String, userMessage: String? = null): ShioriResponse {
        val timeStr = SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(Date())
        return when (event) {
            "OnBoot" -> {
                val phrase = ghost.bootPhrases.random()
                ShioriResponse(
                    rawRequest = "GET SHIORI/3.0\r\nSender: MascotNanaiApp\r\nEvent: OnBoot\r\n\r\n",
                    rawResponse = "SHIORI/3.0 200 OK\r\nSender: ${ghost.name}\r\nValue: \\0\\s[0]$phrase\\e\r\n\r\n",
                    dialogue = phrase,
                    suggestedSurfaceId = 0
                )
            }
            "OnMouseClick" -> {
                val surfaceId = listOf(1, 2, 4, 6, 9).random()
                val phrase = ghost.tapPhrases.random()
                ShioriResponse(
                    rawRequest = "NOTIFY SHIORI/3.0\r\nSender: MascotNanaiApp\r\nEvent: OnMouseClick\r\nReference0: 100\r\nReference1: 150\r\n\r\n",
                    rawResponse = "SHIORI/3.0 200 OK\r\nValue: \\0\\s[$surfaceId]$phrase\\e\r\n\r\n",
                    dialogue = phrase,
                    suggestedSurfaceId = surfaceId
                )
            }
            "OnSecondChange", "OnTalk", "OnAITalk" -> {
                val surfaceId = listOf(0, 4, 7, 8).random()
                val phrase = ghost.idlePhrases.random()
                ShioriResponse(
                    rawRequest = "GET SHIORI/3.0\r\nSender: MascotNanaiApp\r\nEvent: $event\r\n\r\n",
                    rawResponse = "SHIORI/3.0 200 OK\r\nValue: \\0\\s[$surfaceId]$phrase\\e\r\n\r\n",
                    dialogue = phrase,
                    suggestedSurfaceId = surfaceId
                )
            }
            "SendMessage" -> {
                val input = userMessage ?: "こんにちは"
                val reply = when {
                    input.contains("天気") -> "今日の画面の中はぽかぽか快晴だよ！お外はどうかな？"
                    input.contains("疲れ") || input.contains("つかれ") -> "いつもお疲れさま！ナナイの笑顔で癒やしてあげるね〜！"
                    input.contains("歌") || input.contains("うた") -> "ラララ〜♪ Androidの世界へようこそ〜♪ 上手に歌えたかな？"
                    input.contains("名前") || input.contains("だれ") -> "ナナイだよ！あなたのAndroidマスコットデスクトップコンパニオンなの！"
                    input.contains("好き") -> "えっへへ、ありがとう！ナナイもあなたのこと大好きだよ！"
                    else -> "「$input」って言ってくれたの？ふふ、ちゃんと聞こえたよ！"
                }
                ShioriResponse(
                    rawRequest = "GET SHIORI/3.0\r\nSender: User\r\nEvent: OnUserInput\r\nReference0: $input\r\n\r\n",
                    rawResponse = "SHIORI/3.0 200 OK\r\nValue: \\0\\s[4]$reply\\e\r\n\r\n",
                    dialogue = reply,
                    suggestedSurfaceId = 4
                )
            }
            else -> {
                ShioriResponse(
                    rawRequest = "GET SHIORI/3.0\r\nSender: TestRunner\r\nEvent: $event\r\n\r\n",
                    rawResponse = "SHIORI/3.0 200 OK\r\nValue: イベント「$event」を受信しました。\r\n\r\n",
                    dialogue = "イベント「$event」を受信したよ！",
                    suggestedSurfaceId = 0
                )
            }
        }
    }
}

data class ShioriResponse(
    val rawRequest: String,
    val rawResponse: String,
    val dialogue: String,
    val suggestedSurfaceId: Int
)
