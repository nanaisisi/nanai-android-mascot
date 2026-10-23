package com.example.mascotnanai.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.animation.scaleOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.shape.GenericShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.mascotnanai.data.model.BalloonStyle

@Composable
fun SpeechBalloonView(
    text: String,
    visible: Boolean,
    balloonStyle: BalloonStyle?,
    scale: Float,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val style = balloonStyle ?: BalloonStyle(
        id = "default",
        name = "標準",
        description = "標準バルーン",
        backgroundColorHex = 0xF0F8FBFF,
        textColorHex = 0xFF2A3B50,
        borderColorHex = 0xFF4A6FA5,
        cornerRadiusDp = 18
    )

    val bgColor = Color(style.backgroundColorHex)
    val textColor = Color(style.textColorHex)
    val borderColor = Color(style.borderColorHex)
    val cornerRadius = (style.cornerRadiusDp * scale).dp

    AnimatedVisibility(
        visible = visible && text.isNotEmpty(),
        enter = fadeIn() + scaleIn(initialScale = 0.85f),
        exit = fadeOut() + scaleOut(targetScale = 0.85f),
        modifier = modifier
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier
                .widthIn(min = 160.dp, max = (320 * scale).dp)
                .clickable { onClick() }
                .testTag("speech_balloon_container")
        ) {
            Box(
                modifier = Modifier
                    .shadow(elevation = 8.dp, shape = RoundedCornerShape(cornerRadius))
                    .clip(RoundedCornerShape(cornerRadius))
                    .background(bgColor)
                    .border(width = 2.dp, color = borderColor, shape = RoundedCornerShape(cornerRadius))
                    .padding(horizontal = (18 * scale).dp, vertical = (12 * scale).dp)
            ) {
                Text(
                    text = text,
                    color = textColor,
                    fontSize = (15 * scale).sp,
                    lineHeight = (22 * scale).sp,
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier.testTag("balloon_text")
                )
            }

            // Downward pointing arrow tail
            val tailShape = GenericShape { size, _ ->
                moveTo(0f, 0f)
                lineTo(size.width, 0f)
                lineTo(size.width / 2f, size.height)
                close()
            }

            Box(
                modifier = Modifier
                    .padding(top = (-1).dp)
                    .align(Alignment.CenterHorizontally)
            ) {
                Box(
                    modifier = Modifier
                        .padding(top = 0.dp)
                        .clip(tailShape)
                        .background(bgColor)
                        .padding(horizontal = 10.dp, vertical = 6.dp)
                )
            }
        }
    }
}
