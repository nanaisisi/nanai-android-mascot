package com.example.mascotnanai.ui.components

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.mascotnanai.R
import com.example.mascotnanai.data.model.Ghost
import com.example.mascotnanai.data.model.GhostSize
import kotlinx.coroutines.launch
import kotlin.math.roundToInt

@Composable
fun MascotCharacterView(
    ghost: Ghost?,
    currentSurfaceId: Int,
    ghostSize: GhostSize,
    shellScale: Float,
    offsetX: Float,
    offsetY: Float,
    onDrag: (Float, Float) -> Unit,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val coroutineScope = rememberCoroutineScope()
    val tapScale = remember { Animatable(1.0f) }

    // Floating idle animation
    val infiniteTransition = rememberInfiniteTransition(label = "mascot_floating")
    val floatOffset by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = -12f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1800, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "mascot_hover_anim"
    )

    // Base dimensions based on GhostSize
    val baseWidth = when (ghostSize) {
        GhostSize.SMALL -> 140.dp
        GhostSize.MEDIUM -> 190.dp
        GhostSize.LARGE -> 250.dp
        GhostSize.EXTRA_LARGE -> 310.dp
    }
    val baseHeight = when (ghostSize) {
        GhostSize.SMALL -> 260.dp
        GhostSize.MEDIUM -> 360.dp
        GhostSize.LARGE -> 470.dp
        GhostSize.EXTRA_LARGE -> 580.dp
    }

    // Resolve resource ID for surface
    val surfaceResId = remember(ghost, currentSurfaceId) {
        val exp = ghost?.expressions?.find { it.id == currentSurfaceId }
        exp?.drawableRes ?: when (currentSurfaceId) {
            0 -> R.drawable.surface0
            1 -> R.drawable.surface1
            2 -> R.drawable.surface2
            3 -> R.drawable.surface3
            4 -> R.drawable.surface4
            5 -> R.drawable.surface5
            6 -> R.drawable.surface6
            7 -> R.drawable.surface7
            8 -> R.drawable.surface8
            9 -> R.drawable.surface9
            10 -> R.drawable.surface10
            11 -> R.drawable.surface11
            12 -> R.drawable.surface12
            13 -> R.drawable.surface13
            else -> R.drawable.surface0
        }
    }

    Box(
        contentAlignment = Alignment.Center,
        modifier = modifier
            .offset { IntOffset(offsetX.roundToInt(), (offsetY + floatOffset).roundToInt()) }
            .pointerInput(Unit) {
                detectDragGestures { change, dragAmount ->
                    change.consume()
                    onDrag(dragAmount.x, dragAmount.y)
                }
            }
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null
            ) {
                coroutineScope.launch {
                    tapScale.animateTo(0.88f, animationSpec = spring(dampingRatio = 0.4f, stiffness = 600f))
                    tapScale.animateTo(1.05f, animationSpec = spring(dampingRatio = 0.5f, stiffness = 400f))
                    tapScale.animateTo(1.0f, animationSpec = spring(dampingRatio = 0.6f, stiffness = 400f))
                }
                onClick()
            }
            .scale(tapScale.value * shellScale)
            .testTag("mascot_character")
    ) {
        if (ghost != null) {
            Image(
                painter = painterResource(id = surfaceResId),
                contentDescription = "${ghost.sakuraName} (表情: $currentSurfaceId)",
                contentScale = ContentScale.Fit,
                modifier = Modifier
                    .width(baseWidth)
                    .height(baseHeight)
            )
        } else {
            // Placeholder when no ghost is loaded
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier
                    .width(baseWidth)
                    .height(baseHeight)
            ) {
                Text(
                    text = "👻\nゴースト未選択\n(右上の☰から選択)",
                    fontSize = 16.sp,
                    color = androidx.compose.ui.graphics.Color.Gray,
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                )
            }
        }
    }
}
